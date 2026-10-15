# Footer pill band

The qure.ai footer with an animated band of pills around the logo and tagline. The pills
live on fixed rows and slide, stretch, shrink, split and merge along them. Peach pills
drift left to right across the band. Everything else in the footer is static HTML.

```
footer/
  footer.html          the footer component (static markup + CSS + 10-line wrapper)
  fonts/               Aether Neue Light (woff2 + woff), the only weight the footer uses
  src/figma-band.ts    GENERATED Figma constants (every pill, row, zone)
  src/band-model.ts    the motion model, DOM-free
  src/pill-band.ts     canvas renderer + lifecycle (rAF, IntersectionObserver, resize, reduced motion)
  dist/pill-band.js    IIFE build, global `QurePillBand` (what footer.html loads; works over file://)
  dist/pill-band.esm.js ES module build for bundlers / React
  test/band-model.test.ts  headless invariant checks
tools/extract-footer-band.mjs  regenerates src/figma-band.ts from the .fig
```

```sh
npm install
npm run build:footer      # src -> dist
npm run test:footer       # invariants over ~20k keyframes, 5 layouts, 7 seeds
npm run typecheck
# regenerate constants after a Figma change (.fig is a zip; the extractor reads canvas.fig)
unzip Qure_footer.fig -d /tmp/qf && npm run extract:footer -- /tmp/qf/canvas.fig
```

## Figma constants (measured from the decoded file, not approximated)

| Constant | Value | Source |
|---|---|---|
| Frame | 1440 × 645 | `Background` |
| Band | y 294.8 – 462.8 (168 px) | two 822 × 168 clip frames, one rotated 180°, one flipped |
| Rows | 10, centres y = 307.20, 323.13, 339.07, 355.00, 370.93, 386.87, 402.80, 418.73, 434.66, 450.60 | pill centres |
| Row pitch | 15.933 px | |
| Pill height / radius | 7.05 / 3.525 (6 edge pills are smaller, 3.81–6.20 tall, still centred; kept as-is) | vector capsules |
| Base unit | 13.123 px (shortest full-height visible pill) | |
| Min gap | 4.372 px | |
| Visible pills | 250 = 242 lavender + 8 peach | inside the clips |
| Fills | 49 lavender tints (#A199C6 … #D8D1EB), paint opacity 0.41 – 1.0 | per pill |
| Peach | **#FF7869 (brand) — intentional deviation.** Figma draws the band peach with its "Peach" style #FF6D61, kept as `figmaPeachColor`; the extractor rewrites the 8 peach pills to #FF7869 (`PEACH_OVERRIDE`). | decision, not measurement |
| Layer opacity | 0.20 (frame) × 0.85 (`capsules`, multiply) = 0.17 | |
| Logo | x 173, y 307.8, 415 × 141.707, fill #FF7869 | `Container` |
| Logo clear zone | x 151 – 610, full band height (logo ± 22 px) | gap between the two clip frames |
| Right inset | 8 px (band ends at x 1432) | right clip frame |
| Tagline | x 730, y 338.6, 421 × 76, Aether Neue Light 32/38.4; text "Connecting care from detection to intervention." | **no clear zone** (decided); pills run behind it |

### Verification against Figma's own render

Figma frame: `qGZKvMzrfmVPmh2GyixLl0`, node `4:6639`, exported at 1x through the Figma
connector, compared with a Chrome screenshot of `footer.html` at 1440 × 645 (static first
frame). Per-channel difference, 0–255:

| Region | Mean | Max | Pixels > 16 | What remains |
|---|---|---|---|---|
| Band (pills, excluding logo/tagline boxes) | 0.16 | 8 | 0 | edge antialiasing only |
| Logo | 1.22 | 98 | 1,559 | path edge antialiasing |
| Link columns | 3.03 | 157 | 3,565 | glyph rasterisation |
| Email + button | 4.69 | 95 | 976 | glyph rasterisation |
| Legal row | 6.27 | 129 | 3,937 | glyph rasterisation (9 px text) |
| Disclaimer | 7.89 | 131 | 2,422 | glyph rasterisation |
| Newsletter heading (Aether Neue) | 9.68 | 166 | 1,335 | glyph rasterisation |
| Tagline | 6.73 | 172 | 3,349 | glyph rasterisation |

- The brand-peach deviation is invisible at band opacity: #FF7869 against #FF6D61 at 17% composites to under 2/255 per channel, so the band row changes by one pixel.
- **Text position:** best-fit sub-pixel shift per text region is within 0.5 px of Figma everywhere. Chrome snaps text baselines to whole pixels, so 0.5 px is the floor.
  - Reaching it took measured nudges in `footer.html`: legal row +2 px, disclaimer +1 px, tagline and button label −0.5 px, placeholder −0.75 px x. Figma and Chrome place glyphs differently inside identical line boxes.
- **What's left in text regions** is the outline of every glyph: Figma's text rasteriser against Chrome's. CSS can't remove it.

**Geometry:** the live file's 2,602 pill vectors match `figma-band.ts`'s source exactly (same ids, x, y, width, height; max difference 0 px). The connector's metadata doesn't expose fills or opacities, but the band row above (max 8/255) confirms those too. The test also checks all 250 visible pills by position and width.

### Decisions

- **Tagline** is "Connecting care from detection to intervention.", matching the Figma frame.
- **No tagline clear zone.** Pills run behind the tagline, as in Figma. `TAGLINE_CLEAR_ZONE: true` carves one out (logo-style ±22 px padding), at the cost of first-frame parity.
- **Pill widths stay as drawn.** They vary continuously (13.12 – 24.27). The unit is the step size for operations only.
- **Band peach is the brand #FF7869**, an intentional deviation from Figma's #FF6D61.
- **No mobile frame** exists yet, so ≤799 px uses the fallback, tuned with one value: `MOBILE_DENSITY`.

## Motion model

- Each row is split into **lanes** by clear zones. A lane holds ordered segments `{id, x, w, colour}`. Lavender segments never cross each other or leave their lane.
- Every `KEYFRAME_MS` the model plans the next state. Between keyframes, x, width, colour and opacity tween **linearly**: no easing, no scale, no vertical motion.
- About `OP_RATIO` of the lavender segments in each row get one op:
  - **slide** ±1–2 units, leaning back toward the pill's Figma position so the texture doesn't wander
  - **stretch / shrink** ±1 unit (never below 1 unit, never above `MAX_W`)
  - **split** into two ≥1-unit halves with a min-gap between them
  - **merge** with a neighbour whose gap is ≤ `MERGE_GAP`
- Every op is clamped against both ends of its neighbours' tweens, so the min gap holds at every frame, not just at keyframes (the test checks this).
- **Split and merge never pop.** The pair is drawn with a bridge whose height tweens linearly: at full height while they touch, so they read as one pill, and at zero once they reach the min gap.
- **Ink:** each row's lavender ink (sum of widths) is a hard ±`INK_TOLERANCE` band around its Figma value. Op weights also lean back toward the target.
- **Colour:** a lavender tint only changes in a merge, where the smaller pill takes the larger one's tint. Splits copy the tint.
- **Clear zones** are lane boundaries. Pills that Figma already cuts at a zone edge keep their overhang, drawn clipped exactly as in Figma. Nothing moves further in.

### Peach thread

- Peach pills keep their `id`. Each keyframe a peach advances 1–2 units with probability `PEACH_DRIFT`.
- It lands in the nearest gap at or past its target, shrinking to fit a tight gap (down to `PEACH_MIN_W`) and regrowing by up to a unit per keyframe.
- When the pill in front blocks it, the two **swap places** over one keyframe (`[peach][gap][pill]` becomes `[pill][gap][peach]`). The lavender pill passes under the peach. This is the one deliberate exception to "segments never cross": without it a peach would plough every pill ahead of it into the clear-zone edge. Ink and spacing are unchanged by a swap.
- At a clear zone the peach waits at the edge until the far side's entry has room. Meanwhile the run of pills at the far lane's entry shifts up to one unit right per keyframe, each pushing the next only as far as the min gap requires, with ink unchanged. The peach then slides under the edge and emerges on the far side the next keyframe.
- Safety valve: a peach that hasn't moved for `PEACH_PATIENCE` keyframes fades out in place and a replacement fades in at the left. On desktop this fires 0–1 times per ~2,000 keyframes (the test fails above 1% of exits). It exists for lanes too packed to ever admit a peach, such as mobile at `MOBILE_DENSITY: 1`.
- At the far right edge it fades out over one keyframe. A replacement fades in at the left edge of a random row in the same keyframe, so the count stays at the Figma count (8 at desktop). Narrow layouts that crop peaches away keep the Figma peach:lavender ratio, with at least one.

## Tuning the feel

All tunables are in one object (`DEFAULT_CONFIG` in `src/band-model.ts`). Override any of them per instance:

```js
QurePillBand.createPillBand({ canvas, logo, tagline, config: { KEYFRAME_MS: 900, OP_RATIO: 0.18 } });
```

| Key | Default | Effect |
|---|---|---|
| `KEYFRAME_MS` | 300 | Tween length. Higher = calmer. |
| `OP_RATIO` | 0.35 | Share of lavender pills that move per keyframe. Lower = stiller texture. |
| `PEACH_DRIFT` | 0.85 | Chance a peach advances on a keyframe. A peach takes about 57 keyframes to cross 1440 px: ~17 s at 300 ms. |
| `INK_TOLERANCE` | 0.10 | Allowed density drift per row. |
| `MERGE_GAP` | 2 × min gap | How close two pills must be to merge. |
| `MAX_W` | 2.5 units | Longest pill a stretch/merge may make. |
| `PEACH_MIN_W` | 0.4 units | How far a peach squeezes to fit a gap. |
| `HOME_PULL` | 4 units | Strength of the pull back to Figma positions (smaller = stronger). |
| `PEACH_PATIENCE` | 40 (12 s at 300 ms) | Keyframes a blocked peach waits before fading out in place. |
| `TAGLINE_CLEAR_ZONE` | false | Carve a clear zone around the tagline. |
| `MOBILE_MAX` | 799 | Fallback-layout breakpoint. |
| `MOBILE_DENSITY` | 0.5 | Mobile fallback density, 0–1: the evenly spread share of rows, and of lavender pills within each kept row, that survive at ≤ `MOBILE_MAX`. 0.5 = every other row, every other pill (identical to the earlier fallback). 1 = all rows and pills. |
| `SEED` | random | Fix it for reproducible motion (tests, screenshots). |

## Runtime behaviour

- One `<canvas aria-hidden="true">` behind the real SVG logo (`role="img"`, `aria-label="qure.ai"`) and the tagline `<p>`.
- Scaled by `devicePixelRatio`. The band container starts on a whole pixel so the bitmap is never resampled.
- Fills are pre-composited over white (`BG`), so a bridge or a peach passing over a pill never darkens the overlap. If the footer background changes, set `BG`.
- `requestAnimationFrame` runs only while the canvas is intersecting the viewport and the tab is visible. Elapsed time is capped per frame, so it never jumps after a stall.
- `prefers-reduced-motion: reduce` renders the static Figma state only, and reacts if the setting changes.
- Resize (ResizeObserver on canvas and logo) and web-font load re-measure the logo/tagline, recompute lanes and zones, and rebuild from the Figma state.
- Draw cost is about 0.6 ms per frame for ~250 pills (headless Chromium, software raster).

## Responsive layout

- **Lanes** are `[0, logo.left − 22]` and `[logo.right + 22, width − 8]`. Each side's Figma pattern is anchored to the logo-side edge.
- Widths below 1440 crop the pattern. The left side has 822 px of real Figma pills beyond the page edge to draw on, and the right side tiles with the 822 px frame period.
- **≤799 px:** `MOBILE_DENSITY` (default 0.5 = every other row, every other lavender segment). The logo is centred, and the tagline drops below the band. At 0.5 a phone gets about two pills per lane per row. A real mobile frame in Figma would do better; tune `MOBILE_DENSITY` against it until then.

## Known gaps

- The lavender **count** isn't constrained by the brief, only ink. It drifts up to about +13% because splits outnumber merges once pills stretch. Ink stays within ±10%.
