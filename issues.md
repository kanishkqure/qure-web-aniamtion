# Issues in the qLens and qTrack animations

Found while auditing them for the platform overview. Neither file was changed.

- qLens: `qlens-tech.html` on `claude/qlens-isometric-flow-d9m4xo`
- qTrack: `qtrack-tech.html` on `claude/eager-sagan-mv6mrj`

## 1. Duplicate element IDs across the two components
Both SVGs use the same IDs: `#chrome`, `#links`, `#link-in`, `#link-out`, `#connectors`, `#conn-1`, `#conn-2`, `#labels`, `#frames`, `#frame-in`, `#frame-out`, `#status-layer`, `#status`, `#status-txt`, `#status-ms`, `#packets`, `#pk-1`, `#pk-2`.

The scripts still work on a shared page because every lookup is scoped to its own SVG (`svg.querySelector`). The page is still invalid HTML, though, and any global `getElementById` or `#id` CSS selector will hit the wrong component. The `clipPath` and `pattern` IDs don't collide today. They would if either component appeared twice on one page.

**Suggested fix:** prefix every ID per component (`ql-`, `qtr-`). The overview already uses `ov-`.

## 2. Top-face glyphs use a 0.9 skew where true 30° isometric needs 0.866
`transform="matrix(0.9 -.5 0.9 .5 …)"` on every `.glyph`:
- qLens: line 69
- qTrack: line 83
- The qLens tick labels use the same 0.9 (`matrix(0.9 -.5 0 1 …)`, line 67).

The cubes themselves are drawn at true 30° (62.4 / 72 = 0.8667). So the glyphs are about 4% wider than the face they sit on, and slightly off-plane. The overview copies 0.9 so its minis match the heroes; if you fix this, fix all three files together.

## 3. qTrack looks different inside the qLens section
- In `qlens-tech.html`, `#cube-qtrack` (line 69) is a plain white cube with the calendar-check glyph.
- In `qtrack-tech.html`, that same calendar-check glyph means *Specialist* (`#cube-spec`, line 83).
- qTrack itself is the peach 72×72×108 tower with the route glyph (`#qtrack`).

Decision: the qTrack section's version is canonical, and the overview follows it. The qLens section should follow too.

## 4. The qLens section tells a different story from the overview copy
The qLens section shows qLens reasoning over **guidelines, trials and real-world evidence**, starting from a "Patient record" input. The overview copy says qLens *"reads every scan against the whole record and builds the referral packet"*. Cited evidence is qRx's job there (*"one cited next step"*).

The geometry hands off cleanly, but the story doesn't: what you zoom into isn't what the overview said qLens does.

## 5. qLens has no mobile handling
The view box is 1372.6 units wide and scales straight to the container. At 375px that's about 0.25×, so 15px names render at about 4px and 7px tick labels at about 2px. qTrack handles this with a cropped static frame below 640px (CSS media query plus the `desk` gate in its script). qLens has neither.

## 6. Skeleton-bar greys differ between the two files
| class | qLens | qTrack |
|---|---|---|
| `.sk` | `#ECECF2` | `#DDDDE6` |
| `.sk-l` | `#F3F3F7` | `#ECECF2` |
| `.sk-d` | `#E1E1E9` | `#DDDDE6` |

Same UI-frame vocabulary, two different palettes. Neither file has colour tokens; every value is a hex literal.
