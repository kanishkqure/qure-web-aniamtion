# Aira product film

Branch `aira-film`, based on `12874cc` (`claude/qtrack-film-redo`). Its
`motion-preview-standalone.html` is byte-identical to `reference/qtrack-film-final.html`,
the qTrack film that is live on the website (SHA-256 `66ace194adf39eb1…`).
Nothing outside `/aira` is changed.

## Deliverables (Phase 2)

| File | What |
|---|---|
| `aira-film.html` | the film. One self-contained file (fonts, blur layers, map inlined); GSAP 3.13.0 pinned on jsDelivr. No review bar. |
| `motion-preview-standalone.html` | the same film + review bar (play/pause, chapter jumps, scrubber, 0.25× / 0.5× / 1×) |
| `review/aira-loop.mp4` | one loop, 1280×740, 30 fps |
| `review/qa-report.md` | QA results (`tools/qa.js`) |
| `aira-storyboard.html` | the 12 keyframes next to the matching qTrack moments (Phase 1b review page) |

## Embedding

```html
<div class="aira-film" id="aira-film" data-start="" data-end=""></div>
```

- Labels: `ch1 · ch2 · ch3 · ch4 · end`. `window` receives `aira:chapter` (detail 1–4) at each chapter start.
- `data-start="ch2"` plays that chapter on a loop; add `data-end="ch4"` to play a range. `data-manual` disables autoplay.
- Autoplays in view (15 % visible), loops, pauses off-screen and in hidden tabs.
- `prefers-reduced-motion: reduce` shows the CH2 "Recommendation accepted" frame, static.
- `window.airaFilm` = `{ready, timeline, labels, duration, keyframes, segment}`; the film element fires `aira:ready`.

## Build

```bash
sh aira/tools/build-film.sh
```

```bash
node aira/tools/qa.js
```

```bash
node aira/tools/record.js
```

Regenerate generated assets when the layout changes:

```bash
node aira/tools/make-blurs.js
```

```bash
python3 aira/tools/trace-map.py aira/assets/screens aira/src/map-data.js
```

## Source layout

| Path | What |
|---|---|
| `motion-preview.html` | source page (film + review bar between `REVIEW` markers) |
| `src/aira.css` | stage, qTrack shell and components (copied), reduced Aira components |
| `src/aira-stage.js` | copy, DOM, master timeline, keyframe times |
| `src/motion.js` | qTrack helpers, bound per stage |
| `src/film.js` | runtime: fit, events, segments, autoplay in view, reduced motion |
| `src/map-data.js` | Mozambique districts traced from screen 04a (generated) |
| `assets/blur/` | pre-blurred shell layers for the lift-outs (generated, qTrack recipe) |
| `assets/fonts/` | Aether Neue, IBM Plex Sans/Mono, DM Mono, DM Sans (from qTrack `assets/fonts`) |
| `assets/screens/` | the 12 design screens: story and copy only |
| `reference/` | the live qTrack film + its matching-moment frames |

## Stage

1040×600 output, drawn at 1600×923 (same ratio) and scaled to the container, so the UI sits at the
qTrack film's scale. The app window is 952×677, 59.5 % of the frame width (qTrack: 944/1600).

## Changes to copied qTrack code (Aira copies only)

- `motion.js`: `liftClone` resets `position/left/top` on the clone (Aira sources are absolutely placed);
  `typeIn` also returns the time each character lands; `cursorTo` starts below the 923-high stage; new
  `liftBack` (reverse of `liftOut`, same eases), `viewSwap` (shellIn applied to a view, for a 0.35 s
  overlap on a sharp shell), `liftExit`, `cardIn`, `pillIn`, `sweep` wrap patterns the qTrack timeline writes inline.
- `build-standalone.py`: also inlines local `<link>` CSS, `<script src>` files and quoted asset paths,
  and strips the review bar with `--strip-review`.
- Review bar: copied from the qTrack preview; chapter buttons and ticks read the Aira labels.
