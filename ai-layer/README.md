# AI layer graphic

Abstract background texture for qure.ai sections. Every shape snaps to one
±45° lattice built around a focus point.

```
python3 ai-layer/generate.py                 # SVGs -> output/
node ai-layer/render-previews.cjs            # review PNGs -> output/ (needs playwright)
```

All parameters (module spacing, opacities, colours, mask, focus position and
per-composition element placement) are constants at the top of `generate.py`.
Elements are placed by lattice address `(a, b)` = (offset of the +45° line,
offset of the −45° line) in modules from the focus, never by free x/y.
`generate.py` refuses an address that isn't a drawn intersection and warns
when a lattice crossing lands 0.5–10px off a circle outline (a near-miss
reads as a mistake at 100%).

| File | Use |
| --- | --- |
| `ai-layer-light.svg` | white/light sections, focus lower-left |
| `ai-layer-dark.svg` | Bold Indigo sections, focus lower-left |
| `ai-layer-light-alt.svg` | light, focus upper-right |
| `ai-layer-dark-alt.svg` | dark, focus upper-right |

Strokes use `vector-effect="non-scaling-stroke"` so lines stay 1px at any
rendered size.
