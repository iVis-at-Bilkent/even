import {saveAs} from 'file-saver';
import {toggleSync, cyL, cyR, setFileContent, defaultInstanceProperties} from './layouts.js';
import {graphmlToJSON, textToXmlObject, loadXMLDoc} from './converter.graphml-to-json.js';

var loadGraphIntoCytoscape = function(cytoscapeJsGraph, cy, otherCy, colorMap) {
	var id_name_map = {};

	for (let node of cytoscapeJsGraph.nodes){
		if (node.data.name){
			id_name_map[node.data.id] = node.data.name;
			node.data.id = node.data.name;
		}
	}

	for (let edge of cytoscapeJsGraph.edges){
		if (id_name_map[edge.data.source])
			edge.data.source = id_name_map[edge.data.source];

		if (id_name_map[edge.data.target])
			edge.data.target = id_name_map[edge.data.target];
		edge.data.id = edge.data.target + edge.data.source;
	}

	cy.elements().remove();
	otherCy.nodes().css("background-color", colorMap.otherNodeBackground);
	otherCy.edges().css("line-color", colorMap.otherEdgeBackground);

	for (let node of cytoscapeJsGraph.nodes){
		let otherNode = otherCy.getElementById(node.data.id);
		if (otherNode.length){
			node.css["background-color"] = colorMap.commonNodeBackground;
			otherNode.css("background-color", colorMap.commonNodeBackground);
		}
		else{
			node.css["background-color"] = colorMap.nodeBackground;
		};
	}

	for (let edge of cytoscapeJsGraph.edges){
		let otherEdge = otherCy.getElementById(edge.data.id);
		if (otherEdge.length){
			edge.css = {"line-color" : colorMap.commonEdgeBackground};
			otherEdge.css("line-color", colorMap.commonEdgeBackground);
		}
		else{
			edge.css = {"line-color" : colorMap.edgeBackground};
		};
	}
	
	cy.add(cytoscapeJsGraph);
	cy.fit(50);
};

var saveAsGraphml = function (filename) {
	var sbgnmlText = jsonToGraphml.createGraphml(atts);

	var blob = new Blob([sbgnmlText], {
		type: "text/plain;charset=utf-8;",
	});

	filename += ".graphml";;
	saveAs(blob, filename);
};

var saveAsImage = function(type) {
	var context = document.createElement('canvas').getContext("2d");

	var imageL = new Image();
	imageL.src = cyL[type]({scale : 3, bg: "#ffebee"});
	imageL.onload = function(){
		var imageR = new Image();
		imageR.src = cyR[type]({scale : 3, bg: "#E3F2FD"});
		imageR.onload = function(){
			var w = Math.max(imageL.width, imageR.width);
			var h = Math.max(imageL.height, imageR.height);
			context.canvas.width = 2 * w;
			context.canvas.height = h;
			context.drawImage(imageL, 0, 0, w, h);
			context.drawImage(imageR, w, 0, w, h);
			context.canvas.toBlob(function(blob){saveAs(blob, "network." + type)}, "image/" + type, 1);
		}
	}
};

var loadSample = function(fileName){
	var xmlResponse = loadXMLDoc("samples/" + fileName);

	var fileObj = new File([xmlResponse], fileName, {
		type: "text/plain",
	});

	return fileObj;
};

export {loadGraphIntoCytoscape, saveAsGraphml, saveAsImage, loadSample};
