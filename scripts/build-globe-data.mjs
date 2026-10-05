#!/usr/bin/env node
/*
 * Builds the land-dot dataset for globe-presence.html.
 *
 *   node scripts/build-globe-data.mjs [path-or-url-to-ne_110m_admin_0_countries.geojson]
 *
 * Source: Natural Earth 1:110m Admin 0 – Countries (public domain).
 * Default URL is the nvkelso/natural-earth-vector GeoJSON mirror; pass a local
 * path if the build machine has no network access.
 *
 * Output is written in place into globe-presence.html between the
 * `@globe-data:start` / `@globe-data:end` markers, so the shipped page has no
 * runtime data dependency.
 *
 * Grid: rows every STEP degrees of latitude; within a row, longitude spacing is
 * STEP / cos(lat) so dots stay evenly spaced on the sphere instead of bunching
 * at the poles. Each dot is tested (point-in-polygon) against every country.
 *
 * Encoding per resolution:
 *   codes: "AFG,AGO,…"            country index -> ISO-3166 alpha-3
 *   rows:  [[r, g,n,c, g,n,c, …]]  r = row index (lat = -90 + (r + .5) * STEP)
 *                                  g = gap in columns since the previous run's end
 *                                  n = run length (consecutive columns)
 *                                  c = country index
 *   Column k of a row with N columns sits at lon = -180 + (k + .5) * 360 / N,
 *   N = max(1, round(360 * cos(lat) / STEP)).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(ROOT, 'globe-presence.html');
const SRC = process.argv[2] ||
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const STEPS = { desktop: 2, mobile: 2.5 };

// Countries too small to exist in the 110m set (or to catch a grid point).
// Each gets one dot at the grid point nearest to these coordinates.
const SUPPLEMENT = [
  { code: 'SGP', lat: 1.35, lon: 103.82 },
  { code: 'BHR', lat: 26.07, lon: 50.55 },
];

// ---------------------------------------------------------------- load
async function load(src) {
  if (/^https?:/.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`GET ${src} -> ${res.status}`);
    return res.json();
  }
  return JSON.parse(await readFile(src, 'utf8'));
}

// ISO_A3 is -99 for a few features (France, Norway); ISO_A3_EH fixes those.
// Disputed areas without ISO codes (Kosovo, N. Cyprus, Somaliland) keep ADM0_A3.
const codeOf = (p) => [p.ISO_A3_EH, p.ISO_A3, p.ADM0_A3].find((c) => c && c !== '-99');

// ---------------------------------------------------------------- geometry
function polygonsOf(geom) {
  return geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
}
function bboxOf(rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of rings[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}
function inRing(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inPolygon(rings, x, y) {
  if (!inRing(rings[0], x, y)) return false;
  for (let h = 1; h < rings.length; h++) if (inRing(rings[h], x, y)) return false;
  return true;
}

// ---------------------------------------------------------------- grid
function grid(step) {
  const rows = [];
  for (let r = 0; r < Math.round(180 / step); r++) {
    const lat = -90 + (r + 0.5) * step;
    const n = Math.max(1, Math.round((360 * Math.cos((lat * Math.PI) / 180)) / step));
    rows.push({ r, lat, n, cells: new Array(n).fill(-1) });
  }
  return rows;
}
const lonOf = (row, k) => -180 + ((k + 0.5) * 360) / row.n;

// Grid cells near (lat, lon), nearest first (rows within ±2, columns within ±3).
function nearbyCells(rows, step, lat, lon) {
  const r0 = Math.floor((lat + 90) / step), out = [];
  for (let r = Math.max(0, r0 - 2); r <= Math.min(rows.length - 1, r0 + 2); r++) {
    const row = rows[r], k0 = Math.round(((lon + 180) * row.n) / 360 - 0.5);
    for (let dk = -3; dk <= 3; dk++) {
      const k = (((k0 + dk) % row.n) + row.n) % row.n;
      const dLon = ((((lonOf(row, k) - lon) % 360) + 540) % 360) - 180;
      const dx = dLon * Math.cos((lat * Math.PI) / 180), dy = row.lat - lat;
      out.push({ row, k, d: dx * dx + dy * dy });
    }
  }
  return out.sort((a, b) => a.d - b.d);
}

function build(countries, step) {
  const rows = grid(step);
  const codes = countries.map((c) => c.code);
  for (const row of rows) {
    for (let k = 0; k < row.n; k++) {
      const x = lonOf(row, k), y = row.lat;
      for (let ci = 0; ci < countries.length && row.cells[k] < 0; ci++) {
        for (const p of countries[ci].polys) {
          const [x0, y0, x1, y1] = p.bbox;
          if (x < x0 || x > x1 || y < y0 || y > y1) continue;
          if (inPolygon(p.rings, x, y)) { row.cells[k] = ci; break; }
        }
      }
    }
  }

  // Guarantee every country (and the supplement) at least one dot.
  const count = new Array(codes.length).fill(0);
  rows.forEach((row) => row.cells.forEach((c) => c >= 0 && count[c]++));
  const missing = [];
  countries.forEach((c, ci) => { if (!count[ci]) missing.push({ ci, lat: c.label[1], lon: c.label[0] }); });
  for (const s of SUPPLEMENT) {
    let ci = codes.indexOf(s.code);
    if (ci < 0) { ci = codes.push(s.code) - 1; count.push(0); }
    if (!count[ci]) missing.push({ ci, lat: s.lat, lon: s.lon });
  }
  const forced = [];
  for (const m of missing) {
    // nearest cell that doesn't erase a neighbour's only dot
    const cell = nearbyCells(rows, step, m.lat, m.lon).find((c) => c.row.cells[c.k] < 0 || count[c.row.cells[c.k]] > 1);
    if (!cell) { forced.push(codes[m.ci] + '(none)'); continue; }
    const { row, k } = cell, prev = row.cells[k];
    if (prev >= 0) count[prev]--;
    row.cells[k] = m.ci; count[m.ci]++;
    forced.push(codes[m.ci] + (prev >= 0 ? `(<-${codes[prev]})` : ''));
  }

  // Run-length encode.
  const out = [];
  let dots = 0;
  for (const row of rows) {
    const enc = [row.r];
    let end = 0;
    for (let k = 0; k < row.n; ) {
      const c = row.cells[k];
      if (c < 0) { k++; continue; }
      let j = k;
      while (j < row.n && row.cells[j] === c) j++;
      enc.push(k - end, j - k, c);
      dots += j - k; end = j; k = j;
    }
    if (enc.length > 1) out.push(enc);
  }
  return { step, codes, rows: out, dots, forced };
}

// ---------------------------------------------------------------- main
const geo = await load(SRC);
const countries = geo.features
  .map((f) => ({
    code: codeOf(f.properties),
    label: [f.properties.LABEL_X, f.properties.LABEL_Y],
    polys: polygonsOf(f.geometry).map((rings) => ({ rings, bbox: bboxOf(rings) })),
  }))
  .sort((a, b) => (a.code < b.code ? -1 : 1));

const sets = {};
for (const [key, step] of Object.entries(STEPS)) {
  const s = build(countries, step);
  sets[key] = s;
  console.log(`${key}: step ${step}°, ${s.dots} dots, ${s.rows.length} rows, forced: ${s.forced.join(' ') || '-'}`);
}

// Both sets share one code table (the supplement may have appended codes).
const codes = sets.desktop.codes;
for (const s of Object.values(sets)) {
  if (s.codes.join() !== codes.join()) throw new Error('code tables diverged');
}
const json = (v) => JSON.stringify(v);
// Emitted as a hoisted function so the data can sit at the bottom of the page script.
const block =
  `function globeData() { return {codes:${json(codes.join(','))},\n` +
  Object.entries(sets).map(([k, s]) => `${k}:{step:${s.step},rows:${json(s.rows)}}`).join(',\n') +
  '}; }';

const html = await readFile(HTML, 'utf8');
const re = /(\/\* @globe-data:start[^*]*\*\/\n)[\s\S]*?(\n\/\* @globe-data:end \*\/)/;
if (!re.test(html)) throw new Error('data markers not found in globe-presence.html');
await writeFile(HTML, html.replace(re, `$1${block}$2`));
console.log(`wrote ${block.length} bytes of data into ${path.relative(ROOT, HTML)}`);
