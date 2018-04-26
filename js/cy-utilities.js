import $ from "jquery";
import cytoscape from 'cytoscape';

import edgehandles from 'cytoscape-edgehandles';
import panzoom from 'cytoscape-panzoom';
import contextMenus from 'cytoscape-context-menus';
import coseBilkent from 'cytoscape-cose-bilkent';
import synchedLayout from 'cytoscape-synched';

import bindHover from './hover';
import properties from './properties.js';
import views from './backbone-views.js';
cytoscape.use(edgehandles);
cytoscape.use(panzoom);
cytoscape.use(contextMenus, $);
cytoscape.use(coseBilkent);
cytoscape.use(synchedLayout);

var defaultInstanceProperties = properties.defaultInstanceProperties;
var cyL; var cyR; var cy_headless;
var elesJsonL = {
	nodes: [
		{data: {id: 'a', 'background-color': 'green'}},
		{data: {id: 'b', 'background-color': 'green'}},
		{data: {id: 'c', 'background-color': 'red'}},
		{data: {id: 'd', 'background-color': 'blue'}},
		{data: {id: 'e', 'background-color': 'red'}},
		{data: {id: 'f', 'background-color': 'hotpink'}},
		{data: {id: 'g', 'background-color': 'darkgreen'}},
		{data: {id: 'h', 'background-color': 'hotpink'}},
	],

	edges: [
		{data: {id: 'ae', source: 'a', target: 'e'}},
		{data: {id: 'ab', source: 'a', target: 'b'}},
		{data: {id: 'be', source: 'b', target: 'e'}},
		{data: {id: 'bc', source: 'b', target: 'c'}},
		{data: {id: 'bf', source: 'b', target: 'f'}},
		{data: {id: 'ce', source: 'c', target: 'e'}},
		{data: {id: 'cd', source: 'c', target: 'd'}},
		{data: {id: 'de', source: 'd', target: 'e'}},
		{data: {id: 'ef', source: 'e', target: 'f'}},
	]
};

var elesJsonR = {
	nodes: [
		{data: {id: 'a', 'background-color': 'red'}},
		{data: {id: 'b', 'background-color': 'orange'}},
		{data: {id: 'c', 'background-color': 'cyan'}},
		{data: {id: 'd', 'background-color': 'red'}},
		{data: {id: 'e', 'background-color': 'red'}},
		{data: {id: 'f', 'background-color': 'red'}},
		{data: {id: 'i', 'background-color': 'orangered'}},
		{data: {id: 'k', 'background-color': 'lime'}},
	],

	edges: [
		{data: {id: 'ac', source: 'a', target: 'c'}},
		{data: {id: 'ak', source: 'a', target: 'k'}},
		{data: {id: 'bc', source: 'b', target: 'c'}},
		{data: {id: 'bf', source: 'b', target: 'f'}},
		{data: {id: 'ce', source: 'c', target: 'e'}},
		{data: {id: 'cd', source: 'c', target: 'd'}},
		{data: {id: 'de', source: 'd', target: 'e'}},
		{data: {id: 'ef', source: 'e', target: 'f'}},
	]
};


var getLeftColor = function(ele) {
	if (defaultInstanceProperties.preserveOriginalColors && ele.data('background-color')) {
		return ele.data('background-color');
	} else {
		return defaultInstanceProperties.leftInstanceNodeBackgroundColor;
	}
}

var getRightColor = function(ele) {
	if (defaultInstanceProperties.preserveOriginalColors && ele.data('background-color')) {
		return ele.data('background-color');
	} else {
		return defaultInstanceProperties.rightInstanceNodeBackgroundColor;
	}
}

cyL = cytoscape({
	container: $('#cyL')[0],
   style: cytoscape.stylesheet()
	.selector('node')
	.css({
		'text-valign': 'center',
	'background-color': getLeftColor,
	'shape': 'rectangle',
	'content': 'data(id)'
	})
.selector('edge')
	.css({
		'width': 4,
	'line-color': '#F2B1BA',
	'target-arrow-color': '#F2B1BA',
	'target-arrow-shape': 'triangle',
	'opacity': 0.8
	})
.selector(':selected')
	.css({
		'border-color': '#FFFF00',
	'line-color': '#FFFF00',
	'target-arrow-color': '#FFFF00',
	'source-arrow-color': '#FFFF00',
	'border-width': 4,
	'opacity': 1
	}),

	elements: elesJsonL,
	layout: {
		name: 'circle',
		directed: false,
		padding: 10
	},
	boxSelectionEnabled: true,
	motionBlur: true,
	wheelSensitivity: 0.1,
});
cy_headless = cytoscape({
	headless: true,
			styleEnabled: true,
});

cyR = cytoscape({
	container: document.getElementById('cyR'),
	style: cytoscape.stylesheet()
	.selector('node')
	.css({
		'text-valign': 'center',
	'background-color': getRightColor,
	'shape': 'rectangle',
	'content': 'data(id)'
	})
.selector('edge')
	.css({
		'width': 4,
	'line-color': '#B1C1F2',
	'target-arrow-color': '#B1C1F2',
	'target-arrow-shape': 'triangle',
	'opacity': 0.8
	})
.selector(':selected')
	.css({
		'border-color': '#FFFF00',
	'line-color': '#FFFF00',
	'target-arrow-color': '#FFFF00',
	'source-arrow-color': '#FFFF00',
	'border-width': 4,
	'opacity': 1
	}),

	elements: elesJsonR,

	layout: {
		name: 'circle',
		directed: false,
		padding: 10
	},

	wheelSensitivity: 0.1,
});
bindHover(cyL, cyR);
bindHover(cyR, cyL);

cyL.panzoom();
cyR.panzoom();
var addNode = new views.addNodeView({
    el: '#add-node-table'
});

var addEdge = new views.addEdgeView({
    el: '#add-edge-table'
});

cyL.contextMenus({
	menuItems: [
{
	id: 'delete-selected',
	content: 'Delete selected',
	image: {src : "images/toolbar/delete-selected.svg", width : 12, height : 12, x : 6, y : 6},
	coreAsWell: true,
	onClickFunction: function (event) {
		$("#delete-selected-icon").trigger("click");
	}
},
{
	id: 'edit-style',
	content: 'Edit Style',
	selector: 'node, edge',
	onClickFunction: function (event) {
		if (event.target.isEdge()) {
			addEdge.render(event.target);
			addEdge.show();
		} else if (event.target.isNode()) {
			addNode.render(event.target);
			addNode.show();
		}
	}
}
]
});

cyR.contextMenus({
	menuItems: [
{
	id: 'delete-selected',
	content: 'Delete selected',
	image: {src : "images/toolbar/delete-selected.svg", width : 12, height : 12, x : 6, y : 6},
	coreAsWell: true,
	onClickFunction: function (event) {
		$("#delete-selected-icon").trigger("click");
	}
},
{
	id: 'edit-style',
	content: 'Edit Style',
	selector: 'node, edge',
	onClickFunction: function (event) {
		if (event.target.isEdge()) {
			addEdge.render(event.target);
			addEdge.show();
		} else if (event.target.isNode()) {
			addNode.render(event.target);
			addNode.show();
		}
	}
}
]
});


var eh = cyL.edgehandles();
eh.enableDrawMode();
cyL.autoungrabify(false);

var eh2 = cyR.edgehandles();
eh2.enableDrawMode();
cyR.autoungrabify(false);


function randomId() {
	return Math.random().toString(36).substr(2, 5);
};

var addNodeT = function(event, cy, otherCy) {
	let nodeShape = $("#add-node-dropdown").attr("shape");
	let id = randomId();

	if ($("#sync-icon").hasClass( "toggle-mode-sustainable" )) {
		cy.add({group: "nodes", position : event.position, css: {shape: nodeShape, "background-color": "#BDBDBD"}, data: {id: id}});
		otherCy.add({group: "nodes", position : event.position, css: {shape: nodeShape, "background-color": "#BDBDBD"}, data: {id: id}});
	} else {
		cy.add({group: "nodes", position: event.position, css: {shape: nodeShape}, data: {id: id}});
	}

};

var addEdgeT = function(sourceNode, targetNode, addedEles, cy, otherCy) {
	if ($("#sync-icon").hasClass( "toggle-mode-sustainable" )) {
		let edgeObj = {group: "edges", css: {"line-color": "#BDBDBD"}, data: {source: sourceNode.id(), target: targetNode.id(), id: addedEles.id()}};

		if (otherCy.$('#' + edgeObj.data.source).length && otherCy.$('#' + edgeObj.data.target).length) {
			otherCy.add(edgeObj);
			cy.$('#' + edgeObj.data.id).css("line-color", "#BDBDBD");
		}
	}
};



var caddNode, raddNode;
cyL.on("tapend", caddNode = function(e) {
	if ($("#add-node-dropdown").hasClass("toggle-mode-sustainable")) {
		addNodeT(e, cyL, cyR);
	} else if ($("#add-node-dropdown").hasClass("selected-mode")) {
		addNodeT(e, cyL, cyR);
		$("#select-mode-icon").trigger("click");
	}
});

cyR.on("tapend", raddNode = function(e) {
	if ($("#add-node-dropdown").hasClass("toggle-mode-sustainable")) {
		addNodeT(e, cyR, cyL);
	} else if ($("#add-node-dropdown").hasClass("selected-mode")) {
		addNodeT(e, cyR, cyL);
		$("#select-mode-icon").trigger("click");
	}
});

cyL.on("ehstop", function() {
	if (!$("#add-edge-dropdown").hasClass("toggle-mode-sustainable")
		&& $("#add-edge-dropdown").hasClass("selected-mode")) {
			$("#select-mode-icon").trigger("click");
		}
});

cyR.on("ehstop", function() {
	if (!$("#add-edge-dropdown").hasClass("toggle-mode-sustainable")
		&& $("#add-edge-dropdown").hasClass("selected-mode")) {
			$("#select-mode-icon").trigger("click");
		}
});

cyL.on("ehcomplete", function(event, sourceNode, targetNode, addedEles) {
	addEdgeT(sourceNode, targetNode, addedEles, cyL, cyR);
});

export {cyL, cyR, cy_headless};
