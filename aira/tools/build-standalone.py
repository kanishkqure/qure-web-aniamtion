#!/usr/bin/env python3
"""Inline every local asset of an HTML file into a single self-contained file.

    python3 aira/tools/build-standalone.py aira/aira-storyboard.html aira/aira-storyboard-standalone.html

Copied from tools/build-standalone.py (qTrack, commit 41b23c5). Original behaviour:
replaces url(assets/...) in CSS and src="assets/..." in HTML with base64 data URIs
(fonts, images); remote <script src="https://..."> tags (GSAP on jsDelivr) are left as is;
fails if any local assets/ reference is left behind.

[AIRA] changes (this copy only):
  1. inlines local <link rel="stylesheet" href="src/x.css"> as <style>, resolving the
     stylesheet's own relative url(...) paths against the stylesheet's folder;
  2. inlines local <script src="src/x.js"></script> as inline <script>;
  3. optional --strip-review: removes the <!-- REVIEW:*:START --> ... END blocks and
     /* REVIEW:CSS:START */ ... END blocks (used for the production film, which must not
     contain the review bar);
  4. the leftover check also covers ../assets, src/ and reference/ references;
  5. inlines any quoted local asset path (HTML attribute or JS string) under assets/ or reference/.
"""
import base64, mimetypes, os, re, sys

MIME = {'.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp',
        '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'}

def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    mime = MIME.get(ext) or mimetypes.guess_type(path)[0] or 'application/octet-stream'
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode('ascii'))

def inline_css_urls(css, base):
    def rep(m):
        ref = m.group(2)
        if ref.startswith(('data:', 'http:', 'https:', '#')):
            return m.group(0)
        return 'url("%s")' % data_uri(os.path.normpath(os.path.join(base, ref)))
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', rep, css)

def main(src, dst, *flags):
    root = os.path.dirname(os.path.abspath(src))
    html = open(src, encoding='utf-8').read()
    if '--strip-review' in flags:
        html = re.sub(r'<!-- REVIEW:(\w+):START -->.*?<!-- REVIEW:\1:END -->', '', html, flags=re.S)
        html = re.sub(r'/\* REVIEW:CSS:START \*/.*?/\* REVIEW:CSS:END \*/', '', html, flags=re.S)
    # [AIRA] 1. local stylesheets
    def link(m):
        href = m.group(1)
        path = os.path.join(root, href)
        css = inline_css_urls(open(path, encoding='utf-8').read(), os.path.dirname(path))
        return '<style>\n%s\n</style>' % css
    html = re.sub(r'<link rel="stylesheet" href="((?!https?:)[^"]+\.css)">', link, html)
    # [AIRA] 2. local scripts
    def script(m):
        return '<script>\n%s\n</script>' % open(os.path.join(root, m.group(1)), encoding='utf-8').read().replace('</script', '<\\/script')
    html = re.sub(r'<script src="((?!https?:)[^"]+\.js)"></script>', script, html)
    # original behaviour: assets/ references in the page itself
    html = re.sub(r'url\((["\']?)(assets/[^)"\']+)\1\)', lambda m: 'url("%s")' % data_uri(os.path.join(root, m.group(2))), html)
    # [AIRA] 5. any quoted local asset path (HTML attributes and JS string literals), assets/ or reference/
    def quoted(m):
        path = os.path.join(root, m.group(2))
        return m.group(1) + data_uri(path) + m.group(1) if os.path.isfile(path) else m.group(0)
    html = re.sub(r'(["\'])((?:assets|reference)/[^"\'\s<>$]+?\.(?:webp|png|jpe?g|svg|woff2))\1', quoted, html)
    left = re.findall(r'url\(["\']?(?:\.\./)?assets/[^)]+\)|(?:src|href)="(?:\.\./)?(?:assets|src|reference)/[^"]+"|["\'](?:assets|reference)/[^"\'\s]+["\']', html)
    if left:
        sys.exit('unresolved local assets: %s' % left[:5])
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(html)
    print('%s  %.1f KB' % (dst, os.path.getsize(dst) / 1024))

if __name__ == '__main__':
    main(*sys.argv[1:])
