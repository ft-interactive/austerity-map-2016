import d3 from 'd3';
import oHoverable from 'o-hoverable';
import attachFastClick from 'fastclick';

import {drawmaps, drawRegionalMap, change_centre} from './drawMap';

document.addEventListener('DOMContentLoaded', () => {
	// make hover effects work on touch devices
	oHoverable.init();

	// remove the 300ms tap delay on mobile browsers
	attachFastClick(document.body);

	var ddlist = spreadsheet.ddlist;
	var dataset = spreadsheet.data;
	var credits = spreadsheet.credits;
	var firstRun = true


	//console.log(credits)
	//d3.select("#credits").html("<b>By </b>"+credits.credit);

	//build the drop dow menu from items in ddlist
	var html=""
		for (var i = 0; i < ddlist.length; i++) {
			html=html+list(i,ddlist[i].listitem,ddlist[i].colrange)
		}
	var div=d3.select("#ddmenu")
	.html(html)

	document.getElementById('search_postcode').onsubmit = function(event) {
		event.preventDefault();
		var postcode = event.target.elements.postcode.value;
		postcode = postcode.replace(/\s/g, "");
		validate_postcode(postcode);
	};

	function validate_postcode(postcode) {
		var parcel="https://api.postcodes.io/postcodes/"+String(postcode);
		var authCode;
		    d3.json(parcel,function(error,data){
		    	if(error) {
		    		console.log("error",error);
		    		show_postcode_error()
		    	}
				else {
					authCode=data.result.codes.admin_district;
					document.getElementById('postcode_error').innerHTML = ''
					console.log("Returned code=", authCode);
					var e = document.getElementById("ddmenu");
					var lookup = e.options[e.selectedIndex].value;
					var colRange=ddlist[lookup].colrange;
					change_centre(authCode, colRange)
				}
			})
	}

	function show_postcode_error() {
		document.getElementById('postcode_error').innerHTML = 'Invalid postcode'
	}

	//Add event listener to drop down menu
	var event=d3.select("#ddmenu");
	event.on("change", function(d){
		var e = document.getElementById("ddmenu");
		var lookup = e.options[e.selectedIndex].value;
		var colRange=ddlist[lookup].colrange;
		var value=ddlist[lookup].trigger;
		
		//fill in explainer text if needed
		var explainerhtml=ddlist[lookup].description;
		d3.select("#explain").html(explainerhtml);

		
		//create a dataset to draw the map with
		var mapData=buildData(value)
		drawmaps(mapData,colRange,firstRun);
	});

	//Displays the map
	setup();
	//Adds dynamic text to the fourth case study
	html=doStudyText();
	document.getElementById('dynam1').innerHTML = html;

	
	//Draws the default map of overall impact
	function setup () {
		var lookup = 0;
		var value=ddlist[0].trigger;
		var colRange=ddlist[lookup].colrange;
		var mapData=buildData(value)
		drawmaps(mapData,colRange,firstRun);
		firstRun=false
	}

	function buildData (trigger) {
		var mapData=[]
		for (var i = 0; i < dataset.length; i++) {
			mapData.push({id:dataset[i].authority.code,authname:dataset[i].authority.name,summary20102016:dataset[i].authority.summary20102016,summary20102021:dataset[i].authority.summary20102021,summary20162021:dataset[i].authority.summary20162021,value:dataset[i].authority[trigger].pa});

		};
		//value:dataset[i].authority[value].pa
		//console.log(mapData) 
		return mapData
	}

	function list(val,el,col) {
		return `
			<option value=${val}>${el}</option>
	`;
	}

	function doStudyText() {
		return `
			<div id="dynamicName" class="studyname">${""}</div>
			<div class="studypic"><img class="studypic" src="https://image.webservices.ft.com/v1/images/raw/ftcms:34e0aa66-e544-11e5-a09b-1f8b0d268c39?source=ig&width=450" alt="Syria’s ‘mafia-style’ gas deals with jihadis"></div>
			<div id="dynamicBody" class="studybody">${""}</div>
			`;
	}

});
