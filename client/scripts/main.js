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
	console.log(dataset)
	//build the drop dow menu from items in ddlist
	var html=""
		for (var i = 0; i < ddlist.length; i++) {
			html=html+list(i,ddlist[i].listitem)
		}
	var div=d3.select("#ddmenu")
	.html(html)
	
	//Add event listener to drop down menu
	var event=d3.select("#ddmenu");
	event.on("change", function(d){
		var e = document.getElementById("ddmenu");
		var value = e.options[e.selectedIndex].value;
		console.log(value)

		drawmaps();

	});




	function list(val,el) {
		return `
		<option value=${val}>${el}</option>
	`;
	}

});
