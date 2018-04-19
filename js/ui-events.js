import $ from "jquery";
import { saveAs } from 'file-saver';

import {toggleSync, cyL, cyR, setFileContent, defaultInstanceProperties, applyMergedLayout, applyUnnamedLayout} from './layouts.js';
import {loadGraphIntoCytoscape, saveAsGraphml, saveAsImage, loadSample} from './file-utilities.js';

import {graphmlToJSON, textToXmlObject, loadXMLDoc} from './converter.graphml-to-json.js';
import views from './backbone-views.js';
import properties from './properties.js';

var currentInstanceProperties = properties.currentInstanceProperties;

var instanceNames = [];

///////////////////// EDIT ////////////////////////////

$("#delete-selected, #delete-selected-icon").click(function (e) {
	if (!$("#sync-icon").hasClass("toggle-mode-sustainable")){
		cyL.elements(":selected").remove();
		cyR.elements(":selected").remove();
	}
	else {
		const selectedEles = cyL.$(":selected").union(cyR.$(":selected"));
		selectedEles.forEach(function(ele){
			let id = ele.id();
			cyL.getElementById(id).remove();
			cyR.getElementById(id).remove();
		});
	}
});

$("#clear-instances").click(function() {
	cyL.elements().remove();
	cyR.elements().remove();
	$("#multiple-files-toolbar").hide();
	setFileContent("", "file-name-left");
	setFileContent("", "file-name-right");
});

$("#pentagon-node, #rectangle-node").click(function() {
	$("#add-node-dropdown").attr("src", $(this).children().attr("src"));
	$("#add-node-dropdown").attr("shape", $(this).children().attr("shape"));
});

$("#haystack-edge, #triangle-edge").click(function() {
	$("#add-edge-dropdown").attr("src", $(this).children().attr("src"));
	$("#add-edge-dropdown").attr("shape", $(this).children().attr("shape"));
});

///////////////////// VIEW ////////////////////////////

$("#sync").change(function() {
	toggleSync($("#syncBox").prop('checked'));
});

$("#sync-icon").click(function() {
	if ($( this ).hasClass( "toggle-mode-sustainable" )){
		$(this).removeClass("toggle-mode-sustainable");
		toggleSync(false);
	}
	else{
		$( this ).addClass("toggle-mode-sustainable");
		toggleSync(true);
	}

});

///////////////////// LOAD & SAVE //////////////////////////////

$("#save-file").click(function (e) {
	saveAsGraphml('graph')
});

//////////////////////////////////////////////////////////////////////////////////////////////

$("#cose-bilkent").css("background-color", "grey");

var tempName = "cose-bilkent";
$("#cose-bilkent").click( function (e) {
	tempName = "cose-bilkent";
	$("#cose-bilkent").css("background-color", "grey");
	$("#cose").css("background-color", "white");
});
$("#cose").click( function (e) {
	tempName = "cose";
	$("#cose").css("background-color", "grey");
	$("#cose-bilkent").css("background-color", "white");
});


$("#add-node-dropdown").click(function() {
	cyL.autoungrabify(false);
	cyR.autoungrabify(false);
	$("#select-mode-icon").removeClass("selected-mode");
	$("#add-edge-dropdown").removeClass("selected-mode");
	$("#add-edge-dropdown").removeClass("toggle-mode-sustainable");

	if (!$("#add-node-dropdown").hasClass("selected-mode")) {
		$("#add-node-dropdown").addClass("selected-mode")
	} else if (!$("#add-node-dropdown").hasClass("toggle-mode-sustainable")) {
		$("#add-node-dropdown").addClass("toggle-mode-sustainable");
	} else {
		$("#select-mode-icon").trigger("click");
	}
});

$("#add-edge-dropdown").click(function() {
	$("#select-mode-icon").removeClass("selected-mode");
	$("#add-node-dropdown").removeClass("selected-mode");
	$("#add-node-dropdown").removeClass("toggle-mode-sustainable");

	if (!$("#add-edge-dropdown").hasClass("selected-mode")) {
		$("#add-edge-dropdown").addClass("selected-mode");
		cyL.autoungrabify(true);
		cyR.autoungrabify(true);
	} else if (!$("#add-edge-dropdown").hasClass("toggle-mode-sustainable")) {
		$("#add-edge-dropdown").addClass("toggle-mode-sustainable");
	} else {
		$("#select-mode-icon").trigger("click");
	}

});

$("#select-mode-icon").click(function() {
	cyL.autoungrabify(false);
	cyR.autoungrabify(false);
	$("#select-mode-icon").addClass("selected-mode");
	$("#add-node-dropdown").removeClass("selected-mode");
	$("#add-node-dropdown").removeClass("toggle-mode-sustainable");
	$("#add-edge-dropdown").removeClass("selected-mode")
	$("#add-edge-dropdown").removeClass("toggle-mode-sustainable");
});

var coseBilkentLayoutProp = new views.COSEBilkentLayout({
	el: '#cose-bilkent-layout-table'
});

var instanceProperties = new views.instancePropertiesView({
	el: '#instance-properties-table'
});

$("#instance-properties, #add-node-icon").click(function () {
	instanceProperties.render();
	instanceProperties.show();
});

$("#layout-properties, #layout-properties-icon").click(function (e) {
	coseBilkentLayoutProp.render();
});

$("#perform-layout").click(function (e) {
	switch (tempName) {
		case 'cose-bilkent':
			applyMergedLayout();
			break;
		case 'cose':
			applyUnnamedLayout();
			break;
	}
});
$("#perform-layout-icon").click(function (e) {
	$("#perform-layout").trigger("click");
});
var atts;
var loadedFiles;

var slideGraphs = function(n) {
	if (n < loadedFiles.length - 1) {
		$("#file-input-left").trigger("change", [loadedFiles[n]]);
		$("#file-input-right").trigger("change", [loadedFiles[n+1]]);
	}
};

var refreshPagination = function(length) {
	$("#paginationLeft li").remove();
	$("#paginationRight li").remove();

	for (let i=1; i <= length; i++) {
		$("#paginationLeft").append('<li class="page-item" title="' + loadedFiles[i-1].name +  '" id="page-' + i + '"><a class="page-link" href="#">' + i + '</a></li>');
		$("#paginationRight").append('<li class="page-item" title="' + loadedFiles[i-1].name +  '" id="page-' + i + '"><a class="page-link" href="#">' + i + '</a></li>');
	}

	$($("#paginationLeft li")[0]).addClass("active")
		$($("#paginationRight li")[1]).addClass("active")
		$($("#paginationLeft li")[1]).addClass("disabled")
		$($("#paginationRight li")[0]).addClass("disabled")

		$('#paginationLeft li').click( function() {
			if (!$(this).hasClass("disabled")) {
				let index = $(this).index();
				$("#file-input-left").trigger("change", [loadedFiles[index]]);
				$("#paginationLeft li").removeClass("active");
				$(this).addClass("active");
				$("#paginationRight li").removeClass("disabled");
				$($("#paginationRight li")[index]).addClass("disabled");


				if (index > 1 && index < loadedFiles.length - 1) {
					$("#paginationControl li").removeClass("disabled");
				} else if (index == 0) {
					$("#previousGraph").addClass("disabled");
				} else if (index == loadedFiles.length - 1) {
					$("#nextGraph").addClass("disabled");
				}
			}
		});

	$('#paginationRight li').click( function() {
		if (!$(this).hasClass("disabled")) {
			let index = $(this).index();
			$("#file-input-right").trigger("change", [loadedFiles[index]]);
			$("#paginationRight li").removeClass("active");
			$(this).addClass("active");
			$("#paginationLeft li").removeClass("disabled")
		$($("#paginationLeft li")[index]).addClass("disabled")

		if (index > 1 && index < loadedFiles.length - 1) {
			$("#paginationControl li").removeClass("disabled");
		} else if (index == 0) {
			$("#previousGraph").addClass("disabled");
		} else if (index == loadedFiles.length - 1) {
			$("#nextGraph").addClass("disabled");
		}
		}
	});
	$("#previousGraph").click(function () {
		let leftInstance = document.getElementById("cyL");
		let rightInstance = document.getElementById("cyR");

		let tmp = defaultInstanceProperties.leftInstancebackgroundColor;
		defaultInstanceProperties.leftInstancebackgroundColor = defaultInstanceProperties.rightInstancebackgroundColor;
		defaultInstanceProperties.rightInstancebackgroundColor = tmp;
		leftInstance.style.backgroundColor = defaultInstanceProperties.leftInstancebackgroundColor;
		rightInstance.style.backgroundColor = defaultInstanceProperties.rightInstancebackgroundColor;

		tmp = defaultInstanceProperties.leftInstanceNodeBackgroundColor;
		defaultInstanceProperties.leftInstanceNodeBackgroundColor = defaultInstanceProperties.rightInstanceNodeBackgroundColor;
		defaultInstanceProperties.rightInstanceNodeBackgroundColor = tmp;

		tmp = defaultInstanceProperties.leftInstanceEdgeColor;
		defaultInstanceProperties.leftInstanceEdgeColor = defaultInstanceProperties.rightInstanceEdgeColor;
		defaultInstanceProperties.rightInstanceEdgeColor = tmp;

		let leftIndex = $("#paginationLeft li.active").index() - 1;
		let rightIndex = $("#paginationRight li.active").index() - 1;
		$("li").removeClass("disabled");
		$($("#paginationLeft li")[leftIndex]).trigger("click");
		$($("#paginationRight li")[rightIndex]).trigger("click");
		$("#nextGraph").removeClass("disabled");

		if (currentInstanceProperties[$("#file-name-left").html()]) {
			leftInstance.style.backgroundColor = currentInstanceProperties[$("#file-name-left").html()].instanceBackgroundColor;
		}

		if (currentInstanceProperties[$("#file-name-right").html()]) {
			rightInstance.style.backgroundColor = currentInstanceProperties[$("#file-name-right").html()].instanceBackgroundColor;
		}

	});

	$("#nextGraph").click(function () {
		let leftInstance = document.getElementById("cyL");
		let rightInstance = document.getElementById("cyR");

		let tmp = defaultInstanceProperties.leftInstancebackgroundColor;
		defaultInstanceProperties.leftInstancebackgroundColor = defaultInstanceProperties.rightInstancebackgroundColor;
		defaultInstanceProperties.rightInstancebackgroundColor = tmp;
		leftInstance.style.backgroundColor = defaultInstanceProperties.leftInstancebackgroundColor;
		rightInstance.style.backgroundColor = defaultInstanceProperties.rightInstancebackgroundColor;

		tmp = defaultInstanceProperties.leftInstanceNodeBackgroundColor;
		defaultInstanceProperties.leftInstanceNodeBackgroundColor = defaultInstanceProperties.rightInstanceNodeBackgroundColor;
		defaultInstanceProperties.rightInstanceNodeBackgroundColor = tmp;

		tmp = defaultInstanceProperties.leftInstanceEdgeColor;
		defaultInstanceProperties.leftInstanceEdgeColor = defaultInstanceProperties.rightInstanceEdgeColor;
		defaultInstanceProperties.rightInstanceEdgeColor = tmp;

		let leftIndex = $("#paginationLeft li.active").index() + 1;
		let rightIndex = $("#paginationRight li.active").index() + 1;

		$("li").removeClass("disabled");
		$($("#paginationLeft li")[leftIndex]).trigger("click");
		$($("#paginationRight li")[rightIndex]).trigger("click");
		$("#previousGraph").removeClass("disabled");

		if (currentInstanceProperties[$("#file-name-left").html()]) {
			leftInstance.style.backgroundColor = currentInstanceProperties[$("#file-name-left").html()].instanceBackgroundColor;
		}

		if (currentInstanceProperties[$("#file-name-right").html()]) {
			rightInstance.style.backgroundColor = currentInstanceProperties[$("#file-name-right").html()].instanceBackgroundColor;
		}

	});

};

var refreshDropUps = function() {
	instanceNames = [];
	for (let i in  loadedFiles) {
		instanceNames.push(loadedFiles[i].name);
	}
};

$('#pagination li').not("#previousGraph, #nextGraph").click( function() {
	slideGraphs($(this).index() - 1);
	$("li").removeClass("active");
	$(this).addClass("active");
});

$("#previousGraph").click(function () {
	let currentPage = $("#pagination li.active").index();
	let previousPage = currentPage - 1;
	$("#page-" + currentPage).removeClass("active");
	$("#page-" + previousPage).addClass("active");
	$($("#pagination li")[currentPage - 1]).addClass("active")

});

$("body").on("change", "#file-input-multiple", function (e) {
	var fileInput = document.getElementById('file-input-multiple');
	loadedFiles = [...fileInput.files];

	if (fileInput.files.length >= 2) {
		$("#multiple-files-toolbar").hide();
		$("#file-input-left").trigger("change", [fileInput.files[0]]);
		$("#file-input-right").trigger("change", [fileInput.files[1]]);
		refreshDropUps();
	}
	else {
		$('#select-multiple-file-modal').modal('show');
	}

	if (fileInput.files.length > 2) {
		$("#multiple-files-toolbar").show();
		refreshPagination(loadedFiles.length);
	}

	$("#file-input-multiple").val(null);
});

$("body").on("change", "#file-input-left", function (e, fileObject) {
	var fileInput = document.getElementById('file-input-left');
	var file = fileInput.files[0] || fileObject;
	var textType = /text.*/;

	var reader = new FileReader();
	reader.onload = function (e){
		var graphmlConverter = new graphmlToJSON(textToXmlObject(this.result));
		atts = graphmlConverter.attributes;

		var cytoscapeJsGraph = {
			edges: graphmlConverter.objects[2],
			nodes: graphmlConverter.objects[1]
		};

		var colorMap = {nodeBackground : defaultInstanceProperties.leftInstanceNodeBackgroundColor, otherNodeBackground : defaultInstanceProperties.rightInstanceNodeBackgroundColor,
			edgeBackground : defaultInstanceProperties.leftInstanceEdgeColor, otherEdgeBackground: defaultInstanceProperties.rightInstanceEdgeColor,
			commonNodeBackground : "#BDBDBD", commonEdgeBackground : "#E0E0E0"};

		let leftInstanceName = file.name;
		let rightInstanceName = $("#file-name-right").html();

		if (currentInstanceProperties[leftInstanceName]) {
			colorMap.nodeBackground = currentInstanceProperties[leftInstanceName].nodeBackgroundColor;
		}
		if (currentInstanceProperties[rightInstanceName]) {
			colorMap.otherNodeBackground = currentInstanceProperties[rightInstanceName].nodeBackgroundColor;
		}
		loadGraphIntoCytoscape(cytoscapeJsGraph, cyL, cyR, colorMap);

	};
	reader.readAsText(file);
	if (!fileObject) {
		instanceNames[1] = file.name;
	}
	setFileContent(file.name, "file-name-left");
	$("#file-input-left").val(null);
});

$("body").on("change", "#file-input-right", function (e, fileObject) {
	var fileInput = document.getElementById('file-input-right');
	var file = fileInput.files[0] || fileObject;
	var textType = /text.*/;

	var reader = new FileReader();
	reader.onload = function (e){
		var graphmlConverter = new graphmlToJSON(textToXmlObject(this.result));
		atts = graphmlConverter.attributes;

		var cytoscapeJsGraph = {
			edges: graphmlConverter.objects[2],
			nodes: graphmlConverter.objects[1]
		};

		var colorMap = {nodeBackground : defaultInstanceProperties.rightInstanceNodeBackgroundColor, otherNodeBackground : defaultInstanceProperties.leftInstanceNodeBackgroundColor,
			edgeBackground : defaultInstanceProperties.rightInstanceEdgeColor, otherEdgeBackground: defaultInstanceProperties.leftInstanceEdgeColor,
			commonNodeBackground : "#BDBDBD", commonEdgeBackground : "#E0E0E0"};

		let leftInstanceName = $("#file-name-left").html();
		let rightInstanceName = file.name;

		if (currentInstanceProperties[leftInstanceName]) {
			colorMap.otherNodeBackground = currentInstanceProperties[leftInstanceName].nodeBackgroundColor;
		}
		if (currentInstanceProperties[rightInstanceName]) {
			colorMap.nodeBackground = currentInstanceProperties[rightInstanceName].nodeBackgroundColor;
		}

		loadGraphIntoCytoscape(cytoscapeJsGraph, cyR, cyL, colorMap);

	};
	reader.readAsText(file);
	if (!fileObject) {
		instanceNames[1] = file.name;
	}
	setFileContent(file.name, "file-name-right");
	$("#file-input-right").val(null);
});

$("#load-file-left, #load-file-left-icon").click(function (e) {
	$("#file-input-left").trigger('click');
});

$("#load-file-right, #load-file-right-icon").click(function (e) {
	$("#file-input-right").trigger('click');
});

$("#load-multiple-files, #load-multiple-files-icon").click(function (e) {
	$("#file-input-multiple").trigger('click');
});


$("#save-as-png").click(function(evt){
	saveAsImage("png");
});

$("#save-as-jpg").click(function(evt){
	saveAsImage("jpg");
});


$("#sample0").click(function (e){
	var fileObj = loadSample("ovcar4-cov318-dif-start.graphml");
	$("#file-input-left").trigger("change", [fileObj]);
	var fileObj = loadSample("ovcar4-cov318-dif-end.graphml");
	$("#file-input-right").trigger("change", [fileObj]);
	instanceNames =  ["ovcar4-cov318-dif-start.graphml", "ovcar4-cov318-dif-end.graphml"];
});

$("#sample1").click(function (e){
	var fileObj = loadSample("ovcar4-ovcar3-dif-start.graphml");
	$("#file-input-left").trigger("change", [fileObj]);
	var fileObj = loadSample("ovcar4-ovcar3-dif-end.graphml");
	$("#file-input-right").trigger("change", [fileObj]);
	instanceNames = ["ovcar4-ovcar3-dif-start.graphml", "ovcar4-ovcar3-dif-end.graphml"];
});
