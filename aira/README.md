# Aira product film

Branch `aira-film`, based on `12874cc` (`claude/qtrack-film-redo`). Its
`motion-preview-standalone.html` is byte-identical to `reference/qtrack-film-final.html`,
the qTrack film that is live on the website (SHA-256 `66ace194adf39eb1…`).
Nothing outside `/aira` is changed.

## Phase 1b (current)

The four Aira chapters rebuilt as **reduced UI in the qTrack film's style**. The screens
in `assets/screens/` give the story and copy only; look and motion come from
`reference/qtrack-film-final.html`.

- `aira-storyboard.html`: the 12 keyframes, each a frame of the real master timeline,
  next to the matching moment of the live qTrack film (`reference/frames/`).
  `?solo=01a` renders one keyframe at 1600×923; `?t=12.5` any moment.

## Layout

| Path | What |
|---|---|
| `src/aira.css` | stage, qTrack shell and components (copied), reduced Aira components |
| `src/aira-stage.js` | copy, DOM, master timeline (labels ch1 · ch2 · ch3 · ch4 · end), keyframe times |
| `src/motion.js` | qTrack helpers (pos, liftClone, liftOut, shellIn, cursorTo, click, typeIn, pop, swapTo, countUp) |
| `src/map-data.js` | Mozambique districts traced from screen 04a (generated) |
| `assets/blur/` | pre-blurred shell layers for the lift-outs (generated) |
| `assets/fonts/` | Aether Neue, IBM Plex Sans/Mono, DM Mono, DM Sans (from qTrack `assets/fonts`) |
| `reference/` | the live qTrack film + its matching-moment frames |
| `tools/` | `trace-map.py`, `make-blurs.js`, `build-standalone.py` |

```bash
python3 aira/tools/trace-map.py aira/assets/screens aira/src/map-data.js
```

```bash
node aira/tools/make-blurs.js
```

```bash
python3 aira/tools/build-standalone.py aira/aira-storyboard.html /tmp/aira-storyboard-standalone.html
```

## Stage

1040×600 output. Drawn at 1600×923 (same ratio) and scaled to the container, so the UI
lands at the same scale as the qTrack film's 1600-wide stage and its CSS is reused unchanged.

## Changes to copied qTrack code (Aira copies only)

- `motion.js` → `liftClone` resets `position/left/top` on the clone (Aira sources are absolutely placed);
  `typeIn` also returns the time each character lands (chips and sweeps key off it);
  `cursorTo` starts below the 923-high stage; new `liftBack` (reverse of `liftOut`, same eases),
  `liftExit`, `cardIn`, `pillIn`, `sweep` wrap patterns the qTrack timeline writes inline.
- `build-standalone.py` → also inlines local `<link>` CSS and `<script src>` files and can strip
  the review bar (`--strip-review`).
