import $ from "jquery";
import Backbone from 'backbone';

import {cyL, cyR, cy_headless} from './cy-utilities';
import {updateColors} from './file-utilities';
import {instanceNames} from './ui-events';
import  properties from './properties.js';
import {updateHoverStyleValues, shadeColor} from './hover';

var defaultInstanceProperties = properties.defaultInstanceProperties;

var views = {};

var defaultNewNodeProperties = {
	label: "new node",
	width: 40,
	height: 40,
	backgroundColor: "#BDBDBD",
};

views.addNodeView = Backbone.View.extend({
	initialize: function(){
			var temp = _.template($("#add-node-template").html());
			this.template = temp(defaultNewNodeProperties);
			var self = this;
			self.copyProperties();
			var temp = _.template($("#add-node-template").html());
	},
	events: {
		"click button#save-style-changes": "updateStyle",
	},
	show: function(){
		$(this.el).modal("show");
	},
	updateStyle: function() {
		let styleObj = {
			label: $("#new-node-label").val(),
			width: $("#new-node-width").val(), height: $("#new-node-height").val(),
			"background-color": $("#new-node-color").val(), "shape": $("#new-node-shape").val(),
		}
		this.element.css(styleObj);

		$(this.el).modal('hide');
	},

	copyProperties: function () {
		this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
	},
	render: function(element){
			this.element = element;
			let nodeObj = element.css();
			this.nodeProperties = {
				backgroundColor: nodeObj["background-color"],
				width: parseInt(nodeObj.width), height: parseInt(nodeObj.height),
				label: nodeObj.label, shape: nodeObj.shape,
			};
			var self = this;
			var temp = _.template($("#add-node-template").html());
			self.template = temp(this.nodeProperties);
			$(self.el).html(self.template);
			$("#new-node-shape").val(this.nodeProperties.shape);

		return this;
	},
});

views.addEdgeView = Backbone.View.extend({
	initialize: function(){
			var temp = _.template($("#add-edge-template").html());
			this.template = temp(defaultNewNodeProperties);
			var self = this;
			self.copyProperties();
			var temp = _.template($("#add-edge-template").html());
	},
	events: {
		"click button#save-style-changes": "updateStyle",
	},
	show: function(){
		$(this.el).modal("show");
	},
	updateStyle: function() {
		let styleObj = {
			label: $("#new-edge-label").val(),
			width: $("#new-edge-width").val(), height: $("#new-edge-height").val(),
			"line-color": $("#new-edge-color").val(), "shape": $("#new-edge-shape").val(),
		}
		this.element.css(styleObj);

		$(this.el).modal('hide');
	},

	copyProperties: function () {
		this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
	},
	render: function(element){
			this.element = element;
			let nodeObj = element.css();
			this.nodeProperties = {
				backgroundColor: nodeObj["line-color"],
				width: parseInt(nodeObj.width),
				label: nodeObj.label, shape: nodeObj.shape,
			};
			var self = this;
			var temp = _.template($("#add-edge-template").html());
			self.template = temp(this.nodeProperties);
			$(self.el).html(self.template);
			$("#new-edge-shape").val(this.nodeProperties.shape);

		return this;
	},
})

var refreshCurrentInstanceList = function(instanceNames) {
	let currentInstances = "";

	for (let i of instanceNames) {
		currentInstances += '<option value="' + i + '">' + i + '</option>';
	}

	return currentInstances;
}
var currentInstanceProperties = properties.currentInstanceProperties; 

views.instancePropertiesView = Backbone.View.extend({
	initialize: function(){
		var temp = _.template($("#instance-properties-template").html());
		this.template = temp(defaultInstanceProperties);
		var self = this;
		self.copyProperties();
		this.currentInstances = refreshCurrentInstanceList(instanceNames);
		this.currentInstance = $("#current-instance-name").val() || instanceNames[0];
	},
	events: {
		"click button#save-style-changes": "updateStyle",
		"change #current-instance-name": "refresh",
	},
	show: function(){
		$(this.el).modal("show");
	},
	updateStyle: function() {
		let preserveOriginalColors = document.getElementById('preserve-original-colors').checked;
		let commonNodeBackground = $("#common-node-background-color").val();

		defaultInstanceProperties.hoverBackgroundColor = $("#hover-background-color").val();

		let instanceName = $("#current-instance-name").val();
		let leftInstance = document.getElementById("cyL");
		let rightInstance = document.getElementById("cyR");

		currentInstanceProperties[instanceName].instanceBackgroundColor = $("#instance-background-color").val();
		currentInstanceProperties[instanceName].nodeBackgroundColor = $("#node-background-color").val();
		currentInstanceProperties[instanceName].preserveOriginalColors = preserveOriginalColors;
		currentInstanceProperties[instanceName].hoverBackgroundColor = defaultInstanceProperties.hoverBackgroundColor;
		currentInstanceProperties[instanceName].commonNodeBackground = defaultInstanceProperties.commonNodeBackground;

		if (instanceName == $("#file-name-left").html()) {
			leftInstance.style.backgroundColor = $("#instance-background-color").val();
		} else if (instanceName == $("#file-name-right").html()) {
			rightInstance.style.backgroundColor = $("#instance-background-color").val();
		}

		if (preserveOriginalColors != defaultInstanceProperties.preserveOriginalColors
			|| commonNodeBackground != defaultInstanceProperties.commonNodeBackground) {
			let commonEdgeBackground = defaultInstanceProperties.commonEdgeBackground = shadeColor(commonNodeBackground, 0.5);
			let colorMap = {
				nodeBackground: defaultInstanceProperties.leftInstanceNodeBackgroundColor,
				otherNodeBackground: defaultInstanceProperties.rightInstanceNodeBackgroundColor,
				edgeBackground: defaultInstanceProperties.leftInstanceEdgeColor,
				otherEdgeBackground: defaultInstanceProperties.rightInstanceEdgeColor,
				commonNodeBackground: commonNodeBackground, commonEdgeBackground : commonEdgeBackground,
			};
			defaultInstanceProperties.preserveOriginalColors = preserveOriginalColors;
			defaultInstanceProperties.commonNodeBackground = commonNodeBackground;
			updateColors(cyL, cyR, colorMap, preserveOriginalColors);
		}

		updateHoverStyleValues();
		$("#current-instance-name").val(null);
		$(this.el).modal('hide');
	},

	copyProperties: function () {
		this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
	},

	refresh: function() {
		this.currentInstance = $("#current-instance-name").val() || instanceNames[0];
		let instanceName = this.currentInstance;

		if (!currentInstanceProperties[instanceName]) {
			currentInstanceProperties[instanceName] = _.clone(defaultInstanceProperties);
			currentInstanceProperties[instanceName].currentInstances = refreshCurrentInstanceList(instanceNames);

			if (instanceName == $("#file-name-left").html()) {
				currentInstanceProperties[instanceName].instanceBackgroundColor = defaultInstanceProperties.leftInstancebackgroundColor;
				currentInstanceProperties[instanceName].nodeBackgroundColor = defaultInstanceProperties.leftInstanceNodeBackgroundColor;
			} else if (instanceName == $("#file-name-right").html()) {
				currentInstanceProperties[instanceName].instanceBackgroundColor = defaultInstanceProperties.rightInstancebackgroundColor
				currentInstanceProperties[instanceName].nodeBackgroundColor = defaultInstanceProperties.rightInstanceNodeBackgroundColor;
			}
		}

		$('#instance-background-color').val(currentInstanceProperties[instanceName].instanceBackgroundColor);
		$('#node-background-color').val(currentInstanceProperties[instanceName].nodeBackgroundColor);
	},

	render: function(){
		var self = this;
		var temp = _.template($("#instance-properties-template").html());
		this.refresh();
		self.template = temp(currentInstanceProperties[this.currentInstance]);

		$(self.el).html(self.template);

		return this;
	},
})
views.COSEBilkentLayout = Backbone.View.extend({
	defaultLayoutProperties: {
		name: 'cose-bilkent',
	ready: function () {
	},
	// Called on `layoutstop`
	stop: function () {
	},
	// Number of iterations between consecutive screen positions update (0 -> only updated on the end)
	refresh: 0,
	// Whether to fit the network view after when done
	fit: true,
	// Padding on fit
	padding: 10,
	// Whether to enable incremental mode
	incremental: true,
	// Whether to use the JS console to print debug messages
	debug: false,
	// Node repulsion (non overlapping) multiplier
	nodeRepulsion: 4500,
	// Node repulsion (overlapping) multiplier
	nodeOverlap: 10,
	// Ideal edge (non nested) length
	idealEdgeLength: 50,
	// Divisor to compute edge forces
	edgeElasticity: 0.45,
	// Nesting factor (multiplier) to compute ideal edge length for nested edges
	nestingFactor: 0.1,
	// Gravity force (constant)
	gravity: 0.4,
	// Maximum number of iterations to perform
	numIter: 2500,
	// Initial temperature (maximum node displacement)
	initialTemp: 200,
	// Cooling factor (how the temperature is reduced between consecutive iterations
	coolingFactor: 0.95,
	// Lower temperature threshold (below this point the layout will end)
	minTemp: 1,
	// For enabling tiling
	tile: true,
	//whether to make animation while performing the layout
	animate: true,
	excludedNodes: {},
	},
		currentLayoutProperties: null,
		initialize: function () {
			var self = this;
			self.copyProperties();
			var temp = _.template($("#cose-bilkent-settings-template").html());
		},
		copyProperties: function () {
			this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
		},
		render: function () {
			var self = this;
			var temp = _.template($("#cose-bilkent-settings-template").html());
			self.template = temp(this.currentLayoutProperties);
			$(self.el).html(self.template);

			$(self.el).modal('show');

			$("#save-layout4").click( function (evt) {
				self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion4").value);
				self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap4").value);
				self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length4").value);
				self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity4").value);
				self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor4").value);
				self.currentLayoutProperties.gravity = Number(document.getElementById("gravity4").value);
				self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter4").value);
				self.currentLayoutProperties.animate = document.getElementById("animate4").checked;
				self.currentLayoutProperties.refresh = Number(document.getElementById("refresh4").value);
				self.currentLayoutProperties.fit = document.getElementById("fit4").checked;
				self.currentLayoutProperties.padding = Number(document.getElementById("padding4").value);
				self.currentLayoutProperties.debug = document.getElementById("debug4").checked;
				self.currentLayoutProperties.initialTemp = Number(document.getElementById("initialTemp4").value);
				self.currentLayoutProperties.minTemp = Number(document.getElementById("minTemp4").value);
				self.currentLayoutProperties.coolingFactor = Number(document.getElementById("coolingFactor4").value);
				self.currentLayoutProperties.incremental = document.getElementById("incremental4").checked;
				self.currentLayoutProperties.tile = document.getElementById("tile4").checked;
			});

			$("#default-layout4").click( function (evt) {
				self.copyProperties();
				var temp = _.template($("#cose-bilkent-settings-template").html());
				self.template = temp(self.currentLayoutProperties);
				$(self.el).html(self.template);
			});

			return this;
		}
});

export default views;
