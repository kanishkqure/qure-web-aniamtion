#!/usr/bin/env python3
"""Inline every local asset of an HTML file into a single self-contained file.

    python3 tools/build-standalone.py motion-preview.html motion-preview-standalone.html

Replaces url(assets/...) in CSS and src="assets/..." in HTML with base64 data URIs
(fonts, images). Remote <script src="https://..."> tags (GSAP on jsDelivr) are left as is.
Fails if any local assets/ reference is left behind.
"""
import base64, mimetypes, os, re, sys

MIME = {'.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp',
        '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'}

def data_uri(root, rel):
    path = os.path.join(root, rel)
    ext = os.path.splitext(path)[1].lower()
    mime = MIME.get(ext) or mimetypes.guess_type(path)[0] or 'application/octet-stream'
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode('ascii'))

def main(src, dst):
    root = os.path.dirname(os.path.abspath(src))
    html = open(src, encoding='utf-8').read()
    html = re.sub(r'url\((["\']?)(assets/[^)"\']+)\1\)', lambda m: 'url("%s")' % data_uri(root, m.group(2)), html)
    html = re.sub(r'src="(assets/[^"]+)"', lambda m: 'src="%s"' % data_uri(root, m.group(1)), html)
    left = re.findall(r'url\(["\']?assets/[^)]+\)|(?:src|href)="assets/[^"]+"', html)
    if left:
        sys.exit('unresolved local assets: %s' % left)
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(html)
    print('%s  %.1f KB' % (dst, os.path.getsize(dst) / 1024))

if __name__ == '__main__':
    main(*sys.argv[1:3])
