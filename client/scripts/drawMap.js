import d3 from 'd3';

var mapJSON = {};
//code based on Caroline Nevitt’s d3.module 4 exercise
export function drawmaps (mapData,colDomain) {
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
    .range(["#83cee4", "#76acb8", "#efd3d9", "#efb1af", "#c78b96", "#b0516c"]);

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
			var story = mapData[i].story;

			//Find the corresponding ConstituencyID inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
				//We'll check the official ISO country code
				var jsonConstituencyName = json.features[j].properties.name;
				//console.log(jsonConstituencyName)
				if (dataConstituencyName == jsonConstituencyName) {
					//Copy the data values into the GeoJSON
					json.features[j].properties.value = dataValue;
					json.features[j].properties.story = story;
					
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
		   .on("click", function(d){
		   		drawRegionalMap(d,colDomain);
		   	});
	
	});
}

export function drawRegionalMap(d, colDomain){
	console.log("Regional",d)
	//This function bring the selection to the front
	d3.selection.prototype.moveToFront = function() { 
	  return this.each(function() { 
	    this.parentNode.appendChild(this); 
	  }); 
	};
	//Fills in dynamic text
	var div=d3.select("#dynamicName")
		.html(d.properties.LAD13NM);
	div=d3.select("#nameholder")
		.html(d.properties.LAD13NM);
	div=d3.select("#dynamicBody")
		.html(d.properties.story);


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
    .range(["#83cee4", "#76acb8", "#efd3d9", "#efb1af", "#c78b96", "#b0516c"]);

	//Define path generator
	var newPath = d3.geo.path()
				 .projection(newProjection);

	var regionalsvg = d3.select("#regionHolder")
		.html("")
		.append("svg")
		.attr("width", width)
		.attr("height", height-57);

	regionalsvg.selectAll("path")
	   .data(mapJSON.features)
	   .enter()
	   .append("path")
	   .attr("d", newPath)
	   .attr("id", function (d) { return "new"+d.properties.name})
	   .attr("fill",function (d) { return color(d.properties.value)})
	   //.attr("fill","#ccc2c2")
	   .style("stroke","#fff1e0")
	   .style("stroke-width","1px")

	var highlight=d3.select("#new"+d.properties.name)
		.style("stroke","#000000")
		.style("stroke-width","2px");
	
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