import d3 from 'd3';

var mapJSON = {};
//code based on Caroline Nevitt’s d3.module 4 exercise
export function drawmaps (mapData,colDomain) {
	console.log(colDomain)
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
    .range([ "#d19e93", "#d36d6c", "#e9a7a7", "#b46c80"]);

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

			//Find the corresponding ConstituencyID inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
				//We'll check the official ISO country code
				var jsonConstituencyName = json.features[j].properties.name;
				//console.log(jsonConstituencyName)
				if (dataConstituencyName == jsonConstituencyName) {
					//Copy the data values into the GeoJSON
					json.features[j].properties.value = dataValue;
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
		   .on("click", function(d){
		   		drawRegionalMap(d,colDomain);
		   	});
	});
	drawLegend(svg,height,width)

	function drawLegend(legendsvg,height,width){
	var legendSpacing = 3;
	var legendRectSize = 10;
	var legend = legendsvg.selectAll('.legend')
	  .data(color.domain())
	  .enter()
	  .append('g')
	  .attr('class', 'legend')
	  .attr('transform', function(d, i) {
	    var legheight = legendRectSize + legendSpacing;
	    var xOffset = 0-height+(color.domain().length*legendRectSize/0.6);
	    if (i<3) {
	      var horz = 10;
	      var vert=10+i*(legendRectSize+(10));
	    }
	    if ((i>2)){
	      var horz = (i-3)*(legendRectSize+(width/3.4));
	      var vert=32;
	    }
	    if ((i>5)){
	      var horz = i*(legendRectSize+(width/3.4))-i*(legendRectSize+(width/3.4));
	      var vert=44;
	    }
	    return 'translate(' + horz + ',' + vert + ')';
	  });

	  legend.append('rect')
	    .attr('width', legendRectSize)
	    .attr('height', legendRectSize)
	    .style("fill", function(d) { return (color(d))})
	  legend.append('text')
	    .attr('x', legendRectSize + legendSpacing)
	    .attr('y', legendRectSize - legendSpacing+3)
	    .text(function(d) { return "<= "+d; });
	}

}
	// var DefaultAuth="E06000008"
	// drawRegionalMap(DefaultAuth,colDomain);
	// var el=d3.select("#"+d);
	// 	var data=el[0][0].__data__
	// 	drawRegionalMap(data,colRange)
	// }

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
	var html=summaryText(d.properties.summary)
	div=d3.select("#dynamicBody")
		.html(html);

	function summaryText (summary){
		console.log(summary)
		return `
			<div id=class="studybody">${"Total "+summary.total}</div>
			<div id=class="studybody">${"PA 2010-20 "+summary.pa20102020}</div>
			<div id=class="studybody">${"PA 2016-21 "+summary.pa20162021}</div>
			`;
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
    .range([ "#d19e93", "#d36d6c", "#e9a7a7", "#b46c80"]);

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