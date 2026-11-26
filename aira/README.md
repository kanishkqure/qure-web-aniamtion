# Aira product film

Branch `aira-film`, created from `41b23c5` (tip of `claude/quirky-babbage-3ygcjw`, the qTrack film).
Nothing outside `/aira` is changed.

## Phase 1 (this commit)

- `aira-storyboard.html`: 12 keyframes, each rebuilt in HTML/CSS/SVG and shown next to its source PNG.
  The **Overlay** button onion-skins the source screen over the rebuild.
  `?solo=01a` (and so on) renders a single keyframe at 1040×600 for pixel comparison.

## Layout

| Path | What |
|---|---|
| `src/aira.css` | stage + rebuilt UI. All coordinates are CSS px of the screens (PNG px / 2) |
| `src/aira-stage.js` | markup builder, copy, traced geometry, the 12 keyframe states |
| `src/map-data.js` | Mozambique districts traced from 04a, colours from 04a/04b (generated) |
| `src/motion.js` | motion helpers copied from the qTrack film (see the header for changes) |
| `assets/fonts/` | IBM Plex Sans/Mono, DM Mono, DM Sans (copied from qTrack `assets/fonts`) |
| `assets/screens/` | the 12 source PNGs (layout reference only; not shipped in the film) |
| `tools/trace-map.py` | regenerates `src/map-data.js` from the screens |
| `tools/build-standalone.py` | copy of qTrack's single-file build, extended (see its header) |

```bash
python3 aira/tools/trace-map.py aira/assets/screens aira/src/map-data.js
```

```bash
python3 aira/tools/build-standalone.py aira/aira-storyboard.html /tmp/aira-storyboard-standalone.html
```

## Reused from qTrack

- Easing tokens `emph` = cubic-bezier(0.2,0,0,1), `glide` = cubic-bezier(0.45,0,0.15,1); GSAP **3.13.0** (jsDelivr).
- Fonts: the woff2 files from `assets/fonts`.
- Motion helpers: cardIn, pop, sweepIn/sweepOut, swapTo, typeIn, click, beatOut, plus the inline
  lift-out, pointer glide, count-up and ring-draw patterns turned into helpers (`src/motion.js`).
- Review-bar code: will be copied into `motion-preview.html` in Phase 2.
- QA scripts: there are none in the qTrack commit (no anonymisation search or frame-rate check). They will be written for Aira in Phase 2.
