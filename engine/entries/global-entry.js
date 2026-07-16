/*global require, window*/
// Because engine bundle entry: expose the mapjs API and jQuery (with the
// domMapWidget / linkEditWidget / node-resize widgets registered by
// npm-main's requires) as globals for the unbundled ES-module app shell.
window.MAPJS = require('../vendor/mapjs/src/npm-main');
window.jQuery = require('jquery');
