# pov_preview.html: checks

Headless Chromium on a fake clock: each shot is an exact point on the sweep-1 timeline (0 → frame 1). There's no GPU in this container, so frame times below are worst-case software compositing.

**What the columns mean**
- **Largest pixel step on ribbon:** measured on a ribbon-only render, between neighbouring pixels. A clipped or sliced edge would jump tens of levels. Values of 4 or under are the blur plus the faint fibres.
- **Ribbon pixels:** 0 means no ribbon anywhere on screen.
- **Text pixels ahead of ribbon:** measured on a text-only render. It counts text pixels further along than the point where the ribbon's dense core covers that text line.

| Capture | Largest pixel step on ribbon | Ribbon pixels | Text pixels ahead of ribbon |
|---|---|---|---|
| 360x740-000 | 0 | 0 | 0 |
| 360x740-100 | 0 | 0 | 0 |
| 390x844-000 | 0 | 0 | 0 |
| 390x844-050 | 4 | 104440 | 0 |
| 390x844-100 | 0 | 0 | 0 |
| 1440x900-000 | 0 | 0 | 0 |
| 1440x900-015 | 2 | 11963 | 0 |
| 1440x900-035 | 4 | 876005 | 0 |
| 1440x900-050 | 4 | 422775 | 0 |
| 1440x900-065 | 2 | 52127 | 0 |
| 1440x900-085 | 0 | 0 | 0 |
| 1440x900-100 | 0 | 0 | 0 |
| 1920x1080-000 | 0 | 0 | 0 |
| 1920x1080-050 | 3 | 692236 | 0 |
| 1920x1080-100 | 0 | 0 | 0 |
| 3440x1440-000 | 0 | 0 | 0 |
| 3440x1440-100 | 0 | 0 | 0 |

**Other checks**
- Console errors: none at any size.
- `reduced-1440x900.png`: with prefers-reduced-motion, both frames are static, the ribbon is never rasterised and the line art doesn't move.
- Input lock: 6 wheel gestures during one sweep advance exactly one frame. Gestures within 300ms after the ribbon exits are ignored, and the next gesture plays.

**Frame times during sweeps** (rAF deltas, 6 sweeps per size)
| | Average | Worst | Frames over 20ms |
|---|---|---|---|
| 1440×900 | 16.8ms (59.4 fps) | 50.1ms | 6 of 857 |
| 1920×1080 | 18.8ms (53.3 fps) | 50.1ms | 93 of 768 |

With the ribbon hidden, the same page holds 60.0 fps at both sizes. The remaining cost is software-compositing the ribbon layer.

**Timing note.** With the specified cubic-bezier(0.45, 0, 0.25, 1), 50% of the time is 72% of the travel. So the 50% shots show only the fading tail, and the ribbon's body covers the screen centre for about 470ms. To compare a flatter curve, open `pov_preview.html?ease=0.3,0.15,0.7,0.85` (about 950ms over the centre at the same 2400ms). `&dur=` overrides the duration.
