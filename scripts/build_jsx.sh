#!/bin/sh
# Pre-compile docs/*.jsx → docs/dist/*.js so the site can ship without
# in-browser Babel (faster cold load, no MB of @babel/standalone).
#
# Uses esbuild via npx — no install needed; npx caches the binary on first
# run. Output is plain JS that still references global React + ReactDOM
# loaded via CDN script tags in index.html.
set -e
cd "$(dirname "$0")/.."
mkdir -p docs/dist
npx --yes esbuild@0.24.0 docs/*.jsx \
  --outdir=docs/dist \
  --jsx-factory=React.createElement \
  --jsx-fragment=React.Fragment \
  --log-level=warning
echo "wrote docs/dist/*.js"
ls docs/dist/ | wc -l | xargs echo "  files:"
