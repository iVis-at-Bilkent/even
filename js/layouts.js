import $ from "jquery";
import 'bootstrap';
import _ from 'lodash';
import Backbone from 'backbone';

import {cyL, cyR, cy_headless} from './cy-utilities';


var setFileContent = function(fileName, id){
	var span = document.getElementById(id);
	while( span.firstChild ) {
		span.removeChild( span.firstChild );
	}
	span.appendChild( document.createTextNode(fileName) );
};

var toggleSync = function(bool){
	if (bool){
		cyL.fit(50); cyR.fit(50);
		if (cyL.zoom() > cyR.zoom()){
			cyL.zoom(cyR.zoom()); cyL.pan(cyR.pan());
		}
		else{
			cyR.zoom(cyL.zoom()); cyR.pan(cyL.pan());
		}
		var syncZoom = function(){cyR.zoom(cyL.zoom())};
		var syncZoom2 = function(){cyL.zoom(cyR.zoom())};
		var syncPan = function(){if (cyL.pan("x") != cyR.pan("x") || cyL.pan("y") != cyR.pan("y")){cyR.pan(cyL.pan())};};
		var syncPan2 = function(){if (cyL.pan("x") != cyR.pan("x") || cyL.pan("y") != cyR.pan("y")){cyL.pan(cyR.pan())};};
		var syncDrag = function(){
				var node = cyR.getElementById(this.id());
				if (node.length && (node.position("x") != this.position("x") || node.position("y") != this.position("y"))){
					node.position(this.position())
				};
		};
		var syncDrag2 = function(){
				var node = cyL.getElementById(this.id());
				if (node.length && (node.position("x") != this.position("x") || node.position("y") != this.position("y"))){
					node.position(this.position())
				};
		};

		cyL.on("zoom", syncZoom);
		cyR.on("zoom", syncZoom2);
		cyL.on("pan", syncPan);
		cyR.on("pan", syncPan2);
		cyL.on("drag","node", syncDrag);
		cyR.on("drag","node", syncDrag2);
	}
	else{
		cyL.off("zoom", syncZoom);
		cyR.off("zoom", syncZoom2);
		cyL.off("pan", syncPan);
		cyR.off("pan", syncPan2);
		cyL.off("drag", "node", syncDrag);
		cyR.off("drag", "node", syncDrag2);
	};
};


var applyAggregatedLayout = function() {
	if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
		toggleSync(false);
	}

	let api = cyL.synchedLayout('get');
	api.applyAggregatedLayout(cyL, cyR);

	cyL.one("synchedLayoutStopped", function() {
		cyL.fit(50); cyR.fit(50);

		if (cyL.zoom() > cyR.zoom()){
			cyL.zoom(cyR.zoom()); cyL.pan(cyR.pan());
		}
		else{
			cyR.zoom(cyL.zoom()); cyR.pan(cyL.pan());
		}

		if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
			toggleSync(true);
		}
	});

};

var applyInterLayedLayout = function(excludedNodeMoveFactor = 0.2) {
	if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
		toggleSync(false);
	}

	let api = cyL.synchedLayout('get');
	api.applyInterLayedLayout(cyL, cyR, excludedNodeMoveFactor);

	cyL.one("synchedLayoutStopped", function() {
		cyL.fit(50); cyR.fit(50);

		if (cyL.zoom() > cyR.zoom()){
			cyL.zoom(cyR.zoom()); cyL.pan(cyR.pan());
		}
		else{
			cyR.zoom(cyL.zoom()); cyR.pan(cyL.pan());
		}

		if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
			toggleSync(true);
		}
	});

};

var applyExtendedInterLayedLayout = function(excludedNodeMoveFactor = 0.2) {
	if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
		toggleSync(false);
	}

	let api = cyL.synchedLayout('get');
	api.applyExtendedInterLayedLayout(cyL, cyR, excludedNodeMoveFactor);

	cyL.one("synchedLayoutStopped", function() {
		cyL.fit(50); cyR.fit(50);

		if (cyL.zoom() > cyR.zoom()){
			cyL.zoom(cyR.zoom()); cyL.pan(cyR.pan());
		}
		else{
			cyR.zoom(cyL.zoom()); cyR.pan(cyL.pan());
		}

		if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
			toggleSync(true);
		}
	});

};

var applyConvergingIterationsLayout = function(excludedNodeMoveFactor = 0.2) {
	if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
		toggleSync(false);
	}

	let api = cyL.synchedLayout('get');
	api.applyIterativeLayout(cyL, cyR, 5);

	cyL.one("synchedLayoutStopped", function() {
		cyL.fit(50); cyR.fit(50);

		if (cyL.zoom() > cyR.zoom()){
			cyL.zoom(cyR.zoom()); cyL.pan(cyR.pan());
		}
		else{
			cyR.zoom(cyL.zoom()); cyR.pan(cyL.pan());
		}

		if ($("#sync-icon").hasClass("toggle-mode-sustainable")) {
			toggleSync(true);
		}
	});

};

export {toggleSync, cyL, cyR, setFileContent, applyAggregatedLayout, applyInterLayedLayout, applyExtendedInterLayedLayout, applyConvergingIterationsLayout};
