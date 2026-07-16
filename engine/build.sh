#!/bin/bash
# Build the ArgumentBase engine bundles from the vendored mapjs source.
#   ../app/bundle.js         — globals bundle for the app shell (window.MAPJS)
#   ../engine-demo/bundle.js — self-contained raw engine demo
# The underscore alias is required: mapjs uses the callable `_(...)` form,
# which breaks if esbuild resolves underscore's ESM build via its "exports"
# field (the namespace wrapper is not callable).
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --no-audit --no-fund
ESBUILD=./node_modules/.bin/esbuild
ALIAS="--alias:underscore=./node_modules/underscore/underscore-umd.js"
$ESBUILD entries/global-entry.js --bundle --outfile=../app/bundle.js --platform=browser $ALIAS --log-level=warning
$ESBUILD entries/demo-entry.js --bundle --outfile=../engine-demo/bundle.js --platform=browser $ALIAS --log-level=warning
echo "built: app/bundle.js ($(wc -c < ../app/bundle.js | tr -d ' ') bytes), engine-demo/bundle.js ($(wc -c < ../engine-demo/bundle.js | tr -d ' ') bytes)"
