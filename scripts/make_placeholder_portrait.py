#!/usr/bin/env python3
"""
Draws a STAND-IN grayscale portrait (3 overlapping head-and-shoulder
silhouettes on white) so cube_halftone.py can be developed and tuned
before the real assets/source-portrait.png exists.

It is deliberately photographic-ish: hair darker than skin, side lighting,
eye sockets / brows / nose shadow / mouth, so "do faces read?" is a real
test. It is NOT a brand asset. Replace with the real portrait.

    python3 scripts/make_placeholder_portrait.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
SS = 2  # supersample
OUT = Path(__file__).resolve().parent.parent / "assets" / "placeholder-portrait.png"


def person(img, cx, cy, hs, clothes, skin, hair, light_dir):
    """cx, cy = head centre, hs = head half-height (px, pre-supersample)."""
    cx, cy, hs = cx * SS, cy * SS, hs * SS
    d = ImageDraw.Draw(img)

    def ell(x, y, rx, ry, tone):
        d.ellipse([x - rx, y - ry, x + rx, y + ry], fill=tone)

    # torso / shoulders
    ell(cx, cy + 2.55 * hs, 1.85 * hs, 1.45 * hs, clothes)
    # collar (slightly lighter V)
    d.polygon([(cx - .42 * hs, cy + 1.25 * hs), (cx + .42 * hs, cy + 1.25 * hs),
               (cx, cy + 1.95 * hs)], fill=min(255, clothes + 35))
    # neck
    d.rectangle([cx - .33 * hs, cy + .55 * hs, cx + .33 * hs, cy + 1.45 * hs], fill=skin - 22)
    # hair mass, then face
    ell(cx, cy - .14 * hs, .86 * hs, 1.06 * hs, hair)
    ell(cx + .02 * hs, cy + .1 * hs, .69 * hs, .9 * hs, skin)
    # ears
    ell(cx - .69 * hs, cy + .12 * hs, .1 * hs, .18 * hs, skin - 12)
    ell(cx + .71 * hs, cy + .12 * hs, .1 * hs, .18 * hs, skin - 12)
    # brows, eye sockets, eyes
    for sx in (-1, 1):
        ex = cx + sx * .29 * hs
        ell(ex, cy - .02 * hs, .17 * hs, .1 * hs, skin - 45)       # socket shadow
        ell(ex, cy + .0 * hs, .1 * hs, .045 * hs, 45)              # eye
        d.rounded_rectangle([ex - .18 * hs, cy - .2 * hs, ex + .18 * hs, cy - .14 * hs],
                            radius=.03 * hs, fill=hair + 10)       # brow
    # nose: shadow on the side away from light + nostril line
    nx = cx - light_dir * .06 * hs
    d.polygon([(cx, cy + .02 * hs), (nx, cy + .38 * hs), (cx, cy + .42 * hs)], fill=skin - 38)
    ell(cx, cy + .42 * hs, .13 * hs, .035 * hs, skin - 50)
    # mouth
    ell(cx, cy + .6 * hs, .2 * hs, .045 * hs, skin - 60)
    ell(cx, cy + .66 * hs, .14 * hs, .03 * hs, skin - 25)


def main():
    img = Image.new("L", (W * SS, H * SS), 255)
    # back row first, front last (overlap)
    person(img, 470, 400, 120, clothes=110, skin=175, hair=70, light_dir=1)
    person(img, 1135, 385, 118, clothes=135, skin=185, hair=95, light_dir=-1)
    person(img, 805, 470, 140, clothes=58, skin=165, hair=40, light_dir=1)
    img = img.resize((W, H), Image.LANCZOS)

    # side lighting: darken each figure gently towards the right of the canvas
    a = np.asarray(img).astype(np.float32)
    fg = a < 250
    x = np.linspace(0, 1, W)[None, :]
    shade = 1 - .14 * np.clip((x - .25) / .75, 0, 1)
    a = np.where(fg, a * shade, a)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, optimize=True)
    print(f"wrote {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
