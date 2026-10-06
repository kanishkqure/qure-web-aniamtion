#!/usr/bin/env python3
"""
qure.ai "AI layer" background graphic generator.

Every element is derived from ONE diagonal lattice:
  "+45" lines rise to the right:  x + y = u   (u-lines)
  "-45" lines fall to the right:  x - y = v   (v-lines)

The lattice is built around (FOCUS_X, FOCUS_Y): the u-line and v-line at
offset 0 cross exactly there. Every other line sits at an integer number of
MODULEs from the focus, so every intersection, capsule end, circle centre and
marker is addressed as (a, b) = (u-offset, v-offset) in modules and resolved
to viewBox coordinates by `node(a, b)`. Nothing takes a free x/y.

Conversions (M = MODULE, in u/v units):
  node(a, b)            = (FOCUS_X + (a + b) * M/2,  FOCUS_Y + (a - b) * M/2)
  distance between two parallel lattice lines n modules apart = n * M / sqrt(2)

Run:  python3 ai-layer/generate.py           -> writes SVGs to OUTPUT_DIR
      node ai-layer/render-previews.cjs      -> writes preview PNGs (needs playwright)
"""

import math
import os

# ----------------------------------------------------------------------------
# Canvas / output
# ----------------------------------------------------------------------------
VIEW_W, VIEW_H = 1600, 1000
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "output")

# ----------------------------------------------------------------------------
# Lattice
# ----------------------------------------------------------------------------
# One module in u/v units. MODULE/2 must be an integer so every node lands on
# whole viewBox units. Perpendicular spacing per module = MODULE / sqrt(2).
MODULE = 56                       # -> 39.6px between adjacent lattice lines
UNIT = MODULE / math.sqrt(2)      # perpendicular distance of one module

LINE_WIDTH = 1                    # lattice, capsule outline, construction circles
FOCUS_RING_WIDTH = 1.5
MARKER_RING_R = 3                 # open ring marker radius (6px diameter)
MARKER_TICK = 4                   # half-length of a "+" tick arm

# ----------------------------------------------------------------------------
# Edge fade (soft radial mask). Centre is pulled from canvas centre toward the
# focus by MASK_BIAS so the hero is never dimmed; radii in canvas fractions.
# ----------------------------------------------------------------------------
MASK_BIAS = 0.45
MASK_R = 0.62
MASK_STOPS = [(0.0, 1.0), (0.38, 1.0), (0.62, 0.55), (0.82, 0.12), (1.0, 0.0)]

# ----------------------------------------------------------------------------
# Brand palette (the only colours allowed)
# ----------------------------------------------------------------------------
INDIGO = "#2A288C"    # Bold Indigo
LAVENDER = "#D9D9FF"  # Ambitious Lavender
PEACH = "#FF7869"     # Qure Peach (accent only)
WHITE = "#FFFFFF"

COLORWAYS = {
    "light": {
        "line": INDIGO,
        "line_opacity": 0.13,           # lattice
        "outline_opacity": 0.16,        # capsule outline, construction circles
        "fill": LAVENDER,
        "capsule_grad_opacity": 0.40,   # gradient capsule, opaque end
        "capsule_faint_opacity": 0.22,
        "lens_opacity": 0.40,
        "focus_fill_opacity": (0.20, 0.30, 0.40),   # outer -> inner disc
        "focus_ring": INDIGO,
        "focus_ring_opacity": 0.45,
        "marker_opacity": 0.32,
        "accent_opacity": 0.85,
        "preview_bg": WHITE,
    },
    "dark": {
        "line": LAVENDER,
        "line_opacity": 0.20,
        "outline_opacity": 0.26,
        "fill": LAVENDER,
        "capsule_grad_opacity": 0.18,
        "capsule_faint_opacity": 0.08,
        "lens_opacity": 0.16,
        "focus_fill_opacity": (0.08, 0.12, 0.18),
        "focus_ring": WHITE,
        "focus_ring_opacity": 0.70,
        "marker_opacity": 0.40,
        "accent_opacity": 0.90,
        "preview_bg": INDIGO,
    },
}

# ----------------------------------------------------------------------------
# Compositions. All geometry is expressed in lattice offsets (modules).
#   u_lines / v_lines : offsets of the drawn lines. Spacing grows in Fibonacci
#                       steps away from the focus, so the mesh tightens toward it.
#   capsules          : axis on u-line `a`, rounded-end centres on v-lines b0..b1,
#                       half-width in modules (w=1 -> edges ride the a±1 lines),
#                       optional 7th value scales the fill opacity.
#   circles           : centre node + radius rule:
#                         ("tangent_capsule", name) -> touches that capsule's edge
#                         ("tangent_line", n)       -> touches the lattice lines n
#                                                      modules away (r = n*UNIT)
#   lens              : soft gradient disc, centre node + radius in modules.
#   markers           : (a, b, kind) with kind "ring" | "tick"; accent marker
#                       is drawn in peach (max one).
# ----------------------------------------------------------------------------
COMPOSITIONS = {
    "default": {
        "FOCUS_X": 520, "FOCUS_Y": 660,          # lower-left third
        "u_lines": [-8, -5, 0, 3, 8, 13],
        "v_lines": [-5, -2, 0, 2, 5, 8, 13, 21],
        "capsules": [
            # name, kind, axis a, b0, b1, half-width (modules)
            ("beam", "gradient", 0, 0, 13, 1),
            ("trace", "outline", 3, -2, 8, 0.5),
        ],
        "focus_rings": (1, 2, 3),                # disc radii in modules
        "focus_ring": 3,                         # crisp ring radius (modules)
        "circles": [
            ("arc-upper", -8, 13, ("tangent_capsule", "beam")),
            ("arc-lower", 13, 2, ("tangent_capsule", "trace")),
        ],
        "lens": ("lens", 3, 8, 3),
        "markers": [
            (3, -2, "ring"), (3, 8, "ring"),      # trace end centres
            (8, 13, "ring"),                      # quiet anchor toward the empty side
            (13, 2, "tick"),                      # arc-lower centre
            (8, -2, "tick"),
            (-5, -5, "tick"),
        ],
        "accent_marker": (0, 13, "tick"),          # far end of the beam
    },
    "alt": {
        "FOCUS_X": 1080, "FOCUS_Y": 340,         # upper-right third
        "u_lines": [-13, -8, -5, -1, 0, 3, 5, 13],
        "v_lines": [-21, -13, -8, -5, -2, 0, 5, 8],
        "capsules": [
            # beam sits beside the focus: its edge is tangent to the crisp ring
            ("beam", "gradient", 5, 0, -13, 2, 0.7),  # opaque at b0; wide, so softer
            ("trace", "outline", -5, -8, -21, 0.5),
        ],
        "focus_rings": (1, 2, 3),
        "focus_ring": 3,
        "circles": [
            ("arc-lower", 13, -5, ("tangent_capsule", "beam")),
            ("arc-left", -13, -13, ("tangent_capsule", "trace")),
        ],
        "lens": ("lens", -5, -8, 3),            # over the trace's upper end
        "markers": [
            (-5, -8, "ring"), (-5, -21, "ring"),  # trace end centres
            (13, -5, "tick"),                     # arc-lower centre
            (-13, -13, "tick"),                   # arc-left centre
            (-1, 5, "ring"),
            (0, -21, "tick"),
        ],
        "accent_marker": (5, 0, "tick"),           # beam origin, beside the focus
    },
}


# ----------------------------------------------------------------------------
# Geometry helpers
# ----------------------------------------------------------------------------
def fmt(n):
    s = f"{n:.2f}".rstrip("0").rstrip(".")
    return "0" if s == "-0" else s


class Lattice:
    def __init__(self, comp):
        self.fx, self.fy = comp["FOCUS_X"], comp["FOCUS_Y"]
        self.u0 = self.fx + self.fy
        self.v0 = self.fx - self.fy
        self.u_lines = sorted(comp["u_lines"])
        self.v_lines = sorted(comp["v_lines"])
        assert 0 in self.u_lines and 0 in self.v_lines, "focus lines missing"
        assert 6 <= len(self.u_lines) <= 9 and 6 <= len(self.v_lines) <= 9

    def node(self, a, b):
        self.check(a, b)
        return (self.fx + (a + b) * MODULE / 2, self.fy + (a - b) * MODULE / 2)

    def check(self, a, b):
        if a not in self.u_lines or b not in self.v_lines:
            raise ValueError(f"({a},{b}) is not a lattice intersection")

    def u_segment(self, a):
        """Clip line x + y = u to the canvas."""
        u = self.u0 + a * MODULE
        pts = []
        for x in (0, VIEW_W):
            y = u - x
            if 0 <= y <= VIEW_H:
                pts.append((x, y))
        for y in (0, VIEW_H):
            x = u - y
            if 0 < x < VIEW_W:
                pts.append((x, y))
        return sorted(set(pts))[:2] if len(pts) >= 2 else None

    def v_segment(self, b):
        v = self.v0 + b * MODULE
        pts = []
        for x in (0, VIEW_W):
            y = x - v
            if 0 <= y <= VIEW_H:
                pts.append((x, y))
        for y in (0, VIEW_H):
            x = v + y
            if 0 < x < VIEW_W:
                pts.append((x, y))
        return sorted(set(pts))[:2] if len(pts) >= 2 else None


def in_canvas(p, margin=0):
    return -margin <= p[0] <= VIEW_W + margin and -margin <= p[1] <= VIEW_H + margin


# ----------------------------------------------------------------------------
# SVG builder
# ----------------------------------------------------------------------------
def build(variant, comp_name, out_name):
    c = COLORWAYS[variant]
    comp = COMPOSITIONS[comp_name]
    L = Lattice(comp)
    pid = out_name.replace(".svg", "")          # prefix for defs ids
    nse = ' vector-effect="non-scaling-stroke"'
    report = {"file": out_name, "focus": (L.fx, L.fy), "markers": [], "notes": []}

    defs, g = [], {k: [] for k in ("capsules", "circles", "lattice", "focus", "markers", "accent")}

    # --- edge fade mask ------------------------------------------------------
    mcx = 0.5 + (L.fx / VIEW_W - 0.5) * MASK_BIAS
    mcy = 0.5 + (L.fy / VIEW_H - 0.5) * MASK_BIAS
    stops = "".join(
        f'<stop offset="{fmt(o)}" stop-color="#FFFFFF" stop-opacity="{fmt(a)}"/>' for o, a in MASK_STOPS
    )
    defs.append(
        f'<radialGradient id="{pid}-fade-g" cx="{fmt(mcx)}" cy="{fmt(mcy)}" r="{fmt(MASK_R)}">{stops}</radialGradient>'
    )
    defs.append(
        f'<mask id="{pid}-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="{VIEW_W}" height="{VIEW_H}">'
        f'<rect width="{VIEW_W}" height="{VIEW_H}" fill="url(#{pid}-fade-g)"/></mask>'
    )

    # --- lattice ---------------------------------------------------------------
    for a in L.u_lines:
        seg = L.u_segment(a)
        if seg:
            (x1, y1), (x2, y2) = seg
            g["lattice"].append(
                f'<line id="u{a}" x1="{fmt(x1)}" y1="{fmt(y1)}" x2="{fmt(x2)}" y2="{fmt(y2)}"{nse}/>'
            )
    for b in L.v_lines:
        seg = L.v_segment(b)
        if seg:
            (x1, y1), (x2, y2) = seg
            g["lattice"].append(
                f'<line id="v{b}" x1="{fmt(x1)}" y1="{fmt(y1)}" x2="{fmt(x2)}" y2="{fmt(y2)}"{nse}/>'
            )

    # --- capsules (rounded rects rotated onto the +45 axis) --------------------
    capsule_geo = {}
    for name, kind, a, b0, b1, w, *opt in comp["capsules"]:
        k = opt[0] if opt else 1.0
        p0, p1 = L.node(a, b0), L.node(a, b1)
        hw = w * UNIT
        length = abs(b1 - b0) * UNIT
        cx, cy = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        capsule_geo[name] = (a, b0, b1, w)
        rect = (
            f'x="{fmt(cx - length / 2 - hw)}" y="{fmt(cy - hw)}" '
            f'width="{fmt(length + 2 * hw)}" height="{fmt(2 * hw)}" rx="{fmt(hw)}" '
            f'transform="rotate(-45 {fmt(cx)} {fmt(cy)})"'
        )
        # b increases toward upper-right and the local +x of rotate(-45) points
        # upper-right, so the opaque stop goes on whichever end is b0.
        if kind == "gradient":
            gx1, gx2 = ("0", "1") if b0 < b1 else ("1", "0")
            defs.append(
                f'<linearGradient id="{pid}-{name}-g" x1="{gx1}" y1="0" x2="{gx2}" y2="0">'
                f'<stop offset="0" stop-color="{c["fill"]}" stop-opacity="{fmt(c["capsule_grad_opacity"] * k)}"/>'
                f'<stop offset="0.55" stop-color="{c["fill"]}" stop-opacity="{fmt(c["capsule_grad_opacity"] * k * 0.35)}"/>'
                f'<stop offset="1" stop-color="{c["fill"]}" stop-opacity="0"/>'
                f"</linearGradient>"
            )
            g["capsules"].append(f'<rect id="{name}" {rect} fill="url(#{pid}-{name}-g)"/>')
        elif kind == "outline":
            g["capsules"].append(
                f'<rect id="{name}" {rect} fill="none" stroke="{c["line"]}" '
                f'stroke-opacity="{fmt(c["outline_opacity"])}" stroke-width="{LINE_WIDTH}"{nse}/>'
            )
        else:
            g["capsules"].append(
                f'<rect id="{name}" {rect} fill="{c["fill"]}" fill-opacity="{fmt(c["capsule_faint_opacity"] * k)}"/>'
            )

    # --- soft lens -------------------------------------------------------------
    lname, la, lb, lr = comp["lens"]
    lx, ly = L.node(la, lb)
    defs.append(
        f'<linearGradient id="{pid}-lens-g" x1="0.15" y1="0.15" x2="0.85" y2="0.85">'
        f'<stop offset="0" stop-color="{c["fill"]}" stop-opacity="{fmt(c["lens_opacity"])}"/>'
        f'<stop offset="1" stop-color="{c["fill"]}" stop-opacity="0"/></linearGradient>'
    )
    g["circles"].append(
        f'<circle id="{lname}" cx="{fmt(lx)}" cy="{fmt(ly)}" r="{fmt(lr * UNIT)}" fill="url(#{pid}-lens-g)" stroke="none"/>'
    )

    # --- construction circles --------------------------------------------------
    outlines = []
    for name, a, b, (rule, arg) in comp["circles"]:
        x, y = L.node(a, b)
        if rule == "tangent_capsule":
            ca, cb0, cb1, cw = capsule_geo[arg]
            assert min(cb0, cb1) <= b <= max(cb0, cb1), "tangent point must be on the straight edge"
            r = (abs(a - ca) - cw) * UNIT
            report["notes"].append(
                f"{name}: centre ({fmt(x)},{fmt(y)}) r={fmt(r)} tangent to '{arg}' edge at "
                f"({fmt(L.fx + (ca + (cw if a > ca else -cw) + b) * MODULE / 2)},"
                f"{fmt(L.fy + (ca + (cw if a > ca else -cw) - b) * MODULE / 2)})"
            )
        else:
            r = arg * UNIT
            report["notes"].append(f"{name}: centre ({fmt(x)},{fmt(y)}) r={fmt(r)} tangent to lattice lines {arg} modules away")
        outlines.append((name, x, y, r))
        g["circles"].append(
            f'<circle id="{name}" cx="{fmt(x)}" cy="{fmt(y)}" r="{fmt(r)}" fill="none"{nse}/>'
        )

    # --- focus -----------------------------------------------------------------
    fr = sorted(comp["focus_rings"], reverse=True)
    for n, op in zip(fr, c["focus_fill_opacity"]):
        g["focus"].append(
            f'<circle id="focus-disc-{n}" cx="{fmt(L.fx)}" cy="{fmt(L.fy)}" r="{fmt(n * UNIT)}" '
            f'fill="{c["fill"]}" fill-opacity="{fmt(op)}"/>'
        )
    g["focus"].append(
        f'<circle id="focus-ring" cx="{fmt(L.fx)}" cy="{fmt(L.fy)}" r="{fmt(comp["focus_ring"] * UNIT)}" '
        f'fill="none" stroke="{c["focus_ring"]}" stroke-opacity="{fmt(c["focus_ring_opacity"])}" '
        f'stroke-width="{FOCUS_RING_WIDTH}"{nse}/>'
    )
    # innermost ring in peach
    g["accent"].append(
        f'<circle id="focus-core" cx="{fmt(L.fx)}" cy="{fmt(L.fy)}" r="{fmt(min(fr) * UNIT)}" '
        f'fill="none" stroke="{PEACH}" stroke-opacity="{fmt(c["accent_opacity"])}" '
        f'stroke-width="{LINE_WIDTH}"{nse}/>'
    )

    # --- markers ---------------------------------------------------------------
    def marker(a, b, kind, idx):
        x, y = L.node(a, b)
        assert in_canvas((x, y), -8), f"marker ({a},{b}) off canvas"
        report["markers"].append((a, b, kind, fmt(x), fmt(y)))
        if kind == "ring":
            return f'<circle id="m{idx}" cx="{fmt(x)}" cy="{fmt(y)}" r="{MARKER_RING_R}" fill="none"{nse}/>'
        t = MARKER_TICK
        return (
            f'<path id="m{idx}" d="M{fmt(x - t)} {fmt(y)}H{fmt(x + t)}M{fmt(x)} {fmt(y - t)}V{fmt(y + t)}" fill="none"{nse}/>'
        )

    for i, (a, b, kind) in enumerate(comp["markers"], 1):
        g["markers"].append(marker(a, b, kind, i))
    if comp.get("accent_marker"):
        a, b, kind = comp["accent_marker"]
        el = marker(a, b, kind, "accent")
        report["markers"][-1] = report["markers"][-1] + ("peach",)
        g["accent"].append(el)

    # --- precision lint ----------------------------------------------------------
    # A point that almost (but not exactly) sits on an outline reads as a
    # mistake. Flag any lattice intersection 0.5-10px off a circle outline,
    # and any marker within 10px of one.
    outlines.append(("focus-ring", L.fx, L.fy, comp["focus_ring"] * UNIT))
    for a in L.u_lines:
        for b in L.v_lines:
            px, py = L.node(a, b)
            if not in_canvas((px, py)):
                continue
            for name, cx, cy, r in outlines:
                d = abs(math.hypot(px - cx, py - cy) - r)
                is_marker = any(m[0] == a and m[1] == b for m in report["markers"])
                if 0.5 < d < 10 or (is_marker and d < 10):
                    report["notes"].append(f"WARN near-miss: node ({a},{b}) is {d:.1f}px off {name}")

    # --- assemble --------------------------------------------------------------
    lc, lo = c["line"], c["line_opacity"]
    groups = [
        f'<g id="capsules">{"".join(g["capsules"])}</g>',
        f'<g id="circles" stroke="{lc}" stroke-opacity="{fmt(c["outline_opacity"])}" stroke-width="{LINE_WIDTH}">'
        f'{"".join(g["circles"])}</g>',
        f'<g id="lattice" stroke="{lc}" stroke-opacity="{fmt(lo)}" stroke-width="{LINE_WIDTH}">'
        f'{"".join(g["lattice"])}</g>',
        f'<g id="focus">{"".join(g["focus"])}</g>',
        f'<g id="markers" stroke="{lc}" stroke-opacity="{fmt(c["marker_opacity"])}" stroke-width="{LINE_WIDTH}">'
        f'{"".join(g["markers"])}</g>',
        f'<g id="accent" stroke="{PEACH}" stroke-opacity="{fmt(c["accent_opacity"])}" stroke-width="{LINE_WIDTH}">'
        f'{"".join(g["accent"])}</g>',
    ]
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW_W} {VIEW_H}" '
        'fill="none">\n'
        f'<title>qure.ai AI layer ({variant})</title>\n'
        f'<defs>{"".join(defs)}</defs>\n'
        f'<g id="ai-layer" mask="url(#{pid}-fade)">\n' + "\n".join(groups) + "\n</g>\n</svg>\n"
    )
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, out_name)
    with open(path, "w") as f:
        f.write(svg)
    report["bytes"] = os.path.getsize(path)
    return report


BUILDS = [
    ("light", "default", "ai-layer-light.svg"),
    ("dark", "default", "ai-layer-dark.svg"),
    ("light", "alt", "ai-layer-light-alt.svg"),
    ("dark", "alt", "ai-layer-dark-alt.svg"),
]

if __name__ == "__main__":
    for variant, comp, name in BUILDS:
        r = build(variant, comp, name)
        print(f"{r['file']}  {r['bytes']} bytes  focus={r['focus']}")
        for m in r["markers"]:
            print("   marker", m)
        for n in r["notes"]:
            print("   ", n)
