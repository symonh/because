#!/bin/bash
# Build the Because engine bundles from the vendored mapjs source.
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
# MIT requires the copyright and permission notice to travel with the code, and
# the bundle is what browsers actually receive, so stamp the attributions on it.
BANNER='/*! Because — MIT License, Copyright (c) 2026 Simon Cullen. Bundles: mindmup/mapjs (MIT, Copyright (c) 2013 Damjan Vujnovic, David de Florinier, Gojko Adzic); jQuery (MIT, Copyright OpenJS Foundation and other contributors); Hammer.JS and its jQuery plugin (MIT, Copyright (c) 2011-2014 Jorik Tangelder); jQuery Hotkeys (MIT, Copyright 2010 John Resig); Underscore.js (MIT, Copyright (c) 2009-2022 Jeremy Ashkenas, Julian Gonggrijp, DocumentCloud and Investigative Reporters & Editors); PolyBool.js (MIT, Copyright (c) 2016 Sean Connelly); monotone-convex-hull-2d, robust-orientation, robust-scale, robust-subtract, robust-sum, two-product, two-sum (MIT, Copyright (c) 2013 Mikola Lysenko). Full notices: https://github.com/symonh/because/blob/main/THIRD-PARTY-NOTICES.md */'
$ESBUILD entries/global-entry.js --bundle --outfile=../app/bundle.js --platform=browser $ALIAS --banner:js="$BANNER" --log-level=warning
$ESBUILD entries/demo-entry.js --bundle --outfile=../engine-demo/bundle.js --platform=browser $ALIAS --banner:js="$BANNER" --log-level=warning
echo "built: app/bundle.js ($(wc -c < ../app/bundle.js | tr -d ' ') bytes), engine-demo/bundle.js ($(wc -c < ../engine-demo/bundle.js | tr -d ' ') bytes)"
