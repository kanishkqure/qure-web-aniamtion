// Headless invariant checks for the band model. Run: npm run test:footer
import { BandModel, type BandLayoutInput, type Seg } from '../src/band-model';
import { FIGMA_BAND as F } from '../src/figma-band';

let failures = 0;
const fail = (msg: string) => {
  failures++;
  if (failures <= 20) console.error('FAIL', msg);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Canvas = full-width band whose top is the Figma band clip top.
const top = F.bandClip.y0;
const desktop: BandLayoutInput = {
  width: F.frame.width,
  height: F.bandClip.y1 - F.bandClip.y0,
  logo: { x0: F.logo.x, x1: F.logo.x + F.logo.w, y0: F.logo.y - top, y1: F.logo.y + F.logo.h - top },
  tagline: { x0: F.tagline.x, x1: F.tagline.x + F.tagline.w, y0: F.tagline.y - top, y1: F.tagline.y + F.tagline.h - top },
};

function checkStart(m: BandModel) {
  // Every visible Figma pill is present at its exact Figma position, and nothing else is visible.
  const want: string[] = [];
  F.rows.forEach((r) => {
    for (const [lane, clip] of [[r.left, { x0: 0, x1: F.leftFrameClip.x1 }], [r.right, F.rightFrameClip]] as const) {
      for (const s of lane.segs) if (s[0] + s[1] > clip.x0 && s[0] < clip.x1) want.push(`${(lane.cy - top).toFixed(1)}:${s[0].toFixed(3)}:${s[1].toFixed(3)}`);
    }
  });
  const got: string[] = [];
  for (const row of m.rows) for (const l of row.lanes) for (const s of l.segs) if (s.xa + s.wa > l.L && s.xa < l.R) got.push(`${row.cy.toFixed(1)}:${s.xa.toFixed(3)}:${s.wa.toFixed(3)}`);
  want.sort();
  got.sort();
  if (want.length !== F.visiblePillCount) fail(`expected ${F.visiblePillCount} figma pills, test saw ${want.length}`);
  if (want.join() !== got.join()) fail(`start state differs from Figma: ${got.length} vs ${want.length} pills`);
  console.log(`start state: ${got.length} visible pills match Figma`);
}

function run(name: string, layout: BandLayoutInput, keyframes: number, cfg = {}) {
  const m = new BandModel(layout, { SEED: 7, ...cfg });
  if (layout === desktop && !Object.keys(cfg).length) checkStart(m);
  const G = m.cfg.GAP;
  const peach0 = m.peachTarget;
  let short = 0;
  const lav0 = m.rows.reduce((n, r) => n + r.lanes.reduce((k, l) => k + l.segs.filter((s) => !s.peach).length, 0), 0);
  const tint = new Map<number, string>();
  let exits = 0;
  let crossings = 0;
  let maxDev = 0;
  let minLav = Infinity;
  let maxLav = 0;

  for (let k = 0; k < keyframes; k++) {
    m.advance();
    for (const row of m.rows) {
      let ink = 0;
      for (const lane of row.lanes) {
        for (const s of lane.segs) {
          if (s.dying) exits++;
          if (s.crossing) crossings++;
          if (!s.peach) {
            ink += s.wb;
            if (s.xb < lane.lb - 1e-6 || s.xb + s.wb > lane.rb + 1e-6) fail(`${name} k${k}: lavender ${s.id} outside lane bounds`);
            const key = s.cb.join();
            const before = tint.get(s.id);
            if (before && before !== key && !isMergeTarget(lane.segs, s)) fail(`${name} k${k}: tint of ${s.id} changed outside a merge`);
            tint.set(s.id, key);
            if (s.wb < s.minW - 1e-6) fail(`${name} k${k}: ${s.id} narrower than its minimum`);
            if (s.wb > m.cfg.MAX_W + 1e-6 && s.wb > s.wa + 1e-6) fail(`${name} k${k}: ${s.id} grew past MAX_W`);
          }
        }
        // ordering / gap invariant at several points of the tween
        for (const t of [0, 0.33, 0.66, 1]) {
          const pos = lane.segs
            .map((s) => ({ s, x: lerp(s.xa, s.xb, t), w: lerp(s.wa, s.wb, t) }))
            .filter((p) => p.x + p.w > lane.L && p.x < lane.R)
            .sort((a, b) => a.x - b.x);
          const lav = pos.filter((p) => !p.s.peach);
          for (let i = 1; i < lav.length; i++) {
            const a = lav[i - 1], b = lav[i];
            const linked = a.s.link?.to === b.s;
            const gap = b.x - (a.x + a.w);
            if (!linked && gap < G - 1e-3) fail(`${name} k${k} t${t}: lavender ${a.s.id}/${b.s.id} gap ${gap.toFixed(2)}`);
            if (linked && gap < -1e-3) fail(`${name} k${k} t${t}: linked pair overlaps`);
          }
          const pe = pos.filter((p) => p.s.peach);
          for (let i = 1; i < pe.length; i++)
            if (pe[i].x < pe[i - 1].x + pe[i - 1].w)
              fail(`${name} k${k} t${t}: peach overlap ` + [pe[i - 1], pe[i]].map((q) => `${q.s.id} a[${q.s.xa.toFixed(1)}+${q.s.wa.toFixed(1)}] b[${q.s.xb.toFixed(1)}+${q.s.wb.toFixed(1)}] o${q.s.oa}${q.s.dying ? ' dying' : ''}`).join(' / ') + ` lane[${lane.L.toFixed(0)},${lane.R.toFixed(0)}]`);
        }
        // keyframe states: a peach never sits on lavender (it only passes over mid-tween)
        for (const p of lane.segs.filter((s) => s.peach && !s.dying && !s.crossing && s.xb + s.wb > lane.L)) {
          for (const s of lane.segs) {
            if (s.peach || s.xb + s.wb <= lane.L || s.xb >= lane.R) continue;
            if (p.xb < s.xb + s.wb && p.xb + p.wb > s.xb) fail(`${name} k${k}: peach ${p.id} rests on lavender ${s.id}`);
          }
        }
      }
      maxDev = Math.max(maxDev, Math.abs(ink - row.inkTarget) / row.inkTarget);
    }
    // constant, except a spawn may wait a few keyframes for room at the left edge
    short = m.peachCount < peach0 ? short + 1 : 0;
    if (m.peachCount > peach0 || short > 8) fail(`${name} k${k}: peach count ${m.peachCount} != ${peach0}`);
    const lav = m.rows.reduce((n, r) => n + r.lanes.reduce((c, l) => c + l.segs.filter((s) => !s.peach).length, 0), 0);
    minLav = Math.min(minLav, lav);
    maxLav = Math.max(maxLav, lav);
  }
  if (maxDev > m.cfg.INK_TOLERANCE + 1e-9) fail(`${name}: ink drifted ${(maxDev * 100).toFixed(1)}%`);
  if (peach0 && exits <= m.stallFades) fail(`${name}: no peach ever reached the right edge`);
  // PEACH_PATIENCE is a safety valve, not the normal way out: outside the packed mobile lanes
  // almost every peach must leave by the right edge.
  if (!m.mobile && m.stallFades > Math.max(2, exits * 0.01)) fail(`${name}: ${m.stallFades} peaches stalled out of ${exits}`);
  console.log(
    `${name}: ${keyframes} keyframes, peach ${peach0}, exits ${exits}, zone crossings ${crossings}, ` +
      `max ink drift ${(maxDev * 100).toFixed(1)}%, lavender count ${lav0} -> [${minLav}, ${maxLav}], stall fades ${m.stallFades}`,
  );
}

function isMergeTarget(segs: Seg[], s: Seg) {
  return (s.link?.kind === 'merge') || segs.some((o) => o.link?.to === s && o.link.kind === 'merge');
}

function scaled(width: number, logoW: number, logoLeft: number): BandLayoutInput {
  const h = (logoW * F.logo.h) / F.logo.w;
  const cy = F.logo.y + F.logo.h / 2 - top;
  return { width, height: 168, logo: { x0: logoLeft, x1: logoLeft + logoW, y0: cy - h / 2, y1: cy + h / 2 }, tagline: null };
}

run('1440 (Figma)', desktop, 3000);
run('1280', scaled(1280, 1280 * 0.28819, 1280 * 0.120139), 1500);
run('1920', scaled(1920, 415, 1920 * 0.120139), 1500);
run('375 mobile', scaled(375, 210, (375 - 210) / 2), 1500);
run('1440 tagline zone', desktop, 1500, { TAGLINE_CLEAR_ZONE: true });
for (const d of [0.25, 0.75, 1]) run(`375 mobile density ${d}`, scaled(375, 210, (375 - 210) / 2), 800, { MOBILE_DENSITY: d });
for (const seed of [1, 2, 3, 4, 5, 6]) run(`1440 seed ${seed}`, desktop, 2000, { SEED: seed });

if (failures) {
  console.error(`${failures} invariant failure(s)`);
  (globalThis as unknown as { process: { exit(c: number): void } }).process.exit(1);
}
console.log('all invariants hold');
