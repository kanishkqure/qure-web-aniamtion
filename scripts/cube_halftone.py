#!/usr/bin/env python3
"""
Isometric cube halftone — qure.ai brand graphic generator.

Renders a grayscale portrait as a halftone screen in which every dot is a
small flat isometric cube sitting on a fine isometric floor grid.
Tone comes ONLY from cube size (6 stepped levels); face shading is kept
deliberately low-contrast.

    python3 scripts/cube_halftone.py

Inputs : assets/source-portrait.png   (falls back to assets/placeholder-portrait.png)
Outputs: output/cube-halftone.svg      (layers: background, grid, cubes, accents)
         output/cube-halftone@2x.png   (rendered from the SVG by headless Chromium)

Requires: Python 3, Pillow, numpy; Chromium for the PNG
(set CHROME_BIN; otherwise Playwright's headless shell / Chromium under
/opt/pw-browsers, then chromium / google-chrome on PATH, then macOS Chrome).
"""
import glob
import math
import os
import random
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

# =============================================================================
# TUNABLE PARAMETERS
# =============================================================================
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "source-portrait.png"
SOURCE_FALLBACK = ROOT / "assets" / "placeholder-portrait.png"
OUT_SVG = ROOT / "output" / "cube-halftone.svg"
OUT_PNG = ROOT / "output" / "cube-halftone@2x.png"
PNG_SCALE = 2

SEED = 7                       # all randomness (dissolve, dither, accents)

# --- canvas & image placement -------------------------------------------------
CANVAS_W, CANVAS_H = 1600, 1000
BACKGROUND = "#FFFFFF"          # None -> transparent SVG/PNG background
IMAGE_FIT = "contain"           # "contain" | "cover"
IMAGE_SCALE = 1.0               # extra zoom on top of the fit
IMAGE_OFFSET = (0.0, 0.0)       # shift in canvas px after fitting
SOURCE_BLACK, SOURCE_WHITE = 0.0, 1.0   # input levels (0..1 luminance)

# --- isometric grid -------------------------------------------------------------
# True isometric (30°), same projection as qlens-tech.html. Not meant to be changed:
# the merged-layer occlusion handling below is derived for 30°.
ISO_ANGLE_DEG = 30.0
CELL = 10.0                     # grid edge length along an iso axis (px @1x)
GRID_COLOR = "#D9D9FF"          # Ambitious Lavender
GRID_OPACITY = 0.45
GRID_WIDTH = 1.0
GRID_FADE_INNER = 0.55          # radial fade: full opacity inside this radius…
GRID_FADE_OUTER = 1.02          # …to 0 at this radius (1 = canvas half-diagonal ellipse)

# --- halftone mapping ----------------------------------------------------------
SAMPLE_BLUR = 0.55              # gaussian sigma, in cells (anti-alias the sampling)
SAMPLE_OFFSET_Y = 0.35          # sample above the node by this many cells (cube mass sits above its base)
GAMMA = 1.6                     # >1 keeps mid-tones light; only the darkest reach big cubes
LEVEL_SIZES = [0.0, 0.15, 0.30, 0.45, 0.60, 0.75]   # cube edge / CELL per level (max 0.75, see build())
LEVEL_THRESHOLDS = [0.10, 0.24, 0.40, 0.56, 0.72]   # darkness (after gamma) to enter level 1..5
DITHER = 0.05                   # ± ordered (4×4 Bayer, on the lattice) threshold offset; turns hard
                                # level contours into a regular screen pattern instead of banding

# --- cube faces (low contrast: tone reads from size, not shading) ---------------
TOP_COLOR = "#B9B8EE"
LEFT_COLOR = "#9896DD"
RIGHT_COLOR = "#7C7ACC"
CORNER_RADIUS = 0.5             # px; tiny vertex rounding, no outlines
ROUND_MIN_EDGE = 3.5            # px; smaller cubes skip rounding (invisible at that size, saves SVG bytes)

# --- accents ---------------------------------------------------------------------
ACCENT_COLOR = "#FF7869"        # Qure Peach, top face only
ACCENT_LEVELS = (4, 5)          # which size levels count as "the largest cubes"
ACCENT_FRACTION = 0.02          # share of those cubes that get a peach top
ACCENT_MIN_DIST = 6.0           # cells between accents (keeps them sparse)
ACCENT_DETAIL_SIGMA = 2.0       # cells; window for local-detail (std-dev) measure
ACCENT_DETAIL_MAX = 0.10        # no accent where local luminance std-dev exceeds this (facial features, edges)
ACCENT_EXCLUDE_ZONES = []       # extra no-accent ellipses, normalised canvas coords: (cx, cy, rx, ry)

# --- edge dissolve -------------------------------------------------------------------
FG_THRESHOLD = 0.05             # darkness that counts as "figure" for the silhouette mask
FG_CLOSE = 2.0                  # cells; morphological close of that mask so small highlights (skin, eyes) stay "figure"
EDGE_SIGMA = 3.5                # cells; width of the silhouette edge zone (inside and outside)
EDGE_HALO = 1.0                 # outside the silhouette, blurred tone leaks out at this gain -> stray small cubes
EDGE_SHRINK = 0.45              # tone multiplier right at the silhouette edge (ramps to 1 inside)
DISSOLVE_BELOW = 0.45           # only cubes lighter than this (gamma-darkness) may be skipped
DISSOLVE_STRENGTH = 0.92        # max skip probability at/outside the silhouette edge

# --- canvas-edge fade (composition) ----------------------------------------------------
EDGE_FADE = 0.22                # fraction of canvas width/height over which cubes fade out
EDGE_FADE_DISSOLVE = 0.9        # max random skipping at the canvas edge (any tone), ramps in smoothly

# =============================================================================

TAN = math.tan(math.radians(ISO_ANGLE_DEG))
COS = math.cos(math.radians(ISO_ANGLE_DEG))
SIN = math.sin(math.radians(ISO_ANGLE_DEG))


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


# ----------------------------------------------------------------------------- image
def load_luminance():
    src = SOURCE if SOURCE.exists() else SOURCE_FALLBACK
    if src != SOURCE:
        print(f"!! {SOURCE.relative_to(ROOT)} not found — using STAND-IN {src.relative_to(ROOT)}", file=sys.stderr)
    im = Image.open(src)
    if im.mode in ("RGBA", "LA"):                     # flatten transparency onto white
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(bg, im.convert("RGBA"))
    im = im.convert("L")
    sw, sh = im.size
    k = (min if IMAGE_FIT == "contain" else max)(CANVAS_W / sw, CANVAS_H / sh) * IMAGE_SCALE
    nw, nh = round(sw * k), round(sh * k)
    im = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("L", (CANVAS_W, CANVAS_H), 255)
    canvas.paste(im, (round((CANVAS_W - nw) / 2 + IMAGE_OFFSET[0]), round((CANVAS_H - nh) / 2 + IMAGE_OFFSET[1])))
    return canvas, src


def blur(arr, sigma_px):
    """Separable gaussian on a float array (edge-replicated)."""
    rad = max(1, int(math.ceil(3 * sigma_px)))
    k = np.exp(-0.5 * (np.arange(-rad, rad + 1) / sigma_px) ** 2)
    k /= k.sum()
    out = np.pad(arr.astype(np.float32), rad, mode="edge")
    out = np.apply_along_axis(lambda r: np.convolve(r, k, mode="valid"), 1, out)
    out = np.apply_along_axis(lambda c: np.convolve(c, k, mode="valid"), 0, out)
    return out.astype(np.float32)


def silhouette_mask(dark):
    """Binary figure mask, closed (dilate then erode) at quarter resolution so it does not grow."""
    q = 4
    im = Image.fromarray(((dark > FG_THRESHOLD) * 255).astype(np.uint8))
    small = im.resize((im.width // q, im.height // q), Image.BILINEAR).point(lambda v: 255 if v >= 128 else 0)
    size = max(3, int(round(FG_CLOSE * CELL / q)) | 1)
    small = small.filter(ImageFilter.MaxFilter(size)).filter(ImageFilter.MinFilter(size))
    return np.asarray(small.resize(im.size, Image.BILINEAR), dtype=np.float32) / 255.0


def bilinear(arr, x, y):
    h, w = arr.shape
    x = np.clip(x, 0, w - 1.001)
    y = np.clip(y, 0, h - 1.001)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x - x0, y - y0
    a, b = arr[y0, x0], arr[y0, x0 + 1]
    c, d = arr[y0 + 1, x0], arr[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


# ----------------------------------------------------------------------------- lattice
# Iso axes on screen: u = (cos30, sin30), v = (-cos30, sin30), both of length CELL.
UX, UY = COS * CELL, SIN * CELL
VX, VY = -COS * CELL, SIN * CELL
ORIGIN = (CANVAS_W / 2, CANVAS_H / 2)


def node_xy(i, j):
    return ORIGIN[0] + i * UX + j * VX, ORIGIN[1] + i * UY + j * VY


def lattice():
    # node (i, j): x = ox + (i - j)·cos·CELL, y = oy + (i + j)·sin·CELL
    pad = 2
    a_max = math.ceil((CANVAS_W / 2) / (COS * CELL)) + pad      # a = i - j
    b_max = math.ceil((CANVAS_H / 2) / (SIN * CELL)) + pad      # b = i + j
    nodes = []
    for b in range(-b_max, b_max + 1):
        for a in range(-a_max, a_max + 1):
            if (a + b) % 2:
                continue
            i, j = (a + b) // 2, (b - a) // 2
            x, y = node_xy(i, j)
            if -CELL <= x <= CANVAS_W + CELL and -CELL <= y <= CANVAS_H + 2 * CELL:
                nodes.append((i, j))
    return nodes


# ----------------------------------------------------------------------------- geometry
def cube_vertices(x, y, e):
    """Flat cube of edge e whose base rhombus is centred on (x, y)."""
    dx, dy = COS * e, SIN * e
    return {
        "F": (x, y + dy), "L": (x - dx, y), "R": (x + dx, y),
        "T": (x, y + dy - e), "TL": (x - dx, y - e), "TR": (x + dx, y - e), "TB": (x, y - dy - e),
    }


def clip_halfplane(poly, keep):
    """Sutherland–Hodgman against one half-plane; keep(p) -> signed value, >= 0 kept."""
    out = []
    n = len(poly)
    for k in range(n):
        p, q = poly[k], poly[(k + 1) % n]
        fp, fq = keep(p), keep(q)
        if fp >= 0:
            out.append(p)
        if (fp >= 0) != (fq >= 0):
            t = fp / (fp - fq)
            out.append((p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])))
    return out


class PathWriter:
    """Compact SVG path data: absolute M, relative l/q, 0.1 px precision, no drift."""

    def __init__(self):
        self.parts = []
        self.cx = self.cy = 0
        self.sx = self.sy = None   # start of the last subpath (current point after 'z')

    @staticmethod
    def q(v):
        return int(round(v * 10))

    @staticmethod
    def num(n10):
        s = f"{n10 / 10:.1f}".rstrip("0").rstrip(".")
        if s.startswith("0."):
            s = s[1:]
        elif s.startswith("-0."):
            s = "-" + s[2:]
        return s or "0"

    def _nums(self, vals):
        out, prev = "", ""
        for v in vals:
            t = self.num(v)
            # a separator is only needed when the next token would otherwise merge with the previous one
            if prev and not (t.startswith("-") or (t.startswith(".") and "." in prev)):
                out += " "
            out += t
            prev = t
        return out

    def move(self, p):
        x, y = self.q(p[0]), self.q(p[1])
        if self.sx is None:
            self.parts.append("M" + self._nums([x, y]))
        else:
            self.parts.append("m" + self._nums([x - self.cx, y - self.cy]))
        self.cx, self.cy = self.sx, self.sy = x, y

    def line(self, p):
        x, y = self.q(p[0]), self.q(p[1])
        dx, dy = x - self.cx, y - self.cy
        if dx == 0 and dy == 0:
            return
        if dx == 0:
            self.parts.append("v" + self.num(dy))
        elif dy == 0:
            self.parts.append("h" + self.num(dx))
        else:
            self.parts.append("l" + self._nums([dx, dy]))
        self.cx, self.cy = x, y

    def quad(self, c, p):
        cx, cy = self.q(c[0]), self.q(c[1])
        x, y = self.q(p[0]), self.q(p[1])
        self.parts.append("q" + self._nums([cx - self.cx, cy - self.cy, x - self.cx, y - self.cy]))
        self.cx, self.cy = x, y

    def close(self):
        self.parts.append("z")
        self.cx, self.cy = self.sx, self.sy

    def polygon(self, pts, rounded=None, r=0.0):
        """rounded: set of indices whose corner is rounded by r (cut back along both edges)."""
        rounded = rounded or set()
        n = len(pts)
        segs = []
        for k, v in enumerate(pts):
            if k in rounded and r > 0:
                p, nx = pts[k - 1], pts[(k + 1) % n]
                lp, ln = math.dist(v, p), math.dist(v, nx)
                rr = min(r, 0.45 * lp, 0.45 * ln)
                a = (v[0] + (p[0] - v[0]) * rr / lp, v[1] + (p[1] - v[1]) * rr / lp)
                b = (v[0] + (nx[0] - v[0]) * rr / ln, v[1] + (nx[1] - v[1]) * rr / ln)
                segs.append(("q", a, v, b))
            else:
                segs.append(("l", v))
        first = segs[0]
        self.move(first[1])
        if first[0] == "q":
            self.quad(first[2], first[3])
        for s in segs[1:]:
            self.line(s[1])
            if s[0] == "q":
                self.quad(s[2], s[3])
        self.close()

    def d(self):
        return "".join(self.parts)


# ----------------------------------------------------------------------------- main
def build():
    assert max(LEVEL_SIZES) <= 0.75 and ISO_ANGLE_DEG == 30.0, \
        "merged colour layers only occlude correctly for 30° iso and cube edge <= 0.75·CELL"
    lum_img, src = load_luminance()
    lum = np.asarray(lum_img, dtype=np.float32) / 255.0
    lum = np.clip((lum - SOURCE_BLACK) / max(1e-6, SOURCE_WHITE - SOURCE_BLACK), 0, 1)
    dark = 1.0 - lum

    dark_s = blur(dark, SAMPLE_BLUR * CELL)
    fg = blur(silhouette_mask(dark), EDGE_SIGMA * CELL)        # 1 inside, .5 on the edge, 0 outside
    halo = blur(np.power(dark, GAMMA), EDGE_SIGMA * CELL)
    mean = blur(lum, ACCENT_DETAIL_SIGMA * CELL)
    var = np.maximum(blur(lum * lum, ACCENT_DETAIL_SIGMA * CELL) - mean * mean, 0)
    detail = np.sqrt(var)

    nodes = lattice()
    ii = np.array([n[0] for n in nodes]); jj = np.array([n[1] for n in nodes])
    xs = ORIGIN[0] + ii * UX + jj * VX
    ys = ORIGIN[1] + ii * UY + jj * VY
    sy = ys - SAMPLE_OFFSET_Y * CELL

    m = bilinear(fg, xs, sy)
    inside = smoothstep(0.4, 0.98, m)                          # 0 at/outside the silhouette edge, 1 well inside
    d = bilinear(dark_s, xs, sy)
    det = bilinear(detail, xs, sy)

    # composition fade towards all four canvas edges
    u, v = xs / CANVAS_W, ys / CANVAS_H
    edge = smoothstep(0, EDGE_FADE, np.minimum(u, 1 - u)) * smoothstep(0, EDGE_FADE * CANVAS_W / CANVAS_H, np.minimum(v, 1 - v))
    d = d * edge
    g = np.power(np.clip(d, 0, 1), GAMMA)
    # silhouette edges: shrink tone towards the edge, and let a blurred halo leak just outside it
    g = g * (EDGE_SHRINK + (1 - EDGE_SHRINK) * inside)
    g = np.maximum(g, EDGE_HALO * bilinear(halo, xs, sy) * edge * (1 - inside))

    rng = np.random.default_rng(SEED)
    bayer = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 15.0
    jitter = (bayer[ii % 4, jj % 4] * 2 - 1) * DITHER
    level = np.zeros(len(nodes), dtype=int)
    for t in LEVEL_THRESHOLDS:
        level += (g + jitter >= t).astype(int)

    # edge dissolve: near silhouette edges (fg mask ramp) light cubes are randomly skipped
    p_skip = DISSOLVE_STRENGTH * (1 - inside) * (g < DISSOLVE_BELOW)
    p_skip = np.maximum(p_skip, EDGE_FADE_DISSOLVE * (1 - edge) ** 1.5)
    skip = rng.random(len(nodes)) < p_skip
    level[skip] = 0

    sizes = {}
    for k, (i, j) in enumerate(nodes):
        if level[k] > 0:
            sizes[(i, j)] = LEVEL_SIZES[level[k]] * CELL

    # accents: sparse, seeded, on largest cubes only, away from detailed (facial-feature) areas
    pool = [k for k in range(len(nodes)) if level[k] in ACCENT_LEVELS]
    n_acc = round(ACCENT_FRACTION * len(pool))

    def eligible(k):
        if det[k] > ACCENT_DETAIL_MAX or m[k] < 0.97:
            return False
        nx_, ny_ = xs[k] / CANVAS_W, ys[k] / CANVAS_H
        return not any(((nx_ - cx) / rx) ** 2 + ((ny_ - cy) / ry) ** 2 <= 1 for cx, cy, rx, ry in ACCENT_EXCLUDE_ZONES)

    cand = [k for k in pool if eligible(k)]
    random.Random(SEED).shuffle(cand)
    accents = []
    for k in cand:
        if len(accents) >= n_acc:
            break
        if all(math.hypot(xs[k] - xs[a], ys[k] - ys[a]) >= ACCENT_MIN_DIST * CELL for a in accents):
            accents.append(k)
    accent_set = {nodes[k] for k in accents}

    # --- geometry ---------------------------------------------------------------
    # Paint order: body (right-face colour, full rounded hexagon) -> left faces -> top faces -> accents.
    # The body underlay makes faces seamless (no anti-alias hairlines between them) and *is* the
    # right face. For edges <= 0.75·CELL, top faces are never occluded by another cube, and the
    # only wrong overlap merged layers can produce is a cube's left face over the right face of
    # its lower-left neighbour (i, j+1) — that left face is clipped exactly below.
    body, left, top, acc = PathWriter(), PathWriter(), PathWriter(), PathWriter()
    order = sorted(sizes, key=lambda n: (n[0] + n[1], n[0] - n[1]))     # back-to-front (cosmetic)
    for (i, j) in order:
        e = sizes[(i, j)]
        x, y = node_xy(i, j)
        V = cube_vertices(x, y, e)
        r = CORNER_RADIUS if e >= ROUND_MIN_EDGE else 0.0
        body.polygon([V["TB"], V["TR"], V["R"], V["F"], V["L"], V["TL"]], set(range(6)), r)

        lf = [V["TL"], V["T"], V["F"], V["L"]]
        nb = sizes.get((i, j + 1))
        if nb:
            nxp, nyp = node_xy(i, j + 1)
            N = cube_vertices(nxp, nyp, nb)
            xb = N["TR"][0]
            (ax, ay), (bx, by) = N["T"], N["TR"]
            above = lambda p: -((bx - ax) * (p[1] - ay) - (by - ay) * (p[0] - ax))   # >= 0 above line T→TR
            wedge_hit = clip_halfplane(clip_halfplane(lf, lambda p: xb - p[0]), lambda p: -above(p))
            if len(wedge_hit) >= 3 and abs(poly_area(wedge_hit)) > 1e-3:
                for piece in (clip_halfplane(lf, lambda p: p[0] - xb),
                              clip_halfplane(clip_halfplane(lf, lambda p: xb - p[0]), above)):
                    if len(piece) >= 3 and abs(poly_area(piece)) > 1e-3:
                        left.polygon(piece)
                lf = None
        if lf:
            left.polygon(lf, {0, 2, 3}, r)

        tf = [V["TB"], V["TR"], V["T"], V["TL"]]
        (acc if (i, j) in accent_set else top).polygon(tf, {0, 1, 3}, r)

    # --- grid -------------------------------------------------------------------
    grid = PathWriter()
    # Two families of floor lines through the nodes (along u and along v). In true 30° iso,
    # parallel lines of one family are exactly CELL apart vertically.
    step = 2 * SIN * CELL
    for sgn in (1, -1):
        slope = sgn * TAN
        span = abs(slope) * CANVAS_W
        k0 = math.floor((-span - CANVAS_H) / step) - 1
        k1 = math.ceil((span + 2 * CANVAS_H) / step) + 1
        for k in range(k0, k1 + 1):
            c = ORIGIN[1] + k * step                           # y at x = ox
            # y(x) = c + slope·(x - ox); clip to canvas
            pts = []
            for x in (0.0, float(CANVAS_W)):
                yy = c + slope * (x - ORIGIN[0])
                if 0 <= yy <= CANVAS_H:
                    pts.append((x, yy))
            for yy in (0.0, float(CANVAS_H)):
                x = ORIGIN[0] + (yy - c) / slope
                if 0 < x < CANVAS_W:
                    pts.append((x, yy))
            pts = sorted(set((round(px, 2), round(py, 2)) for px, py in pts))
            if len(pts) >= 2:
                grid.move(pts[0]); grid.line(pts[-1])

    svg = []
    W, H = CANVAS_W, CANVAS_H
    rx, ry = W / 2 * math.sqrt(2), H / 2 * math.sqrt(2)          # ellipse through the canvas corners = radius 1
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    svg.append("<title>qure.ai isometric cube halftone</title>")
    svg.append("<defs>")
    svg.append(f'<radialGradient id="grid-fade" gradientUnits="userSpaceOnUse" cx="{W/2:g}" cy="{H/2:g}" r="{rx:.1f}" '
               f'gradientTransform="translate({W/2:g} {H/2:g}) scale(1 {ry/rx:.5f}) translate({-W/2:g} {-H/2:g})">'
               f'<stop offset="{GRID_FADE_INNER}" stop-color="{GRID_COLOR}" stop-opacity="{GRID_OPACITY}"/>'
               f'<stop offset="{min(1, GRID_FADE_OUTER)}" stop-color="{GRID_COLOR}" stop-opacity="0"/>'
               "</radialGradient>")
    svg.append("</defs>")
    if BACKGROUND:
        svg.append(f'<rect id="background" width="{W}" height="{H}" fill="{BACKGROUND}"/>')
    svg.append(f'<g id="grid"><path id="grid-lines" fill="none" stroke="url(#grid-fade)" stroke-width="{GRID_WIDTH:g}" d="{grid.d()}"/></g>')
    svg.append('<g id="cubes">'
               f'<path id="cubes-right" fill="{RIGHT_COLOR}" d="{body.d()}"/>'
               f'<path id="cubes-left" fill="{LEFT_COLOR}" d="{left.d()}"/>'
               f'<path id="cubes-top" fill="{TOP_COLOR}" d="{top.d()}"/>'
               "</g>")
    svg.append(f'<g id="accents"><path id="accents-top" fill="{ACCENT_COLOR}" d="{acc.d()}"/></g>')
    svg.append("</svg>")

    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.write_text("\n".join(svg) + "\n")

    counts = [int((level == L).sum()) for L in range(len(LEVEL_SIZES))]
    return {
        "source": src, "nodes": len(nodes), "cubes": len(sizes), "levels": counts,
        "accents": len(accents), "accent_target": n_acc, "accent_candidates": len(cand),
    }


def poly_area(p):
    return 0.5 * sum(p[k][0] * p[(k + 1) % len(p)][1] - p[(k + 1) % len(p)][0] * p[k][1] for k in range(len(p)))


def find_chrome():
    env = os.environ.get("CHROME_BIN")
    if env and Path(env).exists():
        return env
    for pattern in ("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell",
                    "/opt/pw-browsers/chromium-*/chrome-linux/chrome"):
        hits = sorted(glob.glob(pattern))
        if hits:
            return hits[-1]
    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        p = shutil.which(name)
        if p:
            return p
    mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    return mac if Path(mac).exists() else None


def render_png():
    chrome = find_chrome()
    if not chrome:
        print("!! Chromium not found (set CHROME_BIN) — SVG written, PNG skipped", file=sys.stderr)
        return False
    # Full Chrome's headless window is not exactly the viewport, so render into a taller window
    # (the SVG is anchored top-left) and crop to the canvas.
    pad = 200
    cmd = [chrome, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
           f"--force-device-scale-factor={PNG_SCALE}", f"--window-size={CANVAS_W},{CANVAS_H + pad}",
           "--default-background-color=00000000", f"--screenshot={OUT_PNG}", OUT_SVG.resolve().as_uri()]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with Image.open(OUT_PNG) as im:
        im = im.crop((0, 0, CANVAS_W * PNG_SCALE, CANVAS_H * PNG_SCALE))
        im.save(OUT_PNG, optimize=True)
    return True


if __name__ == "__main__":
    stats = build()
    png = render_png()
    print(f"source        {stats['source'].relative_to(ROOT)}")
    print(f"cell          {CELL:g} px (@1x)   iso angle {ISO_ANGLE_DEG:g}°")
    print(f"grid nodes    {stats['nodes']}")
    print(f"cubes         {stats['cubes']}   per level 1..5: {stats['levels'][1:]}")
    print(f"accents       {stats['accents']} (target {stats['accent_target']}, eligible {stats['accent_candidates']})")
    print(f"svg           {OUT_SVG.relative_to(ROOT)}  {OUT_SVG.stat().st_size / 1024:.0f} KB")
    if png:
        with Image.open(OUT_PNG) as im:
            print(f"png           {OUT_PNG.relative_to(ROOT)}  {OUT_PNG.stat().st_size / 1024:.0f} KB  {im.size[0]}x{im.size[1]}")
