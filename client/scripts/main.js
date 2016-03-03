import d3 from 'd3';
import oHoverable from 'o-hoverable';
import attachFastClick from 'fastclick';

import {drawmaps} from './drawMap';

document.getElementById('search_postcode').onsubmit = function(event) {
 event.preventDefault();
 const value = event.target.elements.postcode.value;
 const is_valid = validate_postcode(value)
 console.log(value);
 if (!is_valid) {
 	// tewll the user somehow
 	show_postcode_error(value);
 } else {
 	// do stuff
 }

};

function validate_postcode() {
	return false;
}

function show_local_result() {

}

function show_postcode_error() {
	document.getElementById('postcode_error').innerHTML = 'Invalid postcode'
}

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
		//create a dataset to draw the map with
		var mapData=buildData(value)
		drawmaps(mapData,colRange);
	});

	//Add event listener to drop down menu
	// var divSelect = document.getElementById('pcode');
	// divSelect.addEventListener("keyup",postcode);

	setup();
	html=text1();
	div=d3.select("#dynam1")
	.html(html)

	
	//Draws the default map of overall impact
	function setup () {
		var lookup = 0;
		var value=ddlist[0].trigger;
		var colRange=ddlist[lookup].colrange;
		var mapData=buildData(value)
		drawmaps(mapData,colRange);
	}

	function buildData (value) {
		var mapData=[]
		for (var i = 0; i < dataset.length; i++) {
			mapData.push({id:dataset[i].id,value:dataset[i][value]});
		};
		return mapData
	}

	function list(val,el,col) {
		return `
		<option value=${val}>${el}</option>
	`;
	}

	function postcode() {
		var input=this.value
		if(input.length>=6) {
			console.log (this.value)
			input = input.replace(/\s/g, "");

			d3.json('https://api.postcodes.io/postcodes/SE19HL',function(error,data){
				console.log(data.result.codes.admin_district)
			})

			
		}

	}

	function text1() {
		return `
			<div class="dynamic">${"Some dynamic text will go in here"}</div>
			<div class="dynamic">${" and a bit more in here"}</div>	
			`;
	}

});
