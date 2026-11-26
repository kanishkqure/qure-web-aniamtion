#!/usr/bin/env sh
# Builds the two deliverables from motion-preview.html (run from anywhere):
#   aira-film.html                  production film, no review bar
#   motion-preview-standalone.html  same film + review bar
set -e
cd "$(dirname "$0")/.."
python3 tools/build-standalone.py motion-preview.html motion-preview-standalone.html
python3 tools/build-standalone.py motion-preview.html aira-film.html --strip-review
sed -i.bak 's#<title>Aira Motion Preview</title>#<title>Aira Film</title>#; s#<body class="preview">#<body>#' aira-film.html && rm -f aira-film.html.bak
