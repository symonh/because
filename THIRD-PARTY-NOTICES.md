# Third-party notices

Because itself is under the MIT License (see [LICENSE](LICENSE)). It ships
third-party components whose notices are reproduced here, as their licenses
require.

## Rendering engine

**[mindmup/mapjs](https://github.com/mindmup/mapjs)** — MIT License.
Copyright (c) 2013 Damjan Vujnovic, David de Florinier, Gojko Adzic.

The source is vendored at `engine/vendor/mapjs/` with its license at
`engine/vendor/mapjs/LICENSE`; local changes are recorded in
`engine/vendor/mapjs/LOCAL-PATCHES.diff`. Compiled into `app/bundle.js` and
`engine-demo/bundle.js`.

## Libraries compiled into `app/bundle.js` and `engine-demo/bundle.js`

All are MIT-licensed. The MIT text they share is reproduced once below.

| Component | Copyright |
|---|---|
| [jQuery](https://jquery.com) | Copyright OpenJS Foundation and other contributors, https://openjsf.org/ |
| [Hammer.JS](https://hammerjs.github.io) and its jQuery plugin (`jquery.hammer-full.js`) | Copyright (C) 2011–2014 Jorik Tangelder (Eight Media) |
| [jQuery Hotkeys](https://github.com/jeresig/jquery.hotkeys) | Copyright 2010 John Resig — dual licensed under MIT or GPL Version 2; used here under MIT |
| [Underscore.js](https://underscorejs.org) | Copyright (c) 2009–2022 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors |
| [PolyBool.js](https://github.com/velipso/polybooljs) | Copyright (c) 2016 Sean Connelly (@voidqk) |
| [monotone-convex-hull-2d](https://github.com/mikolalysenko/monotone-convex-hull-2d), and its dependencies robust-orientation, robust-scale, robust-subtract, robust-sum, two-product, two-sum | Copyright (c) 2013 Mikola Lysenko |

### The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Fonts

Both bundled fonts are licensed under the SIL Open Font License, Version 1.1,
whose text ships alongside them in `app/fonts/OFL.txt` and
`engine-demo/fonts/OFL.txt`.

- **Noto Sans** (`NotoSans-400.woff2`, `NotoSans-700.woff2`) — Copyright 2022
  The Noto Project Authors
  (https://github.com/notofonts/latin-greek-cyrillic)
- **Architects Daughter** (`ArchitectsDaughter.woff2`) — Copyright (c) 2010
  Kimberly Geswein (kimberlygeswein.com)

## Not distributed

`.mup` files under `samples/` are synthetic fixtures written for this repo and
are covered by the project's own MIT license. The `.mup` file format and the
argument-mapping theme values are read from files MindMup saved; the theme JSON
in `app/js/themes.js` and `engine/theme-argmap.js` reproduces those values so
that existing maps render as they did.
