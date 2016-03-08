import d3 from 'd3';

var mapJSON = {};
var colours= ([ "#f4d4c1","#efb1af", "#e3726b", "#a64d67"]);
var selected
//code based on Caroline Nevitt’s d3.module 4 exercise
export function drawmaps (mapData,colDomain, firstRun) {
	if (firstRun==true) {
		selected= "E06000008"
	}
	colDomain = colDomain.split(',');
	var svg = d3.select("#mapHolder")
	.html("")
	var margin = {top: 10, right: 0, bottom: 10, left: 18};
	var width = (document.getElementById('national').getBoundingClientRect().width)-margin.left - margin.right;
	var height=(width*1.3);
	document.getElementById('national').style.height=height+45+"px";

	//Define map projection
	var projection = d3.geo.mercator()
						   .center([ -3, 55.4])
						   .translate([ width/2, height/2 ])
						   .scale([ width/0.27 ]);

	//Define path generator
	var path = d3.geo.path()
					 .projection(projection);

	//colour range will eventually be loaded from bertha as will vary for each information range loaded
	var color = d3.scale.threshold()
    .domain(colDomain)
    .range(colours);

	//Create SVG
	var svg = d3.select("#mapHolder")
		.append("svg")
		.attr("id", "GB")
		.attr("width", width)
		.attr("height", height);

	//Load in GeoJSON data
	d3.json("data/authorities3.json", function(json) {
		//Merge the constituency data and GeoJSON into a single array
		//Loop through once for each value
		mapJSON = json;

		for (var i = 0; i < mapData.length; i++) {
			//Grab ConstituencyID
			var dataConstituencyName = mapData[i].id;	
			//Grab data value, and convert from string to float
			var dataValue = +mapData[i].value;
			var summary = mapData[i].summary;
			var authName = mapData[i].authname;

			//Find the corresponding ConstituencyID inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
				//We'll check the official ISO country code
				var jsonConstituencyName = json.features[j].properties.name;
				//console.log(jsonConstituencyName)
				if (dataConstituencyName == jsonConstituencyName) {
					//Copy the data values into the GeoJSON
					json.features[j].properties.value = dataValue;
					json.features[j].properties.authName = authName;
					json.features[j].properties.summary = summary;
					
					//Stop looking through the JSON
					break;
				}
			}
		}	
		
		//Bind data and create one path per GeoJSON feature
		svg.selectAll("path")
		   .data(json.features)
		   .enter()
		   .append("path")
		   .attr("d", path)
		   .attr("id", function (d) { return d.properties.name})
		   .attr("fill",function (d) { return color(d.properties.value)})
		   .style("stroke","#fff1e0")
	  	 .style("stroke-width","0.2px")	
		   .on("click", function(d){
		   		drawRegionalMap(d,colDomain);
		   	});
		   setupRegion(selected)
	});
	drawLegend(colDomain)


	function drawLegend(colDomain){
		var legend = d3.select("#GB").append('g')
			.attr("width",100)
			.attr("height",200);
		var rw=15;
		var rh=12;
		for (var i = 0; i < 4; i++) {
			legend.append("rect")
				.attr("fill", function(){return colours[i]})
				.attr("width" , rw)
				.attr("height" , rh)
				.attr("x",5)
				.attr("y",(i*18)+10);
			legend.append('text')
				.attr("class", "legend")
				.attr("x",27)
				.attr("y",(i*18)+21)
				.html(function() { 
					if (i<3){
						return "less than £"+ colDomain[i]
					}
					else {
						return "more than £"+ colDomain[i-1]
					}
				});
		}
	}

	function setupRegion(authcode) {
			var el=d3.select("#"+authcode);
			var data=el[0][0].__data__
			drawRegionalMap(data,colDomain)

	}

}
	// var DefaultAuth="E06000008"
	// drawRegionalMap(DefaultAuth,colDomain);
	// var el=d3.select("#"+d);
	// 	var data=el[0][0].__data__
	// 	drawRegionalMap(data,colRange)
	// }

export function drawRegionalMap(d, colDomain){
	selected=d.properties.name
	//This function bring the selection to the front
	d3.selection.prototype.moveToFront = function() { 
	  return this.each(function() { 
	    this.parentNode.appendChild(this); 
	  }); 
	};
	//Fills in dynamic text
	var div=d3.select("#dynamicName")
		.html(d.properties.authName);
	div=d3.select("#nameholder")
		.html(d.properties.authName);
	var html=summaryText(d.properties.summary)
	div=d3.select("#dynamicBody")
		.html(html);

	function summaryText (summary){
		//console.log(summary)
		// return `
		// 	<div id=class="studybody">${"Total "+summary.total}</div>
		// 	<div id=class="studybody">${"PA 2010-20 "+summary.pa20102020}</div>
		// 	<div id=class="studybody">${"PA 2016-21 "+summary.pa20162021}</div>
		// 	`;
	}


	var margin = {top: 10, right: 0, bottom: 10, left: 18};
	var width = (document.getElementById('regional').getBoundingClientRect().width)-margin.left - margin.right;
	var height=(width*1.3)-5;
	//Define second map projection
	var newProjection = d3.geo.mercator()
		.center([d.properties.centroids_XCOORD-0.5,d.properties.centroids_YCOORD+0.3])
		.scale(width*30)
		.translate([ width/4, height/4 ])
		.rotate([0, 0]);
	
	var color = d3.scale.threshold()
    .domain(colDomain)
    .range(colours);

    var natMargin = {top: 10, right: 0, bottom: 10, left: 18};
	var natWidth = (document.getElementById('national').getBoundingClientRect().width) - (natMargin.left + natMargin.right);
	var natHeight=(document.getElementById('national').getBoundingClientRect().height) - (natMargin.top + natMargin.bottom + document.getElementById('nameholder').getBoundingClientRect().height);
	// document.getElementById('regional').style.height=natHeight+45+"px";

	//Define map projection
	var natProjection = d3.geo.mercator()
						   .center([ -3, 55.4])
						   .translate([ natWidth/2, natHeight/2 ])
						   .scale([ natWidth/0.27 ]);

	//Define path generator
	var natPath = d3.geo.path()
					 .projection(natProjection);

    var bounds = natPath.bounds(d3.select('path#'+d.properties.name).data()[0]),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / natWidth, dy / (natHeight-57)),
      translate = [natWidth / 2 - scale * x, (natHeight-57) / 2 - scale * y];

  	console.log(natHeight,scale,translate);

	//Define path generator
	// var newPath = d3.geo.path()
	// 			 .projection(newProjection);

	var regionalsvg = d3.select("#regionHolder")
		.html("")
		.append("svg")
		.attr("width", natWidth)
		.attr("height", natHeight-57);

	var g = regionalsvg.append('g');

	g.style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

	g.selectAll("path")
	   .data(mapJSON.features)
	   .enter()
	   .append("path")
	   .attr("d", natPath)
	   .attr("id", function (d) { return "new"+d.properties.name})
	   .attr("fill",function (d) { return color(d.properties.value)})
	   //.attr("fill","#ccc2c2")
	   .style("stroke","#fff1e0")
	   .style("stroke-width",2/scale + "px");

	var highlight=d3.select("#new"+d.properties.name)
		.style("stroke","#000000")
		.style("stroke-width",2/scale + "px");
	
	highlight.moveToFront();
	var svg = d3.select("#GB");
	var districts = svg.selectAll("path")
		.style("stroke","#fff1e0")
		.style("stroke-width","0px");

	highlight=d3.select("#"+d.properties.name)
		.style("stroke","#000000")
		.style("stroke-width","2px");
	};

export function change_centre(d,colRange) {
	colRange = colRange.split(',');
	var el=d3.select("#"+d);
	var data=el[0][0].__data__	
	drawRegionalMap(data,colRange)
}