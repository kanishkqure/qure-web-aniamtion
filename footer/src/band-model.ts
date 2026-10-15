// Row-based pill-morph model for the footer band. DOM-free so it can be tested headlessly.
//
// Each row is split into lanes by clear zones. A lane holds an ordered list of segments.
// Every keyframe the model computes a target state from the current one; the renderer
// tweens x, width, colour and opacity linearly between the two.

import { FIGMA_BAND as F, type FigmaSeg } from './figma-band';

export interface BandConfig {
  /** Duration of one keyframe (ms). Everything tweens linearly across it. */
  KEYFRAME_MS: number;
  /** Share of lavender segments in a row that get an operation each keyframe. */
  OP_RATIO: number;
  /** Probability that a peach pill advances rightward on a given keyframe. */
  PEACH_DRIFT: number;
  /** Allowed drift of each row's lavender ink (sum of widths) from its Figma value. */
  INK_TOLERANCE: number;
  /** Base unit: the shortest pill in the Figma band (px). */
  UNIT: number;
  /** Minimum gap between neighbouring pills in a row (px). */
  GAP: number;
  /** Two lavender pills may merge when their gap is at most this (px). */
  MERGE_GAP: number;
  /** Longest pill a stretch or merge may produce (px). */
  MAX_W: number;
  /** A peach pill may shrink to this width to squeeze through a gap (px). */
  PEACH_MIN_W: number;
  /** Lavender slides lean back toward their Figma position over roughly this distance (px). */
  HOME_PULL: number;
  /**
   * Keyframes a peach may stay blocked (e.g. a lane too packed to enter) before it fades out
   * in place and a replacement fades in at the left edge. Keeps the thread moving in any layout.
   */
  PEACH_PATIENCE: number;
  /** Clear-zone padding left/right of the logo (px). */
  ZONE_PAD: number;
  /** Inset of the band from the right edge (px). */
  RIGHT_INSET: number;
  /** Also carve a clear zone around the tagline. Off by default: Figma runs pills behind it. */
  TAGLINE_CLEAR_ZONE: boolean;
  /** Width at or below which the mobile fallback layout is used. */
  MOBILE_MAX: number;
  /**
   * Mobile fallback density, 0..1: the share of rows, and of lavender pills within each
   * kept row, that survive at or below MOBILE_MAX. 0.5 = every other row, every other pill.
   * Placeholder until a mobile frame exists in Figma.
   */
  MOBILE_DENSITY: number;
  /** Background the pills sit on; fills are pre-composited over it. */
  BG: string;
  /** Optional RNG seed for reproducible motion. */
  SEED?: number;
}

export const DEFAULT_CONFIG: BandConfig = {
  KEYFRAME_MS: 850,
  OP_RATIO: 0.25,
  PEACH_DRIFT: 0.85,
  INK_TOLERANCE: 0.1,
  UNIT: F.unit,
  GAP: F.minGap,
  MERGE_GAP: F.minGap * 2,
  MAX_W: F.unit * 2.5,
  PEACH_MIN_W: F.unit * 0.4,
  HOME_PULL: F.unit * 4,
  PEACH_PATIENCE: 40,
  ZONE_PAD: F.logoZonePadX,
  RIGHT_INSET: F.rightInset,
  TAGLINE_CLEAR_ZONE: false,
  MOBILE_MAX: 799,
  MOBILE_DENSITY: 0.5,
  BG: '#ffffff',
};

export type RGB = [number, number, number];
export interface Rect { x0: number; x1: number; y0: number; y1: number }

/** Where the band's anchors sit, in canvas CSS px. */
export interface BandLayoutInput {
  width: number;
  height: number;
  logo: Rect;
  tagline?: Rect | null;
}

export interface Seg {
  id: number;
  peach: boolean;
  h: number;
  // keyframe endpoints: "a" is where the current tween starts, "b" where it ends
  xa: number; wa: number; ca: RGB; oa: number;
  xb: number; wb: number; cb: RGB; ob: number;
  minW: number;
  /** lavender: Figma x the slide bias pulls toward. peach: natural width. */
  home: number;
  baseW: number;
  /** Bridged to the next segment (split opening or merge closing). */
  link: null | { to: Seg; kind: 'merge' | 'split' };
  busy: boolean;
  dying: boolean;
  crossing: boolean;
  /** consecutive keyframes a peach has not moved */
  stall: number;
}

export interface Lane {
  /** visible extent (clip) */
  L: number;
  R: number;
  /** movement bounds; wider than L..R only where Figma itself lets a pill run under the clip */
  lb: number;
  rb: number;
  segs: Seg[];
  /** x up to which an incoming peach has reserved the lane entry */
  reserve: number;
  yieldEntry: boolean;
}

export interface Row { cy: number; lanes: Lane[]; inkTarget: number; lavCount0: number }

// ------------------------------------------------------------------ helpers
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseHex(hex: string): RGB {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

/** Pre-composite fill at `alpha` over the background, so overlapping shapes never darken. */
function composite(fill: RGB, alpha: number, bg: RGB): RGB {
  return [0, 1, 2].map((i) => bg[i] + (fill[i] - bg[i]) * alpha) as RGB;
}

/** Keep an evenly spread `density` share of indices 0, 1, 2, ...; index 0 is always kept. */
function keepNth(i: number, density: number): boolean {
  const d = clamp(density, 0, 1);
  return Math.floor(i * d + 1e-9) > Math.floor((i - 1) * d + 1e-9);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const right = (s: Seg) => s.xb + s.wb;
const EPS = 1e-6;

// ------------------------------------------------------------------- model
export class BandModel {
  rows: Row[] = [];
  readonly cfg: BandConfig;
  private rng: () => number;
  private nextId = 1;
  private bg: RGB;
  private peachRGB: RGB;
  private peachWidths: number[] = [];
  peachTarget = 0;
  private pendingSpawns = 0;
  /** peaches retired by PEACH_PATIENCE rather than by reaching the right edge (for tests) */
  stallFades = 0;
  /** lavender pills asked to make way for a peach stuck behind them */
  private yielders = new Set<Seg>();
  mobile = false;

  constructor(layout: BandLayoutInput, cfg: Partial<BandConfig> = {}) {
    this.cfg = { ...DEFAULT_CONFIG, ...cfg };
    this.rng = mulberry32(this.cfg.SEED ?? (Math.random() * 2 ** 32) >>> 0);
    this.bg = parseHex(this.cfg.BG);
    this.peachRGB = composite(parseHex(F.peachColor), F.layerOpacity, this.bg);
    this.build(layout);
  }

  get peachCount(): number {
    let n = 0;
    for (const r of this.rows) for (const l of r.lanes) for (const s of l.segs) if (s.peach && !s.dying) n++;
    return n;
  }

  // ---------------------------------------------------------------- layout
  /** Lay the Figma rows into the current band geometry. At 1440px this is the Figma frame exactly. */
  build(layout: BandLayoutInput): void {
    const c = this.cfg;
    this.mobile = layout.width <= c.MOBILE_MAX;
    this.rows = [];
    this.peachWidths = [];

    // Figma -> canvas mapping: anchor rows to the logo's vertical centre and each side's
    // pattern to the logo-side edge of its clear zone.
    const figLogoCy = F.logo.y + F.logo.h / 2;
    const logoCy = (layout.logo.y0 + layout.logo.y1) / 2;
    const zoneL = layout.logo.x0 - c.ZONE_PAD;
    const zoneR = layout.logo.x1 + c.ZONE_PAD;
    const leftShift = zoneL - F.leftFrameClip.x1;
    const rightShift = zoneR - F.rightFrameClip.x0;
    const bandEnd = layout.width - c.RIGHT_INSET;
    const period = F.rightFrameClip.x1 - F.rightFrameClip.x0;

    type Zone = Rect & { strict: boolean };
    const zones: Zone[] = [{ x0: zoneL, x1: zoneR, y0: -Infinity, y1: Infinity, strict: false }];
    if (c.TAGLINE_CLEAR_ZONE && layout.tagline) {
      const t = layout.tagline;
      zones.push({ x0: t.x0 - c.ZONE_PAD, x1: t.x1 + c.ZONE_PAD, y0: t.y0, y1: t.y1, strict: true });
    }

    F.rows.forEach((figRow, ri) => {
      if (this.mobile && !keepNth(ri, c.MOBILE_DENSITY)) return; // fallback: thin the rows
      const cy = logoCy + (figRow.right.cy - figLogoCy);
      const half = F.pillHeight / 2;

      // Source segments in canvas coords, tiled outward from each anchor when the side is
      // longer than the Figma frame (which only happens on screens wider than 1440).
      const src: FigmaSeg[] = [];
      for (let k = 0; zoneL - k * period > 1 || k === 0; k++) {
        for (const s of figRow.left.segs) src.push([s[0] + leftShift - k * period, s[1], s[2], s[3], s[4]]);
        if (k > 8) break;
      }
      for (let k = 0; zoneR + k * period < bandEnd - 1 || k === 0; k++) {
        for (const s of figRow.right.segs) src.push([s[0] + rightShift + k * period, s[1], s[2], s[3], s[4]]);
        if (k > 8) break;
      }
      src.sort((a, b) => a[0] - b[0]);

      // Visible lanes = [0, bandEnd] minus the zones that cross this row.
      const rowZones = zones.filter((z) => z.y0 < cy + half && z.y1 > cy - half).sort((a, b) => a.x0 - b.x0);
      const spans: { L: number; R: number }[] = [];
      let cursor = 0;
      for (const z of rowZones) {
        if (z.x0 > cursor) spans.push({ L: cursor, R: z.x0 });
        cursor = Math.max(cursor, z.x1);
      }
      if (bandEnd > cursor) spans.push({ L: cursor, R: bandEnd });

      const lanes: Lane[] = [];
      for (const sp of spans) {
        if (sp.R - sp.L < c.UNIT + 2 * c.GAP) continue;
        const segs: Seg[] = [];
        let lavIndex = 0;
        for (const s of src) {
          const [x, w, h, fill, alpha] = s;
          if (x + w <= sp.L || x >= sp.R) continue;
          // Figma clips pills at the logo-zone edges; keep those (they are drawn clipped).
          // A strict zone (tagline) drops anything touching it.
          if (rowZones.some((z) => z.strict && x < z.x1 && x + w > z.x0)) continue;
          const peach = fill.toUpperCase() === F.peachColor.toUpperCase();
          if (this.mobile && !peach && !keepNth(lavIndex++, c.MOBILE_DENSITY)) continue; // and the pills
          const prev = segs[segs.length - 1];
          if (prev && x < right(prev) + c.GAP - 0.01) continue; // tiling seam
          const col = composite(parseHex(fill), alpha * F.layerOpacity, this.bg);
          if (peach) this.peachWidths.push(w);
          segs.push(this.makeSeg(x, w, h, col, peach));
        }
        lanes.push({
          L: sp.L,
          R: sp.R,
          lb: Math.min(sp.L, segs[0]?.xa ?? sp.L),
          rb: Math.max(sp.R, segs.length ? right(segs[segs.length - 1]) : sp.R),
          segs,
          reserve: -Infinity,
          yieldEntry: false,
        });
      }
      if (!lanes.length) return;
      const lav = lanes.flatMap((l) => l.segs.filter((s) => !s.peach));
      this.rows.push({ cy, lanes, inkTarget: lav.reduce((a, s) => a + s.wa, 0), lavCount0: lav.length });
    });

    if (!this.peachWidths.length) this.peachWidths = [F.unit];
    // Keep the Figma count. Layouts that crop peach pills away (mobile) keep the Figma
    // peach-to-lavender ratio instead, with at least one, spawning in from the left edge.
    const present = this.peachCount;
    const lav = this.rows.reduce((n, r) => n + r.lavCount0, 0);
    const figLav = F.visiblePillCount - F.peachCount;
    this.peachTarget = Math.max(present, Math.max(1, Math.round((F.peachCount * lav) / figLav)));
    this.pendingSpawns = this.peachTarget - present;
  }

  private makeSeg(x: number, w: number, h: number, col: RGB, peach: boolean): Seg {
    return {
      id: this.nextId++, peach, h,
      xa: x, wa: w, ca: col, oa: 1,
      xb: x, wb: w, cb: col, ob: 1,
      minW: peach ? this.cfg.PEACH_MIN_W : Math.min(this.cfg.UNIT, w),
      home: x, baseW: w,
      link: null, busy: false, dying: false, crossing: false, stall: 0,
    };
  }

  // ------------------------------------------------------------- keyframes
  /** Finish the current tween (b becomes a) and plan the next keyframe. */
  advance(): void {
    this.commit();
    this.plan();
  }

  private commit(): void {
    for (const row of this.rows) {
      row.lanes.forEach((lane, li) => {
        const keep: Seg[] = [];
        for (const s of lane.segs) {
          if (s.dying) continue;
          if (s.crossing) {
            // slid fully under the clear zone: re-enter hidden on the far side
            const next = row.lanes[li + 1];
            s.crossing = false;
            s.xb = next.L - s.wb;
            next.segs.unshift(s);
            continue;
          }
          keep.push(s);
        }
        lane.segs = keep;
      });
      for (const lane of row.lanes) {
        const out: Seg[] = [];
        for (const s of lane.segs) {
          s.xa = s.xb; s.wa = s.wb; s.ca = s.cb; s.oa = s.ob; s.busy = false;
          const prev = out[out.length - 1];
          if (prev?.link?.to === s && prev.link.kind === 'merge') {
            prev.wa = prev.wb = right(s) - prev.xb;
            prev.minW = Math.min(prev.minW, s.minW);
            prev.link = null;
            continue; // absorbed
          }
          if (prev?.link?.to === s) prev.link = null;
          out.push(s);
        }
        lane.segs = out.sort((a, b) => a.xa - b.xa);
        lane.reserve = -Infinity;
        lane.yieldEntry = false;
      }
    }
  }

  private plan(): void {
    for (const row of this.rows) for (const lane of row.lanes) lane.segs.sort((a, b) => a.xb - b.xb);
    this.yielders.clear();
    this.planPeach();
    this.spawnPeach();
    for (const row of this.rows) this.planLavender(row);
  }

  // ------------------------------------------------------------------ peach
  private planPeach(): void {
    const c = this.cfg;
    for (const row of this.rows) {
      for (let li = row.lanes.length - 1; li >= 0; li--) {
        const lane = row.lanes[li];
        // leading pill first so the ones behind see its new position
        const peaches = lane.segs.filter((s) => s.peach).sort((a, b) => b.xb - a.xb);
        for (const p of peaches) {
          if (p.oa < 1) continue; // fading in this keyframe: hold still
          const step = this.rng() < c.PEACH_DRIFT ? c.UNIT * (this.rng() < 0.5 ? 1 : 2) : 0;
          const want = Math.max(p.xb + step, step ? lane.L : -Infinity);
          const isLast = li === row.lanes.length - 1;
          const leading = !lane.segs.some((s) => s.peach && s !== p && s.xb > p.xb);
          let exit = leading && want + p.wb > lane.R;
          if (!exit) {
            const moved = this.placePeach(lane, p, Math.min(want, lane.R - c.PEACH_MIN_W));
            if (moved || want <= p.xb + c.UNIT / 2) continue;
            // blocked: trade places with the lavender pill in front (it passes under the peach)
            const swap = this.swapTarget(lane, p);
            if (swap && swap.x1 <= lane.R) {
              this.swap(p, swap.seg);
              continue;
            }
            exit = leading && lane.R - right(p) < c.UNIT * 3; // stuck right by the edge
            if (!exit) continue;
          }

          if (isLast) {
            // far right edge: keep drifting under the edge and fade out over one keyframe
            p.dying = true;
            p.busy = true;
            p.xb = Math.max(p.xb, want);
            p.ob = 0;
            this.pendingSpawns++;
            continue;
          }
          const next = row.lanes[li + 1];
          const room = this.entryRoom(next);
          if (room >= Math.min(c.UNIT, p.baseW * 0.75)) {
            // slide under the clear-zone edge; it re-emerges on the far side next keyframe
            p.crossing = true;
            p.busy = true;
            p.xb = lane.R + c.GAP;
            next.reserve = next.L + p.baseW + c.GAP;
          } else {
            // far side is full: wait at the edge and ask the far lane to make room
            next.yieldEntry = true;
          }
        }
      }
    }
    this.retireStalledPeaches();
  }

  /** A peach blocked for PEACH_PATIENCE keyframes fades out where it is; a new one spawns. */
  private retireStalledPeaches(): void {
    for (const row of this.rows) {
      for (const lane of row.lanes) {
        for (const p of lane.segs) {
          if (!p.peach || p.dying || p.crossing || p.oa < 1) continue;
          p.stall = Math.abs(p.xb - p.xa) < 0.5 ? p.stall + 1 : 0;
          if (p.stall < this.cfg.PEACH_PATIENCE) continue;
          p.dying = true;
          p.busy = true;
          p.ob = 0;
          this.pendingSpawns++;
          this.stallFades++;
        }
      }
    }
  }

  /** Free width at a lane's left entry, against both ends of every neighbour's tween. */
  private entryRoom(lane: Lane): number {
    if (lane.reserve > -Infinity || lane.segs.some((s) => s.peach && s.xb < lane.L)) return 0; // one at a time
    const first = lane.segs.find((s) => s.xb + s.wb > lane.L || s.xa + s.wa > lane.L);
    if (!first) return lane.R - lane.L;
    return Math.min(first.xa, first.xb) - this.cfg.GAP - lane.L;
  }

  /** Put peach `p` in the first gap at or after `want` that fits it, shrinking if needed. */
  private placePeach(lane: Lane, p: Seg, want: number): boolean {
    const c = this.cfg;
    const others = lane.segs.filter((s) => s !== p && right(s) > lane.L && s.xb < lane.R);
    const gaps: { a: number; b: number; own: boolean }[] = [];
    let a = lane.L;
    for (const s of others) {
      const b = Math.min(s.xb, s.xa) - c.GAP;
      gaps.push({ a, b, own: p.xb >= a - EPS && right(p) <= b + EPS });
      if (s.peach && s.xb > p.xb) break; // never hop over another peach
      a = Math.max(right(s), s.xa + s.wa) + c.GAP;
    }
    if (!others.some((s) => s.peach && s.xb > p.xb)) gaps.push({ a, b: lane.R, own: p.xb >= a - EPS });

    const maxHop = c.UNIT * 3;
    const own = gaps.find((g) => g.own);
    const ahead = others.find((s) => s.xb > p.xb && !s.peach);
    const full = Math.min(p.baseW, p.wb + c.UNIT); // re-grows at most a unit per keyframe
    const comfy = Math.max(c.PEACH_MIN_W, p.baseW * 0.6);

    // In each gap within reach, land as close to `want` as the gap allows (never backwards),
    // at full width if it fits, else at a comfortable width, else squeezed. Prefer making
    // progress over holding still, and comfort over squeezing.
    type Spot = { x: number; w: number; score: number };
    let best: Spot | null = null;
    for (const g of gaps) {
      if (g.a - p.xb > maxHop) break;
      for (const [w, rank] of [[full, 0], [comfy, 1], [c.PEACH_MIN_W, 2]] as const) {
        if (g.b - g.a < w - EPS) continue;
        const x = Math.max(g.a, Math.min(want, g.b - w));
        if (x < p.xb - EPS || x - p.xb > maxHop) continue;
        const moved = want <= p.xb + EPS || x > p.xb + c.UNIT * 0.5;
        const score = (moved ? 0 : 10) + rank;
        if (!best || score < best.score) best = { x, w: Math.min(full, g.b - x), score };
        break;
      }
    }
    p.busy = true;
    if (best) {
      p.xb = best.x;
      p.wb = best.w;
    } else if (own) {
      p.wb = Math.min(full, own.b - p.xb);
    }
    // squeezed: ask the lavender pill in front to make way so it can re-grow
    if (ahead && p.wb < p.baseW - EPS) this.yielders.add(ahead);
    return !!best && best.score < 10;
  }

  /** The lavender pill directly in front of `p`, if it is free to trade places. */
  private swapTarget(lane: Lane, p: Seg): { seg: Seg; x1: number } | null {
    if (p.xb < Math.max(lane.L, lane.lb)) return null; // still emerging from a clear zone
    const i = lane.segs.indexOf(p);
    const s = lane.segs.slice(i + 1).find((o) => o.xb > p.xb);
    if (!s || s.peach || s.busy || s.link) return null;
    if (lane.segs.some((o) => o.link?.to === s)) return null;
    return { seg: s, x1: right(s) };
  }

  /**
   * Peach and the lavender pill in front exchange places over one keyframe, keeping the
   * gap between them: [p][gap][s] becomes [s][gap][p]. Ink and spacing are unchanged.
   */
  private swap(p: Seg, s: Seg): void {
    const gap = s.xb - right(p);
    const x0 = p.xb;
    const end = right(s);
    s.xb = x0;
    p.xb = x0 + s.wb + gap;
    p.wb = end - p.xb;
    s.busy = p.busy = true;
    this.yielders.delete(s);
  }

  private spawnPeach(): void {
    const c = this.cfg;
    const need = Math.min(this.pendingSpawns, Math.max(0, this.peachTarget - this.peachCount));
    for (let n = 0; n < need; n++) {
      const baseW = this.peachWidths[Math.floor(this.rng() * this.peachWidths.length)];
      const minW = Math.max(c.PEACH_MIN_W, baseW * 0.6);
      // a free gap near the left edge of a row, checked against both ends of every tween
      const options: { lane: Lane; x: number; w: number }[] = [];
      for (const row of this.rows) {
        const lane = row.lanes[0];
        if (lane.segs.some((s) => s.peach && s.xb < lane.L + c.UNIT * 4)) continue;
        let a = lane.L + 1;
        for (const s of lane.segs) {
          const lo = Math.min(s.xa, s.xb);
          const hi = Math.max(s.xa + s.wa, right(s));
          if (hi <= a) continue;
          if (lo - c.GAP - a >= minW) break;
          a = hi + c.GAP;
          if (a > lane.L + c.UNIT * 4) break;
        }
        if (a > lane.L + c.UNIT * 4) continue;
        const next = lane.segs.find((s) => Math.max(s.xa + s.wa, right(s)) > a);
        const room = (next ? Math.min(next.xa, next.xb) - c.GAP : lane.R) - a;
        if (room >= minW) options.push({ lane, x: a, w: Math.min(baseW, room) });
      }
      if (!options.length) {
        // nowhere to fade in yet: ask a random row to open its entry, retry next keyframe
        const row = this.rows[Math.floor(this.rng() * this.rows.length)];
        const first = row?.lanes[0].segs.find((s) => right(s) > row.lanes[0].L);
        if (first && !first.peach) this.yielders.add(first);
        return;
      }
      const pick = options[Math.floor(this.rng() * options.length)];
      const s = this.makeSeg(pick.x, pick.w, F.pillHeight, this.peachRGB, true);
      s.baseW = baseW;
      s.oa = 0; // fades in over one keyframe, in place
      s.busy = true;
      pick.lane.segs.push(s);
      pick.lane.segs.sort((a, b) => a.xb - b.xb);
      this.pendingSpawns--;
    }
  }

  // --------------------------------------------------------------- lavender
  private rowInk(row: Row): number {
    let ink = 0;
    for (const l of row.lanes) for (const s of l.segs) if (!s.peach) ink += s.wb;
    return ink;
  }

  private planLavender(row: Row): void {
    const c = this.cfg;
    const lo = row.inkTarget * (1 - c.INK_TOLERANCE);
    const hi = row.inkTarget * (1 + c.INK_TOLERANCE);
    let ink = this.rowInk(row);
    let count = row.lanes.reduce((n, l) => n + l.segs.filter((s) => !s.peach).length, 0);

    for (const lane of row.lanes) {
      lane.segs.sort((a, b) => a.xb - b.xb);
      if (lane.yieldEntry && !this.openEntry(lane)) {
        const first = lane.segs.find((s) => right(s) > lane.L);
        if (first) this.yielders.add(first);
      }
      for (const s of lane.segs) if (this.yielders.has(s)) ink -= this.makeWay(lane, s, ink - lo);

      // walk a snapshot: splits insert into lane.segs as we go
      for (const s of lane.segs.slice()) {
        if (s.peach || s.busy || this.rng() >= c.OP_RATIO) continue;
        const segs = lane.segs;
        const i = segs.indexOf(s);
        const prev = this.neighbour(lane, i, -1);
        const next = this.neighbour(lane, i, 1);
        let leftLim = prev ? Math.max(right(prev), prev.xa + prev.wa) + c.GAP : lane.lb;
        if (!prev && s.xb >= lane.reserve) leftLim = Math.max(leftLim, lane.reserve);
        const rightLim = next ? Math.min(next.xb, next.xa) - c.GAP : lane.rb;
        if (leftLim > s.xb + EPS || rightLim < right(s) - EPS) continue; // already squeezed

        const dev = (ink - row.inkTarget) / row.inkTarget / c.INK_TOLERANCE; // -1..1 at the limits
        const cdev = (count - row.lavCount0) / Math.max(4, row.lavCount0 * 0.15);
        const weights = {
          slide: 0.45,
          stretch: 0.2 * clamp(1 - dev, 0, 2),
          shrink: 0.2 * clamp(1 + dev, 0, 2),
          split: 0.08 * clamp(1 - cdev, 0, 2),
          merge: 0.08 * clamp(1 + cdev, 0, 2),
        };
        const op = this.pick(weights);

        if (op === 'slide') {
          const pRight = clamp(0.5 + (s.home - s.xb) / (2 * c.HOME_PULL), 0.1, 0.9);
          const dist = c.UNIT * (this.rng() < 0.6 ? 1 : 2);
          const dx = this.rng() < pRight ? Math.min(dist, rightLim - right(s)) : -Math.min(dist, s.xb - leftLim);
          if (Math.abs(dx) >= 1) { s.xb += dx; s.busy = true; }
        } else if (op === 'stretch') {
          const room = Math.min(c.UNIT, c.MAX_W - s.wb, hi - ink);
          const side = this.rng();
          let gl = side < 0.4 ? room : side < 0.8 ? 0 : room / 2;
          let gr = room - gl;
          gl = Math.min(gl, s.xb - leftLim);
          gr = Math.min(gr, rightLim - right(s));
          if (gl + gr >= 1) { s.xb -= gl; s.wb += gl + gr; ink += gl + gr; s.busy = true; }
        } else if (op === 'shrink') {
          const d = Math.min(c.UNIT, s.wb - s.minW, ink - lo);
          if (d >= 1) {
            const side = this.rng();
            const fromLeft = side < 0.4 ? d : side < 0.8 ? 0 : d / 2;
            s.xb += fromLeft; s.wb -= d; ink -= d; s.busy = true;
          }
        } else if (op === 'split') {
          const halfW = Math.max(c.UNIT, (s.wb - c.GAP) / 2);
          const span = halfW * 2 + c.GAP;
          const dInk = 2 * halfW - s.wb;
          if (rightLim - leftLim < span || ink + dInk > hi || ink + dInk < lo) continue;
          const x = clamp(s.xb + s.wb / 2 - span / 2, leftLim, rightLim - span);
          // B starts as the right half of S, touching A; the bridge makes them read as one pill.
          const b = this.makeSeg(s.xb + s.wb / 2, s.wb / 2, s.h, s.ca, false);
          b.minW = s.minW;
          s.wa = s.wb = s.wb / 2;
          s.xb = x; s.wb = halfW; s.busy = true;
          b.xb = x + halfW + c.GAP; b.wb = halfW; b.home = b.xb; b.busy = true;
          s.link = { to: b, kind: 'split' };
          segs.splice(i + 1, 0, b);
          ink += dInk; count++;
        } else if (op === 'merge') {
          if (!next || next.peach || next.busy || next.link) continue;
          const g = next.xb - right(s);
          const total = right(next) - s.xb;
          if (g > c.MERGE_GAP || total > c.MAX_W || ink + g > hi) continue;
          const mid = right(s) + g / 2;
          const col = s.wb >= next.wb ? s.ca : next.ca; // lavender tint changes only here
          s.wb = mid - s.xb; s.cb = col; s.busy = true;
          next.wb = right(next) - mid; next.xb = mid; next.cb = col; next.busy = true;
          s.link = { to: next, kind: 'merge' };
          ink += g; count--;
        }
      }
    }
  }

  /**
   * A lavender pill makes way for a peach behind it: slide forward if there is room,
   * otherwise give up width at its back end (within the ink budget). Returns ink spent.
   */
  private makeWay(lane: Lane, s: Seg, inkBudget: number): number {
    const c = this.cfg;
    if (s.peach || s.busy) return 0;
    const next = this.neighbour(lane, lane.segs.indexOf(s), 1);
    const rightLim = next ? Math.min(next.xb, next.xa) - c.GAP : lane.rb;
    const dx = Math.min(c.UNIT, rightLim - right(s));
    if (dx >= 1) {
      s.xb += dx;
      s.busy = true;
      return 0;
    }
    const d = Math.min(c.UNIT, s.wb - s.minW, inkBudget);
    if (d < 1) return 0;
    s.xb += d;
    s.wb -= d;
    s.busy = true;
    return d;
  }

  /**
   * A peach is waiting on the other side of a clear zone: shift the run of pills at this lane's
   * entry up to one unit right, pushing neighbours along only as far as the min gap requires.
   * Ink is unchanged. Returns false if the run cannot move (then the single-pill nudge runs).
   */
  private openEntry(lane: Lane): boolean {
    const c = this.cfg;
    const segs = lane.segs;
    const i0 = segs.findIndex((s) => Math.max(right(s), s.xa + s.wa) > lane.L);
    if (i0 < 0) return true;
    const room = Math.min(segs[i0].xa, segs[i0].xb) - c.GAP - lane.L;
    const shift = Math.min(c.UNIT, c.UNIT + c.PEACH_MIN_W - room);
    if (shift <= 0) return true;
    const moves: [Seg, number][] = [];
    let edge = -Infinity; // new right end of the previous pushed pill
    for (let j = i0; j < segs.length; j++) {
      const s = segs[j];
      const d = j === i0 ? shift : edge + c.GAP - Math.min(s.xa, s.xb);
      if (d <= 0) break;
      if (s.peach || s.busy || s.link) return false;
      if (right(s) + d > lane.rb) return false;
      moves.push([s, d]);
      edge = Math.max(right(s), s.xa + s.wa) + d;
    }
    for (const [s, d] of moves) {
      s.xb += d;
      s.busy = true;
    }
    return true;
  }

  /**
   * Nearest segment on one side of lane.segs[i] that constrains a lavender pill. A peach that
   * is fading out, sliding under a zone edge or still hidden can sit over a lavender pill, so it
   * must never stand in for the real neighbour behind it.
   */
  private neighbour(lane: Lane, i: number, dir: 1 | -1): Seg | undefined {
    for (let j = i + dir; j >= 0 && j < lane.segs.length; j += dir) {
      const n = lane.segs[j];
      if (!n.peach) return n;
      if (!n.dying && !n.crossing && right(n) > lane.L && n.xb < lane.R) return n;
    }
    return undefined;
  }

  private pick<K extends string>(w: Record<K, number>): K {
    const keys = Object.keys(w) as K[];
    let r = this.rng() * keys.reduce((a, k) => a + w[k], 0);
    for (const k of keys) if ((r -= w[k]) <= 0) return k;
    return keys[0];
  }
}
