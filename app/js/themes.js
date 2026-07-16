/*
 * Authentic MindMup argument-mapping theme, extracted verbatim from a .mup
 * file saved by the MindMup product (files embed their resolved theme JSON).
 * argMappingHighImpact = the same theme plus default connector labels
 * ("because..." / "but...").
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
	t.connector['supporting-group'].label.defaultText = 'because...';
	t.connector['opposing-group'].label.defaultText = 'but...';
	return t;
})();

const registry = {
	argMappingSimple: argMappingSimple,
	argMappingHighImpact: argMappingHighImpact
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
	const t = JSON.parse(JSON.stringify(json)),
		walk = function (obj) {
			Object.keys(obj).forEach(function (key) {
				const value = obj[key];
				if (typeof value === 'string') {
					const mapped = DARK_COLORS[value.toLowerCase()];
					if (mapped) { obj[key] = mapped; }
					if (key === 'backgroundColor' && value.toLowerCase() === '#ffffff') {
						obj[key] = '#26292d';
					}
				} else if (value && typeof value === 'object') {
					walk(value);
				}
			});
		};
	walk(t);
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
