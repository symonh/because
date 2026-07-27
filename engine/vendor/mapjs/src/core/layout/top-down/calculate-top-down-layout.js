/*global module, require*/
const _ = require('underscore'),
	isEmptyGroup = require('../../content/is-empty-group'),
	alignGroup = require('./align-group'),
	combineVerticalSubtrees = require('./combine-vertical-subtrees');
module.exports  = function calculateTopDownLayout(aggregate, dimensionProvider, margin) {
	'use strict';
	const isGroup = function (node) {
			return node.attr && node.attr.group;
		},
		toNode = function (idea, level, parentId) {
			const dimensions = dimensionProvider(idea, level),
				node = _.extend({level: level, verticalOffset: 0, title: isGroup(idea) ? '' : idea.title}, dimensions, _.pick(idea, ['id', 'attr']));
			if (parentId) {
				node.parentId = parentId;
			}
			return node;
		},
		/* LOCAL PATCH: a group nested inside a group is a reason or objection
		   aimed at the INFERENCE rather than the claim, and alignGroup drops
		   its bracket immediately under its parent's, leaving a label on that
		   connector nowhere to sit. A labelled one, and everything under it,
		   is pushed down by the theme's `nestedGroupLabel` spacing to make
		   room. Only that subtree moves, so the claims beside it stay on
		   their own level; an unlabelled nested group is untouched, as is
		   any theme that does not ask for the spacing. */
		hasConnectorLabel = function (idea) {
			return !!(idea.attr && idea.attr.parentConnector && idea.attr.parentConnector.label);
		},
		//TODO: adds some complexity to the standard traverse function - includes parent id, omits post order, skips groups
		traverse = function (idea, predicate, level, parentId, parentIsGroup) {
			const childResults = {},
				shouldIncludeSubIdeas = !(_.isEmpty(idea.ideas) || (idea.attr && idea.attr.collapsed));

			level = level || 1;
			if (shouldIncludeSubIdeas) {
				Object.keys(idea.ideas).forEach(function (subNodeRank) {
					const newLevel = isGroup(idea) ? level : level + 1,
						result = traverse(idea.ideas[subNodeRank], predicate, newLevel, idea.id, isGroup(idea));
					if (result) {
						childResults[subNodeRank] = result;
					}
				});
			}
			return predicate(idea, childResults, level, parentId, parentIsGroup);
		},
		traversalLayout = function (idea, childLayouts, level, parentId, parentIsGroup) {
			const node = toNode(idea, level, parentId);
			let result;

			if (isGroup(node) && !_.isEmpty(idea.ideas)) {
				result = combineVerticalSubtrees(node, childLayouts, margin.h, true);
				alignGroup(result, idea, margin.h);
				if (parentIsGroup && margin.nestedGroupLabel && hasConnectorLabel(idea)) {
					_.each(result.nodes, function (subNode) {
						subNode.verticalOffset = (subNode.verticalOffset || 0) + margin.nestedGroupLabel;
					});
				}
			} else {
				result = combineVerticalSubtrees(node, childLayouts, margin.h);
			}
			return result;
		},
		traversalLayoutWithoutEmptyGroups = function (idea, childLayouts, level, parentId, parentIsGroup) {
			return (idea === aggregate || !isEmptyGroup(idea)) && traversalLayout(idea, childLayouts, level, parentId, parentIsGroup);
		},
		setLevelHeights = function (nodes, levelHeights) {
			_.each(nodes, function (node) {
				node.y = levelHeights[node.level - 1] + node.verticalOffset;
				delete node.verticalOffset;
			});
		},
		getLevelHeights = function (nodes) {
			const maxHeights = [],
				heights = [];
			let level,
				totalHeight = 0;

			_.each(nodes, function (node) {
				maxHeights[node.level - 1] = Math.max(maxHeights[node.level - 1] || 0, node.height + node.verticalOffset);
			});
			totalHeight = maxHeights.reduce(function (memo, item) {
				return memo + item;
			}, 0) + (margin.v *  (maxHeights.length - 1));

			heights[0] = Math.round(-0.5 * totalHeight);

			for (level = 1; level < maxHeights.length; level++) {
				heights [level] = heights [level - 1] + margin.v + maxHeights[level - 1];
			}
			return heights;
		},
		tree = traverse(aggregate, traversalLayoutWithoutEmptyGroups);

	setLevelHeights(tree.nodes, getLevelHeights(tree.nodes));

	return tree.nodes;
};

