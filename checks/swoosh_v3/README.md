# pov_preview_v3.html: swoosh checks

Headless Chromium on a fake clock: each shot is an exact point on the frame 1 entry timeline. Each point was also rendered swoosh-only and text-only for the measurements below. There's no GPU in this container, so the frame times are worst-case software rendering.

## Screenshots
- `1440x900-{010,025,040,055,070,085,100}`: frame 1 entry. At 10% nothing is visible yet: the head starts at x = −0.35W and first appears at about 325ms (13.5%).
- `390x844-{040,070}`, `1920x1080-{040,070}`
- `reduced-1440x900`: prefers-reduced-motion. Both frames show statically; the swoosh canvas is never drawn.

## Measurements (21 points per size, every 5% of the timeline)
| Size | Largest pixel step on the swoosh | Swoosh pixels at 0% / 100% | Text pixels ahead of the reveal edge | Peak coverage per line, worst point (overline · line 1 · line 2) |
|---|---|---|---|---|
| 360×740 | 5 | 0 / 0 | 0 | 0.30 · 0.79 · 0.34 |
| 390×844 | 4 | 0 / 0 | 0 | 0.59 · 0.77 · 0.45 |
| 1440×900 | 2 | 0 / 0 | 0 | 0.38 · 0.77 · 0.20 |
| 1920×1080 | 2 | 0 / 0 | 0 | 0.51 · 0.77 · 0.44 |
| 3440×1440 | 2 | 0 / 0 | 0 | 0.62 · 0.77 · 0.61 |

- **Largest pixel step:** the biggest difference between neighbouring pixels, out of 255. A clipped or straight edge would show tens of levels.
- **Coverage:** the swoosh's peak darkness at each line's centre over the whole sweep, as a fraction of its full-body darkness. The worst points are the ends of the wide second line, where the smile lifts the band.
- **Draws itself, doesn't slide:** at 1440, the on-screen width every 5% is 0 → 90 → 406 → 726 → 1102 → 1398 → 1440 → 1307 → 1051 → 807 → 523 → 299 → 79 → 0. At 40% the band centre follows the curve: y/H = 0.30, 0.37, 0.42, 0.45, 0.46, 0.46, 0.43, 0.38, 0.35 across the screen.
- **Rounded head (1440, 25%):** height of the dense core at 0 / 10 / 30 / 60 / 120 / 240px behind the tip is 28 / 89 / 149 / 203 / 259 / 281px. It narrows smoothly, with no square end.
- **Input lock:** 6 wheel gestures during one sweep advance exactly one frame. The lock lifts once the tail is off-screen (about 2030ms); gestures in the next 300ms are ignored, and the next one plays.
- **Console errors:** none.

## Frame times during sweeps (rAF deltas, 6 sweeps per size)
| | Average | p95 | Worst |
|---|---|---|---|
| 1440×900 | 16.9ms (59.1 fps) | 16.8ms | 33–67ms |
| 1920×1080 | 23.0ms (43.5 fps) | 33.4ms | 50ms |

At 1920 the canvas resolution makes no measurable difference (43.9 fps at 20% vs 43.5 at 25%). The remaining cost is software-compositing a full-screen layer that changes every frame, which a GPU does essentially free.
