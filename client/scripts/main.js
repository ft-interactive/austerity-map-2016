import d3 from 'd3';
import oHoverable from 'o-hoverable';
import attachFastClick from 'fastclick';

import {drawmaps} from './drawMap';

document.addEventListener('DOMContentLoaded', () => {
	// make hover effects work on touch devices
	oHoverable.init();

	// remove the 300ms tap delay on mobile browsers
	attachFastClick(document.body);

	var ddlist = spreadsheet.ddlist;
	var dataset = spreadsheet.authorities;
	//build the drop dow menu from items in ddlist
	var html=""
		for (var i = 0; i < ddlist.length; i++) {
			html=html+list(ddlist[i].lookup,ddlist[i].listitem,ddlist[i].colrange)
		}
	var div=d3.select("#ddmenu")
	.html(html)
	
	//Add event listener to drop down menu
	var event=d3.select("#ddmenu");
	event.on("change", function(d){
		var e = document.getElementById("ddmenu");
		var lookup = e.options[e.selectedIndex].value;
		var value=ddlist[lookup].trigger;
		var colRange=ddlist[lookup].colrange;
		console.log(value,colRange)
		//create a dataset to draw the map with
		var mapData=[]
		for (var i = 0; i < dataset.length; i++) {
			mapData.push({id:dataset[i].id,value:dataset[i][value]});
		};
		drawmaps(mapData,colRange);
	});



	function list(val,el,col) {
		return `
		<option value=${val} colour=${col}>${el}</option>
	`;
	}

});
