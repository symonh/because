/*! Because — MIT License, Copyright (c) 2026 Simon Cullen. Bundles: mindmup/mapjs (MIT, Copyright (c) 2013 Damjan Vujnovic, David de Florinier, Gojko Adzic); jQuery (MIT, Copyright OpenJS Foundation and other contributors); Hammer.JS and its jQuery plugin (MIT, Copyright (c) 2011-2014 Jorik Tangelder); jQuery Hotkeys (MIT, Copyright 2010 John Resig); Underscore.js (MIT, Copyright (c) 2009-2022 Jeremy Ashkenas, Julian Gonggrijp, DocumentCloud and Investigative Reporters & Editors); PolyBool.js (MIT, Copyright (c) 2016 Sean Connelly); monotone-convex-hull-2d, robust-orientation, robust-scale, robust-subtract, robust-sum, two-product, two-sum (MIT, Copyright (c) 2013 Mikola Lysenko). Full notices: https://github.com/symonh/because/blob/main/THIRD-PARTY-NOTICES.md */
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // node_modules/jquery/dist/jquery.js
  var require_jquery = __commonJS({
    "node_modules/jquery/dist/jquery.js"(exports, module) {
      (function(global2, factory) {
        "use strict";
        if (typeof module === "object" && typeof module.exports === "object") {
          module.exports = global2.document ? factory(global2, true) : function(w) {
            if (!w.document) {
              throw new Error("jQuery requires a window with a document");
            }
            return factory(w);
          };
        } else {
          factory(global2);
        }
      })(typeof window !== "undefined" ? window : exports, function(window2, noGlobal) {
        "use strict";
        var arr = [];
        var getProto = Object.getPrototypeOf;
        var slice = arr.slice;
        var flat = arr.flat ? function(array) {
          return arr.flat.call(array);
        } : function(array) {
          return arr.concat.apply([], array);
        };
        var push = arr.push;
        var indexOf = arr.indexOf;
        var class2type = {};
        var toString = class2type.toString;
        var hasOwn = class2type.hasOwnProperty;
        var fnToString = hasOwn.toString;
        var ObjectFunctionString = fnToString.call(Object);
        var support = {};
        var isFunction = function isFunction2(obj) {
          return typeof obj === "function" && typeof obj.nodeType !== "number" && typeof obj.item !== "function";
        };
        var isWindow = function isWindow2(obj) {
          return obj != null && obj === obj.window;
        };
        var document2 = window2.document;
        var preservedScriptAttributes = {
          type: true,
          src: true,
          nonce: true,
          noModule: true
        };
        function DOMEval(code, node, doc) {
          doc = doc || document2;
          var i, val, script = doc.createElement("script");
          script.text = code;
          if (node) {
            for (i in preservedScriptAttributes) {
              val = node[i] || node.getAttribute && node.getAttribute(i);
              if (val) {
                script.setAttribute(i, val);
              }
            }
          }
          doc.head.appendChild(script).parentNode.removeChild(script);
        }
        function toType(obj) {
          if (obj == null) {
            return obj + "";
          }
          return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
        }
        var version = "3.7.1", rhtmlSuffix = /HTML$/i, jQuery3 = function(selector, context) {
          return new jQuery3.fn.init(selector, context);
        };
        jQuery3.fn = jQuery3.prototype = {
          // The current version of jQuery being used
          jquery: version,
          constructor: jQuery3,
          // The default length of a jQuery object is 0
          length: 0,
          toArray: function() {
            return slice.call(this);
          },
          // Get the Nth element in the matched element set OR
          // Get the whole matched element set as a clean array
          get: function(num) {
            if (num == null) {
              return slice.call(this);
            }
            return num < 0 ? this[num + this.length] : this[num];
          },
          // Take an array of elements and push it onto the stack
          // (returning the new matched element set)
          pushStack: function(elems) {
            var ret = jQuery3.merge(this.constructor(), elems);
            ret.prevObject = this;
            return ret;
          },
          // Execute a callback for every element in the matched set.
          each: function(callback) {
            return jQuery3.each(this, callback);
          },
          map: function(callback) {
            return this.pushStack(jQuery3.map(this, function(elem, i) {
              return callback.call(elem, i, elem);
            }));
          },
          slice: function() {
            return this.pushStack(slice.apply(this, arguments));
          },
          first: function() {
            return this.eq(0);
          },
          last: function() {
            return this.eq(-1);
          },
          even: function() {
            return this.pushStack(jQuery3.grep(this, function(_elem, i) {
              return (i + 1) % 2;
            }));
          },
          odd: function() {
            return this.pushStack(jQuery3.grep(this, function(_elem, i) {
              return i % 2;
            }));
          },
          eq: function(i) {
            var len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
          },
          end: function() {
            return this.prevObject || this.constructor();
          },
          // For internal use only.
          // Behaves like an Array's method, not like a jQuery method.
          push,
          sort: arr.sort,
          splice: arr.splice
        };
        jQuery3.extend = jQuery3.fn.extend = function() {
          var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
          if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
          }
          if (typeof target !== "object" && !isFunction(target)) {
            target = {};
          }
          if (i === length) {
            target = this;
            i--;
          }
          for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
              for (name in options) {
                copy = options[name];
                if (name === "__proto__" || target === copy) {
                  continue;
                }
                if (deep && copy && (jQuery3.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                  src = target[name];
                  if (copyIsArray && !Array.isArray(src)) {
                    clone = [];
                  } else if (!copyIsArray && !jQuery3.isPlainObject(src)) {
                    clone = {};
                  } else {
                    clone = src;
                  }
                  copyIsArray = false;
                  target[name] = jQuery3.extend(deep, clone, copy);
                } else if (copy !== void 0) {
                  target[name] = copy;
                }
              }
            }
          }
          return target;
        };
        jQuery3.extend({
          // Unique for each copy of jQuery on the page
          expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
          // Assume jQuery is ready without the ready module
          isReady: true,
          error: function(msg) {
            throw new Error(msg);
          },
          noop: function() {
          },
          isPlainObject: function(obj) {
            var proto, Ctor;
            if (!obj || toString.call(obj) !== "[object Object]") {
              return false;
            }
            proto = getProto(obj);
            if (!proto) {
              return true;
            }
            Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
            return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
          },
          isEmptyObject: function(obj) {
            var name;
            for (name in obj) {
              return false;
            }
            return true;
          },
          // Evaluates a script in a provided context; falls back to the global one
          // if not specified.
          globalEval: function(code, options, doc) {
            DOMEval(code, { nonce: options && options.nonce }, doc);
          },
          each: function(obj, callback) {
            var length, i = 0;
            if (isArrayLike(obj)) {
              length = obj.length;
              for (; i < length; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                  break;
                }
              }
            } else {
              for (i in obj) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                  break;
                }
              }
            }
            return obj;
          },
          // Retrieve the text value of an array of DOM nodes
          text: function(elem) {
            var node, ret = "", i = 0, nodeType = elem.nodeType;
            if (!nodeType) {
              while (node = elem[i++]) {
                ret += jQuery3.text(node);
              }
            }
            if (nodeType === 1 || nodeType === 11) {
              return elem.textContent;
            }
            if (nodeType === 9) {
              return elem.documentElement.textContent;
            }
            if (nodeType === 3 || nodeType === 4) {
              return elem.nodeValue;
            }
            return ret;
          },
          // results is for internal usage only
          makeArray: function(arr2, results) {
            var ret = results || [];
            if (arr2 != null) {
              if (isArrayLike(Object(arr2))) {
                jQuery3.merge(
                  ret,
                  typeof arr2 === "string" ? [arr2] : arr2
                );
              } else {
                push.call(ret, arr2);
              }
            }
            return ret;
          },
          inArray: function(elem, arr2, i) {
            return arr2 == null ? -1 : indexOf.call(arr2, elem, i);
          },
          isXMLDoc: function(elem) {
            var namespace = elem && elem.namespaceURI, docElem = elem && (elem.ownerDocument || elem).documentElement;
            return !rhtmlSuffix.test(namespace || docElem && docElem.nodeName || "HTML");
          },
          // Support: Android <=4.0 only, PhantomJS 1 only
          // push.apply(_, arraylike) throws on ancient WebKit
          merge: function(first, second) {
            var len = +second.length, j = 0, i = first.length;
            for (; j < len; j++) {
              first[i++] = second[j];
            }
            first.length = i;
            return first;
          },
          grep: function(elems, callback, invert) {
            var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
            for (; i < length; i++) {
              callbackInverse = !callback(elems[i], i);
              if (callbackInverse !== callbackExpect) {
                matches.push(elems[i]);
              }
            }
            return matches;
          },
          // arg is for internal usage only
          map: function(elems, callback, arg) {
            var length, value, i = 0, ret = [];
            if (isArrayLike(elems)) {
              length = elems.length;
              for (; i < length; i++) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            } else {
              for (i in elems) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            }
            return flat(ret);
          },
          // A global GUID counter for objects
          guid: 1,
          // jQuery.support is not used in Core but other projects attach their
          // properties to it so it needs to exist.
          support
        });
        if (typeof Symbol === "function") {
          jQuery3.fn[Symbol.iterator] = arr[Symbol.iterator];
        }
        jQuery3.each(
          "Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
          function(_i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
          }
        );
        function isArrayLike(obj) {
          var length = !!obj && "length" in obj && obj.length, type = toType(obj);
          if (isFunction(obj) || isWindow(obj)) {
            return false;
          }
          return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
        }
        function nodeName(elem, name) {
          return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        }
        var pop = arr.pop;
        var sort = arr.sort;
        var splice = arr.splice;
        var whitespace = "[\\x20\\t\\r\\n\\f]";
        var rtrimCSS = new RegExp(
          "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
          "g"
        );
        jQuery3.contains = function(a, b) {
          var bup = b && b.parentNode;
          return a === bup || !!(bup && bup.nodeType === 1 && // Support: IE 9 - 11+
          // IE doesn't have `contains` on SVG.
          (a.contains ? a.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
        };
        var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
        function fcssescape(ch, asCodePoint) {
          if (asCodePoint) {
            if (ch === "\0") {
              return "\uFFFD";
            }
            return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
          }
          return "\\" + ch;
        }
        jQuery3.escapeSelector = function(sel) {
          return (sel + "").replace(rcssescape, fcssescape);
        };
        var preferredDoc = document2, pushNative = push;
        (function() {
          var i, Expr, outermostContext, sortInput, hasDuplicate, push2 = pushNative, document3, documentElement2, documentIsHTML, rbuggyQSA, matches, expando = jQuery3.expando, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), nonnativeSelectorCache = createCache(), sortOrder = function(a, b) {
            if (a === b) {
              hasDuplicate = true;
            }
            return 0;
          }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+", attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + // Operator (capture 2)
          "*([*^$|!~]?=)" + whitespace + // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
          `*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(` + identifier + "))|)" + whitespace + "*\\]", pseudos = ":(" + identifier + `)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|` + attributes + ")*)|.*)\\)|)", rwhitespace = new RegExp(whitespace + "+", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rleadingCombinator = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rdescend = new RegExp(whitespace + "|>"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
            ID: new RegExp("^#(" + identifier + ")"),
            CLASS: new RegExp("^\\.(" + identifier + ")"),
            TAG: new RegExp("^(" + identifier + "|[*])"),
            ATTR: new RegExp("^" + attributes),
            PSEUDO: new RegExp("^" + pseudos),
            CHILD: new RegExp(
              "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)",
              "i"
            ),
            bool: new RegExp("^(?:" + booleans + ")$", "i"),
            // For use in libraries implementing .is()
            // We use this for POS matching in `select`
            needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
          }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rquickExpr2 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, runescape = new RegExp("\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g"), funescape = function(escape, nonHex) {
            var high = "0x" + escape.slice(1) - 65536;
            if (nonHex) {
              return nonHex;
            }
            return high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
          }, unloadHandler = function() {
            setDocument();
          }, inDisabledFieldset = addCombinator(
            function(elem) {
              return elem.disabled === true && nodeName(elem, "fieldset");
            },
            { dir: "parentNode", next: "legend" }
          );
          function safeActiveElement() {
            try {
              return document3.activeElement;
            } catch (err) {
            }
          }
          try {
            push2.apply(
              arr = slice.call(preferredDoc.childNodes),
              preferredDoc.childNodes
            );
            arr[preferredDoc.childNodes.length].nodeType;
          } catch (e) {
            push2 = {
              apply: function(target, els) {
                pushNative.apply(target, slice.call(els));
              },
              call: function(target) {
                pushNative.apply(target, slice.call(arguments, 1));
              }
            };
          }
          function find(selector, context, results, seed) {
            var m, i2, elem, nid, match, groups, newSelector, newContext = context && context.ownerDocument, nodeType = context ? context.nodeType : 9;
            results = results || [];
            if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
              return results;
            }
            if (!seed) {
              setDocument(context);
              context = context || document3;
              if (documentIsHTML) {
                if (nodeType !== 11 && (match = rquickExpr2.exec(selector))) {
                  if (m = match[1]) {
                    if (nodeType === 9) {
                      if (elem = context.getElementById(m)) {
                        if (elem.id === m) {
                          push2.call(results, elem);
                          return results;
                        }
                      } else {
                        return results;
                      }
                    } else {
                      if (newContext && (elem = newContext.getElementById(m)) && find.contains(context, elem) && elem.id === m) {
                        push2.call(results, elem);
                        return results;
                      }
                    }
                  } else if (match[2]) {
                    push2.apply(results, context.getElementsByTagName(selector));
                    return results;
                  } else if ((m = match[3]) && context.getElementsByClassName) {
                    push2.apply(results, context.getElementsByClassName(m));
                    return results;
                  }
                }
                if (!nonnativeSelectorCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                  newSelector = selector;
                  newContext = context;
                  if (nodeType === 1 && (rdescend.test(selector) || rleadingCombinator.test(selector))) {
                    newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                    if (newContext != context || !support.scope) {
                      if (nid = context.getAttribute("id")) {
                        nid = jQuery3.escapeSelector(nid);
                      } else {
                        context.setAttribute("id", nid = expando);
                      }
                    }
                    groups = tokenize(selector);
                    i2 = groups.length;
                    while (i2--) {
                      groups[i2] = (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i2]);
                    }
                    newSelector = groups.join(",");
                  }
                  try {
                    push2.apply(
                      results,
                      newContext.querySelectorAll(newSelector)
                    );
                    return results;
                  } catch (qsaError) {
                    nonnativeSelectorCache(selector, true);
                  } finally {
                    if (nid === expando) {
                      context.removeAttribute("id");
                    }
                  }
                }
              }
            }
            return select(selector.replace(rtrimCSS, "$1"), context, results, seed);
          }
          function createCache() {
            var keys = [];
            function cache(key, value) {
              if (keys.push(key + " ") > Expr.cacheLength) {
                delete cache[keys.shift()];
              }
              return cache[key + " "] = value;
            }
            return cache;
          }
          function markFunction(fn) {
            fn[expando] = true;
            return fn;
          }
          function assert(fn) {
            var el = document3.createElement("fieldset");
            try {
              return !!fn(el);
            } catch (e) {
              return false;
            } finally {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
              el = null;
            }
          }
          function createInputPseudo(type) {
            return function(elem) {
              return nodeName(elem, "input") && elem.type === type;
            };
          }
          function createButtonPseudo(type) {
            return function(elem) {
              return (nodeName(elem, "input") || nodeName(elem, "button")) && elem.type === type;
            };
          }
          function createDisabledPseudo(disabled) {
            return function(elem) {
              if ("form" in elem) {
                if (elem.parentNode && elem.disabled === false) {
                  if ("label" in elem) {
                    if ("label" in elem.parentNode) {
                      return elem.parentNode.disabled === disabled;
                    } else {
                      return elem.disabled === disabled;
                    }
                  }
                  return elem.isDisabled === disabled || // Where there is no isDisabled, check manually
                  elem.isDisabled !== !disabled && inDisabledFieldset(elem) === disabled;
                }
                return elem.disabled === disabled;
              } else if ("label" in elem) {
                return elem.disabled === disabled;
              }
              return false;
            };
          }
          function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
              argument = +argument;
              return markFunction(function(seed, matches2) {
                var j, matchIndexes = fn([], seed.length, argument), i2 = matchIndexes.length;
                while (i2--) {
                  if (seed[j = matchIndexes[i2]]) {
                    seed[j] = !(matches2[j] = seed[j]);
                  }
                }
              });
            });
          }
          function testContext(context) {
            return context && typeof context.getElementsByTagName !== "undefined" && context;
          }
          function setDocument(node) {
            var subWindow, doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc == document3 || doc.nodeType !== 9 || !doc.documentElement) {
              return document3;
            }
            document3 = doc;
            documentElement2 = document3.documentElement;
            documentIsHTML = !jQuery3.isXMLDoc(document3);
            matches = documentElement2.matches || documentElement2.webkitMatchesSelector || documentElement2.msMatchesSelector;
            if (documentElement2.msMatchesSelector && // Support: IE 11+, Edge 17 - 18+
            // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
            // two documents; shallow comparisons work.
            // eslint-disable-next-line eqeqeq
            preferredDoc != document3 && (subWindow = document3.defaultView) && subWindow.top !== subWindow) {
              subWindow.addEventListener("unload", unloadHandler);
            }
            support.getById = assert(function(el) {
              documentElement2.appendChild(el).id = jQuery3.expando;
              return !document3.getElementsByName || !document3.getElementsByName(jQuery3.expando).length;
            });
            support.disconnectedMatch = assert(function(el) {
              return matches.call(el, "*");
            });
            support.scope = assert(function() {
              return document3.querySelectorAll(":scope");
            });
            support.cssHas = assert(function() {
              try {
                document3.querySelector(":has(*,:jqfake)");
                return false;
              } catch (e) {
                return true;
              }
            });
            if (support.getById) {
              Expr.filter.ID = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  return elem.getAttribute("id") === attrId;
                };
              };
              Expr.find.ID = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var elem = context.getElementById(id);
                  return elem ? [elem] : [];
                }
              };
            } else {
              Expr.filter.ID = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  var node2 = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                  return node2 && node2.value === attrId;
                };
              };
              Expr.find.ID = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var node2, i2, elems, elem = context.getElementById(id);
                  if (elem) {
                    node2 = elem.getAttributeNode("id");
                    if (node2 && node2.value === id) {
                      return [elem];
                    }
                    elems = context.getElementsByName(id);
                    i2 = 0;
                    while (elem = elems[i2++]) {
                      node2 = elem.getAttributeNode("id");
                      if (node2 && node2.value === id) {
                        return [elem];
                      }
                    }
                  }
                  return [];
                }
              };
            }
            Expr.find.TAG = function(tag, context) {
              if (typeof context.getElementsByTagName !== "undefined") {
                return context.getElementsByTagName(tag);
              } else {
                return context.querySelectorAll(tag);
              }
            };
            Expr.find.CLASS = function(className, context) {
              if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
                return context.getElementsByClassName(className);
              }
            };
            rbuggyQSA = [];
            assert(function(el) {
              var input;
              documentElement2.appendChild(el).innerHTML = "<a id='" + expando + "' href='' disabled='disabled'></a><select id='" + expando + "-\r\\' disabled='disabled'><option selected=''></option></select>";
              if (!el.querySelectorAll("[selected]").length) {
                rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
              }
              if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
                rbuggyQSA.push("~=");
              }
              if (!el.querySelectorAll("a#" + expando + "+*").length) {
                rbuggyQSA.push(".#.+[+~]");
              }
              if (!el.querySelectorAll(":checked").length) {
                rbuggyQSA.push(":checked");
              }
              input = document3.createElement("input");
              input.setAttribute("type", "hidden");
              el.appendChild(input).setAttribute("name", "D");
              documentElement2.appendChild(el).disabled = true;
              if (el.querySelectorAll(":disabled").length !== 2) {
                rbuggyQSA.push(":enabled", ":disabled");
              }
              input = document3.createElement("input");
              input.setAttribute("name", "");
              el.appendChild(input);
              if (!el.querySelectorAll("[name='']").length) {
                rbuggyQSA.push("\\[" + whitespace + "*name" + whitespace + "*=" + whitespace + `*(?:''|"")`);
              }
            });
            if (!support.cssHas) {
              rbuggyQSA.push(":has");
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            sortOrder = function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
              if (compare) {
                return compare;
              }
              compare = (a.ownerDocument || a) == (b.ownerDocument || b) ? a.compareDocumentPosition(b) : (
                // Otherwise we know they are disconnected
                1
              );
              if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
                if (a === document3 || a.ownerDocument == preferredDoc && find.contains(preferredDoc, a)) {
                  return -1;
                }
                if (b === document3 || b.ownerDocument == preferredDoc && find.contains(preferredDoc, b)) {
                  return 1;
                }
                return sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
              }
              return compare & 4 ? -1 : 1;
            };
            return document3;
          }
          find.matches = function(expr, elements) {
            return find(expr, null, null, elements);
          };
          find.matchesSelector = function(elem, expr) {
            setDocument(elem);
            if (documentIsHTML && !nonnativeSelectorCache[expr + " "] && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
              try {
                var ret = matches.call(elem, expr);
                if (ret || support.disconnectedMatch || // As well, disconnected nodes are said to be in a document
                // fragment in IE 9
                elem.document && elem.document.nodeType !== 11) {
                  return ret;
                }
              } catch (e) {
                nonnativeSelectorCache(expr, true);
              }
            }
            return find(expr, document3, null, [elem]).length > 0;
          };
          find.contains = function(context, elem) {
            if ((context.ownerDocument || context) != document3) {
              setDocument(context);
            }
            return jQuery3.contains(context, elem);
          };
          find.attr = function(elem, name) {
            if ((elem.ownerDocument || elem) != document3) {
              setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
            if (val !== void 0) {
              return val;
            }
            return elem.getAttribute(name);
          };
          find.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
          };
          jQuery3.uniqueSort = function(results) {
            var elem, duplicates = [], j = 0, i2 = 0;
            hasDuplicate = !support.sortStable;
            sortInput = !support.sortStable && slice.call(results, 0);
            sort.call(results, sortOrder);
            if (hasDuplicate) {
              while (elem = results[i2++]) {
                if (elem === results[i2]) {
                  j = duplicates.push(i2);
                }
              }
              while (j--) {
                splice.call(results, duplicates[j], 1);
              }
            }
            sortInput = null;
            return results;
          };
          jQuery3.fn.uniqueSort = function() {
            return this.pushStack(jQuery3.uniqueSort(slice.apply(this)));
          };
          Expr = jQuery3.expr = {
            // Can be adjusted by the user
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
              ">": { dir: "parentNode", first: true },
              " ": { dir: "parentNode" },
              "+": { dir: "previousSibling", first: true },
              "~": { dir: "previousSibling" }
            },
            preFilter: {
              ATTR: function(match) {
                match[1] = match[1].replace(runescape, funescape);
                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
                if (match[2] === "~=") {
                  match[3] = " " + match[3] + " ";
                }
                return match.slice(0, 4);
              },
              CHILD: function(match) {
                match[1] = match[1].toLowerCase();
                if (match[1].slice(0, 3) === "nth") {
                  if (!match[3]) {
                    find.error(match[0]);
                  }
                  match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                  match[5] = +(match[7] + match[8] || match[3] === "odd");
                } else if (match[3]) {
                  find.error(match[0]);
                }
                return match;
              },
              PSEUDO: function(match) {
                var excess, unquoted = !match[6] && match[2];
                if (matchExpr.CHILD.test(match[0])) {
                  return null;
                }
                if (match[3]) {
                  match[2] = match[4] || match[5] || "";
                } else if (unquoted && rpseudo.test(unquoted) && // Get excess from tokenize (recursively)
                (excess = tokenize(unquoted, true)) && // advance to the next closing parenthesis
                (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                  match[0] = match[0].slice(0, excess);
                  match[2] = unquoted.slice(0, excess);
                }
                return match.slice(0, 3);
              }
            },
            filter: {
              TAG: function(nodeNameSelector) {
                var expectedNodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                return nodeNameSelector === "*" ? function() {
                  return true;
                } : function(elem) {
                  return nodeName(elem, expectedNodeName);
                };
              },
              CLASS: function(className) {
                var pattern = classCache[className + " "];
                return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                  return pattern.test(
                    typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || ""
                  );
                });
              },
              ATTR: function(name, operator, check) {
                return function(elem) {
                  var result = find.attr(elem, name);
                  if (result == null) {
                    return operator === "!=";
                  }
                  if (!operator) {
                    return true;
                  }
                  result += "";
                  if (operator === "=") {
                    return result === check;
                  }
                  if (operator === "!=") {
                    return result !== check;
                  }
                  if (operator === "^=") {
                    return check && result.indexOf(check) === 0;
                  }
                  if (operator === "*=") {
                    return check && result.indexOf(check) > -1;
                  }
                  if (operator === "$=") {
                    return check && result.slice(-check.length) === check;
                  }
                  if (operator === "~=") {
                    return (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1;
                  }
                  if (operator === "|=") {
                    return result === check || result.slice(0, check.length + 1) === check + "-";
                  }
                  return false;
                };
              },
              CHILD: function(type, what, _argument, first, last) {
                var simple = type.slice(0, 3) !== "nth", forward = type.slice(-4) !== "last", ofType = what === "of-type";
                return first === 1 && last === 0 ? (
                  // Shortcut for :nth-*(n)
                  function(elem) {
                    return !!elem.parentNode;
                  }
                ) : function(elem, _context, xml) {
                  var cache, outerCache, node, nodeIndex, start, dir2 = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType, diff = false;
                  if (parent) {
                    if (simple) {
                      while (dir2) {
                        node = elem;
                        while (node = node[dir2]) {
                          if (ofType ? nodeName(node, name) : node.nodeType === 1) {
                            return false;
                          }
                        }
                        start = dir2 = type === "only" && !start && "nextSibling";
                      }
                      return true;
                    }
                    start = [forward ? parent.firstChild : parent.lastChild];
                    if (forward && useCache) {
                      outerCache = parent[expando] || (parent[expando] = {});
                      cache = outerCache[type] || [];
                      nodeIndex = cache[0] === dirruns && cache[1];
                      diff = nodeIndex && cache[2];
                      node = nodeIndex && parent.childNodes[nodeIndex];
                      while (node = ++nodeIndex && node && node[dir2] || // Fallback to seeking `elem` from the start
                      (diff = nodeIndex = 0) || start.pop()) {
                        if (node.nodeType === 1 && ++diff && node === elem) {
                          outerCache[type] = [dirruns, nodeIndex, diff];
                          break;
                        }
                      }
                    } else {
                      if (useCache) {
                        outerCache = elem[expando] || (elem[expando] = {});
                        cache = outerCache[type] || [];
                        nodeIndex = cache[0] === dirruns && cache[1];
                        diff = nodeIndex;
                      }
                      if (diff === false) {
                        while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start.pop()) {
                          if ((ofType ? nodeName(node, name) : node.nodeType === 1) && ++diff) {
                            if (useCache) {
                              outerCache = node[expando] || (node[expando] = {});
                              outerCache[type] = [dirruns, diff];
                            }
                            if (node === elem) {
                              break;
                            }
                          }
                        }
                      }
                    }
                    diff -= last;
                    return diff === first || diff % first === 0 && diff / first >= 0;
                  }
                };
              },
              PSEUDO: function(pseudo, argument) {
                var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || find.error("unsupported pseudo: " + pseudo);
                if (fn[expando]) {
                  return fn(argument);
                }
                if (fn.length > 1) {
                  args = [pseudo, pseudo, "", argument];
                  return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches2) {
                    var idx, matched = fn(seed, argument), i2 = matched.length;
                    while (i2--) {
                      idx = indexOf.call(seed, matched[i2]);
                      seed[idx] = !(matches2[idx] = matched[i2]);
                    }
                  }) : function(elem) {
                    return fn(elem, 0, args);
                  };
                }
                return fn;
              }
            },
            pseudos: {
              // Potentially complex pseudos
              not: markFunction(function(selector) {
                var input = [], results = [], matcher = compile(selector.replace(rtrimCSS, "$1"));
                return matcher[expando] ? markFunction(function(seed, matches2, _context, xml) {
                  var elem, unmatched = matcher(seed, null, xml, []), i2 = seed.length;
                  while (i2--) {
                    if (elem = unmatched[i2]) {
                      seed[i2] = !(matches2[i2] = elem);
                    }
                  }
                }) : function(elem, _context, xml) {
                  input[0] = elem;
                  matcher(input, null, xml, results);
                  input[0] = null;
                  return !results.pop();
                };
              }),
              has: markFunction(function(selector) {
                return function(elem) {
                  return find(selector, elem).length > 0;
                };
              }),
              contains: markFunction(function(text) {
                text = text.replace(runescape, funescape);
                return function(elem) {
                  return (elem.textContent || jQuery3.text(elem)).indexOf(text) > -1;
                };
              }),
              // "Whether an element is represented by a :lang() selector
              // is based solely on the element's language value
              // being equal to the identifier C,
              // or beginning with the identifier C immediately followed by "-".
              // The matching of C against the element's language value is performed case-insensitively.
              // The identifier C does not have to be a valid language name."
              // https://www.w3.org/TR/selectors/#lang-pseudo
              lang: markFunction(function(lang) {
                if (!ridentifier.test(lang || "")) {
                  find.error("unsupported lang: " + lang);
                }
                lang = lang.replace(runescape, funescape).toLowerCase();
                return function(elem) {
                  var elemLang;
                  do {
                    if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                      elemLang = elemLang.toLowerCase();
                      return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                    }
                  } while ((elem = elem.parentNode) && elem.nodeType === 1);
                  return false;
                };
              }),
              // Miscellaneous
              target: function(elem) {
                var hash = window2.location && window2.location.hash;
                return hash && hash.slice(1) === elem.id;
              },
              root: function(elem) {
                return elem === documentElement2;
              },
              focus: function(elem) {
                return elem === safeActiveElement() && document3.hasFocus() && !!(elem.type || elem.href || ~elem.tabIndex);
              },
              // Boolean properties
              enabled: createDisabledPseudo(false),
              disabled: createDisabledPseudo(true),
              checked: function(elem) {
                return nodeName(elem, "input") && !!elem.checked || nodeName(elem, "option") && !!elem.selected;
              },
              selected: function(elem) {
                if (elem.parentNode) {
                  elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
              },
              // Contents
              empty: function(elem) {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  if (elem.nodeType < 6) {
                    return false;
                  }
                }
                return true;
              },
              parent: function(elem) {
                return !Expr.pseudos.empty(elem);
              },
              // Element/input types
              header: function(elem) {
                return rheader.test(elem.nodeName);
              },
              input: function(elem) {
                return rinputs.test(elem.nodeName);
              },
              button: function(elem) {
                return nodeName(elem, "input") && elem.type === "button" || nodeName(elem, "button");
              },
              text: function(elem) {
                var attr;
                return nodeName(elem, "input") && elem.type === "text" && // Support: IE <10 only
                // New HTML5 attribute values (e.g., "search") appear
                // with elem.type === "text"
                ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
              },
              // Position-in-collection
              first: createPositionalPseudo(function() {
                return [0];
              }),
              last: createPositionalPseudo(function(_matchIndexes, length) {
                return [length - 1];
              }),
              eq: createPositionalPseudo(function(_matchIndexes, length, argument) {
                return [argument < 0 ? argument + length : argument];
              }),
              even: createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 0;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              odd: createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 1;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              lt: createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2;
                if (argument < 0) {
                  i2 = argument + length;
                } else if (argument > length) {
                  i2 = length;
                } else {
                  i2 = argument;
                }
                for (; --i2 >= 0; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              gt: createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument;
                for (; ++i2 < length; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              })
            }
          };
          Expr.pseudos.nth = Expr.pseudos.eq;
          for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
            Expr.pseudos[i] = createInputPseudo(i);
          }
          for (i in { submit: true, reset: true }) {
            Expr.pseudos[i] = createButtonPseudo(i);
          }
          function setFilters() {
          }
          setFilters.prototype = Expr.filters = Expr.pseudos;
          Expr.setFilters = new setFilters();
          function tokenize(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) {
              return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
              if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                  soFar = soFar.slice(match[0].length) || soFar;
                }
                groups.push(tokens = []);
              }
              matched = false;
              if (match = rleadingCombinator.exec(soFar)) {
                matched = match.shift();
                tokens.push({
                  value: matched,
                  // Cast descendant combinators to space
                  type: match[0].replace(rtrimCSS, " ")
                });
                soFar = soFar.slice(matched.length);
              }
              for (type in Expr.filter) {
                if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                  matched = match.shift();
                  tokens.push({
                    value: matched,
                    type,
                    matches: match
                  });
                  soFar = soFar.slice(matched.length);
                }
              }
              if (!matched) {
                break;
              }
            }
            if (parseOnly) {
              return soFar.length;
            }
            return soFar ? find.error(selector) : (
              // Cache the tokens
              tokenCache(selector, groups).slice(0)
            );
          }
          function toSelector(tokens) {
            var i2 = 0, len = tokens.length, selector = "";
            for (; i2 < len; i2++) {
              selector += tokens[i2].value;
            }
            return selector;
          }
          function addCombinator(matcher, combinator, base) {
            var dir2 = combinator.dir, skip = combinator.next, key = skip || dir2, checkNonElements = base && key === "parentNode", doneName = done++;
            return combinator.first ? (
              // Check against closest ancestor/preceding element
              function(elem, context, xml) {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    return matcher(elem, context, xml);
                  }
                }
                return false;
              }
            ) : (
              // Check against all ancestor/preceding elements
              function(elem, context, xml) {
                var oldCache, outerCache, newCache = [dirruns, doneName];
                if (xml) {
                  while (elem = elem[dir2]) {
                    if (elem.nodeType === 1 || checkNonElements) {
                      if (matcher(elem, context, xml)) {
                        return true;
                      }
                    }
                  }
                } else {
                  while (elem = elem[dir2]) {
                    if (elem.nodeType === 1 || checkNonElements) {
                      outerCache = elem[expando] || (elem[expando] = {});
                      if (skip && nodeName(elem, skip)) {
                        elem = elem[dir2] || elem;
                      } else if ((oldCache = outerCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                        return newCache[2] = oldCache[2];
                      } else {
                        outerCache[key] = newCache;
                        if (newCache[2] = matcher(elem, context, xml)) {
                          return true;
                        }
                      }
                    }
                  }
                }
                return false;
              }
            );
          }
          function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
              var i2 = matchers.length;
              while (i2--) {
                if (!matchers[i2](elem, context, xml)) {
                  return false;
                }
              }
              return true;
            } : matchers[0];
          }
          function multipleContexts(selector, contexts, results) {
            var i2 = 0, len = contexts.length;
            for (; i2 < len; i2++) {
              find(selector, contexts[i2], results);
            }
            return results;
          }
          function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i2 = 0, len = unmatched.length, mapped = map != null;
            for (; i2 < len; i2++) {
              if (elem = unmatched[i2]) {
                if (!filter || filter(elem, context, xml)) {
                  newUnmatched.push(elem);
                  if (mapped) {
                    map.push(i2);
                  }
                }
              }
            }
            return newUnmatched;
          }
          function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
              postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
              postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
              var temp, i2, elem, matcherOut, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(
                selector || "*",
                context.nodeType ? [context] : context,
                []
              ), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems;
              if (matcher) {
                matcherOut = postFinder || (seed ? preFilter : preexisting || postFilter) ? (
                  // ...intermediate processing is necessary
                  []
                ) : (
                  // ...otherwise use results directly
                  results
                );
                matcher(matcherIn, matcherOut, context, xml);
              } else {
                matcherOut = matcherIn;
              }
              if (postFilter) {
                temp = condense(matcherOut, postMap);
                postFilter(temp, [], context, xml);
                i2 = temp.length;
                while (i2--) {
                  if (elem = temp[i2]) {
                    matcherOut[postMap[i2]] = !(matcherIn[postMap[i2]] = elem);
                  }
                }
              }
              if (seed) {
                if (postFinder || preFilter) {
                  if (postFinder) {
                    temp = [];
                    i2 = matcherOut.length;
                    while (i2--) {
                      if (elem = matcherOut[i2]) {
                        temp.push(matcherIn[i2] = elem);
                      }
                    }
                    postFinder(null, matcherOut = [], temp, xml);
                  }
                  i2 = matcherOut.length;
                  while (i2--) {
                    if ((elem = matcherOut[i2]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i2]) > -1) {
                      seed[temp] = !(results[temp] = elem);
                    }
                  }
                }
              } else {
                matcherOut = condense(
                  matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut
                );
                if (postFinder) {
                  postFinder(null, results, matcherOut, xml);
                } else {
                  push2.apply(results, matcherOut);
                }
              }
            });
          }
          function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i2 = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
              return elem === checkContext;
            }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
              return indexOf.call(checkContext, elem) > -1;
            }, implicitRelative, true), matchers = [function(elem, context, xml) {
              var ret = !leadingRelative && (xml || context != outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
              checkContext = null;
              return ret;
            }];
            for (; i2 < len; i2++) {
              if (matcher = Expr.relative[tokens[i2].type]) {
                matchers = [addCombinator(elementMatcher(matchers), matcher)];
              } else {
                matcher = Expr.filter[tokens[i2].type].apply(null, tokens[i2].matches);
                if (matcher[expando]) {
                  j = ++i2;
                  for (; j < len; j++) {
                    if (Expr.relative[tokens[j].type]) {
                      break;
                    }
                  }
                  return setMatcher(
                    i2 > 1 && elementMatcher(matchers),
                    i2 > 1 && toSelector(
                      // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                      tokens.slice(0, i2 - 1).concat({ value: tokens[i2 - 2].type === " " ? "*" : "" })
                    ).replace(rtrimCSS, "$1"),
                    matcher,
                    i2 < j && matcherFromTokens(tokens.slice(i2, j)),
                    j < len && matcherFromTokens(tokens = tokens.slice(j)),
                    j < len && toSelector(tokens)
                  );
                }
                matchers.push(matcher);
              }
            }
            return elementMatcher(matchers);
          }
          function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
              var elem, j, matcher, matchedCount = 0, i2 = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find.TAG("*", outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
              if (outermost) {
                outermostContext = context == document3 || context || outermost;
              }
              for (; i2 !== len && (elem = elems[i2]) != null; i2++) {
                if (byElement && elem) {
                  j = 0;
                  if (!context && elem.ownerDocument != document3) {
                    setDocument(elem);
                    xml = !documentIsHTML;
                  }
                  while (matcher = elementMatchers[j++]) {
                    if (matcher(elem, context || document3, xml)) {
                      push2.call(results, elem);
                      break;
                    }
                  }
                  if (outermost) {
                    dirruns = dirrunsUnique;
                  }
                }
                if (bySet) {
                  if (elem = !matcher && elem) {
                    matchedCount--;
                  }
                  if (seed) {
                    unmatched.push(elem);
                  }
                }
              }
              matchedCount += i2;
              if (bySet && i2 !== matchedCount) {
                j = 0;
                while (matcher = setMatchers[j++]) {
                  matcher(unmatched, setMatched, context, xml);
                }
                if (seed) {
                  if (matchedCount > 0) {
                    while (i2--) {
                      if (!(unmatched[i2] || setMatched[i2])) {
                        setMatched[i2] = pop.call(results);
                      }
                    }
                  }
                  setMatched = condense(setMatched);
                }
                push2.apply(results, setMatched);
                if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                  jQuery3.uniqueSort(results);
                }
              }
              if (outermost) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
              }
              return unmatched;
            };
            return bySet ? markFunction(superMatcher) : superMatcher;
          }
          function compile(selector, match) {
            var i2, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
            if (!cached) {
              if (!match) {
                match = tokenize(selector);
              }
              i2 = match.length;
              while (i2--) {
                cached = matcherFromTokens(match[i2]);
                if (cached[expando]) {
                  setMatchers.push(cached);
                } else {
                  elementMatchers.push(cached);
                }
              }
              cached = compilerCache(
                selector,
                matcherFromGroupMatchers(elementMatchers, setMatchers)
              );
              cached.selector = selector;
            }
            return cached;
          }
          function select(selector, context, results, seed) {
            var i2, tokens, token, type, find2, compiled = typeof selector === "function" && selector, match = !seed && tokenize(selector = compiled.selector || selector);
            results = results || [];
            if (match.length === 1) {
              tokens = match[0] = match[0].slice(0);
              if (tokens.length > 2 && (token = tokens[0]).type === "ID" && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                context = (Expr.find.ID(
                  token.matches[0].replace(runescape, funescape),
                  context
                ) || [])[0];
                if (!context) {
                  return results;
                } else if (compiled) {
                  context = context.parentNode;
                }
                selector = selector.slice(tokens.shift().value.length);
              }
              i2 = matchExpr.needsContext.test(selector) ? 0 : tokens.length;
              while (i2--) {
                token = tokens[i2];
                if (Expr.relative[type = token.type]) {
                  break;
                }
                if (find2 = Expr.find[type]) {
                  if (seed = find2(
                    token.matches[0].replace(runescape, funescape),
                    rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
                  )) {
                    tokens.splice(i2, 1);
                    selector = seed.length && toSelector(tokens);
                    if (!selector) {
                      push2.apply(results, seed);
                      return results;
                    }
                    break;
                  }
                }
              }
            }
            (compiled || compile(selector, match))(
              seed,
              context,
              !documentIsHTML,
              results,
              !context || rsibling.test(selector) && testContext(context.parentNode) || context
            );
            return results;
          }
          support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
          setDocument();
          support.sortDetached = assert(function(el) {
            return el.compareDocumentPosition(document3.createElement("fieldset")) & 1;
          });
          jQuery3.find = find;
          jQuery3.expr[":"] = jQuery3.expr.pseudos;
          jQuery3.unique = jQuery3.uniqueSort;
          find.compile = compile;
          find.select = select;
          find.setDocument = setDocument;
          find.tokenize = tokenize;
          find.escape = jQuery3.escapeSelector;
          find.getText = jQuery3.text;
          find.isXML = jQuery3.isXMLDoc;
          find.selectors = jQuery3.expr;
          find.support = jQuery3.support;
          find.uniqueSort = jQuery3.uniqueSort;
        })();
        var dir = function(elem, dir2, until) {
          var matched = [], truncate = until !== void 0;
          while ((elem = elem[dir2]) && elem.nodeType !== 9) {
            if (elem.nodeType === 1) {
              if (truncate && jQuery3(elem).is(until)) {
                break;
              }
              matched.push(elem);
            }
          }
          return matched;
        };
        var siblings = function(n, elem) {
          var matched = [];
          for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
              matched.push(n);
            }
          }
          return matched;
        };
        var rneedsContext = jQuery3.expr.match.needsContext;
        var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        function winnow(elements, qualifier, not) {
          if (isFunction(qualifier)) {
            return jQuery3.grep(elements, function(elem, i) {
              return !!qualifier.call(elem, i, elem) !== not;
            });
          }
          if (qualifier.nodeType) {
            return jQuery3.grep(elements, function(elem) {
              return elem === qualifier !== not;
            });
          }
          if (typeof qualifier !== "string") {
            return jQuery3.grep(elements, function(elem) {
              return indexOf.call(qualifier, elem) > -1 !== not;
            });
          }
          return jQuery3.filter(qualifier, elements, not);
        }
        jQuery3.filter = function(expr, elems, not) {
          var elem = elems[0];
          if (not) {
            expr = ":not(" + expr + ")";
          }
          if (elems.length === 1 && elem.nodeType === 1) {
            return jQuery3.find.matchesSelector(elem, expr) ? [elem] : [];
          }
          return jQuery3.find.matches(expr, jQuery3.grep(elems, function(elem2) {
            return elem2.nodeType === 1;
          }));
        };
        jQuery3.fn.extend({
          find: function(selector) {
            var i, ret, len = this.length, self2 = this;
            if (typeof selector !== "string") {
              return this.pushStack(jQuery3(selector).filter(function() {
                for (i = 0; i < len; i++) {
                  if (jQuery3.contains(self2[i], this)) {
                    return true;
                  }
                }
              }));
            }
            ret = this.pushStack([]);
            for (i = 0; i < len; i++) {
              jQuery3.find(selector, self2[i], ret);
            }
            return len > 1 ? jQuery3.uniqueSort(ret) : ret;
          },
          filter: function(selector) {
            return this.pushStack(winnow(this, selector || [], false));
          },
          not: function(selector) {
            return this.pushStack(winnow(this, selector || [], true));
          },
          is: function(selector) {
            return !!winnow(
              this,
              // If this is a positional/relative selector, check membership in the returned set
              // so $("p:first").is("p:last") won't return true for a doc with two "p".
              typeof selector === "string" && rneedsContext.test(selector) ? jQuery3(selector) : selector || [],
              false
            ).length;
          }
        });
        var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/, init2 = jQuery3.fn.init = function(selector, context, root) {
          var match, elem;
          if (!selector) {
            return this;
          }
          root = root || rootjQuery;
          if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
              match = [null, selector, null];
            } else {
              match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
              if (match[1]) {
                context = context instanceof jQuery3 ? context[0] : context;
                jQuery3.merge(this, jQuery3.parseHTML(
                  match[1],
                  context && context.nodeType ? context.ownerDocument || context : document2,
                  true
                ));
                if (rsingleTag.test(match[1]) && jQuery3.isPlainObject(context)) {
                  for (match in context) {
                    if (isFunction(this[match])) {
                      this[match](context[match]);
                    } else {
                      this.attr(match, context[match]);
                    }
                  }
                }
                return this;
              } else {
                elem = document2.getElementById(match[2]);
                if (elem) {
                  this[0] = elem;
                  this.length = 1;
                }
                return this;
              }
            } else if (!context || context.jquery) {
              return (context || root).find(selector);
            } else {
              return this.constructor(context).find(selector);
            }
          } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
          } else if (isFunction(selector)) {
            return root.ready !== void 0 ? root.ready(selector) : (
              // Execute immediately if ready is not present
              selector(jQuery3)
            );
          }
          return jQuery3.makeArray(selector, this);
        };
        init2.prototype = jQuery3.fn;
        rootjQuery = jQuery3(document2);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
          children: true,
          contents: true,
          next: true,
          prev: true
        };
        jQuery3.fn.extend({
          has: function(target) {
            var targets = jQuery3(target, this), l = targets.length;
            return this.filter(function() {
              var i = 0;
              for (; i < l; i++) {
                if (jQuery3.contains(this, targets[i])) {
                  return true;
                }
              }
            });
          },
          closest: function(selectors, context) {
            var cur, i = 0, l = this.length, matched = [], targets = typeof selectors !== "string" && jQuery3(selectors);
            if (!rneedsContext.test(selectors)) {
              for (; i < l; i++) {
                for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                  if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 : (
                    // Don't pass non-elements to jQuery#find
                    cur.nodeType === 1 && jQuery3.find.matchesSelector(cur, selectors)
                  ))) {
                    matched.push(cur);
                    break;
                  }
                }
              }
            }
            return this.pushStack(matched.length > 1 ? jQuery3.uniqueSort(matched) : matched);
          },
          // Determine the position of an element within the set
          index: function(elem) {
            if (!elem) {
              return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            }
            if (typeof elem === "string") {
              return indexOf.call(jQuery3(elem), this[0]);
            }
            return indexOf.call(
              this,
              // If it receives a jQuery object, the first element is used
              elem.jquery ? elem[0] : elem
            );
          },
          add: function(selector, context) {
            return this.pushStack(
              jQuery3.uniqueSort(
                jQuery3.merge(this.get(), jQuery3(selector, context))
              )
            );
          },
          addBack: function(selector) {
            return this.add(
              selector == null ? this.prevObject : this.prevObject.filter(selector)
            );
          }
        });
        function sibling(cur, dir2) {
          while ((cur = cur[dir2]) && cur.nodeType !== 1) {
          }
          return cur;
        }
        jQuery3.each({
          parent: function(elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
          },
          parents: function(elem) {
            return dir(elem, "parentNode");
          },
          parentsUntil: function(elem, _i, until) {
            return dir(elem, "parentNode", until);
          },
          next: function(elem) {
            return sibling(elem, "nextSibling");
          },
          prev: function(elem) {
            return sibling(elem, "previousSibling");
          },
          nextAll: function(elem) {
            return dir(elem, "nextSibling");
          },
          prevAll: function(elem) {
            return dir(elem, "previousSibling");
          },
          nextUntil: function(elem, _i, until) {
            return dir(elem, "nextSibling", until);
          },
          prevUntil: function(elem, _i, until) {
            return dir(elem, "previousSibling", until);
          },
          siblings: function(elem) {
            return siblings((elem.parentNode || {}).firstChild, elem);
          },
          children: function(elem) {
            return siblings(elem.firstChild);
          },
          contents: function(elem) {
            if (elem.contentDocument != null && // Support: IE 11+
            // <object> elements with no `data` attribute has an object
            // `contentDocument` with a `null` prototype.
            getProto(elem.contentDocument)) {
              return elem.contentDocument;
            }
            if (nodeName(elem, "template")) {
              elem = elem.content || elem;
            }
            return jQuery3.merge([], elem.childNodes);
          }
        }, function(name, fn) {
          jQuery3.fn[name] = function(until, selector) {
            var matched = jQuery3.map(this, fn, until);
            if (name.slice(-5) !== "Until") {
              selector = until;
            }
            if (selector && typeof selector === "string") {
              matched = jQuery3.filter(selector, matched);
            }
            if (this.length > 1) {
              if (!guaranteedUnique[name]) {
                jQuery3.uniqueSort(matched);
              }
              if (rparentsprev.test(name)) {
                matched.reverse();
              }
            }
            return this.pushStack(matched);
          };
        });
        var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;
        function createOptions(options) {
          var object = {};
          jQuery3.each(options.match(rnothtmlwhite) || [], function(_, flag) {
            object[flag] = true;
          });
          return object;
        }
        jQuery3.Callbacks = function(options) {
          options = typeof options === "string" ? createOptions(options) : jQuery3.extend({}, options);
          var firing, memory, fired, locked, list = [], queue = [], firingIndex = -1, fire = function() {
            locked = locked || options.once;
            fired = firing = true;
            for (; queue.length; firingIndex = -1) {
              memory = queue.shift();
              while (++firingIndex < list.length) {
                if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                  firingIndex = list.length;
                  memory = false;
                }
              }
            }
            if (!options.memory) {
              memory = false;
            }
            firing = false;
            if (locked) {
              if (memory) {
                list = [];
              } else {
                list = "";
              }
            }
          }, self2 = {
            // Add a callback or a collection of callbacks to the list
            add: function() {
              if (list) {
                if (memory && !firing) {
                  firingIndex = list.length - 1;
                  queue.push(memory);
                }
                (function add(args) {
                  jQuery3.each(args, function(_, arg) {
                    if (isFunction(arg)) {
                      if (!options.unique || !self2.has(arg)) {
                        list.push(arg);
                      }
                    } else if (arg && arg.length && toType(arg) !== "string") {
                      add(arg);
                    }
                  });
                })(arguments);
                if (memory && !firing) {
                  fire();
                }
              }
              return this;
            },
            // Remove a callback from the list
            remove: function() {
              jQuery3.each(arguments, function(_, arg) {
                var index;
                while ((index = jQuery3.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1);
                  if (index <= firingIndex) {
                    firingIndex--;
                  }
                }
              });
              return this;
            },
            // Check if a given callback is in the list.
            // If no argument is given, return whether or not list has callbacks attached.
            has: function(fn) {
              return fn ? jQuery3.inArray(fn, list) > -1 : list.length > 0;
            },
            // Remove all callbacks from the list
            empty: function() {
              if (list) {
                list = [];
              }
              return this;
            },
            // Disable .fire and .add
            // Abort any current/pending executions
            // Clear all callbacks and values
            disable: function() {
              locked = queue = [];
              list = memory = "";
              return this;
            },
            disabled: function() {
              return !list;
            },
            // Disable .fire
            // Also disable .add unless we have memory (since it would have no effect)
            // Abort any pending executions
            lock: function() {
              locked = queue = [];
              if (!memory && !firing) {
                list = memory = "";
              }
              return this;
            },
            locked: function() {
              return !!locked;
            },
            // Call all callbacks with the given context and arguments
            fireWith: function(context, args) {
              if (!locked) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                queue.push(args);
                if (!firing) {
                  fire();
                }
              }
              return this;
            },
            // Call all the callbacks with the given arguments
            fire: function() {
              self2.fireWith(this, arguments);
              return this;
            },
            // To know if the callbacks have already been called at least once
            fired: function() {
              return !!fired;
            }
          };
          return self2;
        };
        function Identity(v) {
          return v;
        }
        function Thrower(ex) {
          throw ex;
        }
        function adoptValue(value, resolve, reject, noValue) {
          var method;
          try {
            if (value && isFunction(method = value.promise)) {
              method.call(value).done(resolve).fail(reject);
            } else if (value && isFunction(method = value.then)) {
              method.call(value, resolve, reject);
            } else {
              resolve.apply(void 0, [value].slice(noValue));
            }
          } catch (value2) {
            reject.apply(void 0, [value2]);
          }
        }
        jQuery3.extend({
          Deferred: function(func) {
            var tuples = [
              // action, add listener, callbacks,
              // ... .then handlers, argument index, [final state]
              [
                "notify",
                "progress",
                jQuery3.Callbacks("memory"),
                jQuery3.Callbacks("memory"),
                2
              ],
              [
                "resolve",
                "done",
                jQuery3.Callbacks("once memory"),
                jQuery3.Callbacks("once memory"),
                0,
                "resolved"
              ],
              [
                "reject",
                "fail",
                jQuery3.Callbacks("once memory"),
                jQuery3.Callbacks("once memory"),
                1,
                "rejected"
              ]
            ], state = "pending", promise = {
              state: function() {
                return state;
              },
              always: function() {
                deferred.done(arguments).fail(arguments);
                return this;
              },
              "catch": function(fn) {
                return promise.then(null, fn);
              },
              // Keep pipe for back-compat
              pipe: function() {
                var fns = arguments;
                return jQuery3.Deferred(function(newDefer) {
                  jQuery3.each(tuples, function(_i, tuple) {
                    var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];
                    deferred[tuple[1]](function() {
                      var returned = fn && fn.apply(this, arguments);
                      if (returned && isFunction(returned.promise)) {
                        returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
                      } else {
                        newDefer[tuple[0] + "With"](
                          this,
                          fn ? [returned] : arguments
                        );
                      }
                    });
                  });
                  fns = null;
                }).promise();
              },
              then: function(onFulfilled, onRejected, onProgress) {
                var maxDepth = 0;
                function resolve(depth, deferred2, handler, special) {
                  return function() {
                    var that = this, args = arguments, mightThrow = function() {
                      var returned, then;
                      if (depth < maxDepth) {
                        return;
                      }
                      returned = handler.apply(that, args);
                      if (returned === deferred2.promise()) {
                        throw new TypeError("Thenable self-resolution");
                      }
                      then = returned && // Support: Promises/A+ section 2.3.4
                      // https://promisesaplus.com/#point-64
                      // Only check objects and functions for thenability
                      (typeof returned === "object" || typeof returned === "function") && returned.then;
                      if (isFunction(then)) {
                        if (special) {
                          then.call(
                            returned,
                            resolve(maxDepth, deferred2, Identity, special),
                            resolve(maxDepth, deferred2, Thrower, special)
                          );
                        } else {
                          maxDepth++;
                          then.call(
                            returned,
                            resolve(maxDepth, deferred2, Identity, special),
                            resolve(maxDepth, deferred2, Thrower, special),
                            resolve(
                              maxDepth,
                              deferred2,
                              Identity,
                              deferred2.notifyWith
                            )
                          );
                        }
                      } else {
                        if (handler !== Identity) {
                          that = void 0;
                          args = [returned];
                        }
                        (special || deferred2.resolveWith)(that, args);
                      }
                    }, process = special ? mightThrow : function() {
                      try {
                        mightThrow();
                      } catch (e) {
                        if (jQuery3.Deferred.exceptionHook) {
                          jQuery3.Deferred.exceptionHook(
                            e,
                            process.error
                          );
                        }
                        if (depth + 1 >= maxDepth) {
                          if (handler !== Thrower) {
                            that = void 0;
                            args = [e];
                          }
                          deferred2.rejectWith(that, args);
                        }
                      }
                    };
                    if (depth) {
                      process();
                    } else {
                      if (jQuery3.Deferred.getErrorHook) {
                        process.error = jQuery3.Deferred.getErrorHook();
                      } else if (jQuery3.Deferred.getStackHook) {
                        process.error = jQuery3.Deferred.getStackHook();
                      }
                      window2.setTimeout(process);
                    }
                  };
                }
                return jQuery3.Deferred(function(newDefer) {
                  tuples[0][3].add(
                    resolve(
                      0,
                      newDefer,
                      isFunction(onProgress) ? onProgress : Identity,
                      newDefer.notifyWith
                    )
                  );
                  tuples[1][3].add(
                    resolve(
                      0,
                      newDefer,
                      isFunction(onFulfilled) ? onFulfilled : Identity
                    )
                  );
                  tuples[2][3].add(
                    resolve(
                      0,
                      newDefer,
                      isFunction(onRejected) ? onRejected : Thrower
                    )
                  );
                }).promise();
              },
              // Get a promise for this deferred
              // If obj is provided, the promise aspect is added to the object
              promise: function(obj) {
                return obj != null ? jQuery3.extend(obj, promise) : promise;
              }
            }, deferred = {};
            jQuery3.each(tuples, function(i, tuple) {
              var list = tuple[2], stateString = tuple[5];
              promise[tuple[1]] = list.add;
              if (stateString) {
                list.add(
                  function() {
                    state = stateString;
                  },
                  // rejected_callbacks.disable
                  // fulfilled_callbacks.disable
                  tuples[3 - i][2].disable,
                  // rejected_handlers.disable
                  // fulfilled_handlers.disable
                  tuples[3 - i][3].disable,
                  // progress_callbacks.lock
                  tuples[0][2].lock,
                  // progress_handlers.lock
                  tuples[0][3].lock
                );
              }
              list.add(tuple[3].fire);
              deferred[tuple[0]] = function() {
                deferred[tuple[0] + "With"](this === deferred ? void 0 : this, arguments);
                return this;
              };
              deferred[tuple[0] + "With"] = list.fireWith;
            });
            promise.promise(deferred);
            if (func) {
              func.call(deferred, deferred);
            }
            return deferred;
          },
          // Deferred helper
          when: function(singleValue) {
            var remaining = arguments.length, i = remaining, resolveContexts = Array(i), resolveValues = slice.call(arguments), primary = jQuery3.Deferred(), updateFunc = function(i2) {
              return function(value) {
                resolveContexts[i2] = this;
                resolveValues[i2] = arguments.length > 1 ? slice.call(arguments) : value;
                if (!--remaining) {
                  primary.resolveWith(resolveContexts, resolveValues);
                }
              };
            };
            if (remaining <= 1) {
              adoptValue(
                singleValue,
                primary.done(updateFunc(i)).resolve,
                primary.reject,
                !remaining
              );
              if (primary.state() === "pending" || isFunction(resolveValues[i] && resolveValues[i].then)) {
                return primary.then();
              }
            }
            while (i--) {
              adoptValue(resolveValues[i], updateFunc(i), primary.reject);
            }
            return primary.promise();
          }
        });
        var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        jQuery3.Deferred.exceptionHook = function(error, asyncError) {
          if (window2.console && window2.console.warn && error && rerrorNames.test(error.name)) {
            window2.console.warn(
              "jQuery.Deferred exception: " + error.message,
              error.stack,
              asyncError
            );
          }
        };
        jQuery3.readyException = function(error) {
          window2.setTimeout(function() {
            throw error;
          });
        };
        var readyList = jQuery3.Deferred();
        jQuery3.fn.ready = function(fn) {
          readyList.then(fn).catch(function(error) {
            jQuery3.readyException(error);
          });
          return this;
        };
        jQuery3.extend({
          // Is the DOM ready to be used? Set to true once it occurs.
          isReady: false,
          // A counter to track how many items to wait for before
          // the ready event fires. See trac-6781
          readyWait: 1,
          // Handle when the DOM is ready
          ready: function(wait) {
            if (wait === true ? --jQuery3.readyWait : jQuery3.isReady) {
              return;
            }
            jQuery3.isReady = true;
            if (wait !== true && --jQuery3.readyWait > 0) {
              return;
            }
            readyList.resolveWith(document2, [jQuery3]);
          }
        });
        jQuery3.ready.then = readyList.then;
        function completed() {
          document2.removeEventListener("DOMContentLoaded", completed);
          window2.removeEventListener("load", completed);
          jQuery3.ready();
        }
        if (document2.readyState === "complete" || document2.readyState !== "loading" && !document2.documentElement.doScroll) {
          window2.setTimeout(jQuery3.ready);
        } else {
          document2.addEventListener("DOMContentLoaded", completed);
          window2.addEventListener("load", completed);
        }
        var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
          var i = 0, len = elems.length, bulk = key == null;
          if (toType(key) === "object") {
            chainable = true;
            for (i in key) {
              access(elems, fn, i, key[i], true, emptyGet, raw);
            }
          } else if (value !== void 0) {
            chainable = true;
            if (!isFunction(value)) {
              raw = true;
            }
            if (bulk) {
              if (raw) {
                fn.call(elems, value);
                fn = null;
              } else {
                bulk = fn;
                fn = function(elem, _key, value2) {
                  return bulk.call(jQuery3(elem), value2);
                };
              }
            }
            if (fn) {
              for (; i < len; i++) {
                fn(
                  elems[i],
                  key,
                  raw ? value : value.call(elems[i], i, fn(elems[i], key))
                );
              }
            }
          }
          if (chainable) {
            return elems;
          }
          if (bulk) {
            return fn.call(elems);
          }
          return len ? fn(elems[0], key) : emptyGet;
        };
        var rmsPrefix = /^-ms-/, rdashAlpha = /-([a-z])/g;
        function fcamelCase(_all, letter) {
          return letter.toUpperCase();
        }
        function camelCase(string) {
          return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        }
        var acceptData = function(owner) {
          return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
        };
        function Data() {
          this.expando = jQuery3.expando + Data.uid++;
        }
        Data.uid = 1;
        Data.prototype = {
          cache: function(owner) {
            var value = owner[this.expando];
            if (!value) {
              value = {};
              if (acceptData(owner)) {
                if (owner.nodeType) {
                  owner[this.expando] = value;
                } else {
                  Object.defineProperty(owner, this.expando, {
                    value,
                    configurable: true
                  });
                }
              }
            }
            return value;
          },
          set: function(owner, data, value) {
            var prop, cache = this.cache(owner);
            if (typeof data === "string") {
              cache[camelCase(data)] = value;
            } else {
              for (prop in data) {
                cache[camelCase(prop)] = data[prop];
              }
            }
            return cache;
          },
          get: function(owner, key) {
            return key === void 0 ? this.cache(owner) : (
              // Always use camelCase key (gh-2257)
              owner[this.expando] && owner[this.expando][camelCase(key)]
            );
          },
          access: function(owner, key, value) {
            if (key === void 0 || key && typeof key === "string" && value === void 0) {
              return this.get(owner, key);
            }
            this.set(owner, key, value);
            return value !== void 0 ? value : key;
          },
          remove: function(owner, key) {
            var i, cache = owner[this.expando];
            if (cache === void 0) {
              return;
            }
            if (key !== void 0) {
              if (Array.isArray(key)) {
                key = key.map(camelCase);
              } else {
                key = camelCase(key);
                key = key in cache ? [key] : key.match(rnothtmlwhite) || [];
              }
              i = key.length;
              while (i--) {
                delete cache[key[i]];
              }
            }
            if (key === void 0 || jQuery3.isEmptyObject(cache)) {
              if (owner.nodeType) {
                owner[this.expando] = void 0;
              } else {
                delete owner[this.expando];
              }
            }
          },
          hasData: function(owner) {
            var cache = owner[this.expando];
            return cache !== void 0 && !jQuery3.isEmptyObject(cache);
          }
        };
        var dataPriv = new Data();
        var dataUser = new Data();
        var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /[A-Z]/g;
        function getData(data) {
          if (data === "true") {
            return true;
          }
          if (data === "false") {
            return false;
          }
          if (data === "null") {
            return null;
          }
          if (data === +data + "") {
            return +data;
          }
          if (rbrace.test(data)) {
            return JSON.parse(data);
          }
          return data;
        }
        function dataAttr(elem, key, data) {
          var name;
          if (data === void 0 && elem.nodeType === 1) {
            name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
              try {
                data = getData(data);
              } catch (e) {
              }
              dataUser.set(elem, key, data);
            } else {
              data = void 0;
            }
          }
          return data;
        }
        jQuery3.extend({
          hasData: function(elem) {
            return dataUser.hasData(elem) || dataPriv.hasData(elem);
          },
          data: function(elem, name, data) {
            return dataUser.access(elem, name, data);
          },
          removeData: function(elem, name) {
            dataUser.remove(elem, name);
          },
          // TODO: Now that all calls to _data and _removeData have been replaced
          // with direct calls to dataPriv methods, these can be deprecated.
          _data: function(elem, name, data) {
            return dataPriv.access(elem, name, data);
          },
          _removeData: function(elem, name) {
            dataPriv.remove(elem, name);
          }
        });
        jQuery3.fn.extend({
          data: function(key, value) {
            var i, name, data, elem = this[0], attrs = elem && elem.attributes;
            if (key === void 0) {
              if (this.length) {
                data = dataUser.get(elem);
                if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                  i = attrs.length;
                  while (i--) {
                    if (attrs[i]) {
                      name = attrs[i].name;
                      if (name.indexOf("data-") === 0) {
                        name = camelCase(name.slice(5));
                        dataAttr(elem, name, data[name]);
                      }
                    }
                  }
                  dataPriv.set(elem, "hasDataAttrs", true);
                }
              }
              return data;
            }
            if (typeof key === "object") {
              return this.each(function() {
                dataUser.set(this, key);
              });
            }
            return access(this, function(value2) {
              var data2;
              if (elem && value2 === void 0) {
                data2 = dataUser.get(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                data2 = dataAttr(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                return;
              }
              this.each(function() {
                dataUser.set(this, key, value2);
              });
            }, null, value, arguments.length > 1, null, true);
          },
          removeData: function(key) {
            return this.each(function() {
              dataUser.remove(this, key);
            });
          }
        });
        jQuery3.extend({
          queue: function(elem, type, data) {
            var queue;
            if (elem) {
              type = (type || "fx") + "queue";
              queue = dataPriv.get(elem, type);
              if (data) {
                if (!queue || Array.isArray(data)) {
                  queue = dataPriv.access(elem, type, jQuery3.makeArray(data));
                } else {
                  queue.push(data);
                }
              }
              return queue || [];
            }
          },
          dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery3.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery3._queueHooks(elem, type), next = function() {
              jQuery3.dequeue(elem, type);
            };
            if (fn === "inprogress") {
              fn = queue.shift();
              startLength--;
            }
            if (fn) {
              if (type === "fx") {
                queue.unshift("inprogress");
              }
              delete hooks.stop;
              fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
              hooks.empty.fire();
            }
          },
          // Not public - generate a queueHooks object, or return the current one
          _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
              empty: jQuery3.Callbacks("once memory").add(function() {
                dataPriv.remove(elem, [type + "queue", key]);
              })
            });
          }
        });
        jQuery3.fn.extend({
          queue: function(type, data) {
            var setter = 2;
            if (typeof type !== "string") {
              data = type;
              type = "fx";
              setter--;
            }
            if (arguments.length < setter) {
              return jQuery3.queue(this[0], type);
            }
            return data === void 0 ? this : this.each(function() {
              var queue = jQuery3.queue(this, type, data);
              jQuery3._queueHooks(this, type);
              if (type === "fx" && queue[0] !== "inprogress") {
                jQuery3.dequeue(this, type);
              }
            });
          },
          dequeue: function(type) {
            return this.each(function() {
              jQuery3.dequeue(this, type);
            });
          },
          clearQueue: function(type) {
            return this.queue(type || "fx", []);
          },
          // Get a promise resolved when queues of a certain type
          // are emptied (fx is the type by default)
          promise: function(type, obj) {
            var tmp, count = 1, defer = jQuery3.Deferred(), elements = this, i = this.length, resolve = function() {
              if (!--count) {
                defer.resolveWith(elements, [elements]);
              }
            };
            if (typeof type !== "string") {
              obj = type;
              type = void 0;
            }
            type = type || "fx";
            while (i--) {
              tmp = dataPriv.get(elements[i], type + "queueHooks");
              if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
              }
            }
            resolve();
            return defer.promise(obj);
          }
        });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
        var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
        var cssExpand = ["Top", "Right", "Bottom", "Left"];
        var documentElement = document2.documentElement;
        var isAttached = function(elem) {
          return jQuery3.contains(elem.ownerDocument, elem);
        }, composed = { composed: true };
        if (documentElement.getRootNode) {
          isAttached = function(elem) {
            return jQuery3.contains(elem.ownerDocument, elem) || elem.getRootNode(composed) === elem.ownerDocument;
          };
        }
        var isHiddenWithinTree = function(elem, el) {
          elem = el || elem;
          return elem.style.display === "none" || elem.style.display === "" && // Otherwise, check computed style
          // Support: Firefox <=43 - 45
          // Disconnected elements can have computed display: none, so first confirm that elem is
          // in the document.
          isAttached(elem) && jQuery3.css(elem, "display") === "none";
        };
        function adjustCSS(elem, prop, valueParts, tween) {
          var adjusted, scale, maxIterations = 20, currentValue = tween ? function() {
            return tween.cur();
          } : function() {
            return jQuery3.css(elem, prop, "");
          }, initial = currentValue(), unit = valueParts && valueParts[3] || (jQuery3.cssNumber[prop] ? "" : "px"), initialInUnit = elem.nodeType && (jQuery3.cssNumber[prop] || unit !== "px" && +initial) && rcssNum.exec(jQuery3.css(elem, prop));
          if (initialInUnit && initialInUnit[3] !== unit) {
            initial = initial / 2;
            unit = unit || initialInUnit[3];
            initialInUnit = +initial || 1;
            while (maxIterations--) {
              jQuery3.style(elem, prop, initialInUnit + unit);
              if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
                maxIterations = 0;
              }
              initialInUnit = initialInUnit / scale;
            }
            initialInUnit = initialInUnit * 2;
            jQuery3.style(elem, prop, initialInUnit + unit);
            valueParts = valueParts || [];
          }
          if (valueParts) {
            initialInUnit = +initialInUnit || +initial || 0;
            adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
            if (tween) {
              tween.unit = unit;
              tween.start = initialInUnit;
              tween.end = adjusted;
            }
          }
          return adjusted;
        }
        var defaultDisplayMap = {};
        function getDefaultDisplay(elem) {
          var temp, doc = elem.ownerDocument, nodeName2 = elem.nodeName, display = defaultDisplayMap[nodeName2];
          if (display) {
            return display;
          }
          temp = doc.body.appendChild(doc.createElement(nodeName2));
          display = jQuery3.css(temp, "display");
          temp.parentNode.removeChild(temp);
          if (display === "none") {
            display = "block";
          }
          defaultDisplayMap[nodeName2] = display;
          return display;
        }
        function showHide(elements, show) {
          var display, elem, values = [], index = 0, length = elements.length;
          for (; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
              continue;
            }
            display = elem.style.display;
            if (show) {
              if (display === "none") {
                values[index] = dataPriv.get(elem, "display") || null;
                if (!values[index]) {
                  elem.style.display = "";
                }
              }
              if (elem.style.display === "" && isHiddenWithinTree(elem)) {
                values[index] = getDefaultDisplay(elem);
              }
            } else {
              if (display !== "none") {
                values[index] = "none";
                dataPriv.set(elem, "display", display);
              }
            }
          }
          for (index = 0; index < length; index++) {
            if (values[index] != null) {
              elements[index].style.display = values[index];
            }
          }
          return elements;
        }
        jQuery3.fn.extend({
          show: function() {
            return showHide(this, true);
          },
          hide: function() {
            return showHide(this);
          },
          toggle: function(state) {
            if (typeof state === "boolean") {
              return state ? this.show() : this.hide();
            }
            return this.each(function() {
              if (isHiddenWithinTree(this)) {
                jQuery3(this).show();
              } else {
                jQuery3(this).hide();
              }
            });
          }
        });
        var rcheckableType = /^(?:checkbox|radio)$/i;
        var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
        var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;
        (function() {
          var fragment = document2.createDocumentFragment(), div = fragment.appendChild(document2.createElement("div")), input = document2.createElement("input");
          input.setAttribute("type", "radio");
          input.setAttribute("checked", "checked");
          input.setAttribute("name", "t");
          div.appendChild(input);
          support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
          div.innerHTML = "<textarea>x</textarea>";
          support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
          div.innerHTML = "<option></option>";
          support.option = !!div.lastChild;
        })();
        var wrapMap = {
          // XHTML parsers do not magically insert elements in the
          // same way that tag soup parsers do. So we cannot shorten
          // this by omitting <tbody> or other required elements.
          thead: [1, "<table>", "</table>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          tr: [2, "<table><tbody>", "</tbody></table>"],
          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
          _default: [0, "", ""]
        };
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;
        if (!support.option) {
          wrapMap.optgroup = wrapMap.option = [1, "<select multiple='multiple'>", "</select>"];
        }
        function getAll(context, tag) {
          var ret;
          if (typeof context.getElementsByTagName !== "undefined") {
            ret = context.getElementsByTagName(tag || "*");
          } else if (typeof context.querySelectorAll !== "undefined") {
            ret = context.querySelectorAll(tag || "*");
          } else {
            ret = [];
          }
          if (tag === void 0 || tag && nodeName(context, tag)) {
            return jQuery3.merge([context], ret);
          }
          return ret;
        }
        function setGlobalEval(elems, refElements) {
          var i = 0, l = elems.length;
          for (; i < l; i++) {
            dataPriv.set(
              elems[i],
              "globalEval",
              !refElements || dataPriv.get(refElements[i], "globalEval")
            );
          }
        }
        var rhtml = /<|&#?\w+;/;
        function buildFragment(elems, context, scripts, selection, ignored) {
          var elem, tmp, tag, wrap, attached, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
          for (; i < l; i++) {
            elem = elems[i];
            if (elem || elem === 0) {
              if (toType(elem) === "object") {
                jQuery3.merge(nodes, elem.nodeType ? [elem] : elem);
              } else if (!rhtml.test(elem)) {
                nodes.push(context.createTextNode(elem));
              } else {
                tmp = tmp || fragment.appendChild(context.createElement("div"));
                tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                wrap = wrapMap[tag] || wrapMap._default;
                tmp.innerHTML = wrap[1] + jQuery3.htmlPrefilter(elem) + wrap[2];
                j = wrap[0];
                while (j--) {
                  tmp = tmp.lastChild;
                }
                jQuery3.merge(nodes, tmp.childNodes);
                tmp = fragment.firstChild;
                tmp.textContent = "";
              }
            }
          }
          fragment.textContent = "";
          i = 0;
          while (elem = nodes[i++]) {
            if (selection && jQuery3.inArray(elem, selection) > -1) {
              if (ignored) {
                ignored.push(elem);
              }
              continue;
            }
            attached = isAttached(elem);
            tmp = getAll(fragment.appendChild(elem), "script");
            if (attached) {
              setGlobalEval(tmp);
            }
            if (scripts) {
              j = 0;
              while (elem = tmp[j++]) {
                if (rscriptType.test(elem.type || "")) {
                  scripts.push(elem);
                }
              }
            }
          }
          return fragment;
        }
        var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
        function returnTrue() {
          return true;
        }
        function returnFalse() {
          return false;
        }
        function on(elem, types, selector, data, fn, one) {
          var origFn, type;
          if (typeof types === "object") {
            if (typeof selector !== "string") {
              data = data || selector;
              selector = void 0;
            }
            for (type in types) {
              on(elem, type, selector, data, types[type], one);
            }
            return elem;
          }
          if (data == null && fn == null) {
            fn = selector;
            data = selector = void 0;
          } else if (fn == null) {
            if (typeof selector === "string") {
              fn = data;
              data = void 0;
            } else {
              fn = data;
              data = selector;
              selector = void 0;
            }
          }
          if (fn === false) {
            fn = returnFalse;
          } else if (!fn) {
            return elem;
          }
          if (one === 1) {
            origFn = fn;
            fn = function(event) {
              jQuery3().off(event);
              return origFn.apply(this, arguments);
            };
            fn.guid = origFn.guid || (origFn.guid = jQuery3.guid++);
          }
          return elem.each(function() {
            jQuery3.event.add(this, types, fn, data, selector);
          });
        }
        jQuery3.event = {
          global: {},
          add: function(elem, types, handler, data, selector) {
            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.get(elem);
            if (!acceptData(elem)) {
              return;
            }
            if (handler.handler) {
              handleObjIn = handler;
              handler = handleObjIn.handler;
              selector = handleObjIn.selector;
            }
            if (selector) {
              jQuery3.find.matchesSelector(documentElement, selector);
            }
            if (!handler.guid) {
              handler.guid = jQuery3.guid++;
            }
            if (!(events = elemData.events)) {
              events = elemData.events = /* @__PURE__ */ Object.create(null);
            }
            if (!(eventHandle = elemData.handle)) {
              eventHandle = elemData.handle = function(e) {
                return typeof jQuery3 !== "undefined" && jQuery3.event.triggered !== e.type ? jQuery3.event.dispatch.apply(elem, arguments) : void 0;
              };
            }
            types = (types || "").match(rnothtmlwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                continue;
              }
              special = jQuery3.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              special = jQuery3.event.special[type] || {};
              handleObj = jQuery3.extend({
                type,
                origType,
                data,
                handler,
                guid: handler.guid,
                selector,
                needsContext: selector && jQuery3.expr.match.needsContext.test(selector),
                namespace: namespaces.join(".")
              }, handleObjIn);
              if (!(handlers = events[type])) {
                handlers = events[type] = [];
                handlers.delegateCount = 0;
                if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                  if (elem.addEventListener) {
                    elem.addEventListener(type, eventHandle);
                  }
                }
              }
              if (special.add) {
                special.add.call(elem, handleObj);
                if (!handleObj.handler.guid) {
                  handleObj.handler.guid = handler.guid;
                }
              }
              if (selector) {
                handlers.splice(handlers.delegateCount++, 0, handleObj);
              } else {
                handlers.push(handleObj);
              }
              jQuery3.event.global[type] = true;
            }
          },
          // Detach an event or set of events from an element
          remove: function(elem, types, handler, selector, mappedTypes) {
            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
            if (!elemData || !(events = elemData.events)) {
              return;
            }
            types = (types || "").match(rnothtmlwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                for (type in events) {
                  jQuery3.event.remove(elem, type + types[t], handler, selector, true);
                }
                continue;
              }
              special = jQuery3.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              handlers = events[type] || [];
              tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
              origCount = j = handlers.length;
              while (j--) {
                handleObj = handlers[j];
                if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                  handlers.splice(j, 1);
                  if (handleObj.selector) {
                    handlers.delegateCount--;
                  }
                  if (special.remove) {
                    special.remove.call(elem, handleObj);
                  }
                }
              }
              if (origCount && !handlers.length) {
                if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                  jQuery3.removeEvent(elem, type, elemData.handle);
                }
                delete events[type];
              }
            }
            if (jQuery3.isEmptyObject(events)) {
              dataPriv.remove(elem, "handle events");
            }
          },
          dispatch: function(nativeEvent) {
            var i, j, ret, matched, handleObj, handlerQueue, args = new Array(arguments.length), event = jQuery3.event.fix(nativeEvent), handlers = (dataPriv.get(this, "events") || /* @__PURE__ */ Object.create(null))[event.type] || [], special = jQuery3.event.special[event.type] || {};
            args[0] = event;
            for (i = 1; i < arguments.length; i++) {
              args[i] = arguments[i];
            }
            event.delegateTarget = this;
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
              return;
            }
            handlerQueue = jQuery3.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
              event.currentTarget = matched.elem;
              j = 0;
              while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                if (!event.rnamespace || handleObj.namespace === false || event.rnamespace.test(handleObj.namespace)) {
                  event.handleObj = handleObj;
                  event.data = handleObj.data;
                  ret = ((jQuery3.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                  if (ret !== void 0) {
                    if ((event.result = ret) === false) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }
                }
              }
            }
            if (special.postDispatch) {
              special.postDispatch.call(this, event);
            }
            return event.result;
          },
          handlers: function(event, handlers) {
            var i, handleObj, sel, matchedHandlers, matchedSelectors, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            if (delegateCount && // Support: IE <=9
            // Black-hole SVG <use> instance trees (trac-13180)
            cur.nodeType && // Support: Firefox <=42
            // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
            // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
            // Support: IE 11 only
            // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
            !(event.type === "click" && event.button >= 1)) {
              for (; cur !== this; cur = cur.parentNode || this) {
                if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
                  matchedHandlers = [];
                  matchedSelectors = {};
                  for (i = 0; i < delegateCount; i++) {
                    handleObj = handlers[i];
                    sel = handleObj.selector + " ";
                    if (matchedSelectors[sel] === void 0) {
                      matchedSelectors[sel] = handleObj.needsContext ? jQuery3(sel, this).index(cur) > -1 : jQuery3.find(sel, this, null, [cur]).length;
                    }
                    if (matchedSelectors[sel]) {
                      matchedHandlers.push(handleObj);
                    }
                  }
                  if (matchedHandlers.length) {
                    handlerQueue.push({ elem: cur, handlers: matchedHandlers });
                  }
                }
              }
            }
            cur = this;
            if (delegateCount < handlers.length) {
              handlerQueue.push({ elem: cur, handlers: handlers.slice(delegateCount) });
            }
            return handlerQueue;
          },
          addProp: function(name, hook) {
            Object.defineProperty(jQuery3.Event.prototype, name, {
              enumerable: true,
              configurable: true,
              get: isFunction(hook) ? function() {
                if (this.originalEvent) {
                  return hook(this.originalEvent);
                }
              } : function() {
                if (this.originalEvent) {
                  return this.originalEvent[name];
                }
              },
              set: function(value) {
                Object.defineProperty(this, name, {
                  enumerable: true,
                  configurable: true,
                  writable: true,
                  value
                });
              }
            });
          },
          fix: function(originalEvent) {
            return originalEvent[jQuery3.expando] ? originalEvent : new jQuery3.Event(originalEvent);
          },
          special: {
            load: {
              // Prevent triggered image.load events from bubbling to window.load
              noBubble: true
            },
            click: {
              // Utilize native event to ensure correct state for checkable inputs
              setup: function(data) {
                var el = this || data;
                if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                  leverageNative(el, "click", true);
                }
                return false;
              },
              trigger: function(data) {
                var el = this || data;
                if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                  leverageNative(el, "click");
                }
                return true;
              },
              // For cross-browser consistency, suppress native .click() on links
              // Also prevent it if we're currently inside a leveraged native-event stack
              _default: function(event) {
                var target = event.target;
                return rcheckableType.test(target.type) && target.click && nodeName(target, "input") && dataPriv.get(target, "click") || nodeName(target, "a");
              }
            },
            beforeunload: {
              postDispatch: function(event) {
                if (event.result !== void 0 && event.originalEvent) {
                  event.originalEvent.returnValue = event.result;
                }
              }
            }
          }
        };
        function leverageNative(el, type, isSetup) {
          if (!isSetup) {
            if (dataPriv.get(el, type) === void 0) {
              jQuery3.event.add(el, type, returnTrue);
            }
            return;
          }
          dataPriv.set(el, type, false);
          jQuery3.event.add(el, type, {
            namespace: false,
            handler: function(event) {
              var result, saved = dataPriv.get(this, type);
              if (event.isTrigger & 1 && this[type]) {
                if (!saved) {
                  saved = slice.call(arguments);
                  dataPriv.set(this, type, saved);
                  this[type]();
                  result = dataPriv.get(this, type);
                  dataPriv.set(this, type, false);
                  if (saved !== result) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return result;
                  }
                } else if ((jQuery3.event.special[type] || {}).delegateType) {
                  event.stopPropagation();
                }
              } else if (saved) {
                dataPriv.set(this, type, jQuery3.event.trigger(
                  saved[0],
                  saved.slice(1),
                  this
                ));
                event.stopPropagation();
                event.isImmediatePropagationStopped = returnTrue;
              }
            }
          });
        }
        jQuery3.removeEvent = function(elem, type, handle) {
          if (elem.removeEventListener) {
            elem.removeEventListener(type, handle);
          }
        };
        jQuery3.Event = function(src, props) {
          if (!(this instanceof jQuery3.Event)) {
            return new jQuery3.Event(src, props);
          }
          if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === void 0 && // Support: Android <=2.3 only
            src.returnValue === false ? returnTrue : returnFalse;
            this.target = src.target && src.target.nodeType === 3 ? src.target.parentNode : src.target;
            this.currentTarget = src.currentTarget;
            this.relatedTarget = src.relatedTarget;
          } else {
            this.type = src;
          }
          if (props) {
            jQuery3.extend(this, props);
          }
          this.timeStamp = src && src.timeStamp || Date.now();
          this[jQuery3.expando] = true;
        };
        jQuery3.Event.prototype = {
          constructor: jQuery3.Event,
          isDefaultPrevented: returnFalse,
          isPropagationStopped: returnFalse,
          isImmediatePropagationStopped: returnFalse,
          isSimulated: false,
          preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && !this.isSimulated) {
              e.preventDefault();
            }
          },
          stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && !this.isSimulated) {
              e.stopPropagation();
            }
          },
          stopImmediatePropagation: function() {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && !this.isSimulated) {
              e.stopImmediatePropagation();
            }
            this.stopPropagation();
          }
        };
        jQuery3.each({
          altKey: true,
          bubbles: true,
          cancelable: true,
          changedTouches: true,
          ctrlKey: true,
          detail: true,
          eventPhase: true,
          metaKey: true,
          pageX: true,
          pageY: true,
          shiftKey: true,
          view: true,
          "char": true,
          code: true,
          charCode: true,
          key: true,
          keyCode: true,
          button: true,
          buttons: true,
          clientX: true,
          clientY: true,
          offsetX: true,
          offsetY: true,
          pointerId: true,
          pointerType: true,
          screenX: true,
          screenY: true,
          targetTouches: true,
          toElement: true,
          touches: true,
          which: true
        }, jQuery3.event.addProp);
        jQuery3.each({ focus: "focusin", blur: "focusout" }, function(type, delegateType) {
          function focusMappedHandler(nativeEvent) {
            if (document2.documentMode) {
              var handle = dataPriv.get(this, "handle"), event = jQuery3.event.fix(nativeEvent);
              event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
              event.isSimulated = true;
              handle(nativeEvent);
              if (event.target === event.currentTarget) {
                handle(event);
              }
            } else {
              jQuery3.event.simulate(
                delegateType,
                nativeEvent.target,
                jQuery3.event.fix(nativeEvent)
              );
            }
          }
          jQuery3.event.special[type] = {
            // Utilize native event if possible so blur/focus sequence is correct
            setup: function() {
              var attaches;
              leverageNative(this, type, true);
              if (document2.documentMode) {
                attaches = dataPriv.get(this, delegateType);
                if (!attaches) {
                  this.addEventListener(delegateType, focusMappedHandler);
                }
                dataPriv.set(this, delegateType, (attaches || 0) + 1);
              } else {
                return false;
              }
            },
            trigger: function() {
              leverageNative(this, type);
              return true;
            },
            teardown: function() {
              var attaches;
              if (document2.documentMode) {
                attaches = dataPriv.get(this, delegateType) - 1;
                if (!attaches) {
                  this.removeEventListener(delegateType, focusMappedHandler);
                  dataPriv.remove(this, delegateType);
                } else {
                  dataPriv.set(this, delegateType, attaches);
                }
              } else {
                return false;
              }
            },
            // Suppress native focus or blur if we're currently inside
            // a leveraged native-event stack
            _default: function(event) {
              return dataPriv.get(event.target, type);
            },
            delegateType
          };
          jQuery3.event.special[delegateType] = {
            setup: function() {
              var doc = this.ownerDocument || this.document || this, dataHolder = document2.documentMode ? this : doc, attaches = dataPriv.get(dataHolder, delegateType);
              if (!attaches) {
                if (document2.documentMode) {
                  this.addEventListener(delegateType, focusMappedHandler);
                } else {
                  doc.addEventListener(type, focusMappedHandler, true);
                }
              }
              dataPriv.set(dataHolder, delegateType, (attaches || 0) + 1);
            },
            teardown: function() {
              var doc = this.ownerDocument || this.document || this, dataHolder = document2.documentMode ? this : doc, attaches = dataPriv.get(dataHolder, delegateType) - 1;
              if (!attaches) {
                if (document2.documentMode) {
                  this.removeEventListener(delegateType, focusMappedHandler);
                } else {
                  doc.removeEventListener(type, focusMappedHandler, true);
                }
                dataPriv.remove(dataHolder, delegateType);
              } else {
                dataPriv.set(dataHolder, delegateType, attaches);
              }
            }
          };
        });
        jQuery3.each({
          mouseenter: "mouseover",
          mouseleave: "mouseout",
          pointerenter: "pointerover",
          pointerleave: "pointerout"
        }, function(orig, fix) {
          jQuery3.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
              var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
              if (!related || related !== target && !jQuery3.contains(target, related)) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                event.type = fix;
              }
              return ret;
            }
          };
        });
        jQuery3.fn.extend({
          on: function(types, selector, data, fn) {
            return on(this, types, selector, data, fn);
          },
          one: function(types, selector, data, fn) {
            return on(this, types, selector, data, fn, 1);
          },
          off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
              handleObj = types.handleObj;
              jQuery3(types.delegateTarget).off(
                handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                handleObj.selector,
                handleObj.handler
              );
              return this;
            }
            if (typeof types === "object") {
              for (type in types) {
                this.off(type, selector, types[type]);
              }
              return this;
            }
            if (selector === false || typeof selector === "function") {
              fn = selector;
              selector = void 0;
            }
            if (fn === false) {
              fn = returnFalse;
            }
            return this.each(function() {
              jQuery3.event.remove(this, types, fn, selector);
            });
          }
        });
        var rnoInnerhtml = /<script|<style|<link/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rcleanScript = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
        function manipulationTarget(elem, content2) {
          if (nodeName(elem, "table") && nodeName(content2.nodeType !== 11 ? content2 : content2.firstChild, "tr")) {
            return jQuery3(elem).children("tbody")[0] || elem;
          }
          return elem;
        }
        function disableScript(elem) {
          elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
          return elem;
        }
        function restoreScript(elem) {
          if ((elem.type || "").slice(0, 5) === "true/") {
            elem.type = elem.type.slice(5);
          } else {
            elem.removeAttribute("type");
          }
          return elem;
        }
        function cloneCopyEvent(src, dest) {
          var i, l, type, pdataOld, udataOld, udataCur, events;
          if (dest.nodeType !== 1) {
            return;
          }
          if (dataPriv.hasData(src)) {
            pdataOld = dataPriv.get(src);
            events = pdataOld.events;
            if (events) {
              dataPriv.remove(dest, "handle events");
              for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                  jQuery3.event.add(dest, type, events[type][i]);
                }
              }
            }
          }
          if (dataUser.hasData(src)) {
            udataOld = dataUser.access(src);
            udataCur = jQuery3.extend({}, udataOld);
            dataUser.set(dest, udataCur);
          }
        }
        function fixInput(src, dest) {
          var nodeName2 = dest.nodeName.toLowerCase();
          if (nodeName2 === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
          } else if (nodeName2 === "input" || nodeName2 === "textarea") {
            dest.defaultValue = src.defaultValue;
          }
        }
        function domManip(collection, args, callback, ignored) {
          args = flat(args);
          var fragment, first, scripts, hasScripts, node, doc, i = 0, l = collection.length, iNoClone = l - 1, value = args[0], valueIsFunction = isFunction(value);
          if (valueIsFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
            return collection.each(function(index) {
              var self2 = collection.eq(index);
              if (valueIsFunction) {
                args[0] = value.call(this, index, self2.html());
              }
              domManip(self2, args, callback, ignored);
            });
          }
          if (l) {
            fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
            first = fragment.firstChild;
            if (fragment.childNodes.length === 1) {
              fragment = first;
            }
            if (first || ignored) {
              scripts = jQuery3.map(getAll(fragment, "script"), disableScript);
              hasScripts = scripts.length;
              for (; i < l; i++) {
                node = fragment;
                if (i !== iNoClone) {
                  node = jQuery3.clone(node, true, true);
                  if (hasScripts) {
                    jQuery3.merge(scripts, getAll(node, "script"));
                  }
                }
                callback.call(collection[i], node, i);
              }
              if (hasScripts) {
                doc = scripts[scripts.length - 1].ownerDocument;
                jQuery3.map(scripts, restoreScript);
                for (i = 0; i < hasScripts; i++) {
                  node = scripts[i];
                  if (rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery3.contains(doc, node)) {
                    if (node.src && (node.type || "").toLowerCase() !== "module") {
                      if (jQuery3._evalUrl && !node.noModule) {
                        jQuery3._evalUrl(node.src, {
                          nonce: node.nonce || node.getAttribute("nonce")
                        }, doc);
                      }
                    } else {
                      DOMEval(node.textContent.replace(rcleanScript, ""), node, doc);
                    }
                  }
                }
              }
            }
          }
          return collection;
        }
        function remove(elem, selector, keepData) {
          var node, nodes = selector ? jQuery3.filter(selector, elem) : elem, i = 0;
          for (; (node = nodes[i]) != null; i++) {
            if (!keepData && node.nodeType === 1) {
              jQuery3.cleanData(getAll(node));
            }
            if (node.parentNode) {
              if (keepData && isAttached(node)) {
                setGlobalEval(getAll(node, "script"));
              }
              node.parentNode.removeChild(node);
            }
          }
          return elem;
        }
        jQuery3.extend({
          htmlPrefilter: function(html) {
            return html;
          },
          clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var i, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = isAttached(elem);
            if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery3.isXMLDoc(elem)) {
              destElements = getAll(clone);
              srcElements = getAll(elem);
              for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
              }
            }
            if (dataAndEvents) {
              if (deepDataAndEvents) {
                srcElements = srcElements || getAll(elem);
                destElements = destElements || getAll(clone);
                for (i = 0, l = srcElements.length; i < l; i++) {
                  cloneCopyEvent(srcElements[i], destElements[i]);
                }
              } else {
                cloneCopyEvent(elem, clone);
              }
            }
            destElements = getAll(clone, "script");
            if (destElements.length > 0) {
              setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            }
            return clone;
          },
          cleanData: function(elems) {
            var data, elem, type, special = jQuery3.event.special, i = 0;
            for (; (elem = elems[i]) !== void 0; i++) {
              if (acceptData(elem)) {
                if (data = elem[dataPriv.expando]) {
                  if (data.events) {
                    for (type in data.events) {
                      if (special[type]) {
                        jQuery3.event.remove(elem, type);
                      } else {
                        jQuery3.removeEvent(elem, type, data.handle);
                      }
                    }
                  }
                  elem[dataPriv.expando] = void 0;
                }
                if (elem[dataUser.expando]) {
                  elem[dataUser.expando] = void 0;
                }
              }
            }
          }
        });
        jQuery3.fn.extend({
          detach: function(selector) {
            return remove(this, selector, true);
          },
          remove: function(selector) {
            return remove(this, selector);
          },
          text: function(value) {
            return access(this, function(value2) {
              return value2 === void 0 ? jQuery3.text(this) : this.empty().each(function() {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                  this.textContent = value2;
                }
              });
            }, null, value, arguments.length);
          },
          append: function() {
            return domManip(this, arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.appendChild(elem);
              }
            });
          },
          prepend: function() {
            return domManip(this, arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.insertBefore(elem, target.firstChild);
              }
            });
          },
          before: function() {
            return domManip(this, arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
              }
            });
          },
          after: function() {
            return domManip(this, arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this.nextSibling);
              }
            });
          },
          empty: function() {
            var elem, i = 0;
            for (; (elem = this[i]) != null; i++) {
              if (elem.nodeType === 1) {
                jQuery3.cleanData(getAll(elem, false));
                elem.textContent = "";
              }
            }
            return this;
          },
          clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
              return jQuery3.clone(this, dataAndEvents, deepDataAndEvents);
            });
          },
          html: function(value) {
            return access(this, function(value2) {
              var elem = this[0] || {}, i = 0, l = this.length;
              if (value2 === void 0 && elem.nodeType === 1) {
                return elem.innerHTML;
              }
              if (typeof value2 === "string" && !rnoInnerhtml.test(value2) && !wrapMap[(rtagName.exec(value2) || ["", ""])[1].toLowerCase()]) {
                value2 = jQuery3.htmlPrefilter(value2);
                try {
                  for (; i < l; i++) {
                    elem = this[i] || {};
                    if (elem.nodeType === 1) {
                      jQuery3.cleanData(getAll(elem, false));
                      elem.innerHTML = value2;
                    }
                  }
                  elem = 0;
                } catch (e) {
                }
              }
              if (elem) {
                this.empty().append(value2);
              }
            }, null, value, arguments.length);
          },
          replaceWith: function() {
            var ignored = [];
            return domManip(this, arguments, function(elem) {
              var parent = this.parentNode;
              if (jQuery3.inArray(this, ignored) < 0) {
                jQuery3.cleanData(getAll(this));
                if (parent) {
                  parent.replaceChild(elem, this);
                }
              }
            }, ignored);
          }
        });
        jQuery3.each({
          appendTo: "append",
          prependTo: "prepend",
          insertBefore: "before",
          insertAfter: "after",
          replaceAll: "replaceWith"
        }, function(name, original) {
          jQuery3.fn[name] = function(selector) {
            var elems, ret = [], insert = jQuery3(selector), last = insert.length - 1, i = 0;
            for (; i <= last; i++) {
              elems = i === last ? this : this.clone(true);
              jQuery3(insert[i])[original](elems);
              push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
          };
        });
        var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
        var rcustomProp = /^--/;
        var getStyles = function(elem) {
          var view = elem.ownerDocument.defaultView;
          if (!view || !view.opener) {
            view = window2;
          }
          return view.getComputedStyle(elem);
        };
        var swap = function(elem, options, callback) {
          var ret, name, old = {};
          for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
          }
          ret = callback.call(elem);
          for (name in options) {
            elem.style[name] = old[name];
          }
          return ret;
        };
        var rboxStyle = new RegExp(cssExpand.join("|"), "i");
        (function() {
          function computeStyleTests() {
            if (!div) {
              return;
            }
            container.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0";
            div.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%";
            documentElement.appendChild(container).appendChild(div);
            var divStyle = window2.getComputedStyle(div);
            pixelPositionVal = divStyle.top !== "1%";
            reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12;
            div.style.right = "60%";
            pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;
            boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36;
            div.style.position = "absolute";
            scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3) === 12;
            documentElement.removeChild(container);
            div = null;
          }
          function roundPixelMeasures(measure) {
            return Math.round(parseFloat(measure));
          }
          var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal, reliableTrDimensionsVal, reliableMarginLeftVal, container = document2.createElement("div"), div = document2.createElement("div");
          if (!div.style) {
            return;
          }
          div.style.backgroundClip = "content-box";
          div.cloneNode(true).style.backgroundClip = "";
          support.clearCloneStyle = div.style.backgroundClip === "content-box";
          jQuery3.extend(support, {
            boxSizingReliable: function() {
              computeStyleTests();
              return boxSizingReliableVal;
            },
            pixelBoxStyles: function() {
              computeStyleTests();
              return pixelBoxStylesVal;
            },
            pixelPosition: function() {
              computeStyleTests();
              return pixelPositionVal;
            },
            reliableMarginLeft: function() {
              computeStyleTests();
              return reliableMarginLeftVal;
            },
            scrollboxSize: function() {
              computeStyleTests();
              return scrollboxSizeVal;
            },
            // Support: IE 9 - 11+, Edge 15 - 18+
            // IE/Edge misreport `getComputedStyle` of table rows with width/height
            // set in CSS while `offset*` properties report correct values.
            // Behavior in IE 9 is more subtle than in newer versions & it passes
            // some versions of this test; make sure not to make it pass there!
            //
            // Support: Firefox 70+
            // Only Firefox includes border widths
            // in computed dimensions. (gh-4529)
            reliableTrDimensions: function() {
              var table, tr, trChild, trStyle;
              if (reliableTrDimensionsVal == null) {
                table = document2.createElement("table");
                tr = document2.createElement("tr");
                trChild = document2.createElement("div");
                table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
                tr.style.cssText = "box-sizing:content-box;border:1px solid";
                tr.style.height = "1px";
                trChild.style.height = "9px";
                trChild.style.display = "block";
                documentElement.appendChild(table).appendChild(tr).appendChild(trChild);
                trStyle = window2.getComputedStyle(tr);
                reliableTrDimensionsVal = parseInt(trStyle.height, 10) + parseInt(trStyle.borderTopWidth, 10) + parseInt(trStyle.borderBottomWidth, 10) === tr.offsetHeight;
                documentElement.removeChild(table);
              }
              return reliableTrDimensionsVal;
            }
          });
        })();
        function curCSS(elem, name, computed) {
          var width, minWidth, maxWidth, ret, isCustomProp = rcustomProp.test(name), style = elem.style;
          computed = computed || getStyles(elem);
          if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
            if (isCustomProp && ret) {
              ret = ret.replace(rtrimCSS, "$1") || void 0;
            }
            if (ret === "" && !isAttached(elem)) {
              ret = jQuery3.style(elem, name);
            }
            if (!support.pixelBoxStyles() && rnumnonpx.test(ret) && rboxStyle.test(name)) {
              width = style.width;
              minWidth = style.minWidth;
              maxWidth = style.maxWidth;
              style.minWidth = style.maxWidth = style.width = ret;
              ret = computed.width;
              style.width = width;
              style.minWidth = minWidth;
              style.maxWidth = maxWidth;
            }
          }
          return ret !== void 0 ? (
            // Support: IE <=9 - 11 only
            // IE returns zIndex value as an integer.
            ret + ""
          ) : ret;
        }
        function addGetHookIf(conditionFn, hookFn) {
          return {
            get: function() {
              if (conditionFn()) {
                delete this.get;
                return;
              }
              return (this.get = hookFn).apply(this, arguments);
            }
          };
        }
        var cssPrefixes = ["Webkit", "Moz", "ms"], emptyStyle = document2.createElement("div").style, vendorProps = {};
        function vendorPropName(name) {
          var capName = name[0].toUpperCase() + name.slice(1), i = cssPrefixes.length;
          while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in emptyStyle) {
              return name;
            }
          }
        }
        function finalPropName(name) {
          var final = jQuery3.cssProps[name] || vendorProps[name];
          if (final) {
            return final;
          }
          if (name in emptyStyle) {
            return name;
          }
          return vendorProps[name] = vendorPropName(name) || name;
        }
        var rdisplayswap = /^(none|table(?!-c[ea]).+)/, cssShow = { position: "absolute", visibility: "hidden", display: "block" }, cssNormalTransform = {
          letterSpacing: "0",
          fontWeight: "400"
        };
        function setPositiveNumber(_elem, value, subtract) {
          var matches = rcssNum.exec(value);
          return matches ? (
            // Guard against undefined "subtract", e.g., when used as in cssHooks
            Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px")
          ) : value;
        }
        function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
          var i = dimension === "width" ? 1 : 0, extra = 0, delta = 0, marginDelta = 0;
          if (box === (isBorderBox ? "border" : "content")) {
            return 0;
          }
          for (; i < 4; i += 2) {
            if (box === "margin") {
              marginDelta += jQuery3.css(elem, box + cssExpand[i], true, styles);
            }
            if (!isBorderBox) {
              delta += jQuery3.css(elem, "padding" + cssExpand[i], true, styles);
              if (box !== "padding") {
                delta += jQuery3.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              } else {
                extra += jQuery3.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            } else {
              if (box === "content") {
                delta -= jQuery3.css(elem, "padding" + cssExpand[i], true, styles);
              }
              if (box !== "margin") {
                delta -= jQuery3.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            }
          }
          if (!isBorderBox && computedVal >= 0) {
            delta += Math.max(0, Math.ceil(
              elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - 0.5
              // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
              // Use an explicit zero to avoid NaN (gh-3964)
            )) || 0;
          }
          return delta + marginDelta;
        }
        function getWidthOrHeight(elem, dimension, extra) {
          var styles = getStyles(elem), boxSizingNeeded = !support.boxSizingReliable() || extra, isBorderBox = boxSizingNeeded && jQuery3.css(elem, "boxSizing", false, styles) === "border-box", valueIsBorderBox = isBorderBox, val = curCSS(elem, dimension, styles), offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);
          if (rnumnonpx.test(val)) {
            if (!extra) {
              return val;
            }
            val = "auto";
          }
          if ((!support.boxSizingReliable() && isBorderBox || // Support: IE 10 - 11+, Edge 15 - 18+
          // IE/Edge misreport `getComputedStyle` of table rows with width/height
          // set in CSS while `offset*` properties report correct values.
          // Interestingly, in some cases IE 9 doesn't suffer from this issue.
          !support.reliableTrDimensions() && nodeName(elem, "tr") || // Fall back to offsetWidth/offsetHeight when value is "auto"
          // This happens for inline elements with no explicit setting (gh-3571)
          val === "auto" || // Support: Android <=4.1 - 4.3 only
          // Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
          !parseFloat(val) && jQuery3.css(elem, "display", false, styles) === "inline") && // Make sure the element is visible & connected
          elem.getClientRects().length) {
            isBorderBox = jQuery3.css(elem, "boxSizing", false, styles) === "border-box";
            valueIsBorderBox = offsetProp in elem;
            if (valueIsBorderBox) {
              val = elem[offsetProp];
            }
          }
          val = parseFloat(val) || 0;
          return val + boxModelAdjustment(
            elem,
            dimension,
            extra || (isBorderBox ? "border" : "content"),
            valueIsBorderBox,
            styles,
            // Provide the current computed size to request scroll gutter calculation (gh-3589)
            val
          ) + "px";
        }
        jQuery3.extend({
          // Add in style property hooks for overriding the default
          // behavior of getting and setting a style property
          cssHooks: {
            opacity: {
              get: function(elem, computed) {
                if (computed) {
                  var ret = curCSS(elem, "opacity");
                  return ret === "" ? "1" : ret;
                }
              }
            }
          },
          // Don't automatically add "px" to these possibly-unitless properties
          cssNumber: {
            animationIterationCount: true,
            aspectRatio: true,
            borderImageSlice: true,
            columnCount: true,
            flexGrow: true,
            flexShrink: true,
            fontWeight: true,
            gridArea: true,
            gridColumn: true,
            gridColumnEnd: true,
            gridColumnStart: true,
            gridRow: true,
            gridRowEnd: true,
            gridRowStart: true,
            lineHeight: true,
            opacity: true,
            order: true,
            orphans: true,
            scale: true,
            widows: true,
            zIndex: true,
            zoom: true,
            // SVG-related
            fillOpacity: true,
            floodOpacity: true,
            stopOpacity: true,
            strokeMiterlimit: true,
            strokeOpacity: true
          },
          // Add in properties whose names you wish to fix before
          // setting or getting the value
          cssProps: {},
          // Get and set the style property on a DOM Node
          style: function(elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
              return;
            }
            var ret, type, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name), style = elem.style;
            if (!isCustomProp) {
              name = finalPropName(origName);
            }
            hooks = jQuery3.cssHooks[name] || jQuery3.cssHooks[origName];
            if (value !== void 0) {
              type = typeof value;
              if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
                value = adjustCSS(elem, name, ret);
                type = "number";
              }
              if (value == null || value !== value) {
                return;
              }
              if (type === "number" && !isCustomProp) {
                value += ret && ret[3] || (jQuery3.cssNumber[origName] ? "" : "px");
              }
              if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
              }
              if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== void 0) {
                if (isCustomProp) {
                  style.setProperty(name, value);
                } else {
                  style[name] = value;
                }
              }
            } else {
              if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== void 0) {
                return ret;
              }
              return style[name];
            }
          },
          css: function(elem, name, extra, styles) {
            var val, num, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name);
            if (!isCustomProp) {
              name = finalPropName(origName);
            }
            hooks = jQuery3.cssHooks[name] || jQuery3.cssHooks[origName];
            if (hooks && "get" in hooks) {
              val = hooks.get(elem, true, extra);
            }
            if (val === void 0) {
              val = curCSS(elem, name, styles);
            }
            if (val === "normal" && name in cssNormalTransform) {
              val = cssNormalTransform[name];
            }
            if (extra === "" || extra) {
              num = parseFloat(val);
              return extra === true || isFinite(num) ? num || 0 : val;
            }
            return val;
          }
        });
        jQuery3.each(["height", "width"], function(_i, dimension) {
          jQuery3.cssHooks[dimension] = {
            get: function(elem, computed, extra) {
              if (computed) {
                return rdisplayswap.test(jQuery3.css(elem, "display")) && // Support: Safari 8+
                // Table columns in Safari have non-zero offsetWidth & zero
                // getBoundingClientRect().width unless display is changed.
                // Support: IE <=11 only
                // Running getBoundingClientRect on a disconnected node
                // in IE throws an error.
                (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ? swap(elem, cssShow, function() {
                  return getWidthOrHeight(elem, dimension, extra);
                }) : getWidthOrHeight(elem, dimension, extra);
              }
            },
            set: function(elem, value, extra) {
              var matches, styles = getStyles(elem), scrollboxSizeBuggy = !support.scrollboxSize() && styles.position === "absolute", boxSizingNeeded = scrollboxSizeBuggy || extra, isBorderBox = boxSizingNeeded && jQuery3.css(elem, "boxSizing", false, styles) === "border-box", subtract = extra ? boxModelAdjustment(
                elem,
                dimension,
                extra,
                isBorderBox,
                styles
              ) : 0;
              if (isBorderBox && scrollboxSizeBuggy) {
                subtract -= Math.ceil(
                  elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - parseFloat(styles[dimension]) - boxModelAdjustment(elem, dimension, "border", false, styles) - 0.5
                );
              }
              if (subtract && (matches = rcssNum.exec(value)) && (matches[3] || "px") !== "px") {
                elem.style[dimension] = value;
                value = jQuery3.css(elem, dimension);
              }
              return setPositiveNumber(elem, value, subtract);
            }
          };
        });
        jQuery3.cssHooks.marginLeft = addGetHookIf(
          support.reliableMarginLeft,
          function(elem, computed) {
            if (computed) {
              return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, { marginLeft: 0 }, function() {
                return elem.getBoundingClientRect().left;
              })) + "px";
            }
          }
        );
        jQuery3.each({
          margin: "",
          padding: "",
          border: "Width"
        }, function(prefix, suffix) {
          jQuery3.cssHooks[prefix + suffix] = {
            expand: function(value) {
              var i = 0, expanded = {}, parts = typeof value === "string" ? value.split(" ") : [value];
              for (; i < 4; i++) {
                expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
              }
              return expanded;
            }
          };
          if (prefix !== "margin") {
            jQuery3.cssHooks[prefix + suffix].set = setPositiveNumber;
          }
        });
        jQuery3.fn.extend({
          css: function(name, value) {
            return access(this, function(elem, name2, value2) {
              var styles, len, map = {}, i = 0;
              if (Array.isArray(name2)) {
                styles = getStyles(elem);
                len = name2.length;
                for (; i < len; i++) {
                  map[name2[i]] = jQuery3.css(elem, name2[i], false, styles);
                }
                return map;
              }
              return value2 !== void 0 ? jQuery3.style(elem, name2, value2) : jQuery3.css(elem, name2);
            }, name, value, arguments.length > 1);
          }
        });
        function Tween(elem, options, prop, end, easing) {
          return new Tween.prototype.init(elem, options, prop, end, easing);
        }
        jQuery3.Tween = Tween;
        Tween.prototype = {
          constructor: Tween,
          init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || jQuery3.easing._default;
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery3.cssNumber[prop] ? "" : "px");
          },
          cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
          },
          run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
              this.pos = eased = jQuery3.easing[this.easing](
                percent,
                this.options.duration * percent,
                0,
                1,
                this.options.duration
              );
            } else {
              this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
              this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
              hooks.set(this);
            } else {
              Tween.propHooks._default.set(this);
            }
            return this;
          }
        };
        Tween.prototype.init.prototype = Tween.prototype;
        Tween.propHooks = {
          _default: {
            get: function(tween) {
              var result;
              if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
                return tween.elem[tween.prop];
              }
              result = jQuery3.css(tween.elem, tween.prop, "");
              return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {
              if (jQuery3.fx.step[tween.prop]) {
                jQuery3.fx.step[tween.prop](tween);
              } else if (tween.elem.nodeType === 1 && (jQuery3.cssHooks[tween.prop] || tween.elem.style[finalPropName(tween.prop)] != null)) {
                jQuery3.style(tween.elem, tween.prop, tween.now + tween.unit);
              } else {
                tween.elem[tween.prop] = tween.now;
              }
            }
          }
        };
        Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
          set: function(tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
              tween.elem[tween.prop] = tween.now;
            }
          }
        };
        jQuery3.easing = {
          linear: function(p) {
            return p;
          },
          swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
          },
          _default: "swing"
        };
        jQuery3.fx = Tween.prototype.init;
        jQuery3.fx.step = {};
        var fxNow, inProgress, rfxtypes = /^(?:toggle|show|hide)$/, rrun = /queueHooks$/;
        function schedule() {
          if (inProgress) {
            if (document2.hidden === false && window2.requestAnimationFrame) {
              window2.requestAnimationFrame(schedule);
            } else {
              window2.setTimeout(schedule, jQuery3.fx.interval);
            }
            jQuery3.fx.tick();
          }
        }
        function createFxNow() {
          window2.setTimeout(function() {
            fxNow = void 0;
          });
          return fxNow = Date.now();
        }
        function genFx(type, includeWidth) {
          var which, i = 0, attrs = { height: type };
          includeWidth = includeWidth ? 1 : 0;
          for (; i < 4; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
          }
          if (includeWidth) {
            attrs.opacity = attrs.width = type;
          }
          return attrs;
        }
        function createTween(value, prop, animation) {
          var tween, collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]), index = 0, length = collection.length;
          for (; index < length; index++) {
            if (tween = collection[index].call(animation, prop, value)) {
              return tween;
            }
          }
        }
        function defaultPrefilter(elem, props, opts) {
          var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display, isBox = "width" in props || "height" in props, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHiddenWithinTree(elem), dataShow = dataPriv.get(elem, "fxshow");
          if (!opts.queue) {
            hooks = jQuery3._queueHooks(elem, "fx");
            if (hooks.unqueued == null) {
              hooks.unqueued = 0;
              oldfire = hooks.empty.fire;
              hooks.empty.fire = function() {
                if (!hooks.unqueued) {
                  oldfire();
                }
              };
            }
            hooks.unqueued++;
            anim.always(function() {
              anim.always(function() {
                hooks.unqueued--;
                if (!jQuery3.queue(elem, "fx").length) {
                  hooks.empty.fire();
                }
              });
            });
          }
          for (prop in props) {
            value = props[prop];
            if (rfxtypes.test(value)) {
              delete props[prop];
              toggle = toggle || value === "toggle";
              if (value === (hidden ? "hide" : "show")) {
                if (value === "show" && dataShow && dataShow[prop] !== void 0) {
                  hidden = true;
                } else {
                  continue;
                }
              }
              orig[prop] = dataShow && dataShow[prop] || jQuery3.style(elem, prop);
            }
          }
          propTween = !jQuery3.isEmptyObject(props);
          if (!propTween && jQuery3.isEmptyObject(orig)) {
            return;
          }
          if (isBox && elem.nodeType === 1) {
            opts.overflow = [style.overflow, style.overflowX, style.overflowY];
            restoreDisplay = dataShow && dataShow.display;
            if (restoreDisplay == null) {
              restoreDisplay = dataPriv.get(elem, "display");
            }
            display = jQuery3.css(elem, "display");
            if (display === "none") {
              if (restoreDisplay) {
                display = restoreDisplay;
              } else {
                showHide([elem], true);
                restoreDisplay = elem.style.display || restoreDisplay;
                display = jQuery3.css(elem, "display");
                showHide([elem]);
              }
            }
            if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
              if (jQuery3.css(elem, "float") === "none") {
                if (!propTween) {
                  anim.done(function() {
                    style.display = restoreDisplay;
                  });
                  if (restoreDisplay == null) {
                    display = style.display;
                    restoreDisplay = display === "none" ? "" : display;
                  }
                }
                style.display = "inline-block";
              }
            }
          }
          if (opts.overflow) {
            style.overflow = "hidden";
            anim.always(function() {
              style.overflow = opts.overflow[0];
              style.overflowX = opts.overflow[1];
              style.overflowY = opts.overflow[2];
            });
          }
          propTween = false;
          for (prop in orig) {
            if (!propTween) {
              if (dataShow) {
                if ("hidden" in dataShow) {
                  hidden = dataShow.hidden;
                }
              } else {
                dataShow = dataPriv.access(elem, "fxshow", { display: restoreDisplay });
              }
              if (toggle) {
                dataShow.hidden = !hidden;
              }
              if (hidden) {
                showHide([elem], true);
              }
              anim.done(function() {
                if (!hidden) {
                  showHide([elem]);
                }
                dataPriv.remove(elem, "fxshow");
                for (prop in orig) {
                  jQuery3.style(elem, prop, orig[prop]);
                }
              });
            }
            propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
            if (!(prop in dataShow)) {
              dataShow[prop] = propTween.start;
              if (hidden) {
                propTween.end = propTween.start;
                propTween.start = 0;
              }
            }
          }
        }
        function propFilter(props, specialEasing) {
          var index, name, easing, value, hooks;
          for (index in props) {
            name = camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (Array.isArray(value)) {
              easing = value[1];
              value = props[index] = value[0];
            }
            if (index !== name) {
              props[name] = value;
              delete props[index];
            }
            hooks = jQuery3.cssHooks[name];
            if (hooks && "expand" in hooks) {
              value = hooks.expand(value);
              delete props[name];
              for (index in value) {
                if (!(index in props)) {
                  props[index] = value[index];
                  specialEasing[index] = easing;
                }
              }
            } else {
              specialEasing[name] = easing;
            }
          }
        }
        function Animation(elem, properties, options) {
          var result, stopped, index = 0, length = Animation.prefilters.length, deferred = jQuery3.Deferred().always(function() {
            delete tick.elem;
          }), tick = function() {
            if (stopped) {
              return false;
            }
            var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index2 = 0, length2 = animation.tweens.length;
            for (; index2 < length2; index2++) {
              animation.tweens[index2].run(percent);
            }
            deferred.notifyWith(elem, [animation, percent, remaining]);
            if (percent < 1 && length2) {
              return remaining;
            }
            if (!length2) {
              deferred.notifyWith(elem, [animation, 1, 0]);
            }
            deferred.resolveWith(elem, [animation]);
            return false;
          }, animation = deferred.promise({
            elem,
            props: jQuery3.extend({}, properties),
            opts: jQuery3.extend(true, {
              specialEasing: {},
              easing: jQuery3.easing._default
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
              var tween = jQuery3.Tween(
                elem,
                animation.opts,
                prop,
                end,
                animation.opts.specialEasing[prop] || animation.opts.easing
              );
              animation.tweens.push(tween);
              return tween;
            },
            stop: function(gotoEnd) {
              var index2 = 0, length2 = gotoEnd ? animation.tweens.length : 0;
              if (stopped) {
                return this;
              }
              stopped = true;
              for (; index2 < length2; index2++) {
                animation.tweens[index2].run(1);
              }
              if (gotoEnd) {
                deferred.notifyWith(elem, [animation, 1, 0]);
                deferred.resolveWith(elem, [animation, gotoEnd]);
              } else {
                deferred.rejectWith(elem, [animation, gotoEnd]);
              }
              return this;
            }
          }), props = animation.props;
          propFilter(props, animation.opts.specialEasing);
          for (; index < length; index++) {
            result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
              if (isFunction(result.stop)) {
                jQuery3._queueHooks(animation.elem, animation.opts.queue).stop = result.stop.bind(result);
              }
              return result;
            }
          }
          jQuery3.map(props, createTween, animation);
          if (isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
          }
          animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
          jQuery3.fx.timer(
            jQuery3.extend(tick, {
              elem,
              anim: animation,
              queue: animation.opts.queue
            })
          );
          return animation;
        }
        jQuery3.Animation = jQuery3.extend(Animation, {
          tweeners: {
            "*": [function(prop, value) {
              var tween = this.createTween(prop, value);
              adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
              return tween;
            }]
          },
          tweener: function(props, callback) {
            if (isFunction(props)) {
              callback = props;
              props = ["*"];
            } else {
              props = props.match(rnothtmlwhite);
            }
            var prop, index = 0, length = props.length;
            for (; index < length; index++) {
              prop = props[index];
              Animation.tweeners[prop] = Animation.tweeners[prop] || [];
              Animation.tweeners[prop].unshift(callback);
            }
          },
          prefilters: [defaultPrefilter],
          prefilter: function(callback, prepend) {
            if (prepend) {
              Animation.prefilters.unshift(callback);
            } else {
              Animation.prefilters.push(callback);
            }
          }
        });
        jQuery3.speed = function(speed, easing, fn) {
          var opt = speed && typeof speed === "object" ? jQuery3.extend({}, speed) : {
            complete: fn || !fn && easing || isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !isFunction(easing) && easing
          };
          if (jQuery3.fx.off) {
            opt.duration = 0;
          } else {
            if (typeof opt.duration !== "number") {
              if (opt.duration in jQuery3.fx.speeds) {
                opt.duration = jQuery3.fx.speeds[opt.duration];
              } else {
                opt.duration = jQuery3.fx.speeds._default;
              }
            }
          }
          if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
          }
          opt.old = opt.complete;
          opt.complete = function() {
            if (isFunction(opt.old)) {
              opt.old.call(this);
            }
            if (opt.queue) {
              jQuery3.dequeue(this, opt.queue);
            }
          };
          return opt;
        };
        jQuery3.fn.extend({
          fadeTo: function(speed, to, easing, callback) {
            return this.filter(isHiddenWithinTree).css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
          },
          animate: function(prop, speed, easing, callback) {
            var empty = jQuery3.isEmptyObject(prop), optall = jQuery3.speed(speed, easing, callback), doAnimation = function() {
              var anim = Animation(this, jQuery3.extend({}, prop), optall);
              if (empty || dataPriv.get(this, "finish")) {
                anim.stop(true);
              }
            };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
          },
          stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
              var stop = hooks.stop;
              delete hooks.stop;
              stop(gotoEnd);
            };
            if (typeof type !== "string") {
              gotoEnd = clearQueue;
              clearQueue = type;
              type = void 0;
            }
            if (clearQueue) {
              this.queue(type || "fx", []);
            }
            return this.each(function() {
              var dequeue = true, index = type != null && type + "queueHooks", timers = jQuery3.timers, data = dataPriv.get(this);
              if (index) {
                if (data[index] && data[index].stop) {
                  stopQueue(data[index]);
                }
              } else {
                for (index in data) {
                  if (data[index] && data[index].stop && rrun.test(index)) {
                    stopQueue(data[index]);
                  }
                }
              }
              for (index = timers.length; index--; ) {
                if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                  timers[index].anim.stop(gotoEnd);
                  dequeue = false;
                  timers.splice(index, 1);
                }
              }
              if (dequeue || !gotoEnd) {
                jQuery3.dequeue(this, type);
              }
            });
          },
          finish: function(type) {
            if (type !== false) {
              type = type || "fx";
            }
            return this.each(function() {
              var index, data = dataPriv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery3.timers, length = queue ? queue.length : 0;
              data.finish = true;
              jQuery3.queue(this, type, []);
              if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
              }
              for (index = timers.length; index--; ) {
                if (timers[index].elem === this && timers[index].queue === type) {
                  timers[index].anim.stop(true);
                  timers.splice(index, 1);
                }
              }
              for (index = 0; index < length; index++) {
                if (queue[index] && queue[index].finish) {
                  queue[index].finish.call(this);
                }
              }
              delete data.finish;
            });
          }
        });
        jQuery3.each(["toggle", "show", "hide"], function(_i, name) {
          var cssFn = jQuery3.fn[name];
          jQuery3.fn[name] = function(speed, easing, callback) {
            return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
          };
        });
        jQuery3.each({
          slideDown: genFx("show"),
          slideUp: genFx("hide"),
          slideToggle: genFx("toggle"),
          fadeIn: { opacity: "show" },
          fadeOut: { opacity: "hide" },
          fadeToggle: { opacity: "toggle" }
        }, function(name, props) {
          jQuery3.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
          };
        });
        jQuery3.timers = [];
        jQuery3.fx.tick = function() {
          var timer, i = 0, timers = jQuery3.timers;
          fxNow = Date.now();
          for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
              timers.splice(i--, 1);
            }
          }
          if (!timers.length) {
            jQuery3.fx.stop();
          }
          fxNow = void 0;
        };
        jQuery3.fx.timer = function(timer) {
          jQuery3.timers.push(timer);
          jQuery3.fx.start();
        };
        jQuery3.fx.interval = 13;
        jQuery3.fx.start = function() {
          if (inProgress) {
            return;
          }
          inProgress = true;
          schedule();
        };
        jQuery3.fx.stop = function() {
          inProgress = null;
        };
        jQuery3.fx.speeds = {
          slow: 600,
          fast: 200,
          // Default speed
          _default: 400
        };
        jQuery3.fn.delay = function(time, type) {
          time = jQuery3.fx ? jQuery3.fx.speeds[time] || time : time;
          type = type || "fx";
          return this.queue(type, function(next, hooks) {
            var timeout = window2.setTimeout(next, time);
            hooks.stop = function() {
              window2.clearTimeout(timeout);
            };
          });
        };
        (function() {
          var input = document2.createElement("input"), select = document2.createElement("select"), opt = select.appendChild(document2.createElement("option"));
          input.type = "checkbox";
          support.checkOn = input.value !== "";
          support.optSelected = opt.selected;
          input = document2.createElement("input");
          input.value = "t";
          input.type = "radio";
          support.radioValue = input.value === "t";
        })();
        var boolHook, attrHandle = jQuery3.expr.attrHandle;
        jQuery3.fn.extend({
          attr: function(name, value) {
            return access(this, jQuery3.attr, name, value, arguments.length > 1);
          },
          removeAttr: function(name) {
            return this.each(function() {
              jQuery3.removeAttr(this, name);
            });
          }
        });
        jQuery3.extend({
          attr: function(elem, name, value) {
            var ret, hooks, nType = elem.nodeType;
            if (nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (typeof elem.getAttribute === "undefined") {
              return jQuery3.prop(elem, name, value);
            }
            if (nType !== 1 || !jQuery3.isXMLDoc(elem)) {
              hooks = jQuery3.attrHooks[name.toLowerCase()] || (jQuery3.expr.match.bool.test(name) ? boolHook : void 0);
            }
            if (value !== void 0) {
              if (value === null) {
                jQuery3.removeAttr(elem, name);
                return;
              }
              if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              }
              elem.setAttribute(name, value + "");
              return value;
            }
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            }
            ret = jQuery3.find.attr(elem, name);
            return ret == null ? void 0 : ret;
          },
          attrHooks: {
            type: {
              set: function(elem, value) {
                if (!support.radioValue && value === "radio" && nodeName(elem, "input")) {
                  var val = elem.value;
                  elem.setAttribute("type", value);
                  if (val) {
                    elem.value = val;
                  }
                  return value;
                }
              }
            }
          },
          removeAttr: function(elem, value) {
            var name, i = 0, attrNames = value && value.match(rnothtmlwhite);
            if (attrNames && elem.nodeType === 1) {
              while (name = attrNames[i++]) {
                elem.removeAttribute(name);
              }
            }
          }
        });
        boolHook = {
          set: function(elem, value, name) {
            if (value === false) {
              jQuery3.removeAttr(elem, name);
            } else {
              elem.setAttribute(name, name);
            }
            return name;
          }
        };
        jQuery3.each(jQuery3.expr.match.bool.source.match(/\w+/g), function(_i, name) {
          var getter = attrHandle[name] || jQuery3.find.attr;
          attrHandle[name] = function(elem, name2, isXML) {
            var ret, handle, lowercaseName = name2.toLowerCase();
            if (!isXML) {
              handle = attrHandle[lowercaseName];
              attrHandle[lowercaseName] = ret;
              ret = getter(elem, name2, isXML) != null ? lowercaseName : null;
              attrHandle[lowercaseName] = handle;
            }
            return ret;
          };
        });
        var rfocusable = /^(?:input|select|textarea|button)$/i, rclickable = /^(?:a|area)$/i;
        jQuery3.fn.extend({
          prop: function(name, value) {
            return access(this, jQuery3.prop, name, value, arguments.length > 1);
          },
          removeProp: function(name) {
            return this.each(function() {
              delete this[jQuery3.propFix[name] || name];
            });
          }
        });
        jQuery3.extend({
          prop: function(elem, name, value) {
            var ret, hooks, nType = elem.nodeType;
            if (nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (nType !== 1 || !jQuery3.isXMLDoc(elem)) {
              name = jQuery3.propFix[name] || name;
              hooks = jQuery3.propHooks[name];
            }
            if (value !== void 0) {
              if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              }
              return elem[name] = value;
            }
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            }
            return elem[name];
          },
          propHooks: {
            tabIndex: {
              get: function(elem) {
                var tabindex = jQuery3.find.attr(elem, "tabindex");
                if (tabindex) {
                  return parseInt(tabindex, 10);
                }
                if (rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href) {
                  return 0;
                }
                return -1;
              }
            }
          },
          propFix: {
            "for": "htmlFor",
            "class": "className"
          }
        });
        if (!support.optSelected) {
          jQuery3.propHooks.selected = {
            get: function(elem) {
              var parent = elem.parentNode;
              if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
              }
              return null;
            },
            set: function(elem) {
              var parent = elem.parentNode;
              if (parent) {
                parent.selectedIndex;
                if (parent.parentNode) {
                  parent.parentNode.selectedIndex;
                }
              }
            }
          };
        }
        jQuery3.each([
          "tabIndex",
          "readOnly",
          "maxLength",
          "cellSpacing",
          "cellPadding",
          "rowSpan",
          "colSpan",
          "useMap",
          "frameBorder",
          "contentEditable"
        ], function() {
          jQuery3.propFix[this.toLowerCase()] = this;
        });
        function stripAndCollapse(value) {
          var tokens = value.match(rnothtmlwhite) || [];
          return tokens.join(" ");
        }
        function getClass(elem) {
          return elem.getAttribute && elem.getAttribute("class") || "";
        }
        function classesToArray(value) {
          if (Array.isArray(value)) {
            return value;
          }
          if (typeof value === "string") {
            return value.match(rnothtmlwhite) || [];
          }
          return [];
        }
        jQuery3.fn.extend({
          addClass: function(value) {
            var classNames, cur, curValue, className, i, finalValue;
            if (isFunction(value)) {
              return this.each(function(j) {
                jQuery3(this).addClass(value.call(this, j, getClass(this)));
              });
            }
            classNames = classesToArray(value);
            if (classNames.length) {
              return this.each(function() {
                curValue = getClass(this);
                cur = this.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
                if (cur) {
                  for (i = 0; i < classNames.length; i++) {
                    className = classNames[i];
                    if (cur.indexOf(" " + className + " ") < 0) {
                      cur += className + " ";
                    }
                  }
                  finalValue = stripAndCollapse(cur);
                  if (curValue !== finalValue) {
                    this.setAttribute("class", finalValue);
                  }
                }
              });
            }
            return this;
          },
          removeClass: function(value) {
            var classNames, cur, curValue, className, i, finalValue;
            if (isFunction(value)) {
              return this.each(function(j) {
                jQuery3(this).removeClass(value.call(this, j, getClass(this)));
              });
            }
            if (!arguments.length) {
              return this.attr("class", "");
            }
            classNames = classesToArray(value);
            if (classNames.length) {
              return this.each(function() {
                curValue = getClass(this);
                cur = this.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
                if (cur) {
                  for (i = 0; i < classNames.length; i++) {
                    className = classNames[i];
                    while (cur.indexOf(" " + className + " ") > -1) {
                      cur = cur.replace(" " + className + " ", " ");
                    }
                  }
                  finalValue = stripAndCollapse(cur);
                  if (curValue !== finalValue) {
                    this.setAttribute("class", finalValue);
                  }
                }
              });
            }
            return this;
          },
          toggleClass: function(value, stateVal) {
            var classNames, className, i, self2, type = typeof value, isValidValue = type === "string" || Array.isArray(value);
            if (isFunction(value)) {
              return this.each(function(i2) {
                jQuery3(this).toggleClass(
                  value.call(this, i2, getClass(this), stateVal),
                  stateVal
                );
              });
            }
            if (typeof stateVal === "boolean" && isValidValue) {
              return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            classNames = classesToArray(value);
            return this.each(function() {
              if (isValidValue) {
                self2 = jQuery3(this);
                for (i = 0; i < classNames.length; i++) {
                  className = classNames[i];
                  if (self2.hasClass(className)) {
                    self2.removeClass(className);
                  } else {
                    self2.addClass(className);
                  }
                }
              } else if (value === void 0 || type === "boolean") {
                className = getClass(this);
                if (className) {
                  dataPriv.set(this, "__className__", className);
                }
                if (this.setAttribute) {
                  this.setAttribute(
                    "class",
                    className || value === false ? "" : dataPriv.get(this, "__className__") || ""
                  );
                }
              }
            });
          },
          hasClass: function(selector) {
            var className, elem, i = 0;
            className = " " + selector + " ";
            while (elem = this[i++]) {
              if (elem.nodeType === 1 && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
                return true;
              }
            }
            return false;
          }
        });
        var rreturn = /\r/g;
        jQuery3.fn.extend({
          val: function(value) {
            var hooks, ret, valueIsFunction, elem = this[0];
            if (!arguments.length) {
              if (elem) {
                hooks = jQuery3.valHooks[elem.type] || jQuery3.valHooks[elem.nodeName.toLowerCase()];
                if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== void 0) {
                  return ret;
                }
                ret = elem.value;
                if (typeof ret === "string") {
                  return ret.replace(rreturn, "");
                }
                return ret == null ? "" : ret;
              }
              return;
            }
            valueIsFunction = isFunction(value);
            return this.each(function(i) {
              var val;
              if (this.nodeType !== 1) {
                return;
              }
              if (valueIsFunction) {
                val = value.call(this, i, jQuery3(this).val());
              } else {
                val = value;
              }
              if (val == null) {
                val = "";
              } else if (typeof val === "number") {
                val += "";
              } else if (Array.isArray(val)) {
                val = jQuery3.map(val, function(value2) {
                  return value2 == null ? "" : value2 + "";
                });
              }
              hooks = jQuery3.valHooks[this.type] || jQuery3.valHooks[this.nodeName.toLowerCase()];
              if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === void 0) {
                this.value = val;
              }
            });
          }
        });
        jQuery3.extend({
          valHooks: {
            option: {
              get: function(elem) {
                var val = jQuery3.find.attr(elem, "value");
                return val != null ? val : (
                  // Support: IE <=10 - 11 only
                  // option.text throws exceptions (trac-14686, trac-14858)
                  // Strip and collapse whitespace
                  // https://html.spec.whatwg.org/#strip-and-collapse-whitespace
                  stripAndCollapse(jQuery3.text(elem))
                );
              }
            },
            select: {
              get: function(elem) {
                var value, option, i, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one", values = one ? null : [], max = one ? index + 1 : options.length;
                if (index < 0) {
                  i = max;
                } else {
                  i = one ? index : 0;
                }
                for (; i < max; i++) {
                  option = options[i];
                  if ((option.selected || i === index) && // Don't return options that are disabled or in a disabled optgroup
                  !option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {
                    value = jQuery3(option).val();
                    if (one) {
                      return value;
                    }
                    values.push(value);
                  }
                }
                return values;
              },
              set: function(elem, value) {
                var optionSet, option, options = elem.options, values = jQuery3.makeArray(value), i = options.length;
                while (i--) {
                  option = options[i];
                  if (option.selected = jQuery3.inArray(jQuery3.valHooks.option.get(option), values) > -1) {
                    optionSet = true;
                  }
                }
                if (!optionSet) {
                  elem.selectedIndex = -1;
                }
                return values;
              }
            }
          }
        });
        jQuery3.each(["radio", "checkbox"], function() {
          jQuery3.valHooks[this] = {
            set: function(elem, value) {
              if (Array.isArray(value)) {
                return elem.checked = jQuery3.inArray(jQuery3(elem).val(), value) > -1;
              }
            }
          };
          if (!support.checkOn) {
            jQuery3.valHooks[this].get = function(elem) {
              return elem.getAttribute("value") === null ? "on" : elem.value;
            };
          }
        });
        var location = window2.location;
        var nonce = { guid: Date.now() };
        var rquery = /\?/;
        jQuery3.parseXML = function(data) {
          var xml, parserErrorElem;
          if (!data || typeof data !== "string") {
            return null;
          }
          try {
            xml = new window2.DOMParser().parseFromString(data, "text/xml");
          } catch (e) {
          }
          parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
          if (!xml || parserErrorElem) {
            jQuery3.error("Invalid XML: " + (parserErrorElem ? jQuery3.map(parserErrorElem.childNodes, function(el) {
              return el.textContent;
            }).join("\n") : data));
          }
          return xml;
        };
        var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, stopPropagationCallback = function(e) {
          e.stopPropagation();
        };
        jQuery3.extend(jQuery3.event, {
          trigger: function(event, data, elem, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, special, lastElement, eventPath = [elem || document2], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = lastElement = tmp = elem = elem || document2;
            if (elem.nodeType === 3 || elem.nodeType === 8) {
              return;
            }
            if (rfocusMorph.test(type + jQuery3.event.triggered)) {
              return;
            }
            if (type.indexOf(".") > -1) {
              namespaces = type.split(".");
              type = namespaces.shift();
              namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;
            event = event[jQuery3.expando] ? event : new jQuery3.Event(type, typeof event === "object" && event);
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            event.result = void 0;
            if (!event.target) {
              event.target = elem;
            }
            data = data == null ? [event] : jQuery3.makeArray(data, [event]);
            special = jQuery3.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
              return;
            }
            if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
              bubbleType = special.delegateType || type;
              if (!rfocusMorph.test(bubbleType + type)) {
                cur = cur.parentNode;
              }
              for (; cur; cur = cur.parentNode) {
                eventPath.push(cur);
                tmp = cur;
              }
              if (tmp === (elem.ownerDocument || document2)) {
                eventPath.push(tmp.defaultView || tmp.parentWindow || window2);
              }
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
              lastElement = cur;
              event.type = i > 1 ? bubbleType : special.bindType || type;
              handle = (dataPriv.get(cur, "events") || /* @__PURE__ */ Object.create(null))[event.type] && dataPriv.get(cur, "handle");
              if (handle) {
                handle.apply(cur, data);
              }
              handle = ontype && cur[ontype];
              if (handle && handle.apply && acceptData(cur)) {
                event.result = handle.apply(cur, data);
                if (event.result === false) {
                  event.preventDefault();
                }
              }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) {
              if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && acceptData(elem)) {
                if (ontype && isFunction(elem[type]) && !isWindow(elem)) {
                  tmp = elem[ontype];
                  if (tmp) {
                    elem[ontype] = null;
                  }
                  jQuery3.event.triggered = type;
                  if (event.isPropagationStopped()) {
                    lastElement.addEventListener(type, stopPropagationCallback);
                  }
                  elem[type]();
                  if (event.isPropagationStopped()) {
                    lastElement.removeEventListener(type, stopPropagationCallback);
                  }
                  jQuery3.event.triggered = void 0;
                  if (tmp) {
                    elem[ontype] = tmp;
                  }
                }
              }
            }
            return event.result;
          },
          // Piggyback on a donor event to simulate a different one
          // Used only for `focus(in | out)` events
          simulate: function(type, elem, event) {
            var e = jQuery3.extend(
              new jQuery3.Event(),
              event,
              {
                type,
                isSimulated: true
              }
            );
            jQuery3.event.trigger(e, null, elem);
          }
        });
        jQuery3.fn.extend({
          trigger: function(type, data) {
            return this.each(function() {
              jQuery3.event.trigger(type, data, this);
            });
          },
          triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) {
              return jQuery3.event.trigger(type, data, elem, true);
            }
          }
        });
        var rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
        function buildParams(prefix, obj, traditional, add) {
          var name;
          if (Array.isArray(obj)) {
            jQuery3.each(obj, function(i, v) {
              if (traditional || rbracket.test(prefix)) {
                add(prefix, v);
              } else {
                buildParams(
                  prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]",
                  v,
                  traditional,
                  add
                );
              }
            });
          } else if (!traditional && toType(obj) === "object") {
            for (name in obj) {
              buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
            }
          } else {
            add(prefix, obj);
          }
        }
        jQuery3.param = function(a, traditional) {
          var prefix, s = [], add = function(key, valueOrFunction) {
            var value = isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
          };
          if (a == null) {
            return "";
          }
          if (Array.isArray(a) || a.jquery && !jQuery3.isPlainObject(a)) {
            jQuery3.each(a, function() {
              add(this.name, this.value);
            });
          } else {
            for (prefix in a) {
              buildParams(prefix, a[prefix], traditional, add);
            }
          }
          return s.join("&");
        };
        jQuery3.fn.extend({
          serialize: function() {
            return jQuery3.param(this.serializeArray());
          },
          serializeArray: function() {
            return this.map(function() {
              var elements = jQuery3.prop(this, "elements");
              return elements ? jQuery3.makeArray(elements) : this;
            }).filter(function() {
              var type = this.type;
              return this.name && !jQuery3(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function(_i, elem) {
              var val = jQuery3(this).val();
              if (val == null) {
                return null;
              }
              if (Array.isArray(val)) {
                return jQuery3.map(val, function(val2) {
                  return { name: elem.name, value: val2.replace(rCRLF, "\r\n") };
                });
              }
              return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
            }).get();
          }
        });
        var r20 = /%20/g, rhash = /#.*$/, rantiCache = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, prefilters = {}, transports = {}, allTypes = "*/".concat("*"), originAnchor = document2.createElement("a");
        originAnchor.href = location.href;
        function addToPrefiltersOrTransports(structure) {
          return function(dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
              func = dataTypeExpression;
              dataTypeExpression = "*";
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];
            if (isFunction(func)) {
              while (dataType = dataTypes[i++]) {
                if (dataType[0] === "+") {
                  dataType = dataType.slice(1) || "*";
                  (structure[dataType] = structure[dataType] || []).unshift(func);
                } else {
                  (structure[dataType] = structure[dataType] || []).push(func);
                }
              }
            }
          };
        }
        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
          var inspected = {}, seekingTransport = structure === transports;
          function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery3.each(structure[dataType] || [], function(_, prefilterOrFactory) {
              var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
              if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                options.dataTypes.unshift(dataTypeOrTransport);
                inspect(dataTypeOrTransport);
                return false;
              } else if (seekingTransport) {
                return !(selected = dataTypeOrTransport);
              }
            });
            return selected;
          }
          return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
        }
        function ajaxExtend(target, src) {
          var key, deep, flatOptions = jQuery3.ajaxSettings.flatOptions || {};
          for (key in src) {
            if (src[key] !== void 0) {
              (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
            }
          }
          if (deep) {
            jQuery3.extend(true, target, deep);
          }
          return target;
        }
        function ajaxHandleResponses(s, jqXHR, responses) {
          var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
          while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === void 0) {
              ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
          }
          if (ct) {
            for (type in contents) {
              if (contents[type] && contents[type].test(ct)) {
                dataTypes.unshift(type);
                break;
              }
            }
          }
          if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
          } else {
            for (type in responses) {
              if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                finalDataType = type;
                break;
              }
              if (!firstDataType) {
                firstDataType = type;
              }
            }
            finalDataType = finalDataType || firstDataType;
          }
          if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
              dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
          }
        }
        function ajaxConvert(s, response, jqXHR, isSuccess) {
          var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
          if (dataTypes[1]) {
            for (conv in s.converters) {
              converters[conv.toLowerCase()] = s.converters[conv];
            }
          }
          current = dataTypes.shift();
          while (current) {
            if (s.responseFields[current]) {
              jqXHR[s.responseFields[current]] = response;
            }
            if (!prev && isSuccess && s.dataFilter) {
              response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
              if (current === "*") {
                current = prev;
              } else if (prev !== "*" && prev !== current) {
                conv = converters[prev + " " + current] || converters["* " + current];
                if (!conv) {
                  for (conv2 in converters) {
                    tmp = conv2.split(" ");
                    if (tmp[1] === current) {
                      conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                      if (conv) {
                        if (conv === true) {
                          conv = converters[conv2];
                        } else if (converters[conv2] !== true) {
                          current = tmp[0];
                          dataTypes.unshift(tmp[1]);
                        }
                        break;
                      }
                    }
                  }
                }
                if (conv !== true) {
                  if (conv && s.throws) {
                    response = conv(response);
                  } else {
                    try {
                      response = conv(response);
                    } catch (e) {
                      return {
                        state: "parsererror",
                        error: conv ? e : "No conversion from " + prev + " to " + current
                      };
                    }
                  }
                }
              }
            }
          }
          return { state: "success", data: response };
        }
        jQuery3.extend({
          // Counter for holding the number of active queries
          active: 0,
          // Last-Modified header cache for next request
          lastModified: {},
          etag: {},
          ajaxSettings: {
            url: location.href,
            type: "GET",
            isLocal: rlocalProtocol.test(location.protocol),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            /*
            timeout: 0,
            data: null,
            dataType: null,
            username: null,
            password: null,
            cache: null,
            throws: false,
            traditional: false,
            headers: {},
            */
            accepts: {
              "*": allTypes,
              text: "text/plain",
              html: "text/html",
              xml: "application/xml, text/xml",
              json: "application/json, text/javascript"
            },
            contents: {
              xml: /\bxml\b/,
              html: /\bhtml/,
              json: /\bjson\b/
            },
            responseFields: {
              xml: "responseXML",
              text: "responseText",
              json: "responseJSON"
            },
            // Data converters
            // Keys separate source (or catchall "*") and destination types with a single space
            converters: {
              // Convert anything to text
              "* text": String,
              // Text to html (true = no transformation)
              "text html": true,
              // Evaluate text as a json expression
              "text json": JSON.parse,
              // Parse text as xml
              "text xml": jQuery3.parseXML
            },
            // For options that shouldn't be deep extended:
            // you can add your own custom options here if
            // and when you create one that shouldn't be
            // deep extended (see ajaxExtend)
            flatOptions: {
              url: true,
              context: true
            }
          },
          // Creates a full fledged settings object into target
          // with both ajaxSettings and settings fields.
          // If target is omitted, writes into ajaxSettings.
          ajaxSetup: function(target, settings) {
            return settings ? (
              // Building a settings object
              ajaxExtend(ajaxExtend(target, jQuery3.ajaxSettings), settings)
            ) : (
              // Extending ajaxSettings
              ajaxExtend(jQuery3.ajaxSettings, target)
            );
          },
          ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
          ajaxTransport: addToPrefiltersOrTransports(transports),
          // Main method
          ajax: function(url, options) {
            if (typeof url === "object") {
              options = url;
              url = void 0;
            }
            options = options || {};
            var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, urlAnchor, completed2, fireGlobals, i, uncached, s = jQuery3.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery3(callbackContext) : jQuery3.event, deferred = jQuery3.Deferred(), completeDeferred = jQuery3.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, strAbort = "canceled", jqXHR = {
              readyState: 0,
              // Builds headers hashtable if needed
              getResponseHeader: function(key) {
                var match;
                if (completed2) {
                  if (!responseHeaders) {
                    responseHeaders = {};
                    while (match = rheaders.exec(responseHeadersString)) {
                      responseHeaders[match[1].toLowerCase() + " "] = (responseHeaders[match[1].toLowerCase() + " "] || []).concat(match[2]);
                    }
                  }
                  match = responseHeaders[key.toLowerCase() + " "];
                }
                return match == null ? null : match.join(", ");
              },
              // Raw string
              getAllResponseHeaders: function() {
                return completed2 ? responseHeadersString : null;
              },
              // Caches the header
              setRequestHeader: function(name, value) {
                if (completed2 == null) {
                  name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name;
                  requestHeaders[name] = value;
                }
                return this;
              },
              // Overrides response content-type header
              overrideMimeType: function(type) {
                if (completed2 == null) {
                  s.mimeType = type;
                }
                return this;
              },
              // Status-dependent callbacks
              statusCode: function(map) {
                var code;
                if (map) {
                  if (completed2) {
                    jqXHR.always(map[jqXHR.status]);
                  } else {
                    for (code in map) {
                      statusCode[code] = [statusCode[code], map[code]];
                    }
                  }
                }
                return this;
              },
              // Cancel the request
              abort: function(statusText) {
                var finalText = statusText || strAbort;
                if (transport) {
                  transport.abort(finalText);
                }
                done(0, finalText);
                return this;
              }
            };
            deferred.promise(jqXHR);
            s.url = ((url || s.url || location.href) + "").replace(rprotocol, location.protocol + "//");
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];
            if (s.crossDomain == null) {
              urlAnchor = document2.createElement("a");
              try {
                urlAnchor.href = s.url;
                urlAnchor.href = urlAnchor.href;
                s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
              } catch (e) {
                s.crossDomain = true;
              }
            }
            if (s.data && s.processData && typeof s.data !== "string") {
              s.data = jQuery3.param(s.data, s.traditional);
            }
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (completed2) {
              return jqXHR;
            }
            fireGlobals = jQuery3.event && s.global;
            if (fireGlobals && jQuery3.active++ === 0) {
              jQuery3.event.trigger("ajaxStart");
            }
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url.replace(rhash, "");
            if (!s.hasContent) {
              uncached = s.url.slice(cacheURL.length);
              if (s.data && (s.processData || typeof s.data === "string")) {
                cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;
                delete s.data;
              }
              if (s.cache === false) {
                cacheURL = cacheURL.replace(rantiCache, "$1");
                uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached;
              }
              s.url = cacheURL + uncached;
            } else if (s.data && s.processData && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
              s.data = s.data.replace(r20, "+");
            }
            if (s.ifModified) {
              if (jQuery3.lastModified[cacheURL]) {
                jqXHR.setRequestHeader("If-Modified-Since", jQuery3.lastModified[cacheURL]);
              }
              if (jQuery3.etag[cacheURL]) {
                jqXHR.setRequestHeader("If-None-Match", jQuery3.etag[cacheURL]);
              }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
              jqXHR.setRequestHeader("Content-Type", s.contentType);
            }
            jqXHR.setRequestHeader(
              "Accept",
              s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]
            );
            for (i in s.headers) {
              jqXHR.setRequestHeader(i, s.headers[i]);
            }
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed2)) {
              return jqXHR.abort();
            }
            strAbort = "abort";
            completeDeferred.add(s.complete);
            jqXHR.done(s.success);
            jqXHR.fail(s.error);
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) {
              done(-1, "No Transport");
            } else {
              jqXHR.readyState = 1;
              if (fireGlobals) {
                globalEventContext.trigger("ajaxSend", [jqXHR, s]);
              }
              if (completed2) {
                return jqXHR;
              }
              if (s.async && s.timeout > 0) {
                timeoutTimer = window2.setTimeout(function() {
                  jqXHR.abort("timeout");
                }, s.timeout);
              }
              try {
                completed2 = false;
                transport.send(requestHeaders, done);
              } catch (e) {
                if (completed2) {
                  throw e;
                }
                done(-1, e);
              }
            }
            function done(status, nativeStatusText, responses, headers) {
              var isSuccess, success, error, response, modified, statusText = nativeStatusText;
              if (completed2) {
                return;
              }
              completed2 = true;
              if (timeoutTimer) {
                window2.clearTimeout(timeoutTimer);
              }
              transport = void 0;
              responseHeadersString = headers || "";
              jqXHR.readyState = status > 0 ? 4 : 0;
              isSuccess = status >= 200 && status < 300 || status === 304;
              if (responses) {
                response = ajaxHandleResponses(s, jqXHR, responses);
              }
              if (!isSuccess && jQuery3.inArray("script", s.dataTypes) > -1 && jQuery3.inArray("json", s.dataTypes) < 0) {
                s.converters["text script"] = function() {
                };
              }
              response = ajaxConvert(s, response, jqXHR, isSuccess);
              if (isSuccess) {
                if (s.ifModified) {
                  modified = jqXHR.getResponseHeader("Last-Modified");
                  if (modified) {
                    jQuery3.lastModified[cacheURL] = modified;
                  }
                  modified = jqXHR.getResponseHeader("etag");
                  if (modified) {
                    jQuery3.etag[cacheURL] = modified;
                  }
                }
                if (status === 204 || s.type === "HEAD") {
                  statusText = "nocontent";
                } else if (status === 304) {
                  statusText = "notmodified";
                } else {
                  statusText = response.state;
                  success = response.data;
                  error = response.error;
                  isSuccess = !error;
                }
              } else {
                error = statusText;
                if (status || !statusText) {
                  statusText = "error";
                  if (status < 0) {
                    status = 0;
                  }
                }
              }
              jqXHR.status = status;
              jqXHR.statusText = (nativeStatusText || statusText) + "";
              if (isSuccess) {
                deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
              } else {
                deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
              }
              jqXHR.statusCode(statusCode);
              statusCode = void 0;
              if (fireGlobals) {
                globalEventContext.trigger(
                  isSuccess ? "ajaxSuccess" : "ajaxError",
                  [jqXHR, s, isSuccess ? success : error]
                );
              }
              completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
              if (fireGlobals) {
                globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                if (!--jQuery3.active) {
                  jQuery3.event.trigger("ajaxStop");
                }
              }
            }
            return jqXHR;
          },
          getJSON: function(url, data, callback) {
            return jQuery3.get(url, data, callback, "json");
          },
          getScript: function(url, callback) {
            return jQuery3.get(url, void 0, callback, "script");
          }
        });
        jQuery3.each(["get", "post"], function(_i, method) {
          jQuery3[method] = function(url, data, callback, type) {
            if (isFunction(data)) {
              type = type || callback;
              callback = data;
              data = void 0;
            }
            return jQuery3.ajax(jQuery3.extend({
              url,
              type: method,
              dataType: type,
              data,
              success: callback
            }, jQuery3.isPlainObject(url) && url));
          };
        });
        jQuery3.ajaxPrefilter(function(s) {
          var i;
          for (i in s.headers) {
            if (i.toLowerCase() === "content-type") {
              s.contentType = s.headers[i] || "";
            }
          }
        });
        jQuery3._evalUrl = function(url, options, doc) {
          return jQuery3.ajax({
            url,
            // Make this explicit, since user can override this through ajaxSetup (trac-11264)
            type: "GET",
            dataType: "script",
            cache: true,
            async: false,
            global: false,
            // Only evaluate the response if it is successful (gh-4126)
            // dataFilter is not invoked for failure responses, so using it instead
            // of the default converter is kludgy but it works.
            converters: {
              "text script": function() {
              }
            },
            dataFilter: function(response) {
              jQuery3.globalEval(response, options, doc);
            }
          });
        };
        jQuery3.fn.extend({
          wrapAll: function(html) {
            var wrap;
            if (this[0]) {
              if (isFunction(html)) {
                html = html.call(this[0]);
              }
              wrap = jQuery3(html, this[0].ownerDocument).eq(0).clone(true);
              if (this[0].parentNode) {
                wrap.insertBefore(this[0]);
              }
              wrap.map(function() {
                var elem = this;
                while (elem.firstElementChild) {
                  elem = elem.firstElementChild;
                }
                return elem;
              }).append(this);
            }
            return this;
          },
          wrapInner: function(html) {
            if (isFunction(html)) {
              return this.each(function(i) {
                jQuery3(this).wrapInner(html.call(this, i));
              });
            }
            return this.each(function() {
              var self2 = jQuery3(this), contents = self2.contents();
              if (contents.length) {
                contents.wrapAll(html);
              } else {
                self2.append(html);
              }
            });
          },
          wrap: function(html) {
            var htmlIsFunction = isFunction(html);
            return this.each(function(i) {
              jQuery3(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
            });
          },
          unwrap: function(selector) {
            this.parent(selector).not("body").each(function() {
              jQuery3(this).replaceWith(this.childNodes);
            });
            return this;
          }
        });
        jQuery3.expr.pseudos.hidden = function(elem) {
          return !jQuery3.expr.pseudos.visible(elem);
        };
        jQuery3.expr.pseudos.visible = function(elem) {
          return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        };
        jQuery3.ajaxSettings.xhr = function() {
          try {
            return new window2.XMLHttpRequest();
          } catch (e) {
          }
        };
        var xhrSuccessStatus = {
          // File protocol always yields status code 0, assume 200
          0: 200,
          // Support: IE <=9 only
          // trac-1450: sometimes IE returns 1223 when it should be 204
          1223: 204
        }, xhrSupported = jQuery3.ajaxSettings.xhr();
        support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
        support.ajax = xhrSupported = !!xhrSupported;
        jQuery3.ajaxTransport(function(options) {
          var callback, errorCallback;
          if (support.cors || xhrSupported && !options.crossDomain) {
            return {
              send: function(headers, complete) {
                var i, xhr = options.xhr();
                xhr.open(
                  options.type,
                  options.url,
                  options.async,
                  options.username,
                  options.password
                );
                if (options.xhrFields) {
                  for (i in options.xhrFields) {
                    xhr[i] = options.xhrFields[i];
                  }
                }
                if (options.mimeType && xhr.overrideMimeType) {
                  xhr.overrideMimeType(options.mimeType);
                }
                if (!options.crossDomain && !headers["X-Requested-With"]) {
                  headers["X-Requested-With"] = "XMLHttpRequest";
                }
                for (i in headers) {
                  xhr.setRequestHeader(i, headers[i]);
                }
                callback = function(type) {
                  return function() {
                    if (callback) {
                      callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = xhr.onreadystatechange = null;
                      if (type === "abort") {
                        xhr.abort();
                      } else if (type === "error") {
                        if (typeof xhr.status !== "number") {
                          complete(0, "error");
                        } else {
                          complete(
                            // File: protocol always yields status 0; see trac-8605, trac-14207
                            xhr.status,
                            xhr.statusText
                          );
                        }
                      } else {
                        complete(
                          xhrSuccessStatus[xhr.status] || xhr.status,
                          xhr.statusText,
                          // Support: IE <=9 only
                          // IE9 has no XHR2 but throws on binary (trac-11426)
                          // For XHR2 non-text, let the caller handle it (gh-2498)
                          (xhr.responseType || "text") !== "text" || typeof xhr.responseText !== "string" ? { binary: xhr.response } : { text: xhr.responseText },
                          xhr.getAllResponseHeaders()
                        );
                      }
                    }
                  };
                };
                xhr.onload = callback();
                errorCallback = xhr.onerror = xhr.ontimeout = callback("error");
                if (xhr.onabort !== void 0) {
                  xhr.onabort = errorCallback;
                } else {
                  xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                      window2.setTimeout(function() {
                        if (callback) {
                          errorCallback();
                        }
                      });
                    }
                  };
                }
                callback = callback("abort");
                try {
                  xhr.send(options.hasContent && options.data || null);
                } catch (e) {
                  if (callback) {
                    throw e;
                  }
                }
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        jQuery3.ajaxPrefilter(function(s) {
          if (s.crossDomain) {
            s.contents.script = false;
          }
        });
        jQuery3.ajaxSetup({
          accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
          },
          contents: {
            script: /\b(?:java|ecma)script\b/
          },
          converters: {
            "text script": function(text) {
              jQuery3.globalEval(text);
              return text;
            }
          }
        });
        jQuery3.ajaxPrefilter("script", function(s) {
          if (s.cache === void 0) {
            s.cache = false;
          }
          if (s.crossDomain) {
            s.type = "GET";
          }
        });
        jQuery3.ajaxTransport("script", function(s) {
          if (s.crossDomain || s.scriptAttrs) {
            var script, callback;
            return {
              send: function(_, complete) {
                script = jQuery3("<script>").attr(s.scriptAttrs || {}).prop({ charset: s.scriptCharset, src: s.url }).on("load error", callback = function(evt) {
                  script.remove();
                  callback = null;
                  if (evt) {
                    complete(evt.type === "error" ? 404 : 200, evt.type);
                  }
                });
                document2.head.appendChild(script[0]);
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery3.ajaxSetup({
          jsonp: "callback",
          jsonpCallback: function() {
            var callback = oldCallbacks.pop() || jQuery3.expando + "_" + nonce.guid++;
            this[callback] = true;
            return callback;
          }
        });
        jQuery3.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
          var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");
          if (jsonProp || s.dataTypes[0] === "jsonp") {
            callbackName = s.jsonpCallback = isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            if (jsonProp) {
              s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
            } else if (s.jsonp !== false) {
              s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
            }
            s.converters["script json"] = function() {
              if (!responseContainer) {
                jQuery3.error(callbackName + " was not called");
              }
              return responseContainer[0];
            };
            s.dataTypes[0] = "json";
            overwritten = window2[callbackName];
            window2[callbackName] = function() {
              responseContainer = arguments;
            };
            jqXHR.always(function() {
              if (overwritten === void 0) {
                jQuery3(window2).removeProp(callbackName);
              } else {
                window2[callbackName] = overwritten;
              }
              if (s[callbackName]) {
                s.jsonpCallback = originalSettings.jsonpCallback;
                oldCallbacks.push(callbackName);
              }
              if (responseContainer && isFunction(overwritten)) {
                overwritten(responseContainer[0]);
              }
              responseContainer = overwritten = void 0;
            });
            return "script";
          }
        });
        support.createHTMLDocument = (function() {
          var body = document2.implementation.createHTMLDocument("").body;
          body.innerHTML = "<form></form><form></form>";
          return body.childNodes.length === 2;
        })();
        jQuery3.parseHTML = function(data, context, keepScripts) {
          if (typeof data !== "string") {
            return [];
          }
          if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
          }
          var base, parsed, scripts;
          if (!context) {
            if (support.createHTMLDocument) {
              context = document2.implementation.createHTMLDocument("");
              base = context.createElement("base");
              base.href = document2.location.href;
              context.head.appendChild(base);
            } else {
              context = document2;
            }
          }
          parsed = rsingleTag.exec(data);
          scripts = !keepScripts && [];
          if (parsed) {
            return [context.createElement(parsed[1])];
          }
          parsed = buildFragment([data], context, scripts);
          if (scripts && scripts.length) {
            jQuery3(scripts).remove();
          }
          return jQuery3.merge([], parsed.childNodes);
        };
        jQuery3.fn.load = function(url, params, callback) {
          var selector, type, response, self2 = this, off = url.indexOf(" ");
          if (off > -1) {
            selector = stripAndCollapse(url.slice(off));
            url = url.slice(0, off);
          }
          if (isFunction(params)) {
            callback = params;
            params = void 0;
          } else if (params && typeof params === "object") {
            type = "POST";
          }
          if (self2.length > 0) {
            jQuery3.ajax({
              url,
              // If "type" variable is undefined, then "GET" method will be used.
              // Make value of this field explicit since
              // user can override it through ajaxSetup method
              type: type || "GET",
              dataType: "html",
              data: params
            }).done(function(responseText) {
              response = arguments;
              self2.html(selector ? (
                // If a selector was specified, locate the right elements in a dummy div
                // Exclude scripts to avoid IE 'Permission Denied' errors
                jQuery3("<div>").append(jQuery3.parseHTML(responseText)).find(selector)
              ) : (
                // Otherwise use the full result
                responseText
              ));
            }).always(callback && function(jqXHR, status) {
              self2.each(function() {
                callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
              });
            });
          }
          return this;
        };
        jQuery3.expr.pseudos.animated = function(elem) {
          return jQuery3.grep(jQuery3.timers, function(fn) {
            return elem === fn.elem;
          }).length;
        };
        jQuery3.offset = {
          setOffset: function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery3.css(elem, "position"), curElem = jQuery3(elem), props = {};
            if (position === "static") {
              elem.style.position = "relative";
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery3.css(elem, "top");
            curCSSLeft = jQuery3.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
            if (calculatePosition) {
              curPosition = curElem.position();
              curTop = curPosition.top;
              curLeft = curPosition.left;
            } else {
              curTop = parseFloat(curCSSTop) || 0;
              curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (isFunction(options)) {
              options = options.call(elem, i, jQuery3.extend({}, curOffset));
            }
            if (options.top != null) {
              props.top = options.top - curOffset.top + curTop;
            }
            if (options.left != null) {
              props.left = options.left - curOffset.left + curLeft;
            }
            if ("using" in options) {
              options.using.call(elem, props);
            } else {
              curElem.css(props);
            }
          }
        };
        jQuery3.fn.extend({
          // offset() relates an element's border box to the document origin
          offset: function(options) {
            if (arguments.length) {
              return options === void 0 ? this : this.each(function(i) {
                jQuery3.offset.setOffset(this, options, i);
              });
            }
            var rect, win, elem = this[0];
            if (!elem) {
              return;
            }
            if (!elem.getClientRects().length) {
              return { top: 0, left: 0 };
            }
            rect = elem.getBoundingClientRect();
            win = elem.ownerDocument.defaultView;
            return {
              top: rect.top + win.pageYOffset,
              left: rect.left + win.pageXOffset
            };
          },
          // position() relates an element's margin box to its offset parent's padding box
          // This corresponds to the behavior of CSS absolute positioning
          position: function() {
            if (!this[0]) {
              return;
            }
            var offsetParent, offset, doc, elem = this[0], parentOffset = { top: 0, left: 0 };
            if (jQuery3.css(elem, "position") === "fixed") {
              offset = elem.getBoundingClientRect();
            } else {
              offset = this.offset();
              doc = elem.ownerDocument;
              offsetParent = elem.offsetParent || doc.documentElement;
              while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && jQuery3.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.parentNode;
              }
              if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
                parentOffset = jQuery3(offsetParent).offset();
                parentOffset.top += jQuery3.css(offsetParent, "borderTopWidth", true);
                parentOffset.left += jQuery3.css(offsetParent, "borderLeftWidth", true);
              }
            }
            return {
              top: offset.top - parentOffset.top - jQuery3.css(elem, "marginTop", true),
              left: offset.left - parentOffset.left - jQuery3.css(elem, "marginLeft", true)
            };
          },
          // This method will return documentElement in the following cases:
          // 1) For the element inside the iframe without offsetParent, this method will return
          //    documentElement of the parent window
          // 2) For the hidden or detached element
          // 3) For body or html element, i.e. in case of the html node - it will return itself
          //
          // but those exceptions were never presented as a real life use-cases
          // and might be considered as more preferable results.
          //
          // This logic, however, is not guaranteed and can change at any point in the future
          offsetParent: function() {
            return this.map(function() {
              var offsetParent = this.offsetParent;
              while (offsetParent && jQuery3.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.offsetParent;
              }
              return offsetParent || documentElement;
            });
          }
        });
        jQuery3.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(method, prop) {
          var top = "pageYOffset" === prop;
          jQuery3.fn[method] = function(val) {
            return access(this, function(elem, method2, val2) {
              var win;
              if (isWindow(elem)) {
                win = elem;
              } else if (elem.nodeType === 9) {
                win = elem.defaultView;
              }
              if (val2 === void 0) {
                return win ? win[prop] : elem[method2];
              }
              if (win) {
                win.scrollTo(
                  !top ? val2 : win.pageXOffset,
                  top ? val2 : win.pageYOffset
                );
              } else {
                elem[method2] = val2;
              }
            }, method, val, arguments.length);
          };
        });
        jQuery3.each(["top", "left"], function(_i, prop) {
          jQuery3.cssHooks[prop] = addGetHookIf(
            support.pixelPosition,
            function(elem, computed) {
              if (computed) {
                computed = curCSS(elem, prop);
                return rnumnonpx.test(computed) ? jQuery3(elem).position()[prop] + "px" : computed;
              }
            }
          );
        });
        jQuery3.each({ Height: "height", Width: "width" }, function(name, type) {
          jQuery3.each({
            padding: "inner" + name,
            content: type,
            "": "outer" + name
          }, function(defaultExtra, funcName) {
            jQuery3.fn[funcName] = function(margin, value) {
              var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
              return access(this, function(elem, type2, value2) {
                var doc;
                if (isWindow(elem)) {
                  return funcName.indexOf("outer") === 0 ? elem["inner" + name] : elem.document.documentElement["client" + name];
                }
                if (elem.nodeType === 9) {
                  doc = elem.documentElement;
                  return Math.max(
                    elem.body["scroll" + name],
                    doc["scroll" + name],
                    elem.body["offset" + name],
                    doc["offset" + name],
                    doc["client" + name]
                  );
                }
                return value2 === void 0 ? (
                  // Get width or height on the element, requesting but not forcing parseFloat
                  jQuery3.css(elem, type2, extra)
                ) : (
                  // Set width or height on the element
                  jQuery3.style(elem, type2, value2, extra)
                );
              }, type, chainable ? margin : void 0, chainable);
            };
          });
        });
        jQuery3.each([
          "ajaxStart",
          "ajaxStop",
          "ajaxComplete",
          "ajaxError",
          "ajaxSuccess",
          "ajaxSend"
        ], function(_i, type) {
          jQuery3.fn[type] = function(fn) {
            return this.on(type, fn);
          };
        });
        jQuery3.fn.extend({
          bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
          },
          unbind: function(types, fn) {
            return this.off(types, null, fn);
          },
          delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
          },
          undelegate: function(selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
          },
          hover: function(fnOver, fnOut) {
            return this.on("mouseenter", fnOver).on("mouseleave", fnOut || fnOver);
          }
        });
        jQuery3.each(
          "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),
          function(_i, name) {
            jQuery3.fn[name] = function(data, fn) {
              return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
            };
          }
        );
        var rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;
        jQuery3.proxy = function(fn, context) {
          var tmp, args, proxy;
          if (typeof context === "string") {
            tmp = fn[context];
            context = fn;
            fn = tmp;
          }
          if (!isFunction(fn)) {
            return void 0;
          }
          args = slice.call(arguments, 2);
          proxy = function() {
            return fn.apply(context || this, args.concat(slice.call(arguments)));
          };
          proxy.guid = fn.guid = fn.guid || jQuery3.guid++;
          return proxy;
        };
        jQuery3.holdReady = function(hold) {
          if (hold) {
            jQuery3.readyWait++;
          } else {
            jQuery3.ready(true);
          }
        };
        jQuery3.isArray = Array.isArray;
        jQuery3.parseJSON = JSON.parse;
        jQuery3.nodeName = nodeName;
        jQuery3.isFunction = isFunction;
        jQuery3.isWindow = isWindow;
        jQuery3.camelCase = camelCase;
        jQuery3.type = toType;
        jQuery3.now = Date.now;
        jQuery3.isNumeric = function(obj) {
          var type = jQuery3.type(obj);
          return (type === "number" || type === "string") && // parseFloat NaNs numeric-cast false positives ("")
          // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
          // subtraction forces infinities to NaN
          !isNaN(obj - parseFloat(obj));
        };
        jQuery3.trim = function(text) {
          return text == null ? "" : (text + "").replace(rtrim, "$1");
        };
        if (typeof define === "function" && define.amd) {
          define("jquery", [], function() {
            return jQuery3;
          });
        }
        var _jQuery = window2.jQuery, _$ = window2.$;
        jQuery3.noConflict = function(deep) {
          if (window2.$ === jQuery3) {
            window2.$ = _$;
          }
          if (deep && window2.jQuery === jQuery3) {
            window2.jQuery = _jQuery;
          }
          return jQuery3;
        };
        if (typeof noGlobal === "undefined") {
          window2.jQuery = window2.$ = jQuery3;
        }
        return jQuery3;
      });
    }
  });

  // node_modules/underscore/underscore-umd.js
  var require_underscore_umd = __commonJS({
    "node_modules/underscore/underscore-umd.js"(exports, module) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define("underscore", factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, (function() {
          var current = global2._;
          var exports2 = global2._ = factory();
          exports2.noConflict = function() {
            global2._ = current;
            return exports2;
          };
        })());
      })(exports, (function() {
        var VERSION = "1.13.8";
        var root = typeof self == "object" && self.self === self && self || typeof global == "object" && global.global === global && global || Function("return this")() || {};
        var ArrayProto = Array.prototype, ObjProto = Object.prototype;
        var SymbolProto = typeof Symbol !== "undefined" ? Symbol.prototype : null;
        var push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
        var supportsArrayBuffer = typeof ArrayBuffer !== "undefined", supportsDataView = typeof DataView !== "undefined";
        var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeCreate = Object.create, nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;
        var _isNaN = isNaN, _isFinite = isFinite;
        var hasEnumBug = !{ toString: null }.propertyIsEnumerable("toString");
        var nonEnumerableProps = [
          "valueOf",
          "isPrototypeOf",
          "toString",
          "propertyIsEnumerable",
          "hasOwnProperty",
          "toLocaleString"
        ];
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        function restArguments(func, startIndex) {
          startIndex = startIndex == null ? func.length - 1 : +startIndex;
          return function() {
            var length = Math.max(arguments.length - startIndex, 0), rest2 = Array(length), index = 0;
            for (; index < length; index++) {
              rest2[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
              case 0:
                return func.call(this, rest2);
              case 1:
                return func.call(this, arguments[0], rest2);
              case 2:
                return func.call(this, arguments[0], arguments[1], rest2);
            }
            var args = Array(startIndex + 1);
            for (index = 0; index < startIndex; index++) {
              args[index] = arguments[index];
            }
            args[startIndex] = rest2;
            return func.apply(this, args);
          };
        }
        function isObject(obj) {
          var type = typeof obj;
          return type === "function" || type === "object" && !!obj;
        }
        function isNull(obj) {
          return obj === null;
        }
        function isUndefined(obj) {
          return obj === void 0;
        }
        function isBoolean(obj) {
          return obj === true || obj === false || toString.call(obj) === "[object Boolean]";
        }
        function isElement(obj) {
          return !!(obj && obj.nodeType === 1);
        }
        function tagTester(name) {
          var tag = "[object " + name + "]";
          return function(obj) {
            return toString.call(obj) === tag;
          };
        }
        var isString = tagTester("String");
        var isNumber = tagTester("Number");
        var isDate = tagTester("Date");
        var isRegExp = tagTester("RegExp");
        var isError = tagTester("Error");
        var isSymbol = tagTester("Symbol");
        var isArrayBuffer = tagTester("ArrayBuffer");
        var isFunction = tagTester("Function");
        var nodelist = root.document && root.document.childNodes;
        if (typeof /./ != "function" && typeof Int8Array != "object" && typeof nodelist != "function") {
          isFunction = function(obj) {
            return typeof obj == "function" || false;
          };
        }
        var isFunction$1 = isFunction;
        var hasObjectTag = tagTester("Object");
        var hasDataViewBug = supportsDataView && (!/\[native code\]/.test(String(DataView)) || hasObjectTag(new DataView(new ArrayBuffer(8)))), isIE11 = typeof Map !== "undefined" && hasObjectTag(/* @__PURE__ */ new Map());
        var isDataView = tagTester("DataView");
        function alternateIsDataView(obj) {
          return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
        }
        var isDataView$1 = hasDataViewBug ? alternateIsDataView : isDataView;
        var isArray = nativeIsArray || tagTester("Array");
        function has$1(obj, key) {
          return obj != null && hasOwnProperty.call(obj, key);
        }
        var isArguments = tagTester("Arguments");
        (function() {
          if (!isArguments(arguments)) {
            isArguments = function(obj) {
              return has$1(obj, "callee");
            };
          }
        })();
        var isArguments$1 = isArguments;
        function isFinite$1(obj) {
          return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
        }
        function isNaN$1(obj) {
          return isNumber(obj) && _isNaN(obj);
        }
        function constant(value) {
          return function() {
            return value;
          };
        }
        function createSizePropertyCheck(getSizeProperty) {
          return function(collection) {
            var sizeProperty = getSizeProperty(collection);
            return typeof sizeProperty == "number" && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
          };
        }
        function shallowProperty(key) {
          return function(obj) {
            return obj == null ? void 0 : obj[key];
          };
        }
        var getByteLength = shallowProperty("byteLength");
        var isBufferLike = createSizePropertyCheck(getByteLength);
        var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
        function isTypedArray(obj) {
          return nativeIsView ? nativeIsView(obj) && !isDataView$1(obj) : isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
        }
        var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);
        var getLength = shallowProperty("length");
        function emulatedSet(keys2) {
          var hash = {};
          for (var l = keys2.length, i = 0; i < l; ++i) hash[keys2[i]] = true;
          return {
            contains: function(key) {
              return hash[key] === true;
            },
            push: function(key) {
              hash[key] = true;
              return keys2.push(key);
            }
          };
        }
        function collectNonEnumProps(obj, keys2) {
          keys2 = emulatedSet(keys2);
          var nonEnumIdx = nonEnumerableProps.length;
          var constructor = obj.constructor;
          var proto = isFunction$1(constructor) && constructor.prototype || ObjProto;
          var prop = "constructor";
          if (has$1(obj, prop) && !keys2.contains(prop)) keys2.push(prop);
          while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !keys2.contains(prop)) {
              keys2.push(prop);
            }
          }
        }
        function keys(obj) {
          if (!isObject(obj)) return [];
          if (nativeKeys) return nativeKeys(obj);
          var keys2 = [];
          for (var key in obj) if (has$1(obj, key)) keys2.push(key);
          if (hasEnumBug) collectNonEnumProps(obj, keys2);
          return keys2;
        }
        function isEmpty(obj) {
          if (obj == null) return true;
          var length = getLength(obj);
          if (typeof length == "number" && (isArray(obj) || isString(obj) || isArguments$1(obj))) return length === 0;
          return getLength(keys(obj)) === 0;
        }
        function isMatch(object2, attrs) {
          var _keys = keys(attrs), length = _keys.length;
          if (object2 == null) return !length;
          var obj = Object(object2);
          for (var i = 0; i < length; i++) {
            var key = _keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
          }
          return true;
        }
        function _$1(obj) {
          if (obj instanceof _$1) return obj;
          if (!(this instanceof _$1)) return new _$1(obj);
          this._wrapped = obj;
        }
        _$1.VERSION = VERSION;
        _$1.prototype.value = function() {
          return this._wrapped;
        };
        _$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;
        _$1.prototype.toString = function() {
          return String(this._wrapped);
        };
        function toBufferView(bufferSource) {
          return new Uint8Array(
            bufferSource.buffer || bufferSource,
            bufferSource.byteOffset || 0,
            getByteLength(bufferSource)
          );
        }
        var tagDataView = "[object DataView]";
        function isEqual(a, b) {
          var todo = [{ a, b }];
          var aStack = [], bStack = [];
          while (todo.length) {
            var frame = todo.pop();
            if (frame === true) {
              aStack.pop();
              bStack.pop();
              continue;
            }
            a = frame.a;
            b = frame.b;
            if (a === b) {
              if (a !== 0 || 1 / a === 1 / b) continue;
              return false;
            }
            if (a == null || b == null) return false;
            if (a !== a) {
              if (b !== b) continue;
              return false;
            }
            var type = typeof a;
            if (type !== "function" && type !== "object" && typeof b != "object") return false;
            if (a instanceof _$1) a = a._wrapped;
            if (b instanceof _$1) b = b._wrapped;
            var className = toString.call(a);
            if (className !== toString.call(b)) return false;
            if (hasDataViewBug && className == "[object Object]" && isDataView$1(a)) {
              if (!isDataView$1(b)) return false;
              className = tagDataView;
            }
            switch (className) {
              // These types are compared by value.
              case "[object RegExp]":
              // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
              case "[object String]":
                if ("" + a === "" + b) continue;
                return false;
              case "[object Number]":
                todo.push({ a: +a, b: +b });
                continue;
              case "[object Date]":
              case "[object Boolean]":
                if (+a === +b) continue;
                return false;
              case "[object Symbol]":
                if (SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b)) continue;
                return false;
              case "[object ArrayBuffer]":
              case tagDataView:
                todo.push({ a: toBufferView(a), b: toBufferView(b) });
                continue;
            }
            var areArrays = className === "[object Array]";
            if (!areArrays && isTypedArray$1(a)) {
              var byteLength = getByteLength(a);
              if (byteLength !== getByteLength(b)) return false;
              if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) continue;
              areArrays = true;
            }
            if (!areArrays) {
              if (typeof a != "object" || typeof b != "object") return false;
              var aCtor = a.constructor, bCtor = b.constructor;
              if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor && isFunction$1(bCtor) && bCtor instanceof bCtor) && ("constructor" in a && "constructor" in b)) {
                return false;
              }
            }
            var length = aStack.length;
            while (length--) {
              if (aStack[length] === a) {
                if (bStack[length] === b) break;
                return false;
              }
            }
            if (length >= 0) continue;
            aStack.push(a);
            bStack.push(b);
            todo.push(true);
            if (areArrays) {
              length = a.length;
              if (length !== b.length) return false;
              while (length--) {
                todo.push({ a: a[length], b: b[length] });
              }
            } else {
              var _keys = keys(a), key;
              length = _keys.length;
              if (keys(b).length !== length) return false;
              while (length--) {
                key = _keys[length];
                if (!has$1(b, key)) return false;
                todo.push({ a: a[key], b: b[key] });
              }
            }
          }
          return true;
        }
        function allKeys(obj) {
          if (!isObject(obj)) return [];
          var keys2 = [];
          for (var key in obj) keys2.push(key);
          if (hasEnumBug) collectNonEnumProps(obj, keys2);
          return keys2;
        }
        function ie11fingerprint(methods) {
          var length = getLength(methods);
          return function(obj) {
            if (obj == null) return false;
            var keys2 = allKeys(obj);
            if (getLength(keys2)) return false;
            for (var i = 0; i < length; i++) {
              if (!isFunction$1(obj[methods[i]])) return false;
            }
            return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
          };
        }
        var forEachName = "forEach", hasName = "has", commonInit = ["clear", "delete"], mapTail = ["get", hasName, "set"];
        var mapMethods = commonInit.concat(forEachName, mapTail), weakMapMethods = commonInit.concat(mapTail), setMethods = ["add"].concat(commonInit, forEachName, hasName);
        var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester("Map");
        var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester("WeakMap");
        var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester("Set");
        var isWeakSet = tagTester("WeakSet");
        function values(obj) {
          var _keys = keys(obj);
          var length = _keys.length;
          var values2 = Array(length);
          for (var i = 0; i < length; i++) {
            values2[i] = obj[_keys[i]];
          }
          return values2;
        }
        function pairs(obj) {
          var _keys = keys(obj);
          var length = _keys.length;
          var pairs2 = Array(length);
          for (var i = 0; i < length; i++) {
            pairs2[i] = [_keys[i], obj[_keys[i]]];
          }
          return pairs2;
        }
        function invert(obj) {
          var result2 = {};
          var _keys = keys(obj);
          for (var i = 0, length = _keys.length; i < length; i++) {
            result2[obj[_keys[i]]] = _keys[i];
          }
          return result2;
        }
        function functions(obj) {
          var names = [];
          for (var key in obj) {
            if (isFunction$1(obj[key])) names.push(key);
          }
          return names.sort();
        }
        function createAssigner(keysFunc, defaults2) {
          return function(obj) {
            var length = arguments.length;
            if (defaults2) obj = Object(obj);
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
              var source = arguments[index], keys2 = keysFunc(source), l = keys2.length;
              for (var i = 0; i < l; i++) {
                var key = keys2[i];
                if (!defaults2 || obj[key] === void 0) obj[key] = source[key];
              }
            }
            return obj;
          };
        }
        var extend = createAssigner(allKeys);
        var extendOwn = createAssigner(keys);
        var defaults = createAssigner(allKeys, true);
        function ctor() {
          return function() {
          };
        }
        function baseCreate(prototype) {
          if (!isObject(prototype)) return {};
          if (nativeCreate) return nativeCreate(prototype);
          var Ctor = ctor();
          Ctor.prototype = prototype;
          var result2 = new Ctor();
          Ctor.prototype = null;
          return result2;
        }
        function create(prototype, props) {
          var result2 = baseCreate(prototype);
          if (props) extendOwn(result2, props);
          return result2;
        }
        function clone(obj) {
          if (!isObject(obj)) return obj;
          return isArray(obj) ? obj.slice() : extend({}, obj);
        }
        function tap(obj, interceptor) {
          interceptor(obj);
          return obj;
        }
        function toPath$1(path) {
          return isArray(path) ? path : [path];
        }
        _$1.toPath = toPath$1;
        function toPath(path) {
          return _$1.toPath(path);
        }
        function deepGet(obj, path) {
          var length = path.length;
          for (var i = 0; i < length; i++) {
            if (obj == null) return void 0;
            obj = obj[path[i]];
          }
          return length ? obj : void 0;
        }
        function get(object2, path, defaultValue) {
          var value = deepGet(object2, toPath(path));
          return isUndefined(value) ? defaultValue : value;
        }
        function has(obj, path) {
          path = toPath(path);
          var length = path.length;
          for (var i = 0; i < length; i++) {
            var key = path[i];
            if (!has$1(obj, key)) return false;
            obj = obj[key];
          }
          return !!length;
        }
        function identity(value) {
          return value;
        }
        function matcher(attrs) {
          attrs = extendOwn({}, attrs);
          return function(obj) {
            return isMatch(obj, attrs);
          };
        }
        function property(path) {
          path = toPath(path);
          return function(obj) {
            return deepGet(obj, path);
          };
        }
        function optimizeCb(func, context, argCount) {
          if (context === void 0) return func;
          switch (argCount == null ? 3 : argCount) {
            case 1:
              return function(value) {
                return func.call(context, value);
              };
            // The 2-argument case is omitted because we’re not using it.
            case 3:
              return function(value, index, collection) {
                return func.call(context, value, index, collection);
              };
            case 4:
              return function(accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
              };
          }
          return function() {
            return func.apply(context, arguments);
          };
        }
        function baseIteratee(value, context, argCount) {
          if (value == null) return identity;
          if (isFunction$1(value)) return optimizeCb(value, context, argCount);
          if (isObject(value) && !isArray(value)) return matcher(value);
          return property(value);
        }
        function iteratee(value, context) {
          return baseIteratee(value, context, Infinity);
        }
        _$1.iteratee = iteratee;
        function cb(value, context, argCount) {
          if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
          return baseIteratee(value, context, argCount);
        }
        function mapObject(obj, iteratee2, context) {
          iteratee2 = cb(iteratee2, context);
          var _keys = keys(obj), length = _keys.length, results = {};
          for (var index = 0; index < length; index++) {
            var currentKey = _keys[index];
            results[currentKey] = iteratee2(obj[currentKey], currentKey, obj);
          }
          return results;
        }
        function noop() {
        }
        function propertyOf(obj) {
          if (obj == null) return noop;
          return function(path) {
            return get(obj, path);
          };
        }
        function times(n, iteratee2, context) {
          var accum = Array(Math.max(0, n));
          iteratee2 = optimizeCb(iteratee2, context, 1);
          for (var i = 0; i < n; i++) accum[i] = iteratee2(i);
          return accum;
        }
        function random(min2, max2) {
          if (max2 == null) {
            max2 = min2;
            min2 = 0;
          }
          return min2 + Math.floor(Math.random() * (max2 - min2 + 1));
        }
        var now = Date.now || function() {
          return (/* @__PURE__ */ new Date()).getTime();
        };
        function createEscaper(map2) {
          var escaper = function(match) {
            return map2[match];
          };
          var source = "(?:" + keys(map2).join("|") + ")";
          var testRegexp = RegExp(source);
          var replaceRegexp = RegExp(source, "g");
          return function(string) {
            string = string == null ? "" : "" + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
          };
        }
        var escapeMap = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        };
        var _escape = createEscaper(escapeMap);
        var unescapeMap = invert(escapeMap);
        var _unescape = createEscaper(unescapeMap);
        var templateSettings = _$1.templateSettings = {
          evaluate: /<%([\s\S]+?)%>/g,
          interpolate: /<%=([\s\S]+?)%>/g,
          escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var escapes = {
          "'": "'",
          "\\": "\\",
          "\r": "r",
          "\n": "n",
          "\u2028": "u2028",
          "\u2029": "u2029"
        };
        var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
        function escapeChar(match) {
          return "\\" + escapes[match];
        }
        var bareIdentifier = /^\s*(\w|\$)+\s*$/;
        function template(text, settings, oldSettings) {
          if (!settings && oldSettings) settings = oldSettings;
          settings = defaults({}, settings, _$1.templateSettings);
          var matcher2 = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
          ].join("|") + "|$", "g");
          var index = 0;
          var source = "__p+='";
          text.replace(matcher2, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
            index = offset + match.length;
            if (escape) {
              source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
              source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
              source += "';\n" + evaluate + "\n__p+='";
            }
            return match;
          });
          source += "';\n";
          var argument = settings.variable;
          if (argument) {
            if (!bareIdentifier.test(argument)) throw new Error(
              "variable is not a bare identifier: " + argument
            );
          } else {
            source = "with(obj||{}){\n" + source + "}\n";
            argument = "obj";
          }
          source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
          var render;
          try {
            render = new Function(argument, "_", source);
          } catch (e) {
            e.source = source;
            throw e;
          }
          var template2 = function(data) {
            return render.call(this, data, _$1);
          };
          template2.source = "function(" + argument + "){\n" + source + "}";
          return template2;
        }
        function result(obj, path, fallback) {
          path = toPath(path);
          var length = path.length;
          if (!length) {
            return isFunction$1(fallback) ? fallback.call(obj) : fallback;
          }
          for (var i = 0; i < length; i++) {
            var prop = obj == null ? void 0 : obj[path[i]];
            if (prop === void 0) {
              prop = fallback;
              i = length;
            }
            obj = isFunction$1(prop) ? prop.call(obj) : prop;
          }
          return obj;
        }
        var idCounter = 0;
        function uniqueId(prefix) {
          var id = ++idCounter + "";
          return prefix ? prefix + id : id;
        }
        function chain(obj) {
          var instance = _$1(obj);
          instance._chain = true;
          return instance;
        }
        function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
          if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
          var self2 = baseCreate(sourceFunc.prototype);
          var result2 = sourceFunc.apply(self2, args);
          if (isObject(result2)) return result2;
          return self2;
        }
        var partial = restArguments(function(func, boundArgs) {
          var placeholder = partial.placeholder;
          var bound = function() {
            var position = 0, length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
              args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
          };
          return bound;
        });
        partial.placeholder = _$1;
        var bind = restArguments(function(func, context, args) {
          if (!isFunction$1(func)) throw new TypeError("Bind must be called on a function");
          var bound = restArguments(function(callArgs) {
            return executeBound(func, bound, context, this, args.concat(callArgs));
          });
          return bound;
        });
        var isArrayLike = createSizePropertyCheck(getLength);
        function flatten$1(input, depth, strict) {
          if (!depth && depth !== 0) depth = Infinity;
          var output = [], idx = 0, i = 0, length = getLength(input) || 0, stack = [];
          while (true) {
            if (i >= length) {
              if (!stack.length) break;
              var frame = stack.pop();
              i = frame.i;
              input = frame.v;
              length = getLength(input);
              continue;
            }
            var value = input[i++];
            if (stack.length >= depth) {
              output[idx++] = value;
            } else if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
              stack.push({ i, v: input });
              i = 0;
              input = value;
              length = getLength(input);
            } else if (!strict) {
              output[idx++] = value;
            }
          }
          return output;
        }
        var bindAll = restArguments(function(obj, keys2) {
          keys2 = flatten$1(keys2, false, false);
          var index = keys2.length;
          if (index < 1) throw new Error("bindAll must be passed function names");
          while (index--) {
            var key = keys2[index];
            obj[key] = bind(obj[key], obj);
          }
          return obj;
        });
        function memoize(func, hasher) {
          var memoize2 = function(key) {
            var cache = memoize2.cache;
            var address = "" + (hasher ? hasher.apply(this, arguments) : key);
            if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
            return cache[address];
          };
          memoize2.cache = {};
          return memoize2;
        }
        var delay = restArguments(function(func, wait, args) {
          return setTimeout(function() {
            return func.apply(null, args);
          }, wait);
        });
        var defer = partial(delay, _$1, 1);
        function throttle(func, wait, options) {
          var timeout, context, args, result2;
          var previous = 0;
          if (!options) options = {};
          var later = function() {
            previous = options.leading === false ? 0 : now();
            timeout = null;
            result2 = func.apply(context, args);
            if (!timeout) context = args = null;
          };
          var throttled = function() {
            var _now = now();
            if (!previous && options.leading === false) previous = _now;
            var remaining = wait - (_now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
              if (timeout) {
                clearTimeout(timeout);
                timeout = null;
              }
              previous = _now;
              result2 = func.apply(context, args);
              if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
              timeout = setTimeout(later, remaining);
            }
            return result2;
          };
          throttled.cancel = function() {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
          };
          return throttled;
        }
        function debounce(func, wait, immediate) {
          var timeout, previous, args, result2, context;
          var later = function() {
            var passed = now() - previous;
            if (wait > passed) {
              timeout = setTimeout(later, wait - passed);
            } else {
              timeout = null;
              if (!immediate) result2 = func.apply(context, args);
              if (!timeout) args = context = null;
            }
          };
          var debounced = restArguments(function(_args) {
            context = this;
            args = _args;
            previous = now();
            if (!timeout) {
              timeout = setTimeout(later, wait);
              if (immediate) result2 = func.apply(context, args);
            }
            return result2;
          });
          debounced.cancel = function() {
            clearTimeout(timeout);
            timeout = args = context = null;
          };
          return debounced;
        }
        function wrap(func, wrapper) {
          return partial(wrapper, func);
        }
        function negate(predicate) {
          return function() {
            return !predicate.apply(this, arguments);
          };
        }
        function compose() {
          var args = arguments;
          var start = args.length - 1;
          return function() {
            var i = start;
            var result2 = args[start].apply(this, arguments);
            while (i--) result2 = args[i].call(this, result2);
            return result2;
          };
        }
        function after(times2, func) {
          return function() {
            if (--times2 < 1) {
              return func.apply(this, arguments);
            }
          };
        }
        function before(times2, func) {
          var memo;
          return function() {
            if (--times2 > 0) {
              memo = func.apply(this, arguments);
            }
            if (times2 <= 1) func = null;
            return memo;
          };
        }
        var once = partial(before, 2);
        function findKey(obj, predicate, context) {
          predicate = cb(predicate, context);
          var _keys = keys(obj), key;
          for (var i = 0, length = _keys.length; i < length; i++) {
            key = _keys[i];
            if (predicate(obj[key], key, obj)) return key;
          }
        }
        function createPredicateIndexFinder(dir) {
          return function(array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
              if (predicate(array[index], index, array)) return index;
            }
            return -1;
          };
        }
        var findIndex = createPredicateIndexFinder(1);
        var findLastIndex = createPredicateIndexFinder(-1);
        function sortedIndex(array, obj, iteratee2, context) {
          iteratee2 = cb(iteratee2, context, 1);
          var value = iteratee2(obj);
          var low = 0, high = getLength(array);
          while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee2(array[mid]) < value) low = mid + 1;
            else high = mid;
          }
          return low;
        }
        function createIndexFinder(dir, predicateFind, sortedIndex2) {
          return function(array, item, idx) {
            var i = 0, length = getLength(array);
            if (typeof idx == "number") {
              if (dir > 0) {
                i = idx >= 0 ? idx : Math.max(idx + length, i);
              } else {
                length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
              }
            } else if (sortedIndex2 && idx && length) {
              idx = sortedIndex2(array, item);
              return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
              idx = predicateFind(slice.call(array, i, length), isNaN$1);
              return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
              if (array[idx] === item) return idx;
            }
            return -1;
          };
        }
        var indexOf = createIndexFinder(1, findIndex, sortedIndex);
        var lastIndexOf = createIndexFinder(-1, findLastIndex);
        function find(obj, predicate, context) {
          var keyFinder = isArrayLike(obj) ? findIndex : findKey;
          var key = keyFinder(obj, predicate, context);
          if (key !== void 0 && key !== -1) return obj[key];
        }
        function findWhere(obj, attrs) {
          return find(obj, matcher(attrs));
        }
        function each(obj, iteratee2, context) {
          iteratee2 = optimizeCb(iteratee2, context);
          var i, length;
          if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
              iteratee2(obj[i], i, obj);
            }
          } else {
            var _keys = keys(obj);
            for (i = 0, length = _keys.length; i < length; i++) {
              iteratee2(obj[_keys[i]], _keys[i], obj);
            }
          }
          return obj;
        }
        function map(obj, iteratee2, context) {
          iteratee2 = cb(iteratee2, context);
          var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, results = Array(length);
          for (var index = 0; index < length; index++) {
            var currentKey = _keys ? _keys[index] : index;
            results[index] = iteratee2(obj[currentKey], currentKey, obj);
          }
          return results;
        }
        function createReduce(dir) {
          var reducer = function(obj, iteratee2, memo, initial2) {
            var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = dir > 0 ? 0 : length - 1;
            if (!initial2) {
              memo = obj[_keys ? _keys[index] : index];
              index += dir;
            }
            for (; index >= 0 && index < length; index += dir) {
              var currentKey = _keys ? _keys[index] : index;
              memo = iteratee2(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
          };
          return function(obj, iteratee2, memo, context) {
            var initial2 = arguments.length >= 3;
            return reducer(obj, optimizeCb(iteratee2, context, 4), memo, initial2);
          };
        }
        var reduce = createReduce(1);
        var reduceRight = createReduce(-1);
        function filter(obj, predicate, context) {
          var results = [];
          predicate = cb(predicate, context);
          each(obj, function(value, index, list) {
            if (predicate(value, index, list)) results.push(value);
          });
          return results;
        }
        function reject(obj, predicate, context) {
          return filter(obj, negate(cb(predicate)), context);
        }
        function every(obj, predicate, context) {
          predicate = cb(predicate, context);
          var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length;
          for (var index = 0; index < length; index++) {
            var currentKey = _keys ? _keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
          }
          return true;
        }
        function some(obj, predicate, context) {
          predicate = cb(predicate, context);
          var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length;
          for (var index = 0; index < length; index++) {
            var currentKey = _keys ? _keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
          }
          return false;
        }
        function contains(obj, item, fromIndex, guard) {
          if (!isArrayLike(obj)) obj = values(obj);
          if (typeof fromIndex != "number" || guard) fromIndex = 0;
          return indexOf(obj, item, fromIndex) >= 0;
        }
        var invoke = restArguments(function(obj, path, args) {
          var contextPath, func;
          if (isFunction$1(path)) {
            func = path;
          } else {
            path = toPath(path);
            contextPath = path.slice(0, -1);
            path = path[path.length - 1];
          }
          return map(obj, function(context) {
            var method = func;
            if (!method) {
              if (contextPath && contextPath.length) {
                context = deepGet(context, contextPath);
              }
              if (context == null) return void 0;
              method = context[path];
            }
            return method == null ? method : method.apply(context, args);
          });
        });
        function pluck(obj, key) {
          return map(obj, property(key));
        }
        function where(obj, attrs) {
          return filter(obj, matcher(attrs));
        }
        function max(obj, iteratee2, context) {
          var result2 = -Infinity, lastComputed = -Infinity, value, computed;
          if (iteratee2 == null || typeof iteratee2 == "number" && typeof obj[0] != "object" && obj != null) {
            obj = isArrayLike(obj) ? obj : values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
              value = obj[i];
              if (value != null && value > result2) {
                result2 = value;
              }
            }
          } else {
            iteratee2 = cb(iteratee2, context);
            each(obj, function(v, index, list) {
              computed = iteratee2(v, index, list);
              if (computed > lastComputed || computed === -Infinity && result2 === -Infinity) {
                result2 = v;
                lastComputed = computed;
              }
            });
          }
          return result2;
        }
        function min(obj, iteratee2, context) {
          var result2 = Infinity, lastComputed = Infinity, value, computed;
          if (iteratee2 == null || typeof iteratee2 == "number" && typeof obj[0] != "object" && obj != null) {
            obj = isArrayLike(obj) ? obj : values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
              value = obj[i];
              if (value != null && value < result2) {
                result2 = value;
              }
            }
          } else {
            iteratee2 = cb(iteratee2, context);
            each(obj, function(v, index, list) {
              computed = iteratee2(v, index, list);
              if (computed < lastComputed || computed === Infinity && result2 === Infinity) {
                result2 = v;
                lastComputed = computed;
              }
            });
          }
          return result2;
        }
        var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
        function toArray(obj) {
          if (!obj) return [];
          if (isArray(obj)) return slice.call(obj);
          if (isString(obj)) {
            return obj.match(reStrSymbol);
          }
          if (isArrayLike(obj)) return map(obj, identity);
          return values(obj);
        }
        function sample(obj, n, guard) {
          if (n == null || guard) {
            if (!isArrayLike(obj)) obj = values(obj);
            return obj[random(obj.length - 1)];
          }
          var sample2 = toArray(obj);
          var length = getLength(sample2);
          n = Math.max(Math.min(n, length), 0);
          var last2 = length - 1;
          for (var index = 0; index < n; index++) {
            var rand = random(index, last2);
            var temp = sample2[index];
            sample2[index] = sample2[rand];
            sample2[rand] = temp;
          }
          return sample2.slice(0, n);
        }
        function shuffle(obj) {
          return sample(obj, Infinity);
        }
        function sortBy(obj, iteratee2, context) {
          var index = 0;
          iteratee2 = cb(iteratee2, context);
          return pluck(map(obj, function(value, key, list) {
            return {
              value,
              index: index++,
              criteria: iteratee2(value, key, list)
            };
          }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
              if (a > b || a === void 0) return 1;
              if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
          }), "value");
        }
        function group(behavior, partition2) {
          return function(obj, iteratee2, context) {
            var result2 = partition2 ? [[], []] : {};
            iteratee2 = cb(iteratee2, context);
            each(obj, function(value, index) {
              var key = iteratee2(value, index, obj);
              behavior(result2, value, key);
            });
            return result2;
          };
        }
        var groupBy = group(function(result2, value, key) {
          if (has$1(result2, key)) result2[key].push(value);
          else result2[key] = [value];
        });
        var indexBy = group(function(result2, value, key) {
          result2[key] = value;
        });
        var countBy = group(function(result2, value, key) {
          if (has$1(result2, key)) result2[key]++;
          else result2[key] = 1;
        });
        var partition = group(function(result2, value, pass) {
          result2[pass ? 0 : 1].push(value);
        }, true);
        function size(obj) {
          if (obj == null) return 0;
          return isArrayLike(obj) ? obj.length : keys(obj).length;
        }
        function keyInObj(value, key, obj) {
          return key in obj;
        }
        var pick = restArguments(function(obj, keys2) {
          var result2 = {}, iteratee2 = keys2[0];
          if (obj == null) return result2;
          if (isFunction$1(iteratee2)) {
            if (keys2.length > 1) iteratee2 = optimizeCb(iteratee2, keys2[1]);
            keys2 = allKeys(obj);
          } else {
            iteratee2 = keyInObj;
            keys2 = flatten$1(keys2, false, false);
            obj = Object(obj);
          }
          for (var i = 0, length = keys2.length; i < length; i++) {
            var key = keys2[i];
            var value = obj[key];
            if (iteratee2(value, key, obj)) result2[key] = value;
          }
          return result2;
        });
        var omit = restArguments(function(obj, keys2) {
          var iteratee2 = keys2[0], context;
          if (isFunction$1(iteratee2)) {
            iteratee2 = negate(iteratee2);
            if (keys2.length > 1) context = keys2[1];
          } else {
            keys2 = map(flatten$1(keys2, false, false), String);
            iteratee2 = function(value, key) {
              return !contains(keys2, key);
            };
          }
          return pick(obj, iteratee2, context);
        });
        function initial(array, n, guard) {
          return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
        }
        function first(array, n, guard) {
          if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
          if (n == null || guard) return array[0];
          return initial(array, array.length - n);
        }
        function rest(array, n, guard) {
          return slice.call(array, n == null || guard ? 1 : n);
        }
        function last(array, n, guard) {
          if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
          if (n == null || guard) return array[array.length - 1];
          return rest(array, Math.max(0, array.length - n));
        }
        function compact(array) {
          return filter(array, Boolean);
        }
        function flatten(array, depth) {
          return flatten$1(array, depth, false);
        }
        var difference = restArguments(function(array, rest2) {
          rest2 = flatten$1(rest2, true, true);
          return filter(array, function(value) {
            return !contains(rest2, value);
          });
        });
        var without = restArguments(function(array, otherArrays) {
          return difference(array, otherArrays);
        });
        function uniq(array, isSorted, iteratee2, context) {
          if (!isBoolean(isSorted)) {
            context = iteratee2;
            iteratee2 = isSorted;
            isSorted = false;
          }
          if (iteratee2 != null) iteratee2 = cb(iteratee2, context);
          var result2 = [];
          var seen = [];
          for (var i = 0, length = getLength(array); i < length; i++) {
            var value = array[i], computed = iteratee2 ? iteratee2(value, i, array) : value;
            if (isSorted && !iteratee2) {
              if (!i || seen !== computed) result2.push(value);
              seen = computed;
            } else if (iteratee2) {
              if (!contains(seen, computed)) {
                seen.push(computed);
                result2.push(value);
              }
            } else if (!contains(result2, value)) {
              result2.push(value);
            }
          }
          return result2;
        }
        var union = restArguments(function(arrays) {
          return uniq(flatten$1(arrays, true, true));
        });
        function intersection(array) {
          var result2 = [];
          var argsLength = arguments.length;
          for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            if (contains(result2, item)) continue;
            var j;
            for (j = 1; j < argsLength; j++) {
              if (!contains(arguments[j], item)) break;
            }
            if (j === argsLength) result2.push(item);
          }
          return result2;
        }
        function unzip(array) {
          var length = array && max(array, getLength).length || 0;
          var result2 = Array(length);
          for (var index = 0; index < length; index++) {
            result2[index] = pluck(array, index);
          }
          return result2;
        }
        var zip = restArguments(unzip);
        function object(list, values2) {
          var result2 = {};
          for (var i = 0, length = getLength(list); i < length; i++) {
            if (values2) {
              result2[list[i]] = values2[i];
            } else {
              result2[list[i][0]] = list[i][1];
            }
          }
          return result2;
        }
        function range(start, stop, step) {
          if (stop == null) {
            stop = start || 0;
            start = 0;
          }
          if (!step) {
            step = stop < start ? -1 : 1;
          }
          var length = Math.max(Math.ceil((stop - start) / step), 0);
          var range2 = Array(length);
          for (var idx = 0; idx < length; idx++, start += step) {
            range2[idx] = start;
          }
          return range2;
        }
        function chunk(array, count) {
          if (count == null || count < 1) return [];
          var result2 = [];
          var i = 0, length = array.length;
          while (i < length) {
            result2.push(slice.call(array, i, i += count));
          }
          return result2;
        }
        function chainResult(instance, obj) {
          return instance._chain ? _$1(obj).chain() : obj;
        }
        function mixin(obj) {
          each(functions(obj), function(name) {
            var func = _$1[name] = obj[name];
            _$1.prototype[name] = function() {
              var args = [this._wrapped];
              push.apply(args, arguments);
              return chainResult(this, func.apply(_$1, args));
            };
          });
          return _$1;
        }
        each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(name) {
          var method = ArrayProto[name];
          _$1.prototype[name] = function() {
            var obj = this._wrapped;
            if (obj != null) {
              method.apply(obj, arguments);
              if ((name === "shift" || name === "splice") && obj.length === 0) {
                delete obj[0];
              }
            }
            return chainResult(this, obj);
          };
        });
        each(["concat", "join", "slice"], function(name) {
          var method = ArrayProto[name];
          _$1.prototype[name] = function() {
            var obj = this._wrapped;
            if (obj != null) obj = method.apply(obj, arguments);
            return chainResult(this, obj);
          };
        });
        var allExports = {
          __proto__: null,
          VERSION,
          restArguments,
          isObject,
          isNull,
          isUndefined,
          isBoolean,
          isElement,
          isString,
          isNumber,
          isDate,
          isRegExp,
          isError,
          isSymbol,
          isArrayBuffer,
          isDataView: isDataView$1,
          isArray,
          isFunction: isFunction$1,
          isArguments: isArguments$1,
          isFinite: isFinite$1,
          isNaN: isNaN$1,
          isTypedArray: isTypedArray$1,
          isEmpty,
          isMatch,
          isEqual,
          isMap,
          isWeakMap,
          isSet,
          isWeakSet,
          keys,
          allKeys,
          values,
          pairs,
          invert,
          functions,
          methods: functions,
          extend,
          extendOwn,
          assign: extendOwn,
          defaults,
          create,
          clone,
          tap,
          get,
          has,
          mapObject,
          identity,
          constant,
          noop,
          toPath: toPath$1,
          property,
          propertyOf,
          matcher,
          matches: matcher,
          times,
          random,
          now,
          escape: _escape,
          unescape: _unescape,
          templateSettings,
          template,
          result,
          uniqueId,
          chain,
          iteratee,
          partial,
          bind,
          bindAll,
          memoize,
          delay,
          defer,
          throttle,
          debounce,
          wrap,
          negate,
          compose,
          after,
          before,
          once,
          findKey,
          findIndex,
          findLastIndex,
          sortedIndex,
          indexOf,
          lastIndexOf,
          find,
          detect: find,
          findWhere,
          each,
          forEach: each,
          map,
          collect: map,
          reduce,
          foldl: reduce,
          inject: reduce,
          reduceRight,
          foldr: reduceRight,
          filter,
          select: filter,
          reject,
          every,
          all: every,
          some,
          any: some,
          contains,
          includes: contains,
          include: contains,
          invoke,
          pluck,
          where,
          max,
          min,
          shuffle,
          sample,
          sortBy,
          groupBy,
          indexBy,
          countBy,
          partition,
          toArray,
          size,
          pick,
          omit,
          first,
          head: first,
          take: first,
          initial,
          last,
          rest,
          tail: rest,
          drop: rest,
          compact,
          flatten,
          without,
          uniq,
          unique: uniq,
          union,
          intersection,
          difference,
          unzip,
          transpose: unzip,
          zip,
          object,
          range,
          chunk,
          mixin,
          "default": _$1
        };
        var _ = mixin(allExports);
        _._ = _;
        return _;
      }));
    }
  });

  // vendor/mapjs/src/browser/create-svg.js
  var require_create_svg = __commonJS({
    "vendor/mapjs/src/browser/create-svg.js"(exports, module) {
      var jQuery3 = require_jquery();
      module.exports = function createSVG(tag) {
        "use strict";
        return jQuery3(document.createElementNS("http://www.w3.org/2000/svg", tag || "svg"));
      };
    }
  });

  // node_modules/jquery.hotkeys/jquery.hotkeys.js
  var require_jquery_hotkeys = __commonJS({
    "node_modules/jquery.hotkeys/jquery.hotkeys.js"(exports) {
      (function(jQuery3) {
        jQuery3.hotkeys = {
          version: "0.2.0",
          specialKeys: {
            8: "backspace",
            9: "tab",
            10: "return",
            13: "return",
            16: "shift",
            17: "ctrl",
            18: "alt",
            19: "pause",
            20: "capslock",
            27: "esc",
            32: "space",
            33: "pageup",
            34: "pagedown",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            45: "insert",
            46: "del",
            59: ";",
            61: "=",
            96: "0",
            97: "1",
            98: "2",
            99: "3",
            100: "4",
            101: "5",
            102: "6",
            103: "7",
            104: "8",
            105: "9",
            106: "*",
            107: "+",
            109: "-",
            110: ".",
            111: "/",
            112: "f1",
            113: "f2",
            114: "f3",
            115: "f4",
            116: "f5",
            117: "f6",
            118: "f7",
            119: "f8",
            120: "f9",
            121: "f10",
            122: "f11",
            123: "f12",
            144: "numlock",
            145: "scroll",
            173: "-",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
          },
          shiftNums: {
            "`": "~",
            "1": "!",
            "2": "@",
            "3": "#",
            "4": "$",
            "5": "%",
            "6": "^",
            "7": "&",
            "8": "*",
            "9": "(",
            "0": ")",
            "-": "_",
            "=": "+",
            ";": ": ",
            "'": '"',
            ",": "<",
            ".": ">",
            "/": "?",
            "\\": "|"
          },
          // excludes: button, checkbox, file, hidden, image, password, radio, reset, search, submit, url
          textAcceptingInputTypes: [
            "text",
            "password",
            "number",
            "email",
            "url",
            "range",
            "date",
            "month",
            "week",
            "time",
            "datetime",
            "datetime-local",
            "search",
            "color",
            "tel"
          ],
          // default input types not to bind to unless bound directly
          textInputTypes: /textarea|input|select/i,
          options: {
            filterInputAcceptingElements: true,
            filterTextInputs: true,
            filterContentEditable: true
          }
        };
        function keyHandler(handleObj) {
          if (typeof handleObj.data === "string") {
            handleObj.data = {
              keys: handleObj.data
            };
          }
          if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
            return;
          }
          var origHandler = handleObj.handler, keys = handleObj.data.keys.toLowerCase().split(" ");
          handleObj.handler = function(event) {
            if (this !== event.target && (jQuery3.hotkeys.options.filterInputAcceptingElements && jQuery3.hotkeys.textInputTypes.test(event.target.nodeName) || jQuery3.hotkeys.options.filterContentEditable && jQuery3(event.target).attr("contenteditable") || jQuery3.hotkeys.options.filterTextInputs && jQuery3.inArray(event.target.type, jQuery3.hotkeys.textAcceptingInputTypes) > -1)) {
              return;
            }
            var special = event.type !== "keypress" && jQuery3.hotkeys.specialKeys[event.which], character = String.fromCharCode(event.which).toLowerCase(), modif = "", possible = {};
            jQuery3.each(["alt", "ctrl", "shift"], function(index, specialKey) {
              if (event[specialKey + "Key"] && special !== specialKey) {
                modif += specialKey + "+";
              }
            });
            if (event.metaKey && !event.ctrlKey && special !== "meta") {
              modif += "meta+";
            }
            if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
              modif = modif.replace("alt+ctrl+shift+", "hyper+");
            }
            if (special) {
              possible[modif + special] = true;
            } else {
              possible[modif + character] = true;
              possible[modif + jQuery3.hotkeys.shiftNums[character]] = true;
              if (modif === "shift+") {
                possible[jQuery3.hotkeys.shiftNums[character]] = true;
              }
            }
            for (var i = 0, l = keys.length; i < l; i++) {
              if (possible[keys[i]]) {
                return origHandler.apply(this, arguments);
              }
            }
          };
        }
        jQuery3.each(["keydown", "keyup", "keypress"], function() {
          jQuery3.event.special[this] = {
            add: keyHandler
          };
        });
      })(jQuery || exports.jQuery || window.jQuery);
    }
  });

  // vendor/mapjs/test/esbuild-shims/jquery-hotkeys-shim.js
  var require_jquery_hotkeys_shim = __commonJS({
    "vendor/mapjs/test/esbuild-shims/jquery-hotkeys-shim.js"() {
      window.jQuery = window.jQuery || require_jquery();
      require_jquery_hotkeys();
    }
  });

  // vendor/mapjs/src/browser/dom-map-widget.js
  var require_dom_map_widget = __commonJS({
    "vendor/mapjs/src/browser/dom-map-widget.js"() {
      var $ = require_jquery();
      var _ = require_underscore_umd();
      var createSVG = require_create_svg();
      require_jquery_hotkeys_shim();
      $.fn.scrollWhenDragging = function(scrollPredicate) {
        "use strict";
        return this.each(function() {
          const element = $(this);
          let dragOrigin;
          element.on("dragstart", function() {
            if (scrollPredicate()) {
              dragOrigin = {
                top: element.scrollTop(),
                left: element.scrollLeft()
              };
            }
          }).on("drag", function(e) {
            if (e.gesture && dragOrigin) {
              element.scrollTop(dragOrigin.top - e.gesture.deltaY);
              element.scrollLeft(dragOrigin.left - e.gesture.deltaX);
            }
          }).on("dragend", function() {
            dragOrigin = void 0;
          });
        });
      };
      $.fn.domMapWidget = function(activityLog, mapModel, touchEnabled, dragContainer, centerSelectedNodeOnOrientationChange) {
        "use strict";
        const hotkeyEventHandlers = {
          "return": "insertDown",
          "shift+return": "insertUp",
          "shift+tab": "insertLeft",
          "tab insert": "insertRight",
          "del backspace": "removeSubIdea",
          "left": "selectNodeLeft",
          "up": "selectNodeUp",
          "right": "selectNodeRight",
          "shift+right": "activateNodeRight",
          "shift+left": "activateNodeLeft",
          "meta+right ctrl+right": "moveRight",
          "meta+left ctrl+left": "moveLeft",
          "meta+up ctrl+up": "moveUp",
          "meta+down ctrl+down": "moveDown",
          "shift+up": "activateNodeUp",
          "shift+down": "activateNodeDown",
          "down": "selectNodeDown",
          "space f2": "editNode",
          "f": "toggleCollapse"
        }, charEventHandlers = {
          "[": "activateChildren",
          "{": "activateNodeAndChildren",
          "=": "activateSiblingNodes",
          ".": "activateSelectedNode",
          "/": "toggleCollapse",
          "a": "openAttachment",
          "i": "editIcon"
        }, self2 = this;
        let actOnKeys = true;
        mapModel.addEventListener("inputEnabledChanged", function(canInput, holdFocus) {
          actOnKeys = canInput;
          if (canInput && !holdFocus) {
            self2.focus();
          }
        });
        return this.each(function() {
          const element = $(this), svgContainer = createSVG().css({
            position: "absolute",
            top: 0,
            left: 0
          }).attr({
            "data-mapjs-role": "svg-container",
            "class": "mapjs-draw-container"
          }), stage = $("<div>").css(
            {
              position: "relative"
            }
          ).attr("data-mapjs-role", "stage").appendTo(element).data({
            "offsetX": element.innerWidth() / 2,
            "offsetY": element.innerHeight() / 2,
            "width": element.innerWidth() - 20,
            "height": element.innerHeight() - 20,
            "scale": 1
          }).append(svgContainer).updateStage();
          let previousPinchScale = false;
          element.css("overflow", "auto").attr("tabindex", 1);
          if (mapModel.getInputEnabled()) {
            (dragContainer || element).simpleDraggableContainer();
          }
          if (!touchEnabled) {
            element.scrollWhenDragging(mapModel.getInputEnabled);
            element.on("mm:start-dragging-shadow", function(e) {
              if (e.target !== element[0]) {
                element.css("overflow", "hidden");
              }
            });
            $(document).on("mouseup", function() {
              if (element.css("overflow") !== "auto") {
                element.css("overflow", "auto");
              }
            });
          } else {
            element.on("doubletap", function(event) {
              if (mapModel.requestContextMenu(event.gesture.center.pageX, event.gesture.center.pageY)) {
                event.preventDefault();
                event.gesture.preventDefault();
                return false;
              }
            }).on("pinch", function(event) {
              let scale;
              if (!event || !event.gesture || !event.gesture.scale) {
                return;
              }
              event.preventDefault();
              event.gesture.preventDefault();
              scale = event.gesture.scale;
              if (previousPinchScale) {
                scale = scale / previousPinchScale;
              }
              if (Math.abs(scale - 1) < 0.05) {
                return;
              }
              previousPinchScale = event.gesture.scale;
              mapModel.scale("touch", scale, {
                x: event.gesture.center.pageX - stage.data("offsetX"),
                y: event.gesture.center.pageY - stage.data("offsetY")
              });
            }).on("gestureend", function() {
              previousPinchScale = false;
            });
          }
          _.each(hotkeyEventHandlers, function(mappedFunction, keysPressed) {
            element.keydown(keysPressed, function(event) {
              if (actOnKeys) {
                event.stopImmediatePropagation();
                event.preventDefault();
                mapModel[mappedFunction]("keyboard");
              }
            });
          });
          if (!touchEnabled) {
            $(window).on("resize", function() {
              mapModel.resetView();
            });
          }
          $(window).on("orientationchange", function() {
            if (centerSelectedNodeOnOrientationChange) {
              mapModel.centerOnNode(mapModel.getSelectedNodeId());
            } else {
              mapModel.resetView();
            }
          });
          $(document).on("keydown", function(e) {
            const functions = {
              "U+003D": "scaleUp",
              "U+002D": "scaleDown",
              61: "scaleUp",
              173: "scaleDown"
            };
            let mappedFunction;
            if (e && !e.altKey && (e.ctrlKey || e.metaKey)) {
              if (e.originalEvent && e.originalEvent.keyIdentifier) {
                mappedFunction = functions[e.originalEvent.keyIdentifier];
              } else if (e.key === "MozPrintableKey") {
                mappedFunction = functions[e.which];
              }
              if (mappedFunction) {
                if (actOnKeys) {
                  e.preventDefault();
                  mapModel[mappedFunction]("keyboard");
                }
              }
            }
          }).on("wheel mousewheel", function(e) {
            const scroll = e.originalEvent.deltaX || -1 * e.originalEvent.wheelDeltaX;
            if (scroll < 0 && element.scrollLeft() === 0) {
              e.preventDefault();
            }
            if (scroll > 0 && element[0].scrollWidth - element.width() - element.scrollLeft() === 0) {
              e.preventDefault();
            }
          });
          element.on("keypress", function(evt) {
            if (!actOnKeys) {
              return;
            }
            if (/INPUT|TEXTAREA/.test(evt && evt.target && evt.target.tagName)) {
              return;
            }
            const unicode = evt.charCode || evt.keyCode, actualkey = String.fromCharCode(unicode), mappedFunction = charEventHandlers[actualkey];
            if (mappedFunction) {
              evt.preventDefault();
              mapModel[mappedFunction]("keyboard");
            } else if (Number(actualkey) <= 9 && Number(actualkey) >= 1 || actualkey === "0") {
              evt.preventDefault();
              mapModel.activateLevel("keyboard", Number(actualkey) + 1);
            }
          });
        });
      };
    }
  });

  // vendor/mapjs/src/browser/link-edit-widget.js
  var require_link_edit_widget = __commonJS({
    "vendor/mapjs/src/browser/link-edit-widget.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.linkEditWidget = function(mapModel) {
        "use strict";
        return this.each(function() {
          const element = jQuery3(this), colorElement = element.find(".color"), lineStyleElement = element.find(".lineStyle"), arrowElement = element.find(".arrow");
          let currentLink, width, height;
          mapModel.addEventListener("linkSelected", function(link, selectionPoint, linkStyle) {
            currentLink = link;
            element.show();
            width = width || element.width();
            height = height || element.height();
            element.css({
              top: selectionPoint.y - 0.5 * height - 15 + "px",
              left: selectionPoint.x - 0.5 * width - 15 + "px"
            });
            colorElement.val(linkStyle.color).change();
            lineStyleElement.val(linkStyle.lineStyle);
            arrowElement[linkStyle.arrow ? "addClass" : "removeClass"]("active");
          });
          mapModel.addEventListener("mapMoveRequested", function() {
            element.hide();
          });
          element.find(".delete").click(function() {
            mapModel.removeLink("mouse", currentLink.ideaIdFrom, currentLink.ideaIdTo);
            element.hide();
          });
          colorElement.change(function() {
            mapModel.updateLinkStyle("mouse", currentLink.ideaIdFrom, currentLink.ideaIdTo, "color", jQuery3(this).val());
          });
          lineStyleElement.find("a").click(function() {
            mapModel.updateLinkStyle("mouse", currentLink.ideaIdFrom, currentLink.ideaIdTo, "lineStyle", jQuery3(this).text());
          });
          arrowElement.click(function() {
            mapModel.updateLinkStyle("mouse", currentLink.ideaIdFrom, currentLink.ideaIdTo, "arrow", !arrowElement.hasClass("active"));
          });
          element.mouseleave(element.hide.bind(element));
        });
      };
    }
  });

  // vendor/mapjs/src/core/layout/node-to-box.js
  var require_node_to_box = __commonJS({
    "vendor/mapjs/src/core/layout/node-to-box.js"(exports, module) {
      module.exports = function nodeToBox(node) {
        "use strict";
        if (!node) {
          return false;
        }
        return {
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          level: node.level,
          styles: node.styles || ["default"]
        };
      };
    }
  });

  // vendor/mapjs/src/core/layout/layout-model.js
  var require_layout_model = __commonJS({
    "vendor/mapjs/src/core/layout/layout-model.js"(exports, module) {
      var _ = require_underscore_umd();
      var nodeToBox = require_node_to_box();
      module.exports = function LayoutModel(emptyLayout) {
        "use strict";
        let layout;
        const self2 = this, options = {
          coneRatio: 0.5,
          majorAxisRatio: 3
        }, getNodesForPredicate = function(predicate) {
          const nodes = layout && _.values(layout.nodes), filtered = nodes && _.filter(nodes, predicate);
          return nodes && filtered.length && filtered;
        }, getNodesDown = function(referenceNode, coneRatio) {
          const predicate = function(node) {
            const dy = node.y + node.height - (referenceNode.y + referenceNode.height), x1 = referenceNode.x - Math.abs(dy * coneRatio), x2 = referenceNode.x + referenceNode.width + Math.abs(dy * coneRatio);
            if (node.id === referenceNode.id || node.y <= Math.round(referenceNode.y + referenceNode.height * 0.5)) {
              return false;
            }
            if (coneRatio !== void 0 && (node.x > x2 || node.x + node.width < x1)) {
              return false;
            }
            return true;
          };
          return getNodesForPredicate(predicate);
        }, getNodesRight = function(referenceNode, coneRatio) {
          const predicate = function(node) {
            const dx = node.x + node.width - (referenceNode.x + referenceNode.width), y1 = referenceNode.y - Math.abs(dx * coneRatio), y2 = referenceNode.y + referenceNode.height + Math.abs(dx * coneRatio);
            if (node.id === referenceNode.id || node.x <= Math.round(referenceNode.x + referenceNode.width * 0.5)) {
              return false;
            }
            if (coneRatio !== void 0 && (node.y > y2 || node.y + node.height < y1)) {
              return false;
            }
            return true;
          };
          return getNodesForPredicate(predicate);
        }, getNodesUp = function(referenceNode, coneRatio) {
          const predicate = function(node) {
            const dy = node.y - referenceNode.y, x1 = referenceNode.x - Math.abs(dy * coneRatio), x2 = referenceNode.x + referenceNode.width + Math.abs(dy * coneRatio);
            if (node.id === referenceNode.id || node.y + node.height >= Math.round(referenceNode.y + referenceNode.height * 0.5)) {
              return false;
            }
            if (coneRatio !== void 0 && (node.x > x2 || node.x + node.width < x1)) {
              return false;
            }
            return true;
          };
          return getNodesForPredicate(predicate);
        }, getNodesLeft = function(referenceNode, coneRatio) {
          const predicate = function(node) {
            const dx = node.x - referenceNode.x, y1 = referenceNode.y - Math.abs(dx * coneRatio), y2 = referenceNode.y + referenceNode.height + Math.abs(dx * coneRatio);
            if (node.id === referenceNode.id || node.x + node.width >= Math.round(referenceNode.x + referenceNode.width * 0.5)) {
              return false;
            }
            if (coneRatio !== void 0 && (node.y > y2 || node.y + node.height < y1)) {
              return false;
            }
            return true;
          };
          return getNodesForPredicate(predicate);
        }, getNearest = function(referenceNode, nodes, xRatio, yRatio) {
          const referenceNodeCenter = {
            x: Math.round(referenceNode.x + referenceNode.width * 0.5),
            y: Math.round(referenceNode.y + referenceNode.height * 0.5)
          }, calculateDistance = function(point1, point2) {
            const dx = xRatio * (point1.x - point2.x), dy = yRatio * (point1.y - point2.y);
            return Math.pow(dx, 2) + Math.pow(dy, 2);
          };
          if (!nodes) {
            return false;
          }
          if (nodes.length === 1) {
            return nodes[0];
          }
          return _.min(nodes, function(node) {
            const d = [
              calculateDistance(node, referenceNodeCenter),
              calculateDistance({ x: node.x + node.width, y: node.y + node.height }, referenceNodeCenter),
              calculateDistance({ x: node.x + node.width, y: node.y }, referenceNodeCenter),
              calculateDistance({ x: node.x, y: node.y + node.height }, referenceNodeCenter),
              calculateDistance({ x: Math.round(node.x + node.width * 0.5), y: Math.round(node.y + node.height * 0.5) }, referenceNodeCenter)
            ];
            return _.min(d);
          });
        }, getPreferred = (referenceNode, nodes, xRatio, yRatio) => {
          if (self2.getOrientation() === "standard") {
            const siblings = nodes.filter((node) => referenceNode.parentId && referenceNode.parentId === node.parentId);
            if (siblings.length) {
              return _.min(siblings, (node) => Math.abs(node.y - referenceNode.y));
            }
          }
          return getNearest(referenceNode, nodes, xRatio, yRatio);
        };
        self2.getNode = function(nodeId) {
          return layout && layout.nodes && layout.nodes[nodeId];
        };
        self2.isRootNode = function(nodeId) {
          return layout && layout.nodes && layout.nodes[nodeId] && layout.nodes[nodeId].level === 1;
        };
        self2.getNodeBox = function(nodeId) {
          return nodeToBox(self2.getNode(nodeId));
        };
        self2.setLayout = function(newLayout) {
          layout = newLayout || emptyLayout;
        };
        self2.getLayout = function() {
          return layout || emptyLayout;
        };
        self2.nodeIdLeft = function(nodeId) {
          const referenceNode = self2.getNode(nodeId), nodes = referenceNode && (getNodesLeft(referenceNode, options.coneRatio) || getNodesLeft(referenceNode)), node = nodes && getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
          return node && node.id;
        };
        self2.nodeIdRight = function(nodeId) {
          const referenceNode = self2.getNode(nodeId), nodes = referenceNode && (getNodesRight(referenceNode, options.coneRatio) || getNodesRight(referenceNode)), node = nodes && getNearest(referenceNode, nodes, 1, options.majorAxisRatio);
          return node && node.id;
        };
        self2.nodeIdUp = function(nodeId) {
          const referenceNode = self2.getNode(nodeId), nodes = referenceNode && (getNodesUp(referenceNode, options.coneRatio) || getNodesUp(referenceNode)), node = nodes && getPreferred(referenceNode, nodes, options.majorAxisRatio, 1);
          return node && node.id;
        };
        self2.nodeIdDown = function(nodeId) {
          const referenceNode = self2.getNode(nodeId), nodes = referenceNode && (getNodesDown(referenceNode, options.coneRatio) || getNodesDown(referenceNode)), node = nodes && getPreferred(referenceNode, nodes, options.majorAxisRatio, 1);
          return node && node.id;
        };
        self2.getOrientation = function() {
          return layout && layout.orientation || "standard";
        };
        self2.layoutBounds = function() {
          let minx, miny, maxx, maxy;
          if (_.isEmpty(layout.nodes)) {
            return false;
          }
          _.each(layout.nodes, function(node) {
            if (!minx) {
              minx = node.x;
              miny = node.y;
              maxx = node.x + node.width;
              maxy = node.y + node.height;
            } else {
              minx = Math.min(node.x, minx);
              miny = Math.min(node.y, miny);
              maxx = Math.max(node.x + node.width, maxx);
              maxy = Math.max(node.y + node.height, maxy);
            }
          });
          return { minX: minx, minY: miny, maxX: maxx, maxY: maxy, width: maxx - minx, height: maxy - miny };
        };
        self2.clipRectTransform = function(centerNodeId, options2) {
          let scale = options2 && options2.scale || 1;
          const centerNode = self2.getNode(centerNodeId), bounds = self2.layoutBounds(), padding = options2 && options2.padding || 0, imgCenter = {
            x: centerNode.x + centerNode.width / 2,
            y: centerNode.y + centerNode.height / 2
          };
          if (options2 && options2.clipRect) {
            return {
              x: options2.clipRect.width / 2 - imgCenter.x,
              y: options2.clipRect.height / 2 - imgCenter.y,
              width: options2.clipRect.width,
              height: options2.clipRect.height,
              scale
            };
          } else if (options2 && options2.page) {
            scale = Math.min((options2.page.width - 2 * padding) / bounds.width, (options2.page.height - 2 * padding) / bounds.height);
            return {
              x: -1 * bounds.minX + Math.floor(0.5 * (options2.page.width / scale - bounds.width)),
              // in scaled coordinates
              y: -1 * bounds.minY + Math.floor(0.5 * (options2.page.height / scale - bounds.height)),
              // in scaled coordinates
              width: options2.page.width,
              height: options2.page.height,
              scale
            };
          } else {
            return {
              x: -1 * bounds.minX + Math.floor(padding / scale),
              // in scaled coordinates
              y: -1 * bounds.minY + Math.floor(padding / scale),
              // in scaled coordinates
              width: bounds.width * scale + 2 * padding,
              height: bounds.height * scale + 2 * padding,
              scale
            };
          }
        };
      };
    }
  });

  // vendor/mapjs/src/core/util/observable.js
  var require_observable = __commonJS({
    "vendor/mapjs/src/core/util/observable.js"(exports, module) {
      module.exports = function observable(base) {
        "use strict";
        let listeners = [];
        base.addEventListener = function(types, listener, priority) {
          types.split(" ").forEach(function(type) {
            if (type) {
              listeners.push({
                type,
                listener,
                priority: priority || 0
              });
            }
          });
        };
        base.listeners = function(type) {
          return listeners.filter(function(listenerDetails) {
            return listenerDetails.type === type;
          }).map(function(listenerDetails) {
            return listenerDetails.listener;
          });
        };
        base.removeEventListener = function(type, listener) {
          listeners = listeners.filter(function(details) {
            return details.listener !== listener;
          });
        };
        base.dispatchEvent = function(type) {
          const args = Array.prototype.slice.call(arguments, 1);
          listeners.filter(function(listenerDetails) {
            return listenerDetails.type === type;
          }).sort(function(firstListenerDetails, secondListenerDetails) {
            return secondListenerDetails.priority - firstListenerDetails.priority;
          }).some(function(listenerDetails) {
            try {
              return listenerDetails.listener.apply(void 0, args) === false;
            } catch (e) {
              console.trace("dispatchEvent failed", e, listenerDetails);
            }
          });
        };
        return base;
      };
    }
  });

  // vendor/mapjs/src/core/content/calc-idea-level.js
  var require_calc_idea_level = __commonJS({
    "vendor/mapjs/src/core/content/calc-idea-level.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function calcIdeaLevel(contentIdea, nodeId, currentLevel) {
        "use strict";
        if (!contentIdea) {
          throw "invalid-args";
        }
        if (contentIdea.id == nodeId) {
          return currentLevel || 0;
        }
        if (!nodeId) {
          return;
        }
        currentLevel = currentLevel || 1;
        const directChild = _.find(contentIdea.ideas, function(idea) {
          return idea.id == nodeId;
        });
        if (directChild) {
          return currentLevel;
        }
        return _.reduce(contentIdea.ideas, function(result, idea) {
          return result || calcIdeaLevel(idea, nodeId, currentLevel + 1);
        }, void 0);
      };
    }
  });

  // vendor/mapjs/src/core/content/sorted-sub-ideas.js
  var require_sorted_sub_ideas = __commonJS({
    "vendor/mapjs/src/core/content/sorted-sub-ideas.js"(exports, module) {
      var positive = function positive2(key) {
        "use strict";
        return key >= 0;
      };
      var negative = function negative2(key) {
        "use strict";
        return !positive(key);
      };
      var absCompare = function(a, b) {
        "use strict";
        return Math.abs(a) - Math.abs(b);
      };
      var safeSort = function(contentIdea) {
        "use strict";
        const childKeys = Object.keys(contentIdea.ideas).map(parseFloat), sortedChildKeys = childKeys.filter(positive).sort(absCompare).concat(childKeys.filter(negative).sort(absCompare));
        return sortedChildKeys.map(function(key) {
          return contentIdea.ideas[key];
        });
      };
      module.exports = function sortedSubIdeas(contentIdea) {
        "use strict";
        if (!contentIdea.ideas) {
          return [];
        }
        return safeSort(contentIdea);
      };
    }
  });

  // vendor/mapjs/src/core/content/traverse.js
  var require_traverse = __commonJS({
    "vendor/mapjs/src/core/content/traverse.js"(exports, module) {
      var sortedSubIdeas = require_sorted_sub_ideas();
      module.exports = function traverse(contentIdea, iterator, postOrder, level) {
        "use strict";
        const isSingleRootMap = !level && (!contentIdea.formatVersion || contentIdea.formatVersion < 3);
        level = level || (isSingleRootMap ? 1 : 0);
        if (!postOrder && (isSingleRootMap || level)) {
          iterator(contentIdea, level);
        }
        sortedSubIdeas(contentIdea).forEach(function(subIdea) {
          traverse(subIdea, iterator, postOrder, level + 1);
        });
        if (postOrder && (isSingleRootMap || level)) {
          iterator(contentIdea, level);
        }
      };
    }
  });

  // vendor/mapjs/src/core/content/auto-themed-idea-utils.js
  var require_auto_themed_idea_utils = __commonJS({
    "vendor/mapjs/src/core/content/auto-themed-idea-utils.js"(exports, module) {
      var calcIdeaLevel = require_calc_idea_level();
      var _ = require_underscore_umd();
      var traverse = require_traverse();
      var addSubIdea = (activeContent, themeObj, parentId, ideaTitle, optionalNewId, optionalIdeaAttr) => {
        "use strict";
        if (!themeObj) {
          return activeContent.addSubIdea(parentId, ideaTitle, optionalNewId, optionalIdeaAttr);
        }
        const parentLevel = calcIdeaLevel(activeContent, parentId), parentIdea = parentId && activeContent.findSubIdeaById(parentId), numberOfSiblings = parentIdea && parentIdea.ideas && Object.keys(parentIdea.ideas).length || 0, attrs = themeObj.getPersistedAttributes(optionalIdeaAttr, parentLevel + 1, numberOfSiblings).attr, attrsToSave = !_.isEmpty(attrs) && attrs || void 0;
        return activeContent.addSubIdea(parentId, ideaTitle, optionalNewId, attrsToSave);
      };
      var recalcAutoNodeAttrs = (activeContent, themeObj, idea, level, numberOfSiblings) => {
        "use strict";
        const updatedAttr = idea && themeObj.getPersistedAttributes(idea.attr, level, numberOfSiblings) || {};
        updatedAttr.removed.forEach((key) => activeContent.updateAttr(idea.id, key, false));
        Object.keys(updatedAttr.attr).forEach((key) => {
          activeContent.updateAttr(idea.id, key, updatedAttr.attr[key]);
        });
      };
      var recalcIdeasAutoNodeAttrs = (activeContent, themeObj, idea, level, numberOfSiblings) => {
        "use strict";
        if (level > 0) {
          recalcAutoNodeAttrs(activeContent, themeObj, idea, level, numberOfSiblings);
        }
        if (idea.ideas) {
          let siblingIndex = 0;
          Object.keys(idea.ideas).forEach((childIdeaKey) => {
            recalcIdeasAutoNodeAttrs(activeContent, themeObj, idea.ideas[childIdeaKey], level + 1, siblingIndex);
            siblingIndex += 1;
          });
        }
      };
      var changeParent = (activeContent, themeObj, ideaId, newParentId) => {
        "use strict";
        if (!themeObj) {
          return activeContent.changeParent(ideaId, newParentId);
        }
        let result;
        const newParent = activeContent.findSubIdeaById(newParentId), numberOfSiblings = newParent && newParent.ideas && Object.keys(newParent.ideas).length || 0, parentLevel = calcIdeaLevel(activeContent, newParentId);
        activeContent.batch(() => {
          activeContent.changeParent(ideaId, newParentId);
          const idea = activeContent.findSubIdeaById(ideaId);
          recalcAutoNodeAttrs(activeContent, themeObj, idea, parentLevel + 1, numberOfSiblings);
          let childSiblings = 0;
          if (idea.ideas) {
            Object.keys(idea.ideas).forEach((childIdeaKey) => {
              recalcAutoNodeAttrs(activeContent, themeObj, idea.ideas[childIdeaKey], parentLevel + 2, childSiblings);
              childSiblings += 1;
            });
          }
        });
        return result;
      };
      var pasteMultiple = (activeContent, themeObj, parentId, contents) => {
        "use strict";
        if (!themeObj) {
          return activeContent.pasteMultiple(parentId, contents);
        }
        const level = calcIdeaLevel(activeContent, parentId), parent = parentId && activeContent.findSubIdeaById(parentId) || activeContent, existingSiblings = parent.ideas && Object.keys(parent.ideas).length || 0;
        contents.forEach((idea) => {
          traverse(idea, (subIdea) => themeObj.cleanPersistedAttributes(subIdea.attr));
        });
        let pastedIds = false, siblings = existingSiblings;
        activeContent.batch(() => {
          pastedIds = activeContent.pasteMultiple(parentId, contents);
          if (pastedIds && pastedIds.length) {
            pastedIds.forEach((pastedId) => {
              const idea = activeContent.findSubIdeaById(pastedId);
              recalcIdeasAutoNodeAttrs(activeContent, themeObj, idea, level + 1, siblings);
              siblings += 1;
            });
          }
          return pastedIds;
        });
        return pastedIds;
      };
      var insertIntermediateMultiple = (activeContent, themeObj, inFrontOfIdeaIds, ideaOptions) => {
        "use strict";
        if (!themeObj) {
          return activeContent.insertIntermediateMultiple(inFrontOfIdeaIds, ideaOptions);
        }
        const ideaOptionsSafe = _.extend({}, ideaOptions), inFrontOfIdeaId = themeObj && inFrontOfIdeaIds && inFrontOfIdeaIds[0], inFrontOfIdea = inFrontOfIdeaId && activeContent.findSubIdeaById(inFrontOfIdeaId), level = inFrontOfIdeaId && calcIdeaLevel(activeContent, inFrontOfIdeaId), insertAttr = inFrontOfIdea && inFrontOfIdea.attr || {}, siblingIds = activeContent.sameSideSiblingIds(inFrontOfIdeaId), numberOfSiblings = siblingIds && siblingIds.length || 0, attrs = themeObj.getPersistedAttributes(insertAttr, level, numberOfSiblings).attr;
        ideaOptionsSafe.attr = _.extend({}, ideaOptionsSafe.attr, attrs);
        let result;
        activeContent.batch(() => {
          result = activeContent.insertIntermediateMultiple(inFrontOfIdeaIds, ideaOptionsSafe);
          let siblings = 0;
          inFrontOfIdeaIds.forEach((movedIdeaId) => {
            const movedIdea = activeContent.findSubIdeaById(movedIdeaId);
            recalcAutoNodeAttrs(activeContent, themeObj, movedIdea, level + 1, siblings);
            siblings += 1;
          });
        });
        return result;
      };
      module.exports = {
        addSubIdea,
        changeParent,
        insertIntermediateMultiple,
        pasteMultiple,
        recalcIdeasAutoNodeAttrs
      };
    }
  });

  // vendor/mapjs/src/core/map-model.js
  var require_map_model = __commonJS({
    "vendor/mapjs/src/core/map-model.js"(exports, module) {
      var _ = require_underscore_umd();
      var LayoutModel = require_layout_model();
      var observable = require_observable();
      module.exports = function MapModel(selectAllTitles, defaultReorderMargin, optional) {
        "use strict";
        let idea, currentLabelGenerator, isInputEnabled = true, isEditingEnabled = true, revertSelectionForUndo, revertActivatedForUndo, themeSource = false, paused = false, activatedNodes = [], layoutCalculator, currentlySelectedIdeaId;
        const self2 = this, autoThemedIdeaUtils = optional && optional.autoThemedIdeaUtils || require_auto_themed_idea_utils(), reorderMargin = optional && optional.reorderMargin || 20, layoutModel = optional && optional.layoutModel || new LayoutModel({ nodes: {}, connectors: {} }), setRootNodePositionsForPrecalculatedLayout = function(contextNode, specificLayout) {
          const rootIdeas = Object.keys(idea.ideas).map((rank) => idea.ideas[rank]), layout = specificLayout || layoutCalculator(idea, contextNode);
          rootIdeas.forEach((rootIdea) => {
            const existingPosition = rootIdea.attr && rootIdea.attr.position, rootNodeInLayout = layout.nodes && layout.nodes[rootIdea.id], shouldUpdatePosition = rootNodeInLayout && (!existingPosition || existingPosition[0] !== rootNodeInLayout.x || existingPosition[1] !== rootNodeInLayout.y);
            if (shouldUpdatePosition) {
              idea.updateAttr(rootIdea.id, "position", [rootNodeInLayout.x, rootNodeInLayout.y, 1]);
            }
          });
        }, addSubIdea = (parentId, ideaTitle, optionalNewId, optionalIdeaAttr) => {
          const themeObj = themeSource && themeSource();
          return autoThemedIdeaUtils.addSubIdea(idea, themeObj, parentId, ideaTitle, optionalNewId, optionalIdeaAttr);
        }, insertIntermediateMultiple = (inFrontOfIdeaIds, ideaOptions) => {
          const themeObj = themeSource && themeSource();
          return autoThemedIdeaUtils.insertIntermediateMultiple(idea, themeObj, inFrontOfIdeaIds, ideaOptions);
        }, changeParent = (ideaId, newParentId) => {
          const themeObj = themeSource && themeSource();
          return autoThemedIdeaUtils.changeParent(idea, themeObj, ideaId, newParentId);
        }, setActiveNodes = function(activated) {
          const wasActivated = _.clone(activatedNodes);
          if (activated.length === 0) {
            activatedNodes = [currentlySelectedIdeaId];
          } else {
            activatedNodes = activated;
          }
          self2.dispatchEvent("activatedNodesChanged", _.difference(activatedNodes, wasActivated), _.difference(wasActivated, activatedNodes));
        }, applyLabels = function(newLayout) {
          const labelMap = currentLabelGenerator && currentLabelGenerator(idea);
          if (!labelMap) {
            return;
          }
          _.each(newLayout.nodes, function(node, id) {
            if (labelMap[id] || labelMap[id] === 0) {
              node.label = labelMap[id];
            }
          });
        }, closestNodeId = function(nodeList, referenceNode) {
          const closestNode = _.min(nodeList, function(node) {
            return Math.pow(node.x + node.width / 2 - referenceNode.x - referenceNode.width / 2, 2) + Math.pow(node.y + node.height / 2 - referenceNode.y - referenceNode.height / 2, 2);
          });
          return closestNode && closestNode.id;
        }, updateCurrentLayout = function(newLayout, sessionId, themeChanged) {
          let layoutCompleteOptions;
          const currentLayout = layoutModel.getLayout(), nodePositionsChanged = (oldNode, newNode) => {
            if (!oldNode || !newNode) {
              return false;
            }
            return newNode.x !== oldNode.x || newNode.y !== oldNode.y;
          }, connectorNodeMoved = (oldConnector, newConnector) => {
            if (!oldConnector || !newConnector || oldConnector.from !== newConnector.from || oldConnector.to !== newConnector.to) {
              return false;
            }
            const oldFromNode = currentLayout.nodes[oldConnector.from], oldToNode = currentLayout.nodes[oldConnector.to], newFromNode = newLayout.nodes[newConnector.from], newToNode = newLayout.nodes[newConnector.to];
            return nodePositionsChanged(oldFromNode, newFromNode) || nodePositionsChanged(oldToNode, newToNode);
          };
          self2.dispatchEvent("layoutChangeStarting", _.size(newLayout.nodes) - _.size(currentLayout.nodes));
          applyLabels(newLayout);
          _.each(currentLayout.connectors, function(oldConnector, connectorId) {
            const newConnector = newLayout.connectors && newLayout.connectors[connectorId];
            if (!newConnector || newConnector.from !== oldConnector.from || newConnector.to !== oldConnector.to) {
              self2.dispatchEvent("connectorRemoved", oldConnector);
            }
          });
          _.each(currentLayout.links, function(oldLink, linkId) {
            const newLink = newLayout.links && newLayout.links[linkId];
            if (!newLink) {
              self2.dispatchEvent("linkRemoved", oldLink);
            }
          });
          _.each(currentLayout.nodes, function(oldNode, nodeId) {
            const newNode = newLayout.nodes[nodeId];
            let newActive;
            if (!newNode) {
              if (nodeId == currentlySelectedIdeaId) {
                self2.selectNode(closestNodeId(newLayout.nodes, oldNode));
              }
              newActive = _.reject(activatedNodes, function(e) {
                return e == nodeId;
              });
              if (newActive.length !== activatedNodes.length) {
                setActiveNodes(newActive);
              }
              self2.dispatchEvent("nodeRemoved", oldNode, nodeId, sessionId);
            }
          });
          _.each(newLayout.nodes, function(newNode, nodeId) {
            const oldNode = currentLayout.nodes[nodeId];
            if (!oldNode) {
              self2.dispatchEvent("nodeCreated", newNode, sessionId);
            } else {
              if (nodePositionsChanged(newNode, oldNode)) {
                self2.dispatchEvent("nodeMoved", newNode, sessionId);
              }
              if (newNode.width !== oldNode.width || newNode.height !== oldNode.height || newNode.level !== oldNode.level || !_.isEqual(newNode.attr || {}, oldNode.attr || {}) || themeChanged) {
                self2.dispatchEvent("nodeAttrChanged", newNode, sessionId);
              }
              if (newNode.title !== oldNode.title) {
                self2.dispatchEvent("nodeTitleChanged", newNode, sessionId);
              }
              if (newNode.label !== oldNode.label) {
                self2.dispatchEvent("nodeLabelChanged", newNode, sessionId);
              }
            }
          });
          _.each(newLayout.connectors, function(newConnector, connectorId) {
            const oldConnector = currentLayout.connectors[connectorId];
            if (oldConnector && !_.isEqual(oldConnector.attr || {}, newConnector.attr || {})) {
              self2.dispatchEvent("connectorAttrChanged", newConnector);
            } else if (connectorNodeMoved(oldConnector, newConnector)) {
              self2.dispatchEvent("connectorMoved", newConnector);
            }
            if (!oldConnector || newConnector.from !== oldConnector.from || newConnector.to !== oldConnector.to) {
              self2.dispatchEvent("connectorCreated", newConnector, sessionId);
            }
          });
          _.each(newLayout.links, function(newLink, linkId) {
            const oldLink = currentLayout.links && currentLayout.links[linkId];
            if (oldLink) {
              if (!_.isEqual(newLink.attr || {}, oldLink && oldLink.attr || {})) {
                self2.dispatchEvent("linkAttrChanged", newLink, sessionId);
              }
            } else {
              self2.dispatchEvent("linkCreated", newLink, sessionId);
            }
          });
          if (themeChanged) {
            layoutCompleteOptions = { themeChanged: true };
          }
          layoutModel.setLayout(newLayout);
          if (!self2.isInCollapse) {
            self2.dispatchEvent("layoutChangeComplete", layoutCompleteOptions);
          }
        }, selectNewIdea = function(newIdeaId) {
          revertSelectionForUndo = currentlySelectedIdeaId;
          revertActivatedForUndo = activatedNodes.slice(0);
          self2.selectNode(newIdeaId);
        }, editNewIdea = function(newIdeaId) {
          selectNewIdea(newIdeaId);
          self2.editNode(false, true, true);
        }, getCurrentlySelectedIdeaId = function() {
          return currentlySelectedIdeaId || idea.getDefaultRootId();
        }, onIdeaChanged = function(action, args, sessionId) {
          if (paused) {
            return;
          }
          revertSelectionForUndo = false;
          revertActivatedForUndo = false;
          self2.rebuildRequired(sessionId);
        }, currentlySelectedIdea = function() {
          return idea.findSubIdeaById(currentlySelectedIdeaId) || idea;
        }, ensureNodeIsExpanded = function(source, nodeId) {
          const node = idea.findSubIdeaById(nodeId) || idea;
          if (node.getAttr("collapsed")) {
            idea.updateAttr(nodeId, "collapsed", false);
          }
        }, addSubIdeaToTargetNode = function(source, targetId, initialTitle) {
          const targetNode = idea.findSubIdeaById(targetId) || idea;
          let newId;
          ensureNodeIsExpanded(source, targetId);
          if (initialTitle) {
            newId = addSubIdea(targetId, initialTitle);
          } else {
            newId = addSubIdea(targetId);
          }
          if (layoutModel.getOrientation() === "top-down") {
            if (targetNode.findChildRankById(newId) < 0) {
              idea.flip(newId);
            }
          }
          return newId;
        }, setNodePositionFromCurrentLayout = function(nodeId) {
          const node = nodeId && layoutModel.getNode(nodeId);
          if (node) {
            idea.updateAttr(nodeId, "position", [node.x, node.y, 1]);
          }
        }, positionNextTo = function(nodeId, relativeNodeId) {
          const relativeNode = relativeNodeId && layoutModel.getNode(relativeNodeId);
          if (relativeNode) {
            idea.updateAttr(nodeId, "position", [relativeNode.x + relativeNode.width + 2 * reorderMargin, relativeNode.y, 1]);
          }
        }, analytic = function(eventName, eventArg) {
          if (eventArg) {
            self2.dispatchEvent("analytic", "mapModel", eventName, eventArg);
          } else {
            self2.dispatchEvent("analytic", "mapModel", eventName);
          }
        };
        observable(this);
        self2.pause = function() {
          paused = true;
        };
        self2.resume = function() {
          paused = false;
          self2.rebuildRequired();
        };
        self2.getIdea = function() {
          return idea;
        };
        self2.isEditingEnabled = function() {
          return isEditingEnabled;
        };
        self2.getCurrentLayout = function() {
          return layoutModel.getLayout();
        };
        self2.analytic = analytic;
        self2.getCurrentlySelectedIdeaId = getCurrentlySelectedIdeaId;
        self2.rebuildRequired = function(sessionId) {
          if (!idea) {
            return;
          }
          const currentLayout = layoutModel.getLayout(), themeHasChanged = currentLayout.theme !== (idea.attr && idea.attr.theme), ideaThemeOverrides = idea.attr && idea.attr.themeOverrides, layoutThemeOverrides = currentLayout && currentLayout.themeOverrides, themeOverridesHaveChanged = !_.isEqual(ideaThemeOverrides || {}, layoutThemeOverrides || {}), themeChanged = themeHasChanged || themeOverridesHaveChanged;
          if (themeChanged) {
            self2.dispatchEvent("themeChanged", idea.attr && idea.attr.theme, idea.attr && idea.attr.themeOverrides);
          }
          updateCurrentLayout(self2.reactivate(layoutCalculator(idea)), sessionId, themeChanged);
        };
        this.setIdea = function(anIdea, tryKeepingContext) {
          const oldSelectedIdea = currentlySelectedIdeaId;
          if (!layoutCalculator) {
            throw new Error("layout calculator not set");
          }
          ;
          if (idea) {
            idea.removeEventListener("changed", onIdeaChanged);
            paused = false;
            setActiveNodes([]);
            self2.dispatchEvent("nodeSelectionChanged", currentlySelectedIdeaId, false);
            currentlySelectedIdeaId = void 0;
          }
          idea = anIdea;
          idea.addEventListener("changed", onIdeaChanged);
          onIdeaChanged();
          if (tryKeepingContext && idea.findSubIdeaById(oldSelectedIdea)) {
            self2.selectNode(oldSelectedIdea, true);
          } else {
            self2.selectNode(idea.getDefaultRootId(), true);
            self2.dispatchEvent("mapViewResetRequested");
          }
        };
        this.setEditingEnabled = function(value) {
          isEditingEnabled = value;
        };
        this.getEditingEnabled = function() {
          return isEditingEnabled;
        };
        this.setInputEnabled = function(value, holdFocus) {
          if (isInputEnabled !== value) {
            isInputEnabled = value;
            self2.dispatchEvent("inputEnabledChanged", value, !!holdFocus);
          }
        };
        this.getInputEnabled = function() {
          return isInputEnabled;
        };
        this.selectNode = function(id, force, appendToActive) {
          if (force || isInputEnabled && (id !== currentlySelectedIdeaId || !self2.isActivated(id))) {
            if (currentlySelectedIdeaId) {
              self2.dispatchEvent("nodeSelectionChanged", currentlySelectedIdeaId, false);
            }
            currentlySelectedIdeaId = id;
            if (appendToActive) {
              self2.activateNode("internal", id);
            } else {
              setActiveNodes([id]);
            }
            self2.dispatchEvent("nodeSelectionChanged", id, true);
          }
        };
        this.clickNode = function(id, event) {
          const button = event && event.button && event.button !== -1;
          if (event && event.altKey) {
            self2.toggleLink("mouse", id);
          } else if (event && event.shiftKey) {
            self2.toggleActivationOnNode("mouse", id);
          } else if (button) {
            this.selectNode(id);
            if (button && button !== -1 && isInputEnabled) {
              self2.dispatchEvent("contextMenuRequested", id, event.layerX, event.layerY);
            }
          } else {
            self2.dispatchEvent("nodeClicked", id, event);
          }
        };
        this.findIdeaById = function(id) {
          if (idea.id == id) {
            return idea;
          }
          return idea.findSubIdeaById(id);
        };
        this.getSelectedStyle = function(prop) {
          return this.getStyleForId(currentlySelectedIdeaId, prop);
        };
        this.getStyleForId = function(id, prop) {
          const node = layoutModel.getNode(id);
          return node && node.attr && node.attr.style && node.attr.style[prop];
        };
        this.toggleCollapse = function(source) {
          const selectedIdea = currentlySelectedIdea();
          let isCollapsed;
          if (self2.isActivated(selectedIdea.id) && _.size(selectedIdea.ideas) > 0) {
            isCollapsed = selectedIdea.getAttr("collapsed");
          } else {
            isCollapsed = self2.everyActivatedIs(function(id) {
              const node = self2.findIdeaById(id);
              if (node && _.size(node.ideas) > 0) {
                return node.getAttr("collapsed");
              }
              return true;
            });
          }
          this.collapse(source, !isCollapsed);
        };
        this.collapse = function(source, doCollapse) {
          const contextNodeId = getCurrentlySelectedIdeaId(), contextNode = function() {
            return layoutModel.getNode(contextNodeId);
          }, moveNodes = function(nodes, deltaX, deltaY) {
            if (deltaX || deltaY) {
              _.each(nodes, function(node) {
                node.x += deltaX;
                node.y += deltaY;
                self2.dispatchEvent("nodeMoved", node, "scroll");
              });
            }
          }, moveConnectors = function(connectors) {
            if (!connectors) {
              return;
            }
            Object.keys(connectors).forEach((key) => self2.dispatchEvent("connectorMoved", connectors[key]));
          }, oldContext = contextNode();
          let newContext = false;
          analytic("collapse:" + doCollapse, source);
          self2.isInCollapse = true;
          if (isInputEnabled) {
            self2.applyToActivated(function(id) {
              const node = self2.findIdeaById(id);
              if (node && (!doCollapse || node.ideas && _.size(node.ideas) > 0)) {
                idea.updateAttr(id, "collapsed", doCollapse);
              }
            });
          }
          newContext = contextNode();
          if (oldContext && newContext) {
            moveNodes(
              layoutModel.getLayout().nodes,
              oldContext.x - newContext.x,
              oldContext.y - newContext.y
            );
            moveConnectors(layoutModel.getLayout().connectors);
          }
          self2.isInCollapse = false;
          self2.dispatchEvent("layoutChangeComplete");
        };
        this.updateStyle = function(source, prop, value) {
          if (!isEditingEnabled) {
            return false;
          }
          if (isInputEnabled) {
            analytic("updateStyle:" + prop, source);
            self2.applyToActivated(function(id) {
              if (self2.getStyleForId(id, prop) != value) {
                idea.mergeAttrProperty(id, "style", prop, value);
              }
            });
          }
        };
        this.updateLinkStyle = function(source, ideaIdFrom, ideaIdTo, prop, value) {
          const merged = _.extend({}, idea.getLinkAttr(ideaIdFrom, ideaIdTo, "style"));
          if (!isEditingEnabled) {
            return false;
          }
          if (isInputEnabled) {
            analytic("updateLinkStyle:" + prop, source);
            merged[prop] = value;
            idea.updateLinkAttr(ideaIdFrom, ideaIdTo, "style", merged);
          }
        };
        this.addSubIdea = function(source, parentId, initialTitle) {
          const target = parentId || currentlySelectedIdeaId;
          let newId;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("addSubIdea", source);
          if (isInputEnabled) {
            idea.batch(function() {
              newId = addSubIdeaToTargetNode(source, target, initialTitle);
              setRootNodePositionsForPrecalculatedLayout(newId);
            });
            if (newId) {
              if (initialTitle) {
                selectNewIdea(newId);
              } else {
                editNewIdea(newId);
              }
            }
          }
        };
        self2.addGroupSubidea = function(source, options) {
          const parentId = options && options.parentId, group = options && options.group || true, target = parentId || currentlySelectedIdeaId;
          let newGroupId, newId;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("addGroupSubidea", source);
          if (isInputEnabled) {
            idea.batch(function() {
              newGroupId = addSubIdeaToTargetNode(source, target, "group");
              if (newGroupId) {
                idea.updateAttr(newGroupId, "contentLocked", true);
                idea.updateAttr(newGroupId, "group", group);
                newId = addSubIdea(newGroupId);
              }
              setRootNodePositionsForPrecalculatedLayout(newId);
            });
            if (newId) {
              editNewIdea(newId);
            }
          }
        };
        this.insertIntermediateGroup = function(source, options) {
          const activeNodes = [], group = options && options.group || true;
          if (!isEditingEnabled) {
            return false;
          }
          if (!isInputEnabled || idea.isRootNode(currentlySelectedIdeaId)) {
            return false;
          }
          analytic("insertIntermediate", source);
          self2.applyToActivated(function(i) {
            activeNodes.push(i);
          });
          insertIntermediateMultiple(activeNodes, { title: "group", attr: { group, contentLocked: true } });
        };
        this.insertIntermediate = function(source) {
          const activeNodes = [];
          let newId = false;
          if (!isEditingEnabled) {
            return false;
          }
          if (!isInputEnabled) {
            return false;
          }
          analytic("insertIntermediate", source);
          self2.applyToActivated(function(i) {
            activeNodes.push(i);
          });
          newId = insertIntermediateMultiple(activeNodes);
          if (newId) {
            editNewIdea(newId);
          }
        };
        this.flip = function(source) {
          const node = layoutModel.getNode(currentlySelectedIdeaId);
          if (!isEditingEnabled) {
            return false;
          }
          analytic("flip", source);
          if (!isInputEnabled || idea.isRootNode(currentlySelectedIdeaId)) {
            return false;
          }
          if (!node || node.level !== 2) {
            return false;
          }
          return idea.flip(currentlySelectedIdeaId);
        };
        this.addSiblingIdeaBefore = function(source) {
          let newId, parent, contextRank, newRank;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("addSiblingIdeaBefore", source);
          if (!isInputEnabled) {
            return false;
          }
          if (idea.isRootNode(currentlySelectedIdeaId)) {
            parent = idea;
          } else {
            parent = idea.findParent(currentlySelectedIdeaId);
          }
          idea.batch(function() {
            if (parent !== idea) {
              ensureNodeIsExpanded(source, parent.id);
            }
            newId = addSubIdea(parent.id);
            if (newId) {
              if (parent === idea) {
                positionNextTo(newId, currentlySelectedIdeaId);
              } else {
                contextRank = parent.findChildRankById(currentlySelectedIdeaId);
                newRank = parent.findChildRankById(newId);
                if (contextRank * newRank < 0) {
                  idea.flip(newId);
                }
                idea.positionBefore(newId, currentlySelectedIdeaId);
              }
              setRootNodePositionsForPrecalculatedLayout(newId);
            }
          });
          if (newId) {
            editNewIdea(newId);
          }
        };
        this.addSiblingIdea = function(source, optionalNodeId, optionalInitialText) {
          let newId, nextId, parent, contextRank, newRank;
          const currentId = optionalNodeId || currentlySelectedIdeaId;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("addSiblingIdea", source);
          if (isInputEnabled) {
            if (idea.isRootNode(currentId)) {
              parent = idea;
            } else {
              parent = idea.findParent(currentId);
            }
            idea.batch(function() {
              if (parent !== idea) {
                ensureNodeIsExpanded(source, parent.id);
              }
              if (optionalInitialText) {
                newId = addSubIdea(parent.id, optionalInitialText);
              } else {
                newId = addSubIdea(parent.id);
              }
              if (newId) {
                if (parent === idea) {
                  positionNextTo(newId, currentlySelectedIdeaId);
                } else {
                  nextId = idea.nextSiblingId(currentId);
                  contextRank = parent.findChildRankById(currentId);
                  newRank = parent.findChildRankById(newId);
                  if (contextRank * newRank < 0) {
                    idea.flip(newId);
                  }
                  if (nextId) {
                    idea.positionBefore(newId, nextId);
                  }
                }
                setRootNodePositionsForPrecalculatedLayout(newId);
              }
            });
            if (newId) {
              if (optionalInitialText) {
                selectNewIdea(newId);
              } else {
                editNewIdea(newId);
              }
            }
          }
        };
        this.removeSubIdea = function(source) {
          let removed;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("removeSubIdea", source);
          if (isInputEnabled) {
            self2.applyToActivated(function(id) {
              removed = idea.removeSubIdea(id);
            });
          }
          return removed;
        };
        this.updateTitle = function(ideaId, title, isNew) {
          idea.batch(() => {
            if (isNew) {
              idea.initialiseTitle(ideaId, title);
            } else {
              idea.updateTitle(ideaId, title);
            }
            setRootNodePositionsForPrecalculatedLayout(ideaId);
          });
        };
        this.editNode = function(source, shouldSelectAll, editingNew) {
          const currentIdea = currentlySelectedIdea(), title = currentIdea.title;
          if (!isEditingEnabled) {
            return false;
          }
          if (source) {
            analytic("editNode", source);
          }
          if (!isInputEnabled) {
            return false;
          }
          if (currentIdea.attr && currentIdea.attr.contentLocked) {
            return false;
          }
          if (_.include(selectAllTitles, title)) {
            shouldSelectAll = true;
          }
          self2.dispatchEvent("nodeEditRequested", currentlySelectedIdeaId, shouldSelectAll, !!editingNew);
        };
        this.editIcon = function(source) {
          if (!isEditingEnabled) {
            return false;
          }
          if (source) {
            analytic("editIcon", source);
          }
          if (!isInputEnabled) {
            return false;
          }
          self2.dispatchEvent("nodeIconEditRequested", currentlySelectedIdeaId);
        };
        this.scaleUp = function(source) {
          self2.scale(source, 1.25);
        };
        this.scaleDown = function(source) {
          self2.scale(source, 0.8);
        };
        this.scale = function(source, scaleMultiplier, zoomPoint) {
          if (isInputEnabled) {
            self2.dispatchEvent("mapScaleChanged", scaleMultiplier, zoomPoint);
            analytic(scaleMultiplier < 1 ? "scaleDown" : "scaleUp", source);
          }
        };
        this.move = function(source, deltaX, deltaY) {
          if (isInputEnabled) {
            self2.dispatchEvent("mapMoveRequested", deltaX, deltaY);
            analytic("move", source);
          }
        };
        this.resetView = function(source) {
          const selectedNode = layoutModel.getNode(currentlySelectedIdeaId), localRoot = selectedNode && selectedNode.rootId || idea && idea.getDefaultRootId();
          if (!localRoot) {
            return;
          }
          if (isInputEnabled) {
            analytic("resetView", source);
            self2.selectNode(localRoot);
            self2.dispatchEvent("mapViewResetRequested");
          }
        };
        this.decorationAction = function(source, nodeId, decorationType) {
          analytic("decorationAction", source);
          self2.dispatchEvent("decorationActionRequested", nodeId, decorationType);
        };
        this.openAttachment = function(source, nodeId) {
          analytic("openAttachment", source);
          nodeId = nodeId || currentlySelectedIdeaId;
          const node = layoutModel.getNode(nodeId), attachment = node && node.attr && node.attr.attachment;
          if (node) {
            self2.dispatchEvent("attachmentOpened", nodeId, attachment);
          }
        };
        this.setAttachment = function(source, nodeId, attachment) {
          const hasAttachment = !!(attachment && (attachment.content || attachment.goldAssetId));
          if (!isEditingEnabled) {
            return false;
          }
          analytic("setAttachment", source);
          idea.updateAttr(nodeId, "attachment", hasAttachment && attachment);
        };
        this.toggleLink = function(source, nodeIdTo) {
          const exists = _.find(idea.links, function(link) {
            return String(link.ideaIdFrom) === String(nodeIdTo) && String(link.ideaIdTo) === String(currentlySelectedIdeaId) || String(link.ideaIdTo) === String(nodeIdTo) && String(link.ideaIdFrom) === String(currentlySelectedIdeaId);
          });
          if (exists) {
            self2.removeLink(source, exists.ideaIdFrom, exists.ideaIdTo);
          } else {
            self2.addLink(source, nodeIdTo);
          }
        };
        this.addLink = function(source, nodeIdTo) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("addLink", source);
          idea.addLink(currentlySelectedIdeaId, nodeIdTo);
        };
        this.selectLink = function(source, link, selectionPoint) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("selectLink", source);
          if (!link) {
            return false;
          }
          self2.dispatchEvent("linkSelected", link, selectionPoint, idea.getLinkAttr(link.ideaIdFrom, link.ideaIdTo, "style"));
        };
        this.selectConnector = function(source, connector, selectionPoint) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("selectConnector", source);
          if (!connector) {
            return false;
          }
          self2.dispatchEvent("connectorSelected", connector, selectionPoint, idea.getAttrById(connector.to, "parentConnector"));
        };
        this.removeLink = function(source, nodeIdFrom, nodeIdTo) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("removeLink", source);
          idea.removeLink(nodeIdFrom, nodeIdTo);
        };
        self2.undo = function(source) {
          const undoSelectionClone = revertSelectionForUndo, undoActivationClone = revertActivatedForUndo;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("undo", source);
          if (isInputEnabled) {
            idea.undo();
            if (undoSelectionClone) {
              self2.selectNode(undoSelectionClone);
            }
            if (undoActivationClone) {
              setActiveNodes(undoActivationClone);
            }
          }
        };
        self2.redo = function(source) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("redo", source);
          if (isInputEnabled) {
            idea.redo();
          }
        };
        self2.moveRelative = function(source, relativeMovement) {
          let options;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("moveRelative", source);
          if (isInputEnabled) {
            if (layoutModel.getOrientation() === "top-down") {
              options = { ignoreRankSide: true };
            }
            idea.moveRelative(currentlySelectedIdeaId, relativeMovement, options);
          }
        };
        self2.contextForNode = function(nodeId) {
          const node = self2.findIdeaById(nodeId), hasChildren = node && node.ideas && _.size(node.ideas) > 0, rootCount = _.size(idea.ideas), hasSiblings = idea.hasSiblings(nodeId), hasPreferredWidth = node && node.attr && node.attr.style && node.attr.style.width, hasPosition = node && node.attr && node.attr.position, isCollapsed = node && node.getAttr("collapsed"), isRoot = idea.isRootNode(nodeId);
          if (node) {
            return {
              hasChildren: !!hasChildren,
              hasSiblings: !!hasSiblings,
              hasPreferredWidth: !!hasPreferredWidth,
              hasPreferredPosition: !!hasPosition,
              notRoot: !isRoot,
              notLastRoot: !isRoot || rootCount > 1,
              canUndo: idea.canUndo() && !revertSelectionForUndo,
              canRedo: idea.canRedo() && !revertSelectionForUndo,
              canCollapse: hasChildren && !isCollapsed,
              canExpand: hasChildren && isCollapsed
            };
          }
        };
        self2.getIcon = function(nodeId) {
          const node = layoutModel.getNode(nodeId || currentlySelectedIdeaId);
          if (!node) {
            return false;
          }
          return node.attr && node.attr.icon;
        };
        self2.setIcon = function(source, url, imgWidth, imgHeight, position, nodeId, metaData) {
          let nodeIdea = false, iconObject;
          if (!isEditingEnabled) {
            return false;
          }
          analytic("setIcon", source);
          nodeId = nodeId || currentlySelectedIdeaId;
          nodeIdea = self2.findIdeaById(nodeId);
          if (!nodeIdea) {
            return false;
          }
          if (url) {
            iconObject = {
              url,
              width: imgWidth,
              height: imgHeight,
              position
            };
            if (metaData) {
              iconObject.metaData = metaData;
            }
            idea.updateAttr(nodeId, "icon", iconObject);
          } else {
            idea.updateAttr(nodeId, "icon", false);
            if (!nodeIdea.title && _.size(nodeIdea.ideas) === 0) {
              idea.removeSubIdea(nodeId);
            }
          }
        };
        self2.insertUp = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.addSiblingIdeaBefore(source);
          } else {
            self2.insertIntermediate(source);
          }
        };
        self2.insertDown = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.addSiblingIdea(source);
          } else {
            self2.addSubIdea(source);
          }
        };
        self2.insertLeft = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.insertIntermediate(source);
          } else {
            self2.addSiblingIdeaBefore(source);
          }
        };
        self2.insertRight = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.addSubIdea(source);
          } else {
            self2.addSiblingIdea(source);
          }
        };
        self2.moveUp = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.moveRelative(source, -1);
          }
        };
        self2.moveDown = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.moveRelative(source, 1);
          }
        };
        self2.moveLeft = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.flip(source);
          } else {
            self2.moveRelative(source, -1);
          }
        };
        self2.moveRight = function(source) {
          if (layoutModel.getOrientation() === "standard") {
            self2.flip(source);
          } else {
            self2.moveRelative(source, 1);
          }
        };
        self2.getSelectedNodeId = function() {
          return getCurrentlySelectedIdeaId();
        };
        self2.centerOnNode = function(nodeId) {
          if (!layoutModel.getNode(nodeId)) {
            idea.startBatch();
            _.each(idea.calculatePath(nodeId), function(parent) {
              idea.updateAttr(parent.id, "collapsed", false);
            });
            idea.endBatch();
          }
          self2.dispatchEvent("nodeFocusRequested", nodeId);
          self2.selectNode(nodeId);
        };
        self2.search = function(query) {
          const result = [];
          query = query.toLocaleLowerCase();
          idea.traverse(function(contentIdea) {
            if (contentIdea.title && contentIdea.title.toLocaleLowerCase().indexOf(query) >= 0) {
              result.push({ id: contentIdea.id, title: contentIdea.title });
            }
          });
          return result;
        };
        (function() {
          const applyToNodeDirection = function(source, analyticTag, method, direction) {
            if (!isInputEnabled) {
              return;
            }
            analytic(analyticTag, source);
            const relId = layoutModel["nodeId" + direction](currentlySelectedIdeaId);
            if (relId) {
              method.apply(self2, [relId]);
            }
          }, applyFuncs = {};
          ["Left", "Right", "Up", "Down"].forEach(function(direction) {
            applyFuncs[direction] = function(source, analyticTag, method) {
              applyToNodeDirection(source, analyticTag, method, direction);
            };
          });
          self2.getActivatedNodeIds = function() {
            return activatedNodes.slice(0);
          };
          self2.activateSiblingNodes = function(source) {
            const parent = idea.findParent(currentlySelectedIdeaId), siblingIds = parent && parent.ideas && _.map(parent.ideas, function(child) {
              return child.id;
            });
            analytic("activateSiblingNodes", source);
            if (!siblingIds) {
              return;
            }
            setActiveNodes(siblingIds);
          };
          self2.activateNodeAndChildren = function(source) {
            const contextId = getCurrentlySelectedIdeaId(), subtree = idea.getSubTreeIds(contextId);
            analytic("activateNodeAndChildren", source);
            subtree.push(contextId);
            setActiveNodes(subtree);
          };
          _.each(["Left", "Right", "Up", "Down"], function(position) {
            self2["activateNode" + position] = function(source) {
              applyFuncs[position](source, "activateNode" + position, function(nodeId) {
                self2.selectNode(nodeId, false, true);
              });
            };
            self2["selectNode" + position] = function(source) {
              applyFuncs[position](source, "selectNode" + position, self2.selectNode);
            };
          });
          self2.toggleActivationOnNode = function(source, nodeId) {
            analytic("toggleActivated", source);
            if (!self2.isActivated(nodeId)) {
              setActiveNodes([nodeId].concat(activatedNodes));
            } else {
              setActiveNodes(_.without(activatedNodes, nodeId));
            }
          };
          self2.activateNode = function(source, nodeId) {
            analytic("activateNode", source);
            if (!self2.isActivated(nodeId)) {
              activatedNodes.push(nodeId);
              self2.dispatchEvent("activatedNodesChanged", [nodeId], []);
            }
          };
          self2.activateChildren = function(source) {
            const context = currentlySelectedIdea();
            analytic("activateChildren", source);
            if (!context || _.isEmpty(context.ideas) || context.getAttr("collapsed")) {
              return;
            }
            setActiveNodes(idea.getSubTreeIds(context.id));
          };
          self2.activateSelectedNode = function(source) {
            analytic("activateSelectedNode", source);
            setActiveNodes([getCurrentlySelectedIdeaId()]);
          };
          self2.isActivated = function(id) {
            return _.find(activatedNodes, function(activeId) {
              return id == activeId;
            });
          };
          self2.applyToActivated = function(toApply) {
            idea.batch(function() {
              _.each(activatedNodes, toApply);
            });
          };
          self2.everyActivatedIs = function(predicate) {
            return _.every(activatedNodes, predicate);
          };
          self2.activateLevel = function(source, level) {
            const toActivate = _.map(
              _.filter(
                layoutModel.getLayout().nodes,
                function(node) {
                  return node.level == level;
                }
              ),
              function(node) {
                return node.id;
              }
            );
            analytic("activateLevel", source);
            if (!_.isEmpty(toActivate)) {
              setActiveNodes(toActivate);
            }
          };
          self2.reactivate = function(layout) {
            _.each(layout.nodes, function(node) {
              if (_.contains(activatedNodes, node.id)) {
                node.activated = true;
              }
            });
            return layout;
          };
        })();
        self2.getNodeIdAtPosition = function(x, y) {
          const isPointOverNode = function(node2) {
            return x >= node2.x && y >= node2.y && x <= node2.x + node2.width && y <= node2.y + node2.height;
          }, node = _.find(layoutModel.getLayout().nodes, isPointOverNode);
          return node && node.id;
        };
        self2.autoPosition = function(nodeId) {
          return idea.updateAttr(nodeId, "position", false);
        };
        self2.standardPositionNodeAt = function(nodeId, x, y, manualPosition) {
          let result = false;
          const rootNode = layoutModel.getNode(layoutModel.getNode(nodeId).rootId), getVerticallyClosestNode = function() {
            let verticallyClosestNode = {
              id: null,
              y: Infinity
            };
            _.each(idea.sameSideSiblingIds(nodeId), function(id) {
              const node = layoutModel.getNode(id);
              if (y < node.y && node.y < verticallyClosestNode.y) {
                verticallyClosestNode = node;
              }
            });
            return verticallyClosestNode;
          }, parentIdea = idea.findParent(nodeId), parentNode = layoutModel.getNode(parentIdea.id), thisNode = layoutModel.getNode(nodeId), nodeBeingDragged = layoutModel.getNode(nodeId), tryFlip = function(rootNode2, nodeBeingDragged2, nodeDragEndX) {
            const flipRightToLeft = rootNode2.x < nodeBeingDragged2.x && nodeDragEndX < rootNode2.x, flipLeftToRight = rootNode2.x > nodeBeingDragged2.x && rootNode2.x < nodeDragEndX;
            if (flipRightToLeft || flipLeftToRight) {
              return idea.flip(nodeId);
            }
            return false;
          }, validReposition = function() {
            return nodeBeingDragged.level <= 2 || (nodeBeingDragged.x - parentNode.x) * (x - parentNode.x) > 0;
          }, getMaxSequence = function() {
            if (_.isEmpty(parentIdea.ideas)) {
              return 0;
            }
            return _.max(_.map(parentIdea.ideas, function(i) {
              return i.id !== nodeId && i.attr && i.attr.position && i.attr.position[2] || 0;
            })) || 0;
          }, manuallyPositionSubNode = function() {
            let xOffset;
            if (x < parentNode.x) {
              xOffset = parentNode.x - x - nodeBeingDragged.width + parentNode.width;
            } else {
              xOffset = x - parentNode.x;
            }
            analytic("nodeManuallyPositioned");
            return idea.updateAttr(
              nodeId,
              "position",
              [xOffset, y - parentNode.y, getMaxSequence() + 1]
            );
          }, manuallyPositionRootNode = function() {
            return idea.updateAttr(
              nodeId,
              "position",
              [x, y, getMaxSequence() + 1]
            );
          };
          idea.startBatch();
          if (thisNode && thisNode.level === 2) {
            result = tryFlip(rootNode, nodeBeingDragged, x);
          }
          if (!manualPosition && validReposition()) {
            self2.autoPosition(nodeId);
          }
          if (nodeBeingDragged.level > 1) {
            result = idea.positionBefore(nodeId, getVerticallyClosestNode().id) || result;
          }
          if (manualPosition && validReposition()) {
            if (nodeBeingDragged.level === 1) {
              result = manuallyPositionRootNode();
            } else {
              result = manuallyPositionSubNode() || result;
            }
          }
          setRootNodePositionsForPrecalculatedLayout(nodeId);
          idea.endBatch();
          return result;
        };
        self2.topDownPositionNodeAt = function(nodeId, x, y, manualPosition) {
          let result, closestNodeToRight, closestNodeToLeft;
          const parentNode = idea.findParent(nodeId), nodeBeingDragged = layoutModel.getNode(nodeId), isRoot = function() {
            return nodeBeingDragged.level < 2;
          }, manuallyPositionRootNode = function() {
            return idea.updateAttr(
              nodeId,
              "position",
              [x, y, 1]
            );
          };
          if (manualPosition) {
            if (isRoot()) {
              return manuallyPositionRootNode();
            } else {
              return idea.batch(function() {
                changeParent(nodeId, "root");
                return manuallyPositionRootNode();
              });
            }
          }
          if (!parentNode) {
            return false;
          }
          _.each(parentNode.ideas, function(sibling) {
            const node = layoutModel.getNode(sibling.id);
            if (sibling.id === nodeId) {
              return;
            }
            if (x < node.x && (!closestNodeToRight || Math.abs(x - node.x) < Math.abs(x - layoutModel.getNode(closestNodeToRight.id).x))) {
              closestNodeToRight = sibling;
            }
            if (x > node.x + node.width && (!closestNodeToLeft || Math.abs(x - node.x) < Math.abs(x - layoutModel.getNode(closestNodeToLeft.id).x))) {
              closestNodeToLeft = sibling;
            }
          });
          idea.batch(function() {
            const useLeftNode = !!(closestNodeToRight && closestNodeToRight.id && idea.findChildRankById(closestNodeToRight.id) < 0), closestNode = useLeftNode ? closestNodeToLeft : closestNodeToRight, shouldFlip = useLeftNode && idea.findChildRankById(nodeId) > 0;
            self2.autoPosition(nodeId);
            if (shouldFlip) {
              idea.flip(nodeId);
            }
            result = idea.positionBefore(nodeId, closestNode && closestNode.id);
          });
          return result;
        };
        self2.positionNodeAt = function(nodeId, x, y, manualPosition) {
          if (layoutModel.getOrientation() === "standard") {
            return self2.standardPositionNodeAt(nodeId, x, y, manualPosition);
          } else {
            return self2.topDownPositionNodeAt(nodeId, x, y, manualPosition);
          }
        };
        self2.dropNode = function(nodeId, dropTargetId, shiftKey) {
          let clone;
          const parentIdea = idea.findParent(nodeId);
          if (dropTargetId === nodeId) {
            return false;
          }
          if (shiftKey) {
            clone = idea.clone(nodeId);
            if (clone) {
              idea.paste(dropTargetId, clone);
            }
            return false;
          }
          if (dropTargetId === parentIdea.id) {
            return self2.autoPosition(nodeId);
          } else {
            return changeParent(nodeId, dropTargetId);
          }
        };
        self2.setLayoutCalculator = function(newCalculator) {
          layoutCalculator = newCalculator;
        };
        self2.setThemeSource = function(newThemeSource) {
          themeSource = newThemeSource;
        };
        self2.dropImage = function(dataUrl, imgWidth, imgHeight, x, y, metaData) {
          const dropOn = function(ideaId, position) {
            const scaleX = Math.min(imgWidth, 300) / imgWidth, scaleY = Math.min(imgHeight, 300) / imgHeight, scale = Math.min(scaleX, scaleY), existing = idea.getAttrById(ideaId, "icon");
            self2.setIcon("drag and drop", dataUrl, Math.round(imgWidth * scale), Math.round(imgHeight * scale), existing && existing.position || position, ideaId, metaData);
          }, addNew = function() {
            idea.startBatch();
            const newId = addSubIdea(currentlySelectedIdeaId);
            dropOn(newId, "center");
            idea.endBatch();
            self2.selectNode(newId);
          }, nodeId = self2.getNodeIdAtPosition(x, y);
          if (nodeId) {
            return dropOn(nodeId, "left");
          }
          addNew();
        };
        self2.setLabelGenerator = function(labelGenerator, labelGeneratorName) {
          currentLabelGenerator = labelGenerator;
          self2.dispatchEvent("labelGeneratorChange", labelGeneratorName, !!labelGenerator);
          self2.rebuildRequired();
        };
        self2.getStandardReorderBoundary = function(nodeId) {
          const node = layoutModel.getNode(nodeId), nonRootStandardReorderBoundary = function(nodeId2) {
            let opposite;
            const boundaries = [], node2 = layoutModel.getNode(nodeId2), rootNode = layoutModel.getNode(node2 && node2.rootId), isRightHalf = function(node3, rootNode2) {
              return node3 && rootNode2 && node3.x >= rootNode2.x;
            }, parentIdea = idea.findParent(nodeId2), parentNode = layoutModel.getNode(parentIdea.id), primaryEdge = isRightHalf(node2, rootNode) ? "left" : "right", secondaryEdge = isRightHalf(node2, rootNode) ? "right" : "left", siblingBoundary = function(siblings, side) {
              const tops = _.map(siblings, function(node3) {
                return node3.y;
              }), bottoms = _.map(siblings, function(node3) {
                return node3.y + node3.height;
              }), result = {
                "minY": _.min(tops) - reorderMargin - node2.height,
                "maxY": _.max(bottoms) + reorderMargin,
                "margin": reorderMargin
              };
              result.edge = side;
              if (side === "left") {
                result.x = parentNode.x + parentNode.width + reorderMargin;
              } else {
                result.x = parentNode.x - reorderMargin;
              }
              return result;
            }, parentBoundary = function(side) {
              const result = {
                "minY": parentNode.y - reorderMargin - node2.height,
                "maxY": parentNode.y + parentNode.height + reorderMargin,
                "margin": reorderMargin
              };
              result.edge = side;
              if (side === "left") {
                result.x = parentNode.x + parentNode.width + reorderMargin;
              } else {
                result.x = parentNode.x - reorderMargin;
              }
              return result;
            }, sameSide = _.map(idea.sameSideSiblingIds(nodeId2), function(id) {
              return layoutModel.getNode(id);
            }), otherSideSiblings = function() {
              let otherSide = _.map(parentIdea.ideas, function(subIdea) {
                return layoutModel.getNode(subIdea.id);
              });
              otherSide = _.without(otherSide, node2);
              if (!_.isEmpty(sameSide)) {
                otherSide = _.difference(otherSide, sameSide);
              }
              return otherSide;
            };
            if (!_.isEmpty(sameSide)) {
              boundaries.push(siblingBoundary(sameSide, primaryEdge));
            }
            boundaries.push(parentBoundary(primaryEdge));
            if (node2.level === 2) {
              opposite = otherSideSiblings();
              if (!_.isEmpty(opposite)) {
                boundaries.push(siblingBoundary(opposite, secondaryEdge));
              }
              boundaries.push(parentBoundary(secondaryEdge));
            }
            return boundaries;
          };
          if (node.level === 1) {
            return false;
          }
          return nonRootStandardReorderBoundary(nodeId);
        };
        self2.getTopDownReorderBoundary = function(nodeId) {
          const node = layoutModel.getNode(nodeId), parentNode = idea.findParent(nodeId), tolerance = 10;
          let minX = Infinity, maxX = -Infinity, maxY = -Infinity, hasSiblings = false;
          if (!parentNode) {
            return [];
          }
          _.each(parentNode.ideas, function(subIdea) {
            const siblingNode = layoutModel.getNode(subIdea.id);
            if (siblingNode && subIdea.id !== nodeId) {
              hasSiblings = true;
              minX = Math.min(siblingNode.x, minX);
              maxX = Math.max(siblingNode.x + siblingNode.width, maxX);
              maxY = Math.max(siblingNode.y + siblingNode.height, maxY);
            }
          });
          if (!hasSiblings) {
            return [];
          }
          return [{
            minY: node.y - node.height - tolerance,
            maxY: maxY + tolerance,
            minX: minX - node.width - tolerance,
            maxX: maxX + tolerance,
            edge: "top"
          }];
        };
        self2.getReorderBoundary = function(nodeId) {
          if (layoutModel.getOrientation() === "standard") {
            return self2.getStandardReorderBoundary(nodeId);
          } else {
            return self2.getTopDownReorderBoundary(nodeId);
          }
        };
        self2.focusAndSelect = function(nodeId) {
          self2.selectNode(nodeId);
          self2.dispatchEvent("nodeFocusRequested", nodeId);
        };
        self2.requestContextMenu = function(eventPointX, eventPointY) {
          if (isInputEnabled && isEditingEnabled) {
            self2.dispatchEvent("contextMenuRequested", currentlySelectedIdeaId, eventPointX, eventPointY);
            return true;
          }
          return false;
        };
        self2.makeSelectedNodeRoot = function() {
          const nodeId = self2.getSelectedNodeId();
          if (!nodeId || idea.isRootNode(nodeId)) {
            return false;
          }
          if (isInputEnabled && isEditingEnabled) {
            return idea.batch(function() {
              setRootNodePositionsForPrecalculatedLayout(nodeId, layoutModel.getLayout());
              const result = changeParent(nodeId, "root");
              setNodePositionFromCurrentLayout(nodeId);
              setRootNodePositionsForPrecalculatedLayout(nodeId);
              return result;
            });
          }
        };
        self2.setNodeWidth = function(source, id, width) {
          idea.mergeAttrProperty(id, "style", "width", width);
        };
        self2.unsetSelectedNodeWidth = function(source) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("unsetSelectedNodeWidth", source);
          self2.applyToActivated(function(id) {
            idea.mergeAttrProperty(id, "style", "width", false);
          });
        };
        self2.unsetSelectedNodePosition = function(source) {
          if (!isEditingEnabled) {
            return false;
          }
          analytic("unsetSelectedNodePosition", source);
          self2.applyToActivated(self2.autoPosition);
        };
        self2.insertRoot = function(source, initialTitle) {
          const createNode = function() {
            if (initialTitle) {
              return addSubIdea(idea.id, initialTitle);
            } else {
              return addSubIdea(idea.id);
            }
          };
          if (!isEditingEnabled) {
            return false;
          }
          analytic("addRootNode", source);
          if (isInputEnabled) {
            let newId = false;
            idea.batch(function() {
              newId = createNode();
              positionNextTo(newId, self2.getSelectedNodeId());
              setRootNodePositionsForPrecalculatedLayout(newId);
            });
            if (newId) {
              if (initialTitle) {
                selectNewIdea(newId);
              } else {
                editNewIdea(newId);
              }
            }
          }
        };
        self2.lineLabelClicked = function(line) {
          self2.dispatchEvent("lineLabelClicked", line);
        };
      };
    }
  });

  // vendor/mapjs/src/core/content/content-upgrade.js
  var require_content_upgrade = __commonJS({
    "vendor/mapjs/src/core/content/content-upgrade.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function contentUpgrade(content2) {
        "use strict";
        const upgradeV2 = function() {
          const doUpgrade = function(idea) {
            let collapsed;
            if (idea.style) {
              idea.attr = {};
              collapsed = idea.style.collapsed;
              delete idea.style.collapsed;
              idea.attr.style = idea.style;
              if (collapsed) {
                idea.attr.collapsed = collapsed;
              }
              delete idea.style;
            }
            if (idea.ideas) {
              _.each(idea.ideas, doUpgrade);
            }
          };
          if (content2.formatVersion && content2.formatVersion >= 2) {
            return;
          }
          doUpgrade(content2);
          content2.formatVersion = 2;
        }, upgradeV3 = function() {
          const doUpgrade = function() {
            const rootAttrKeys = ["theme", "themeOverrides", "measurements-config", "storyboards", "progress-statuses"], oldRootAttr = content2 && content2.attr || {}, newRootAttr = _.pick(oldRootAttr, rootAttrKeys), newRootNodeAttr = _.omit(oldRootAttr, rootAttrKeys), firstLevel = content2 && content2.ideas, newRoot = {
              id: content2.id,
              title: content2.title,
              attr: newRootNodeAttr
            };
            if (firstLevel) {
              newRoot.ideas = firstLevel;
            }
            content2.id = "root";
            content2.ideas = {
              1: newRoot
            };
            delete content2.title;
            content2.attr = newRootAttr;
          };
          if (content2.formatVersion && content2.formatVersion >= 3) {
            return;
          }
          doUpgrade();
          content2.formatVersion = 3;
        };
        upgradeV2();
        upgradeV3();
        return content2;
      };
    }
  });

  // vendor/mapjs/src/core/content/content.js
  var require_content = __commonJS({
    "vendor/mapjs/src/core/content/content.js"(exports, module) {
      var _ = require_underscore_umd();
      var observable = require_observable();
      var contentUpgrade = require_content_upgrade();
      module.exports = function content2(contentAggregate, initialSessionId) {
        "use strict";
        let cachedId, sessionKey = initialSessionId, configuration = {}, isRedoInProgress = false;
        const invalidateIdCache = function() {
          cachedId = void 0;
        }, maxId = function maxId2(idea) {
          idea = idea || contentAggregate;
          if (!idea.ideas) {
            return parseInt(idea.id, 10) || 0;
          }
          return _.reduce(
            idea.ideas,
            function(result, subidea) {
              return Math.max(result, maxId2(subidea));
            },
            parseInt(idea.id, 10) || 0
          );
        }, nextId = function nextId2(originSession) {
          originSession = originSession || sessionKey;
          if (!cachedId) {
            cachedId = maxId();
          }
          cachedId += 1;
          if (originSession) {
            return cachedId + "." + originSession;
          }
          return cachedId;
        }, init2 = function(contentIdea, originSession) {
          const initOfRoot = contentIdea.id === contentAggregate.id;
          if (!contentIdea.id) {
            contentIdea.id = nextId(originSession);
          } else {
            invalidateIdCache();
          }
          if (contentIdea.ideas) {
            _.each(contentIdea.ideas, function(value, key) {
              if (!initOfRoot && value.attr && value.attr.group && _.isEmpty(value.ideas)) {
                delete contentIdea.ideas[key];
              } else {
                contentIdea.ideas[parseFloat(key)] = init2(value, originSession);
              }
            });
          }
          if (!contentIdea.title) {
            contentIdea.title = "";
          }
          contentIdea.containsDirectChild = contentIdea.findChildRankById = function(childIdeaId) {
            return parseFloat(
              _.reduce(
                contentIdea.ideas,
                function(res, value, key) {
                  return value.id == childIdeaId ? key : res;
                },
                void 0
              )
            );
          };
          contentIdea.findSubIdeaById = function(childIdeaId) {
            const myChild = _.find(contentIdea.ideas, function(idea) {
              return idea.id == childIdeaId;
            });
            return myChild || _.reduce(contentIdea.ideas, function(result, idea) {
              return result || idea.findSubIdeaById(childIdeaId);
            }, void 0);
          };
          contentIdea.isEmptyGroup = function() {
            return !contentAggregate.isRootNode(contentIdea.id) && contentIdea.attr && contentIdea.attr.group && _.isEmpty(contentIdea.ideas);
          };
          contentIdea.find = function(predicate) {
            const current = predicate(contentIdea) ? [_.pick(contentIdea, "id", "title")] : [];
            if (_.size(contentIdea.ideas) === 0) {
              return current;
            }
            return _.reduce(contentIdea.ideas, function(result, idea) {
              return _.union(result, idea.find(predicate));
            }, current);
          };
          contentIdea.getAttr = function(name) {
            if (contentIdea.attr && contentIdea.attr[name]) {
              return _.clone(contentIdea.attr[name]);
            }
            return false;
          };
          contentIdea.sortedSubIdeas = function() {
            const result = [], childKeys = contentIdea.ideas && _.groupBy(_.map(_.keys(contentIdea.ideas), parseFloat), function(key) {
              return key > 0;
            }), sortedChildKeys = childKeys && _.sortBy(childKeys[true], Math.abs).concat(_.sortBy(childKeys[false], Math.abs));
            if (!contentIdea.ideas) {
              return [];
            }
            _.each(sortedChildKeys, function(key) {
              result.push(contentIdea.ideas[key]);
            });
            return result;
          };
          contentIdea.traverse = function(iterator, postOrder) {
            if (!postOrder && contentIdea !== contentAggregate) {
              iterator(contentIdea);
            }
            _.each(contentIdea.sortedSubIdeas(), function(subIdea) {
              subIdea.traverse(iterator, postOrder);
            });
            if (postOrder && contentIdea !== contentAggregate) {
              iterator(contentIdea);
            }
          };
          return contentIdea;
        }, maxKey = function(kvMap, sign2) {
          let currentKeys = [];
          sign2 = sign2 || 1;
          if (_.size(kvMap) === 0) {
            return 0;
          }
          currentKeys = _.keys(kvMap);
          currentKeys.push(0);
          return _.max(_.map(currentKeys, parseFloat), function(x) {
            return x * sign2;
          });
        }, isRootNode = function(id) {
          return !!_.find(contentAggregate.ideas, function(idea) {
            return idea.id === id;
          });
        }, nextChildRank = function(parentIdea) {
          let newRank = 0, counts = 0, childRankSign = 1;
          if (isRootNode(parentIdea.id)) {
            counts = _.countBy(parentIdea.ideas, function(v, k) {
              return k < 0;
            });
            if ((counts["true"] || 0) < counts["false"]) {
              childRankSign = -1;
            }
          }
          newRank = maxKey(parentIdea.ideas, childRankSign) + childRankSign;
          return newRank;
        }, appendSubIdea = function(parentIdea, subIdea) {
          let rank = 0;
          parentIdea.ideas = parentIdea.ideas || {};
          rank = nextChildRank(parentIdea);
          parentIdea.ideas[rank] = subIdea;
          return rank;
        }, findIdeaById = function(ideaId) {
          return contentAggregate.id == ideaId ? contentAggregate : contentAggregate.findSubIdeaById(ideaId);
        }, sameSideSiblingRanks = function(parentIdea, ideaRank) {
          return _(_.map(_.keys(parentIdea.ideas), parseFloat)).reject(function(k) {
            return k * ideaRank < 0;
          });
        }, sign = function(number) {
          return number < 0 ? -1 : 1;
        }, eventStacks = {}, redoStacks = {}, batches = {}, notifyChange = function(method, args, originSession) {
          if (originSession) {
            contentAggregate.dispatchEvent("changed", method, args, originSession);
          } else {
            contentAggregate.dispatchEvent("changed", method, args);
          }
        }, logChange = function(method, args, undofunc, originSession) {
          const event = { eventMethod: method, eventArgs: args, undoFunction: undofunc };
          if (batches[originSession]) {
            batches[originSession].push(event);
            return;
          }
          if (!eventStacks[originSession]) {
            eventStacks[originSession] = [];
          }
          eventStacks[originSession].push(event);
          if (isRedoInProgress) {
            contentAggregate.dispatchEvent("changed", "redo", void 0, originSession);
          } else {
            notifyChange(method, args, originSession);
            redoStacks[originSession] = [];
          }
        }, appendChange = function(method, args, undofunc, originSession) {
          const executeOutsideBatch = function() {
            const prev = eventStacks[originSession].pop();
            if (prev.eventMethod === "batch") {
              eventStacks[originSession].push({
                eventMethod: "batch",
                eventArgs: prev.eventArgs.concat([[method].concat(args)]),
                undoFunction: function() {
                  undofunc();
                  prev.undoFunction();
                }
              });
            } else {
              eventStacks[originSession].push({
                eventMethod: "batch",
                eventArgs: [[prev.eventMethod].concat(prev.eventArgs)].concat([[method].concat(args)]),
                undoFunction: function() {
                  undofunc();
                  prev.undoFunction();
                }
              });
            }
            if (isRedoInProgress) {
              contentAggregate.dispatchEvent("changed", "redo", void 0, originSession);
            } else {
              notifyChange(method, args, originSession);
              redoStacks[originSession] = [];
            }
          };
          if (method === "batch" || batches[originSession] || !eventStacks || !eventStacks[originSession] || eventStacks[originSession].length === 0) {
            logChange(method, args, undofunc, originSession);
            return;
          } else {
            executeOutsideBatch();
          }
        }, reorderChild = function(parentIdea, newRank, oldRank) {
          const undoFunction = function() {
            if (parentIdea.ideas[oldRank] || !parentIdea.ideas[newRank]) {
              return false;
            }
            parentIdea.ideas[oldRank] = parentIdea.ideas[newRank];
            delete parentIdea.ideas[newRank];
          };
          parentIdea.ideas[newRank] = parentIdea.ideas[oldRank];
          delete parentIdea.ideas[oldRank];
          return undoFunction;
        }, sessionFromId = function(id) {
          const dotIndex = String(id).indexOf(".");
          return dotIndex > 0 && id.substr(dotIndex + 1);
        }, commandProcessors = {}, uniqueResourcePostfix = "/xxxxxxxx-yxxx-yxxx-yxxx-xxxxxxxxxxxx/".replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
          return v.toString(16);
        }) + (sessionKey || ""), updateAttr = function(object, attrName, attrValue) {
          const oldAttr = object && _.extend({}, object.attr);
          if (!object) {
            return false;
          }
          object.attr = _.extend({}, object.attr);
          if (!attrValue || attrValue === "false" || _.isObject(attrValue) && _.isEmpty(attrValue)) {
            if (!object.attr[attrName]) {
              return false;
            }
            delete object.attr[attrName];
          } else {
            if (_.isEqual(object.attr[attrName], attrValue)) {
              return false;
            }
            object.attr[attrName] = JSON.parse(JSON.stringify(attrValue));
          }
          if (_.size(object.attr) === 0) {
            delete object.attr;
          }
          return function() {
            object.attr = oldAttr;
          };
        }, findLinkBetween = function(ideaIdFrom, ideaIdTo) {
          return _.find(
            contentAggregate.links,
            function(link) {
              return link.ideaIdFrom === ideaIdFrom && link.ideaIdTo === ideaIdTo || link.ideaIdFrom === ideaIdTo && link.ideaIdTo === ideaIdFrom;
            }
          );
        }, isLinkValid = function(ideaIdFrom, ideaIdTo) {
          const ideaFrom = findIdeaById(ideaIdFrom), ideaTo = findIdeaById(ideaIdTo), isParentChild = ideaFrom && ideaTo && (_.find(ideaFrom.ideas, function(node) {
            return node.id === ideaIdTo;
          }) || _.find(ideaTo.ideas, function(node) {
            return node.id === ideaIdFrom;
          }));
          if (ideaIdFrom === ideaIdTo) {
            return false;
          }
          if (!ideaFrom) {
            return false;
          }
          if (!ideaTo) {
            return false;
          }
          if (isParentChild) {
            return false;
          }
          return true;
        }, findLinkDirectional = function(ideaIdFrom, ideaIdTo) {
          return _.find(
            contentAggregate.links,
            function(link) {
              return link.ideaIdFrom == ideaIdFrom && link.ideaIdTo == ideaIdTo;
            }
          );
        };
        contentAggregate.setConfiguration = function(config) {
          configuration = config || {};
        };
        contentAggregate.getSessionKey = function() {
          return sessionKey;
        };
        contentAggregate.setSessionKey = function(newSessionKey) {
          if (contentAggregate.isBatchActive()) {
            throw "batch-is-active";
          }
          sessionKey = newSessionKey;
        };
        contentAggregate.nextSiblingId = function(subIdeaId) {
          const parentIdea = contentAggregate.findParent(subIdeaId), currentRank = parentIdea && parentIdea.findChildRankById(subIdeaId), candidateSiblingRanks = currentRank && sameSideSiblingRanks(parentIdea, currentRank), siblingsAfter = candidateSiblingRanks && _.reject(candidateSiblingRanks, function(k) {
            return Math.abs(k) <= Math.abs(currentRank);
          });
          if (!parentIdea) {
            return false;
          }
          if (siblingsAfter.length === 0) {
            return false;
          }
          return parentIdea.ideas[_.min(siblingsAfter, Math.abs)].id;
        };
        contentAggregate.sameSideSiblingIds = function(subIdeaId) {
          const parentIdea = contentAggregate.findParent(subIdeaId), currentRank = parentIdea.findChildRankById(subIdeaId);
          return _.without(_.map(_.pick(parentIdea.ideas, sameSideSiblingRanks(parentIdea, currentRank)), function(i) {
            return i.id;
          }), subIdeaId);
        };
        contentAggregate.getAttrById = function(ideaId, attrName) {
          const idea = findIdeaById(ideaId);
          return idea && idea.getAttr(attrName);
        };
        contentAggregate.previousSiblingId = function(subIdeaId) {
          const parentIdea = contentAggregate.findParent(subIdeaId), currentRank = parentIdea && parentIdea.findChildRankById(subIdeaId), candidateSiblingRanks = currentRank && sameSideSiblingRanks(parentIdea, currentRank), siblingsBefore = candidateSiblingRanks && _.reject(candidateSiblingRanks, function(k) {
            return Math.abs(k) >= Math.abs(currentRank);
          });
          if (!parentIdea) {
            return false;
          }
          if (siblingsBefore.length === 0) {
            return false;
          }
          return parentIdea.ideas[_.max(siblingsBefore, Math.abs)].id;
        };
        contentAggregate.clone = function(subIdeaId) {
          const toClone = subIdeaId && subIdeaId != contentAggregate.id && contentAggregate.findSubIdeaById(subIdeaId) || contentAggregate;
          return JSON.parse(JSON.stringify(toClone));
        };
        contentAggregate.cloneMultiple = function(subIdeaIdArray) {
          return _.map(subIdeaIdArray, contentAggregate.clone);
        };
        contentAggregate.calculatePath = function(ideaId, currentPath, potentialParent) {
          if (contentAggregate.isRootNode(ideaId)) {
            return [];
          }
          currentPath = currentPath || [contentAggregate];
          potentialParent = potentialParent || contentAggregate;
          if (potentialParent.containsDirectChild(ideaId)) {
            return currentPath;
          }
          return _.reduce(
            potentialParent.ideas,
            function(result, child) {
              return result || contentAggregate.calculatePath(ideaId, [child].concat(currentPath), child);
            },
            false
          );
        };
        contentAggregate.getSubTreeIds = function(rootIdeaId) {
          const result = [], collectIds = function(idea) {
            if (_.isEmpty(idea.ideas)) {
              return [];
            }
            _.each(idea.sortedSubIdeas(), function(child) {
              collectIds(child);
              result.push(child.id);
            });
          };
          collectIds(contentAggregate.findSubIdeaById(rootIdeaId) || contentAggregate);
          return result;
        };
        contentAggregate.findParent = function(subIdeaId, parentIdea) {
          parentIdea = parentIdea || contentAggregate;
          if (contentAggregate.isRootNode(subIdeaId)) {
            return false;
          }
          if (parentIdea.containsDirectChild(subIdeaId)) {
            return parentIdea;
          }
          return _.reduce(
            parentIdea.ideas,
            function(result, child) {
              return result || contentAggregate.findParent(subIdeaId, child);
            },
            false
          );
        };
        contentAggregate.isBatchActive = function(originSession) {
          const activeSession = originSession || sessionKey;
          return !!batches[activeSession];
        };
        contentAggregate.startBatch = function(originSession) {
          const activeSession = originSession || sessionKey;
          contentAggregate.endBatch(originSession);
          batches[activeSession] = [];
        };
        contentAggregate.discardBatch = function(originSession) {
          const activeSession = originSession || sessionKey;
          batches[activeSession] = void 0;
        };
        contentAggregate.endBatch = function(originSession) {
          const activeSession = originSession || sessionKey, inBatch = batches[activeSession], performBatchOperations = function() {
            const batchArgs = _.map(inBatch, function(event) {
              return [event.eventMethod].concat(event.eventArgs);
            }), batchUndoFunctions = _.sortBy(
              _.map(inBatch, function(event) {
                return event.undoFunction;
              }),
              function(f, idx) {
                return -1 * idx;
              }
            ), undo = function() {
              _.each(batchUndoFunctions, function(eventUndo) {
                eventUndo();
              });
            };
            logChange("batch", batchArgs, undo, activeSession);
          };
          batches[activeSession] = void 0;
          if (_.isEmpty(inBatch)) {
            return;
          }
          if (_.size(inBatch) === 1) {
            logChange(inBatch[0].eventMethod, inBatch[0].eventArgs, inBatch[0].undoFunction, activeSession);
          } else {
            performBatchOperations();
          }
        };
        contentAggregate.execCommand = function(cmd, args, originSession) {
          if (!commandProcessors[cmd]) {
            return false;
          }
          return commandProcessors[cmd].apply(contentAggregate, [originSession || sessionKey].concat(_.toArray(args)));
        };
        contentAggregate.batch = function(batchOp) {
          const hasActiveBatch = contentAggregate.isBatchActive();
          let results;
          if (!hasActiveBatch) {
            contentAggregate.startBatch();
          }
          try {
            results = batchOp();
          } catch (e) {
            if (!hasActiveBatch) {
              contentAggregate.discardBatch();
            }
            throw e;
          }
          if (!hasActiveBatch) {
            contentAggregate.endBatch();
          }
          return results;
        };
        commandProcessors.batch = function(originSession) {
          contentAggregate.startBatch(originSession);
          try {
            _.each(_.toArray(arguments).slice(1), function(event) {
              contentAggregate.execCommand(event[0], event.slice(1), originSession);
            });
          } finally {
            contentAggregate.endBatch(originSession);
          }
        };
        contentAggregate.pasteMultiple = function(parentIdeaId, jsonArrayToPaste) {
          return contentAggregate.batch(function() {
            return _.map(jsonArrayToPaste, function(json) {
              return contentAggregate.paste(parentIdeaId, json);
            });
          });
        };
        contentAggregate.paste = function() {
          return contentAggregate.execCommand("paste", arguments);
        };
        commandProcessors.paste = function(originSession, parentIdeaId, jsonToPaste, initialId) {
          const pasteParent = parentIdeaId == contentAggregate.id ? contentAggregate : contentAggregate.findSubIdeaById(parentIdeaId), cleanUp = function(json) {
            const result = _.omit(json, "ideas", "id", "attr");
            let index = 1, childKeys, sortedChildKeys;
            result.attr = _.omit(json.attr, configuration.nonClonedAttributes);
            if (_.isEmpty(result.attr)) {
              delete result.attr;
            }
            if (json.ideas) {
              childKeys = _.groupBy(_.map(_.keys(json.ideas), parseFloat), function(key) {
                return key > 0;
              });
              sortedChildKeys = _.sortBy(childKeys[true], Math.abs).concat(_.sortBy(childKeys[false], Math.abs));
              result.ideas = {};
              _.each(sortedChildKeys, function(key) {
                result.ideas[index++] = cleanUp(json.ideas[key]);
              });
            }
            return result;
          };
          let newIdea = void 0, newRank = 0;
          if (initialId) {
            cachedId = parseInt(initialId, 10) - 1;
          }
          newIdea = jsonToPaste && (jsonToPaste.title || jsonToPaste.attr) && init2(cleanUp(jsonToPaste), sessionFromId(initialId));
          if (!pasteParent || !newIdea) {
            return false;
          }
          newRank = appendSubIdea(pasteParent, newIdea);
          if (initialId) {
            invalidateIdCache();
          }
          updateAttr(newIdea, "position");
          logChange("paste", [parentIdeaId, jsonToPaste, newIdea.id], function() {
            delete pasteParent.ideas[newRank];
          }, originSession);
          return newIdea.id;
        };
        contentAggregate.flip = function() {
          return contentAggregate.execCommand("flip", arguments);
        };
        commandProcessors.flip = function(originSession, ideaId) {
          const parentIdea = contentAggregate.findParent(ideaId), currentRank = parentIdea && contentAggregate.isRootNode(parentIdea.id) && parentIdea.findChildRankById(ideaId), performFlip = function() {
            const maxRank = maxKey(parentIdea.ideas, -1 * sign(currentRank)), newRank = maxRank - 10 * sign(currentRank), undoFunction = reorderChild(parentIdea, newRank, currentRank);
            logChange("flip", [ideaId], undoFunction, originSession);
          };
          if (!currentRank) {
            return false;
          }
          performFlip();
          return true;
        };
        contentAggregate.initialiseTitle = function() {
          return contentAggregate.execCommand("initialiseTitle", arguments);
        };
        commandProcessors.initialiseTitle = function(originSession, ideaId, title) {
          const idea = findIdeaById(ideaId), originalTitle = idea && idea.title;
          if (!idea) {
            return false;
          }
          if (originalTitle === title) {
            return false;
          }
          idea.title = title;
          appendChange("initialiseTitle", [ideaId, title], function() {
            idea.title = originalTitle;
          }, originSession);
          return true;
        };
        contentAggregate.updateTitle = function() {
          return contentAggregate.execCommand("updateTitle", arguments);
        };
        commandProcessors.updateTitle = function(originSession, ideaId, title) {
          const idea = findIdeaById(ideaId), originalTitle = idea && idea.title;
          if (!idea) {
            return false;
          }
          if (originalTitle === title) {
            return false;
          }
          idea.title = title;
          logChange("updateTitle", [ideaId, title], function() {
            idea.title = originalTitle;
          }, originSession);
          return true;
        };
        contentAggregate.addSubIdea = function() {
          return contentAggregate.execCommand("addSubIdea", arguments);
        };
        commandProcessors.addSubIdea = function(originSession, parentId, ideaTitle, optionalNewId, optionalAttr) {
          const parent = findIdeaById(parentId), createIdeaParams = () => {
            const params = {
              title: ideaTitle,
              id: optionalNewId
            };
            if (optionalAttr) {
              params.attr = optionalAttr;
            }
            return params;
          }, performAdd = function() {
            const idea = init2(createIdeaParams()), newRank = appendSubIdea(parent, idea);
            logChange("addSubIdea", [parentId, ideaTitle, idea.id, optionalAttr], function() {
              delete parent.ideas[newRank];
            }, originSession);
            return idea.id;
          };
          if (!parent) {
            return false;
          }
          if (optionalNewId && findIdeaById(optionalNewId)) {
            return false;
          }
          return performAdd();
        };
        contentAggregate.removeMultiple = function(subIdeaIdArray) {
          let results = false;
          contentAggregate.startBatch();
          results = _.map(subIdeaIdArray, contentAggregate.removeSubIdea);
          contentAggregate.endBatch();
          return results;
        };
        contentAggregate.removeSubIdea = function() {
          return contentAggregate.execCommand("removeSubIdea", arguments);
        };
        commandProcessors.removeSubIdea = function(originSession, subIdeaId) {
          const canRemove = function() {
            return !contentAggregate.isRootNode(subIdeaId) || _.size(contentAggregate.ideas) > 1;
          }, performRemove = function() {
            const parent = contentAggregate.findParent(subIdeaId) || contentAggregate, oldRank = parent && parent.findChildRankById(subIdeaId), oldIdea = parent && parent.ideas[oldRank], oldLinks = contentAggregate.links, removedNodeIds = {};
            if (!oldRank) {
              return false;
            }
            oldIdea.traverse((traversed) => removedNodeIds[traversed.id] = true);
            delete parent.ideas[oldRank];
            contentAggregate.links = _.reject(contentAggregate.links, function(link) {
              return removedNodeIds[link.ideaIdFrom] || removedNodeIds[link.ideaIdTo];
            });
            logChange("removeSubIdea", [subIdeaId], function() {
              parent.ideas[oldRank] = oldIdea;
              contentAggregate.links = oldLinks;
            }, originSession);
            return true;
          };
          if (!canRemove()) {
            return false;
          }
          return performRemove();
        };
        contentAggregate.insertIntermediateMultiple = function(idArray, ideaOptions) {
          return contentAggregate.batch(function() {
            const newId = contentAggregate.insertIntermediate(idArray[0], ideaOptions && ideaOptions.title);
            if (ideaOptions && ideaOptions.attr) {
              Object.keys(ideaOptions.attr).forEach(function(key) {
                contentAggregate.updateAttr(newId, key, ideaOptions.attr[key]);
              });
            }
            _.each(idArray.slice(1), function(id) {
              contentAggregate.changeParent(id, newId);
            });
            return newId;
          });
        };
        contentAggregate.insertIntermediate = function() {
          return contentAggregate.execCommand("insertIntermediate", arguments);
        };
        commandProcessors.insertIntermediate = function(originSession, inFrontOfIdeaId, title, optionalNewId, optionalAttr) {
          const parentIdea = contentAggregate.isRootNode(inFrontOfIdeaId) ? contentAggregate : contentAggregate.findParent(inFrontOfIdeaId), childRank = parentIdea && parentIdea.findChildRankById(inFrontOfIdeaId), canInsert = function() {
            if (contentAggregate.id == inFrontOfIdeaId) {
              return false;
            }
            if (!parentIdea) {
              return false;
            }
            if (optionalNewId && findIdeaById(optionalNewId)) {
              return false;
            }
            if (!childRank) {
              return false;
            }
            return true;
          }, performInsert = function() {
            const createIdeaParams = () => {
              const params = {
                title,
                id: optionalNewId
              };
              if (optionalAttr) {
                params.attr = optionalAttr;
              }
              return params;
            }, oldIdea = parentIdea.ideas[childRank], newIdea = init2(createIdeaParams());
            parentIdea.ideas[childRank] = newIdea;
            newIdea.ideas = {
              1: oldIdea
            };
            logChange("insertIntermediate", [inFrontOfIdeaId, title, newIdea.id, optionalAttr], function() {
              parentIdea.ideas[childRank] = oldIdea;
            }, originSession);
            return newIdea.id;
          };
          if (!canInsert()) {
            return false;
          }
          return performInsert();
        };
        contentAggregate.changeParent = function() {
          return contentAggregate.execCommand("changeParent", arguments);
        };
        commandProcessors.changeParent = function(originSession, ideaId, newParentId) {
          const parent = findIdeaById(newParentId), idea = contentAggregate.findSubIdeaById(ideaId), oldParent = contentAggregate.isRootNode(ideaId) ? contentAggregate : contentAggregate.findParent(ideaId), canChangeParent = function() {
            if (ideaId == newParentId) {
              return false;
            }
            if (!parent) {
              return false;
            }
            if (!idea) {
              return false;
            }
            if (idea.findSubIdeaById(newParentId)) {
              return false;
            }
            if (parent.containsDirectChild(ideaId)) {
              return false;
            }
            if (!oldParent) {
              return false;
            }
            return true;
          }, performChangeParent = function() {
            const oldRank = oldParent.findChildRankById(ideaId), newRank = appendSubIdea(parent, idea), oldPosition = idea.getAttr("position");
            updateAttr(idea, "position");
            delete oldParent.ideas[oldRank];
            logChange("changeParent", [ideaId, newParentId], function() {
              updateAttr(idea, "position", oldPosition);
              oldParent.ideas[oldRank] = idea;
              delete parent.ideas[newRank];
            }, originSession);
          };
          if (!canChangeParent()) {
            return false;
          }
          performChangeParent();
          return true;
        };
        contentAggregate.mergeAttrProperty = function(ideaId, attrName, attrPropertyName, attrPropertyValue) {
          let val = contentAggregate.getAttrById(ideaId, attrName) || {};
          if (attrPropertyValue) {
            val[attrPropertyName] = attrPropertyValue;
          } else {
            delete val[attrPropertyName];
          }
          if (_.isEmpty(val)) {
            val = false;
          }
          return contentAggregate.updateAttr(ideaId, attrName, val);
        };
        contentAggregate.updateAttr = function() {
          return contentAggregate.execCommand("updateAttr", arguments);
        };
        commandProcessors.updateAttr = function(originSession, ideaId, attrName, attrValue) {
          const idea = findIdeaById(ideaId), undoAction = updateAttr(idea, attrName, attrValue);
          if (undoAction) {
            logChange("updateAttr", [ideaId, attrName, attrValue], undoAction, originSession);
          }
          return !!undoAction;
        };
        contentAggregate.getOrderedSiblingRanks = function(ideaId, options) {
          const parentIdea = contentAggregate.findParent(ideaId), currentRank = parentIdea && parentIdea.findChildRankById(ideaId);
          if (!currentRank) {
            return false;
          }
          if (options && options.ignoreRankSide) {
            return _.sortBy(_.map(_.keys(parentIdea.ideas), parseFloat));
          } else {
            return _.sortBy(sameSideSiblingRanks(parentIdea, currentRank), Math.abs);
          }
        };
        contentAggregate.moveRelative = function(ideaId, relativeMovement, options) {
          const parentIdea = contentAggregate.findParent(ideaId), currentRank = parentIdea && parentIdea.findChildRankById(ideaId), siblingRanks = contentAggregate.getOrderedSiblingRanks(ideaId, options), currentIndex = siblingRanks && siblingRanks.indexOf(currentRank), calcNewIndex = function() {
            let calcIndex = currentIndex + (relativeMovement > 0 ? relativeMovement + 1 : relativeMovement);
            if (options && options.ignoreRankSide) {
              if (currentRank < 0) {
                calcIndex = currentIndex + (relativeMovement < 0 ? relativeMovement - 1 : relativeMovement);
                if (siblingRanks[calcIndex] > 0) {
                  calcIndex = calcIndex + 1;
                }
              } else if (siblingRanks[calcIndex] < 0) {
                calcIndex = calcIndex - 1;
              }
            }
            return calcIndex;
          }, newIndex = calcNewIndex(), beforeRank = newIndex >= 0 && siblingRanks && siblingRanks.length && siblingRanks[newIndex], beforeSibling = beforeRank && parentIdea && parentIdea.ideas[beforeRank], shouldNotPosition = function() {
            if (!parentIdea) {
              return false;
            }
            if (options && options.ignoreRankSide && currentRank < 0) {
              return newIndex > siblingRanks.length - 1;
            }
            return newIndex < 0;
          };
          let result = false;
          if (shouldNotPosition()) {
            return false;
          }
          contentAggregate.startBatch();
          if (options && options.ignoreRankSide && beforeRank && beforeSibling && beforeRank * currentRank < 0) {
            contentAggregate.flip(ideaId);
          }
          result = contentAggregate.positionBefore(ideaId, beforeSibling && beforeSibling.id, parentIdea);
          contentAggregate.endBatch();
          return result;
        };
        contentAggregate.positionBefore = function() {
          return contentAggregate.execCommand("positionBefore", arguments);
        };
        commandProcessors.positionBefore = function(originSession, ideaId, positionBeforeIdeaId, parentIdeaArg) {
          let newRank, afterRank, siblingRanks, candidateSiblings, beforeRank, maxRank, undoFunction = void 0;
          const parentIdea = parentIdeaArg || contentAggregate.findParent(ideaId), currentRank = parentIdea && parentIdea.findChildRankById(ideaId);
          if (!parentIdea) {
            return false;
          }
          if (ideaId == positionBeforeIdeaId) {
            return false;
          }
          newRank = 0;
          if (positionBeforeIdeaId) {
            afterRank = parentIdea.findChildRankById(positionBeforeIdeaId);
            if (!afterRank) {
              return false;
            }
            siblingRanks = sameSideSiblingRanks(parentIdea, afterRank);
            candidateSiblings = _.reject(_.sortBy(siblingRanks, Math.abs), function(k) {
              return Math.abs(k) >= Math.abs(afterRank);
            });
            beforeRank = candidateSiblings.length > 0 ? _.max(candidateSiblings, Math.abs) : 0;
            if (beforeRank == currentRank) {
              return false;
            }
            newRank = beforeRank + (afterRank - beforeRank) / 2;
          } else {
            maxRank = maxKey(parentIdea.ideas, currentRank < 0 ? -1 : 1);
            if (maxRank == currentRank) {
              return false;
            }
            newRank = maxRank + 10 * (currentRank < 0 ? -1 : 1);
          }
          if (newRank == currentRank) {
            return false;
          }
          undoFunction = reorderChild(parentIdea, newRank, currentRank);
          logChange("positionBefore", [ideaId, positionBeforeIdeaId], undoFunction, originSession);
          return true;
        };
        contentAggregate.addLink = function() {
          return contentAggregate.execCommand("addLink", arguments);
        };
        commandProcessors.addLink = function(originSession, ideaIdFrom, ideaIdTo) {
          const link = {
            ideaIdFrom,
            ideaIdTo,
            attr: {
              style: {
                color: "#707070",
                lineStyle: "solid",
                arrow: "to"
              }
            }
          };
          if (!isLinkValid(ideaIdFrom, ideaIdTo)) {
            return false;
          }
          if (findLinkBetween(ideaIdFrom, ideaIdTo)) {
            return false;
          }
          contentAggregate.links = contentAggregate.links || [];
          contentAggregate.links.push(link);
          logChange("addLink", [ideaIdFrom, ideaIdTo], function() {
            contentAggregate.links.pop();
          }, originSession);
          return true;
        };
        contentAggregate.removeLink = function() {
          return contentAggregate.execCommand("removeLink", arguments);
        };
        commandProcessors.removeLink = function(originSession, ideaIdOne, ideaIdTwo) {
          let i = 0, link;
          while (contentAggregate.links && i < contentAggregate.links.length) {
            link = contentAggregate.links[i];
            if (link.ideaIdFrom === ideaIdOne && link.ideaIdTo === ideaIdTwo) {
              contentAggregate.links.splice(i, 1);
              logChange("removeLink", [ideaIdOne, ideaIdTwo], function() {
                contentAggregate.links.push(_.clone(link));
              }, originSession);
              return true;
            }
            i += 1;
          }
          return false;
        };
        contentAggregate.getLinkAttr = function(ideaIdFrom, ideaIdTo, name) {
          const link = findLinkDirectional(ideaIdFrom, ideaIdTo);
          if (link && link.attr && link.attr[name]) {
            return link.attr[name];
          }
          return false;
        };
        contentAggregate.updateLinkAttr = function() {
          return contentAggregate.execCommand("updateLinkAttr", arguments);
        };
        commandProcessors.updateLinkAttr = function(originSession, ideaIdFrom, ideaIdTo, attrName, attrValue) {
          const link = findLinkDirectional(ideaIdFrom, ideaIdTo), undoAction = updateAttr(link, attrName, attrValue);
          if (undoAction) {
            logChange("updateLinkAttr", [ideaIdFrom, ideaIdTo, attrName, attrValue], undoAction, originSession);
          }
          return !!undoAction;
        };
        contentAggregate.canUndo = function() {
          return !!(eventStacks[sessionKey] && eventStacks[sessionKey].length > 0);
        };
        contentAggregate.canRedo = function() {
          return !!(redoStacks[sessionKey] && redoStacks[sessionKey].length > 0);
        };
        contentAggregate.undo = function() {
          return contentAggregate.execCommand("undo", arguments);
        };
        commandProcessors.undo = function(originSession) {
          let topEvent = false;
          contentAggregate.endBatch();
          topEvent = eventStacks[originSession] && eventStacks[originSession].pop();
          if (topEvent && topEvent.undoFunction) {
            topEvent.undoFunction();
            if (!redoStacks[originSession]) {
              redoStacks[originSession] = [];
            }
            redoStacks[originSession].push(topEvent);
            contentAggregate.dispatchEvent("changed", "undo", [], originSession);
            return true;
          }
          return false;
        };
        contentAggregate.redo = function() {
          return contentAggregate.execCommand("redo", arguments);
        };
        commandProcessors.redo = function(originSession) {
          let topEvent = false;
          contentAggregate.endBatch();
          topEvent = redoStacks[originSession] && redoStacks[originSession].pop();
          if (topEvent) {
            isRedoInProgress = true;
            contentAggregate.execCommand(topEvent.eventMethod, topEvent.eventArgs, originSession);
            isRedoInProgress = false;
            return true;
          }
          return false;
        };
        contentAggregate.storeResource = function() {
          return contentAggregate.execCommand("storeResource", arguments);
        };
        commandProcessors.storeResource = function(originSession, resourceBody, optionalKey) {
          const maxIdForSession = function() {
            const keys = _.keys(contentAggregate.resources), filteredKeys = sessionKey ? _.filter(keys, RegExp.prototype.test.bind(new RegExp("\\/" + sessionKey + "$"))) : keys, intKeys = _.map(filteredKeys, function(string) {
              return parseInt(string, 10);
            });
            return _.isEmpty(intKeys) ? 0 : _.max(intKeys);
          }, nextResourceId = function() {
            const intId = maxIdForSession() + 1;
            return intId + uniqueResourcePostfix;
          }, getExistingResourceId = function() {
            if (!optionalKey && contentAggregate.resources) {
              return _.find(_.keys(contentAggregate.resources), function(key) {
                return contentAggregate.resources[key] === resourceBody;
              });
            }
          }, storeNewResource = function() {
            const id = optionalKey || nextResourceId();
            contentAggregate.resources = contentAggregate.resources || {};
            contentAggregate.resources[id] = resourceBody;
            contentAggregate.dispatchEvent("resourceStored", resourceBody, id, originSession);
            return id;
          };
          return getExistingResourceId() || storeNewResource();
        };
        contentAggregate.getResource = function(id) {
          return contentAggregate.resources && contentAggregate.resources[id];
        };
        contentAggregate.hasSiblings = function(id) {
          const parent = contentAggregate.findParent(id);
          if (contentAggregate.isRootNode(id)) {
            return false;
          }
          return parent && _.size(parent.ideas) > 1;
        };
        contentAggregate.isRootNode = function(id) {
          return isRootNode(id);
        };
        contentAggregate.getDefaultRootId = function() {
          const rootNodes = contentAggregate && _.values(contentAggregate.ideas);
          return rootNodes && rootNodes.length && rootNodes[0].id;
        };
        contentUpgrade(contentAggregate);
        observable(contentAggregate);
        init2(contentAggregate);
        return contentAggregate;
      };
    }
  });

  // vendor/mapjs/src/core/theme/default-theme.js
  var require_default_theme = __commonJS({
    "vendor/mapjs/src/core/theme/default-theme.js"(exports, module) {
      module.exports = {
        "name": "MindMup Default",
        "node": [
          {
            "name": "default",
            "cornerRadius": 10,
            "backgroundColor": "#E0E0E0",
            "border": {
              "type": "surround",
              "line": {
                "color": "#707070",
                "width": 1
              }
            },
            "shadow": [{
              "color": "#070707",
              "opacity": 0.4,
              "offset": {
                "width": 2,
                "height": 2
              },
              "radius": 2
            }],
            "text": {
              "margin": 5,
              "alignment": "center",
              "maxWidth": 146,
              "color": "#4F4F4F",
              "lightColor": "#EEEEEE",
              "darkColor": "#000000",
              "font": {
                "lineSpacing": 2.5,
                "lineSpacingPx": 3.25,
                "size": 9,
                "sizePx": 12,
                "weight": "bold"
              }
            },
            "connections": {
              "default": {
                "h": "center",
                "v": "center"
              },
              "from": {
                "horizontal": {
                  "h": "nearest-inset",
                  "v": "center"
                }
              },
              "to": {
                "h": "nearest",
                "v": "center"
              }
            },
            "decorations": {
              "height": 20,
              "edge": "top",
              "overlap": true,
              "position": "end"
            }
          },
          {
            "name": "level_1",
            "backgroundColor": "#22AAE0"
          },
          {
            "name": "activated",
            "border": {
              "type": "surround",
              "line": {
                "color": "#22AAE0",
                "width": 3,
                "style": "dotted"
              }
            }
          },
          {
            "name": "level_1.activated",
            "border": {
              "type": "surround",
              "line": {
                "color": "#EEEEEE",
                "width": 3,
                "style": "dotted"
              }
            }
          },
          {
            "name": "selected",
            "shadow": [
              {
                "color": "#000000",
                "opacity": 0.9,
                "offset": {
                  "width": 2,
                  "height": 2
                },
                "radius": 2
              }
            ]
          },
          {
            "name": "collapsed",
            "shadow": [
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 1
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 3
                },
                "radius": 0
              },
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 4
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 6
                },
                "radius": 0
              },
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 7
                },
                "radius": 0
              }
            ]
          },
          {
            "name": "collapsed.selected",
            "shadow": [
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 1
                },
                "radius": 0
              },
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 3
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 6
                },
                "radius": 0
              },
              {
                "color": "#555555",
                "offset": {
                  "width": 0,
                  "height": 7
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 10
                },
                "radius": 0
              },
              {
                "color": "#333333",
                "offset": {
                  "width": 0,
                  "height": 11
                },
                "radius": 0
              }
            ]
          }
        ],
        "connector": {
          "default": {
            "type": "quadratic",
            "controlPoint": {
              "above": { "width": 0, "height": 0.75 },
              "below": { "width": 0, "height": 0.75 },
              "horizontal": { "width": 0, "height": 0 }
            },
            "label": {
              "position": {
                "ratio": 0.5
              },
              "backgroundColor": "transparent",
              "borderColor": "transparent",
              "text": {
                "color": "#4F4F4F",
                "font": {
                  "size": 9,
                  "sizePx": 12,
                  "weight": "normal"
                }
              }
            },
            "line": {
              "color": "#707070",
              "width": 1
            }
          }
        },
        "link": {
          "default": {
            "line": {
              "color": "red",
              "lineStyle": "dashed",
              "width": 1
            },
            "label": {
              "position": {
                "ratio": 0.5
              },
              "backgroundColor": "#FFFFFF",
              "borderColor": "#FFFFFF",
              "text": {
                "color": "#4F4F4F",
                "font": {
                  "size": 9,
                  "sizePx": 12,
                  "weight": "normal"
                }
              }
            }
          }
        }
      };
    }
  });

  // vendor/mapjs/src/core/util/deep-freeze.js
  var require_deep_freeze = __commonJS({
    "vendor/mapjs/src/core/util/deep-freeze.js"(exports, module) {
      var requiresRecursion = (toFreeze, prop) => {
        "use strict";
        return (typeof toFreeze[prop] === "object" || typeof toFreeze[prop] === "function") && !Object.isFrozen(toFreeze[prop]);
      };
      var deepFreeze = function(toFreeze) {
        "use strict";
        Object.freeze(toFreeze);
        Object.getOwnPropertyNames(toFreeze).forEach((prop) => {
          if (toFreeze.hasOwnProperty(prop) && toFreeze[prop] !== null && requiresRecursion(toFreeze, prop)) {
            deepFreeze(toFreeze[prop]);
          }
        });
        return toFreeze;
      };
      module.exports = deepFreeze;
    }
  });

  // vendor/mapjs/src/core/theme/theme-fallback-values.js
  var require_theme_fallback_values = __commonJS({
    "vendor/mapjs/src/core/theme/theme-fallback-values.js"(exports, module) {
      var defaultTheme = require_default_theme();
      var deepFreeze = require_deep_freeze();
      var firstNode = defaultTheme.node[0];
      var defaultConnector = defaultTheme.connector.default;
      module.exports = deepFreeze({
        nodeTheme: {
          margin: firstNode.text.margin,
          font: firstNode.text.font,
          maxWidth: firstNode.text.maxWidth,
          backgroundColor: firstNode.backgroundColor,
          borderType: firstNode.border.type,
          cornerRadius: firstNode.cornerRadius,
          lineColor: firstNode.border.line.color,
          lineWidth: firstNode.border.line.width,
          lineStyle: firstNode.border.line.style,
          text: {
            color: firstNode.text.color,
            lightColor: firstNode.text.lightColor,
            darkColor: firstNode.text.darkColor
          }
        },
        connectorControlPoint: {
          horizontal: defaultConnector.controlPoint.horizontal.height,
          default: defaultConnector.controlPoint.above.height
        },
        connectorTheme: {
          type: defaultConnector.type,
          label: defaultConnector.label,
          line: defaultConnector.line
        }
      });
    }
  });

  // vendor/mapjs/src/core/theme/theme-to-dictionary.js
  var require_theme_to_dictionary = __commonJS({
    "vendor/mapjs/src/core/theme/theme-to-dictionary.js"(exports, module) {
      module.exports = function themeToDictionary(themeJson) {
        "use strict";
        const themeDictionary = Object.assign({}, themeJson), nodeArray = themeDictionary.node;
        if (themeDictionary && Array.isArray(themeDictionary.node)) {
          themeDictionary.node = {};
          nodeArray.forEach(function(nodeStyle) {
            themeDictionary.node[nodeStyle.name] = nodeStyle;
          });
        }
        return themeDictionary;
      };
    }
  });

  // vendor/mapjs/src/core/is-object-object.js
  var require_is_object_object = __commonJS({
    "vendor/mapjs/src/core/is-object-object.js"(exports, module) {
      module.exports = function isObjectObject(value) {
        "use strict";
        if (!value) {
          return false;
        }
        const type = typeof value;
        if (type === "object") {
          return Object.prototype.toString.call(value) === "[object Object]";
        }
        return false;
      };
    }
  });

  // vendor/mapjs/src/core/deep-assign.js
  var require_deep_assign = __commonJS({
    "vendor/mapjs/src/core/deep-assign.js"(exports, module) {
      var isObjectObject = require_is_object_object();
      var isNotRecursableObject = (value) => {
        "use strict";
        return !isObjectObject(value);
      };
      module.exports = function deepAssign() {
        "use strict";
        const args = Array.prototype.slice.call(arguments, 0), assignee = args && args[0], assigners = args && args.length > 1 && args.slice(1) || [];
        if (!assignee || args.find(isNotRecursableObject)) {
          throw new Error("invalid-args");
        }
        assigners.forEach((assigner) => {
          Object.keys(assigner).forEach((key) => {
            if (isObjectObject(assigner[key]) && isObjectObject(assignee[key])) {
              assignee[key] = deepAssign({}, assignee[key], assigner[key]);
            } else if (isObjectObject(assigner[key])) {
              assignee[key] = deepAssign({}, assigner[key]);
            } else {
              assignee[key] = assigner[key];
            }
          });
        });
        return assignee;
      };
    }
  });

  // vendor/mapjs/src/core/theme/color-to-rgb.js
  var require_color_to_rgb = __commonJS({
    "vendor/mapjs/src/core/theme/color-to-rgb.js"(exports, module) {
      var _ = require_underscore_umd();
      var regCSSRGB = new RegExp(/^rgba?\(([^,\s]+)[,\s]*([^,\s]+)[,\s]*([^,\s\()]+).*$/);
      var fromCSSRGB = function(colorString) {
        "use strict";
        let matched;
        if (regCSSRGB.test(colorString)) {
          matched = colorString.match(regCSSRGB);
          if (matched.length === 4) {
            return _.map(matched.slice(1), function(i) {
              return parseInt(i);
            });
          }
        }
      };
      var fromHexString = function(colorString) {
        "use strict";
        const match = colorString.toString(16).match(/[a-f0-9]{6}/i);
        let integer, r, g, b;
        if (match) {
          integer = parseInt(match[0], 16);
          r = integer >> 16 & 255;
          g = integer >> 8 & 255;
          b = integer & 255;
          return [r, g, b];
        }
      };
      module.exports = function convertToRGB(colorString) {
        "use strict";
        return fromCSSRGB(colorString) || fromHexString(colorString) || [0, 0, 0];
      };
    }
  });

  // vendor/mapjs/src/core/theme/color-parser.js
  var require_color_parser = __commonJS({
    "vendor/mapjs/src/core/theme/color-parser.js"(exports, module) {
      var convertToRGB = require_color_to_rgb();
      module.exports = function colorParser(colorObj) {
        "use strict";
        if (!colorObj.color || colorObj.opacity === 0) {
          return "transparent";
        }
        if (colorObj.opacity) {
          return "rgba(" + convertToRGB(colorObj.color).join(",") + "," + colorObj.opacity + ")";
        } else {
          return colorObj.color;
        }
      };
    }
  });

  // vendor/mapjs/src/core/theme/theme-attribute-utils.js
  var require_theme_attribute_utils = __commonJS({
    "vendor/mapjs/src/core/theme/theme-attribute-utils.js"(exports, module) {
      var deepAssign = require_deep_assign();
      var colorParser = require_color_parser();
      var isObjectObject = require_is_object_object();
      var themeFallbackValues = require_theme_fallback_values();
      var attributeForPath = function(object, pathArray, fallback) {
        "use strict";
        if (!object || !pathArray || !pathArray.length) {
          return object === void 0 && fallback || object;
        }
        if (pathArray.length === 1) {
          return object[pathArray[0]] === void 0 && fallback || object[pathArray[0]];
        }
        let remaining = pathArray.slice(0), current = object;
        while (remaining.length > 0) {
          current = current[remaining[0]];
          if (current === void 0) {
            return fallback;
          }
          remaining = remaining.slice(1);
        }
        return current;
      };
      var themeAttributeValue = (themeDictionary, prefixes, styles, postfixes, fallback) => {
        "use strict";
        const rootElement = attributeForPath(themeDictionary, prefixes);
        let toAssign = [{}];
        if (!rootElement) {
          return fallback;
        }
        if (styles && styles.length) {
          toAssign = toAssign.concat(styles.slice(0).reverse().map((style) => rootElement[style]).filter((item) => !!item));
        } else if (isObjectObject(rootElement)) {
          toAssign.push(rootElement);
        } else if (!postfixes || !postfixes.length) {
          return rootElement;
        } else {
          return fallback;
        }
        return attributeForPath(deepAssign.apply(deepAssign, toAssign), postfixes, fallback);
      };
      var nodeAttributeToNodeTheme = (nodeAttribute) => {
        "use strict";
        const getBackgroundColor = function() {
          const colorObj = attributeForPath(nodeAttribute, ["background"]);
          if (colorObj) {
            return colorParser(colorObj);
          }
          return attributeForPath(nodeAttribute, ["backgroundColor"]);
        }, result = deepAssign({}, themeFallbackValues.nodeTheme);
        if (nodeAttribute) {
          result.margin = attributeForPath(nodeAttribute, ["text", "margin"], result.margin);
          result.font = deepAssign({}, result.font, attributeForPath(nodeAttribute, ["text", "font"], result.font));
          result.text = deepAssign({}, result.text, attributeForPath(nodeAttribute, ["text"], result.text));
          result.borderType = attributeForPath(nodeAttribute, ["border", "type"], result.borderType);
          result.backgroundColor = getBackgroundColor() || result.backgroundColor;
          result.cornerRadius = attributeForPath(nodeAttribute, ["cornerRadius"], result.cornerRadius);
          result.lineColor = attributeForPath(nodeAttribute, ["border", "line", "color"], result.lineColor);
          result.lineWidth = attributeForPath(nodeAttribute, ["border", "line", "width"], result.lineWidth);
          result.lineStyle = attributeForPath(nodeAttribute, ["border", "line", "style"], result.lineStyle);
        }
        return result;
      };
      var connectorControlPoint = (themeDictionary, childPosition, connectorStyle) => {
        "use strict";
        const controlPointOffset = childPosition === "horizontal" ? themeFallbackValues.connectorControlPoint.horizontal : themeFallbackValues.connectorControlPoint.default, defaultControlPoint = { "width": 0, "height": controlPointOffset }, configuredControlPoint = connectorStyle && attributeForPath(themeDictionary, ["connector", connectorStyle, "controlPoint", childPosition]);
        return configuredControlPoint && Object.assign({}, configuredControlPoint) || defaultControlPoint;
      };
      module.exports = {
        attributeForPath,
        themeAttributeValue,
        nodeAttributeToNodeTheme,
        connectorControlPoint
      };
    }
  });

  // vendor/mapjs/src/core/theme/theme.js
  var require_theme = __commonJS({
    "vendor/mapjs/src/core/theme/theme.js"(exports, module) {
      var AUTO_COLOR = "theme-auto-color";
      var themeFallbackValues = require_theme_fallback_values();
      var themeToDictionary = require_theme_to_dictionary();
      var themeAttributeUtils = require_theme_attribute_utils();
      var defaultTheme = require_default_theme();
      module.exports = function Theme(themeJson) {
        "use strict";
        const self2 = this, themeDictionary = themeToDictionary(themeJson), attributeValue = (prefixes, styles, postfixes, fallback) => themeAttributeUtils.themeAttributeValue(themeDictionary, prefixes, styles, postfixes, fallback);
        self2.getFontForStyles = function(themeStyles) {
          const weight = attributeValue(["node"], themeStyles, ["text", "font", "weight"], "semibold"), size = attributeValue(["node"], themeStyles, ["text", "font", "size"], themeFallbackValues.nodeTheme.font.size), lineSpacing = attributeValue(["node"], themeStyles, ["text", "font", "lineSpacing"], themeFallbackValues.nodeTheme.font.lineSpacing);
          return { size, weight, lineGap: lineSpacing };
        };
        self2.getNodeMargin = function(themeStyles) {
          return attributeValue(["node"], themeStyles, ["text", "margin"], themeFallbackValues.nodeTheme.margin);
        };
        self2.name = themeJson && themeJson.name;
        self2.connectorEditingContext = themeJson && themeJson.connectorEditingContext;
        self2.blockParentConnectorOverride = themeJson && themeJson.blockParentConnectorOverride;
        self2.attributeValue = (prefixes, styles, postfixes, fallback) => attributeValue(prefixes, styles, postfixes, fallback);
        self2.nodeStyles = function(nodeLevel, nodeAttr) {
          const result = ["level_" + nodeLevel, "default"];
          if (nodeAttr && nodeAttr.group) {
            result.unshift("attr_group");
            if (typeof nodeAttr.group === "string" || typeof nodeAttr.group === "number") {
              result.unshift("attr_group_" + nodeAttr.group);
            }
          }
          if (nodeAttr && nodeAttr.styleNames && Array.isArray(nodeAttr.styleNames)) {
            return nodeAttr.styleNames.concat(result);
          }
          return result;
        };
        self2.nodeTheme = function(styles) {
          const nodeAttribute = attributeValue(["node"], styles);
          return themeAttributeUtils.nodeAttributeToNodeTheme(nodeAttribute);
        };
        self2.connectorTheme = function(childPosition, childStyles, parentStyles) {
          const position = childPosition || "horizontal", childConnectorStyle = attributeValue(["node"], childStyles, ["connections", "style"], "default"), parentConnectorStyle = parentStyles && attributeValue(["node"], parentStyles, ["connections", "childstyle"], false), childConnector = themeAttributeUtils.attributeForPath(themeDictionary, ["connector", childConnectorStyle]), parentConnector = parentConnectorStyle && themeAttributeUtils.attributeForPath(themeDictionary, ["connector", parentConnectorStyle]), combinedStyle = parentConnectorStyle && parentConnectorStyle + "." + childConnectorStyle, combinedConnector = combinedStyle && themeAttributeUtils.attributeForPath(themeDictionary, ["connector", combinedStyle]), connectorStyle = combinedConnector && combinedStyle || parentConnector && parentConnectorStyle || childConnectorStyle || "default", controlPoint = themeAttributeUtils.connectorControlPoint(themeDictionary, position, connectorStyle), connectorDefaults = Object.assign({}, themeFallbackValues.connectorTheme), returnedConnector = Object.assign({}, combinedConnector || parentConnector || childConnector || connectorDefaults);
          if (!returnedConnector.label) {
            returnedConnector.label = connectorDefaults.label;
          }
          returnedConnector.controlPoint = controlPoint;
          returnedConnector.line = returnedConnector.line || connectorDefaults.line;
          return returnedConnector;
        };
        self2.linkTheme = function(linkStyle) {
          const fromCurrentTheme = themeAttributeUtils.attributeForPath(themeDictionary, ["link", linkStyle || "default"]), fromDefaultTheme = defaultTheme.link.default;
          return Object.assign({}, fromDefaultTheme, fromCurrentTheme);
        };
        self2.noAnimations = () => !!themeDictionary.noAnimations;
        self2.getLayoutConnectorAttributes = (styles) => {
          const childConnectorStyle = attributeValue(["node"], styles, ["connections", "style"], "default"), connectorDefaults = Object.assign({}, themeFallbackValues.connectorTheme), childConnector = themeAttributeUtils.attributeForPath(themeDictionary, ["connector", childConnectorStyle]) || connectorDefaults, result = {};
          if (childConnector && childConnector.line) {
            result.parentConnector = {
              color: childConnector.line.color
            };
          }
          return result;
        };
        self2.cleanPersistedAttributes = (currentAttribs) => {
          if (currentAttribs && currentAttribs.parentConnector && currentAttribs.parentConnector.themeAutoColor) {
            if (currentAttribs.parentConnector.themeAutoColor === currentAttribs.parentConnector.color) {
              delete currentAttribs.parentConnector.color;
            }
            delete currentAttribs.parentConnector.themeAutoColor;
            if (!currentAttribs || !currentAttribs.parentConnector || !Object.keys(currentAttribs.parentConnector).length) {
              delete currentAttribs.parentConnector;
            }
          }
          return currentAttribs;
        };
        self2.getPersistedAttributes = (currentAttribs, nodeLevel, numberOfSiblings) => {
          const styles = ["level_" + nodeLevel, "default"], getAutoColor = () => {
            const autoColors = themeDictionary.autoColors || [defaultTheme.connector.default.line.color], index = numberOfSiblings % autoColors.length;
            return autoColors[index];
          }, childConnectorStyle = attributeValue(["node"], styles, ["connections", "style"], "default"), connectorDefaults = Object.assign({}, themeFallbackValues.connectorTheme), childConnector = themeAttributeUtils.attributeForPath(themeDictionary, ["connector", childConnectorStyle]) || connectorDefaults, autoColor = getAutoColor(), result = {
            attr: currentAttribs && currentAttribs.parentConnector && { parentConnector: currentAttribs.parentConnector } || {},
            removed: []
          };
          if (childConnector && childConnector.line && childConnector.line.color === AUTO_COLOR) {
            result.attr = Object.assign({
              parentConnector: {
                color: autoColor,
                themeAutoColor: autoColor
              }
            }, result.attr);
          } else if (result.attr.parentConnector && result.attr.parentConnector.themeAutoColor) {
            result.attr.parentConnector = Object.assign({}, result.attr.parentConnector);
            if (result.attr.parentConnector.themeAutoColor === result.attr.parentConnector.color) {
              delete result.attr.parentConnector.color;
            }
            delete result.attr.parentConnector.themeAutoColor;
            if (!result || !result.attr || !result.attr.parentConnector || !Object.keys(result.attr.parentConnector).length) {
              result.removed.push("parentConnector");
              delete result.attr.parentConnector;
            }
          }
          return result;
        };
      };
    }
  });

  // vendor/mapjs/src/core/layout/extract-connectors.js
  var require_extract_connectors = __commonJS({
    "vendor/mapjs/src/core/layout/extract-connectors.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function extractConnectors(aggregate, visibleNodes, theme) {
        "use strict";
        const result = {}, allowParentConnectorOverride = !(theme && (theme.connectorEditingContext || theme.blockParentConnectorOverride)), traverse = function(idea, parentId, isChildNode) {
          if (isChildNode) {
            const visibleNode = visibleNodes[idea.id];
            if (!visibleNode) {
              return;
            }
            if (parentId !== aggregate.id) {
              result[idea.id] = {
                type: "connector",
                from: parentId,
                to: idea.id
              };
              if (visibleNode.attr && visibleNode.attr.parentConnector) {
                if (allowParentConnectorOverride && visibleNode.attr && visibleNode.attr.parentConnector) {
                  result[idea.id].attr = _.clone(visibleNode.attr.parentConnector);
                } else if (theme && theme.connectorEditingContext && theme.connectorEditingContext.allowed && theme.connectorEditingContext.allowed.length) {
                  result[idea.id].connectorEditingContext = theme.connectorEditingContext;
                  result[idea.id].attr = _.pick(visibleNode.attr.parentConnector, theme.connectorEditingContext.allowed);
                }
              }
            }
          }
          if (idea.ideas) {
            Object.keys(idea.ideas).forEach(function(subNodeRank) {
              traverse(idea.ideas[subNodeRank], idea.id, true);
            });
          }
        };
        traverse(aggregate);
        return result;
      };
    }
  });

  // vendor/mapjs/src/core/layout/extract-links.js
  var require_extract_links = __commonJS({
    "vendor/mapjs/src/core/layout/extract-links.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function extractLinks(idea, visibleNodes) {
        "use strict";
        const result = {};
        _.each(idea.links, function(link) {
          if (visibleNodes[link.ideaIdFrom] && visibleNodes[link.ideaIdTo]) {
            result[link.ideaIdFrom + "_" + link.ideaIdTo] = {
              type: "link",
              ideaIdFrom: link.ideaIdFrom,
              ideaIdTo: link.ideaIdTo,
              attr: _.clone(link.attr)
            };
          }
        });
        return result;
      };
    }
  });

  // node_modules/polybooljs/lib/build-log.js
  var require_build_log = __commonJS({
    "node_modules/polybooljs/lib/build-log.js"(exports, module) {
      function BuildLog() {
        var my;
        var nextSegmentId = 0;
        var curVert = false;
        function push(type, data) {
          my.list.push({
            type,
            data: data ? JSON.parse(JSON.stringify(data)) : void 0
          });
          return my;
        }
        my = {
          list: [],
          segmentId: function() {
            return nextSegmentId++;
          },
          checkIntersection: function(seg1, seg2) {
            return push("check", { seg1, seg2 });
          },
          segmentChop: function(seg, end) {
            push("div_seg", { seg, pt: end });
            return push("chop", { seg, pt: end });
          },
          statusRemove: function(seg) {
            return push("pop_seg", { seg });
          },
          segmentUpdate: function(seg) {
            return push("seg_update", { seg });
          },
          segmentNew: function(seg, primary) {
            return push("new_seg", { seg, primary });
          },
          segmentRemove: function(seg) {
            return push("rem_seg", { seg });
          },
          tempStatus: function(seg, above, below) {
            return push("temp_status", { seg, above, below });
          },
          rewind: function(seg) {
            return push("rewind", { seg });
          },
          status: function(seg, above, below) {
            return push("status", { seg, above, below });
          },
          vert: function(x) {
            if (x === curVert)
              return my;
            curVert = x;
            return push("vert", { x });
          },
          log: function(data) {
            if (typeof data !== "string")
              data = JSON.stringify(data, false, "  ");
            return push("log", { txt: data });
          },
          reset: function() {
            return push("reset");
          },
          selected: function(segs) {
            return push("selected", { segs });
          },
          chainStart: function(seg) {
            return push("chain_start", { seg });
          },
          chainRemoveHead: function(index, pt) {
            return push("chain_rem_head", { index, pt });
          },
          chainRemoveTail: function(index, pt) {
            return push("chain_rem_tail", { index, pt });
          },
          chainNew: function(pt1, pt2) {
            return push("chain_new", { pt1, pt2 });
          },
          chainMatch: function(index) {
            return push("chain_match", { index });
          },
          chainClose: function(index) {
            return push("chain_close", { index });
          },
          chainAddHead: function(index, pt) {
            return push("chain_add_head", { index, pt });
          },
          chainAddTail: function(index, pt) {
            return push("chain_add_tail", { index, pt });
          },
          chainConnect: function(index1, index2) {
            return push("chain_con", { index1, index2 });
          },
          chainReverse: function(index) {
            return push("chain_rev", { index });
          },
          chainJoin: function(index1, index2) {
            return push("chain_join", { index1, index2 });
          },
          done: function() {
            return push("done");
          }
        };
        return my;
      }
      module.exports = BuildLog;
    }
  });

  // node_modules/polybooljs/lib/epsilon.js
  var require_epsilon = __commonJS({
    "node_modules/polybooljs/lib/epsilon.js"(exports, module) {
      function Epsilon(eps) {
        if (typeof eps !== "number")
          eps = 1e-10;
        var my = {
          epsilon: function(v) {
            if (typeof v === "number")
              eps = v;
            return eps;
          },
          pointAboveOrOnLine: function(pt, left, right) {
            var Ax = left[0];
            var Ay = left[1];
            var Bx = right[0];
            var By = right[1];
            var Cx = pt[0];
            var Cy = pt[1];
            return (Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax) >= -eps;
          },
          pointBetween: function(p, left, right) {
            var d_py_ly = p[1] - left[1];
            var d_rx_lx = right[0] - left[0];
            var d_px_lx = p[0] - left[0];
            var d_ry_ly = right[1] - left[1];
            var dot = d_px_lx * d_rx_lx + d_py_ly * d_ry_ly;
            if (dot < eps)
              return false;
            var sqlen = d_rx_lx * d_rx_lx + d_ry_ly * d_ry_ly;
            if (dot - sqlen > -eps)
              return false;
            return true;
          },
          pointsSameX: function(p1, p2) {
            return Math.abs(p1[0] - p2[0]) < eps;
          },
          pointsSameY: function(p1, p2) {
            return Math.abs(p1[1] - p2[1]) < eps;
          },
          pointsSame: function(p1, p2) {
            return my.pointsSameX(p1, p2) && my.pointsSameY(p1, p2);
          },
          pointsCompare: function(p1, p2) {
            if (my.pointsSameX(p1, p2))
              return my.pointsSameY(p1, p2) ? 0 : p1[1] < p2[1] ? -1 : 1;
            return p1[0] < p2[0] ? -1 : 1;
          },
          pointsCollinear: function(pt1, pt2, pt3) {
            var dx1 = pt1[0] - pt2[0];
            var dy1 = pt1[1] - pt2[1];
            var dx2 = pt2[0] - pt3[0];
            var dy2 = pt2[1] - pt3[1];
            return Math.abs(dx1 * dy2 - dx2 * dy1) < eps;
          },
          linesIntersect: function(a0, a1, b0, b1) {
            var adx = a1[0] - a0[0];
            var ady = a1[1] - a0[1];
            var bdx = b1[0] - b0[0];
            var bdy = b1[1] - b0[1];
            var axb = adx * bdy - ady * bdx;
            if (Math.abs(axb) < eps)
              return false;
            var dx = a0[0] - b0[0];
            var dy = a0[1] - b0[1];
            var A = (bdx * dy - bdy * dx) / axb;
            var B = (adx * dy - ady * dx) / axb;
            var ret = {
              alongA: 0,
              alongB: 0,
              pt: [
                a0[0] + A * adx,
                a0[1] + A * ady
              ]
            };
            if (A <= -eps)
              ret.alongA = -2;
            else if (A < eps)
              ret.alongA = -1;
            else if (A - 1 <= -eps)
              ret.alongA = 0;
            else if (A - 1 < eps)
              ret.alongA = 1;
            else
              ret.alongA = 2;
            if (B <= -eps)
              ret.alongB = -2;
            else if (B < eps)
              ret.alongB = -1;
            else if (B - 1 <= -eps)
              ret.alongB = 0;
            else if (B - 1 < eps)
              ret.alongB = 1;
            else
              ret.alongB = 2;
            return ret;
          },
          pointInsideRegion: function(pt, region) {
            var x = pt[0];
            var y = pt[1];
            var last_x = region[region.length - 1][0];
            var last_y = region[region.length - 1][1];
            var inside = false;
            for (var i = 0; i < region.length; i++) {
              var curr_x = region[i][0];
              var curr_y = region[i][1];
              if (curr_y - y > eps != last_y - y > eps && (last_x - curr_x) * (y - curr_y) / (last_y - curr_y) + curr_x - x > eps)
                inside = !inside;
              last_x = curr_x;
              last_y = curr_y;
            }
            return inside;
          }
        };
        return my;
      }
      module.exports = Epsilon;
    }
  });

  // node_modules/polybooljs/lib/linked-list.js
  var require_linked_list = __commonJS({
    "node_modules/polybooljs/lib/linked-list.js"(exports, module) {
      var LinkedList = {
        create: function() {
          var my = {
            root: { root: true, next: null },
            exists: function(node) {
              if (node === null || node === my.root)
                return false;
              return true;
            },
            isEmpty: function() {
              return my.root.next === null;
            },
            getHead: function() {
              return my.root.next;
            },
            insertBefore: function(node, check) {
              var last = my.root;
              var here = my.root.next;
              while (here !== null) {
                if (check(here)) {
                  node.prev = here.prev;
                  node.next = here;
                  here.prev.next = node;
                  here.prev = node;
                  return;
                }
                last = here;
                here = here.next;
              }
              last.next = node;
              node.prev = last;
              node.next = null;
            },
            findTransition: function(check) {
              var prev = my.root;
              var here = my.root.next;
              while (here !== null) {
                if (check(here))
                  break;
                prev = here;
                here = here.next;
              }
              return {
                before: prev === my.root ? null : prev,
                after: here,
                insert: function(node) {
                  node.prev = prev;
                  node.next = here;
                  prev.next = node;
                  if (here !== null)
                    here.prev = node;
                  return node;
                }
              };
            }
          };
          return my;
        },
        node: function(data) {
          data.prev = null;
          data.next = null;
          data.remove = function() {
            data.prev.next = data.next;
            if (data.next)
              data.next.prev = data.prev;
            data.prev = null;
            data.next = null;
          };
          return data;
        }
      };
      module.exports = LinkedList;
    }
  });

  // node_modules/polybooljs/lib/intersecter.js
  var require_intersecter = __commonJS({
    "node_modules/polybooljs/lib/intersecter.js"(exports, module) {
      var LinkedList = require_linked_list();
      function Intersecter(selfIntersection, eps, buildLog) {
        function segmentNew(start, end) {
          return {
            id: buildLog ? buildLog.segmentId() : -1,
            start,
            end,
            myFill: {
              above: null,
              // is there fill above us?
              below: null
              // is there fill below us?
            },
            otherFill: null
          };
        }
        function segmentCopy(start, end, seg) {
          return {
            id: buildLog ? buildLog.segmentId() : -1,
            start,
            end,
            myFill: {
              above: seg.myFill.above,
              below: seg.myFill.below
            },
            otherFill: null
          };
        }
        var event_root = LinkedList.create();
        function eventCompare(p1_isStart, p1_1, p1_2, p2_isStart, p2_1, p2_2) {
          var comp = eps.pointsCompare(p1_1, p2_1);
          if (comp !== 0)
            return comp;
          if (eps.pointsSame(p1_2, p2_2))
            return 0;
          if (p1_isStart !== p2_isStart)
            return p1_isStart ? 1 : -1;
          return eps.pointAboveOrOnLine(
            p1_2,
            p2_isStart ? p2_1 : p2_2,
            // order matters
            p2_isStart ? p2_2 : p2_1
          ) ? 1 : -1;
        }
        function eventAdd(ev, other_pt) {
          event_root.insertBefore(ev, function(here) {
            var comp = eventCompare(
              ev.isStart,
              ev.pt,
              other_pt,
              here.isStart,
              here.pt,
              here.other.pt
            );
            return comp < 0;
          });
        }
        function eventAddSegmentStart(seg, primary) {
          var ev_start = LinkedList.node({
            isStart: true,
            pt: seg.start,
            seg,
            primary,
            other: null,
            status: null
          });
          eventAdd(ev_start, seg.end);
          return ev_start;
        }
        function eventAddSegmentEnd(ev_start, seg, primary) {
          var ev_end = LinkedList.node({
            isStart: false,
            pt: seg.end,
            seg,
            primary,
            other: ev_start,
            status: null
          });
          ev_start.other = ev_end;
          eventAdd(ev_end, ev_start.pt);
        }
        function eventAddSegment(seg, primary) {
          var ev_start = eventAddSegmentStart(seg, primary);
          eventAddSegmentEnd(ev_start, seg, primary);
          return ev_start;
        }
        function eventUpdateEnd(ev, end) {
          if (buildLog)
            buildLog.segmentChop(ev.seg, end);
          ev.other.remove();
          ev.seg.end = end;
          ev.other.pt = end;
          eventAdd(ev.other, ev.pt);
        }
        function eventDivide(ev, pt) {
          var ns = segmentCopy(pt, ev.seg.end, ev.seg);
          eventUpdateEnd(ev, pt);
          return eventAddSegment(ns, ev.primary);
        }
        function calculate(primaryPolyInverted, secondaryPolyInverted) {
          var status_root = LinkedList.create();
          function statusCompare(ev1, ev2) {
            var a1 = ev1.seg.start;
            var a2 = ev1.seg.end;
            var b1 = ev2.seg.start;
            var b2 = ev2.seg.end;
            if (eps.pointsCollinear(a1, b1, b2)) {
              if (eps.pointsCollinear(a2, b1, b2))
                return 1;
              return eps.pointAboveOrOnLine(a2, b1, b2) ? 1 : -1;
            }
            return eps.pointAboveOrOnLine(a1, b1, b2) ? 1 : -1;
          }
          function statusFindSurrounding(ev2) {
            return status_root.findTransition(function(here) {
              var comp = statusCompare(ev2, here.ev);
              return comp > 0;
            });
          }
          function checkIntersection(ev1, ev2) {
            var seg1 = ev1.seg;
            var seg2 = ev2.seg;
            var a1 = seg1.start;
            var a2 = seg1.end;
            var b1 = seg2.start;
            var b2 = seg2.end;
            if (buildLog)
              buildLog.checkIntersection(seg1, seg2);
            var i = eps.linesIntersect(a1, a2, b1, b2);
            if (i === false) {
              if (!eps.pointsCollinear(a1, a2, b1))
                return false;
              if (eps.pointsSame(a1, b2) || eps.pointsSame(a2, b1))
                return false;
              var a1_equ_b1 = eps.pointsSame(a1, b1);
              var a2_equ_b2 = eps.pointsSame(a2, b2);
              if (a1_equ_b1 && a2_equ_b2)
                return ev2;
              var a1_between = !a1_equ_b1 && eps.pointBetween(a1, b1, b2);
              var a2_between = !a2_equ_b2 && eps.pointBetween(a2, b1, b2);
              if (a1_equ_b1) {
                if (a2_between) {
                  eventDivide(ev2, a2);
                } else {
                  eventDivide(ev1, b2);
                }
                return ev2;
              } else if (a1_between) {
                if (!a2_equ_b2) {
                  if (a2_between) {
                    eventDivide(ev2, a2);
                  } else {
                    eventDivide(ev1, b2);
                  }
                }
                eventDivide(ev2, a1);
              }
            } else {
              if (i.alongA === 0) {
                if (i.alongB === -1)
                  eventDivide(ev1, b1);
                else if (i.alongB === 0)
                  eventDivide(ev1, i.pt);
                else if (i.alongB === 1)
                  eventDivide(ev1, b2);
              }
              if (i.alongB === 0) {
                if (i.alongA === -1)
                  eventDivide(ev2, a1);
                else if (i.alongA === 0)
                  eventDivide(ev2, i.pt);
                else if (i.alongA === 1)
                  eventDivide(ev2, a2);
              }
            }
            return false;
          }
          var segments = [];
          while (!event_root.isEmpty()) {
            var ev = event_root.getHead();
            if (buildLog)
              buildLog.vert(ev.pt[0]);
            if (ev.isStart) {
              let checkBothIntersections2 = function() {
                if (above) {
                  var eve2 = checkIntersection(ev, above);
                  if (eve2)
                    return eve2;
                }
                if (below)
                  return checkIntersection(ev, below);
                return false;
              };
              var checkBothIntersections = checkBothIntersections2;
              if (buildLog)
                buildLog.segmentNew(ev.seg, ev.primary);
              var surrounding = statusFindSurrounding(ev);
              var above = surrounding.before ? surrounding.before.ev : null;
              var below = surrounding.after ? surrounding.after.ev : null;
              if (buildLog) {
                buildLog.tempStatus(
                  ev.seg,
                  above ? above.seg : false,
                  below ? below.seg : false
                );
              }
              var eve = checkBothIntersections2();
              if (eve) {
                if (selfIntersection) {
                  var toggle;
                  if (ev.seg.myFill.below === null)
                    toggle = true;
                  else
                    toggle = ev.seg.myFill.above !== ev.seg.myFill.below;
                  if (toggle)
                    eve.seg.myFill.above = !eve.seg.myFill.above;
                } else {
                  eve.seg.otherFill = ev.seg.myFill;
                }
                if (buildLog)
                  buildLog.segmentUpdate(eve.seg);
                ev.other.remove();
                ev.remove();
              }
              if (event_root.getHead() !== ev) {
                if (buildLog)
                  buildLog.rewind(ev.seg);
                continue;
              }
              if (selfIntersection) {
                var toggle;
                if (ev.seg.myFill.below === null)
                  toggle = true;
                else
                  toggle = ev.seg.myFill.above !== ev.seg.myFill.below;
                if (!below) {
                  ev.seg.myFill.below = primaryPolyInverted;
                } else {
                  ev.seg.myFill.below = below.seg.myFill.above;
                }
                if (toggle)
                  ev.seg.myFill.above = !ev.seg.myFill.below;
                else
                  ev.seg.myFill.above = ev.seg.myFill.below;
              } else {
                if (ev.seg.otherFill === null) {
                  var inside;
                  if (!below) {
                    inside = ev.primary ? secondaryPolyInverted : primaryPolyInverted;
                  } else {
                    if (ev.primary === below.primary)
                      inside = below.seg.otherFill.above;
                    else
                      inside = below.seg.myFill.above;
                  }
                  ev.seg.otherFill = {
                    above: inside,
                    below: inside
                  };
                }
              }
              if (buildLog) {
                buildLog.status(
                  ev.seg,
                  above ? above.seg : false,
                  below ? below.seg : false
                );
              }
              ev.other.status = surrounding.insert(LinkedList.node({ ev }));
            } else {
              var st = ev.status;
              if (st === null) {
                throw new Error("PolyBool: Zero-length segment detected; your epsilon is probably too small or too large");
              }
              if (status_root.exists(st.prev) && status_root.exists(st.next))
                checkIntersection(st.prev.ev, st.next.ev);
              if (buildLog)
                buildLog.statusRemove(st.ev.seg);
              st.remove();
              if (!ev.primary) {
                var s = ev.seg.myFill;
                ev.seg.myFill = ev.seg.otherFill;
                ev.seg.otherFill = s;
              }
              segments.push(ev.seg);
            }
            event_root.getHead().remove();
          }
          if (buildLog)
            buildLog.done();
          return segments;
        }
        if (!selfIntersection) {
          return {
            calculate: function(segments1, inverted1, segments2, inverted2) {
              segments1.forEach(function(seg) {
                eventAddSegment(segmentCopy(seg.start, seg.end, seg), true);
              });
              segments2.forEach(function(seg) {
                eventAddSegment(segmentCopy(seg.start, seg.end, seg), false);
              });
              return calculate(inverted1, inverted2);
            }
          };
        }
        return {
          addRegion: function(region) {
            var pt1;
            var pt2 = region[region.length - 1];
            for (var i = 0; i < region.length; i++) {
              pt1 = pt2;
              pt2 = region[i];
              var forward = eps.pointsCompare(pt1, pt2);
              if (forward === 0)
                continue;
              eventAddSegment(
                segmentNew(
                  forward < 0 ? pt1 : pt2,
                  forward < 0 ? pt2 : pt1
                ),
                true
              );
            }
          },
          calculate: function(inverted) {
            return calculate(inverted, false);
          }
        };
      }
      module.exports = Intersecter;
    }
  });

  // node_modules/polybooljs/lib/segment-chainer.js
  var require_segment_chainer = __commonJS({
    "node_modules/polybooljs/lib/segment-chainer.js"(exports, module) {
      function SegmentChainer(segments, eps, buildLog) {
        var chains = [];
        var regions = [];
        segments.forEach(function(seg) {
          var pt1 = seg.start;
          var pt2 = seg.end;
          if (eps.pointsSame(pt1, pt2)) {
            console.warn("PolyBool: Warning: Zero-length segment detected; your epsilon is probably too small or too large");
            return;
          }
          if (buildLog)
            buildLog.chainStart(seg);
          var first_match = {
            index: 0,
            matches_head: false,
            matches_pt1: false
          };
          var second_match = {
            index: 0,
            matches_head: false,
            matches_pt1: false
          };
          var next_match = first_match;
          function setMatch(index2, matches_head, matches_pt1) {
            next_match.index = index2;
            next_match.matches_head = matches_head;
            next_match.matches_pt1 = matches_pt1;
            if (next_match === first_match) {
              next_match = second_match;
              return false;
            }
            next_match = null;
            return true;
          }
          for (var i = 0; i < chains.length; i++) {
            var chain = chains[i];
            var head = chain[0];
            var head2 = chain[1];
            var tail = chain[chain.length - 1];
            var tail2 = chain[chain.length - 2];
            if (eps.pointsSame(head, pt1)) {
              if (setMatch(i, true, true))
                break;
            } else if (eps.pointsSame(head, pt2)) {
              if (setMatch(i, true, false))
                break;
            } else if (eps.pointsSame(tail, pt1)) {
              if (setMatch(i, false, true))
                break;
            } else if (eps.pointsSame(tail, pt2)) {
              if (setMatch(i, false, false))
                break;
            }
          }
          if (next_match === first_match) {
            chains.push([pt1, pt2]);
            if (buildLog)
              buildLog.chainNew(pt1, pt2);
            return;
          }
          if (next_match === second_match) {
            if (buildLog)
              buildLog.chainMatch(first_match.index);
            var index = first_match.index;
            var pt = first_match.matches_pt1 ? pt2 : pt1;
            var addToHead = first_match.matches_head;
            var chain = chains[index];
            var grow = addToHead ? chain[0] : chain[chain.length - 1];
            var grow2 = addToHead ? chain[1] : chain[chain.length - 2];
            var oppo = addToHead ? chain[chain.length - 1] : chain[0];
            var oppo2 = addToHead ? chain[chain.length - 2] : chain[1];
            if (eps.pointsCollinear(grow2, grow, pt)) {
              if (addToHead) {
                if (buildLog)
                  buildLog.chainRemoveHead(first_match.index, pt);
                chain.shift();
              } else {
                if (buildLog)
                  buildLog.chainRemoveTail(first_match.index, pt);
                chain.pop();
              }
              grow = grow2;
            }
            if (eps.pointsSame(oppo, pt)) {
              chains.splice(index, 1);
              if (eps.pointsCollinear(oppo2, oppo, grow)) {
                if (addToHead) {
                  if (buildLog)
                    buildLog.chainRemoveTail(first_match.index, grow);
                  chain.pop();
                } else {
                  if (buildLog)
                    buildLog.chainRemoveHead(first_match.index, grow);
                  chain.shift();
                }
              }
              if (buildLog)
                buildLog.chainClose(first_match.index);
              regions.push(chain);
              return;
            }
            if (addToHead) {
              if (buildLog)
                buildLog.chainAddHead(first_match.index, pt);
              chain.unshift(pt);
            } else {
              if (buildLog)
                buildLog.chainAddTail(first_match.index, pt);
              chain.push(pt);
            }
            return;
          }
          function reverseChain(index2) {
            if (buildLog)
              buildLog.chainReverse(index2);
            chains[index2].reverse();
          }
          function appendChain(index1, index2) {
            var chain1 = chains[index1];
            var chain2 = chains[index2];
            var tail3 = chain1[chain1.length - 1];
            var tail22 = chain1[chain1.length - 2];
            var head3 = chain2[0];
            var head22 = chain2[1];
            if (eps.pointsCollinear(tail22, tail3, head3)) {
              if (buildLog)
                buildLog.chainRemoveTail(index1, tail3);
              chain1.pop();
              tail3 = tail22;
            }
            if (eps.pointsCollinear(tail3, head3, head22)) {
              if (buildLog)
                buildLog.chainRemoveHead(index2, head3);
              chain2.shift();
            }
            if (buildLog)
              buildLog.chainJoin(index1, index2);
            chains[index1] = chain1.concat(chain2);
            chains.splice(index2, 1);
          }
          var F = first_match.index;
          var S = second_match.index;
          if (buildLog)
            buildLog.chainConnect(F, S);
          var reverseF = chains[F].length < chains[S].length;
          if (first_match.matches_head) {
            if (second_match.matches_head) {
              if (reverseF) {
                reverseChain(F);
                appendChain(F, S);
              } else {
                reverseChain(S);
                appendChain(S, F);
              }
            } else {
              appendChain(S, F);
            }
          } else {
            if (second_match.matches_head) {
              appendChain(F, S);
            } else {
              if (reverseF) {
                reverseChain(F);
                appendChain(S, F);
              } else {
                reverseChain(S);
                appendChain(F, S);
              }
            }
          }
        });
        return regions;
      }
      module.exports = SegmentChainer;
    }
  });

  // node_modules/polybooljs/lib/segment-selector.js
  var require_segment_selector = __commonJS({
    "node_modules/polybooljs/lib/segment-selector.js"(exports, module) {
      function select(segments, selection, buildLog) {
        var result = [];
        segments.forEach(function(seg) {
          var index = (seg.myFill.above ? 8 : 0) + (seg.myFill.below ? 4 : 0) + (seg.otherFill && seg.otherFill.above ? 2 : 0) + (seg.otherFill && seg.otherFill.below ? 1 : 0);
          if (selection[index] !== 0) {
            result.push({
              id: buildLog ? buildLog.segmentId() : -1,
              start: seg.start,
              end: seg.end,
              myFill: {
                above: selection[index] === 1,
                // 1 if filled above
                below: selection[index] === 2
                // 2 if filled below
              },
              otherFill: null
            });
          }
        });
        if (buildLog)
          buildLog.selected(result);
        return result;
      }
      var SegmentSelector = {
        union: function(segments, buildLog) {
          return select(segments, [
            0,
            2,
            1,
            0,
            2,
            2,
            0,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            0
          ], buildLog);
        },
        intersect: function(segments, buildLog) {
          return select(segments, [
            0,
            0,
            0,
            0,
            0,
            2,
            0,
            2,
            0,
            0,
            1,
            1,
            0,
            2,
            1,
            0
          ], buildLog);
        },
        difference: function(segments, buildLog) {
          return select(segments, [
            0,
            0,
            0,
            0,
            2,
            0,
            2,
            0,
            1,
            1,
            0,
            0,
            0,
            1,
            2,
            0
          ], buildLog);
        },
        differenceRev: function(segments, buildLog) {
          return select(segments, [
            0,
            2,
            1,
            0,
            0,
            0,
            1,
            1,
            0,
            2,
            0,
            2,
            0,
            0,
            0,
            0
          ], buildLog);
        },
        xor: function(segments, buildLog) {
          return select(segments, [
            0,
            2,
            1,
            0,
            2,
            0,
            0,
            1,
            1,
            0,
            0,
            2,
            0,
            1,
            2,
            0
          ], buildLog);
        }
      };
      module.exports = SegmentSelector;
    }
  });

  // node_modules/polybooljs/lib/geojson.js
  var require_geojson = __commonJS({
    "node_modules/polybooljs/lib/geojson.js"(exports, module) {
      var GeoJSON = {
        // convert a GeoJSON object to a PolyBool polygon
        toPolygon: function(PolyBool, geojson) {
          function GeoPoly(coords) {
            if (coords.length <= 0)
              return PolyBool.segments({ inverted: false, regions: [] });
            function LineString(ls) {
              var reg = ls.slice(0, ls.length - 1);
              return PolyBool.segments({ inverted: false, regions: [reg] });
            }
            var out2 = LineString(coords[0]);
            for (var i2 = 1; i2 < coords.length; i2++)
              out2 = PolyBool.selectDifference(PolyBool.combine(out2, LineString(coords[i2])));
            return out2;
          }
          if (geojson.type === "Polygon") {
            return PolyBool.polygon(GeoPoly(geojson.coordinates));
          } else if (geojson.type === "MultiPolygon") {
            var out = PolyBool.segments({ inverted: false, regions: [] });
            for (var i = 0; i < geojson.coordinates.length; i++)
              out = PolyBool.selectUnion(PolyBool.combine(out, GeoPoly(geojson.coordinates[i])));
            return PolyBool.polygon(out);
          }
          throw new Error("PolyBool: Cannot convert GeoJSON object to PolyBool polygon");
        },
        // convert a PolyBool polygon to a GeoJSON object
        fromPolygon: function(PolyBool, eps, poly) {
          poly = PolyBool.polygon(PolyBool.segments(poly));
          function regionInsideRegion(r1, r2) {
            return eps.pointInsideRegion([
              (r1[0][0] + r1[1][0]) * 0.5,
              (r1[0][1] + r1[1][1]) * 0.5
            ], r2);
          }
          function newNode(region2) {
            return {
              region: region2,
              children: []
            };
          }
          var roots = newNode(null);
          function addChild(root, region2) {
            for (var i2 = 0; i2 < root.children.length; i2++) {
              var child = root.children[i2];
              if (regionInsideRegion(region2, child.region)) {
                addChild(child, region2);
                return;
              }
            }
            var node = newNode(region2);
            for (var i2 = 0; i2 < root.children.length; i2++) {
              var child = root.children[i2];
              if (regionInsideRegion(child.region, region2)) {
                node.children.push(child);
                root.children.splice(i2, 1);
                i2--;
              }
            }
            root.children.push(node);
          }
          for (var i = 0; i < poly.regions.length; i++) {
            var region = poly.regions[i];
            if (region.length < 3)
              continue;
            addChild(roots, region);
          }
          function forceWinding(region2, clockwise) {
            var winding = 0;
            var last_x = region2[region2.length - 1][0];
            var last_y = region2[region2.length - 1][1];
            var copy = [];
            for (var i2 = 0; i2 < region2.length; i2++) {
              var curr_x = region2[i2][0];
              var curr_y = region2[i2][1];
              copy.push([curr_x, curr_y]);
              winding += curr_y * last_x - curr_x * last_y;
              last_x = curr_x;
              last_y = curr_y;
            }
            var isclockwise = winding < 0;
            if (isclockwise !== clockwise)
              copy.reverse();
            copy.push([copy[0][0], copy[0][1]]);
            return copy;
          }
          var geopolys = [];
          function addExterior(node) {
            var poly2 = [forceWinding(node.region, false)];
            geopolys.push(poly2);
            for (var i2 = 0; i2 < node.children.length; i2++)
              poly2.push(getInterior(node.children[i2]));
          }
          function getInterior(node) {
            for (var i2 = 0; i2 < node.children.length; i2++)
              addExterior(node.children[i2]);
            return forceWinding(node.region, true);
          }
          for (var i = 0; i < roots.children.length; i++)
            addExterior(roots.children[i]);
          if (geopolys.length <= 0)
            return { type: "Polygon", coordinates: [] };
          if (geopolys.length == 1)
            return { type: "Polygon", coordinates: geopolys[0] };
          return {
            // otherwise, use a GeoJSON MultiPolygon
            type: "MultiPolygon",
            coordinates: geopolys
          };
        }
      };
      module.exports = GeoJSON;
    }
  });

  // node_modules/polybooljs/index.js
  var require_polybooljs = __commonJS({
    "node_modules/polybooljs/index.js"(exports, module) {
      var BuildLog = require_build_log();
      var Epsilon = require_epsilon();
      var Intersecter = require_intersecter();
      var SegmentChainer = require_segment_chainer();
      var SegmentSelector = require_segment_selector();
      var GeoJSON = require_geojson();
      var buildLog = false;
      var epsilon = Epsilon();
      var PolyBool;
      PolyBool = {
        // getter/setter for buildLog
        buildLog: function(bl) {
          if (bl === true)
            buildLog = BuildLog();
          else if (bl === false)
            buildLog = false;
          return buildLog === false ? false : buildLog.list;
        },
        // getter/setter for epsilon
        epsilon: function(v) {
          return epsilon.epsilon(v);
        },
        // core API
        segments: function(poly) {
          var i = Intersecter(true, epsilon, buildLog);
          poly.regions.forEach(i.addRegion);
          return {
            segments: i.calculate(poly.inverted),
            inverted: poly.inverted
          };
        },
        combine: function(segments1, segments2) {
          var i3 = Intersecter(false, epsilon, buildLog);
          return {
            combined: i3.calculate(
              segments1.segments,
              segments1.inverted,
              segments2.segments,
              segments2.inverted
            ),
            inverted1: segments1.inverted,
            inverted2: segments2.inverted
          };
        },
        selectUnion: function(combined) {
          return {
            segments: SegmentSelector.union(combined.combined, buildLog),
            inverted: combined.inverted1 || combined.inverted2
          };
        },
        selectIntersect: function(combined) {
          return {
            segments: SegmentSelector.intersect(combined.combined, buildLog),
            inverted: combined.inverted1 && combined.inverted2
          };
        },
        selectDifference: function(combined) {
          return {
            segments: SegmentSelector.difference(combined.combined, buildLog),
            inverted: combined.inverted1 && !combined.inverted2
          };
        },
        selectDifferenceRev: function(combined) {
          return {
            segments: SegmentSelector.differenceRev(combined.combined, buildLog),
            inverted: !combined.inverted1 && combined.inverted2
          };
        },
        selectXor: function(combined) {
          return {
            segments: SegmentSelector.xor(combined.combined, buildLog),
            inverted: combined.inverted1 !== combined.inverted2
          };
        },
        polygon: function(segments) {
          return {
            regions: SegmentChainer(segments.segments, epsilon, buildLog),
            inverted: segments.inverted
          };
        },
        // GeoJSON converters
        polygonFromGeoJSON: function(geojson) {
          return GeoJSON.toPolygon(PolyBool, geojson);
        },
        polygonToGeoJSON: function(poly) {
          return GeoJSON.fromPolygon(PolyBool, epsilon, poly);
        },
        // helper functions for common operations
        union: function(poly1, poly2) {
          return operate(poly1, poly2, PolyBool.selectUnion);
        },
        intersect: function(poly1, poly2) {
          return operate(poly1, poly2, PolyBool.selectIntersect);
        },
        difference: function(poly1, poly2) {
          return operate(poly1, poly2, PolyBool.selectDifference);
        },
        differenceRev: function(poly1, poly2) {
          return operate(poly1, poly2, PolyBool.selectDifferenceRev);
        },
        xor: function(poly1, poly2) {
          return operate(poly1, poly2, PolyBool.selectXor);
        }
      };
      function operate(poly1, poly2, selector) {
        var seg1 = PolyBool.segments(poly1);
        var seg2 = PolyBool.segments(poly2);
        var comb = PolyBool.combine(seg1, seg2);
        var seg3 = selector(comb);
        return PolyBool.polygon(seg3);
      }
      if (typeof window === "object")
        window.PolyBool = PolyBool;
      module.exports = PolyBool;
    }
  });

  // node_modules/two-product/two-product.js
  var require_two_product = __commonJS({
    "node_modules/two-product/two-product.js"(exports, module) {
      "use strict";
      module.exports = twoProduct;
      var SPLITTER = +(Math.pow(2, 27) + 1);
      function twoProduct(a, b, result) {
        var x = a * b;
        var c = SPLITTER * a;
        var abig = c - a;
        var ahi = c - abig;
        var alo = a - ahi;
        var d = SPLITTER * b;
        var bbig = d - b;
        var bhi = d - bbig;
        var blo = b - bhi;
        var err1 = x - ahi * bhi;
        var err2 = err1 - alo * bhi;
        var err3 = err2 - ahi * blo;
        var y = alo * blo - err3;
        if (result) {
          result[0] = y;
          result[1] = x;
          return result;
        }
        return [y, x];
      }
    }
  });

  // node_modules/robust-sum/robust-sum.js
  var require_robust_sum = __commonJS({
    "node_modules/robust-sum/robust-sum.js"(exports, module) {
      "use strict";
      module.exports = linearExpansionSum;
      function scalarScalar(a, b) {
        var x = a + b;
        var bv = x - a;
        var av = x - bv;
        var br = b - bv;
        var ar = a - av;
        var y = ar + br;
        if (y) {
          return [y, x];
        }
        return [x];
      }
      function linearExpansionSum(e, f) {
        var ne = e.length | 0;
        var nf = f.length | 0;
        if (ne === 1 && nf === 1) {
          return scalarScalar(e[0], f[0]);
        }
        var n = ne + nf;
        var g = new Array(n);
        var count = 0;
        var eptr = 0;
        var fptr = 0;
        var abs = Math.abs;
        var ei = e[eptr];
        var ea = abs(ei);
        var fi = f[fptr];
        var fa = abs(fi);
        var a, b;
        if (ea < fa) {
          b = ei;
          eptr += 1;
          if (eptr < ne) {
            ei = e[eptr];
            ea = abs(ei);
          }
        } else {
          b = fi;
          fptr += 1;
          if (fptr < nf) {
            fi = f[fptr];
            fa = abs(fi);
          }
        }
        if (eptr < ne && ea < fa || fptr >= nf) {
          a = ei;
          eptr += 1;
          if (eptr < ne) {
            ei = e[eptr];
            ea = abs(ei);
          }
        } else {
          a = fi;
          fptr += 1;
          if (fptr < nf) {
            fi = f[fptr];
            fa = abs(fi);
          }
        }
        var x = a + b;
        var bv = x - a;
        var y = b - bv;
        var q0 = y;
        var q1 = x;
        var _x, _bv, _av, _br, _ar;
        while (eptr < ne && fptr < nf) {
          if (ea < fa) {
            a = ei;
            eptr += 1;
            if (eptr < ne) {
              ei = e[eptr];
              ea = abs(ei);
            }
          } else {
            a = fi;
            fptr += 1;
            if (fptr < nf) {
              fi = f[fptr];
              fa = abs(fi);
            }
          }
          b = q0;
          x = a + b;
          bv = x - a;
          y = b - bv;
          if (y) {
            g[count++] = y;
          }
          _x = q1 + x;
          _bv = _x - q1;
          _av = _x - _bv;
          _br = x - _bv;
          _ar = q1 - _av;
          q0 = _ar + _br;
          q1 = _x;
        }
        while (eptr < ne) {
          a = ei;
          b = q0;
          x = a + b;
          bv = x - a;
          y = b - bv;
          if (y) {
            g[count++] = y;
          }
          _x = q1 + x;
          _bv = _x - q1;
          _av = _x - _bv;
          _br = x - _bv;
          _ar = q1 - _av;
          q0 = _ar + _br;
          q1 = _x;
          eptr += 1;
          if (eptr < ne) {
            ei = e[eptr];
          }
        }
        while (fptr < nf) {
          a = fi;
          b = q0;
          x = a + b;
          bv = x - a;
          y = b - bv;
          if (y) {
            g[count++] = y;
          }
          _x = q1 + x;
          _bv = _x - q1;
          _av = _x - _bv;
          _br = x - _bv;
          _ar = q1 - _av;
          q0 = _ar + _br;
          q1 = _x;
          fptr += 1;
          if (fptr < nf) {
            fi = f[fptr];
          }
        }
        if (q0) {
          g[count++] = q0;
        }
        if (q1) {
          g[count++] = q1;
        }
        if (!count) {
          g[count++] = 0;
        }
        g.length = count;
        return g;
      }
    }
  });

  // node_modules/two-sum/two-sum.js
  var require_two_sum = __commonJS({
    "node_modules/two-sum/two-sum.js"(exports, module) {
      "use strict";
      module.exports = fastTwoSum;
      function fastTwoSum(a, b, result) {
        var x = a + b;
        var bv = x - a;
        var av = x - bv;
        var br = b - bv;
        var ar = a - av;
        if (result) {
          result[0] = ar + br;
          result[1] = x;
          return result;
        }
        return [ar + br, x];
      }
    }
  });

  // node_modules/robust-scale/robust-scale.js
  var require_robust_scale = __commonJS({
    "node_modules/robust-scale/robust-scale.js"(exports, module) {
      "use strict";
      var twoProduct = require_two_product();
      var twoSum = require_two_sum();
      module.exports = scaleLinearExpansion;
      function scaleLinearExpansion(e, scale) {
        var n = e.length;
        if (n === 1) {
          var ts = twoProduct(e[0], scale);
          if (ts[0]) {
            return ts;
          }
          return [ts[1]];
        }
        var g = new Array(2 * n);
        var q = [0.1, 0.1];
        var t = [0.1, 0.1];
        var count = 0;
        twoProduct(e[0], scale, q);
        if (q[0]) {
          g[count++] = q[0];
        }
        for (var i = 1; i < n; ++i) {
          twoProduct(e[i], scale, t);
          var pq = q[1];
          twoSum(pq, t[0], q);
          if (q[0]) {
            g[count++] = q[0];
          }
          var a = t[1];
          var b = q[1];
          var x = a + b;
          var bv = x - a;
          var y = b - bv;
          q[1] = x;
          if (y) {
            g[count++] = y;
          }
        }
        if (q[1]) {
          g[count++] = q[1];
        }
        if (count === 0) {
          g[count++] = 0;
        }
        g.length = count;
        return g;
      }
    }
  });

  // node_modules/robust-subtract/robust-diff.js
  var require_robust_diff = __commonJS({
    "node_modules/robust-subtract/robust-diff.js"(exports, module) {
      "use strict";
      module.exports = robustSubtract;
      function scalarScalar(a, b) {
        var x = a + b;
        var bv = x - a;
        var av = x - bv;
        var br = b - bv;
        var ar = a - av;
        var y = ar + br;
        if (y) {
          return [y, x];
        }
        return [x];
      }
      function robustSubtract(e, f) {
        var ne = e.length | 0;
        var nf = f.length | 0;
        if (ne === 1 && nf === 1) {
          return scalarScalar(e[0], -f[0]);
        }
        var n = ne + nf;
        var g = new Array(n);
        var count = 0;
        var eptr = 0;
        var fptr = 0;
        var abs = Math.abs;
        var ei = e[eptr];
        var ea = abs(ei);
        var fi = -f[fptr];
        var fa = abs(fi);
        var a, b;
        if (ea < fa) {
          b = ei;
          eptr += 1;
          if (eptr < ne) {
            ei = e[eptr];
            ea = abs(ei);
          }
        } else {
          b = fi;
          fptr += 1;
          if (fptr < nf) {
            fi = -f[fptr];
            fa = abs(fi);
          }
        }
        if (eptr < ne && ea < fa || fptr >= nf) {
          a = ei;
          eptr += 1;
          if (eptr < ne) {
            ei = e[eptr];
            ea = abs(ei);
          }
        } else {
          a = fi;
          fptr += 1;
          if (fptr < nf) {
            fi = -f[fptr];
            fa = abs(fi);
          }
        }
        var x = a + b;
        var bv = x - a;
        var y = b - bv;
        var q0 = y;
        var q1 = x;
        var _x, _bv, _av, _br, _ar;
        while (eptr < ne && fptr < nf) {
          if (ea < fa) {
            a = ei;
            eptr += 1;
            if (eptr < ne) {
              ei = e[eptr];
              ea = abs(ei);
            }
          } else {
            a = fi;
            fptr += 1;
            if (fptr < nf) {
              fi = -f[fptr];
              fa = abs(fi);
            }
          }
          b = q0;
          x = a + b;
          bv = x - a;
          y = b - bv;
          if (y) {
            g[count++] = y;
          }
          _x = q1 + x;
          _bv = _x - q1;
          _av = _x - _bv;
          _br = x - _bv;
          _ar = q1 - _av;
          q0 = _ar + _br;
          q1 = _x;
        }
        while (eptr < ne) {
          a = ei;
          b = q0;
          x = a + b;
          bv = x - a;
          y = b - bv;
          if (y) {
            g[count++] = y;
          }
          _x = q1 + x;
          _bv = _x - q1;
          _av = _x - _bv;
          _br = x - _bv;
          _ar = q1 - _av;
          q0 = _ar + _br;
          q1 = _x;
          eptr += 1;
          if (eptr < ne) {
            ei = e[eptr];
          }
        }
        while (fptr < nf) {
          a = fi;
          b = q0;
          x = a + b;
          bv = x - a;
          y = b - bv;
          if (y) {
            g[count++] = y;
          }
          _x = q1 + x;
          _bv = _x - q1;
          _av = _x - _bv;
          _br = x - _bv;
          _ar = q1 - _av;
          q0 = _ar + _br;
          q1 = _x;
          fptr += 1;
          if (fptr < nf) {
            fi = -f[fptr];
          }
        }
        if (q0) {
          g[count++] = q0;
        }
        if (q1) {
          g[count++] = q1;
        }
        if (!count) {
          g[count++] = 0;
        }
        g.length = count;
        return g;
      }
    }
  });

  // node_modules/robust-orientation/orientation.js
  var require_orientation = __commonJS({
    "node_modules/robust-orientation/orientation.js"(exports, module) {
      "use strict";
      var twoProduct = require_two_product();
      var robustSum = require_robust_sum();
      var robustScale = require_robust_scale();
      var robustSubtract = require_robust_diff();
      var NUM_EXPAND = 5;
      var EPSILON = 11102230246251565e-32;
      var ERRBOUND3 = (3 + 16 * EPSILON) * EPSILON;
      var ERRBOUND4 = (7 + 56 * EPSILON) * EPSILON;
      function orientation_3(sum, prod, scale, sub) {
        return function orientation3Exact2(m0, m1, m2) {
          var p = sum(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])));
          var n = sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0]));
          var d = sub(p, n);
          return d[d.length - 1];
        };
      }
      function orientation_4(sum, prod, scale, sub) {
        return function orientation4Exact2(m0, m1, m2, m3) {
          var p = sum(sum(scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m1[2]), sum(scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), -m2[2]), scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m3[2]))), sum(scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m3[2]))));
          var n = sum(sum(scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m0[2]), sum(scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), -m2[2]), scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), m3[2]))), sum(scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m2[2]))));
          var d = sub(p, n);
          return d[d.length - 1];
        };
      }
      function orientation_5(sum, prod, scale, sub) {
        return function orientation5Exact(m0, m1, m2, m3, m4) {
          var p = sum(sum(sum(scale(sum(scale(sum(prod(m3[1], m4[0]), prod(-m4[1], m3[0])), m2[2]), sum(scale(sum(prod(m2[1], m4[0]), prod(-m4[1], m2[0])), -m3[2]), scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m4[2]))), m1[3]), sum(scale(sum(scale(sum(prod(m3[1], m4[0]), prod(-m4[1], m3[0])), m1[2]), sum(scale(sum(prod(m1[1], m4[0]), prod(-m4[1], m1[0])), -m3[2]), scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), m4[2]))), -m2[3]), scale(sum(scale(sum(prod(m2[1], m4[0]), prod(-m4[1], m2[0])), m1[2]), sum(scale(sum(prod(m1[1], m4[0]), prod(-m4[1], m1[0])), -m2[2]), scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m4[2]))), m3[3]))), sum(scale(sum(scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m1[2]), sum(scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), -m2[2]), scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m3[2]))), -m4[3]), sum(scale(sum(scale(sum(prod(m3[1], m4[0]), prod(-m4[1], m3[0])), m1[2]), sum(scale(sum(prod(m1[1], m4[0]), prod(-m4[1], m1[0])), -m3[2]), scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), m4[2]))), m0[3]), scale(sum(scale(sum(prod(m3[1], m4[0]), prod(-m4[1], m3[0])), m0[2]), sum(scale(sum(prod(m0[1], m4[0]), prod(-m4[1], m0[0])), -m3[2]), scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), m4[2]))), -m1[3])))), sum(sum(scale(sum(scale(sum(prod(m1[1], m4[0]), prod(-m4[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m4[0]), prod(-m4[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m4[2]))), m3[3]), sum(scale(sum(scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m3[2]))), -m4[3]), scale(sum(scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m1[2]), sum(scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), -m2[2]), scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m3[2]))), m0[3]))), sum(scale(sum(scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m0[2]), sum(scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), -m2[2]), scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), m3[2]))), -m1[3]), sum(scale(sum(scale(sum(prod(m1[1], m3[0]), prod(-m3[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m3[2]))), m2[3]), scale(sum(scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m2[2]))), -m3[3])))));
          var n = sum(sum(sum(scale(sum(scale(sum(prod(m3[1], m4[0]), prod(-m4[1], m3[0])), m2[2]), sum(scale(sum(prod(m2[1], m4[0]), prod(-m4[1], m2[0])), -m3[2]), scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m4[2]))), m0[3]), scale(sum(scale(sum(prod(m3[1], m4[0]), prod(-m4[1], m3[0])), m0[2]), sum(scale(sum(prod(m0[1], m4[0]), prod(-m4[1], m0[0])), -m3[2]), scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), m4[2]))), -m2[3])), sum(scale(sum(scale(sum(prod(m2[1], m4[0]), prod(-m4[1], m2[0])), m0[2]), sum(scale(sum(prod(m0[1], m4[0]), prod(-m4[1], m0[0])), -m2[2]), scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), m4[2]))), m3[3]), scale(sum(scale(sum(prod(m2[1], m3[0]), prod(-m3[1], m2[0])), m0[2]), sum(scale(sum(prod(m0[1], m3[0]), prod(-m3[1], m0[0])), -m2[2]), scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), m3[2]))), -m4[3]))), sum(sum(scale(sum(scale(sum(prod(m2[1], m4[0]), prod(-m4[1], m2[0])), m1[2]), sum(scale(sum(prod(m1[1], m4[0]), prod(-m4[1], m1[0])), -m2[2]), scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m4[2]))), m0[3]), scale(sum(scale(sum(prod(m2[1], m4[0]), prod(-m4[1], m2[0])), m0[2]), sum(scale(sum(prod(m0[1], m4[0]), prod(-m4[1], m0[0])), -m2[2]), scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), m4[2]))), -m1[3])), sum(scale(sum(scale(sum(prod(m1[1], m4[0]), prod(-m4[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m4[0]), prod(-m4[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m4[2]))), m2[3]), scale(sum(scale(sum(prod(m1[1], m2[0]), prod(-m2[1], m1[0])), m0[2]), sum(scale(sum(prod(m0[1], m2[0]), prod(-m2[1], m0[0])), -m1[2]), scale(sum(prod(m0[1], m1[0]), prod(-m1[1], m0[0])), m2[2]))), -m4[3]))));
          var d = sub(p, n);
          return d[d.length - 1];
        };
      }
      function orientation(n) {
        var fn = n === 3 ? orientation_3 : n === 4 ? orientation_4 : orientation_5;
        return fn(robustSum, twoProduct, robustScale, robustSubtract);
      }
      var orientation3Exact = orientation(3);
      var orientation4Exact = orientation(4);
      var CACHED = [
        function orientation0() {
          return 0;
        },
        function orientation1() {
          return 0;
        },
        function orientation2(a, b) {
          return b[0] - a[0];
        },
        function orientation3(a, b, c) {
          var l = (a[1] - c[1]) * (b[0] - c[0]);
          var r = (a[0] - c[0]) * (b[1] - c[1]);
          var det = l - r;
          var s;
          if (l > 0) {
            if (r <= 0) {
              return det;
            } else {
              s = l + r;
            }
          } else if (l < 0) {
            if (r >= 0) {
              return det;
            } else {
              s = -(l + r);
            }
          } else {
            return det;
          }
          var tol = ERRBOUND3 * s;
          if (det >= tol || det <= -tol) {
            return det;
          }
          return orientation3Exact(a, b, c);
        },
        function orientation4(a, b, c, d) {
          var adx = a[0] - d[0];
          var bdx = b[0] - d[0];
          var cdx = c[0] - d[0];
          var ady = a[1] - d[1];
          var bdy = b[1] - d[1];
          var cdy = c[1] - d[1];
          var adz = a[2] - d[2];
          var bdz = b[2] - d[2];
          var cdz = c[2] - d[2];
          var bdxcdy = bdx * cdy;
          var cdxbdy = cdx * bdy;
          var cdxady = cdx * ady;
          var adxcdy = adx * cdy;
          var adxbdy = adx * bdy;
          var bdxady = bdx * ady;
          var det = adz * (bdxcdy - cdxbdy) + bdz * (cdxady - adxcdy) + cdz * (adxbdy - bdxady);
          var permanent = (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz) + (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz) + (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz);
          var tol = ERRBOUND4 * permanent;
          if (det > tol || -det > tol) {
            return det;
          }
          return orientation4Exact(a, b, c, d);
        }
      ];
      function slowOrient(args) {
        var proc2 = CACHED[args.length];
        if (!proc2) {
          proc2 = CACHED[args.length] = orientation(args.length);
        }
        return proc2.apply(void 0, args);
      }
      function proc(slow, o0, o1, o2, o3, o4, o5) {
        return function getOrientation(a0, a1, a2, a3, a4) {
          switch (arguments.length) {
            case 0:
            case 1:
              return 0;
            case 2:
              return o2(a0, a1);
            case 3:
              return o3(a0, a1, a2);
            case 4:
              return o4(a0, a1, a2, a3);
            case 5:
              return o5(a0, a1, a2, a3, a4);
          }
          var s = new Array(arguments.length);
          for (var i = 0; i < arguments.length; ++i) {
            s[i] = arguments[i];
          }
          return slow(s);
        };
      }
      function generateOrientationProc() {
        while (CACHED.length <= NUM_EXPAND) {
          CACHED.push(orientation(CACHED.length));
        }
        module.exports = proc.apply(void 0, [slowOrient].concat(CACHED));
        for (var i = 0; i <= NUM_EXPAND; ++i) {
          module.exports[i] = CACHED[i];
        }
      }
      generateOrientationProc();
    }
  });

  // node_modules/monotone-convex-hull-2d/index.js
  var require_monotone_convex_hull_2d = __commonJS({
    "node_modules/monotone-convex-hull-2d/index.js"(exports, module) {
      "use strict";
      module.exports = monotoneConvexHull2D;
      var orient = require_orientation()[3];
      function monotoneConvexHull2D(points) {
        var n = points.length;
        if (n < 3) {
          var result = new Array(n);
          for (var i = 0; i < n; ++i) {
            result[i] = i;
          }
          if (n === 2 && points[0][0] === points[1][0] && points[0][1] === points[1][1]) {
            return [0];
          }
          return result;
        }
        var sorted = new Array(n);
        for (var i = 0; i < n; ++i) {
          sorted[i] = i;
        }
        sorted.sort(function(a, b) {
          var d = points[a][0] - points[b][0];
          if (d) {
            return d;
          }
          return points[a][1] - points[b][1];
        });
        var lower = [sorted[0], sorted[1]];
        var upper = [sorted[0], sorted[1]];
        for (var i = 2; i < n; ++i) {
          var idx = sorted[i];
          var p = points[idx];
          var m = lower.length;
          while (m > 1 && orient(
            points[lower[m - 2]],
            points[lower[m - 1]],
            p
          ) <= 0) {
            m -= 1;
            lower.pop();
          }
          lower.push(idx);
          m = upper.length;
          while (m > 1 && orient(
            points[upper[m - 2]],
            points[upper[m - 1]],
            p
          ) >= 0) {
            m -= 1;
            upper.pop();
          }
          upper.push(idx);
        }
        var result = new Array(upper.length + lower.length - 2);
        var ptr = 0;
        for (var i = 0, nl = lower.length; i < nl; ++i) {
          result[ptr++] = lower[i];
        }
        for (var j = upper.length - 2; j > 0; --j) {
          result[ptr++] = upper[j];
        }
        return result;
      }
    }
  });

  // vendor/mapjs/src/core/layout/layout-geometry.js
  var require_layout_geometry = __commonJS({
    "vendor/mapjs/src/core/layout/layout-geometry.js"(exports, module) {
      var _ = require_underscore_umd();
      var PolyBool = require_polybooljs();
      var convexHull = require_monotone_convex_hull_2d();
      var dotProduct = function(p1, p2) {
        "use strict";
        return p1[0] * p2[0] + p1[1] * p2[1];
      };
      var unitVector = function(vector) {
        "use strict";
        const magnitude = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
        if (magnitude === 0) {
          return [0, 0];
        }
        return [vector[0] / magnitude, vector[1] / magnitude];
      };
      var toPolyBoolPoly = function(poly) {
        "use strict";
        return {
          regions: poly,
          inverted: false
        };
      };
      var arePointsEqual = function(p1, p2) {
        "use strict";
        return p1 && p2 && p1.length === 2 && p2.length === 2 && p1[0] === p2[0] && p1[1] === p2[1];
      };
      var areShapesEqual = function(shape1, shape2) {
        "use strict";
        if (!shape1 || !shape2 || shape1.length !== shape2.length) {
          return false;
        }
        return _.filter(shape1, function(p1) {
          return _.filter(shape2, function(p2) {
            return arePointsEqual(p1, p2);
          }).length;
        }).length === shape1.length;
      };
      var polygonsAreEqual = function(poly1, poly2) {
        "use strict";
        const matchingShapes = function() {
          return _.filter(poly1, function(shape1) {
            return _.filter(poly2, function(shape2) {
              return areShapesEqual(shape1, shape2);
            }).length;
          });
        };
        if (poly1.length > poly2.length) {
          return false;
        }
        return matchingShapes().length === poly1.length;
      };
      var shapeContainingIntersection = function(poly, intersection) {
        "use strict";
        const pbIntersection = toPolyBoolPoly(intersection), containingShape = _.find(poly, function(shape) {
          const pbShape = toPolyBoolPoly([shape]), shapeIntersection = PolyBool.intersect(pbIntersection, pbShape);
          return polygonsAreEqual(intersection, shapeIntersection.regions);
        });
        return containingShape && containingShape.length && containingShape;
      };
      var polygonIntersectionPoints = function(poly1, poly2) {
        "use strict";
        const pbPoly1 = toPolyBoolPoly(poly1), pbPoly2 = toPolyBoolPoly(poly2), intersection = PolyBool.intersect(pbPoly1, pbPoly2), isSameAsPoly1 = polygonsAreEqual(poly1, intersection.regions), isContained = isSameAsPoly1 && !polygonsAreEqual(intersection.regions, poly2), containingShape = isContained && shapeContainingIntersection(poly2, intersection.regions);
        if (containingShape) {
          return containingShape;
        }
        return _.flatten(intersection.regions, true);
      };
      var projectPointOnLineVector = function(point, vectorOrigin, vector) {
        "use strict";
        const pointVector = [point[0] - vectorOrigin[0], point[1] - vectorOrigin[1]], valDp = dotProduct(vector, pointVector), len2 = dotProduct(vector, vector), resultVector = [
          vectorOrigin[0] + valDp * vector[0] / len2,
          vectorOrigin[1] + valDp * vector[1] / len2
        ];
        if (!vector[0] && !vector[1]) {
          throw new Error("invalid-args");
        }
        return resultVector;
      };
      var orderPointsOnVector = function(points, vectorOrigin, vector, pointsBeforeOriginOnly) {
        "use strict";
        const pointScale = function(point) {
          const dx = point[0] - vectorOrigin[0], dy = point[1] - vectorOrigin[1], val = (function() {
            if (dx === 0) {
              if (vector[1] === 0) {
                return 1;
              }
              return dy / vector[1];
            } else {
              if (vector[0] === 0) {
                return 1;
              }
              return dx / vector[0];
            }
          })(), pointSign = val >= 0 ? 1 : -1, vectorScale = pointSign * (Math.pow(dx, 2) + Math.pow(dy, 2));
          return vectorScale;
        }, filteredPoints = _.filter(points, function(point) {
          if (pointsBeforeOriginOnly) {
            return pointScale(point) < 0;
          }
          return pointScale(point) >= 0;
        });
        return _.sortBy(filteredPoints, pointScale);
      };
      var buildPoints = function(layout, margin) {
        "use strict";
        const points = [];
        _.each(layout, function(node) {
          const x1 = Math.round(node.x - margin), x2 = Math.round(node.x + node.width + margin), y1 = Math.round(node.y - margin), y2 = Math.round(node.y + node.height + margin);
          points.push([x1, y1]);
          points.push([x1, y2]);
          points.push([x2, y2]);
          points.push([x2, y1]);
        });
        return points;
      };
      var tolayoutPolygonHull = function(layout, margin) {
        "use strict";
        const points = buildPoints(layout, margin), hullIndices = convexHull(points), hull = _.map(hullIndices, function(hullIndex) {
          return points[hullIndex];
        });
        return [hull];
      };
      var roundVector = function(vector) {
        "use strict";
        return [Math.round(vector[0]), Math.round(vector[1])];
      };
      var tolayoutPolygonRect = function(layout, margin) {
        "use strict";
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        _.each(layout, function(node) {
          minX = Math.min(minX, node.x);
          maxX = Math.max(maxX, node.x + node.width);
          minY = Math.min(minY, node.y);
          maxY = Math.max(maxY, node.y + node.width);
        });
        minX = minX - margin;
        maxX = maxX + margin;
        minY = minY - margin;
        maxY = maxY + margin;
        return [
          [
            roundVector([minX, minY]),
            roundVector([maxX, minY]),
            roundVector([maxX, maxY]),
            roundVector([minX, maxY])
          ]
        ];
      };
      var addVectors = function(vector1, vector2) {
        "use strict";
        const x = vector1[0] + vector2[0], y = vector1[1] + vector2[1];
        if (isNaN(x) || isNaN(y)) {
          throw new Error("invalid-args");
        }
        return [x, y];
      };
      var subtractVectors = function(vector1, vector2) {
        "use strict";
        const x = vector1[0] - vector2[0], y = vector1[1] - vector2[1];
        if (isNaN(x) || isNaN(y)) {
          throw new Error("invalid-args");
        }
        return [x, y];
      };
      var translatePoly = function(poly, translation) {
        "use strict";
        return poly.map(function(region) {
          return region.map(function(vector) {
            return roundVector(addVectors(vector, translation));
          });
        });
      };
      var firstProjectedPolyPointOnVector = function(poly, vectorOrigin, vector) {
        "use strict";
        const polyPoints = _.flatten(poly, true), intersectionsOnLine = polyPoints.map(function(intersection) {
          return projectPointOnLineVector(intersection, vectorOrigin, vector);
        }), orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector, true);
        return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine[0];
      };
      var furthestIntersectionPoint = function(poly1, poly2, vectorOrigin, vector) {
        "use strict";
        const intersections = polygonIntersectionPoints(poly1, poly2), intersectionsOnLine = intersections.map(function(intersection) {
          return projectPointOnLineVector(intersection, vectorOrigin, vector);
        }), orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector);
        return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine.pop();
      };
      var translatePolyToIntersecton = function(polyToTranslate, intersectionPoint, vector) {
        "use strict";
        const firstPolyPoint = firstProjectedPolyPointOnVector(polyToTranslate, intersectionPoint, vector), translation = firstPolyPoint && roundVector(subtractVectors(intersectionPoint, firstPolyPoint));
        if (!firstPolyPoint) {
          return false;
        }
        return {
          translation,
          translatedPoly: translatePoly(polyToTranslate, translation)
        };
      };
      var translatePolyToNotOverlap = function(polyToFit, existingRegions, polyRootCenter, vector, previousTranslation, depth) {
        "use strict";
        const firstPolyPoint = firstProjectedPolyPointOnVector(polyToFit, polyRootCenter, vector) || polyRootCenter, intersectionPoint = furthestIntersectionPoint(polyToFit, existingRegions, firstPolyPoint, vector);
        let polyTranslation;
        depth = depth || 0;
        previousTranslation = previousTranslation || [0, 0];
        if (intersectionPoint) {
          polyTranslation = translatePolyToIntersecton(polyToFit, intersectionPoint, vector);
          if (polyTranslation) {
            previousTranslation = addVectors(previousTranslation, polyTranslation.translation);
            polyRootCenter = addVectors(polyRootCenter, polyTranslation.translation);
            if (depth < 100) {
              return translatePolyToNotOverlap(polyTranslation.translatedPoly, existingRegions, polyRootCenter, vector, previousTranslation, depth + 1);
            }
          }
        }
        return {
          translation: previousTranslation,
          translatedPoly: polyToFit
        };
      };
      var extension = function(vector) {
        "use strict";
        return Math.pow(vector[0], 2) + Math.pow(vector[1], 2);
      };
      module.exports = {
        tolayoutPolygonRect,
        tolayoutPolygonHull,
        furthestIntersectionPoint,
        projectPointOnLineVector,
        orderPointsOnVector,
        firstProjectedPolyPointOnVector,
        translatePoly,
        addVectors,
        subtractVectors,
        translatePolyToIntersecton,
        translatePolyToNotOverlap,
        unitVector,
        roundVector,
        polygonIntersectionPoints,
        shapeContainingIntersection,
        extension
      };
    }
  });

  // vendor/mapjs/src/core/layout/multi-root-layout.js
  var require_multi_root_layout = __commonJS({
    "vendor/mapjs/src/core/layout/multi-root-layout.js"(exports, module) {
      var _ = require_underscore_umd();
      var layoutGeometry = require_layout_geometry();
      module.exports = function MultiRootLayout() {
        "use strict";
        const self2 = this, mergeNodes = function(storedLayout, offset) {
          _.each(storedLayout.rootLayout, function(node) {
            node.x = node.x + offset.x;
            node.y = node.y + offset.y;
            node.rootId = storedLayout.rootIdea.id;
          });
        }, globalIdeaTopLeftPosition = function(idea) {
          const positionArray = idea && idea.attr && idea.attr.position || [0, 0, 0];
          return {
            x: positionArray[0],
            y: positionArray[1],
            priority: positionArray[2]
          };
        }, toStoredLayout = function(rootLayout, rootIdea) {
          const storedLayout = {
            rootIdea,
            rootNode: rootLayout[rootIdea.id],
            rootLayout
          };
          return storedLayout;
        }, isPositioned = function(rootIdea) {
          return globalIdeaTopLeftPosition(rootIdea).priority;
        }, getDesiredRootNodeOffset = function(storedLayout) {
          let rootPosition = globalIdeaTopLeftPosition(storedLayout.rootIdea);
          if (!storedLayout.rootNode) {
            return { x: 0, y: 0 };
          }
          if (!rootPosition || !rootPosition.priority) {
            rootPosition = { x: Math.round(storedLayout.rootNode.width / -2), y: Math.round(storedLayout.rootNode.height / -2) };
          }
          return {
            x: rootPosition.x - storedLayout.rootNode.x,
            y: rootPosition.y - storedLayout.rootNode.y
          };
        }, positionedLayouts = [], unpositionedLayouts = [], getMostRecentlyPositionedLayout = function() {
          return positionedLayouts.length && _.max(positionedLayouts, function(layout) {
            return globalIdeaTopLeftPosition(layout.rootIdea).priority;
          });
        };
        self2.appendRootNodeLayout = function(rootLayout, rootIdea) {
          const storedLayout = toStoredLayout(rootLayout, rootIdea);
          if (isPositioned(rootIdea)) {
            positionedLayouts.push(storedLayout);
          } else {
            unpositionedLayouts.push(storedLayout);
          }
        };
        self2.getCombinedLayout = function(margin, optional) {
          let placedLayoutPoly = [], result = {};
          const origin = { x: 0, y: 0 }, contextNode = optional && optional.contextNode, contextLayout = contextNode && positionedLayouts.find((layout) => layout.rootLayout[contextNode]), firstToPlace = contextLayout || getMostRecentlyPositionedLayout(), rootDistance = function(storedLayout) {
            const rootCenter = getDesiredRootNodeOffset(storedLayout), nodeDistance = function(node) {
              return Math.pow(rootCenter.x + node.x + node.width / 2 - origin.x, 2) + Math.pow(rootCenter.y + node.y + node.height / 2 - origin.y, 2);
            }, nodeDistances = Object.keys(storedLayout.rootLayout).map((key) => nodeDistance(storedLayout.rootLayout[key]));
            return Math.min.apply({}, nodeDistances);
          }, placedLayouts = [], layoutCount = positionedLayouts.length + unpositionedLayouts.length, hasMultipleLayouts = layoutCount > 1, positionLayout = function(storedLayout) {
            let offset, storedLayoutPoly;
            const placedRootOffset = getDesiredRootNodeOffset(storedLayout), initialTranslation = layoutGeometry.roundVector([placedRootOffset.x, placedRootOffset.y]), placeNewLayout = function() {
              const vector = layoutGeometry.unitVector([placedRootOffset.x - origin.x, placedRootOffset.y - origin.y]), horizontalMovement = [Math.sign(vector[0]) || 1, 0], verticalMovement = [0, Math.sign(vector[1]) || 1], horizontalTranslationResult = layoutGeometry.translatePolyToNotOverlap(storedLayoutPoly, placedLayoutPoly, initialTranslation, horizontalMovement, initialTranslation), horizontalExtension = layoutGeometry.extension(layoutGeometry.subtractVectors(horizontalTranslationResult.translation, initialTranslation)), verticalTranslationResult = horizontalExtension && layoutGeometry.translatePolyToNotOverlap(storedLayoutPoly, placedLayoutPoly, initialTranslation, verticalMovement, initialTranslation), verticalExtension = verticalTranslationResult && layoutGeometry.extension(layoutGeometry.subtractVectors(verticalTranslationResult.translation, initialTranslation));
              if (!verticalExtension || horizontalExtension < verticalExtension) {
                offset = { x: horizontalTranslationResult.translation[0], y: horizontalTranslationResult.translation[1] };
                storedLayoutPoly = horizontalTranslationResult.translatedPoly;
              } else {
                offset = { x: verticalTranslationResult.translation[0], y: verticalTranslationResult.translation[1] };
                storedLayoutPoly = verticalTranslationResult.translatedPoly;
              }
            };
            storedLayoutPoly = hasMultipleLayouts && layoutGeometry.translatePoly(layoutGeometry.tolayoutPolygonHull(storedLayout.rootLayout, margin), initialTranslation);
            if (!storedLayout || _.contains(placedLayouts, storedLayout)) {
              return;
            }
            if (placedLayouts.length) {
              placeNewLayout();
            } else {
              offset = placedRootOffset;
            }
            mergeNodes(storedLayout, offset);
            placedLayouts.push(storedLayout);
            if (hasMultipleLayouts) {
              placedLayoutPoly = placedLayoutPoly.concat(storedLayoutPoly);
            }
          };
          if (!margin) {
            throw new Error("invalid-args");
          }
          if (firstToPlace) {
            positionLayout(firstToPlace);
            if (contextLayout) {
              origin.x = contextLayout.rootLayout[contextNode].x;
              origin.y = contextLayout.rootLayout[contextNode].y;
            }
          }
          positionedLayouts.forEach((layout) => layout.distance = rootDistance(layout));
          positionedLayouts.sort((layout1, layout2) => layout1.distance - layout2.distance).forEach(positionLayout);
          unpositionedLayouts.forEach(positionLayout);
          placedLayouts.forEach(function(placedLayout) {
            result = _.extend(result, placedLayout.rootLayout);
          });
          return result;
        };
      };
    }
  });

  // vendor/mapjs/src/core/util/object-utils.js
  var require_object_utils = __commonJS({
    "vendor/mapjs/src/core/util/object-utils.js"(exports, module) {
      var getValue = (hashmap, attributeNameComponents) => {
        "use strict";
        if (!hashmap || !attributeNameComponents || !attributeNameComponents.length || typeof hashmap !== "object" || !Array.isArray(attributeNameComponents)) {
          return false;
        }
        const val = hashmap[attributeNameComponents[0]], remaining = attributeNameComponents.slice(1);
        if (remaining.length) {
          return getValue(val, remaining);
        }
        return val;
      };
      var setValue = (hashmap, attributeNameComponents, value) => {
        "use strict";
        if (!hashmap || !attributeNameComponents || !attributeNameComponents.length || typeof hashmap !== "object" || !Array.isArray(attributeNameComponents)) {
          return false;
        }
        const remaining = attributeNameComponents.slice(1), currentKey = attributeNameComponents[0];
        if (remaining.length) {
          if (!hashmap[currentKey]) {
            if (!value) {
              return;
            }
            hashmap[currentKey] = {};
          }
          setValue(hashmap[currentKey], remaining, value);
          return;
        }
        if (!value) {
          delete hashmap[currentKey];
        } else {
          hashmap[currentKey] = value;
        }
      };
      var keyComponentsWithValue = (hashmap, searchingFor) => {
        "use strict";
        if (typeof searchingFor === "object" || Array.isArray(searchingFor)) {
          throw "search-type-not-supported";
        }
        const result = [];
        if (!hashmap || typeof hashmap !== "object") {
          return [];
        }
        Object.keys(hashmap).forEach((key) => {
          const val = hashmap[key];
          if (val === searchingFor) {
            result.push([key]);
          }
          if (typeof val === "object") {
            keyComponentsWithValue(val, searchingFor).forEach((subKey) => {
              if (!subKey || !subKey.length) {
                return;
              }
              const newComps = [key].concat(subKey);
              result.push(newComps);
            });
          }
        });
        return result;
      };
      module.exports = {
        getValue,
        setValue,
        keyComponentsWithValue
      };
    }
  });

  // vendor/mapjs/src/core/layout/node-attribute-utils.js
  var require_node_attribute_utils = __commonJS({
    "vendor/mapjs/src/core/layout/node-attribute-utils.js"(exports, module) {
      var objectUtils = require_object_utils();
      var _ = require_underscore_umd();
      var INHERIT_MARKER = "theme_inherit";
      var inheritAttributeKeysFromParentNode = (parentNode, node, keysToInherit) => {
        "use strict";
        let remainingToInherit = [];
        if (parentNode.attr) {
          keysToInherit.forEach((keyToInherit) => {
            const parentValue = objectUtils.getValue(parentNode.attr, keyToInherit);
            if (parentValue && parentValue !== INHERIT_MARKER) {
              objectUtils.setValue(node.attr, keyToInherit, parentValue);
            } else {
              remainingToInherit.push(keyToInherit);
            }
          });
        } else {
          remainingToInherit = keysToInherit;
        }
        return remainingToInherit;
      };
      var inheritAttributeKeys = (nodesMap, node, keysToInherit) => {
        "use strict";
        if (!node || !node.parentId) {
          return;
        }
        const parentNode = nodesMap[node.parentId], remainingToInherit = parentNode && inheritAttributeKeysFromParentNode(parentNode, node, keysToInherit) || [];
        if (!remainingToInherit.length || !parentNode || !parentNode.parentId) {
          return;
        }
        inheritAttributeKeys(nodesMap, parentNode, remainingToInherit);
        inheritAttributeKeysFromParentNode(parentNode, node, remainingToInherit);
      };
      var inheritAttributes = (nodesMap, node) => {
        "use strict";
        if (!node || !node.parentId || !node.attr) {
          return;
        }
        const keysToInherit = objectUtils.keyComponentsWithValue(node.attr, INHERIT_MARKER);
        if (!keysToInherit || !keysToInherit.length) {
          return;
        }
        inheritAttributeKeys(nodesMap, node, keysToInherit);
      };
      var setThemeAttributes = function(nodes, theme) {
        "use strict";
        if (!nodes || !theme) {
          throw "invalid-args";
        }
        Object.keys(nodes).forEach(function(nodeKey) {
          const node = nodes[nodeKey];
          node.styles = theme.nodeStyles(node.level, node.attr);
          node.attr = _.extend({}, theme.getLayoutConnectorAttributes(node.styles), node.attr);
        });
        Object.keys(nodes).forEach(function(nodeKey) {
          const node = nodes[nodeKey];
          inheritAttributes(nodes, node);
        });
      };
      module.exports = {
        INHERIT_MARKER,
        inheritAttributes,
        inheritAttributeKeys,
        inheritAttributeKeysFromParentNode,
        setThemeAttributes
      };
    }
  });

  // vendor/mapjs/src/core/content/is-empty-group.js
  var require_is_empty_group = __commonJS({
    "vendor/mapjs/src/core/content/is-empty-group.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function isEmptyGroup(contentIdea) {
        "use strict";
        return contentIdea.attr && contentIdea.attr.group && _.isEmpty(contentIdea.ideas);
      };
    }
  });

  // vendor/mapjs/src/core/layout/standard/outline.js
  var require_outline = __commonJS({
    "vendor/mapjs/src/core/layout/standard/outline.js"(exports, module) {
      var _ = require_underscore_umd();
      var borderLength = function(border) {
        "use strict";
        return _.reduce(border, function(seed, el) {
          return seed + el.l;
        }, 0);
      };
      var borderSegmentIndexAt = function(border, length) {
        "use strict";
        let l = 0, i = -1;
        while (l <= length) {
          i += 1;
          if (i >= border.length) {
            return -1;
          }
          l += border[i].l;
        }
        return i;
      };
      var extendBorder = function(originalBorder, extension) {
        "use strict";
        let lengthToCut, result = originalBorder.slice();
        const origLength = borderLength(originalBorder), i = borderSegmentIndexAt(extension, origLength);
        if (i >= 0) {
          lengthToCut = borderLength(extension.slice(0, i + 1));
          result.push({ h: extension[i].h, l: lengthToCut - origLength });
          result = result.concat(extension.slice(i + 1));
        }
        return result;
      };
      var Outline = function(topBorder, bottomBorder) {
        "use strict";
        const shiftBorder = function(border, deltaH) {
          return _.map(border, function(segment) {
            return {
              l: segment.l,
              h: segment.h + deltaH
            };
          });
        };
        this.initialHeight = function() {
          return this.bottom[0].h - this.top[0].h;
        };
        this.borders = function() {
          return _.pick(this, "top", "bottom");
        };
        this.spacingAbove = function(outline) {
          let i = 0, j = 0, result = 0, li = 0, lj = 0;
          while (i < this.bottom.length && j < outline.top.length) {
            result = Math.max(result, this.bottom[i].h - outline.top[j].h);
            if (li + this.bottom[i].l < lj + outline.top[j].l) {
              li += this.bottom[i].l;
              i += 1;
            } else if (li + this.bottom[i].l === lj + outline.top[j].l) {
              li += this.bottom[i].l;
              i += 1;
              lj += outline.top[j].l;
              j += 1;
            } else {
              lj += outline.top[j].l;
              j += 1;
            }
          }
          return result;
        };
        this.indent = function(horizontalIndent, margin) {
          const top = this.top.slice(), bottom = this.bottom.slice(), vertCenter = Math.round((bottom[0].h + top[0].h) / 2);
          if (!horizontalIndent) {
            return this;
          }
          ;
          top.unshift({ h: Math.round(vertCenter - margin / 2), l: horizontalIndent });
          bottom.unshift({ h: Math.round(vertCenter + margin / 2), l: horizontalIndent });
          return new Outline(top, bottom);
        };
        this.stackBelow = function(outline, margin) {
          const spacing = outline.spacingAbove(this), top = extendBorder(outline.top, shiftBorder(this.top, spacing + margin)), bottom = extendBorder(shiftBorder(this.bottom, spacing + margin), outline.bottom);
          return new Outline(
            top,
            bottom
          );
        };
        this.expand = function(initialTopHeight, initialBottomHeight) {
          const topAlignment = initialTopHeight - this.top[0].h, bottomAlignment = initialBottomHeight - this.bottom[0].h, top = shiftBorder(this.top, topAlignment), bottom = shiftBorder(this.bottom, bottomAlignment);
          return new Outline(
            top,
            bottom
          );
        };
        this.insertAtStart = function(dimensions, margin) {
          const alignment = 0, topBorder2 = shiftBorder(this.top, alignment), bottomBorder2 = shiftBorder(this.bottom, alignment), easeIn = function(border) {
            border[0].l *= 0.5;
            border[1].l += border[0].l;
          };
          topBorder2[0].l += margin;
          bottomBorder2[0].l += margin;
          topBorder2.unshift({ h: Math.round(-0.5 * dimensions.height), l: dimensions.width });
          bottomBorder2.unshift({ h: Math.round(0.5 * dimensions.height), l: dimensions.width });
          if (topBorder2[0].h > topBorder2[1].h) {
            easeIn(topBorder2);
          }
          if (bottomBorder2[0].h < bottomBorder2[1].h) {
            easeIn(bottomBorder2);
          }
          return new Outline(topBorder2, bottomBorder2);
        };
        this.top = topBorder.slice();
        this.bottom = bottomBorder.slice();
      };
      var outlineFromDimensions = function(dimensions) {
        "use strict";
        return new Outline([{
          h: Math.round(-0.5 * dimensions.height),
          l: dimensions.width
        }], [{
          h: Math.round(0.5 * dimensions.height),
          l: dimensions.width
        }]);
      };
      module.exports = {
        borderLength,
        borderSegmentIndexAt,
        extendBorder,
        Outline,
        outlineFromDimensions
      };
    }
  });

  // vendor/mapjs/src/core/layout/standard/tree.js
  var require_tree = __commonJS({
    "vendor/mapjs/src/core/layout/standard/tree.js"(exports, module) {
      var _ = require_underscore_umd();
      var isEmptyGroup = require_is_empty_group();
      var outlineUtils = require_outline();
      var Tree = function(options) {
        "use strict";
        _.extend(this, options);
        this.toLayout = function(x, y, parentId) {
          const result = {
            nodes: {},
            connectors: {}
          }, self2 = _.pick(this, "id", "title", "attr", "width", "textWidth", "height", "level");
          if (parentId) {
            self2.parentId = parentId;
          }
          x = x || 0;
          y = y || 0;
          if (self2.level === 1) {
            self2.x = Math.round(-0.5 * this.width);
            self2.y = Math.round(-0.5 * this.height);
          } else {
            self2.x = x + this.deltaX || 0;
            self2.y = y + this.deltaY || 0;
          }
          result.nodes[this.id] = self2;
          if (parentId !== void 0) {
            result.connectors[self2.id] = {
              from: parentId,
              to: self2.id
            };
          }
          if (this.subtrees) {
            this.subtrees.forEach(function(t) {
              const subLayout = t.toLayout(self2.x, self2.y, self2.id);
              _.extend(result.nodes, subLayout.nodes);
              _.extend(result.connectors, subLayout.connectors);
            });
          }
          return result;
        };
      };
      var calculateTree = function(content2, dimensionProvider, margin, rankAndParentPredicate, level) {
        "use strict";
        const options = {
          id: content2.id,
          title: content2.title,
          attr: content2.attr,
          deltaY: 0,
          deltaX: 0,
          level: level || 1
        }, buildReferenceTree = function(treeArray, dy, oldPositions) {
          let referenceTree, tree;
          const adjustSpacing = function(i) {
            const oldSpacing = oldPositions[i].deltaY - oldPositions[i - 1].deltaY, newSpacing = treeArray[i].deltaY - treeArray[i - 1].deltaY;
            if (newSpacing < oldSpacing) {
              tree.deltaY += oldSpacing - newSpacing;
            }
          };
          for (let i = 0; i < treeArray.length; i += 1) {
            tree = treeArray[i];
            if (tree.attr && tree.attr.position) {
              tree.deltaY = tree.attr.position[1];
              if (referenceTree === void 0 || tree.attr.position[2] > treeArray[referenceTree].attr.position[2]) {
                referenceTree = i;
              }
            } else {
              tree.deltaY += dy;
            }
            if (i > 0) {
              adjustSpacing(i);
            }
          }
          return referenceTree;
        }, setVerticalSpacing = function(treeArray, dy) {
          const oldPositions = _.map(treeArray, function(t) {
            return _.pick(t, "deltaX", "deltaY");
          }), referenceTree = buildReferenceTree(treeArray, dy, oldPositions), alignment = referenceTree && treeArray[referenceTree].attr.position[1] - treeArray[referenceTree].deltaY;
          if (alignment) {
            for (let i = 0; i < treeArray.length; i += 1) {
              treeArray[i].deltaY += alignment;
            }
          }
        }, shouldIncludeSubIdeas = function() {
          return !(_.isEmpty(content2.ideas) || content2.attr && content2.attr.collapsed);
        }, includedSubIdeaKeys = function() {
          const allRanks = _.map(_.keys(content2.ideas), parseFloat), candidateRanks = rankAndParentPredicate ? _.filter(allRanks, function(rank) {
            return rankAndParentPredicate(rank, content2.id);
          }) : allRanks, includedRanks = _.filter(candidateRanks, function(rank) {
            return !isEmptyGroup(content2.ideas[rank]);
          });
          return _.sortBy(includedRanks, Math.abs);
        }, includedSubIdeas = function() {
          const result = [];
          _.each(includedSubIdeaKeys(), function(key) {
            result.push(content2.ideas[key]);
          });
          return result;
        }, nodeDimensions = dimensionProvider(content2, options.level), appendSubtrees = function(subtrees) {
          let suboutline, deltaHeight, subtreePosition, horizontal, treeOutline;
          _.each(subtrees, function(subtree) {
            subtree.deltaX = nodeDimensions.width + margin.h;
            subtreePosition = subtree.attr && subtree.attr.position && subtree.attr.position[0];
            if (subtreePosition && subtreePosition > subtree.deltaX) {
              horizontal = subtreePosition - subtree.deltaX;
              subtree.deltaX = subtreePosition;
            } else {
              horizontal = 0;
            }
            if (!suboutline) {
              suboutline = subtree.outline.indent(horizontal, margin.h);
            } else {
              treeOutline = subtree.outline.indent(horizontal, margin.h);
              deltaHeight = treeOutline.initialHeight();
              suboutline = treeOutline.stackBelow(suboutline, margin.v);
              subtree.deltaY = Math.round(suboutline.initialHeight() - deltaHeight / 2 - subtree.height / 2);
            }
          });
          if (subtrees && subtrees.length) {
            setVerticalSpacing(subtrees, Math.round(0.5 * (nodeDimensions.height - suboutline.initialHeight())));
            suboutline = suboutline.expand(
              Math.round(subtrees[0].deltaY - nodeDimensions.height * 0.5),
              Math.round(subtrees[subtrees.length - 1].deltaY + subtrees[subtrees.length - 1].height - nodeDimensions.height * 0.5)
            );
          }
          options.outline = suboutline.insertAtStart(nodeDimensions, margin.h);
        };
        _.extend(options, nodeDimensions);
        options.outline = outlineUtils.outlineFromDimensions(nodeDimensions);
        if (shouldIncludeSubIdeas()) {
          options.subtrees = _.map(includedSubIdeas(), function(i) {
            return calculateTree(i, dimensionProvider, margin, rankAndParentPredicate, options.level + 1);
          });
          if (!_.isEmpty(options.subtrees)) {
            appendSubtrees(options.subtrees);
          }
        }
        return new Tree(options);
      };
      module.exports = {
        Tree,
        calculateTree
      };
    }
  });

  // vendor/mapjs/src/core/layout/standard/calculate-standard-layout.js
  var require_calculate_standard_layout = __commonJS({
    "vendor/mapjs/src/core/layout/standard/calculate-standard-layout.js"(exports, module) {
      var _ = require_underscore_umd();
      var treeUtils = require_tree();
      module.exports = function calculateStandardLayout(idea, dimensionProvider, margin) {
        "use strict";
        const positive = function(rank, parentId) {
          return parentId !== idea.id || rank > 0;
        }, negative = function(rank, parentId) {
          return parentId !== idea.id || rank < 0;
        }, positiveTree = treeUtils.calculateTree(idea, dimensionProvider, margin, positive), negativeTree = treeUtils.calculateTree(idea, dimensionProvider, margin, negative), layout = positiveTree.toLayout(), negativeLayout = negativeTree.toLayout();
        _.each(negativeLayout.nodes, function(n) {
          n.x = -1 * n.x - n.width;
        });
        return _.extend(negativeLayout.nodes, layout.nodes);
      };
    }
  });

  // vendor/mapjs/src/core/layout/top-down/compacted-group-width.js
  var require_compacted_group_width = __commonJS({
    "vendor/mapjs/src/core/layout/top-down/compacted-group-width.js"(exports, module) {
      module.exports = function compactedGroupWidth(nodeGroup, margin) {
        "use strict";
        if (!nodeGroup || !nodeGroup.length) {
          return 0;
        }
        const totalWidth = nodeGroup.reduce((total, current) => total + current.width, 0), requiredMargins = (nodeGroup.length - 1) * margin;
        return totalWidth + requiredMargins;
      };
    }
  });

  // vendor/mapjs/src/core/layout/top-down/sort-nodes-by-left-position.js
  var require_sort_nodes_by_left_position = __commonJS({
    "vendor/mapjs/src/core/layout/top-down/sort-nodes-by-left-position.js"(exports, module) {
      module.exports = function sortNodesByLeftPosition(nodes) {
        "use strict";
        if (!nodes || !nodes.length) {
          return nodes;
        }
        return [].concat(nodes).sort((a, b) => a.x - b.x);
      };
    }
  });

  // vendor/mapjs/src/core/layout/top-down/align-group.js
  var require_align_group = __commonJS({
    "vendor/mapjs/src/core/layout/top-down/align-group.js"(exports, module) {
      var _ = require_underscore_umd();
      var compactedGroupWidth = require_compacted_group_width();
      var sortNodesByLeftPosition = require_sort_nodes_by_left_position();
      module.exports = function alignGroup(result, rootIdea, margin) {
        "use strict";
        if (!margin) {
          throw "invalid-args";
        }
        const nodes = result.nodes, rootNode = nodes[rootIdea.id], childIds = _.values(rootIdea.ideas).map(function(idea) {
          return idea.id;
        }), childNodes = childIds.map(function(id) {
          return nodes[id];
        }).filter(function(node) {
          return node;
        }), sortedChildNodes = sortNodesByLeftPosition(childNodes), getChildNodeBoundaries = function() {
          const rightMost = sortedChildNodes[sortedChildNodes.length - 1];
          return {
            left: sortedChildNodes[0].x,
            right: rightMost.x + rightMost.width
          };
        }, setGroupWidth = function() {
          if (!childNodes.length) {
            return;
          }
          const levelBoundaries = getChildNodeBoundaries();
          rootNode.x = levelBoundaries.left;
          rootNode.width = levelBoundaries.right - levelBoundaries.left;
        }, compactChildNodes = function() {
          if (!childNodes.length) {
            return;
          }
          const levelBoundaries = getChildNodeBoundaries(), levelCenter = levelBoundaries.left + (levelBoundaries.right - levelBoundaries.left) / 2, requiredWidth = compactedGroupWidth(childNodes, margin);
          let position = levelCenter - requiredWidth / 2;
          sortedChildNodes.forEach((node) => {
            node.x = position;
            position = position + node.width + margin;
          });
        }, sameLevelNodes = _.values(nodes).filter(function(node) {
          return node.level === rootNode.level && node.id !== rootNode.id;
        });
        compactChildNodes();
        setGroupWidth();
        sameLevelNodes.forEach(function(node) {
          node.verticalOffset = (node.verticalOffset || 0) + rootNode.height;
        });
      };
    }
  });

  // vendor/mapjs/src/core/layout/top-down/vertical-subtree-collection.js
  var require_vertical_subtree_collection = __commonJS({
    "vendor/mapjs/src/core/layout/top-down/vertical-subtree-collection.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function VerticalSubtreeCollection(subtreeMap, marginArg) {
        "use strict";
        const self2 = this, sortedRanks = function() {
          if (!subtreeMap) {
            return [];
          }
          return _.sortBy(Object.keys(subtreeMap), parseFloat);
        }, margin = marginArg || 0, calculateExpectedTranslations = function() {
          const ranks = sortedRanks(), translations = {}, sortByRank = function() {
            if (_.isEmpty(subtreeMap)) {
              return [];
            }
            return sortedRanks().map(function(key) {
              return subtreeMap[key];
            });
          };
          let currentWidthByLevel;
          sortByRank().forEach(function(childLayout, rankIndex) {
            const currentRank = ranks[rankIndex];
            if (currentWidthByLevel === void 0) {
              translations[currentRank] = 0 - childLayout.levels[0].xOffset;
              currentWidthByLevel = childLayout.levels.map(function(level) {
                return level.width + translations[currentRank] + level.xOffset;
              });
            } else {
              childLayout.levels.forEach(function(level, levelIndex) {
                const currentLevelWidth = currentWidthByLevel[levelIndex];
                if (currentLevelWidth !== void 0) {
                  if (translations[currentRank] === void 0) {
                    translations[currentRank] = currentLevelWidth + margin - level.xOffset;
                  } else {
                    translations[currentRank] = Math.max(translations[currentRank], currentLevelWidth + margin - level.xOffset);
                  }
                }
              });
              childLayout.levels.forEach(function(level, levelIndex) {
                currentWidthByLevel[levelIndex] = translations[currentRank] + level.xOffset + level.width;
              });
            }
          });
          return translations;
        }, translationsByRank = calculateExpectedTranslations();
        self2.getLevelWidth = function(level) {
          const candidateRanks = sortedRanks().filter(function(rank) {
            return self2.existsOnLevel(rank, level);
          }), referenceLeft = candidateRanks[0], referenceRight = candidateRanks[candidateRanks.length - 1], leftLayout = subtreeMap[referenceLeft], rightLayout = subtreeMap[referenceRight], leftx = leftLayout.levels[level].xOffset + self2.getExpectedTranslation(referenceLeft), rightx = rightLayout.levels[level].xOffset + self2.getExpectedTranslation(referenceRight);
          return rightx + rightLayout.levels[level].width - leftx;
        };
        self2.getLevelWidths = function() {
          const result = [], maxLevel = _.max(_.map(subtreeMap, function(childLayout) {
            return childLayout.levels.length;
          }));
          for (let levelIdx = 0; levelIdx < maxLevel; levelIdx++) {
            result.push(self2.getLevelWidth(levelIdx));
          }
          return result;
        };
        self2.isEmpty = function() {
          return _.isEmpty(subtreeMap);
        };
        self2.getExpectedTranslation = function(rank) {
          return translationsByRank[rank];
        };
        self2.existsOnLevel = function(rank, level) {
          return subtreeMap[rank].levels.length > level;
        };
        self2.getMergedLevels = function() {
          const targetCombinedLeftOffset = Math.round(self2.getLevelWidth(0) * -0.5);
          return self2.getLevelWidths().map(function(levelWidth, index) {
            const candidateRanks = sortedRanks().filter(function(rank) {
              return self2.existsOnLevel(rank, index);
            }), referenceLeft = candidateRanks[0], leftLayout = subtreeMap[referenceLeft];
            return {
              width: levelWidth,
              xOffset: leftLayout.levels[index].xOffset + self2.getExpectedTranslation(referenceLeft) + targetCombinedLeftOffset
            };
          });
        };
      };
    }
  });

  // vendor/mapjs/src/core/layout/top-down/combine-vertical-subtrees.js
  var require_combine_vertical_subtrees = __commonJS({
    "vendor/mapjs/src/core/layout/top-down/combine-vertical-subtrees.js"(exports, module) {
      var _ = require_underscore_umd();
      var VerticalSubtreeCollection = require_vertical_subtree_collection();
      module.exports = function combineVerticalSubtrees(node, childLayouts, margin, sameLevel) {
        "use strict";
        const result = {
          nodes: {}
        }, shift = function(nodes, xOffset) {
          _.each(nodes, function(node2) {
            node2.x += xOffset;
          });
          return nodes;
        }, verticalSubtreeCollection = new VerticalSubtreeCollection(childLayouts, margin);
        let treeOffset;
        if (Array.isArray(childLayouts)) {
          throw "child layouts are an array!";
        }
        result.nodes[node.id] = node;
        node.x = Math.round(-0.5 * node.width);
        result.levels = [{ width: node.width, xOffset: node.x }];
        if (!verticalSubtreeCollection.isEmpty()) {
          if (sameLevel) {
            result.levels = verticalSubtreeCollection.getMergedLevels();
            treeOffset = result.levels[0].xOffset;
          } else {
            result.levels = result.levels.concat(verticalSubtreeCollection.getMergedLevels());
            treeOffset = result.levels[1].xOffset;
          }
          Object.keys(childLayouts).forEach(function(subtreeRank) {
            _.extend(result.nodes, shift(childLayouts[subtreeRank].nodes, treeOffset + verticalSubtreeCollection.getExpectedTranslation(subtreeRank)));
          });
        }
        return result;
      };
    }
  });

  // vendor/mapjs/src/core/layout/top-down/calculate-top-down-layout.js
  var require_calculate_top_down_layout = __commonJS({
    "vendor/mapjs/src/core/layout/top-down/calculate-top-down-layout.js"(exports, module) {
      var _ = require_underscore_umd();
      var isEmptyGroup = require_is_empty_group();
      var alignGroup = require_align_group();
      var combineVerticalSubtrees = require_combine_vertical_subtrees();
      module.exports = function calculateTopDownLayout(aggregate, dimensionProvider, margin) {
        "use strict";
        const isGroup = function(node) {
          return node.attr && node.attr.group;
        }, toNode = function(idea, level, parentId) {
          const dimensions = dimensionProvider(idea, level), node = _.extend({ level, verticalOffset: 0, title: isGroup(idea) ? "" : idea.title }, dimensions, _.pick(idea, ["id", "attr"]));
          if (parentId) {
            node.parentId = parentId;
          }
          return node;
        }, hasConnectorLabel = function(idea) {
          return !!(idea.attr && idea.attr.parentConnector && idea.attr.parentConnector.label);
        }, traverse = function(idea, predicate, level, parentId, parentIsGroup) {
          const childResults = {}, shouldIncludeSubIdeas = !(_.isEmpty(idea.ideas) || idea.attr && idea.attr.collapsed);
          level = level || 1;
          if (shouldIncludeSubIdeas) {
            Object.keys(idea.ideas).forEach(function(subNodeRank) {
              const newLevel = isGroup(idea) ? level : level + 1, result = traverse(idea.ideas[subNodeRank], predicate, newLevel, idea.id, isGroup(idea));
              if (result) {
                childResults[subNodeRank] = result;
              }
            });
          }
          return predicate(idea, childResults, level, parentId, parentIsGroup);
        }, traversalLayout = function(idea, childLayouts, level, parentId, parentIsGroup) {
          const node = toNode(idea, level, parentId);
          let result;
          if (isGroup(node) && !_.isEmpty(idea.ideas)) {
            result = combineVerticalSubtrees(node, childLayouts, margin.h, true);
            alignGroup(result, idea, margin.h);
            if (parentIsGroup && margin.nestedGroupLabel && hasConnectorLabel(idea)) {
              _.each(result.nodes, function(subNode) {
                subNode.verticalOffset = (subNode.verticalOffset || 0) + margin.nestedGroupLabel;
              });
            }
          } else {
            result = combineVerticalSubtrees(node, childLayouts, margin.h);
          }
          return result;
        }, traversalLayoutWithoutEmptyGroups = function(idea, childLayouts, level, parentId, parentIsGroup) {
          return (idea === aggregate || !isEmptyGroup(idea)) && traversalLayout(idea, childLayouts, level, parentId, parentIsGroup);
        }, setLevelHeights = function(nodes, levelHeights) {
          _.each(nodes, function(node) {
            node.y = levelHeights[node.level - 1] + node.verticalOffset;
            delete node.verticalOffset;
          });
        }, getLevelHeights = function(nodes) {
          const maxHeights = [], heights = [];
          let level, totalHeight = 0;
          _.each(nodes, function(node) {
            maxHeights[node.level - 1] = Math.max(maxHeights[node.level - 1] || 0, node.height + node.verticalOffset);
          });
          totalHeight = maxHeights.reduce(function(memo, item) {
            return memo + item;
          }, 0) + margin.v * (maxHeights.length - 1);
          heights[0] = Math.round(-0.5 * totalHeight);
          for (level = 1; level < maxHeights.length; level++) {
            heights[level] = heights[level - 1] + margin.v + maxHeights[level - 1];
          }
          return heights;
        }, tree = traverse(aggregate, traversalLayoutWithoutEmptyGroups);
        setLevelHeights(tree.nodes, getLevelHeights(tree.nodes));
        return tree.nodes;
      };
    }
  });

  // vendor/mapjs/src/core/layout/calculate-layout.js
  var require_calculate_layout = __commonJS({
    "vendor/mapjs/src/core/layout/calculate-layout.js"(exports, module) {
      var contentUpgrade = require_content_upgrade();
      var Theme = require_theme();
      var extractConnectors = require_extract_connectors();
      var extractLinks = require_extract_links();
      var MultiRootLayout = require_multi_root_layout();
      var nodeAttributeUtils = require_node_attribute_utils();
      var defaultLayouts = {
        "standard": require_calculate_standard_layout(),
        "top-down": require_calculate_top_down_layout()
      };
      var formatResult = function(result, idea, theme, orientation) {
        "use strict";
        nodeAttributeUtils.setThemeAttributes(result, theme);
        return {
          orientation,
          nodes: result,
          connectors: extractConnectors(idea, result, theme),
          links: extractLinks(idea, result),
          theme: idea.attr && idea.attr.theme,
          themeOverrides: Object.assign({}, idea.attr && idea.attr.themeOverrides)
        };
      };
      module.exports = function calculateLayout(idea, dimensionProvider, optional) {
        "use strict";
        const layouts = optional && optional.layouts || defaultLayouts, theme = optional && optional.theme || new Theme({}), multiRootLayout = new MultiRootLayout(), margin = theme.attributeValue(["layout"], [], ["spacing"], { h: 20, v: 20 }), orientation = theme.attributeValue(["layout"], [], ["orientation"], "standard"), calculator = layouts[orientation] || layouts.standard;
        idea = contentUpgrade(idea);
        Object.keys(idea.ideas).forEach(function(rank) {
          const rootIdea = idea.ideas[rank], rootResult = calculator(rootIdea, dimensionProvider, {
            h: margin.h || margin,
            v: margin.v || margin,
            nestedGroupLabel: margin.nestedGroupLabel || 0
          });
          multiRootLayout.appendRootNodeLayout(rootResult, rootIdea);
        });
        return formatResult(multiRootLayout.getCombinedLayout(10, optional), idea, theme, orientation);
      };
    }
  });

  // vendor/mapjs/src/browser/node-cache-mark.js
  var require_node_cache_mark = __commonJS({
    "vendor/mapjs/src/browser/node-cache-mark.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function nodeCacheMark(idea, optional) {
        "use strict";
        const levelOverride = optional && optional.level, theme = optional && optional.theme, isGroup = idea.attr && idea.attr.group;
        return {
          title: !isGroup && idea.title,
          width: idea.attr && idea.attr.style && idea.attr.style.width,
          theme: theme && theme.name,
          icon: idea.attr && idea.attr.icon && _.pick(idea.attr.icon, "width", "height", "position"),
          collapsed: idea.attr && idea.attr.collapsed,
          note: !!(idea.attr && idea.attr.note),
          fontMultiplier: idea.attr && idea.attr.style && idea.attr.style.fontMultiplier,
          styles: theme && theme.nodeStyles(idea.level || levelOverride, idea.attr),
          level: idea.level || levelOverride
        };
      };
    }
  });

  // vendor/mapjs/src/core/util/clean-dom-id.js
  var require_clean_dom_id = __commonJS({
    "vendor/mapjs/src/core/util/clean-dom-id.js"(exports, module) {
      module.exports = function cleanDOMId(s) {
        "use strict";
        return s.replace(/[^A-Za-z0-9_-]/g, "_");
      };
    }
  });

  // vendor/mapjs/src/core/util/node-key.js
  var require_node_key = __commonJS({
    "vendor/mapjs/src/core/util/node-key.js"(exports, module) {
      var cleanDOMId = require_clean_dom_id();
      module.exports = function(id) {
        "use strict";
        return cleanDOMId("node_" + id);
      };
    }
  });

  // vendor/mapjs/src/browser/create-node.js
  var require_create_node = __commonJS({
    "vendor/mapjs/src/browser/create-node.js"() {
      var jQuery3 = require_jquery();
      var nodeKey = require_node_key();
      jQuery3.fn.createNode = function(node) {
        "use strict";
        return jQuery3("<div>").attr({ "id": nodeKey(node.id), "tabindex": 0, "data-mapjs-role": "node" }).css({
          display: "block",
          opacity: 0,
          position: "absolute",
          top: Math.round(node.y || 0) + "px",
          left: Math.round(node.x || 0) + "px"
        }).addClass("mapjs-node").appendTo(this);
      };
    }
  });

  // node_modules/jquery-hammerjs/jquery.hammer-full.js
  var require_jquery_hammer_full = __commonJS({
    "node_modules/jquery-hammerjs/jquery.hammer-full.js"(exports, module) {
      (function(window2, undefined2) {
        "use strict";
        var Hammer = function Hammer2(element, options) {
          return new Hammer2.Instance(element, options || {});
        };
        Hammer.VERSION = "1.1.3";
        Hammer.defaults = {
          /**
           * this setting object adds styles and attributes to the element to prevent the browser from doing
           * its native behavior. The css properties are auto prefixed for the browsers when needed.
           * @property defaults.behavior
           * @type {Object}
           */
          behavior: {
            /**
             * Disables text selection to improve the dragging gesture. When the value is `none` it also sets
             * `onselectstart=false` for IE on the element. Mainly for desktop browsers.
             * @property defaults.behavior.userSelect
             * @type {String}
             * @default 'none'
             */
            userSelect: "none",
            /**
             * Specifies whether and how a given region can be manipulated by the user (for instance, by panning or zooming).
             * Used by Chrome 35> and IE10>. By default this makes the element blocking any touch event.
             * @property defaults.behavior.touchAction
             * @type {String}
             * @default: 'pan-y'
             */
            touchAction: "pan-y",
            /**
             * Disables the default callout shown when you touch and hold a touch target.
             * On iOS, when you touch and hold a touch target such as a link, Safari displays
             * a callout containing information about the link. This property allows you to disable that callout.
             * @property defaults.behavior.touchCallout
             * @type {String}
             * @default 'none'
             */
            touchCallout: "none",
            /**
             * Specifies whether zooming is enabled. Used by IE10>
             * @property defaults.behavior.contentZooming
             * @type {String}
             * @default 'none'
             */
            contentZooming: "none",
            /**
             * Specifies that an entire element should be draggable instead of its contents.
             * Mainly for desktop browsers.
             * @property defaults.behavior.userDrag
             * @type {String}
             * @default 'none'
             */
            userDrag: "none",
            /**
             * Overrides the highlight color shown when the user taps a link or a JavaScript
             * clickable element in Safari on iPhone. This property obeys the alpha value, if specified.
             *
             * If you don't specify an alpha value, Safari on iPhone applies a default alpha value
             * to the color. To disable tap highlighting, set the alpha value to 0 (invisible).
             * If you set the alpha value to 1.0 (opaque), the element is not visible when tapped.
             * @property defaults.behavior.tapHighlightColor
             * @type {String}
             * @default 'rgba(0,0,0,0)'
             */
            tapHighlightColor: "rgba(0,0,0,0)"
          }
        };
        Hammer.DOCUMENT = document;
        Hammer.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;
        Hammer.HAS_TOUCHEVENTS = "ontouchstart" in window2;
        Hammer.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);
        Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && Hammer.IS_MOBILE || Hammer.HAS_POINTEREVENTS;
        Hammer.CALCULATE_INTERVAL = 25;
        var EVENT_TYPES = {};
        var DIRECTION_DOWN = Hammer.DIRECTION_DOWN = "down";
        var DIRECTION_LEFT = Hammer.DIRECTION_LEFT = "left";
        var DIRECTION_UP = Hammer.DIRECTION_UP = "up";
        var DIRECTION_RIGHT = Hammer.DIRECTION_RIGHT = "right";
        var POINTER_MOUSE = Hammer.POINTER_MOUSE = "mouse";
        var POINTER_TOUCH = Hammer.POINTER_TOUCH = "touch";
        var POINTER_PEN = Hammer.POINTER_PEN = "pen";
        var EVENT_START = Hammer.EVENT_START = "start";
        var EVENT_MOVE = Hammer.EVENT_MOVE = "move";
        var EVENT_END = Hammer.EVENT_END = "end";
        var EVENT_RELEASE = Hammer.EVENT_RELEASE = "release";
        var EVENT_TOUCH = Hammer.EVENT_TOUCH = "touch";
        Hammer.READY = false;
        Hammer.plugins = Hammer.plugins || {};
        Hammer.gestures = Hammer.gestures || {};
        function setup() {
          if (Hammer.READY) {
            return;
          }
          Event.determineEventTypes();
          Utils.each(Hammer.gestures, function(gesture) {
            Detection.register(gesture);
          });
          Event.onTouch(Hammer.DOCUMENT, EVENT_MOVE, Detection.detect);
          Event.onTouch(Hammer.DOCUMENT, EVENT_END, Detection.detect);
          Hammer.READY = true;
        }
        var Utils = Hammer.utils = {
          /**
           * extend method, could also be used for cloning when `dest` is an empty object.
           * changes the dest object
           * @method extend
           * @param {Object} dest
           * @param {Object} src
           * @param {Boolean} [merge=false]  do a merge
           * @return {Object} dest
           */
          extend: function extend(dest, src, merge) {
            for (var key in src) {
              if (!src.hasOwnProperty(key) || dest[key] !== undefined2 && merge) {
                continue;
              }
              dest[key] = src[key];
            }
            return dest;
          },
          /**
           * simple addEventListener wrapper
           * @method on
           * @param {HTMLElement} element
           * @param {String} type
           * @param {Function} handler
           */
          on: function on(element, type, handler) {
            element.addEventListener(type, handler, false);
          },
          /**
           * simple removeEventListener wrapper
           * @method off
           * @param {HTMLElement} element
           * @param {String} type
           * @param {Function} handler
           */
          off: function off(element, type, handler) {
            element.removeEventListener(type, handler, false);
          },
          /**
           * forEach over arrays and objects
           * @method each
           * @param {Object|Array} obj
           * @param {Function} iterator
           * @param {any} iterator.item
           * @param {Number} iterator.index
           * @param {Object|Array} iterator.obj the source object
           * @param {Object} context value to use as `this` in the iterator
           */
          each: function each(obj, iterator, context) {
            var i, len;
            if ("forEach" in obj) {
              obj.forEach(iterator, context);
            } else if (obj.length !== undefined2) {
              for (i = 0, len = obj.length; i < len; i++) {
                if (iterator.call(context, obj[i], i, obj) === false) {
                  return;
                }
              }
            } else {
              for (i in obj) {
                if (obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj) === false) {
                  return;
                }
              }
            }
          },
          /**
           * find if a string contains the string using indexOf
           * @method inStr
           * @param {String} src
           * @param {String} find
           * @return {Boolean} found
           */
          inStr: function inStr(src, find) {
            return src.indexOf(find) > -1;
          },
          /**
           * find if a array contains the object using indexOf or a simple polyfill
           * @method inArray
           * @param {String} src
           * @param {String} find
           * @return {Boolean|Number} false when not found, or the index
           */
          inArray: function inArray(src, find) {
            if (src.indexOf) {
              var index = src.indexOf(find);
              return index === -1 ? false : index;
            } else {
              for (var i = 0, len = src.length; i < len; i++) {
                if (src[i] === find) {
                  return i;
                }
              }
              return false;
            }
          },
          /**
           * convert an array-like object (`arguments`, `touchlist`) to an array
           * @method toArray
           * @param {Object} obj
           * @return {Array}
           */
          toArray: function toArray(obj) {
            return Array.prototype.slice.call(obj, 0);
          },
          /**
           * find if a node is in the given parent
           * @method hasParent
           * @param {HTMLElement} node
           * @param {HTMLElement} parent
           * @return {Boolean} found
           */
          hasParent: function hasParent(node, parent) {
            while (node) {
              if (node == parent) {
                return true;
              }
              node = node.parentNode;
            }
            return false;
          },
          /**
           * get the center of all the touches
           * @method getCenter
           * @param {Array} touches
           * @return {Object} center contains `pageX`, `pageY`, `clientX` and `clientY` properties
           */
          getCenter: function getCenter(touches) {
            var pageX = [], pageY = [], clientX = [], clientY = [], min = Math.min, max = Math.max;
            if (touches.length === 1) {
              return {
                pageX: touches[0].pageX,
                pageY: touches[0].pageY,
                clientX: touches[0].clientX,
                clientY: touches[0].clientY
              };
            }
            Utils.each(touches, function(touch) {
              pageX.push(touch.pageX);
              pageY.push(touch.pageY);
              clientX.push(touch.clientX);
              clientY.push(touch.clientY);
            });
            return {
              pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
              pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
              clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
              clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
            };
          },
          /**
           * calculate the velocity between two points. unit is in px per ms.
           * @method getVelocity
           * @param {Number} deltaTime
           * @param {Number} deltaX
           * @param {Number} deltaY
           * @return {Object} velocity `x` and `y`
           */
          getVelocity: function getVelocity(deltaTime, deltaX, deltaY) {
            return {
              x: Math.abs(deltaX / deltaTime) || 0,
              y: Math.abs(deltaY / deltaTime) || 0
            };
          },
          /**
           * calculate the angle between two coordinates
           * @method getAngle
           * @param {Touch} touch1
           * @param {Touch} touch2
           * @return {Number} angle
           */
          getAngle: function getAngle(touch1, touch2) {
            var x = touch2.clientX - touch1.clientX, y = touch2.clientY - touch1.clientY;
            return Math.atan2(y, x) * 180 / Math.PI;
          },
          /**
           * do a small comparision to get the direction between two touches.
           * @method getDirection
           * @param {Touch} touch1
           * @param {Touch} touch2
           * @return {String} direction matches `DIRECTION_LEFT|RIGHT|UP|DOWN`
           */
          getDirection: function getDirection(touch1, touch2) {
            var x = Math.abs(touch1.clientX - touch2.clientX), y = Math.abs(touch1.clientY - touch2.clientY);
            if (x >= y) {
              return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
            }
            return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
          },
          /**
           * calculate the distance between two touches
           * @method getDistance
           * @param {Touch}touch1
           * @param {Touch} touch2
           * @return {Number} distance
           */
          getDistance: function getDistance(touch1, touch2) {
            var x = touch2.clientX - touch1.clientX, y = touch2.clientY - touch1.clientY;
            return Math.sqrt(x * x + y * y);
          },
          /**
           * calculate the scale factor between two touchLists
           * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
           * @method getScale
           * @param {Array} start array of touches
           * @param {Array} end array of touches
           * @return {Number} scale
           */
          getScale: function getScale(start, end) {
            if (start.length >= 2 && end.length >= 2) {
              return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
            }
            return 1;
          },
          /**
           * calculate the rotation degrees between two touchLists
           * @method getRotation
           * @param {Array} start array of touches
           * @param {Array} end array of touches
           * @return {Number} rotation
           */
          getRotation: function getRotation(start, end) {
            if (start.length >= 2 && end.length >= 2) {
              return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
            }
            return 0;
          },
          /**
           * find out if the direction is vertical   *
           * @method isVertical
           * @param {String} direction matches `DIRECTION_UP|DOWN`
           * @return {Boolean} is_vertical
           */
          isVertical: function isVertical(direction) {
            return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
          },
          /**
           * set css properties with their prefixes
           * @param {HTMLElement} element
           * @param {String} prop
           * @param {String} value
           * @param {Boolean} [toggle=true]
           * @return {Boolean}
           */
          setPrefixedCss: function setPrefixedCss(element, prop, value, toggle) {
            var prefixes = ["", "Webkit", "Moz", "O", "ms"];
            prop = Utils.toCamelCase(prop);
            for (var i = 0; i < prefixes.length; i++) {
              var p = prop;
              if (prefixes[i]) {
                p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
              }
              if (p in element.style) {
                element.style[p] = (toggle == null || toggle) && value || "";
                break;
              }
            }
          },
          /**
           * toggle browser default behavior by setting css properties.
           * `userSelect='none'` also sets `element.onselectstart` to false
           * `userDrag='none'` also sets `element.ondragstart` to false
           *
           * @method toggleBehavior
           * @param {HtmlElement} element
           * @param {Object} props
           * @param {Boolean} [toggle=true]
           */
          toggleBehavior: function toggleBehavior(element, props, toggle) {
            if (!props || !element || !element.style) {
              return;
            }
            Utils.each(props, function(value, prop) {
              Utils.setPrefixedCss(element, prop, value, toggle);
            });
            var falseFn = toggle && function() {
              return false;
            };
            if (props.userSelect == "none") {
              element.onselectstart = falseFn;
            }
            if (props.userDrag == "none") {
              element.ondragstart = falseFn;
            }
          },
          /**
           * convert a string with underscores to camelCase
           * so prevent_default becomes preventDefault
           * @param {String} str
           * @return {String} camelCaseStr
           */
          toCamelCase: function toCamelCase(str) {
            return str.replace(/[_-]([a-z])/g, function(s) {
              return s[1].toUpperCase();
            });
          }
        };
        Hammer.Instance = function(element, options) {
          var self2 = this;
          setup();
          this.element = element;
          this.enabled = true;
          Utils.each(options, function(value, name) {
            delete options[name];
            options[Utils.toCamelCase(name)] = value;
          });
          this.options = Utils.extend(Utils.extend({}, Hammer.defaults), options || {});
          if (this.options.behavior) {
            Utils.toggleBehavior(this.element, this.options.behavior, true);
          }
          this.eventStartHandler = Event.onTouch(element, EVENT_START, function(ev) {
            if (self2.enabled && ev.eventType == EVENT_START) {
              Detection.startDetect(self2, ev);
            } else if (ev.eventType == EVENT_TOUCH) {
              Detection.detect(ev);
            }
          });
          this.eventHandlers = [];
        };
        Hammer.Instance.prototype = {
          /**
           * bind events to the instance
           * @method on
           * @chainable
           * @param {String} gestures multiple gestures by splitting with a space
           * @param {Function} handler
           * @param {Object} handler.ev event object
           */
          on: function onEvent(gestures, handler) {
            var self2 = this;
            Event.on(self2.element, gestures, handler, function(type) {
              self2.eventHandlers.push({ gesture: type, handler });
            });
            return self2;
          },
          /**
           * unbind events to the instance
           * @method off
           * @chainable
           * @param {String} gestures
           * @param {Function} handler
           */
          off: function offEvent(gestures, handler) {
            var self2 = this;
            Event.off(self2.element, gestures, handler, function(type) {
              var index = Utils.inArray({ gesture: type, handler });
              if (index !== false) {
                self2.eventHandlers.splice(index, 1);
              }
            });
            return self2;
          },
          /**
           * trigger gesture event
           * @method trigger
           * @chainable
           * @param {String} gesture
           * @param {Object} [eventData]
           */
          trigger: function triggerEvent(gesture, eventData) {
            if (!eventData) {
              eventData = {};
            }
            var event = Hammer.DOCUMENT.createEvent("Event");
            event.initEvent(gesture, true, true);
            event.gesture = eventData;
            var element = this.element;
            if (Utils.hasParent(eventData.target, element)) {
              element = eventData.target;
            }
            element.dispatchEvent(event);
            return this;
          },
          /**
           * enable of disable hammer.js detection
           * @method enable
           * @chainable
           * @param {Boolean} state
           */
          enable: function enable(state) {
            this.enabled = state;
            return this;
          },
          /**
           * dispose this hammer instance
           * @method dispose
           * @return {Null}
           */
          dispose: function dispose() {
            var i, eh;
            Utils.toggleBehavior(this.element, this.options.behavior, false);
            for (i = -1; eh = this.eventHandlers[++i]; ) {
              Utils.off(this.element, eh.gesture, eh.handler);
            }
            this.eventHandlers = [];
            Event.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);
            return null;
          }
        };
        var Event = Hammer.event = {
          /**
           * when touch events have been fired, this is true
           * this is used to stop mouse events
           * @property prevent_mouseevents
           * @private
           * @type {Boolean}
           */
          preventMouseEvents: false,
          /**
           * if EVENT_START has been fired
           * @property started
           * @private
           * @type {Boolean}
           */
          started: false,
          /**
           * when the mouse is hold down, this is true
           * @property should_detect
           * @private
           * @type {Boolean}
           */
          shouldDetect: false,
          /**
           * simple event binder with a hook and support for multiple types
           * @method on
           * @param {HTMLElement} element
           * @param {String} type
           * @param {Function} handler
           * @param {Function} [hook]
           * @param {Object} hook.type
           */
          on: function on(element, type, handler, hook) {
            var types = type.split(" ");
            Utils.each(types, function(type2) {
              Utils.on(element, type2, handler);
              hook && hook(type2);
            });
          },
          /**
           * simple event unbinder with a hook and support for multiple types
           * @method off
           * @param {HTMLElement} element
           * @param {String} type
           * @param {Function} handler
           * @param {Function} [hook]
           * @param {Object} hook.type
           */
          off: function off(element, type, handler, hook) {
            var types = type.split(" ");
            Utils.each(types, function(type2) {
              Utils.off(element, type2, handler);
              hook && hook(type2);
            });
          },
          /**
           * the core touch event handler.
           * this finds out if we should to detect gestures
           * @method onTouch
           * @param {HTMLElement} element
           * @param {String} eventType matches `EVENT_START|MOVE|END`
           * @param {Function} handler
           * @return onTouchHandler {Function} the core event handler
           */
          onTouch: function onTouch(element, eventType, handler) {
            var self2 = this;
            var onTouchHandler = function onTouchHandler2(ev) {
              var srcType = ev.type.toLowerCase(), isPointer = Hammer.HAS_POINTEREVENTS, isMouse = Utils.inStr(srcType, "mouse"), triggerType;
              if (isMouse && self2.preventMouseEvents) {
                return;
              } else if (isMouse && eventType == EVENT_START && ev.button === 0) {
                self2.preventMouseEvents = false;
                self2.shouldDetect = true;
              } else if (isPointer && eventType == EVENT_START) {
                self2.shouldDetect = ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev);
              } else if (!isMouse && eventType == EVENT_START) {
                self2.preventMouseEvents = true;
                self2.shouldDetect = true;
              }
              if (isPointer && eventType != EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
              }
              if (self2.shouldDetect) {
                triggerType = self2.doDetect.call(self2, ev, eventType, element, handler);
              }
              if (triggerType == EVENT_END) {
                self2.preventMouseEvents = false;
                self2.shouldDetect = false;
                PointerEvent.reset();
              }
              if (isPointer && eventType == EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
              }
            };
            this.on(element, EVENT_TYPES[eventType], onTouchHandler);
            return onTouchHandler;
          },
          /**
           * the core detection method
           * this finds out what hammer-touch-events to trigger
           * @method doDetect
           * @param {Object} ev
           * @param {String} eventType matches `EVENT_START|MOVE|END`
           * @param {HTMLElement} element
           * @param {Function} handler
           * @return {String} triggerType matches `EVENT_START|MOVE|END`
           */
          doDetect: function doDetect(ev, eventType, element, handler) {
            var touchList = this.getTouchList(ev, eventType);
            var touchListLength = touchList.length;
            var triggerType = eventType;
            var triggerChange = touchList.trigger;
            var changedLength = touchListLength;
            if (eventType == EVENT_START) {
              triggerChange = EVENT_TOUCH;
            } else if (eventType == EVENT_END) {
              triggerChange = EVENT_RELEASE;
              changedLength = touchList.length - (ev.changedTouches ? ev.changedTouches.length : 1);
            }
            if (changedLength > 0 && this.started) {
              triggerType = EVENT_MOVE;
            }
            this.started = true;
            var evData = this.collectEventData(element, triggerType, touchList, ev);
            if (eventType != EVENT_END) {
              handler.call(Detection, evData);
            }
            if (triggerChange) {
              evData.changedLength = changedLength;
              evData.eventType = triggerChange;
              handler.call(Detection, evData);
              evData.eventType = triggerType;
              delete evData.changedLength;
            }
            if (triggerType == EVENT_END) {
              handler.call(Detection, evData);
              this.started = false;
            }
            return triggerType;
          },
          /**
           * we have different events for each device/browser
           * determine what we need and set them in the EVENT_TYPES constant
           * the `onTouch` method is bind to these properties.
           * @method determineEventTypes
           * @return {Object} events
           */
          determineEventTypes: function determineEventTypes() {
            var types;
            if (Hammer.HAS_POINTEREVENTS) {
              if (window2.PointerEvent) {
                types = [
                  "pointerdown",
                  "pointermove",
                  "pointerup pointercancel lostpointercapture"
                ];
              } else {
                types = [
                  "MSPointerDown",
                  "MSPointerMove",
                  "MSPointerUp MSPointerCancel MSLostPointerCapture"
                ];
              }
            } else if (Hammer.NO_MOUSEEVENTS) {
              types = [
                "touchstart",
                "touchmove",
                "touchend touchcancel"
              ];
            } else {
              types = [
                "touchstart mousedown",
                "touchmove mousemove",
                "touchend touchcancel mouseup"
              ];
            }
            EVENT_TYPES[EVENT_START] = types[0];
            EVENT_TYPES[EVENT_MOVE] = types[1];
            EVENT_TYPES[EVENT_END] = types[2];
            return EVENT_TYPES;
          },
          /**
           * create touchList depending on the event
           * @method getTouchList
           * @param {Object} ev
           * @param {String} eventType
           * @return {Array} touches
           */
          getTouchList: function getTouchList(ev, eventType) {
            if (Hammer.HAS_POINTEREVENTS) {
              return PointerEvent.getTouchList();
            }
            if (ev.touches) {
              if (eventType == EVENT_MOVE) {
                return ev.touches;
              }
              var identifiers = [];
              var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
              var touchList = [];
              Utils.each(concat, function(touch) {
                if (Utils.inArray(identifiers, touch.identifier) === false) {
                  touchList.push(touch);
                }
                identifiers.push(touch.identifier);
              });
              return touchList;
            }
            ev.identifier = 1;
            return [ev];
          },
          /**
           * collect basic event data
           * @method collectEventData
           * @param {HTMLElement} element
           * @param {String} eventType matches `EVENT_START|MOVE|END`
           * @param {Array} touches
           * @param {Object} ev
           * @return {Object} ev
           */
          collectEventData: function collectEventData(element, eventType, touches, ev) {
            var pointerType = POINTER_TOUCH;
            if (Utils.inStr(ev.type, "mouse") || PointerEvent.matchType(POINTER_MOUSE, ev)) {
              pointerType = POINTER_MOUSE;
            } else if (PointerEvent.matchType(POINTER_PEN, ev)) {
              pointerType = POINTER_PEN;
            }
            return {
              center: Utils.getCenter(touches),
              timeStamp: Date.now(),
              target: ev.target,
              touches,
              eventType,
              pointerType,
              srcEvent: ev,
              /**
               * prevent the browser default actions
               * mostly used to disable scrolling of the browser
               */
              preventDefault: function() {
                var srcEvent = this.srcEvent;
                srcEvent.preventManipulation && srcEvent.preventManipulation();
                srcEvent.preventDefault && srcEvent.preventDefault();
              },
              /**
               * stop bubbling the event up to its parents
               */
              stopPropagation: function() {
                this.srcEvent.stopPropagation();
              },
              /**
               * immediately stop gesture detection
               * might be useful after a swipe was detected
               * @return {*}
               */
              stopDetect: function() {
                return Detection.stopDetect();
              }
            };
          }
        };
        var PointerEvent = Hammer.PointerEvent = {
          /**
           * holds all pointers, by `identifier`
           * @property pointers
           * @type {Object}
           */
          pointers: {},
          /**
           * get the pointers as an array
           * @method getTouchList
           * @return {Array} touchlist
           */
          getTouchList: function getTouchList() {
            var touchlist = [];
            Utils.each(this.pointers, function(pointer) {
              touchlist.push(pointer);
            });
            return touchlist;
          },
          /**
           * update the position of a pointer
           * @method updatePointer
           * @param {String} eventType matches `EVENT_START|MOVE|END`
           * @param {Object} pointerEvent
           */
          updatePointer: function updatePointer(eventType, pointerEvent) {
            if (eventType == EVENT_END || eventType != EVENT_END && pointerEvent.buttons !== 1) {
              delete this.pointers[pointerEvent.pointerId];
            } else {
              pointerEvent.identifier = pointerEvent.pointerId;
              this.pointers[pointerEvent.pointerId] = pointerEvent;
            }
          },
          /**
           * check if ev matches pointertype
           * @method matchType
           * @param {String} pointerType matches `POINTER_MOUSE|TOUCH|PEN`
           * @param {PointerEvent} ev
           */
          matchType: function matchType(pointerType, ev) {
            if (!ev.pointerType) {
              return false;
            }
            var pt = ev.pointerType, types = {};
            types[POINTER_MOUSE] = pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE);
            types[POINTER_TOUCH] = pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH);
            types[POINTER_PEN] = pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN);
            return types[pointerType];
          },
          /**
           * reset the stored pointers
           * @method reset
           */
          reset: function resetList() {
            this.pointers = {};
          }
        };
        var Detection = Hammer.detection = {
          // contains all registred Hammer.gestures in the correct order
          gestures: [],
          // data of the current Hammer.gesture detection session
          current: null,
          // the previous Hammer.gesture session data
          // is a full clone of the previous gesture.current object
          previous: null,
          // when this becomes true, no gestures are fired
          stopped: false,
          /**
           * start Hammer.gesture detection
           * @method startDetect
           * @param {Hammer.Instance} inst
           * @param {Object} eventData
           */
          startDetect: function startDetect(inst, eventData) {
            if (this.current) {
              return;
            }
            this.stopped = false;
            this.current = {
              inst,
              // reference to HammerInstance we're working for
              startEvent: Utils.extend({}, eventData),
              // start eventData for distances, timing etc
              lastEvent: false,
              // last eventData
              lastCalcEvent: false,
              // last eventData for calculations.
              futureCalcEvent: false,
              // last eventData for calculations.
              lastCalcData: {},
              // last lastCalcData
              name: ""
              // current gesture we're in/detected, can be 'tap', 'hold' etc
            };
            this.detect(eventData);
          },
          /**
           * Hammer.gesture detection
           * @method detect
           * @param {Object} eventData
           * @return {any}
           */
          detect: function detect(eventData) {
            if (!this.current || this.stopped) {
              return;
            }
            eventData = this.extendEventData(eventData);
            var inst = this.current.inst, instOptions = inst.options;
            Utils.each(this.gestures, function triggerGesture(gesture) {
              if (!this.stopped && inst.enabled && instOptions[gesture.name]) {
                gesture.handler.call(gesture, eventData, inst);
              }
            }, this);
            if (this.current) {
              this.current.lastEvent = eventData;
            }
            if (eventData.eventType == EVENT_END) {
              this.stopDetect();
            }
            return eventData;
          },
          /**
           * clear the Hammer.gesture vars
           * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
           * to stop other Hammer.gestures from being fired
           * @method stopDetect
           */
          stopDetect: function stopDetect() {
            this.previous = Utils.extend({}, this.current);
            this.current = null;
            this.stopped = true;
          },
          /**
           * calculate velocity, angle and direction
           * @method getVelocityData
           * @param {Object} ev
           * @param {Object} center
           * @param {Number} deltaTime
           * @param {Number} deltaX
           * @param {Number} deltaY
           */
          getCalculatedData: function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
            var cur = this.current, recalc = false, calcEv = cur.lastCalcEvent, calcData = cur.lastCalcData;
            if (calcEv && ev.timeStamp - calcEv.timeStamp > Hammer.CALCULATE_INTERVAL) {
              center = calcEv.center;
              deltaTime = ev.timeStamp - calcEv.timeStamp;
              deltaX = ev.center.clientX - calcEv.center.clientX;
              deltaY = ev.center.clientY - calcEv.center.clientY;
              recalc = true;
            }
            if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
              cur.futureCalcEvent = ev;
            }
            if (!cur.lastCalcEvent || recalc) {
              calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
              calcData.angle = Utils.getAngle(center, ev.center);
              calcData.direction = Utils.getDirection(center, ev.center);
              cur.lastCalcEvent = cur.futureCalcEvent || ev;
              cur.futureCalcEvent = ev;
            }
            ev.velocityX = calcData.velocity.x;
            ev.velocityY = calcData.velocity.y;
            ev.interimAngle = calcData.angle;
            ev.interimDirection = calcData.direction;
          },
          /**
           * extend eventData for Hammer.gestures
           * @method extendEventData
           * @param {Object} ev
           * @return {Object} ev
           */
          extendEventData: function extendEventData(ev) {
            var cur = this.current, startEv = cur.startEvent, lastEv = cur.lastEvent || startEv;
            if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
              startEv.touches = [];
              Utils.each(ev.touches, function(touch) {
                startEv.touches.push({
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
              });
            }
            var deltaTime = ev.timeStamp - startEv.timeStamp, deltaX = ev.center.clientX - startEv.center.clientX, deltaY = ev.center.clientY - startEv.center.clientY;
            this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);
            Utils.extend(ev, {
              startEvent: startEv,
              deltaTime,
              deltaX,
              deltaY,
              distance: Utils.getDistance(startEv.center, ev.center),
              angle: Utils.getAngle(startEv.center, ev.center),
              direction: Utils.getDirection(startEv.center, ev.center),
              scale: Utils.getScale(startEv.touches, ev.touches),
              rotation: Utils.getRotation(startEv.touches, ev.touches)
            });
            return ev;
          },
          /**
           * register new gesture
           * @method register
           * @param {Object} gesture object, see `gestures/` for documentation
           * @return {Array} gestures
           */
          register: function register(gesture) {
            var options = gesture.defaults || {};
            if (options[gesture.name] === undefined2) {
              options[gesture.name] = true;
            }
            Utils.extend(Hammer.defaults, options, true);
            gesture.index = gesture.index || 1e3;
            this.gestures.push(gesture);
            this.gestures.sort(function(a, b) {
              if (a.index < b.index) {
                return -1;
              }
              if (a.index > b.index) {
                return 1;
              }
              return 0;
            });
            return this.gestures;
          }
        };
        (function(name) {
          var triggered = false;
          function dragGesture(ev, inst) {
            var cur = Detection.current;
            if (inst.options.dragMaxTouches > 0 && ev.touches.length > inst.options.dragMaxTouches) {
              return;
            }
            switch (ev.eventType) {
              case EVENT_START:
                triggered = false;
                break;
              case EVENT_MOVE:
                if (ev.distance < inst.options.dragMinDistance && cur.name != name) {
                  return;
                }
                var startCenter = cur.startEvent.center;
                if (cur.name != name) {
                  cur.name = name;
                  if (inst.options.dragDistanceCorrection && ev.distance > 0) {
                    var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
                    startCenter.pageX += ev.deltaX * factor;
                    startCenter.pageY += ev.deltaY * factor;
                    startCenter.clientX += ev.deltaX * factor;
                    startCenter.clientY += ev.deltaY * factor;
                    ev = Detection.extendEventData(ev);
                  }
                }
                if (cur.lastEvent.dragLockToAxis || inst.options.dragLockToAxis && inst.options.dragLockMinDistance <= ev.distance) {
                  ev.dragLockToAxis = true;
                }
                var lastDirection = cur.lastEvent.direction;
                if (ev.dragLockToAxis && lastDirection !== ev.direction) {
                  if (Utils.isVertical(lastDirection)) {
                    ev.direction = ev.deltaY < 0 ? DIRECTION_UP : DIRECTION_DOWN;
                  } else {
                    ev.direction = ev.deltaX < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
                  }
                }
                if (!triggered) {
                  inst.trigger(name + "start", ev);
                  triggered = true;
                }
                inst.trigger(name, ev);
                inst.trigger(name + ev.direction, ev);
                var isVertical = Utils.isVertical(ev.direction);
                if (inst.options.dragBlockVertical && isVertical || inst.options.dragBlockHorizontal && !isVertical) {
                  ev.preventDefault();
                }
                break;
              case EVENT_RELEASE:
                if (triggered && ev.changedLength <= inst.options.dragMaxTouches) {
                  inst.trigger(name + "end", ev);
                  triggered = false;
                }
                break;
              case EVENT_END:
                triggered = false;
                break;
            }
          }
          Hammer.gestures.Drag = {
            name,
            index: 50,
            handler: dragGesture,
            defaults: {
              /**
               * minimal movement that have to be made before the drag event gets triggered
               * @property dragMinDistance
               * @type {Number}
               * @default 10
               */
              dragMinDistance: 10,
              /**
               * Set dragDistanceCorrection to true to make the starting point of the drag
               * be calculated from where the drag was triggered, not from where the touch started.
               * Useful to avoid a jerk-starting drag, which can make fine-adjustments
               * through dragging difficult, and be visually unappealing.
               * @property dragDistanceCorrection
               * @type {Boolean}
               * @default true
               */
              dragDistanceCorrection: true,
              /**
               * set 0 for unlimited, but this can conflict with transform
               * @property dragMaxTouches
               * @type {Number}
               * @default 1
               */
              dragMaxTouches: 1,
              /**
               * prevent default browser behavior when dragging occurs
               * be careful with it, it makes the element a blocking element
               * when you are using the drag gesture, it is a good practice to set this true
               * @property dragBlockHorizontal
               * @type {Boolean}
               * @default false
               */
              dragBlockHorizontal: false,
              /**
               * same as `dragBlockHorizontal`, but for vertical movement
               * @property dragBlockVertical
               * @type {Boolean}
               * @default false
               */
              dragBlockVertical: false,
              /**
               * dragLockToAxis keeps the drag gesture on the axis that it started on,
               * It disallows vertical directions if the initial direction was horizontal, and vice versa.
               * @property dragLockToAxis
               * @type {Boolean}
               * @default false
               */
              dragLockToAxis: false,
              /**
               * drag lock only kicks in when distance > dragLockMinDistance
               * This way, locking occurs only when the distance has become large enough to reliably determine the direction
               * @property dragLockMinDistance
               * @type {Number}
               * @default 25
               */
              dragLockMinDistance: 25
            }
          };
        })("drag");
        Hammer.gestures.Gesture = {
          name: "gesture",
          index: 1337,
          handler: function releaseGesture(ev, inst) {
            inst.trigger(this.name, ev);
          }
        };
        (function(name) {
          var timer;
          function holdGesture(ev, inst) {
            var options = inst.options, current = Detection.current;
            switch (ev.eventType) {
              case EVENT_START:
                clearTimeout(timer);
                current.name = name;
                timer = setTimeout(function() {
                  if (current && current.name == name) {
                    inst.trigger(name, ev);
                  }
                }, options.holdTimeout);
                break;
              case EVENT_MOVE:
                if (ev.distance > options.holdThreshold) {
                  clearTimeout(timer);
                }
                break;
              case EVENT_RELEASE:
                clearTimeout(timer);
                break;
            }
          }
          Hammer.gestures.Hold = {
            name,
            index: 10,
            defaults: {
              /**
               * @property holdTimeout
               * @type {Number}
               * @default 500
               */
              holdTimeout: 500,
              /**
               * movement allowed while holding
               * @property holdThreshold
               * @type {Number}
               * @default 2
               */
              holdThreshold: 2
            },
            handler: holdGesture
          };
        })("hold");
        Hammer.gestures.Release = {
          name: "release",
          index: Infinity,
          handler: function releaseGesture(ev, inst) {
            if (ev.eventType == EVENT_RELEASE) {
              inst.trigger(this.name, ev);
            }
          }
        };
        Hammer.gestures.Swipe = {
          name: "swipe",
          index: 40,
          defaults: {
            /**
             * @property swipeMinTouches
             * @type {Number}
             * @default 1
             */
            swipeMinTouches: 1,
            /**
             * @property swipeMaxTouches
             * @type {Number}
             * @default 1
             */
            swipeMaxTouches: 1,
            /**
             * horizontal swipe velocity
             * @property swipeVelocityX
             * @type {Number}
             * @default 0.6
             */
            swipeVelocityX: 0.6,
            /**
             * vertical swipe velocity
             * @property swipeVelocityY
             * @type {Number}
             * @default 0.6
             */
            swipeVelocityY: 0.6
          },
          handler: function swipeGesture(ev, inst) {
            if (ev.eventType == EVENT_RELEASE) {
              var touches = ev.touches.length, options = inst.options;
              if (touches < options.swipeMinTouches || touches > options.swipeMaxTouches) {
                return;
              }
              if (ev.velocityX > options.swipeVelocityX || ev.velocityY > options.swipeVelocityY) {
                inst.trigger(this.name, ev);
                inst.trigger(this.name + ev.direction, ev);
              }
            }
          }
        };
        (function(name) {
          var hasMoved = false;
          function tapGesture(ev, inst) {
            var options = inst.options, current = Detection.current, prev = Detection.previous, sincePrev, didDoubleTap;
            switch (ev.eventType) {
              case EVENT_START:
                hasMoved = false;
                break;
              case EVENT_MOVE:
                hasMoved = hasMoved || ev.distance > options.tapMaxDistance;
                break;
              case EVENT_END:
                if (!Utils.inStr(ev.srcEvent.type, "cancel") && ev.deltaTime < options.tapMaxTime && !hasMoved) {
                  sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
                  didDoubleTap = false;
                  if (prev && prev.name == name && (sincePrev && sincePrev < options.doubleTapInterval) && ev.distance < options.doubleTapDistance) {
                    inst.trigger("doubletap", ev);
                    didDoubleTap = true;
                  }
                  if (!didDoubleTap || options.tapAlways) {
                    current.name = name;
                    inst.trigger(current.name, ev);
                  }
                }
                break;
            }
          }
          Hammer.gestures.Tap = {
            name,
            index: 100,
            handler: tapGesture,
            defaults: {
              /**
               * max time of a tap, this is for the slow tappers
               * @property tapMaxTime
               * @type {Number}
               * @default 250
               */
              tapMaxTime: 250,
              /**
               * max distance of movement of a tap, this is for the slow tappers
               * @property tapMaxDistance
               * @type {Number}
               * @default 10
               */
              tapMaxDistance: 10,
              /**
               * always trigger the `tap` event, even while double-tapping
               * @property tapAlways
               * @type {Boolean}
               * @default true
               */
              tapAlways: true,
              /**
               * max distance between two taps
               * @property doubleTapDistance
               * @type {Number}
               * @default 20
               */
              doubleTapDistance: 20,
              /**
               * max time between two taps
               * @property doubleTapInterval
               * @type {Number}
               * @default 300
               */
              doubleTapInterval: 300
            }
          };
        })("tap");
        Hammer.gestures.Touch = {
          name: "touch",
          index: -Infinity,
          defaults: {
            /**
             * call preventDefault at touchstart, and makes the element blocking by disabling the scrolling of the page,
             * but it improves gestures like transforming and dragging.
             * be careful with using this, it can be very annoying for users to be stuck on the page
             * @property preventDefault
             * @type {Boolean}
             * @default false
             */
            preventDefault: false,
            /**
             * disable mouse events, so only touch (or pen!) input triggers events
             * @property preventMouse
             * @type {Boolean}
             * @default false
             */
            preventMouse: false
          },
          handler: function touchGesture(ev, inst) {
            if (inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
              ev.stopDetect();
              return;
            }
            if (inst.options.preventDefault) {
              ev.preventDefault();
            }
            if (ev.eventType == EVENT_TOUCH) {
              inst.trigger("touch", ev);
            }
          }
        };
        (function(name) {
          var triggered = false;
          function transformGesture(ev, inst) {
            switch (ev.eventType) {
              case EVENT_START:
                triggered = false;
                break;
              case EVENT_MOVE:
                if (ev.touches.length < 2) {
                  return;
                }
                var scaleThreshold = Math.abs(1 - ev.scale);
                var rotationThreshold = Math.abs(ev.rotation);
                if (scaleThreshold < inst.options.transformMinScale && rotationThreshold < inst.options.transformMinRotation) {
                  return;
                }
                Detection.current.name = name;
                if (!triggered) {
                  inst.trigger(name + "start", ev);
                  triggered = true;
                }
                inst.trigger(name, ev);
                if (rotationThreshold > inst.options.transformMinRotation) {
                  inst.trigger("rotate", ev);
                }
                if (scaleThreshold > inst.options.transformMinScale) {
                  inst.trigger("pinch", ev);
                  inst.trigger("pinch" + (ev.scale < 1 ? "in" : "out"), ev);
                }
                break;
              case EVENT_RELEASE:
                if (triggered && ev.changedLength < 2) {
                  inst.trigger(name + "end", ev);
                  triggered = false;
                }
                break;
            }
          }
          Hammer.gestures.Transform = {
            name,
            index: 45,
            defaults: {
              /**
               * minimal scale factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
               * @property transformMinScale
               * @type {Number}
               * @default 0.01
               */
              transformMinScale: 0.01,
              /**
               * rotation in degrees
               * @property transformMinRotation
               * @type {Number}
               * @default 1
               */
              transformMinRotation: 1
            },
            handler: transformGesture
          };
        })("transform");
        window2.Hammer = Hammer;
        if (typeof module !== "undefined" && module.exports) {
          module.exports = Hammer;
        }
        function setupPlugin(Hammer2, $) {
          if (!Date.now) {
            Date.now = function now() {
              return (/* @__PURE__ */ new Date()).getTime();
            };
          }
          Hammer2.utils.each(["on", "off"], function(method) {
            Hammer2.utils[method] = function(element, type, handler) {
              $(element)[method](type, function($ev) {
                var data = $.extend({}, $ev.originalEvent, $ev);
                if (data.button === undefined2) {
                  data.button = $ev.which - 1;
                }
                handler.call(this, data);
              });
            };
          });
          Hammer2.Instance.prototype.trigger = function(gesture, eventData) {
            var el = $(this.element);
            if (el.has(eventData.target).length) {
              el = $(eventData.target);
            }
            return el.trigger({
              type: gesture,
              gesture: eventData
            });
          };
          $.fn.hammer = function(options) {
            return this.each(function() {
              var el = $(this);
              var inst = el.data("hammer");
              if (!inst) {
                el.data("hammer", new Hammer2(this, options || {}));
              } else if (inst && options) {
                Hammer2.utils.extend(inst.options, options);
              }
            });
          };
        }
        if (typeof define == "function" && define.amd) {
          define(["jquery"], function($) {
            return setupPlugin(window2.Hammer, $);
          });
        } else {
          setupPlugin(window2.Hammer, window2.jQuery || window2.Zepto);
        }
      })(window);
    }
  });

  // vendor/mapjs/test/esbuild-shims/jquery-hammer-shim.js
  var require_jquery_hammer_shim = __commonJS({
    "vendor/mapjs/test/esbuild-shims/jquery-hammer-shim.js"(exports, module) {
      window.jQuery = window.jQuery || require_jquery();
      require_jquery_hammer_full();
      module.exports = window.Hammer;
    }
  });

  // vendor/mapjs/src/browser/hammer-draggable.js
  var require_hammer_draggable = __commonJS({
    "vendor/mapjs/src/browser/hammer-draggable.js"() {
      var $ = require_jquery();
      var Hammer = require_jquery_hammer_shim();
      var onDrag = function(e) {
        "use strict";
        $(this).trigger(
          $.Event("mm:start-dragging", {
            relatedTarget: this,
            gesture: e.gesture
          })
        );
        e.stopPropagation();
        e.preventDefault();
        if (e.gesture) {
          e.gesture.stopPropagation();
          e.gesture.preventDefault();
        }
      };
      var onShadowDrag = function(e) {
        "use strict";
        $(this).trigger(
          $.Event("mm:start-dragging-shadow", {
            relatedTarget: this,
            gesture: e.gesture
          })
        );
        e.stopPropagation();
        e.preventDefault();
        if (e.gesture) {
          e.gesture.stopPropagation();
          e.gesture.preventDefault();
        }
      };
      $.fn.simpleDraggableContainer = function() {
        "use strict";
        let currentDragObject, originalDragObjectPosition;
        const container = this, drag = function(event) {
          if (currentDragObject && event.gesture) {
            const newpos = {
              top: Math.round(parseInt(originalDragObjectPosition.top, 10) + event.gesture.deltaY),
              left: Math.round(parseInt(originalDragObjectPosition.left, 10) + event.gesture.deltaX)
            };
            currentDragObject.css(newpos).trigger($.Event("mm:drag", { currentPosition: newpos, gesture: event.gesture }));
            if (event.gesture) {
              event.gesture.preventDefault();
            }
            return false;
          }
        }, rollback = function(e) {
          const target = currentDragObject;
          if (target.attr("mapjs-drag-role") !== "shadow") {
            target.animate(originalDragObjectPosition, {
              complete: function() {
                target.trigger($.Event("mm:cancel-dragging", { gesture: e.gesture }));
              },
              progress: function() {
                target.trigger("mm:drag");
              }
            });
          } else {
            target.trigger($.Event("mm:cancel-dragging", { gesture: e.gesture }));
          }
        };
        Hammer(this, { "drag_min_distance": 2 });
        return this.on("mm:start-dragging", function(event) {
          if (!currentDragObject) {
            currentDragObject = $(event.relatedTarget);
            originalDragObjectPosition = {
              top: currentDragObject.css("top"),
              left: currentDragObject.css("left")
            };
            $(this).on("drag", drag);
          }
        }).on("mm:start-dragging-shadow", function(event) {
          const target = $(event.relatedTarget), clone = function() {
            const result = target.clone().addClass("drag-shadow").appendTo(container).offset(target.offset()).data(target.data()).attr("mapjs-drag-role", "shadow"), scale = target.parent().data("scale") || 1;
            if (scale !== 0) {
              result.css({
                "transform": "scale(" + scale + ")",
                "transform-origin": "top left"
              });
            }
            return result;
          };
          if (!currentDragObject) {
            currentDragObject = clone();
            originalDragObjectPosition = {
              top: currentDragObject.css("top"),
              left: currentDragObject.css("left")
            };
            currentDragObject.on("mm:stop-dragging mm:cancel-dragging", function(e) {
              this.remove();
              e.stopPropagation();
              e.stopImmediatePropagation();
              const evt = $.Event(e.type, {
                gesture: e.gesture,
                finalPosition: e.finalPosition
              });
              target.trigger(evt);
            }).on("mm:drag", function(e) {
              target.trigger(e);
            });
            $(this).on("drag", drag);
          }
        }).on("dragend", function(e) {
          $(this).off("drag", drag);
          if (currentDragObject) {
            const evt = $.Event("mm:stop-dragging", {
              gesture: e.gesture,
              finalPosition: currentDragObject.offset()
            });
            currentDragObject.trigger(evt);
            if (evt.result === false) {
              rollback(e);
            }
            currentDragObject = void 0;
          }
        }).on("mouseleave", function(e) {
          if (currentDragObject) {
            $(this).off("drag", drag);
            rollback(e);
            currentDragObject = void 0;
          }
        }).attr("data-drag-role", "container");
      };
      $.fn.simpleDraggable = function(options) {
        "use strict";
        if (!options || !options.disable) {
          return $(this).on("dragstart", onDrag);
        } else {
          return $(this).off("dragstart", onDrag);
        }
      };
      $.fn.shadowDraggable = function(options) {
        "use strict";
        if (!options || !options.disable) {
          return $(this).on("dragstart", onShadowDrag);
        } else {
          return $(this).off("dragstart", onShadowDrag);
        }
      };
    }
  });

  // vendor/mapjs/src/browser/node-resize-widget.js
  var require_node_resize_widget = __commonJS({
    "vendor/mapjs/src/browser/node-resize-widget.js"() {
      var jQuery3 = require_jquery();
      require_hammer_draggable();
      jQuery3.fn.nodeResizeWidget = function(nodeId, mapModel, stagePositionForPointEvent) {
        "use strict";
        return this.each(function() {
          let initialPosition, initialWidth, initialStyle;
          const element = jQuery3(this), minAllowedWidth = 50, nodeTextElement = element.find("span[data-mapjs-role=title]"), nodeTextDOM = nodeTextElement[0], stopEvent = function(evt) {
            if (evt) {
              evt.stopPropagation();
            }
            if (evt && evt.gesture) {
              evt.gesture.stopPropagation();
            }
          }, calcDragWidth = function(evt) {
            const pos = stagePositionForPointEvent(evt), dx = pos && initialPosition && pos.x - initialPosition.x, dragWidth = dx && Math.max(minAllowedWidth, initialWidth + dx);
            return dragWidth;
          }, dragHandle = jQuery3("<div>").addClass("resize-node").shadowDraggable().on("mm:start-dragging mm:start-dragging-shadow", function(evt) {
            if (!mapModel.isEditingEnabled()) {
              return stopEvent(evt);
            }
            mapModel.selectNode(nodeId);
            initialPosition = stagePositionForPointEvent(evt);
            initialWidth = nodeTextElement.innerWidth();
            initialStyle = {
              "node.min-width": element.css("min-width"),
              "span.min-width": nodeTextElement.css("min-width"),
              "span.max-width": nodeTextElement.css("max-width")
            };
          }).on("mm:stop-dragging mm:cancel-dragging", function(evt) {
            if (!mapModel.isEditingEnabled()) {
              return stopEvent(evt);
            }
            const dragWidth = nodeTextElement.outerWidth();
            nodeTextElement.css({ "max-width": initialStyle["span.max-width"], "min-width": initialStyle["span.min-width"] });
            element.css("min-width", initialStyle["node.min-width"]);
            if (evt) {
              evt.stopPropagation();
            }
            if (evt && evt.gesture) {
              evt.gesture.stopPropagation();
            }
            element.trigger(jQuery3.Event("mm:resize", { nodeWidth: dragWidth }));
          }).on("mm:drag", function(evt) {
            if (!mapModel.isEditingEnabled()) {
              return stopEvent(evt);
            }
            let dragWidth = calcDragWidth(evt);
            if (dragWidth) {
              nodeTextElement.css({ "max-width": dragWidth, "min-width": dragWidth });
              element.css("min-width", nodeTextElement.outerWidth());
              if (nodeTextDOM.scrollWidth > nodeTextDOM.offsetWidth) {
                dragWidth = nodeTextDOM.scrollWidth;
                nodeTextElement.css({ "max-width": dragWidth, "min-width": dragWidth });
                element.css("min-width", nodeTextElement.outerWidth());
              }
            }
            stopEvent(evt);
          });
          dragHandle.appendTo(element);
        });
      };
    }
  });

  // vendor/mapjs/src/core/theme/line-strokes.js
  var require_line_strokes = __commonJS({
    "vendor/mapjs/src/core/theme/line-strokes.js"(exports, module) {
      module.exports = {
        dashed: "8, 8",
        solid: ""
      };
    }
  });

  // vendor/mapjs/src/core/theme/line-styles.js
  var require_line_styles = __commonJS({
    "vendor/mapjs/src/core/theme/line-styles.js"(exports, module) {
      module.exports = {
        strokes: (name, width) => {
          "use strict";
          if (!name || name === "solid") {
            return "";
          }
          const multipleWidth = Math.max(width || 1, 1) * 4;
          if (name === "dashed") {
            return [multipleWidth, multipleWidth].join(", ");
          } else {
            return [1, multipleWidth].join(", ");
          }
        },
        linecap: (name) => {
          "use strict";
          if (!name || name === "solid") {
            return "square";
          }
          if (name === "dotted") {
            return "round";
          }
          return "";
        }
      };
    }
  });

  // vendor/mapjs/src/core/util/convert-position-to-transform.js
  var require_convert_position_to_transform = __commonJS({
    "vendor/mapjs/src/core/util/convert-position-to-transform.js"(exports, module) {
      var _ = require_underscore_umd();
      module.exports = function convertPositionToTransform(cssPosition) {
        "use strict";
        const position = _.omit(cssPosition, "left", "top");
        position.transform = "translate(" + cssPosition.left + "px," + cssPosition.top + "px)";
        return position;
      };
    }
  });

  // vendor/mapjs/src/browser/update-connector-text.js
  var require_update_connector_text = __commonJS({
    "vendor/mapjs/src/browser/update-connector-text.js"(exports, module) {
      var createSVG = require_create_svg();
      var getTextElement = function(parentElement, labelText, elementType, centrePoint) {
        "use strict";
        elementType = elementType || "text";
        let textElement = parentElement.find(elementType + ".mapjs-connector-text");
        if (!labelText) {
          textElement.remove();
          return false;
        } else {
          if (textElement.length === 0) {
            textElement = createSVG(elementType).attr("class", "mapjs-connector-text");
            if (centrePoint) {
              textElement[0].style.transform = `translate(${centrePoint.x}px, ${centrePoint.y}px)`;
            }
            textElement.appendTo(parentElement);
          }
          return textElement;
        }
      };
      var updateConnectorText = function(parentElement, centrePoint, labelText, labelTheme) {
        "use strict";
        const g = getTextElement(parentElement, labelText, "g", centrePoint), rectElement = g && getTextElement(g, labelText, "rect"), textElement = g && getTextElement(g, labelText), textDOM = textElement && textElement[0], rectDOM = rectElement && rectElement[0], translate = {};
        let dimensions = false;
        if (!textDOM) {
          return false;
        }
        const labelFont = labelTheme.text && labelTheme.text.font || {}, labelFontPx = labelFont.sizePx || labelFont.size && Math.round(labelFont.size * 96 / 72) || 12;
        textDOM.style.stroke = "none";
        textDOM.style.fill = labelTheme.text && labelTheme.text.color || "#4F4F4F";
        textDOM.style.fontSize = labelFontPx + "px";
        textDOM.style.fontWeight = labelFont.weight || "bold";
        textDOM.style.dominantBaseline = "hanging";
        textElement.text(labelText.trim());
        dimensions = textDOM.getBBox && textDOM.getBBox() || textDOM.getClientRects()[0];
        translate.x = Math.round(centrePoint.x - dimensions.width / 2);
        translate.y = Math.round(labelTheme.position && labelTheme.position.centerOnLine ? centrePoint.y - dimensions.height / 2 : centrePoint.y - dimensions.height - 2);
        g[0].style.transform = `translate(${translate.x}px, ${translate.y}px)`;
        textDOM.setAttribute("x", 0);
        textDOM.setAttribute("y", 2);
        rectDOM.setAttribute("x", 0);
        rectDOM.setAttribute("y", 0);
        rectDOM.setAttribute("height", Math.round(dimensions.height));
        rectDOM.setAttribute("width", Math.round(dimensions.width));
        rectDOM.style.fill = labelTheme.backgroundColor;
        rectDOM.style.stroke = labelTheme.borderColor;
        return textElement;
      };
      module.exports = updateConnectorText;
    }
  });

  // vendor/mapjs/src/browser/calc-label-center-point.js
  var require_calc_label_center_point = __commonJS({
    "vendor/mapjs/src/browser/calc-label-center-point.js"(exports, module) {
      var defaultTheme = require_default_theme();
      var createSVG = require_create_svg();
      var pathElement = createSVG("path");
      module.exports = function calcLabelCenterPoint(connectionPosition, fromBox, toBox, d, labelTheme) {
        "use strict";
        labelTheme = labelTheme || defaultTheme.connector.default.label;
        const labelPosition = labelTheme.position || {};
        pathElement.attr("d", d);
        if (labelPosition.aboveEnd || labelPosition.belowStart || labelPosition.midSpan) {
          const middleToBox = toBox.left + toBox.width / 2 - connectionPosition.left, middleFromBox = fromBox.left + fromBox.width / 2 - connectionPosition.left, multiplier = labelPosition.ratio || 1, startY = fromBox.top + fromBox.height - connectionPosition.top, endY = toBox.top - connectionPosition.top, y = labelPosition.midSpan ? Math.round((startY + endY) / 2) : labelPosition.aboveEnd ? endY - labelPosition.aboveEnd : startY + labelPosition.belowStart, path = pathElement[0], total = path.getTotalLength ? path.getTotalLength() : 0;
          if (total > 0) {
            const start = path.getPointAtLength(0), end = path.getPointAtLength(total);
            if (start.y < end.y && y > start.y && y < end.y) {
              let lo = 0, hi = total;
              for (let i = 0; i < 20; i++) {
                const mid = (lo + hi) / 2;
                if (path.getPointAtLength(mid).y < y) {
                  lo = mid;
                } else {
                  hi = mid;
                }
              }
              return {
                x: Math.round(path.getPointAtLength((lo + hi) / 2).x),
                y
              };
            }
          }
          return {
            x: Math.round(middleFromBox + multiplier * (middleToBox - middleFromBox)),
            y
          };
        } else if (labelPosition.ratio) {
          return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * labelTheme.position.ratio);
        }
        return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * 0.5);
      };
    }
  });

  // vendor/mapjs/src/core/theme/calc-child-position.js
  var require_calc_child_position = __commonJS({
    "vendor/mapjs/src/core/theme/calc-child-position.js"(exports, module) {
      module.exports = function calcChildPosition(parent, child, tolerance) {
        "use strict";
        const childMid = child.top + child.height * 0.5;
        if (childMid < parent.top - tolerance) {
          return "above";
        }
        if (childMid > parent.top + parent.height + tolerance) {
          return "below";
        }
        return "horizontal";
      };
    }
  });

  // vendor/mapjs/src/core/theme/arrow-path.js
  var require_arrow_path = __commonJS({
    "vendor/mapjs/src/core/theme/arrow-path.js"(exports, module) {
      module.exports = function arrowPath(lineFrom, lineTo, offset) {
        "use strict";
        const n = Math.tan(Math.PI / 9), dx = lineTo.x - lineFrom.x, dy = lineTo.y - lineFrom.y;
        let len = 14, iy, a1x, a2x, a1y, a2y, m;
        if (dx === 0) {
          iy = dy < 0 ? -1 : 1;
          a1x = lineTo.x + len * Math.sin(n) * iy;
          a2x = lineTo.x - len * Math.sin(n) * iy;
          a1y = lineTo.y - len * Math.cos(n) * iy;
          a2y = lineTo.y - len * Math.cos(n) * iy;
        } else {
          m = dy / dx;
          if (lineFrom.x < lineTo.x) {
            len = -len;
          }
          a1x = lineTo.x + (1 - m * n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
          a1y = lineTo.y + (m + n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
          a2x = lineTo.x + (1 + m * n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
          a2y = lineTo.y + (m - n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
        }
        return "M" + Math.round(a1x - offset.left) + "," + Math.round(a1y - offset.top) + "L" + Math.round(lineTo.x - offset.left) + "," + Math.round(lineTo.y - offset.top) + "L" + Math.round(a2x - offset.left) + "," + Math.round(a2y - offset.top) + "Z";
      };
      module.exports.axisLength = 14 * Math.cos(Math.PI / 9);
    }
  });

  // vendor/mapjs/src/core/theme/line-types.js
  var require_line_types = __commonJS({
    "vendor/mapjs/src/core/theme/line-types.js"(exports, module) {
      var arrowPath = require_arrow_path();
      var HEAD = arrowPath.axisLength;
      var lerp = function(a, b, t) {
        "use strict";
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      };
      var distance = function(a, b) {
        "use strict";
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
      };
      var quadPoint = function(p0, c, p1, t) {
        "use strict";
        return lerp(lerp(p0, c, t), lerp(c, p1, t), t);
      };
      var headSplit = function(p0, c, p1) {
        "use strict";
        let lo = 0, hi = 1, i, mid;
        if (distance(p0, p1) < HEAD + 4) {
          return null;
        }
        for (i = 0; i < 24; i++) {
          mid = (lo + hi) / 2;
          if (distance(p0, quadPoint(p0, c, p1, mid)) < HEAD) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        return (lo + hi) / 2;
      };
      var straight = function(calculatedConnector, position) {
        "use strict";
        return {
          "d": "M" + Math.round(calculatedConnector.from.x - position.left) + "," + Math.round(calculatedConnector.from.y - position.top) + "L" + Math.round(calculatedConnector.to.x - position.left) + "," + Math.round(calculatedConnector.to.y - position.top),
          "position": position
        };
      };
      module.exports = {
        "quadratic": function(calculatedConnector, position, parent, child) {
          "use strict";
          const maxOffset = Math.min(child.height, parent.height) * 1.2, requestedOffset = calculatedConnector.connectorTheme.controlPoint.height * (calculatedConnector.from.y - calculatedConnector.to.y), offset = Math.max(-maxOffset, Math.min(maxOffset, requestedOffset));
          if (Math.round(calculatedConnector.from.y) === Math.round(calculatedConnector.to.y - offset)) {
            return straight(calculatedConnector, position);
          }
          return {
            "d": "M" + Math.round(calculatedConnector.from.x - position.left) + "," + Math.round(calculatedConnector.from.y - position.top) + "Q" + Math.round(calculatedConnector.from.x - position.left) + "," + Math.round(calculatedConnector.to.y - offset - position.top) + " " + Math.round(calculatedConnector.to.x - position.left) + "," + Math.round(calculatedConnector.to.y - position.top),
            "position": position
          };
        },
        "s-curve": function(calculatedConnector, position) {
          "use strict";
          const initialRadius = 10, dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x), dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y), dxIncrement = initialRadius < Math.abs(dx * 0.5) ? initialRadius * Math.sign(dx) : Math.round(dx * 0.5), dyIncrement = initialRadius < Math.abs(dy * 0.5) ? initialRadius * Math.sign(dy) : Math.round(dy * 0.5);
          return {
            "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "q" + dxIncrement + ",0 " + dxIncrement + "," + dyIncrement + "c0," + (dy - 2 * dyIncrement) + " " + Math.round(dx / 2 - dxIncrement) + "," + (dy - dyIncrement) + " " + (dx - dxIncrement) + "," + (dy - dyIncrement),
            "position": position
          };
        },
        "top-down-s-curve": function(calculatedConnector, position) {
          "use strict";
          const dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x), dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y), initialRadius = 15, dxIncrement = initialRadius * Math.sign(dx), dyIncrement = initialRadius * Math.sign(dy), verticalLine = Math.round(0.5 * dy) - dyIncrement, flatLine = function() {
            const yIncrement = verticalLine + Math.round(0.5 * dyIncrement);
            return {
              "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "v" + yIncrement + "l" + dx + "," + (dy - yIncrement),
              "position": position,
              "initialRadius": 5
            };
          };
          if (initialRadius > Math.abs(dx / 2)) {
            return flatLine();
          }
          return {
            "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "v" + verticalLine + "q0," + dyIncrement + " " + dxIncrement + "," + dyIncrement + "h" + (dx - 2 * dxIncrement) + "q" + dxIncrement + ",0 " + dxIncrement + "," + dyIncrement + "v" + verticalLine,
            "position": position,
            "initialRadius": 5
          };
        },
        "compact-s-curve": function(calculatedConnector, position) {
          "use strict";
          const initialRadius = 10, dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x), dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y), dxIncrement = initialRadius * Math.sign(dx), dyIncrement = initialRadius * Math.sign(dy), flatLine = function() {
            const xIncrement = Math.round(dx / 2);
            return {
              "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "l" + xIncrement + ",0 l" + (dx - xIncrement) + "," + dy,
              "position": position
            };
          };
          if (initialRadius > Math.abs(dx * 0.5) || initialRadius > Math.abs(dy * 0.5)) {
            return flatLine();
          }
          return {
            "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "q" + dxIncrement + ",0 " + dxIncrement + "," + dyIncrement + "v" + (dy - 2 * dyIncrement) + "q0," + dyIncrement + " " + dxIncrement + "," + dyIncrement + "h" + (dx - 2 * dxIncrement),
            "position": position
          };
        },
        "vertical-quadratic-s-curve": function(calculatedConnector, position) {
          "use strict";
          const from = calculatedConnector.from, to = calculatedConnector.to, dx = Math.round(to.x - from.x), dy = Math.round(to.y - from.y), dxIncrement = dx / 2, dyIncrement = dy / 2, arrow = calculatedConnector.connectorTheme && calculatedConnector.connectorTheme.arrow, xy = function(p) {
            return p.x - position.left + "," + (p.y - position.top);
          };
          if (Math.abs(dx) < 20) {
            const end2 = { x: from.x + dx, y: from.y + dy }, span = distance(from, end2), room = span > HEAD + 4, unit = { x: dx / (span || 1), y: dy / (span || 1) }, lineStart2 = arrow === "from" && room ? { x: from.x + unit.x * HEAD, y: from.y + unit.y * HEAD } : from, lineEnd2 = arrow === "to" && room ? { x: end2.x - unit.x * HEAD, y: end2.y - unit.y * HEAD } : end2;
            return {
              "d": "M" + xy(lineStart2) + "L" + xy(lineEnd2) + (arrow === "to" && room ? "M" + xy(end2) : ""),
              initialRadius: 10,
              "position": position,
              arrowStems: { from: room ? lineStart2 : end2, to: room ? lineEnd2 : from }
            };
          }
          const mid = { x: from.x + dxIncrement, y: from.y + dyIncrement }, fromControl = { x: from.x, y: from.y + Math.round(dyIncrement / 2) }, toControl = { x: mid.x + dxIncrement, y: mid.y + Math.round(dyIncrement / 2) }, end = { x: mid.x + dxIncrement, y: mid.y + dyIncrement };
          let lineStart = from, startControl = fromControl, lineEnd = end, endControl = toControl, stemFrom = mid, stemTo = mid, restoreEnd = "";
          if (arrow === "from") {
            const t = headSplit(from, fromControl, mid);
            if (t) {
              startControl = lerp(fromControl, mid, t);
              lineStart = lerp(lerp(from, fromControl, t), startControl, t);
              stemFrom = lineStart;
            }
          } else if (arrow === "to") {
            const s = headSplit(end, toControl, mid);
            if (s) {
              const t = 1 - s;
              endControl = lerp(mid, toControl, t);
              lineEnd = lerp(endControl, lerp(toControl, end, t), t);
              stemTo = lineEnd;
              restoreEnd = "M" + xy(end);
            }
          }
          return {
            "d": "M" + xy(lineStart) + "Q" + xy(startControl) + " " + xy(mid) + "Q" + xy(endControl) + " " + xy(lineEnd) + restoreEnd,
            initialRadius: 10,
            "position": position,
            arrowStems: { from: stemFrom, to: stemTo }
          };
        },
        "vertical-s-curve": function(calculatedConnector, position) {
          "use strict";
          const initialRadius = 10, dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x), dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y), dxIncrement = initialRadius * Math.sign(dx), dyIncrement = initialRadius * Math.sign(dy);
          if (initialRadius > Math.abs(dx * 0.5) || initialRadius > Math.abs(dy * 0.5)) {
            return {
              "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "l" + dx + "," + dy,
              "position": position
            };
          }
          return {
            "d": "M" + (calculatedConnector.from.x - position.left) + "," + (calculatedConnector.from.y - position.top) + "q0," + dyIncrement + " " + dxIncrement + "," + dyIncrement + "h" + (dx - 2 * dxIncrement) + "q" + dxIncrement + ",0 " + dxIncrement + "," + dyIncrement + "v" + (dy - 2 * dyIncrement),
            "position": position
          };
        },
        "straight": straight,
        "no-connector": function(calculatedConnector, position) {
          "use strict";
          return {
            "d": "M" + Math.round(calculatedConnector.to.x - position.left) + "," + Math.round(calculatedConnector.to.y - position.top),
            "position": position
          };
        }
      };
    }
  });

  // vendor/mapjs/src/core/theme/node-connection-point-x.js
  var require_node_connection_point_x = __commonJS({
    "vendor/mapjs/src/core/theme/node-connection-point-x.js"(exports, module) {
      var nearestInset = function(node, relatedNode, inset) {
        "use strict";
        if (node.left + node.width < relatedNode.left) {
          return node.left + node.width - inset;
        }
        return node.left + inset;
      };
      module.exports = {
        "center": function(node) {
          "use strict";
          return Math.round(node.left + node.width * 0.5);
        },
        "center-separated": function(node, relatedNode, horizontalInset, verticalInsetRatio) {
          "use strict";
          const insetY = node.height * (verticalInsetRatio || 0.2), insetX = horizontalInset || 10, halfWidth = node.width / 2, nodeMidX = node.left + halfWidth, relatedNodeMidX = relatedNode.left + relatedNode.width / 2, relatedNodeRight = relatedNode.left + relatedNode.width, dy = relatedNode.top - node.top + node.height - insetY, calcDx = function() {
            if (relatedNode.left > node.left + node.width) {
              return relatedNode.left - nodeMidX;
            } else if (relatedNodeRight < node.left) {
              return relatedNodeRight - nodeMidX;
            } else if (relatedNode.left < nodeMidX) {
              return relatedNodeMidX - nodeMidX;
            } else {
              return relatedNodeMidX - nodeMidX;
            }
          }, dx = calcDx(), requestedOffset = dx / Math.abs(dy) * insetY, cappedOffset = Math.max(requestedOffset, halfWidth * -1 + insetX), offsetX = Math.min(cappedOffset, halfWidth - insetX);
          return Math.round(node.left + node.width * 0.5 + offsetX);
        },
        "nearest": function(node, relatedNode) {
          "use strict";
          return nearestInset(node, relatedNode, 0);
        },
        "nearest-inset": nearestInset
      };
    }
  });

  // vendor/mapjs/src/core/theme/connector.js
  var require_connector = __commonJS({
    "vendor/mapjs/src/core/theme/connector.js"(exports, module) {
      var _ = require_underscore_umd();
      var Theme = require_theme();
      var calcChildPosition = require_calc_child_position();
      var lineTypes = require_line_types();
      var arrowPath = require_arrow_path();
      var nodeConnectionPointX = require_node_connection_point_x();
      var appendUnderLine = function(connectorCurve, calculatedConnector, position) {
        "use strict";
        if (calculatedConnector.nodeUnderline) {
          connectorCurve.d += "M" + (calculatedConnector.nodeUnderline.from.x - position.left) + "," + (calculatedConnector.nodeUnderline.from.y - position.top) + " H" + (calculatedConnector.nodeUnderline.to.x - position.left);
        }
        return connectorCurve;
      };
      var appendOverLine = function(connectorCurve, calculatedConnector) {
        "use strict";
        const initialRadius = connectorCurve.initialRadius || 0, halfWidth = calculatedConnector.nodeOverline && Math.floor(0.5 * Math.abs(calculatedConnector.nodeOverline.to.x - calculatedConnector.nodeOverline.from.x)) - 1, square = calculatedConnector.connectorTheme && calculatedConnector.connectorTheme.squareCorners, flat = calculatedConnector.connectorTheme && calculatedConnector.connectorTheme.noCorners;
        if (calculatedConnector.nodeOverline && flat) {
          connectorCurve.d += "m" + -1 * halfWidth + ",0 h" + 2 * halfWidth;
        } else if (calculatedConnector.nodeOverline && square) {
          connectorCurve.d += "m" + -1 * halfWidth + "," + initialRadius + "v" + -1 * initialRadius + " h" + 2 * halfWidth + "v" + initialRadius;
        } else if (calculatedConnector.nodeOverline) {
          connectorCurve.d += "m" + -1 * halfWidth + "," + initialRadius + "q0," + -1 * initialRadius + " " + initialRadius + "," + -1 * initialRadius + " h" + 2 * (halfWidth - initialRadius) + "q" + initialRadius + ",0 " + initialRadius + "," + initialRadius;
        }
        return connectorCurve;
      };
      var appendBorderLines = function(connectorCurve, calculatedConnector, position) {
        "use strict";
        return appendOverLine(appendUnderLine(connectorCurve, calculatedConnector, position), calculatedConnector);
      };
      var nodeConnectionPointY = {
        "center": function(node) {
          "use strict";
          return Math.round(node.top + node.height * 0.5);
        },
        "base": function(node) {
          "use strict";
          return node.top + node.height + 1;
        },
        "base-inset": function(node, inset) {
          "use strict";
          return node.top + node.height + 1 - inset;
        },
        "top": function(node) {
          "use strict";
          return node.top;
        }
      };
      var calculateConnector = function(parent, child, theme) {
        "use strict";
        const childPosition = calcChildPosition(parent, child, 10), fromStyles = parent.styles, toStyles = child.styles, connectionPositionDefaultFrom = theme.attributeValue(["node"], fromStyles, ["connections", "default"], { h: "center", v: "center" }), connectionPositionDefaultTo = theme.attributeValue(["node"], toStyles, ["connections", "default"], { h: "nearest-inset", v: "center" }), connectionPositionFrom = _.extend({}, connectionPositionDefaultFrom, theme.attributeValue(["node"], fromStyles, ["connections", "from", childPosition], {})), connectionPositionTo = _.extend({}, connectionPositionDefaultTo, theme.attributeValue(["node"], toStyles, ["connections", "to"], {})), connectorTheme = theme.connectorTheme(childPosition, toStyles, fromStyles), fromInset = theme.attributeValue(["node"], fromStyles, ["cornerRadius"], 10), toInset = theme.attributeValue(["node"], toStyles, ["cornerRadius"], 10), borderType = theme.attributeValue(["node"], toStyles, ["border", "type"], "");
        let nodeUnderline = false, nodeOverline = false;
        if (borderType === "underline" || borderType === "under-overline") {
          nodeUnderline = {
            from: {
              x: child.left,
              y: child.top + child.height + 1
            },
            to: {
              x: child.left + child.width,
              y: child.top + child.height + 1
            }
          };
        }
        if (borderType === "overline" || borderType === "under-overline") {
          nodeOverline = {
            from: {
              x: child.left,
              y: child.top
            },
            to: {
              x: child.left + child.width,
              y: child.top
            }
          };
        }
        return {
          from: {
            x: nodeConnectionPointX[connectionPositionFrom.h](parent, child, fromInset),
            y: nodeConnectionPointY[connectionPositionFrom.v](parent, fromInset)
          },
          to: {
            x: nodeConnectionPointX[connectionPositionTo.h](child, parent, toInset),
            y: nodeConnectionPointY[connectionPositionTo.v](child, toInset)
          },
          connectorTheme,
          nodeUnderline,
          nodeOverline
        };
      };
      var themePath = function(parent, child, themeArg) {
        "use strict";
        const left = Math.min(parent.left, child.left), top = Math.min(parent.top, child.top), position = {
          left,
          top,
          width: Math.max(parent.left + parent.width, child.left + child.width, left + 1) - left,
          height: Math.max(parent.top + parent.height, child.top + child.height, top + 1) - top + 2
        }, theme = themeArg || new Theme({}), calculatedConnector = calculateConnector(parent, child, theme), result = appendBorderLines(lineTypes[calculatedConnector.connectorTheme.type](calculatedConnector, position, parent, child), calculatedConnector, position);
        result.color = calculatedConnector.connectorTheme.line.color;
        result.width = calculatedConnector.connectorTheme.line.width;
        result.theme = calculatedConnector.connectorTheme;
        if (calculatedConnector.connectorTheme.arrow && calculatedConnector.connectorTheme.type !== "no-connector") {
          const stems = result.arrowStems || {};
          result.arrows = calculatedConnector.connectorTheme.arrow === "from" ? [arrowPath(
            stems.from || { x: calculatedConnector.from.x, y: calculatedConnector.from.y + 20 },
            calculatedConnector.from,
            position
          )] : [arrowPath(
            stems.to || { x: calculatedConnector.to.x, y: calculatedConnector.to.y - 20 },
            calculatedConnector.to,
            position
          )];
        }
        delete result.arrowStems;
        return result;
      };
      module.exports = themePath;
    }
  });

  // vendor/mapjs/src/browser/get-box.js
  var require_get_box = __commonJS({
    "vendor/mapjs/src/browser/get-box.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.getBox = function() {
        "use strict";
        const domShape = this && this[0];
        if (!domShape) {
          return false;
        }
        return {
          top: domShape.offsetTop,
          left: domShape.offsetLeft,
          width: domShape.offsetWidth,
          height: domShape.offsetHeight
        };
      };
    }
  });

  // vendor/mapjs/src/browser/get-data-box.js
  var require_get_data_box = __commonJS({
    "vendor/mapjs/src/browser/get-data-box.js"() {
      var jQuery3 = require_jquery();
      require_get_box();
      jQuery3.fn.getDataBox = function() {
        "use strict";
        const domShapeData = this.data();
        if (domShapeData && domShapeData.width && domShapeData.height) {
          return {
            top: domShapeData.y,
            left: domShapeData.x,
            width: domShapeData.width,
            height: domShapeData.height
          };
        }
        return this.getBox();
      };
    }
  });

  // vendor/mapjs/src/browser/build-connection.js
  var require_build_connection = __commonJS({
    "vendor/mapjs/src/browser/build-connection.js"(exports, module) {
      var themeConnector = require_connector();
      require_get_data_box();
      module.exports = function buildConnection(element, optional) {
        "use strict";
        const applyInnerRect = (shape, box) => {
          const innerRect = shape.data().innerRect;
          if (innerRect) {
            box.left += innerRect.dx;
            box.top += innerRect.dy;
            box.width = innerRect.width;
            box.height = innerRect.height;
          }
        }, connectorBuilder = optional && optional.connectorBuilder || themeConnector, shapeFrom = element.data("nodeFrom"), shapeTo = element.data("nodeTo"), theme = optional && optional.theme, connectorAttr = element.data("attr"), fromBox = shapeFrom && shapeFrom.getDataBox(), toBox = shapeTo && shapeTo.getDataBox();
        if (!shapeFrom || !shapeTo || shapeFrom.length === 0 || shapeTo.length === 0) {
          return;
        }
        applyInnerRect(shapeFrom, fromBox);
        applyInnerRect(shapeTo, toBox);
        fromBox.styles = shapeFrom.data("styles");
        toBox.styles = shapeTo.data("styles");
        return Object.assign(connectorBuilder(fromBox, toBox, theme), connectorAttr);
      };
    }
  });

  // vendor/mapjs/src/browser/update-connector.js
  var require_update_connector = __commonJS({
    "vendor/mapjs/src/browser/update-connector.js"() {
      var jQuery3 = require_jquery();
      var createSVG = require_create_svg();
      var defaultTheme = require_default_theme();
      var lineStrokes = require_line_strokes();
      var lineStyles = require_line_styles();
      var convertPositionToTransform = require_convert_position_to_transform();
      var updateConnectorText = require_update_connector_text();
      var calcLabelCenterPont = require_calc_label_center_point();
      var buildConnection = require_build_connection();
      var connectionIsUpdated = (element, connection, theme) => {
        "use strict";
        const connectionPropCheck = JSON.stringify(connection) + (theme && theme.name);
        if (!connection || connectionPropCheck === element.data("changeCheck")) {
          return false;
        }
        element.data("changeCheck", connectionPropCheck);
        return connection;
      };
      require_get_data_box();
      jQuery3.fn.updateConnector = function(optional) {
        "use strict";
        const theme = optional && optional.theme;
        return jQuery3.each(this, function() {
          let pathElement, hitElement;
          const element = jQuery3(this), connectorAttr = element.data("attr"), allowParentConnectorOverride = !theme || !(theme.connectorEditingContext || theme.blockParentConnectorOverride) || theme.connectorEditingContext && theme.connectorEditingContext.allowed && theme.connectorEditingContext.allowed.length, connection = buildConnection(element, optional), applyLabel = function() {
            const labelText = connectorAttr && connectorAttr.label || connection.theme && connection.theme.label && connection.theme.label.defaultText || "", shapeTo = labelText && element.data("nodeTo"), shapeFrom = labelText && element.data("nodeFrom"), labelTheme = connection.theme && connection.theme.label || defaultTheme.connector.default.label, labelCenterPoint = labelText && calcLabelCenterPont(connection.position, shapeFrom.getDataBox(), shapeTo.getDataBox(), connection.d, labelTheme);
            updateConnectorText(
              element,
              labelCenterPoint,
              labelText,
              labelTheme
            );
          };
          if (!connection) {
            element.remove();
            return;
          }
          if (!connectionIsUpdated(element, connection, theme)) {
            return;
          }
          element.data("theme", connection.theme);
          element.data("position", Object.assign({}, connection.position));
          pathElement = element.find("path.mapjs-connector");
          hitElement = element.find("path.mapjs-link-hit");
          element.css(Object.assign(convertPositionToTransform(connection.position), { stroke: connection.color }));
          if (pathElement.length === 0) {
            pathElement = createSVG("path").attr("class", "mapjs-connector").appendTo(element);
          }
          const effectiveLineStyle = connection.lineStyle || connection.theme && connection.theme.line && connection.theme.line.style || "solid";
          pathElement.attr({
            "d": connection.d,
            "stroke-width": connection.width,
            "stroke-dasharray": lineStyles.strokes(effectiveLineStyle, connection.width) || lineStrokes[effectiveLineStyle] || "",
            "stroke-linecap": lineStyles.linecap(effectiveLineStyle) || "square",
            fill: "transparent"
          });
          if (allowParentConnectorOverride) {
            if (hitElement.length === 0) {
              hitElement = createSVG("path").attr("class", "mapjs-link-hit noTransition").appendTo(element);
            }
            hitElement.attr({
              "d": connection.d,
              "stroke-width": connection.width + 12
            });
          } else {
            if (hitElement.length > 0) {
              hitElement.remove();
            }
          }
          const arrowElements = element.find("path.mapjs-arrow");
          if (connection.arrows && connection.arrows.length) {
            connection.arrows.forEach(function(arrow, index) {
              let arrowElement = arrowElements.eq(index);
              if (arrowElement.length === 0) {
                arrowElement = createSVG("path").attr("class", "mapjs-arrow").appendTo(element);
              }
              arrowElement.attr({
                d: arrow,
                fill: connection.color,
                "stroke-width": 1
              }).show();
            });
            arrowElements.slice(connection.arrows.length).hide();
          } else {
            arrowElements.hide();
          }
          applyLabel();
        });
      };
    }
  });

  // vendor/mapjs/src/core/theme/link.js
  var require_link = __commonJS({
    "vendor/mapjs/src/core/theme/link.js"(exports, module) {
      var Theme = require_theme();
      var arrowPath = require_arrow_path();
      var lineStyles = require_line_styles();
      var linkPath = function(parent, child, linkAttrArg, themeArg) {
        "use strict";
        const calculateConnector = function(parent2, child2) {
          const parentPoints = [
            {
              x: parent2.left + Math.round(0.5 * parent2.width),
              y: parent2.top
            },
            {
              x: parent2.left + parent2.width,
              y: parent2.top + Math.round(0.5 * parent2.height)
            },
            {
              x: parent2.left + Math.round(0.5 * parent2.width),
              y: parent2.top + parent2.height
            },
            {
              x: parent2.left,
              y: parent2.top + Math.round(0.5 * parent2.height)
            }
          ], childPoints = [
            {
              x: child2.left + Math.round(0.5 * child2.width),
              y: child2.top
            },
            {
              x: child2.left + child2.width,
              y: child2.top + Math.round(0.5 * child2.height)
            },
            {
              x: child2.left + Math.round(0.5 * child2.width),
              y: child2.top + child2.height
            },
            {
              x: child2.left,
              y: child2.top + Math.round(0.5 * child2.height)
            }
          ];
          let i, j, min = Infinity, bestParent, bestChild, dx, dy, current;
          for (i = 0; i < parentPoints.length; i += 1) {
            for (j = 0; j < childPoints.length; j += 1) {
              dx = parentPoints[i].x - childPoints[j].x;
              dy = parentPoints[i].y - childPoints[j].y;
              current = dx * dx + dy * dy;
              if (current < min) {
                bestParent = i;
                bestChild = j;
                min = current;
              }
            }
          }
          return {
            from: parentPoints[bestParent],
            to: childPoints[bestChild]
          };
        }, conn = calculateConnector(parent, child), theme = themeArg || new Theme({}), linkAttr = linkAttrArg || {}, left = Math.min(parent.left, child.left), top = Math.min(parent.top, child.top), position = {
          left,
          top,
          width: Math.max(parent.left + parent.width, child.left + child.width, left) - left,
          height: Math.max(parent.top + parent.height, child.top + child.height, top) - top
        }, arrowPaths = function(arrowAttr) {
          if (!arrowAttr) {
            return false;
          }
          const paths = [];
          if (arrowAttr !== "from") {
            paths.push(arrowPath(conn.from, conn.to, position));
          }
          if (arrowAttr === "from" || arrowAttr === "both") {
            paths.push(arrowPath(conn.to, conn.from, position));
          }
          return paths;
        }, linkTheme = theme.linkTheme(linkAttr.type), width = linkAttr.width || linkTheme.line.width, lineStyle = linkAttr.lineStyle || linkTheme.line.lineStyle, lineProps = {
          color: linkAttr.color || linkTheme.line.color,
          strokes: lineStyles.strokes(lineStyle, width),
          linecap: lineStyles.linecap(lineStyle, width),
          width
        };
        return {
          d: "M" + Math.round(conn.from.x - position.left) + "," + Math.round(conn.from.y - position.top) + "L" + Math.round(conn.to.x - position.left) + "," + Math.round(conn.to.y - position.top),
          position,
          arrows: linkAttr.arrow && linkAttr.arrow !== "false" && arrowPaths(linkAttr.arrow),
          theme: linkTheme,
          lineProps,
          label: linkAttr.label
        };
      };
      module.exports = linkPath;
    }
  });

  // vendor/mapjs/src/browser/update-link.js
  var require_update_link = __commonJS({
    "vendor/mapjs/src/browser/update-link.js"() {
      var jQuery3 = require_jquery();
      var createSVG = require_create_svg();
      var convertPositionToTransform = require_convert_position_to_transform();
      var updateConnectorText = require_update_connector_text();
      var themeLink = require_link();
      var calcLabelCenterPont = require_calc_label_center_point();
      var showArrows = function(connection, element) {
        "use strict";
        const arrowElements = element.find("path.mapjs-arrow");
        if (connection.arrows && connection.arrows.length) {
          connection.arrows.forEach((arrow, index) => {
            let arrowElement = arrowElements.eq(index);
            if (arrowElement.length === 0) {
              arrowElement = createSVG("path").attr("class", "mapjs-arrow").appendTo(element);
            }
            arrowElement.attr({
              d: arrow,
              fill: connection.lineProps.color,
              "stroke-width": connection.lineProps.width
            }).show();
          });
          arrowElements.slice(connection.arrows.length).hide();
        } else {
          arrowElements.hide();
        }
      };
      require_get_data_box();
      jQuery3.fn.updateLink = function(optional) {
        "use strict";
        const linkBuilder = optional && optional.linkBuilder || themeLink, theme = optional && optional.theme;
        return jQuery3.each(this, function() {
          const element = jQuery3(this), shapeFrom = element.data("nodeFrom"), shapeTo = element.data("nodeTo"), attrs = element.data("attr") || {}, applyLabel = function(connection2, fromBox2, toBox2) {
            const labelText = attrs.label || "", labelTheme = connection2.theme.label, labelCenterPoint = labelText && calcLabelCenterPont(connection2.position, fromBox2, toBox2, connection2.d, labelTheme);
            updateConnectorText(
              element,
              labelCenterPoint,
              labelText,
              labelTheme
            );
          };
          let connection = false, pathElement = element.find("path.mapjs-link"), hitElement = element.find("path.mapjs-link-hit"), fromBox = false, toBox = false, changeCheck = false;
          if (!shapeFrom || !shapeTo || shapeFrom.length === 0 || shapeTo.length === 0) {
            element.hide();
            return;
          }
          fromBox = shapeFrom.getDataBox();
          toBox = shapeTo.getDataBox();
          connection = linkBuilder(fromBox, toBox, attrs, theme);
          changeCheck = JSON.stringify(connection) + (theme && theme.name);
          if (changeCheck === element.data("changeCheck")) {
            return;
          }
          element.data("changeCheck", changeCheck);
          element.data("theme", connection.theme);
          element.data("position", Object.assign({}, connection.position));
          element.css(Object.assign(convertPositionToTransform(connection.position), { stroke: connection.lineProps.color }));
          if (pathElement.length === 0) {
            pathElement = createSVG("path").attr("class", "mapjs-link").appendTo(element);
          }
          pathElement.attr({
            "d": connection.d,
            "stroke-width": connection.lineProps.width,
            "stroke-dasharray": connection.lineProps.strokes,
            "stroke-linecap": connection.lineProps.linecap,
            fill: "transparent"
          });
          if (hitElement.length === 0) {
            hitElement = createSVG("path").attr("class", "mapjs-link-hit noTransition").appendTo(element);
          }
          hitElement.attr({
            "d": connection.d,
            "stroke-width": connection.lineProps.width + 12
          });
          showArrows(connection, element);
          applyLabel(connection, fromBox, toBox);
        });
      };
    }
  });

  // vendor/mapjs/src/browser/node-with-id.js
  var require_node_with_id = __commonJS({
    "vendor/mapjs/src/browser/node-with-id.js"() {
      var jQuery3 = require_jquery();
      var nodeKey = require_node_key();
      jQuery3.fn.nodeWithId = function(id) {
        "use strict";
        return this.find("#" + nodeKey(id));
      };
    }
  });

  // vendor/mapjs/src/core/util/url-helper.js
  var require_url_helper = __commonJS({
    "vendor/mapjs/src/core/util/url-helper.js"(exports, module) {
      var URLHelper = function() {
        "use strict";
        const self2 = this, urlPattern = /(https?:\/\/|www\.)[\w-]+(\.[\w-]+)+([\w\(\)\u0080-\u00FF.,!@?^=%&amp;:\/~+#-]*[\w\(\)\u0080-\u00FF!@?^=%&amp;\/~+#-])?/i, hrefUrl = function(url) {
          if (!url) {
            return "";
          }
          if (url[0] === "/") {
            return url;
          }
          if (/^[a-z]+:\/\//i.test(url)) {
            return url;
          }
          return "http://" + url;
        }, getGlobalPattern = function() {
          return new RegExp(urlPattern, "gi");
        };
        self2.containsLink = function(text) {
          return urlPattern.test(text);
        };
        self2.getLink = function(text) {
          const url = text && text.match(urlPattern);
          if (url && url[0]) {
            return hrefUrl(url[0]);
          }
          return url;
        };
        self2.stripLink = function(text) {
          if (!text) {
            return "";
          }
          return text.replace(urlPattern, "").trim();
        };
        self2.formatLinks = function(text) {
          if (!text) {
            return "";
          }
          return text.replace(self2.getPattern(), (url) => `<a target="_blank" href="${hrefUrl(url)}">${url}</a>`);
        };
        self2.getPattern = getGlobalPattern;
        self2.hrefUrl = hrefUrl;
      };
      module.exports = new URLHelper();
    }
  });

  // vendor/mapjs/src/core/content/formatted-node-title.js
  var require_formatted_node_title = __commonJS({
    "vendor/mapjs/src/core/content/formatted-node-title.js"(exports, module) {
      var urlHelper = require_url_helper();
      var removeLinks = function(nodeTitle, maxUrlLength) {
        "use strict";
        const strippedTitle = nodeTitle && urlHelper.stripLink(nodeTitle);
        if (strippedTitle.trim() === "") {
          return !maxUrlLength || nodeTitle.length < maxUrlLength ? nodeTitle : nodeTitle.substring(0, maxUrlLength) + "...";
        } else {
          return strippedTitle;
        }
      };
      var removeExtraSpaces = function(nodeTitle) {
        "use strict";
        return nodeTitle.replace(/[ \t]+/g, " ");
      };
      var cleanNonPrintable = function(nodeTitle) {
        "use strict";
        return nodeTitle.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F\u0080-\u009F]+/gu, "");
      };
      var trimLines = function(nodeTitle) {
        "use strict";
        return nodeTitle.replace(/\r/g, "").split("\n").map((line) => line.trim()).join("\n");
      };
      module.exports = function(nodeTitle, maxUrlLength) {
        "use strict";
        if (!nodeTitle || !nodeTitle.trim()) {
          return "";
        }
        const sanitizedTitle = cleanNonPrintable(nodeTitle), withoutLinks = removeLinks(sanitizedTitle, maxUrlLength), withConsolidatedSpaces = removeExtraSpaces(withoutLinks);
        return trimLines(withConsolidatedSpaces);
      };
    }
  });

  // vendor/mapjs/src/core/content/rich-text.js
  var require_rich_text = __commonJS({
    "vendor/mapjs/src/core/content/rich-text.js"(exports, module) {
      var TAG_TOKEN = /<\/?[biu]>/i;
      var SPLIT_TOKEN = /(<\/?[biu]>)/gi;
      var FLAGS = ["b", "i", "u"];
      var isRich = function(title) {
        return typeof title === "string" && TAG_TOKEN.test(title);
      };
      var decodeEntities = function(text) {
        return text.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/&amp;/gi, "&");
      };
      var escapeText = function(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      };
      var parseRuns = function(title) {
        const runs = [], state = { b: false, i: false, u: false }, stack = [];
        String(title || "").split(SPLIT_TOKEN).forEach(function(token) {
          const m = /^<(\/?)([biu])>$/i.exec(token);
          if (m) {
            const tag = m[2].toLowerCase();
            if (!m[1]) {
              stack.push(tag);
              state[tag] = true;
            } else {
              const at = stack.lastIndexOf(tag);
              if (at >= 0) {
                stack.splice(at, 1);
              }
              state[tag] = stack.indexOf(tag) >= 0;
            }
          } else if (token) {
            runs.push({ text: decodeEntities(token), b: state.b, i: state.i, u: state.u });
          }
        });
        return runs;
      };
      var mergeRuns = function(runs) {
        const merged = [];
        runs.forEach(function(run) {
          const last = merged[merged.length - 1];
          if (last && FLAGS.every((f) => last[f] === run[f])) {
            last.text += run.text;
          } else {
            merged.push({ text: run.text, b: run.b, i: run.i, u: run.u });
          }
        });
        return merged.filter((run) => run.text !== "");
      };
      var trimRuns = function(runs) {
        const trimmed = runs.slice();
        if (trimmed.length) {
          trimmed[0] = Object.assign({}, trimmed[0], { text: trimmed[0].text.replace(/^\s+/, "") });
          const lastAt = trimmed.length - 1;
          trimmed[lastAt] = Object.assign({}, trimmed[lastAt], { text: trimmed[lastAt].text.replace(/\s+$/, "") });
        }
        return trimmed.filter((run) => run.text !== "");
      };
      var hasFormatting = function(runs) {
        return runs.some((run) => (run.b || run.i || run.u) && run.text.trim() !== "");
      };
      var runsToTitle = function(runs) {
        return mergeRuns(runs).map(function(run) {
          let out = escapeText(run.text);
          ["u", "i", "b"].forEach(function(tag) {
            if (run[tag]) {
              out = "<" + tag + ">" + out + "</" + tag + ">";
            }
          });
          return out;
        }).join("");
      };
      var plainText = function(title) {
        return isRich(title) ? parseRuns(title).map((run) => run.text).join("") : String(title || "");
      };
      var renderInto = function(domElement, title) {
        const doc = domElement.ownerDocument;
        domElement.textContent = "";
        mergeRuns(parseRuns(title)).forEach(function(run) {
          let node = doc.createTextNode(run.text);
          FLAGS.forEach(function(tag) {
            if (run[tag]) {
              const el = doc.createElement(tag);
              el.appendChild(node);
              node = el;
            }
          });
          domElement.appendChild(node);
        });
      };
      var boldish = function(style) {
        if (!style) {
          return false;
        }
        const weight = style.fontWeight || "";
        return /^(bold|bolder)$/i.test(weight) || parseInt(weight, 10) >= 600;
      };
      var runsFromDom = function(rootElement) {
        const runs = [], push = function(text, state) {
          runs.push({ text, b: state.b, i: state.i, u: state.u });
        }, lastChar = function() {
          return runs.length ? runs[runs.length - 1].text.slice(-1) : "\n";
        }, walk = function(node, state) {
          if (node.nodeType === 3) {
            push(node.nodeValue, state);
            return;
          }
          if (node.nodeType !== 1) {
            return;
          }
          const tag = node.tagName;
          if (tag === "BR") {
            push("\n", state);
            return;
          }
          if ((tag === "DIV" || tag === "P" || tag === "LI") && lastChar() !== "\n") {
            push("\n", state);
          }
          const style = node.style, next = {
            b: state.b || tag === "B" || tag === "STRONG" || boldish(style),
            i: state.i || tag === "I" || tag === "EM" || /italic|oblique/i.test(style && style.fontStyle || ""),
            u: state.u || tag === "U" || /underline/i.test(style && (style.textDecorationLine || style.textDecoration) || "")
          };
          Array.prototype.forEach.call(node.childNodes, (child) => walk(child, next));
        };
        Array.prototype.forEach.call(
          rootElement.childNodes,
          (child) => walk(child, { b: false, i: false, u: false })
        );
        return runs;
      };
      var toggleFormat = function(title, tag) {
        const runs = mergeRuns(parseRuns(title));
        if (!runs.length) {
          return title;
        }
        const allOn = runs.every((run) => run[tag] || run.text.trim() === "");
        runs.forEach(function(run) {
          run[tag] = !allOn;
        });
        if (runs.some((run) => run.b || run.i || run.u)) {
          return runsToTitle(runs);
        }
        return runs.map((run) => run.text).join("");
      };
      module.exports = {
        isRich,
        plainText,
        parseRuns,
        mergeRuns,
        trimRuns,
        hasFormatting,
        runsToTitle,
        runsFromDom,
        renderInto,
        toggleFormat
      };
    }
  });

  // vendor/mapjs/src/core/theme/foreground-style.js
  var require_foreground_style = __commonJS({
    "vendor/mapjs/src/core/theme/foreground-style.js"(exports, module) {
      var convertToRGB = require_color_to_rgb();
      module.exports = function foregroundStyle(backgroundColor) {
        "use strict";
        const mix = function(color1, color2) {
          return [
            Math.round(0.5 * (color1[0] + color2[0])),
            Math.round(0.5 * (color1[1] + color2[1])),
            Math.round(0.5 * (color1[2] + color2[2]))
          ];
        }, calcLuminosity = function() {
          const rgb = mix(convertToRGB(backgroundColor), convertToRGB("#EEEEEE")), lum = [];
          let chan;
          for (let i = 0; i < rgb.length; i++) {
            chan = rgb[i] / 255;
            lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
          }
          return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
        }, luminosity = calcLuminosity();
        if (luminosity < 0.5) {
          return "lightColor";
        } else if (luminosity < 0.9) {
          return "color";
        }
        return "darkColor";
      };
    }
  });

  // vendor/mapjs/src/core/content/apply-idea-attributes-to-node-theme.js
  var require_apply_idea_attributes_to_node_theme = __commonJS({
    "vendor/mapjs/src/core/content/apply-idea-attributes-to-node-theme.js"(exports, module) {
      var foregroundStyle = require_foreground_style();
      module.exports = function applyIdeaAttributesToNodeTheme(idea, nodeTheme, colorFilter) {
        "use strict";
        if (!nodeTheme || !idea || !idea.attr || !idea.attr.style) {
          return nodeTheme;
        }
        const filtered = (color) => colorFilter ? colorFilter(color) : color, isColorSetByUser = () => {
          const style = idea.attr.style, setByUser = style.background || style.backgroundColor;
          if (setByUser === "false" || setByUser === "transparent") {
            return false;
          }
          return setByUser && filtered(setByUser);
        }, userTextColor = idea.attr.style.text && idea.attr.style.text.color, fontMultiplier = idea.attr.style.fontMultiplier, textAlign = idea.attr.style.textAlign, colorSetByUser = isColorSetByUser(), colorText = nodeTheme.borderType !== "surround";
        if (colorSetByUser) {
          if (colorText) {
            nodeTheme.text.color = colorSetByUser;
          } else {
            nodeTheme.text.color = nodeTheme.text[foregroundStyle(colorSetByUser)];
            nodeTheme.backgroundColor = colorSetByUser;
          }
        }
        if (userTextColor) {
          nodeTheme.text = Object.assign({}, nodeTheme.text, { color: filtered(userTextColor) });
        }
        if (textAlign) {
          nodeTheme.text = Object.assign({}, nodeTheme.text, { alignment: textAlign });
        }
        if (nodeTheme && nodeTheme.hasFontMultiplier) {
          return nodeTheme;
        }
        if (!nodeTheme.font || !fontMultiplier || Math.abs(fontMultiplier) <= 0.01 || Math.abs(fontMultiplier - 1) <= 0.01) {
          return nodeTheme;
        }
        if (nodeTheme.font.size) {
          nodeTheme.font.size = nodeTheme.font.size * fontMultiplier;
        }
        if (nodeTheme.font.lineSpacing) {
          nodeTheme.font.lineSpacing = nodeTheme.font.lineSpacing * fontMultiplier;
        }
        if (nodeTheme.font.sizePx) {
          nodeTheme.font.sizePx = nodeTheme.font.sizePx * fontMultiplier;
        }
        if (nodeTheme.font.lineSpacingPx) {
          nodeTheme.font.lineSpacingPx = nodeTheme.font.lineSpacingPx * fontMultiplier;
        }
        nodeTheme.hasFontMultiplier = true;
        return nodeTheme;
      };
    }
  });

  // vendor/mapjs/src/core/util/calc-max-width.js
  var require_calc_max_width = __commonJS({
    "vendor/mapjs/src/core/util/calc-max-width.js"(exports, module) {
      module.exports = function calcMaxWidth(attr, nodeTheme) {
        "use strict";
        return attr && attr.style && attr.style.width || nodeTheme && nodeTheme.text && nodeTheme.text.maxWidth;
      };
    }
  });

  // vendor/mapjs/src/browser/set-theme-class-list.js
  var require_set_theme_class_list = __commonJS({
    "vendor/mapjs/src/browser/set-theme-class-list.js"() {
      var jQuery3 = require_jquery();
      var _ = require_underscore_umd();
      jQuery3.fn.setThemeClassList = function(classList) {
        "use strict";
        const domElement = this[0], filterClasses = function(classes) {
          return _.filter(classes, function(c) {
            return /^level_.+/.test(c) || /^attr_.+/.test(c) || c === "sticky_note";
          });
        }, toRemove = filterClasses(domElement.classList), toAdd = classList && classList.length && filterClasses(classList);
        domElement.classList.remove.apply(domElement.classList, toRemove);
        if (toAdd && toAdd.length) {
          domElement.classList.add.apply(domElement.classList, toAdd);
        }
        return this;
      };
    }
  });

  // vendor/mapjs/src/browser/update-node-content.js
  var require_update_node_content = __commonJS({
    "vendor/mapjs/src/browser/update-node-content.js"() {
      var jQuery3 = require_jquery();
      var _ = require_underscore_umd();
      var URLHelper = require_url_helper();
      var formattedNodeTitle = require_formatted_node_title();
      var richText = require_rich_text();
      var nodeCacheMark = require_node_cache_mark();
      var applyIdeaAttributesToNodeTheme = require_apply_idea_attributes_to_node_theme();
      var calcMaxWidth = require_calc_max_width();
      require_set_theme_class_list();
      jQuery3.fn.updateNodeContent = function(nodeContent, theme, optional) {
        "use strict";
        const resourceTranslator = optional && optional.resourceTranslator, forcedLevel = optional && optional.level, nodeTextPadding = optional && optional.nodeTextPadding || 11, fixedLayout = optional && optional.fixedLayout, self2 = jQuery3(this), textSpan = function() {
          let span = self2.find("[data-mapjs-role=title]");
          if (span.length === 0) {
            span = jQuery3("<span>").attr("data-mapjs-role", "title").appendTo(self2);
          }
          return span;
        }, decorations = function() {
          let element = self2.find("[data-mapjs-role=decorations]");
          if (element.length === 0) {
            element = jQuery3('<div data-mapjs-role="decorations" class="mapjs-decorations">').on("mousedown click", function(e) {
              e.stopPropagation();
              e.stopImmediatePropagation();
            }).appendTo(self2);
          }
          return element;
        }, applyLinkUrl = function(title) {
          const url = URLHelper.getLink(title);
          let element = self2.find("a.mapjs-hyperlink");
          if (!url) {
            element.hide();
            return;
          }
          if (element.length === 0) {
            element = jQuery3('<a target="_blank" class="mapjs-hyperlink icon-hyperlink"></a>').addClass().appendTo(decorations());
          }
          element.attr("href", url).show();
        }, applyLabel = function(label) {
          let element = self2.find(".mapjs-label");
          if (!label && label !== 0) {
            element.hide();
            return;
          }
          if (element.length === 0) {
            element = jQuery3('<span class="mapjs-label"></span>').appendTo(decorations());
          }
          element.text(label).show();
        }, applyAttachment = function() {
          const attachment = nodeContent.attr && nodeContent.attr.attachment;
          let element = self2.find("a.mapjs-attachment");
          if (!attachment) {
            element.hide();
            return;
          }
          if (element.length === 0) {
            element = jQuery3('<a href="#" class="mapjs-attachment icon-attachment"></a>').appendTo(decorations()).click(function() {
              self2.trigger("attachment-click");
              self2.trigger("decoration-click", "attachment");
            }).trigger(jQuery3.Event("attachment-link-created", { nodeId: nodeContent.id }));
          }
          element.show();
        }, applyNote = function() {
          const note = nodeContent.attr && nodeContent.attr.note;
          let element = self2.find("a.mapjs-note");
          if (!note) {
            element.hide();
            return;
          }
          if (element.length === 0) {
            element = jQuery3('<a href="#" class="mapjs-note icon-note"></a>').appendTo(decorations()).click(function() {
              self2.trigger("decoration-click", "note");
            });
          }
          element.show();
        }, level = forcedLevel || 1, styles = nodeContent.styles || theme && theme.nodeStyles(level, nodeContent.attr) || [], nodeTheme = theme && theme.nodeTheme && applyIdeaAttributesToNodeTheme(nodeContent, theme.nodeTheme(styles), theme.attributeColorFilter), updateTextStyle = function() {
          if (nodeTheme && nodeTheme.hasFontMultiplier) {
            self2.css({
              "font-size": nodeTheme.font.size + "pt"
            });
          } else {
            self2.css({ "font-size": "" });
          }
          if (nodeTheme && nodeTheme.text && nodeTheme.text.alignment) {
            self2.css("text-align", nodeTheme.text.alignment);
          } else {
            self2.css("text-align", "");
          }
        }, updateText = function(title) {
          const text = formattedNodeTitle(title, 25), element = textSpan(), domElement = element[0], preferredWidth = nodeContent.attr && nodeContent.attr.style && nodeContent.attr.style.width;
          let height;
          if (richText.isRich(text)) {
            richText.renderInto(element[0], text.trim());
          } else {
            element.text(text.trim());
          }
          self2.data("title", title);
          element.css({ "max-width": "", "min-width": "" });
          if (preferredWidth) {
            element.css({ "max-width": preferredWidth, "min-width": preferredWidth });
          }
          if (domElement.scrollWidth - nodeTextPadding > domElement.offsetWidth) {
            element.css("max-width", domElement.scrollWidth + "px");
          } else if (!preferredWidth) {
            height = domElement.offsetHeight;
            element.css("min-width", nodeContent.textWidth || element.css("max-width"));
            if (domElement.offsetHeight === height) {
              element.css("min-width", "");
            }
          }
        }, setCollapseClass = function() {
          if (nodeContent.attr && nodeContent.attr.collapsed) {
            self2.addClass("collapsed");
          } else {
            self2.removeClass("collapsed");
          }
        }, setColors = function(colorText2) {
          self2.removeClass("mapjs-node-colortext mapjs-node-transparent");
          self2.css({
            "color": nodeTheme.text.color,
            "background-color": nodeTheme.backgroundColor === "transparent" ? "" : nodeTheme.backgroundColor
          });
          if (colorText2) {
            self2.addClass("mapjs-node-colortext");
          }
          if (!nodeTheme || !nodeTheme.backgroundColor || nodeTheme.backgroundColor === "transparent") {
            self2.addClass("mapjs-node-transparent");
          }
        }, setIcon = function(icon) {
          let textHeight, textWidth, maxTextWidth;
          const textBox = textSpan(), selfProps = {
            "min-height": "",
            "min-width": "",
            "background-image": "",
            "background-repeat": "",
            "background-size": "",
            "background-position": ""
          }, textProps = {
            "margin-top": "",
            "margin-left": ""
          }, padding = nodeTheme && nodeTheme.margin || 10;
          self2.css({ padding: "" });
          if (icon) {
            textHeight = textBox.outerHeight();
            textWidth = textBox.outerWidth();
            maxTextWidth = calcMaxWidth(nodeContent.attr, nodeTheme);
            _.extend(selfProps, {
              "background-image": 'url("' + (resourceTranslator ? resourceTranslator(icon.url) : icon.url) + '")',
              "background-repeat": "no-repeat",
              "background-size": icon.width + "px " + icon.height + "px",
              "background-position": "center center"
            });
            if (icon.position === "top" || icon.position === "bottom") {
              if (icon.position === "top") {
                selfProps["background-position"] = "center " + padding + "px";
              } else if (fixedLayout) {
                selfProps["background-position"] = "center " + (padding + textHeight) + "px";
              } else {
                selfProps["background-position"] = "center " + icon.position + " " + padding + "px";
              }
              selfProps["padding-" + icon.position] = icon.height + padding * 2;
              selfProps["min-width"] = icon.width;
              if (icon.width > maxTextWidth) {
                textProps["max-width"] = `${icon.width}px`;
              }
            } else if (icon.position === "left" || icon.position === "right") {
              if (icon.position === "left") {
                selfProps["background-position"] = padding + "px center";
              } else if (fixedLayout) {
                selfProps["background-position"] = textWidth + 2 * padding + "px center ";
              } else {
                selfProps["background-position"] = icon.position + " " + padding + "px center";
              }
              selfProps["padding-" + icon.position] = icon.width + padding * 2;
              if (icon.height > textHeight) {
                textProps["margin-top"] = Math.round((icon.height - textHeight) / 2);
                selfProps["min-height"] = icon.height;
              }
            } else {
              if (icon.height > textHeight) {
                textProps["margin-top"] = Math.round((icon.height - textHeight) / 2);
                selfProps["min-height"] = icon.height;
              }
              selfProps["min-width"] = icon.width;
              if (icon.width > maxTextWidth) {
                textProps["max-width"] = `${icon.width}px`;
              }
            }
          }
          self2.css(selfProps);
          textBox.css(textProps);
        }, nodeLevel = forcedLevel || nodeContent.level, themeDefault = function(a, b, c, d) {
          return d;
        }, styleDefault = function() {
          return ["default"];
        }, attrValue = theme && theme.attributeValue || themeDefault, nodeStyles = theme && theme.nodeStyles || styleDefault, effectiveStyles = nodeStyles(nodeLevel, nodeContent.attr), borderType = attrValue(["node"], effectiveStyles, ["border", "type"], "surround"), decorationEdge = attrValue(["node"], effectiveStyles, ["decorations", "edge"], ""), decorationOverlap = attrValue(["node"], effectiveStyles, ["decorations", "overlap"], ""), colorText = borderType !== "surround", isGroup = nodeContent.attr && nodeContent.attr.group, nodeCacheData = {
          x: Math.round(nodeContent.x),
          y: Math.round(nodeContent.y),
          width: Math.round(nodeContent.width),
          textWidth: Math.round(nodeContent.textWidth),
          height: Math.round(nodeContent.height),
          nodeId: nodeContent.id,
          styles: effectiveStyles,
          parentConnector: nodeContent && nodeContent.attr && nodeContent.attr.parentConnector
        };
        let offset;
        nodeCacheData.innerRect = _.pick(nodeCacheData, ["width", "height"]);
        nodeCacheData.innerRect.dx = 0;
        nodeCacheData.innerRect.dy = 0;
        updateTextStyle();
        if (isGroup) {
          this.css({ margin: "", width: nodeContent.width, height: nodeContent.height, opacity: 1 });
          updateText("");
        } else {
          updateText(nodeContent.title);
          if (optional && optional.decorations && !optional.decorations.includes(decorationEdge)) {
            decorations().empty();
          } else {
            applyLinkUrl(nodeContent.title);
            applyLabel(nodeContent.label);
            applyNote();
            applyAttachment();
          }
          ;
          this.css({ margin: "", width: "", height: "", opacity: 1 });
          if (decorationEdge === "left") {
            nodeCacheData.innerRect.dx = decorations().outerWidth();
            nodeCacheData.innerRect.width = nodeCacheData.width - decorations().outerWidth();
            self2.css("margin-left", decorations().outerWidth());
          } else if (decorationEdge === "right") {
            nodeCacheData.innerRect.width = nodeCacheData.width - decorations().outerWidth();
            self2.css("margin-right", decorations().outerWidth());
          } else if (decorationEdge === "bottom") {
            offset = decorations().outerHeight() * (decorationOverlap ? 0.5 : 1);
            nodeCacheData.innerRect.height = nodeCacheData.height - offset;
            self2.css("margin-bottom", decorations().outerHeight() * (decorationOverlap ? 0.5 : 1));
          }
        }
        self2.setThemeClassList(effectiveStyles).attr("mapjs-level", nodeLevel);
        self2.data(nodeCacheData);
        self2.data("nodeCacheMark", nodeCacheMark(nodeContent, Object.assign({ theme }, optional)));
        setColors(colorText);
        setIcon(nodeContent.attr && nodeContent.attr.icon);
        setCollapseClass();
        self2.trigger("mapjs:resize");
        return self2;
      };
    }
  });

  // vendor/mapjs/src/browser/update-stage.js
  var require_update_stage = __commonJS({
    "vendor/mapjs/src/browser/update-stage.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.updateStage = function() {
        "use strict";
        const data = this.data(), size = {
          "min-width": Math.round(data.width - data.offsetX),
          "min-height": Math.round(data.height - data.offsetY),
          "width": Math.round(data.width - data.offsetX),
          "height": Math.round(data.height - data.offsetY),
          "transform-origin": "top left",
          "transform": "translate3d(" + Math.round(data.offsetX) + "px, " + Math.round(data.offsetY) + "px, 0)"
        }, svgContainer = this.find("[data-mapjs-role=svg-container]")[0];
        if (data.scale && data.scale !== 1) {
          size.transform = "scale(" + data.scale + ") translate(" + Math.round(data.offsetX) + "px, " + Math.round(data.offsetY) + "px)";
        }
        this.css(size);
        if (svgContainer) {
          svgContainer.setAttribute(
            "viewBox",
            "" + Math.round(-1 * data.offsetX) + " " + Math.round(-1 * data.offsetY) + " " + Math.round(data.width) + " " + Math.round(data.height)
          );
          svgContainer.setAttribute(
            "style",
            "top:" + Math.round(-1 * data.offsetY) + "px; left:" + Math.round(-1 * data.offsetX) + "px; width:" + Math.round(data.width) + "px; height:" + Math.round(data.height) + "px;"
          );
        }
        return this;
      };
    }
  });

  // vendor/mapjs/src/browser/queue-fade-out.js
  var require_queue_fade_out = __commonJS({
    "vendor/mapjs/src/browser/queue-fade-out.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.queueFadeOut = function(theme) {
        "use strict";
        const element = this, removeElement = () => {
          if (element.is(":focus")) {
            element.parents("[tabindex]").focus();
          }
          return element.remove();
        };
        if (!theme || theme.noAnimations()) {
          return removeElement();
        }
        return element.on("transitionend", removeElement).css("opacity", 0);
        setTimeout(removeElement, 500);
      };
    }
  });

  // vendor/mapjs/src/browser/inner-text.js
  var require_inner_text = __commonJS({
    "vendor/mapjs/src/browser/inner-text.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.innerText = function() {
        "use strict";
        const htmlContent = this.html(), containsBr = /<br\/?>/.test(htmlContent), containsDiv = /<div>/.test(htmlContent);
        if (containsDiv && this[0].innerText) {
          return this[0].innerText.trim();
        } else if (containsBr) {
          return htmlContent.replace(/<br\/?>/gi, "\n").replace(/(<([^>]+)>)/gi, "");
        }
        return this.text();
      };
    }
  });

  // vendor/mapjs/src/browser/place-caret-at-end.js
  var require_place_caret_at_end = __commonJS({
    "vendor/mapjs/src/browser/place-caret-at-end.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.placeCaretAtEnd = function() {
        "use strict";
        if (!window.getSelection || !document.createRange) {
          return;
        }
        const el = this[0], range = document.createRange(), sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      };
    }
  });

  // vendor/mapjs/src/browser/select-all.js
  var require_select_all = __commonJS({
    "vendor/mapjs/src/browser/select-all.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.selectAll = function() {
        "use strict";
        const el = this[0];
        let range, sel, textRange;
        if (window.getSelection && document.createRange) {
          range = document.createRange();
          range.selectNodeContents(el);
          sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (document.body.createTextRange) {
          textRange = document.body.createTextRange();
          textRange.moveToElementText(el);
          textRange.select();
        }
      };
    }
  });

  // vendor/mapjs/src/browser/edit-node.js
  var require_edit_node = __commonJS({
    "vendor/mapjs/src/browser/edit-node.js"() {
      var jQuery3 = require_jquery();
      var richText = require_rich_text();
      require_inner_text();
      require_place_caret_at_end();
      require_select_all();
      require_hammer_draggable();
      jQuery3.fn.editNode = function(shouldSelectAll) {
        "use strict";
        const node = this, textBox = this.find("[data-mapjs-role=title]"), unformattedText = this.data("title"), plainUnformatted = richText.plainText(unformattedText), originalText = textBox.text(), originalHtml = textBox.html();
        if (plainUnformatted !== originalText) {
          textBox.css("word-break", "break-all");
        }
        if (richText.isRich(unformattedText)) {
          richText.renderInto(textBox[0], unformattedText);
        } else {
          textBox.text(unformattedText);
        }
        textBox.attr("contenteditable", true).focus();
        if (shouldSelectAll) {
          textBox.selectAll();
        } else if (unformattedText) {
          textBox.placeCaretAtEnd();
        }
        node.shadowDraggable({ disable: true });
        return new Promise((resolve, reject) => {
          const clear = function() {
            detachListeners();
            textBox.css("word-break", "");
            textBox.removeAttr("contenteditable");
            node.shadowDraggable();
          }, finishEditing = function() {
            let content2;
            try {
              const runs = richText.trimRuns(richText.runsFromDom(textBox[0]));
              content2 = richText.hasFormatting(runs) ? richText.runsToTitle(runs) : textBox.innerText();
            } catch (e) {
              content2 = textBox.innerText();
            }
            if (content2 === unformattedText) {
              return cancelEditing();
            }
            clear();
            resolve(content2);
          }, cancelEditing = function() {
            clear();
            textBox.html(originalHtml);
            reject();
          }, keyboardEvents = function(e) {
            const ENTER_KEY_CODE = 13, ESC_KEY_CODE = 27, TAB_KEY_CODE = 9, S_KEY_CODE = 83, Z_KEY_CODE = 90, FORMAT_COMMANDS = { 66: "bold", 73: "italic", 85: "underline" };
            if (e.which === ENTER_KEY_CODE && !e.shiftKey) {
              finishEditing();
              e.stopPropagation();
            } else if (e.which === ESC_KEY_CODE) {
              cancelEditing();
              e.preventDefault();
              e.stopPropagation();
            } else if (FORMAT_COMMANDS[e.which] && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
              textBox[0].ownerDocument.execCommand(FORMAT_COMMANDS[e.which], false, null);
              e.preventDefault();
              e.stopPropagation();
            } else if (e.which === TAB_KEY_CODE || e.which === S_KEY_CODE && (e.metaKey || e.ctrlKey) && !e.altKey) {
              finishEditing();
              e.preventDefault();
            } else if (!e.shiftKey && e.which === Z_KEY_CODE && (e.metaKey || e.ctrlKey) && !e.altKey) {
              if (textBox.text() === plainUnformatted) {
                cancelEditing();
              }
              e.stopPropagation();
            }
            textBox.trigger("keydown-complete");
          }, attachListeners = function() {
            textBox.on("blur", finishEditing).on("keydown", keyboardEvents);
          }, detachListeners = function() {
            textBox.off("blur", finishEditing).off("keydown", keyboardEvents);
          };
          attachListeners();
        });
      };
    }
  });

  // vendor/mapjs/src/browser/update-reorder-bounds.js
  var require_update_reorder_bounds = __commonJS({
    "vendor/mapjs/src/browser/update-reorder-bounds.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.updateReorderBounds = function(border, box, dropCoords) {
        "use strict";
        const element = this;
        if (!border) {
          element.hide();
          return;
        }
        element.show();
        element.attr("mapjs-edge", border.edge);
        if (border.edge === "top") {
          element.css({
            top: border.minY,
            left: Math.round(dropCoords.x - element.width() / 2)
          });
        } else {
          element.css({
            top: Math.round(dropCoords.y - element.height() / 2),
            left: border.x - (border.edge === "left" ? element.width() : 0)
          });
        }
      };
    }
  });

  // vendor/mapjs/src/core/util/connector-key.js
  var require_connector_key = __commonJS({
    "vendor/mapjs/src/core/util/connector-key.js"(exports, module) {
      var cleanDOMId = require_clean_dom_id();
      module.exports = function connectorKey(connectorObj) {
        "use strict";
        return cleanDOMId("connector_" + connectorObj.from + "_" + connectorObj.to);
      };
    }
  });

  // vendor/mapjs/src/browser/create-connector.js
  var require_create_connector = __commonJS({
    "vendor/mapjs/src/browser/create-connector.js"() {
      var jQuery3 = require_jquery();
      var createSVG = require_create_svg();
      var connectorKey = require_connector_key();
      var buildConnection = require_build_connection();
      var convertPositionToTransform = require_convert_position_to_transform();
      jQuery3.fn.createConnector = function(connector, optional) {
        "use strict";
        const stage = this.parent("[data-mapjs-role=stage]"), element = createSVG("g").data({ "nodeFrom": stage.nodeWithId(connector.from), "nodeTo": stage.nodeWithId(connector.to), attr: connector.attr }).attr({ "id": connectorKey(connector), "data-mapjs-role": "connector" }), connection = buildConnection(element, optional);
        return element.css(Object.assign(convertPositionToTransform(connection.position), { stroke: connection.color })).appendTo(this);
      };
    }
  });

  // vendor/mapjs/src/core/util/link-key.js
  var require_link_key = __commonJS({
    "vendor/mapjs/src/core/util/link-key.js"(exports, module) {
      var cleanDOMId = require_clean_dom_id();
      module.exports = function linkKey(linkObj) {
        "use strict";
        return cleanDOMId("link_" + linkObj.ideaIdFrom + "_" + linkObj.ideaIdTo);
      };
    }
  });

  // vendor/mapjs/src/browser/create-link.js
  var require_create_link = __commonJS({
    "vendor/mapjs/src/browser/create-link.js"() {
      var jQuery3 = require_jquery();
      var createSVG = require_create_svg();
      var linkKey = require_link_key();
      var themeLink = require_link();
      var convertPositionToTransform = require_convert_position_to_transform();
      require_get_data_box();
      jQuery3.fn.createLink = function(l, optional) {
        "use strict";
        const stage = this.parent("[data-mapjs-role=stage]"), theme = optional && optional.theme, linkBuilder = optional && optional.linkBuilder || themeLink, elementData = {
          "nodeFrom": stage.nodeWithId(l.ideaIdFrom),
          "nodeTo": stage.nodeWithId(l.ideaIdTo),
          attr: l.attr && l.attr.style || {}
        }, element = createSVG("g").attr({
          "id": linkKey(l),
          "data-mapjs-role": "link"
        }).data(elementData), connection = linkBuilder(elementData.nodeFrom.getDataBox(), elementData.nodeTo.getDataBox(), elementData.attrs, theme);
        element.css(Object.assign(convertPositionToTransform(connection.position), { stroke: connection.lineProps.color }));
        element.appendTo(this);
        return element;
      };
    }
  });

  // vendor/mapjs/src/browser/find-line.js
  var require_find_line = __commonJS({
    "vendor/mapjs/src/browser/find-line.js"() {
      var jQuery3 = require_jquery();
      var connectorKey = require_connector_key();
      var linkKey = require_link_key();
      jQuery3.fn.findLine = function(line) {
        "use strict";
        if (line && line.type === "connector") {
          return this.find("#" + connectorKey(line));
        } else if (line && line.type === "link") {
          return this.find("#" + linkKey(line));
        }
        console.log("invalid.line", line);
        throw "invalid-args";
      };
    }
  });

  // vendor/mapjs/src/browser/create-reorder-bounds.js
  var require_create_reorder_bounds = __commonJS({
    "vendor/mapjs/src/browser/create-reorder-bounds.js"() {
      var jQuery3 = require_jquery();
      jQuery3.fn.createReorderBounds = function() {
        "use strict";
        const result = jQuery3("<div>").attr({
          "data-mapjs-role": "reorder-bounds",
          "class": "mapjs-reorder-bounds"
        }).hide().css("position", "absolute").appendTo(this);
        return result;
      };
    }
  });

  // vendor/mapjs/src/browser/dom-map-controller.js
  var require_dom_map_controller = __commonJS({
    "vendor/mapjs/src/browser/dom-map-controller.js"(exports, module) {
      var jQuery3 = require_jquery();
      var _ = require_underscore_umd();
      var calculateLayout = require_calculate_layout();
      var nodeCacheMark = require_node_cache_mark();
      require_create_node();
      require_hammer_draggable();
      require_node_resize_widget();
      require_update_connector();
      require_update_link();
      require_node_with_id();
      require_update_node_content();
      require_update_stage();
      require_queue_fade_out();
      require_edit_node();
      require_update_reorder_bounds();
      require_create_connector();
      require_create_link();
      require_find_line();
      require_create_reorder_bounds();
      module.exports = function DomMapController(mapModel, stageElement, touchEnabled, resourceTranslator, themeSource, options) {
        "use strict";
        let stageMargin = options && options.stageMargin, stageVisibilityMargin = options && options.stageVisibilityMargin, currentDroppable = false, stats = false, viewPortDimensions;
        const self2 = this, viewPort = stageElement.parent(), viewPortAnimOptions = { duration: 400 }, reorderBounds = mapModel.isEditingEnabled() ? stageElement.createReorderBounds() : jQuery3("<div>"), svgPixel = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>', dummyTextBox = jQuery3("<div>").addClass("mapjs-node").addClass("noTransition").css({ position: "absolute", visibility: "hidden" }), getViewPortDimensions = function() {
          if (viewPortDimensions) {
            return viewPortDimensions;
          }
          viewPortDimensions = {
            left: viewPort.scrollLeft(),
            top: viewPort.scrollTop(),
            innerWidth: viewPort.innerWidth(),
            innerHeight: viewPort.innerHeight()
          };
          return viewPortDimensions;
        }, stageToViewCoordinates = function(x, y) {
          const stage = stageElement.data(), scrollPosition = getViewPortDimensions();
          return {
            x: stage.scale * (x + stage.offsetX) - scrollPosition.left,
            y: stage.scale * (y + stage.offsetY) - scrollPosition.top
          };
        }, viewToStageCoordinates = function(x, y) {
          const stage = stageElement.data(), scrollPosition = getViewPortDimensions();
          return {
            x: (scrollPosition.left + x) / stage.scale - stage.offsetX,
            y: (scrollPosition.top + y) / stage.scale - stage.offsetY
          };
        }, updateScreenCoordinates = function() {
          const element = jQuery3(this);
          element.css({
            "left": element.data("x"),
            "top": element.data("y")
          }).trigger("mapjs:move");
        }, ensureSpaceForPoint = function(x, y) {
          const stage = stageElement.data();
          let dirty = false;
          if (x < -1 * stage.offsetX) {
            stage.width = stage.width - stage.offsetX - x;
            stage.offsetX = -1 * x;
            dirty = true;
          }
          if (y < -1 * stage.offsetY) {
            stage.height = stage.height - stage.offsetY - y;
            stage.offsetY = -1 * y;
            dirty = true;
          }
          if (x > stage.width - stage.offsetX) {
            stage.width = stage.offsetX + x;
            dirty = true;
          }
          if (y > stage.height - stage.offsetY) {
            stage.height = stage.offsetY + y;
            dirty = true;
          }
          if (dirty) {
            stageElement.updateStage();
          }
        }, ensureSpaceForNode = function() {
          return jQuery3(this).each(function() {
            const node = jQuery3(this).data(), margin = stageMargin || { top: 0, left: 0, bottom: 0, right: 0 };
            ensureSpaceForPoint(node.x - margin.left, node.y - margin.top);
            ensureSpaceForPoint(node.x + node.width + margin.right, node.y + node.height + margin.bottom);
          });
        }, centerViewOn = function(x, y, animate) {
          const stage = stageElement.data(), viewPortCenter = {
            x: Math.round(viewPort.innerWidth() / 2),
            y: Math.round(viewPort.innerHeight() / 2)
          }, margin = stageVisibilityMargin || { top: 0, left: 0, bottom: 0, right: 0 };
          let newLeftScroll = false, newTopScroll = false;
          ensureSpaceForPoint(x - viewPortCenter.x / stage.scale, y - viewPortCenter.y / stage.scale);
          ensureSpaceForPoint(x + viewPortCenter.x / stage.scale - margin.left, y + viewPortCenter.y / stage.scale - margin.top);
          newLeftScroll = stage.scale * (x + stage.offsetX) - viewPortCenter.x;
          newTopScroll = stage.scale * (y + stage.offsetY) - viewPortCenter.y;
          viewPort.finish();
          if (animate) {
            viewPort.animate({
              scrollLeft: newLeftScroll,
              scrollTop: newTopScroll
            }, viewPortAnimOptions);
          } else {
            viewPort.scrollLeft(newLeftScroll);
            viewPort.scrollTop(newTopScroll);
          }
        }, centerViewOnNode = function(ideaId, animate) {
          const node = stageElement.nodeWithId(ideaId).data(), nodeCenterX = Math.round(node.x + node.width / 2), nodeCenterY = Math.round(node.y + node.height / 2);
          centerViewOn(nodeCenterX, nodeCenterY, animate);
        }, stagePointAtViewportCenter = function() {
          return viewToStageCoordinates(Math.round(viewPort.innerWidth() / 2), Math.round(viewPort.innerHeight() / 2));
        }, ensureNodeVisible = function(domElement) {
          if (!domElement || domElement.length === 0) {
            return;
          }
          viewPort.finish();
          const node = domElement.data(), nodeTopLeft = stageToViewCoordinates(node.x, node.y), nodeBottomRight = stageToViewCoordinates(node.x + node.width, node.y + node.height), animation = {}, margin = stageVisibilityMargin || { top: 10, left: 10, bottom: 10, right: 10 };
          if (nodeTopLeft.x - margin.left < 0) {
            animation.scrollLeft = viewPort.scrollLeft() + nodeTopLeft.x - margin.left;
          } else if (nodeBottomRight.x + margin.right > viewPort.innerWidth()) {
            animation.scrollLeft = viewPort.scrollLeft() + nodeBottomRight.x - viewPort.innerWidth() + margin.right;
          }
          if (nodeTopLeft.y - margin.top < 0) {
            animation.scrollTop = viewPort.scrollTop() + nodeTopLeft.y - margin.top;
          } else if (nodeBottomRight.y + margin.bottom > viewPort.innerHeight()) {
            animation.scrollTop = viewPort.scrollTop() + nodeBottomRight.y - viewPort.innerHeight() + margin.bottom;
          }
          if (!_.isEmpty(animation)) {
            viewPort.animate(animation, viewPortAnimOptions);
          }
        }, viewportCoordinatesForPointEvent = function(evt) {
          const dropPosition = evt && evt.gesture && evt.gesture.center || evt, vpOffset = viewPort.offset();
          let result;
          if (dropPosition) {
            result = {
              x: dropPosition.pageX - vpOffset.left,
              y: dropPosition.pageY - vpOffset.top
            };
            if (result.x >= 0 && result.x <= viewPort.innerWidth() && result.y >= 0 && result.y <= viewPort.innerHeight()) {
              return result;
            }
          }
        }, stagePositionForPointEvent = function(evt) {
          const viewportDropCoordinates = viewportCoordinatesForPointEvent(evt);
          if (viewportDropCoordinates) {
            return viewToStageCoordinates(viewportDropCoordinates.x, viewportDropCoordinates.y);
          }
        }, clearCurrentDroppable = function() {
          if (currentDroppable || currentDroppable === false) {
            jQuery3(".mapjs-node").removeClass("droppable");
            currentDroppable = void 0;
          }
        }, showDroppable = function(nodeId) {
          stageElement.nodeWithId(nodeId).addClass("droppable");
          currentDroppable = nodeId;
        }, withinReorderBoundary = function(boundaries, box) {
          const closeTo = function(reorderBoundary) {
            let nodeX = box.x;
            if (reorderBoundary.edge === "right") {
              nodeX += box.width;
            }
            if (reorderBoundary.x && reorderBoundary.margin) {
              return Math.abs(nodeX - reorderBoundary.x) < reorderBoundary.margin * 2 && box.y < reorderBoundary.maxY && box.y > reorderBoundary.minY;
            } else {
              return box.y < reorderBoundary.maxY && box.y > reorderBoundary.minY && box.x < reorderBoundary.maxX && box.x > reorderBoundary.minX;
            }
          };
          if (_.isEmpty(boundaries)) {
            return false;
          }
          if (!box) {
            return false;
          }
          return _.find(boundaries, closeTo);
        }, translateToPixel = function() {
          return svgPixel;
        }, record = function(evt) {
          if (!stats) {
            return false;
          }
          if (!stats[evt]) {
            stats[evt] = 0;
          }
          stats[evt] = stats[evt] + 1;
        }, recordCacheMiss = function(actual, expected) {
          if (!stats) {
            return false;
          }
          if (!stats.cacheMisses) {
            stats.cacheMisses = [];
          }
          stats.cacheMisses.push({ old: actual, new: expected });
        };
        self2.resetStats = function() {
          stats = {};
        };
        self2.getStats = function() {
          return stats;
        };
        self2.setStageMargin = function(newMargins) {
          stageMargin = newMargins;
        };
        self2.setStageVisibilityMargin = function(newMargins) {
          stageVisibilityMargin = newMargins;
        };
        self2.dimensionProvider = function(idea, level) {
          let result = false, textBox = stageElement.nodeWithId(idea.id);
          const expectedCacheMark = nodeCacheMark(idea, { level, theme: themeSource() });
          if (textBox && textBox.length > 0) {
            if (_.isEqual(textBox.data("nodeCacheMark"), expectedCacheMark)) {
              record("dimension-cache:hit");
              return _.pick(textBox.data(), "width", "height", "textWidth");
            }
          }
          record("dimension-cache:miss");
          recordCacheMiss(textBox.data("nodeCacheMark"), expectedCacheMark);
          textBox = dummyTextBox;
          textBox.appendTo("body").updateNodeContent(
            idea,
            themeSource(),
            { resourceTranslator: translateToPixel, level, decorations: ["left", "right", "top", "bottom"] }
          );
          result = {
            width: Math.ceil(textBox.outerWidth(true)),
            textWidth: Math.ceil(textBox.find('[data-mapjs-role="title"]').outerWidth(true)),
            height: Math.ceil(textBox.outerHeight(true))
          };
          textBox.detach();
          return result;
        };
        mapModel.setLayoutCalculator(function(contentAggregate, contextNode) {
          return calculateLayout(contentAggregate, self2.dimensionProvider, { contextNode, theme: themeSource() });
        });
        viewPort.on("scroll", function() {
          viewPortDimensions = void 0;
        });
        mapModel.addEventListener("nodeCreated", function(node) {
          let currentReorderBoundary;
          const element = stageElement.createNode(node).updateNodeContent(node, themeSource(), { resourceTranslator }).nodeResizeWidget(node.id, mapModel, stagePositionForPointEvent).on("tap", function(evt) {
            const realEvent = evt.gesture && evt.gesture.srcEvent || evt;
            if (realEvent.button && realEvent.button !== -1) {
              return;
            }
            mapModel.clickNode(node.id, realEvent);
            if (evt) {
              evt.stopPropagation();
            }
            if (evt && evt.gesture) {
              evt.gesture.stopPropagation();
            }
          }).on("doubletap", function(event) {
            if (event) {
              event.stopPropagation();
              if (event.gesture) {
                event.gesture.stopPropagation();
              }
            }
            if (!mapModel.isEditingEnabled()) {
              mapModel.toggleCollapse("mouse");
              return;
            }
            if (mapModel.getSelectedNodeId() !== node.id) {
              mapModel.selectNode(node.id);
              return;
            }
            mapModel.editNode("mouse");
          }).on("attachment-click", function() {
            mapModel.openAttachment("mouse", node.id);
          }).on("decoration-click", function(evt, decorationType) {
            mapModel.decorationAction("mouse", node.id, decorationType);
          }).each(ensureSpaceForNode).each(updateScreenCoordinates).on("mm:start-dragging mm:start-dragging-shadow", function(evt) {
            if (evt && evt.relatedTarget === this) {
              mapModel.selectNode(node.id);
              currentReorderBoundary = mapModel.getReorderBoundary(node.id);
              element.addClass("dragging");
            }
          }).on("mm:drag", function(evt) {
            const dropCoords = stagePositionForPointEvent(evt), currentPosition = evt.currentPosition && stagePositionForPointEvent({ pageX: evt.currentPosition.left, pageY: evt.currentPosition.top }), hasShift = evt && evt.gesture && evt.gesture.srcEvent && evt.gesture.srcEvent.shiftKey, nodeId = dropCoords && mapModel.getNodeIdAtPosition(dropCoords.x, dropCoords.y);
            let border;
            if (!dropCoords) {
              clearCurrentDroppable();
              return;
            }
            if (!hasShift && !nodeId && currentPosition) {
              currentPosition.width = element.outerWidth();
              currentPosition.height = element.outerHeight();
              border = withinReorderBoundary(currentReorderBoundary, currentPosition);
              reorderBounds.updateReorderBounds(border, currentPosition, dropCoords);
            } else {
              reorderBounds.hide();
            }
            if (!nodeId || nodeId === node.id) {
              clearCurrentDroppable();
            } else if (nodeId !== currentDroppable) {
              clearCurrentDroppable();
              if (nodeId) {
                showDroppable(nodeId);
              }
            }
          }).on("contextmenu", function(event) {
            mapModel.selectNode(node.id);
            if (mapModel.requestContextMenu(event.pageX, event.pageY)) {
              event.preventDefault();
              return false;
            }
          }).on("mm:stop-dragging", function(evt) {
            element.removeClass("dragging");
            reorderBounds.hide();
            let dropResult, manualPosition;
            const isShift = evt && evt.gesture && evt.gesture.srcEvent && evt.gesture.srcEvent.shiftKey, stageDropCoordinates = stagePositionForPointEvent(evt), nodeAtDrop = stageDropCoordinates && mapModel.getNodeIdAtPosition(stageDropCoordinates.x, stageDropCoordinates.y), finalPosition = evt.finalPosition && stagePositionForPointEvent({ pageX: evt.finalPosition.left, pageY: evt.finalPosition.top });
            clearCurrentDroppable();
            if (!stageDropCoordinates) {
              return;
            }
            if (nodeAtDrop && nodeAtDrop !== node.id) {
              dropResult = mapModel.dropNode(node.id, nodeAtDrop, !!isShift);
            } else {
              finalPosition.width = element.outerWidth();
              finalPosition.height = element.outerHeight();
              manualPosition = !!isShift || !withinReorderBoundary(currentReorderBoundary, finalPosition);
              if (manualPosition) {
                dropResult = mapModel.positionNodeAt(node.id, finalPosition.x, finalPosition.y, manualPosition);
              } else {
                dropResult = mapModel.positionNodeAt(node.id, stageDropCoordinates.x, stageDropCoordinates.y, manualPosition);
              }
            }
            return dropResult;
          }).on("mm:cancel-dragging", function() {
            clearCurrentDroppable();
            element.removeClass("dragging");
            reorderBounds.hide();
          }).on("mm:resize", function(event) {
            mapModel.setNodeWidth("mouse", node.id, event.nodeWidth);
          });
          if (touchEnabled) {
            element.on("hold", function(evt) {
              const realEvent = evt.gesture && evt.gesture.srcEvent || evt;
              mapModel.clickNode(node.id, realEvent);
              if (mapModel.requestContextMenu(evt.gesture.center.pageX, evt.gesture.center.pageY)) {
                evt.preventDefault();
                if (evt.gesture) {
                  evt.gesture.preventDefault();
                  evt.gesture.stopPropagation();
                }
                return false;
              }
            });
          }
          element.css("min-width", element.css("width"));
          if (mapModel.isEditingEnabled()) {
            element.shadowDraggable();
          }
        });
        mapModel.addEventListener("nodeSelectionChanged", function(ideaId, isSelected) {
          const node = stageElement.nodeWithId(ideaId);
          if (isSelected) {
            node.addClass("selected");
            ensureNodeVisible(node);
          } else {
            node.removeClass("selected");
          }
        });
        mapModel.addEventListener("nodeRemoved", function(node) {
          stageElement.nodeWithId(node.id).queueFadeOut(themeSource());
        });
        mapModel.addEventListener("nodeMoved", function(node) {
          stageElement.nodeWithId(node.id).data({
            "x": Math.round(node.x),
            "y": Math.round(node.y),
            "width": Math.round(node.width),
            "height": Math.round(node.height)
          }).each(ensureSpaceForNode).each(updateScreenCoordinates);
        });
        mapModel.addEventListener("nodeTitleChanged nodeAttrChanged nodeLabelChanged", function(n) {
          stageElement.nodeWithId(n.id).updateNodeContent(n, themeSource(), { resourceTranslator }).each(ensureSpaceForNode);
        });
        mapModel.addEventListener("connectorMoved", function(connector) {
          stageElement.findLine(connector).updateConnector({ theme: themeSource() });
        });
        mapModel.addEventListener("connectorCreated", function(connector) {
          const connectorOptions = { theme: themeSource() }, element = stageElement.find("[data-mapjs-role=svg-container]").createConnector(connector, connectorOptions).updateConnector(connectorOptions);
          stageElement.nodeWithId(connector.from).add(stageElement.nodeWithId(connector.to)).on("mapjs:resize", function() {
            element.updateConnector({ theme: themeSource() });
          });
          element.on("tap", function(event) {
            const theme = themeSource();
            if (!theme || !theme.connectorEditingContext || theme.connectorEditingContext.allowed && theme.connectorEditingContext.allowed.length) {
              if (event.target && event.target.tagName === "text") {
                mapModel.lineLabelClicked(connector);
              } else {
                mapModel.selectConnector(
                  "mouse",
                  connector,
                  event && event.gesture && event.gesture.center && { x: event.gesture.center.pageX, y: event.gesture.center.pageY }
                );
              }
            }
            event.gesture && event.gesture.stopPropagation && event.gesture.stopPropagation();
            event.stopPropagation();
          });
        });
        mapModel.addEventListener("connectorRemoved", function(connector) {
          stageElement.findLine(connector).queueFadeOut(themeSource());
        });
        mapModel.addEventListener("linkCreated", function(line) {
          const link = stageElement.find("[data-mapjs-role=svg-container]").createLink(line, { theme: themeSource() }).updateLink({ theme: themeSource() });
          link.on("tap", function(event) {
            if (event.target && event.target.tagName === "text") {
              mapModel.lineLabelClicked(line);
            } else {
              mapModel.selectLink("mouse", line, { x: event.gesture.center.pageX, y: event.gesture.center.pageY });
            }
            event.stopPropagation();
            event.gesture.stopPropagation();
          });
          stageElement.nodeWithId(line.ideaIdFrom).add(stageElement.nodeWithId(line.ideaIdTo)).on("mapjs:move mm:drag mapjs:resize", function() {
            link.updateLink({ theme: themeSource() });
          });
        });
        mapModel.addEventListener("linkRemoved", function(l) {
          stageElement.findLine(l).queueFadeOut(themeSource());
        });
        mapModel.addEventListener("mapScaleChanged", function(scaleMultiplier) {
          const currentScale = stageElement.data("scale"), targetScale = Math.max(Math.min(currentScale * scaleMultiplier, 5), 0.2), currentCenter = stagePointAtViewportCenter();
          if (currentScale === targetScale) {
            return;
          }
          stageElement.data("scale", targetScale).updateStage();
          centerViewOn(currentCenter.x, currentCenter.y);
        });
        mapModel.addEventListener("nodeVisibilityRequested", function(ideaId) {
          const id = ideaId || mapModel.getCurrentlySelectedIdeaId(), node = stageElement.nodeWithId(id);
          if (node) {
            ensureNodeVisible(node);
          }
        });
        mapModel.addEventListener("nodeFocusRequested", function(ideaId) {
          if (stageElement.data("scale") !== 1) {
            stageElement.data("scale", 1).updateStage();
          }
          centerViewOnNode(ideaId, true);
        });
        mapModel.addEventListener("mapViewResetRequested", function() {
          stageElement.data({ "scale": 1, "height": 0, "width": 0, "offsetX": 0, "offsetY": 0 }).updateStage();
          jQuery3(stageElement).find(".mapjs-node").each(ensureSpaceForNode);
          jQuery3(stageElement).find("[data-mapjs-role=connector]").updateConnector({ theme: themeSource() });
          jQuery3(stageElement).find("[data-mapjs-role=link]").updateLink({ theme: themeSource() });
          centerViewOnNode(mapModel.getCurrentlySelectedIdeaId());
          viewPort.focus();
        });
        mapModel.addEventListener("layoutChangeStarting", function() {
          viewPortDimensions = void 0;
        });
        mapModel.addEventListener("layoutChangeComplete", function() {
          ensureNodeVisible(stageElement.nodeWithId(mapModel.getCurrentlySelectedIdeaId()));
        });
        if (!options || !options.inlineEditingDisabled) {
          mapModel.addEventListener("nodeEditRequested", function(nodeId, shouldSelectAll, editingNew) {
            const editingElement = stageElement.nodeWithId(nodeId);
            mapModel.setInputEnabled(false);
            viewPort.finish();
            editingElement.editNode(shouldSelectAll).then(function(newText) {
              mapModel.setInputEnabled(true);
              mapModel.updateTitle(nodeId, newText, editingNew);
              editingElement.focus();
            }).catch(function() {
              mapModel.setInputEnabled(true);
              if (editingNew) {
                mapModel.undo("internal");
              }
              editingElement.focus();
            });
          });
        }
        mapModel.addEventListener("linkAttrChanged", function(l) {
          stageElement.findLine(l).data("attr", l.attr && l.attr.style || {}).updateLink({ theme: themeSource() });
        });
        mapModel.addEventListener("connectorAttrChanged", function(connector) {
          stageElement.findLine(connector).data("attr", connector.attr || false).updateConnector({ theme: themeSource() });
        });
        mapModel.addEventListener("activatedNodesChanged", function(activatedNodes, deactivatedNodes) {
          _.each(activatedNodes, function(nodeId) {
            stageElement.nodeWithId(nodeId).addClass("activated");
          });
          _.each(deactivatedNodes, function(nodeId) {
            stageElement.nodeWithId(nodeId).removeClass("activated");
          });
        });
        ["nodeTitleChanged", "nodeAttrChanged", "nodeLabelChanged", "nodeMoved", "nodeRemoved", "nodeCreated", "connectorCreated", "connectorRemoved", "linkCreated", "linkRemoved", "linkAttrChanged", "connectorAttrChanged"].forEach((evt) => {
          mapModel.addEventListener(evt, () => {
            record(evt);
          });
        });
      };
    }
  });

  // vendor/mapjs/src/core/theme/theme-processor.js
  var require_theme_processor = __commonJS({
    "vendor/mapjs/src/core/theme/theme-processor.js"(exports, module) {
      var _ = require_underscore_umd();
      var colorParser = require_color_parser();
      module.exports = function ThemeProcessor() {
        "use strict";
        const self2 = this, addPx = function(val) {
          return val + "px";
        }, cssProp = {
          cornerRadius: "border-radius",
          "text.color": "color",
          "text.margin": "padding",
          background: "background-color",
          backgroundColor: "background-color",
          border: "border",
          shadow: "box-shadow",
          "text.font": "font",
          "text.alignment": "text-align"
        }, fontWeightParser = function(fontObj) {
          const weightMap = {
            "light": "200",
            "semi-bold": "600"
          };
          if (!fontObj || !fontObj.weight) {
            return "bold";
          }
          return weightMap[fontObj.weight] || fontObj.weight;
        }, fontSizeParser = function(fontObj) {
          const fontSize = fontObj && fontObj.size || 12, lineSpacing = fontObj && fontObj.lineSpacing || 3, lineHeight = (fontSize + lineSpacing) / fontSize;
          return fontSize + "pt/" + lineHeight.toFixed(2);
        }, parsers = {
          cornerRadius: addPx,
          "text.margin": addPx,
          background: colorParser,
          border: function(borderOb) {
            if (!borderOb.line) {
              return "0";
            }
            return borderOb.line.width + "px " + (borderOb.line.style || "solid") + " " + borderOb.line.color + ";margin:" + -1 * borderOb.line.width + "px";
          },
          shadow: function(shadowArray) {
            const boxshadows = [];
            if (shadowArray.length === 1 && shadowArray[0].color === "transparent") {
              return "none";
            }
            shadowArray.forEach(function(shadow) {
              boxshadows.push(shadow.offset.width + "px " + shadow.offset.height + "px " + shadow.radius + "px " + colorParser(shadow));
            });
            return boxshadows.join(",");
          },
          "text.font": function(fontObj) {
            return "normal normal " + fontWeightParser(fontObj) + " " + fontSizeParser(fontObj) + ' NotoSans, "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif';
          }
        }, processNodeStyles = function(nodeStyleArray) {
          let parser, cssVal;
          const result = [], pushProperties = function(styleObject, keyPrefix) {
            _.each(styleObject, function(val, propKey) {
              const key = (keyPrefix || "") + propKey;
              if (cssProp[key]) {
                parser = parsers[key] || _.identity;
                cssVal = parser(val);
                if (cssVal) {
                  result.push(cssProp[key]);
                  result.push(":");
                  result.push(cssVal);
                  result.push(";");
                }
              } else if (_.isObject(val)) {
                pushProperties(val, key + ".");
              }
            });
          }, appendSpanStyles = function(styleSelector, nodeStyle) {
            const maxWidth = nodeStyle.text && nodeStyle.text.maxWidth;
            if (!maxWidth) {
              return;
            }
            result.push(styleSelector);
            result.push(" span {");
            result.push("max-width:");
            result.push(maxWidth);
            result.push("px;}");
          }, appendDecorationStyles = function(styleSelector, nodeStyle) {
            const style = nodeStyle.decorations, margin = nodeStyle.text && nodeStyle.text.margin || 0, fontSize = nodeStyle && nodeStyle.text && nodeStyle.text.font && nodeStyle.text.font.size || 9;
            if (!style) {
              return;
            }
            result.push(styleSelector);
            result.push(" .mapjs-decorations{position:absolute;");
            result.push(`font-size:${fontSize}pt;`);
            if (style.edge === "top" || style.edge === "bottom") {
              if (style.position === "end") {
                result.push("right:0;");
              } else if (style.position === "start") {
                result.push("left:0;");
              } else {
                result.push("left:0;width:100%;text-align:center;");
              }
              result.push(style.edge);
              result.push(":-");
              result.push(style.overlap ? Math.round(style.height / 2) + margin : style.height);
              result.push("px;");
            } else if (style.edge === "left" || style.edge === "right") {
              result.push(style.edge === "left" ? "right" : "left");
              result.push(":100%;");
              if (style.position === "end") {
                result.push("bottom:0;");
              } else if (style.position === "start") {
                result.push("top:0;");
              } else {
                result.push("top:calc(50% - ");
                result.push(Math.round(style.height / 2));
                result.push("px);");
              }
            }
            result.push("}");
          };
          nodeStyleArray.forEach(function(nodeStyle) {
            let styleSelector = ".mapjs-node";
            if (nodeStyle.name !== "default") {
              styleSelector = styleSelector + "." + nodeStyle.name.replace(/\s/g, "_");
            }
            result.push(styleSelector);
            result.push("{");
            pushProperties(nodeStyle);
            result.push("}");
            appendDecorationStyles(styleSelector, nodeStyle);
            appendSpanStyles(styleSelector, nodeStyle);
          });
          return result;
        }, processThemeStyles = (theme) => {
          if (theme.noAnimations) {
            return [];
          }
          return ['body:not(.noTransition) .mapjs-node:not(.noTransition):not(.dragging), body:not(.noTransition) [data-mapjs-role="svg-container"] :not(.noTransition), body:not(.noTransition) [data-mapjs-role="svg-container"] :not(.noTransition) :not(.noTransition) { transition-property: transform, left, d, top, opacity; transition-duration: 400ms;}'];
        };
        self2.process = function(theme) {
          let nodeStyles = "";
          if (theme.node) {
            nodeStyles = processThemeStyles(theme).concat(processNodeStyles(theme.node)).join("");
          }
          return {
            css: nodeStyles
          };
        };
        self2.cssFont = parsers["text.font"];
      };
    }
  });

  // vendor/mapjs/src/core/content/format-note-to-html.js
  var require_format_note_to_html = __commonJS({
    "vendor/mapjs/src/core/content/format-note-to-html.js"(exports, module) {
      var URLHelper = require_url_helper();
      var _ = require_underscore_umd();
      module.exports = function formatNoteToHtml(noteText) {
        "use strict";
        if (!noteText) {
          return "";
        }
        if (typeof noteText !== "string") {
          throw "invalid-args";
        }
        const safeString = _.escape(noteText);
        return URLHelper.formatLinks(safeString);
      };
    }
  });

  // vendor/mapjs/src/npm-main.js
  var require_npm_main = __commonJS({
    "vendor/mapjs/src/npm-main.js"(exports, module) {
      require_dom_map_widget();
      require_link_edit_widget();
      module.exports = {
        MapModel: require_map_model(),
        content: require_content(),
        observable: require_observable(),
        DomMapController: require_dom_map_controller(),
        ThemeProcessor: require_theme_processor(),
        Theme: require_theme(),
        defaultTheme: require_default_theme(),
        formatNoteToHtml: require_format_note_to_html(),
        richText: require_rich_text(),
        version: 4
      };
    }
  });

  // theme-argmap.js
  var require_theme_argmap = __commonJS({
    "theme-argmap.js"(exports, module) {
      var argMappingSimple = {
        "name": "MindMup Top Down Argument Mapping",
        "connectorEditingContext": {
          "name": "argument-mapping",
          "allowed": [
            "width",
            "label"
          ],
          "defaults": {
            "width": 3
          }
        },
        "blockThemeOverrides": true,
        "layout": {
          "orientation": "top-down",
          "spacing": {
            "h": 20,
            "v": 60
          }
        },
        "node": [
          {
            "name": "default",
            "cornerRadius": 5,
            "backgroundColor": "#ffffff",
            "border": {
              "type": "surround",
              "line": {
                "color": "#707070",
                "width": 1
              }
            },
            "shadow": [
              {
                "color": "#070707",
                "opacity": 0.3,
                "offset": {
                  "width": 2,
                  "height": 2
                },
                "radius": 2
              }
            ],
            "text": {
              "margin": 5,
              "alignment": "start",
              "maxWidth": 146,
              "color": "#4F4F4F",
              "lightColor": "#EEEEEE",
              "darkColor": "#000000",
              "font": {
                "lineSpacing": 5,
                "lineSpacingPx": 6.6,
                "size": 10,
                "sizePx": 13.3,
                "weight": "light"
              }
            },
            "connections": {
              "default": {
                "h": "center-separated",
                "v": "base"
              },
              "from": {
                "horizontal": {
                  "h": "center-separated",
                  "v": "base"
                }
              },
              "to": {
                "h": "center",
                "v": "top"
              }
            },
            "decorations": {
              "height": 20,
              "edge": "top",
              "overlap": true,
              "position": "end",
              "margin": 2,
              "label": {
                "border": 1,
                "cornerRadius": 11,
                "margin": 2,
                "font": {
                  "lineSpacing": 0,
                  "lineSpacingPx": 0,
                  "size": 9,
                  "sizePx": 12,
                  "weight": "bold"
                }
              },
              "cornerRadius": 12,
              "backgroundColor": "#22aae0",
              "opacity": 0.8,
              "color": "#ffffff"
            }
          },
          {
            "name": "attr_implicit_claim",
            "border": {
              "type": "surround",
              "line": {
                "color": "#707070",
                "width": 1,
                "style": "dashed"
              }
            }
          },
          {
            "name": "activated",
            "border": {
              "type": "surround",
              "line": {
                "color": "#22AAE0",
                "width": 3,
                "style": "dotted"
              }
            }
          },
          {
            "name": "activated.attr_implicit_claim",
            "border": {
              "type": "surround",
              "line": {
                "color": "#22AAE0",
                "width": 3,
                "style": "dashed"
              }
            }
          },
          {
            "name": "selected",
            "shadow": [
              {
                "color": "#000000",
                "opacity": 0.9,
                "offset": {
                  "width": 2,
                  "height": 2
                },
                "radius": 2
              }
            ]
          },
          {
            "name": "collapsed",
            "shadow": [
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 1
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 3
                },
                "radius": 0
              },
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 4
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 6
                },
                "radius": 0
              },
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 7
                },
                "radius": 0
              }
            ]
          },
          {
            "name": "collapsed.selected",
            "shadow": [
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 1
                },
                "radius": 0
              },
              {
                "color": "#888888",
                "offset": {
                  "width": 0,
                  "height": 3
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 6
                },
                "radius": 0
              },
              {
                "color": "#555555",
                "offset": {
                  "width": 0,
                  "height": 7
                },
                "radius": 0
              },
              {
                "color": "#FFFFFF",
                "offset": {
                  "width": 0,
                  "height": 10
                },
                "radius": 0
              },
              {
                "color": "#333333",
                "offset": {
                  "width": 0,
                  "height": 11
                },
                "radius": 0
              }
            ]
          },
          {
            "name": "attr_group",
            "cornerRadius": 10,
            "backgroundColor": "transparent",
            "border": {
              "type": "overline"
            },
            "shadow": [
              {
                "color": "transparent"
              }
            ],
            "text": {
              "margin": 0,
              "alignment": "center",
              "color": "#4F4F4F",
              "lightColor": "#EEEEEE",
              "darkColor": "#000000",
              "font": {
                "lineSpacing": 2.5,
                "lineSpacingPx": 3.25,
                "size": 9,
                "sizePx": 12,
                "weight": "bold"
              }
            },
            "connections": {
              "style": "supporting-group",
              "childstyle": "no-connector",
              "default": {
                "h": "center",
                "v": "base"
              },
              "from": {
                "below": {
                  "h": "center",
                  "v": "base"
                }
              },
              "to": {
                "h": "center",
                "v": "top"
              }
            }
          },
          {
            "name": "attr_group_supporting",
            "connections": {
              "style": "supporting-group",
              "childstyle": "no-connector",
              "default": {
                "h": "center",
                "v": "base"
              },
              "from": {
                "below": {
                  "h": "center",
                  "v": "base"
                }
              },
              "to": {
                "h": "center",
                "v": "top"
              }
            }
          },
          {
            "name": "attr_group_supporting.level_1",
            "backgroundColor": "rgba(0, 255, 0, 0.2)",
            "border": {
              "type": "surround",
              "line": {
                "color": "transparent",
                "width": 2,
                "style": "solid"
              }
            }
          },
          {
            "name": "attr_group_supporting.activated",
            "backgroundColor": "rgba(0, 255, 0, 0.2)",
            "border": {
              "type": "surround",
              "line": {
                "color": "#00FF00",
                "width": 3,
                "style": "dotted"
              }
            }
          },
          {
            "name": "attr_group_opposing",
            "connections": {
              "style": "opposing-group",
              "childstyle": "no-connector",
              "default": {
                "h": "center",
                "v": "base"
              },
              "from": {
                "below": {
                  "h": "center",
                  "v": "base"
                }
              },
              "to": {
                "h": "center",
                "v": "top"
              }
            }
          },
          {
            "name": "attr_group_opposing.level_1",
            "backgroundColor": "rgba(255, 0, 0, 0.2)",
            "border": {
              "type": "surround",
              "line": {
                "color": "transparent",
                "width": 2,
                "style": "solid"
              }
            }
          },
          {
            "name": "attr_group_opposing.activated",
            "backgroundColor": "rgba(255, 0, 0, 0.2)",
            "border": {
              "type": "surround",
              "line": {
                "color": "#FF0000",
                "width": 3,
                "style": "dotted"
              }
            }
          },
          {
            "name": "attr_group_supporting.droppable",
            "backgroundColor": "rgba(0, 255, 0, 0.6)",
            "border": {
              "type": "surround",
              "line": {
                "color": "#00FF00",
                "width": 3,
                "style": "dashed"
              }
            }
          },
          {
            "name": "attr_group_opposing.droppable",
            "backgroundColor": "rgba(255, 0, 0, 0.6)",
            "border": {
              "type": "surround",
              "line": {
                "color": "#FF0000",
                "width": 3,
                "style": "dashed"
              }
            }
          }
        ],
        "connector": {
          "default": {
            "type": "vertical-quadratic-s-curve",
            "line": {
              "color": "#707070",
              "width": 1
            },
            "label": {
              "position": {
                "aboveEnd": 15,
                "ratio": 0.8
              },
              "backgroundColor": "white",
              "borderColor": "white",
              "text": {
                "color": "#4F4F4F",
                "font": {
                  "size": 9,
                  "sizePx": 12,
                  "weight": "normal"
                }
              }
            }
          },
          "no-connector": {
            "type": "no-connector",
            "line": {
              "color": "#707070",
              "width": 0
            }
          },
          "supporting-group": {
            "type": "vertical-quadratic-s-curve",
            "line": {
              "color": "#339966",
              "width": 3
            },
            "label": {
              "position": {
                "aboveEnd": 15,
                "ratio": 0.8
              },
              "backgroundColor": "white",
              "borderColor": "white",
              "text": {
                "color": "#339966",
                "font": {
                  "size": 9,
                  "sizePx": 12,
                  "weight": "normal"
                }
              }
            }
          },
          "opposing-group": {
            "type": "vertical-quadratic-s-curve",
            "line": {
              "color": "#FF0000",
              "width": 3
            },
            "label": {
              "position": {
                "aboveEnd": 15,
                "ratio": 0.8
              },
              "backgroundColor": "white",
              "borderColor": "white",
              "text": {
                "color": "#FF0000",
                "font": {
                  "size": 9,
                  "sizePx": 12,
                  "weight": "normal"
                }
              }
            }
          },
          "no-connector.supporting-group": {
            "type": "no-connector",
            "line": {
              "color": "#339966",
              "width": 4
            },
            "label": {
              "position": {
                "ratio": 0.5
              },
              "backgroundColor": "transparent",
              "borderColor": "transparent",
              "text": {
                "color": "#339966",
                "font": {
                  "size": 6,
                  "sizePx": 9,
                  "weight": "normal"
                }
              }
            }
          },
          "no-connector.opposing-group": {
            "type": "no-connector",
            "line": {
              "color": "#FF0000",
              "width": 4
            },
            "label": {
              "position": {
                "ratio": 0.5
              },
              "backgroundColor": "transparent",
              "borderColor": "transparent",
              "text": {
                "color": "#4F4F4F",
                "font": {
                  "size": 6,
                  "sizePx": 9,
                  "weight": "normal"
                }
              }
            }
          }
        }
      };
      var argMappingHighImpact = JSON.parse(JSON.stringify(argMappingSimple));
      argMappingHighImpact.name = "MindMup Top Down Argument Mapping (high impact)";
      argMappingHighImpact.connector["supporting-group"].label.defaultText = "because...";
      argMappingHighImpact.connector["opposing-group"].label.defaultText = "but...";
      module.exports = {
        default: argMappingSimple,
        argMappingSimple,
        argMappingHighImpact
      };
    }
  });

  // entries/example-map.json
  var require_example_map = __commonJS({
    "entries/example-map.json"(exports, module) {
      module.exports = { formatVersion: 3, id: "root", title: "You shouldn't feel bad that you're going to die.", ideas: { "1": { id: 1, title: "You shouldn't feel bad that you're going to die.", attr: {}, ideas: { "1": { id: 2, title: "group", attr: { group: "supporting", contentLocked: true }, ideas: { "1": { id: 3, title: "Death is inevitable.", attr: {} }, "2": { id: 4, title: "You shouldn't feel bad about inevitable things.", attr: { styleNames: ["attr_implicit_claim"] } } } } } } } };
    }
  });

  // entries/demo-entry.js
  var isGroupNode = (n) => n.attr && (n.attr.group === "supporting" || n.attr.group === "opposing");
  var isStickyNode = (n) => n.attr && Array.isArray(n.attr.styleNames) && n.attr.styleNames.indexOf("sticky_note") >= 0;
  var sortedKids = (n) => n.ideas ? Object.keys(n.ideas).sort((a, b) => parseFloat(a) - parseFloat(b)).map((k) => n.ideas[k]) : [];
  var premisesOf = function(n) {
    const out = [];
    sortedKids(n).forEach(function(k) {
      if (isGroupNode(k)) {
        sortedKids(k).forEach(function(p) {
          if (!isStickyNode(p)) out.push(p);
        });
      } else if (!isStickyNode(k)) {
        out.push(k);
      }
    });
    return out;
  };
  var argLabelGenerator = function(idea) {
    const labels = {};
    let level = sortedKids(idea).filter((n) => !isGroupNode(n) && !isStickyNode(n)), depth = 1;
    while (level.length) {
      let idx = 1;
      const next = [];
      level.forEach(function(n) {
        labels[n.id] = depth + "." + idx;
        idx += 1;
        premisesOf(n).forEach((p) => next.push(p));
      });
      level = next;
      depth += 1;
    }
    return labels;
  };
  var MAPJS = require_npm_main();
  var jQuery2 = require_jquery();
  var themeRegistry = require_theme_argmap();
  var testMap = require_example_map();
  var content = MAPJS.content;
  var resolveThemeJson = function(mapJson) {
    return mapJson && mapJson.theme || mapJson && mapJson.attr && themeRegistry[mapJson.attr.theme] || themeRegistry.default;
  };
  var augmentThemeJson = function(json) {
    const t = JSON.parse(JSON.stringify(json)), hasNode = (name) => (t.node || []).some((n) => n.name === name);
    t.node = t.node || [];
    if (!hasNode("sticky_note")) {
      t.node.push({
        "name": "sticky_note",
        "cornerRadius": 2,
        "backgroundColor": "#ffff99",
        "border": { "type": "surround", "line": { "color": "transparent", "width": 1, "style": "solid" } },
        "shadow": [{ "color": "#070707", "opacity": 0.4, "offset": { "width": 2, "height": 3 }, "radius": 3 }],
        "text": {
          "margin": 8,
          "alignment": "start",
          "maxWidth": 200,
          "color": "#4F4F4F",
          "lightColor": "#EEEEEE",
          "darkColor": "#000000",
          "font": { "lineSpacing": 6, "size": 13, "weight": "normal" }
        },
        "connections": {
          "style": "note-link",
          "default": { "h": "center-separated", "v": "base" },
          "from": { "horizontal": { "h": "center-separated", "v": "base" } },
          "to": { "h": "center", "v": "top" }
        }
      });
    }
    if (!hasNode("activated.sticky_note")) {
      t.node.push({
        "name": "activated.sticky_note",
        "border": { "type": "surround", "line": { "color": "#22AAE0", "width": 3, "style": "dashed" } }
      });
    }
    t.connector = t.connector || {};
    if (!t.connector["note-link"]) {
      t.connector["note-link"] = { "type": "vertical-quadratic-s-curve", "line": { "color": "#707070", "width": 1.5, "style": "dotted" } };
    }
    return t;
  };
  var init = function() {
    "use strict";
    let domMapController = false, theme = new MAPJS.Theme(themeRegistry.default);
    const container = jQuery2("#container"), touchEnabled = false, mapModel = new MAPJS.MapModel([]), refreshThemeCSS = function(themeJson) {
      const themeCSS = themeJson && new MAPJS.ThemeProcessor().process(themeJson).css;
      if (!themeCSS) {
        return false;
      }
      let styleElement = jQuery2("#themeCSS");
      if (!styleElement.length) {
        styleElement = jQuery2('<style id="themeCSS" type="text/css"></style>').appendTo("head");
      }
      styleElement.text(themeCSS);
      return true;
    }, getTheme = () => theme, deselectAll = function() {
      jQuery2(".mapjs-node").removeClass("activated selected");
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }, loadIdea = function(mapJson) {
      const themeJson = augmentThemeJson(resolveThemeJson(mapJson));
      theme = new MAPJS.Theme(themeJson);
      refreshThemeCSS(themeJson);
      mapModel.setIdea(content(mapJson));
      window.setTimeout(deselectAll, 50);
    };
    jQuery2.fn.attachmentEditorWidget = function(mapModel2) {
      return this.each(function() {
        mapModel2.addEventListener("attachmentOpened", function(nodeId, attachment) {
          mapModel2.setAttachment(
            "attachmentEditorWidget",
            nodeId,
            {
              contentType: "text/html",
              content: window.prompt("attachment", attachment && attachment.content)
            }
          );
        });
      });
    };
    window.onerror = window.alert;
    window.jQuery = jQuery2;
    container.domMapWidget(console, mapModel, touchEnabled);
    domMapController = new MAPJS.DomMapController(
      mapModel,
      container.find("[data-mapjs-role=stage]"),
      touchEnabled,
      void 0,
      // resourceTranslator
      getTheme
    );
    jQuery2("body").attachmentEditorWidget(mapModel);
    const params = new URLSearchParams(window.location.search);
    if (params.get("labels") !== "0") {
      mapModel.setLabelGenerator(argLabelGenerator, "argument-mapping");
    }
    const src = params.get("src");
    if (src) {
      fetch(src).then((r) => {
        if (!r.ok) {
          throw new Error("HTTP " + r.status);
        }
        return r.json();
      }).then(loadIdea).catch((e) => window.alert("could not load " + src + ": " + e.message));
    } else {
      loadIdea(testMap);
    }
    jQuery2("#linkEditWidget").linkEditWidget(mapModel);
    window.mapModel = mapModel;
    jQuery2(".arrow").click(function() {
      jQuery2(this).toggleClass("active");
    });
    container.on("drop", function(e) {
      const dataTransfer = e.originalEvent.dataTransfer;
      e.stopPropagation();
      e.preventDefault();
      if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
        const fileInfo = dataTransfer.files[0];
        if (/\.mup$/.test(fileInfo.name)) {
          const oFReader = new window.FileReader();
          oFReader.onload = function(oFREvent) {
            loadIdea(JSON.parse(oFREvent.target.result));
          };
          oFReader.readAsText(fileInfo, "UTF-8");
        }
      }
    });
  };
  document.addEventListener("DOMContentLoaded", init);
})();
/*! Bundled license information:

jquery/dist/jquery.js:
  (*!
   * jQuery JavaScript Library v3.7.1
   * https://jquery.com/
   *
   * Copyright OpenJS Foundation and other contributors
   * Released under the MIT license
   * https://jquery.org/license
   *
   * Date: 2023-08-28T13:37Z
   *)

polybooljs/index.js:
  (*
   * @copyright 2016 Sean Connelly (@voidqk), http://syntheti.cc
   * @license MIT
   * @preserve Project Home: https://github.com/voidqk/polybooljs
   *)

jquery-hammerjs/jquery.hammer-full.js:
  (*! jQuery plugin for Hammer.JS - v1.1.3 - 2014-05-20
   * http://eightmedia.github.com/hammer.js
   *
   * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
   * Licensed under the MIT license *)
*/
