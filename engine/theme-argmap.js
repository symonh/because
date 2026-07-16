var MAPJS = MAPJS || {};
MAPJS.Themes = MAPJS.Themes || {};
MAPJS.Themes.argumentMapping = {
	'name': 'MindMup Top Down Argument Mapping',
	'layout': {
		'orientation': 'top-down',
		'spacing': {
			'h': 20,
			'v': 100
		}
	},
	'node': [
		{
			'name': 'default',
			'cornerRadius': 8.0,
			'background': {
				'color': '#FFFFFF',
				'opacity': 1.0
			},
			'border': {
				'type': 'surround',
				'line': {
					'color': '#9aa0a4',
					'width': 1.4,
					'style': 'solid'
				}
			},
			'shadow': [
			{
				'color': '#000000',
				'opacity': 0.16,
				'offset': {
					'width': 1,
					'height': 2
				},
				'radius': 2
			}
			],
			'text': {
				'margin': 12.0,
				'alignment': 'left',
				'color': '#3b4045',
				'lightColor': '#EEEEEE',
				'darkColor': '#000000',
				'font': {
					'lineSpacing': 3,
					'size': 15,
					'weight': 'normal'
				}
			},
			'connections': {
				'default': {
					'h': 'center-separated',
					'v': 'base'
				},
				'from': {
					'horizontal': {
						'h': 'center-separated',
						'v': 'base'
					}
				},
				'to': {
					'h': 'center',
					'v': 'top'
				}
			},
			'decorations': {
				'height': 32,
				'edge': 'right',
				'overlap': true,
				'position': 'center'
			}
		},
		{
			'name': 'level_1',
			'cornerRadius': 10.0,
			'text': {
				'margin': 10.0,
				'alignment': 'center',
				'color': '#4F4F4F',
				'lightColor': '#EEEEEE',
				'darkColor': '#000000',
				'font': {
					'lineSpacing': 2,
					'size': 15,
					'weight': 'light'
				}
			}
		},
		{
			'name': 'activated',
			'border': {
				'type': 'surround',
				'line': {
					'color': '#22AAE0',
					'width': 3.0,
					'style': 'dotted'
				}
			}
		},
		{
			'name': 'attr_implicit_claim',
			'border': {
				'type': 'surround',
				'line': {
					'color': '#29abe2',
					'width': 2.5,
					'style': 'dotted'
				}
			}
		},
		{
			'name': 'selected',
			'shadow': [
			{
				'color': '#000000',
				'opacity': 0.9,
				'offset': {
					'width': 2,
					'height': 2
				},
				'radius': 2
			}
			]
		},
		{
			'name': 'collapsed',
			'shadow': [
			{
				'color': '#888888',
				'offset': {
					'width': 0,
					'height': 1
				},
				'radius': 0
			},
			{
				'color': '#FFFFFF',
				'offset': {
					'width': 0,
					'height': 3
				},
				'radius': 0
			},
			{
				'color': '#888888',
				'offset': {
					'width': 0,
					'height': 4
				},
				'radius': 0
			},
			{
				'color': '#FFFFFF',
				'offset': {
					'width': 0,
					'height': 6
				},
				'radius': 0
			},
			{
				'color': '#888888',
				'offset': {
					'width': 0,
					'height': 7
				},
				'radius': 0
			}
			]
		},
		{
			'name': 'collapsed.selected',
			'shadow': [
			{
				'color': '#FFFFFF',
				'offset': {
					'width': 0,
					'height': 1
				},
				'radius': 0
			},
			{
				'color': '#888888',
				'offset': {
					'width': 0,
					'height': 3
				},
				'radius': 0
			},
			{
				'color': '#FFFFFF',
				'offset': {
					'width': 0,
					'height': 6
				},
				'radius': 0
			},
			{
				'color': '#555555',
				'offset': {
					'width': 0,
					'height': 7
				},
				'radius': 0
			},
			{
				'color': '#FFFFFF',
				'offset': {
					'width': 0,
					'height': 10
				},
				'radius': 0
			},
			{
				'color': '#333333',
				'offset': {
					'width': 0,
					'height': 11
				},
				'radius': 0
			}
			]
		},
		{
			'name': 'attr_group',
			'cornerRadius': 10.0,
			'background': {
				'color': 'transparent',
				'opacity': 0.0
			},
			'border': {
				'type': 'overline'
			},
			'shadow': [
			{
				'color': 'transparent'
			}
			],
			'text': {
				'margin': 0.0,
				'alignment': 'center',
				'color': '#4F4F4F',
				'lightColor': '#EEEEEE',
				'darkColor': '#000000',
				'font': {
					'lineSpacing': 2.5,
					'size': 9,
					'weight': 'bold'
				}
			},
			'connections': {
				'style': 'supporting-group',
				'childstyle': 'no-connector',
				'default': {
					'h': 'center',
					'v': 'base'
				},
				'from': {
					'below': {
						'h': 'center',
						'v': 'base'
					}
				},
				'to': {
					'h': 'center',
					'v': 'top'
				}
			}
		},
		{
			'name': 'attr_group_supporting',
			'connections': {
				'style': 'supporting-group',
				'childstyle': 'no-connector',
				'default': {
					'h': 'center',
					'v': 'base'
				},
				'from': {
					'below': {
						'h': 'center',
						'v': 'base'
					}
				},
				'to': {
					'h': 'center',
					'v': 'top'
				}
			}
		},
		{
			'name': 'attr_group_supporting.activated',
			'background': {
				'color': '#3a9b52',
				'opacity': 0.2
			},
			'border': {
				'type': 'surround',
				'line': {
					'color': '#3a9b52',
					'width': 3.0,
					'style': 'dotted'
				}
			}
		},
		{
			'name': 'attr_group_opposing',
			'connections': {
				'style': 'opposing-group',
				'childstyle': 'no-connector',
				'default': {
					'h': 'center',
					'v': 'base'
				},
				'from': {
					'below': {
						'h': 'center',
						'v': 'base'
					}
				},
				'to': {
					'h': 'center',
					'v': 'top'
				}
			}
		},
		{
			'name': 'attr_group_opposing.activated',
			'background': {
				'color': '#cc4636',
				'opacity': 0.2
			},
			'border': {
				'type': 'surround',
				'line': {
					'color': '#cc4636',
					'width': 3.0,
					'style': 'dotted'
				}
			}
		}
	],
	'connector': {
		'default': {
			'type': 'vertical-quadratic-s-curve',
			'line': {
				'color': '#707070',
				'width': 1.0
			}
		},
		'no-connector': {
			'type': 'no-connector',
			'line': {
				'color': '#707070',
				'width': 0.0
			}
		},
		'supporting-group': {
			'type': 'vertical-quadratic-s-curve',
			'line': {
				'color': '#3a9b52',
				'width': 3.0
			}
		},
		'opposing-group': {
			'type': 'vertical-quadratic-s-curve',
			'line': {
				'color': '#cc4636',
				'width': 3.0
			}
		},
		'no-connector.supporting-group': {
			'type': 'no-connector',
			'line': {
				'color': '#3a9b52',
				'width': 4.0
			}
		},
		'no-connector.opposing-group': {
			'type': 'no-connector',
			'line': {
				'color': '#cc4636',
				'width': 4.0
			}
		}
	}
};


module.exports = {default: MAPJS.Themes.argumentMapping};
