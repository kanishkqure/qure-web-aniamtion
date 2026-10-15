#!/usr/bin/env node
// Extracts the footer pill band geometry from the Figma file and writes
// footer/src/figma-band.ts. Measured, not approximated: every number in the
// output comes from the decoded Figma node tree.
//
// Usage:
//   unzip Qure_footer.fig -d /tmp/qure-footer     # .fig is a zip; we need canvas.fig
//   node tools/extract-footer-band.mjs /tmp/qure-footer/canvas.fig
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import kiwi from 'kiwi-schema';
import pako from 'pako';
import * as fzstd from 'fzstd';

const here = path.dirname(fileURLToPath(import.meta.url));
const input = process.argv[2];
if (!input) {
  console.error('usage: node tools/extract-footer-band.mjs <path/to/canvas.fig>');
  process.exit(1);
}
const outFile = path.resolve(here, '../footer/src/figma-band.ts');

// ---------------------------------------------------------------- decode .fig
const buf = fs.readFileSync(input);
if (buf.subarray(0, 8).toString() !== 'fig-kiwi') throw new Error('not a canvas.fig (fig-kiwi) file');
const chunks = [];
for (let off = 12; off < buf.length; ) {
  const n = buf.readUInt32LE(off);
  off += 4;
  chunks.push(buf.subarray(off, off + n));
  off += n;
}
const inflate = (c) => (c[0] === 0x28 && c[1] === 0xb5 ? fzstd.decompress(c) : pako.inflateRaw(c));
const compiled = kiwi.compileSchema(kiwi.decodeBinarySchema(inflate(chunks[0])));
const { nodeChanges: nodes } = compiled.decodeMessage(inflate(chunks[1]));

const key = (g) => `${g.sessionID}:${g.localID}`;
const byId = new Map(nodes.map((n) => [key(n.guid), n]));
const kids = new Map();
for (const n of nodes) {
  if (!n.parentIndex) continue;
  const p = key(n.parentIndex.guid);
  if (!kids.has(p)) kids.set(p, []);
  kids.get(p).push(n);
}
for (const list of kids.values()) list.sort((a, b) => (a.parentIndex.position < b.parentIndex.position ? -1 : 1));

// ------------------------------------------------------------- locate nodes
const footer = nodes.find((n) => n.type === 'FRAME' && n.name === 'Background' && kids.get(key(n.guid))?.length);
const footerKids = kids.get(key(footer.guid));
// The band is two 822x168 frames, each holding a "capsules" group (one rotated 180deg,
// one flipped vertically) and clipped to its own bounds. The gap between them is the
// logo clear zone.
const bandFrames = footerKids.filter((n) => n.type === 'FRAME' && kids.get(key(n.guid))?.[0]?.name === 'capsules');
const logo = footerKids.find((n) => n.name === 'Container');
const tagline = footerKids.find((n) => n.type === 'TEXT' && n.fontSize >= 30);
if (bandFrames.length !== 2 || !logo || !tagline) throw new Error('unexpected footer structure');

const I = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 };
const mul = (A, B) => ({
  m00: A.m00 * B.m00 + A.m01 * B.m10, m01: A.m00 * B.m01 + A.m01 * B.m11, m02: A.m00 * B.m02 + A.m01 * B.m12 + A.m02,
  m10: A.m10 * B.m00 + A.m11 * B.m10, m11: A.m10 * B.m01 + A.m11 * B.m11, m12: A.m10 * B.m02 + A.m11 * B.m12 + A.m12,
});
const bounds = (T, size) => {
  const xs = [T.m02, T.m00 * size.x + T.m02], ys = [T.m12, T.m11 * size.y + T.m12];
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};
const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

function collect(frame) {
  const clip = bounds(frame.transform, frame.size);
  const out = [];
  let layerOpacity = null;
  (function walk(n, M, op) {
    if (n.visible === false) return;
    const T = mul(M, n.transform);
    const o = op * (n.opacity ?? 1);
    if (n.type === 'VECTOR') {
      layerOpacity ??= o;
      if (Math.abs(layerOpacity - o) > 1e-6) throw new Error('mixed layer opacity');
      const b = bounds(T, n.size);
      if (b.x1 <= clip.x0 || b.x0 >= clip.x1 || b.y1 <= clip.y0 || b.y0 >= clip.y1) return;
      const paint = n.fillPaints.find((p) => p.visible !== false);
      out.push({ ...b, color: hex(paint.color), alpha: paint.opacity });
      return;
    }
    for (const k of kids.get(key(n.guid)) ?? []) walk(k, T, o);
  })(frame, I, 1);
  return { clip, pills: out, layerOpacity };
}

const lanes = bandFrames.map(collect).sort((a, b) => a.clip.x0 - b.clip.x0);
const [leftLane, rightLane] = lanes;
const layerOpacity = leftLane.layerOpacity;

// ------------------------------------------------------------------ rows
const allPills = lanes.flatMap((l) => l.pills);
const fullH = Math.max(...allPills.map((p) => p.y1 - p.y0));
const centers = [...new Set(allPills.map((p) => +((p.y0 + p.y1) / 2).toFixed(1)))].sort((a, b) => a - b);
const rowCenters = [];
for (const c of centers) if (!rowCenters.length || c - rowCenters.at(-1) > fullH) rowCenters.push(c);
const rowOf = (p) => rowCenters.findIndex((c) => Math.abs((p.y0 + p.y1) / 2 - c) < fullH / 2);
const r3 = (v) => Math.round(v * 1000) / 1000;

const rows = rowCenters.map((_, ri) => {
  const lane = (l) => {
    const ps = l.pills.filter((p) => rowOf(p) === ri).sort((a, b) => a.x0 - b.x0);
    return {
      cy: r3(ps.reduce((s, p) => s + (p.y0 + p.y1) / 2, 0) / ps.length),
      segs: ps.map((p) => [r3(p.x0), r3(p.x1 - p.x0), r3(p.y1 - p.y0), p.color, r3(p.alpha)]),
    };
  };
  return { left: lane(leftLane), right: lane(rightLane) };
});

// --------------------------------------------------------------- measurements
const page = { x0: 0, x1: footer.size.x };
const visible = (l) => l.pills.filter((p) => p.x1 > Math.max(l.clip.x0, page.x0) && p.x0 < Math.min(l.clip.x1, page.x1));
const visiblePills = lanes.flatMap(visible);
const full = visiblePills.filter((p) => Math.abs(p.y1 - p.y0 - fullH) < 1e-3);
const unit = Math.min(...full.map((p) => p.x1 - p.x0));
let minGap = Infinity;
for (const l of lanes) for (const r of rowCenters.keys()) {
  const ps = l.pills.filter((p) => rowOf(p) === r).sort((a, b) => a.x0 - b.x0);
  for (let i = 1; i < ps.length; i++) minGap = Math.min(minGap, ps[i].x0 - ps[i - 1].x1);
}
const peach = visiblePills.filter((p) => !p.color.startsWith('#A') && !p.color.startsWith('#B') && !p.color.startsWith('#C') && !p.color.startsWith('#D'));
const peachColors = [...new Set(peach.map((p) => p.color))];
if (peachColors.length !== 1) throw new Error('expected one peach fill, got ' + peachColors);
const pitch = (rowCenters.at(-1) - rowCenters[0]) / (rowCenters.length - 1);
const logoBox = bounds(logo.transform, logo.size);
const tagBox = bounds(tagline.transform, tagline.size);

const data = {
  frame: { width: footer.size.x, height: footer.size.y },
  bandClip: { y0: r3(leftLane.clip.y0), y1: r3(leftLane.clip.y1) },
  leftFrameClip: { x0: r3(leftLane.clip.x0), x1: r3(leftLane.clip.x1) },
  rightFrameClip: { x0: r3(rightLane.clip.x0), x1: r3(rightLane.clip.x1) },
  logo: { x: r3(logoBox.x0), y: r3(logoBox.y0), w: r3(logoBox.x1 - logoBox.x0), h: r3(logoBox.y1 - logoBox.y0) },
  tagline: { x: r3(tagBox.x0), y: r3(tagBox.y0), w: r3(tagBox.x1 - tagBox.x0), h: r3(tagBox.y1 - tagBox.y0), text: tagline.textData.characters },
  pillHeight: r3(fullH),
  pillRadius: r3(fullH / 2),
  unit: r3(unit),
  minGap: r3(minGap),
  rowPitch: r3(pitch),
  layerOpacity: r3(layerOpacity),
  peachColor: peachColors[0],
  peachCount: peach.length,
  visiblePillCount: visiblePills.length,
  lavenderTintCount: new Set(visiblePills.map((p) => p.color)).size - 1,
  rows,
};
// Clear zones exactly as Figma draws them: the horizontal gap between the two clipped
// band frames (logo +/- padding) and the inset at the right page edge.
data.logoZonePadX = r3(data.logo.x - data.leftFrameClip.x1);
data.logoZonePadXRight = r3(data.rightFrameClip.x0 - (data.logo.x + data.logo.w));
data.rightInset = r3(data.frame.width - data.rightFrameClip.x1);

const ts = `// GENERATED by tools/extract-footer-band.mjs from the Figma footer frame. Do not edit by hand.
// Coordinates are CSS px in the 1440px-wide Figma frame. Segment tuple:
// [x, width, height, fill, paintOpacity]; drawn at paintOpacity * layerOpacity over white.

export type FigmaSeg = [x: number, w: number, h: number, fill: string, alpha: number];
export interface FigmaLane { cy: number; segs: FigmaSeg[] }
export interface FigmaRow { left: FigmaLane; right: FigmaLane }
type Box = { x: number; y: number; w: number; h: number };
export interface FigmaBand {
  frame: { width: number; height: number };
  bandClip: { y0: number; y1: number };
  leftFrameClip: { x0: number; x1: number };
  rightFrameClip: { x0: number; x1: number };
  logo: Box;
  tagline: Box & { text: string };
  pillHeight: number; pillRadius: number; unit: number; minGap: number; rowPitch: number;
  layerOpacity: number; peachColor: string; peachCount: number;
  visiblePillCount: number; lavenderTintCount: number;
  rows: FigmaRow[];
  logoZonePadX: number; logoZonePadXRight: number; rightInset: number;
}

export const FIGMA_BAND: FigmaBand = ${JSON.stringify(data, null, 2).replace(/\[\n\s+(-?[\d.]+),\n\s+([\d.]+),\n\s+([\d.]+),\n\s+("#[0-9A-F]+"),\n\s+([\d.]+)\n\s+\]/g, '[$1, $2, $3, $4, $5]')};
`;
fs.writeFileSync(outFile, ts.replace(/"(\w+)":/g, '$1:'));
console.log(`wrote ${path.relative(process.cwd(), outFile)}`);
console.log({ ...data, rows: `${rows.length} rows` });
