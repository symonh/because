/*
 * Authentic MindMup argument-mapping theme, extracted verbatim from a .mup
 * file saved by the MindMup product (files embed their resolved theme JSON).
 * argMappingHighImpact ("High-impact downward") = the same theme plus default
 * connector labels ("Because" / "But") and down arrowheads;
 * argMappingHighImpactUpward flips the reading: up arrowheads into the
 * parent claim, labelled "Therefore" / "Therefore, it is false that".
 *
 * One deliberate departure from the verbatim extraction: opposing-group
 * carries "squareCorners" (a local key the connector.js LOCAL PATCH reads),
 * so the objection bracket has a right-angle top instead of the rounded
 * one reasons get — color is not the only cue distinguishing an objection.
 * A map's own EMBEDDED theme JSON (mapJson.theme, see resolveThemeJson)
 * still wins over this named theme, so historical files with a fully
 * resolved theme keep rendering exactly as MindMup drew them.
 */
export const argMappingSimple = {
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
   "squareCorners": true,
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

export const argMappingHighImpact = (() => {
	const t = JSON.parse(JSON.stringify(argMappingSimple));
	t.name = 'MindMup Top Down Argument Mapping (high impact)';
	// every reason/objection is auto-labelled; slightly thicker lines (the
	// bracket is drawn as part of the connector path, so it thickens too);
	// arrowheads point down into the reason/objection group
	t.connector['supporting-group'].label.defaultText = 'Because';
	t.connector['opposing-group'].label.defaultText = 'But';
	t.connector['supporting-group'].line.width = 4;
	t.connector['opposing-group'].line.width = 4;
	t.connector['supporting-group'].arrow = 'to';
	t.connector['opposing-group'].arrow = 'to';
	// halfway along the curve, with the connector running through the middle
	// of the text (which masks the line behind it). MindMup's own placement
	// is a fixed offset above the bracket (aboveEnd), which on these heavier
	// lines put the word on top of the arrowhead; the midpoint clears both
	// ends. argMappingSimple keeps the authentic placement.
	t.connector['supporting-group'].label.position = {midSpan: true, ratio: 0.5, centerOnLine: true};
	t.connector['opposing-group'].label.position = {midSpan: true, ratio: 0.5, centerOnLine: true};
	t.connectorEditingContext.defaults.width = 4;
	return t;
})();

export const argMappingHighImpactUpward = (() => {
	const t = JSON.parse(JSON.stringify(argMappingSimple));
	t.name = 'MindMup Top Down Argument Mapping (high impact upward)';
	// same weight as the downward high-impact theme, but the arrowheads point
	// up into the claim being supported/attacked and the labels read
	// premises-first ("Therefore" / "Therefore, it is false that"). Same
	// midpoint placement as the downward theme: halfway along the curve,
	// clear of the head at either end, with the line running through the
	// middle of the text
	['supporting-group', 'opposing-group'].forEach(k => {
		t.connector[k].line.width = 4;
		t.connector[k].arrow = 'from';
		t.connector[k].label.position = {midSpan: true, ratio: 0.5, centerOnLine: true};
	});
	t.connector['supporting-group'].label.defaultText = 'Therefore';
	t.connector['opposing-group'].label.defaultText = 'Therefore, it is false that';
	t.connectorEditingContext.defaults.width = 4;
	return t;
})();

const registry = {
	argMappingSimple: argMappingSimple,
	argMappingHighImpact: argMappingHighImpact,
	argMappingHighImpactUpward: argMappingHighImpactUpward
};

// .mup files either embed their resolved theme (top-level "theme" key) or
// name one in attr.theme; fall back to the authentic argument-mapping theme.
export function resolveThemeJson(mapJson) {
	return (mapJson && mapJson.theme) ||
		(mapJson && mapJson.attr && registry[mapJson.attr.theme]) ||
		argMappingSimple;
}

// The argument-mapping themes don't cover sticky notes or their dotted
// connectors (MindMup's newer renderer styles those outside the theme), so
// fill the gaps on a copy; never mutate the map's own theme object.
export function augmentThemeJson(json) {
	const t = JSON.parse(JSON.stringify(json)),
		hasNode = name => (t.node || []).some(n => n.name === name);
	t.node = t.node || [];
	if (!hasNode('sticky_note')) {
		t.node.push({
			name: 'sticky_note',
			cornerRadius: 2,
			backgroundColor: '#ffff99',
			border: {type: 'surround', line: {color: 'transparent', width: 1, style: 'solid'}},
			shadow: [{color: '#070707', opacity: 0.4, offset: {width: 2, height: 3}, radius: 3}],
			text: {
				margin: 8, alignment: 'start', maxWidth: 200,
				color: '#4F4F4F', lightColor: '#EEEEEE', darkColor: '#000000',
				font: {lineSpacing: 6, size: 13, weight: 'normal'}
			},
			connections: {
				style: 'note-link',
				'default': {h: 'center-separated', v: 'base'},
				from: {horizontal: {h: 'center-separated', v: 'base'}},
				to: {h: 'center', v: 'top'}
			}
		});
	}
	if (!hasNode('activated.sticky_note')) {
		t.node.push({
			name: 'activated.sticky_note',
			border: {type: 'surround', line: {color: '#22AAE0', width: 3, style: 'dashed'}}
		});
	}
	t.connector = t.connector || {};
	if (!t.connector['note-link']) {
		t.connector['note-link'] = {type: 'vertical-quadratic-s-curve', line: {color: '#707070', width: 1.5, style: 'dotted'}};
	}
	return t;
}

/*
 * Dark-mode variant of any argument-mapping theme. This is a VIEW
 * transform: it deep-clones, never touches the map's own embedded theme,
 * and is applied at render time only, so saved .mup files are identical
 * in either mode.
 *
 * Key-aware on purpose: node paper (backgroundColor) goes dark, but the
 * badge label's white text/ring must stay white, so bare #ffffff values
 * outside backgroundColor are left alone.
 */
const DARK_COLORS = {
	'#4f4f4f': '#e2e5e7', // claim text
	'#707070': '#9aa0a6', // borders, implicit dashes, note links
	'#339966': '#3fb377', // supporting green, brightened for dark paper
	'#ff0000': '#ff5d5d'  // opposing red, softened
};

export function darkenThemeJson(json) {
	const isWhite = v => v === '#ffffff' || v === '#fff' || v === 'white',
		t = JSON.parse(JSON.stringify(json)),
		// connector labels spec white boxes so they mask the line on white
		// paper; in dark mode they must mask it in the canvas colour instead
		walk = function (obj, inLabel) {
			Object.keys(obj).forEach(function (key) {
				const value = obj[key],
					nowLabel = inLabel || key === 'label';
				if (typeof value === 'string') {
					const mapped = DARK_COLORS[value.toLowerCase()];
					if (mapped) { obj[key] = mapped; }
					if ((key === 'backgroundColor' || key === 'borderColor') && isWhite(value.toLowerCase())) {
						obj[key] = nowLabel ? '#1b1d20' : '#26292d';
					}
				} else if (value && typeof value === 'object') {
					walk(value, nowLabel);
				}
			});
		};
	walk(t, false);
	(t.node || []).forEach(function (n) {
		if (n.name === 'sticky_note') {
			// stickies stay paper, just less fluorescent, with dark ink
			n.backgroundColor = '#e3d874';
			n.text = n.text || {};
			n.text.color = '#2c2a1a';
		}
	});
	return t;
}

/*
 * Dark-mode transform for AUTHOR-set node colours (attr.style.background /
 * .backgroundColor / .text.color), which bypass the theme JSON entirely.
 * Same contract as darkenThemeJson: render-time only, map data untouched.
 * Lightness is roughly inverted (light paper goes dark, dark ink goes
 * light) with the hue kept, so a lightcoral node reads as a muted dark
 * red rather than staying a white-on-dark sore thumb. Non-hex values are
 * returned unchanged.
 */
export function darkenUserColor(color) {
	const m = typeof color === 'string' &&
		/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
	if (!m) { return color; }
	let hex = m[1];
	if (hex.length === 3) { hex = hex.replace(/./g, c => c + c); }
	const r = parseInt(hex.slice(0, 2), 16) / 255,
		g = parseInt(hex.slice(2, 4), 16) / 255,
		b = parseInt(hex.slice(4, 6), 16) / 255,
		max = Math.max(r, g, b),
		min = Math.min(r, g, b),
		l = (max + min) / 2,
		d = max - min;
	let h = 0, s = 0;
	if (d > 0) {
		s = d / (1 - Math.abs(2 * l - 1));
		if (max === r) { h = ((g - b) / d) % 6; } else if (max === g) { h = (b - r) / d + 2; } else { h = (r - g) / d + 4; }
		h = (h * 60 + 360) % 360;
	}
	const newL = 0.84 - 0.68 * l,
		newS = Math.min(s * 0.6, 0.5),
		c = (1 - Math.abs(2 * newL - 1)) * newS,
		x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
		base = newL - c / 2,
		[r2, g2, b2] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
			h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x],
		toHex = v => Math.round((v + base) * 255).toString(16).padStart(2, '0');
	return '#' + toHex(r2) + toHex(g2) + toHex(b2);
}
