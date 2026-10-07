# Platform scroll animation — build brief

Read this entire file before doing anything. It is the single source of truth for this build.

## 1. What we're building

One pinned, step-driven scroll section for the qure.ai website that replaces three things: the platform overview section and the separate qLens and qTrack sections. qRx gets no standalone section; it lives only here.

It works like a scroll-telling sequence:
- The section pins to the viewport.
- Each scroll gesture advances exactly one step.
- The heading on the left, the isometric stage in the centre-left and an info panel on the right change per step.
- One shared isometric stage throughout. The camera starts on a wide overview of the whole platform, then zooms in and pans across the same floor to qLens, then qTrack, then qRx.
- After the last step, the section unpins and the page continues.

Desktop only. No hover or click interactions. This will later be imported into Claude Design, so keep every step as a clean, named state (see section 9).

## 2. Existing files — read-only references

- qLens animation: `qlens-tech.html` (branch `claude/qlens-isometric-flow-d9m4xo`)
- qTrack animation: `qtrack-tech.html` (branch `claude/eager-sagan-mv6mrj`)
- Earlier overview attempt: `platform-overview.html` (may reuse geometry helpers from it)
- Wireframes for frames 0–3: `/refs/frame-0.png` … `/refs/frame-3.png` (I'll add these; match their layout)

Hard rule: do not edit, refactor, rename, move or reformat `qlens-tech.html` or `qtrack-tech.html`. Copy anything you need into the new file and tell me what you copied.

Create the new section as `platform-scroll.html` at the repo root, following the existing convention (one self-contained HTML file, inline SVG + vanilla JS, no libraries). Prefix every id with `ps-`.

## 3. Visual language (match qLens / qTrack exactly)

- True 30° isometric projection, grid unit 44. Write one `iso()` helper and generate all geometry from it.
- Floor: light isometric line grid, as on the qTrack floor plate, faint lavender lines.
- Nodes: white rounded cubes, 1.5 #303030 edge, faint inner top rhombus (opacity .12), line glyph on top (1.3 stroke). Keep the existing 0.9 glyph skew so objects match the originals.
- Hero products: peach boxes (fill tints #FFD2CC / #FFBCB4 / #FFAAA0, edge #E0574A, inner rhombus .35), glyph on top.
  - qLens: cube with lens glyph (as in `qlens-tech.html`)
  - qTrack: tower with route glyph (as in `qtrack-tech.html`)
  - qRx: cube, new glyph in the same line style (flag it for review)
- Small evidence cubes: 25 side, radius 3, #D9D9FF top, joined by round-cap dotted feed lines (`0 4.5` dash), as in `qlens-tech.html`.
- Upcoming items: dashed grey cubes (1.25 stroke, 3 3 dash), opacity ~.5 breathing .4–.6, dashed connectors, small peach-outlined "UPCOMING" pill.
- Connectors: 1px #303030 along isometric axes, small solid junction dots, arrowhead packets (~9px) in #303030, #2A288C or #FF7869.
- Labels: HTML elements positioned by the script, qTrack style. DM Mono overline in grey with letter-spacing ("02 / ROUTE"), DM Sans name below, thin vertical leader line ending in a dot on the object.
- Status pills ("● SCHEDULED"): white, rounded, thin border, indigo dot, DM Mono text.
- Hover-screen windows: white, rounded, thin border, header row with a grey skeleton bar and three small grey dots on the right, a divider, then skeleton content. Joined to their object by a thin grey elbow line.
- Colours: ink #303030, peach #FF7869, indigo #2A288C, lavender #D9D9FF / #F3F3FF / #A9A8E8, greys #8A8A99 / #C9C9D4 / #E6E6F0 / #ECECF2. No green anywhere. Close the loop uses indigo.
- Fonts: Aether Neue for headings, DM Sans for body, DM Mono for overlines, labels and pills.

## 4. Layout (designed at 1440 × 900)

Check every frame at 1280 × 680 and 1920 × 1080. Size the stage by viewport height, not width, so nothing overflows on short laptops. Keep all key content inside a centred safe area of about 1200 × 620.

### Frame 0 (overview)
- Heading top-left (x 70), three lines, Aether Neue, ~66px: "Transform fragmented imaging and clinical data into" in indigo, "coordinated patient care" in peach, final full stop in indigo.
- Supporting text on the right (x ~1060, width ~310), DM Sans ~16px, #303030, aligned to the heading's last line: "Every step is powered by the platform below — turning incidental findings into actionable pathways."
- Stage: x 70, y ~330, ~1300 × 487, full content width. No info panel.

### Frames 1–3 (qLens, qTrack, qRx)
- Heading top-left, two lines, indigo, Aether Neue: "Qure's AI-native platform, built to put intelligence to work."
- Stage: x 70, y ~278, ~927 × 557.
- Info panel: x ~1060, width ~312, top-aligned with the stage:
  - Peach pill with the product name (white DM Sans), followed by a DM Mono indigo overline
  - Title: uppercase, indigo, DM Sans/Aether Neue as per wireframe, ~30px
  - Body lines bottom-aligned to the stage bottom, DM Sans ~15px, #303030, ~20px gap between lines
  - Each line starts with a lead-in label ("Referral routing —"), set in indigo medium weight
  - Active line: lead-in gets a lavender #D9D9FF background highlight (radius 3, small horizontal padding). Inactive lines: no highlight, text at reduced opacity (~.55). Only the active line is highlighted.
  - "UPCOMING" tags: small peach DM Mono text after the line

## 5. Steps and exact copy

Nine states (S0–S8), eight scroll gestures.

### S0 — Overview (Frame 0)
On-stage content (titles only, no stage descriptions):
- Input hover-screen window on the far left: "INPUT" header, rows EMR / PACS / PowerScribe, elbow line to three source cubes
- Six stage labels across the floor: 01 Integrate, 02 Insights, 03 Prior auth (UPCOMING), 04 Outreach (UPCOMING), 05 Scheduling, 06 Close the loop
- qLens ("FINDS"), qTrack ("MOVES") and qRx ("TREATS") on the floor with labels, qRx next to a Specialist cube
- Output hover-screen window on the far right: "OUTPUT" header, rows: Fewer missed follow-ups / Less administrative burden / Faster connection to specialist care / Better patient outcomes, each with an indigo bullet

The floor is wider than the stage. Let it bleed past the top and bottom of the stage box (clipped, with a soft fade at the edges) so it reads as a field. Place the objects along the middle band; the two windows sit at the thin ends.

### S1–S3 — qLens
Panel: pill "qLens", overline "INSIGHT GENERATION", title "READS EVERYTHING, MISSES NOTHING".
- S1 line: "For every patient visit completed, qLens reads every medical record, document and DICOM."
  Scene: a "VISIT COMPLETED" pill appears on the floor as the trigger. Close-up of the EMR / PACS / PowerScribe source cubes, plus a thin stack of DICOM slices and a document card. Packets flow from each into the qLens hero.
- S2 line: "Pulls all prior information to generate patient context and identify care gaps, surfacing actionable findings."
  Scene: a faded row of prior records (older visits further back on the floor) is drawn into qLens. A "patient context" hover window rises with skeleton rows; one row turns peach (the care gap). A small "FINDING" pill appears.
- S3 line: "Turns them into guideline-concordant referral packets, ready to be routed."
  Scene: a referral-packet object assembles beside qLens, gets a small check mark ("guideline-concordant"), and moves toward the frame edge. qTrack sits faded at that edge. Do not add guideline evidence cubes to qLens; evidence belongs to qRx in S7.

### S4–S6 — qTrack
Panel: pill "qTrack", overline "ACTIONABLE PATHWAYS", title "TURNS REFERRALS INTO FINISHED CARE".
- S4 line: "Referral routing — missed referrals auto routed to the right specialist, packet already built."
  Scene: the referral packet from S3 arrives at the qTrack tower and is routed along a connector to the Specialist cube (calendar-check glyph).
- S5 line: "Scheduling and write-back — appointments and notes flow back into the EMR"
  Scene: a calendar hover window rises above the Specialist and one cell turns peach. A "● SCHEDULED" pill appears. A peach packet travels the write-back arc to the EMR cube. Composition: EMR, qTrack and Specialist in a diamond, as in `qtrack-tech.html` (reuse that composition).
- S6 lines (both highlighted together, one step):
  "Prior auth — auto-generated billable documentation as per payer criteria, reducing denials." UPCOMING
  "Outreach — omnichannel patient outreach" UPCOMING
  Scene: two dashed upcoming cubes fade in on a dashed side path off qTrack, each with an UPCOMING pill. One faint packet passes along the path once.

### S7–S8 — qRx (closing)
Panel: pill "qRx", overline "TREATMENT MANAGEMENT", title "GETS EVERY DIAGNOSED PATIENT THE RIGHT TREATMENT PLAN".
- S7 line: "Clinical decision support — weighs the latest evidence, guidelines and real-world drug outcomes to surface the best plan for better long-term patient outcomes."
  Scene: the camera pans the short distance from the Specialist to qRx (they sit together "at the consult"). Three small evidence cubes (EVIDENCE, GUIDELINES, REAL-WORLD OUTCOMES) feed qRx along dotted lines, in the `qlens-tech.html` evidence-cube style. A "treatment plan" hover window rises with skeleton rows; one row turns peach (the best plan) with a small citation marker.
- S8 line: "Care adherence — hands off to qTrack for follow-ups, refills, and outcome monitoring."
  Scene: a packet travels from qRx back to qTrack. A "● MONITORING" pill appears on that path. As the final beat of this same step (no extra gesture), the camera pulls back slightly so qLens → qTrack → qRx read as one connected loop. Hold. The next gesture down unpins the section.

## 6. Motion rules (apply everywhere)

The animation must never overwhelm.
- Only elements tied to the active step move. Earlier elements stay in place at reduced emphasis (~.5 opacity); nothing resets between steps.
- At most two new elements per step. Only one packet path active at a time.
- Ambient motion while waiting on a step: only the current step's packet path loops, gently. No pulsing everywhere.
- Easing: easeInOutCubic for camera and layout, easeOutCubic for element entry (copy `io` / `eo` / `seg` from the existing files). Use qLens's tempo: edge draw-in ~.55s, staggered ~.18s.
- Step transitions finish in ~0.9–1.4s.

### S0 build (on section entering the viewport)
Total ~2–2.5s: floor grid draws in (~0.5s) → objects build on top, staggered (~0.8s) → connectors draw (~0.5s) → labels and windows fade in last. Then one slow packet at a time travels the main path.

### S0 → S1 (the biggest transition), strictly sequenced
1. Heading crossfades to the second heading.
2. Stage box resizes from the frame 0 size to the frame 1 size while the camera zooms into qLens.
3. Info panel slides in last.

### Between products (S3 → S4, S6 → S7)
Camera pans along the same floor; the panel crossfades pill → overline → title → lines. No layout change.

## 7. Scroll mechanics

- Structure: a tall wrapper (one viewport-height per step) with a sticky inner container, so the native scrollbar position maps to the step index.
- Wheel / trackpad: intercept and `preventDefault` while inside the sequence. One gesture = exactly one step, however hard the flick. Lock input until the transition finishes AND no wheel event has arrived for ~150ms, so trackpad inertia never triggers a second step. Nothing is skipped and nothing queues.
- Programmatically scroll the page to the step's offset after each step, so the scrollbar stays in sync.
- Keys: ArrowDown / PageDown / Space advance one step, ArrowUp / PageUp / Shift+Space go back one, with the same lock.
- Scrollbar drag: jump straight to the step matching the scroll position (no lock).
- Direction: scrolling up steps back one at a time, in reverse, to S0.
- Entering from above re-pins at S0. Entering from below re-pins at S8 and steps backward.
- At S8, a gesture down releases the pin and native scrolling continues. At S0, a gesture up releases upward.
- If a gesture arrives during the S0 build, snap the build to its end state, then run the step.
- Pause all ambient motion when the section is off-screen or the tab is hidden.
- prefers-reduced-motion: keep the steps, but replace camera moves and builds with short crossfades between static per-step frames.
- Below 1024px wide: no pinning; show the S0 frame as a static image of the full overview. (No mobile design yet.)

## 8. Alignment

- No hardcoded screen positions. Measure the stage box and panel via data attributes and `getBoundingClientRect`; place the camera and HTML labels from those. Recompute with ResizeObserver; handle devicePixelRatio.
- `?debug=1`: draw the stage bounds, safe area, object anchors, and show the current step index and lock state.

## 9. Structure for the Claude Design handoff

- A single state machine with named steps (`overview`, `qlens-read`, `qlens-context`, `qlens-packet`, `qtrack-route`, `qtrack-schedule`, `qtrack-upcoming`, `qrx-decide`, `qrx-adhere`).
- Each step declares its camera target, which elements are active, which are dimmed, which panel content is shown, and which line is highlighted.
- Expose `goTo(stepName)` and `next()` / `prev()` internally; scroll handling only calls these. No interactions are wired to them yet.
- A config object at the top: timings, camera zoom levels, emphasis opacity, lock duration.

## 10. Process

1. Read both existing files and `platform-overview.html`. Report in under 20 lines: what you'll copy, the floor size and camera positions you plan for S0 and each product, and anything in this brief that conflicts with what's in the files.
2. Stop and wait for my go-ahead.
3. Build S0 and S1 first and stop, so I can check the overview and the biggest transition before the rest.
4. Then build S2–S8.
5. Final report: files created, anything copied, open review items (qRx glyph, any placeholder), and anything you'd change.
