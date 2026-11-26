#!/usr/bin/env python3
"""Trace the Mozambique district map from the Aira screens into SVG polygons.

    python3 aira/tools/trace-map.py aira/assets/screens aira/src/map-data.js

Geometry comes from 04a (the largest rendering of the map). Each district is a
connected region of non-white pixels (districts are separated by white borders).
Two fill colours are sampled per district: state A from 04a and state B from 04b
(04b's map is a smaller copy; positions are mapped through the bounding boxes).
Output coordinates are in 04a CSS pixels (PNG px / 2), relative to the map's
top-left corner.
"""
import json, sys
import numpy as np, cv2
from PIL import Image

A_CROP = (240, 560, 580, 1100)     # 04a, PNG px
B_CROP = (85, 530, 300, 865)       # 04b, PNG px

def load(path, crop):
    im = np.asarray(Image.open(path).convert('RGB').crop(crop)).astype(np.int16)
    return im

def mask_of(im, thr=14, rel=0.72):
    # darkness = distance from white. District borders are white hairlines, often
    # antialiased, so a pixel is "border" when it is much lighter than the darkest
    # pixel around it (local contrast), not only when it is near white.
    d = (255 - im.min(axis=2)).astype(np.float32)
    local = cv2.dilate(d, np.ones((5, 5), np.uint8))
    return ((d > thr) & (d >= local * rel)).astype(np.uint8)

def bbox(m):
    ys, xs = np.nonzero(m)
    return xs.min(), ys.min(), xs.max(), ys.max()

def main(screens, out):
    A = load(screens + '/04a-facilities-district-signals.png', A_CROP)
    B = load(screens + '/04b-facilities-malaria-signal.png', B_CROP)
    mA = mask_of(A)
    # drop the legend swatches / text right of the map and anything below the outline
    mA[:, 335:] = 0          # legend swatches start at ~348
    mA[528:, :] = 0          # card border below the map
    mA[:14, :] = 0           # subtitle descenders above the map
    mB = mask_of(B)
    mB[:, 185:] = 0
    # remove the black ring drawn on 04b before taking its bbox/colours
    dark = (B.max(axis=2) < 110)
    mB[dark] = 0
    ax0, ay0, ax1, ay1 = bbox(mA)
    # 04b shows the same dashboard scaled by S about the stage origin, then moved by (TX, TY)
    # (measured from the chart lines and window edges, CSS px).
    S, TX, TY = 0.6247, -30.8, 89.75
    def a2b(x, y):   # A-crop PNG px -> B-crop PNG px
        sxp = ((x + A_CROP[0]) / 2 * S + TX) * 2 - B_CROP[0]
        syp = ((y + A_CROP[1]) / 2 * S + TY) * 2 - B_CROP[1]
        return sxp, syp
    def b2a(x, y):
        return (((x + B_CROP[0]) / 2 - TX) / S * 2 - A_CROP[0], ((y + B_CROP[1]) / 2 - TY) / S * 2 - A_CROP[1])

    n, lab, stats, cent = cv2.connectedComponentsWithStats(mA, connectivity=4)
    districts = []
    for i in range(1, n):
        area = stats[i, cv2.CC_STAT_AREA]
        if area < 12:
            continue
        reg = (lab == i).astype(np.uint8)
        # close the 1px antialias gap so neighbouring polygons share edges visually
        reg_d = cv2.dilate(reg, np.ones((3, 3), np.uint8))
        cs, _ = cv2.findContours(reg_d, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = max(cs, key=cv2.contourArea)
        c = cv2.approxPolyDP(c, 0.9, True)
        if len(c) < 3:
            continue
        pts = c[:, 0, :] / 2.0 + np.array([ax0 * 0, 0]) / 2.0
        # colour A: median of the core (eroded) pixels
        core = cv2.erode(reg, np.ones((3, 3), np.uint8))
        if core.sum() < 4:
            core = reg
        colA = np.median(A[core.astype(bool)], axis=0).astype(int)
        # colour B: sample around the mapped centroid in 04b
        cx, cy = cent[i]
        bx, by = (int(round(v)) for v in a2b(cx, cy))
        win = B[max(0, by - 2):by + 3, max(0, bx - 2):bx + 3].reshape(-1, 3)
        mw = mB[max(0, by - 2):by + 3, max(0, bx - 2):bx + 3].reshape(-1).astype(bool)
        win = win[mw] if mw.any() else win
        win = win[win.max(axis=1) >= 110] if len(win) else win
        colB = np.median(win, axis=0).astype(int) if len(win) else colA
        d = 'M' + ' L'.join('%.1f %.1f' % (x, y) for x, y in pts) + 'Z'
        districts.append({'d': d, 'a': '#%02x%02x%02x' % tuple(colA), 'b': '#%02x%02x%02x' % tuple(colB),
                          'c': [round(cx / 2, 1), round(cy / 2, 1)], 'area': int(area)})
    # Mocuba = the district under the black ring in 04b (ring centre, PNG px in B crop)
    RING_B = (133.5, 132.5)
    mx, my = b2a(*RING_B)
    lid = lab[int(round(my)), int(round(mx))]
    full = np.asarray(Image.open(screens + '/04a-facilities-district-signals.png').convert('RGB'))
    legend = ['#%02x%02x%02x' % tuple(int(v) for v in np.median(full[y-6:y+7, 594:608].reshape(-1, 3), axis=0))
              for y in (630, 659, 688, 717, 746, 775)]          # High -> Low swatches
    for d in districts:
        if d.get('id') is None and lid and abs(d['c'][0] - cent[lid][0] / 2) < .2 and abs(d['c'][1] - cent[lid][1] / 2) < .2:
            d['id'] = 'mocuba'; d['b'] = legend[0]
    res = {'legend': legend, 'mocuba': [round(mx / 2, 1), round(my / 2, 1)],'w': round(A.shape[1] / 2, 1), 'h': round(A.shape[0] / 2, 1),
           'bbox': [ax0 / 2, ay0 / 2, ax1 / 2, ay1 / 2], 'districts': districts}
    js = json.dumps(res, separators=(',', ':'))
    with open(out, 'w') as f:
        f.write('/* generated by aira/tools/trace-map.py from 04a/04b — do not edit */\nwindow.AIRA_MAP=%s;\n' % js if out.endswith('.js') else js)
    print('%d districts, %.1f KB' % (len(districts), len(json.dumps(res)) / 1024))

if __name__ == '__main__':
    main(*sys.argv[1:3])
