# us_home_v2 — "Our point of view" verification

Headless Chromium (Playwright, software rendering, no GPU). Sweep frames were captured on a fake clock, so each shot is an exact timeline point.

## Screenshots
- `1440-f1-{000,025,050,075,100}`: frame 1 sweep-and-unveil. `-060-mid` shows the mask edge mid-reveal.
- `1440-f1to2-*`: frame 1 → frame 2. `1440-f2to1-*`: reverse. `1440-f1out-*`: the right-to-left hide above frame 1, before the pin releases upward.
- `390-m-f1-*`, `390-m-f2-*`: mobile (≤1023, unpinned). Each frame sweeps once on scroll-in (1200ms).
- `2560-f1-{000,100}`, `3440-f1-{000,100}`: the swoosh is fully off-screen at both ends.
- `reduced-{1440,390}`: prefers-reduced-motion. Static text and static line art, no swoosh.

The easing is cubic-bezier(0.65, 0, 0.35, 1), so at 25% and 75% the band is mostly still off-screen. The visible reveal happens between about 45% and 70%.

## Checks
| Check | Result |
|---|---|
| Swoosh pixels at 0% and 100% (1440, 1920, 2560, 3440) | 0 (a line-art tint fades back over 0.7s after the sweep) |
| Console errors (desktop, mobile, reduced) | none |
| Footer pill band | animating; `qurePovBand` / `QURE_POV_ROWS` gone |
| Line-art motion when section off-screen | paused |
| Other sections vs v1 @1440 (11 sections, marquees/pill canvas frozen, carousels pinned) | pixel-identical |
| Other sections vs v1 @390 | identical except ≤4-level AA noise under the translucent sticky header (its backdrop blur samples the POV section) and one button stroke (≤21 levels, a few px). Section heights identical. |

## Frame times during sweeps (rAF deltas, 3 sweeps each)
| | v2 avg | v2 worst | v1 transition, same window |
|---|---|---|---|
| 1440×900 | 18.7–21.7 ms (46–53 fps) | 50–200 ms | 16.7 ms (60 fps) |
| 1920×1080 | 26–28 ms (36–38 fps) | 83–117 ms | 18.0 ms (56 fps) |

Isolation runs: dropping the masks or the line art changes nothing measurable. A translate-only swoosh (no rotate/scaleY) reaches 59 fps at 1440 and 46 fps at 1920. The cost is software-compositing a rotated, alpha-blended full-viewport layer, which a GPU compositor does for close to nothing. These numbers do not show 60 fps on real hardware. Verify on a real browser before shipping.
