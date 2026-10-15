// Animated pill band for the qure.ai footer. Framework-agnostic: give it a canvas and the
// logo (and optionally tagline) elements it should keep clear of.
//
//   const band = createPillBand({ canvas, logo, tagline, config: { KEYFRAME_MS: 700 } });
//   band.destroy();

import { BandModel, DEFAULT_CONFIG, type BandConfig, type Rect, type RGB, type Seg } from './band-model';
import { FIGMA_BAND } from './figma-band';

export { BandModel, DEFAULT_CONFIG, FIGMA_BAND };
export type { BandConfig };

export interface PillBandOptions {
  canvas: HTMLCanvasElement;
  /** The logo element; its box (plus ZONE_PAD) is the clear zone. */
  logo: Element;
  /** The tagline element; only used when config.TAGLINE_CLEAR_ZONE is on. */
  tagline?: Element | null;
  config?: Partial<BandConfig>;
}

export interface PillBand {
  readonly model: BandModel;
  /** Re-measure the logo/tagline and rebuild the Figma starting state. */
  relayout(): void;
  destroy(): void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const css = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

function capsule(ctx: CanvasRenderingContext2D, x: number, cy: number, w: number, h: number) {
  const r = Math.min(h / 2, w / 2);
  const y = cy - h / 2;
  if (ctx.roundRect) return ctx.roundRect(x, y, w, h, r);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, cy, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
}

function colourAt(s: Seg, t: number, bg: RGB): string {
  const o = lerp(s.oa, s.ob, t);
  const c = s.ca === s.cb ? s.ca : ([0, 1, 2].map((i) => lerp(s.ca[i], s.cb[i], t)) as RGB);
  if (o >= 1) return css(c);
  return css([0, 1, 2].map((i) => lerp(bg[i], c[i], o)) as RGB);
}

/** Draw the band at tween progress t (0..1). */
export function drawBand(ctx: CanvasRenderingContext2D, model: BandModel, t: number, height: number): void {
  const bg = model.cfg.BG.replace('#', '');
  const bgRGB: RGB = [0, 2, 4].map((i) => parseInt(bg.slice(i, i + 2), 16)) as RGB;
  for (const row of model.rows) {
    for (const lane of row.lanes) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(lane.L, 0, lane.R - lane.L, height);
      ctx.clip();
      // lavender first, peach on top so a peach passing through a gap reads as in front
      for (const pass of [false, true]) {
        for (const s of lane.segs) {
          if (s.peach !== pass) continue;
          const x = lerp(s.xa, s.xb, t);
          const w = lerp(s.wa, s.wb, t);
          if (w <= 0.01 || x > lane.R || x + w < lane.L) continue;
          ctx.fillStyle = colourAt(s, t, bgRGB);
          ctx.beginPath();
          capsule(ctx, x, row.cy, w, s.h);
          if (s.link) {
            // Bridge between a splitting/merging pair: full height while they touch, so the
            // pair reads as one pill, thinning linearly as the gap opens (or the reverse).
            const o = s.link.to;
            const ox = lerp(o.xa, o.xb, t);
            const hb = Math.min(s.h, o.h) * (s.link.kind === 'merge' ? t : 1 - t);
            const r = s.h / 2;
            if (hb > 0.05) ctx.rect(x + w - r, row.cy - hb / 2, ox + r - (x + w - r), hb);
          }
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }
}

function relRect(el: Element, origin: DOMRect): Rect {
  const r = el.getBoundingClientRect();
  return { x0: r.left - origin.left, x1: r.right - origin.left, y0: r.top - origin.top, y1: r.bottom - origin.top };
}

export function createPillBand(opts: PillBandOptions): PillBand {
  const { canvas, logo, tagline = null } = opts;
  const ctx = canvas.getContext('2d')!;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cssW = 0;
  let cssH = 0;
  let model!: BandModel;
  let elapsed = 0;
  let last = 0;
  let raf = 0;
  let onScreen = false;

  canvas.setAttribute('aria-hidden', 'true');

  function measure() {
    const box = canvas.getBoundingClientRect();
    cssW = box.width;
    cssH = box.height;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(canvas.width / cssW || dpr, 0, 0, canvas.height / cssH || dpr, 0, 0);
    return {
      width: cssW,
      height: cssH,
      logo: relRect(logo, box),
      tagline: tagline ? relRect(tagline, box) : null,
    };
  }

  function relayout() {
    const layout = measure();
    if (!model) model = new BandModel(layout, opts.config);
    else model.build(layout);
    elapsed = 0;
    render(0);
    sync();
  }

  function render(t: number) {
    ctx.clearRect(0, 0, cssW, cssH);
    drawBand(ctx, model, t, cssH);
  }

  function frame(now: number) {
    raf = 0;
    elapsed += Math.min(now - last, 250); // never jump after a stall
    last = now;
    const K = model.cfg.KEYFRAME_MS;
    while (elapsed >= K) {
      elapsed -= K;
      model.advance();
    }
    render(elapsed / K);
    sync();
  }

  /** Run only while on screen, in a visible tab, and motion is allowed. */
  function sync() {
    const run = onScreen && !document.hidden && !reduce.matches;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  const onReduce = () => {
    if (reduce.matches) relayout(); // snap back to the static Figma state
    else sync();
  };

  let lastW = -1;
  let lastH = -1;
  const ro = new ResizeObserver(() => {
    const b = canvas.getBoundingClientRect();
    if (Math.abs(b.width - lastW) < 0.5 && Math.abs(b.height - lastH) < 0.5) return;
    lastW = b.width;
    lastH = b.height;
    relayout();
  });
  const io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    sync();
  });

  relayout();
  ro.observe(canvas);
  ro.observe(logo);
  io.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', onReduce);
  // web fonts can move the logo/tagline after first paint
  document.fonts?.ready.then(() => relayout());

  return {
    get model() {
      return model;
    },
    relayout,
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener('change', onReduce);
    },
  };
}
