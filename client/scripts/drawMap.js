import d3 from 'd3';

var mapJSON = {};
var colours= ([ "#f4d4c1","#efb1af", "#e3726b", "#a64d67"]);
var selected
//code based on Caroline Nevitt’s d3.module 4 exercise
export function drawmaps (mapData,colDomain, firstRun) {
	//Sets the first regional map as Blackburn on setup
	if (firstRun==true) {
		selected= "E06000008"//Change this code to alter the default local authority
	}
	colDomain = colDomain.split(',');
	var svg = d3.select("#mapHolder")
	.html("")
	var margin = {top: 10, right: 0, bottom: 10, left: 18};
	var width = (document.getElementById('national').getBoundingClientRect().width)-margin.left - margin.right;
	var height=(width*1.25);
	document.getElementById('national').style.height=height+45+"px";

	//Define map projection
	if (width<300){
		var centreX=-5.5
	}
	else {var centreX=-4.5}
	var projection = d3.geo.mercator()
						   .center([ centreX, 55.4])
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
			var sum20102016 = mapData[i].summary20102016;
			var sum20102021 = mapData[i].summary20102021;
			var sum20162021 = mapData[i].summary20162021;

			//Find the corresponding ConstituencyID inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
				//We'll check the official ISO country code
				var jsonConstituencyName = json.features[j].properties.name;
				//console.log(jsonConstituencyName)
				if (dataConstituencyName == jsonConstituencyName) {
					//Copy the data values into the GeoJSON
					json.features[j].properties.value = dataValue;
					json.features[j].properties.authName = authName;
					json.features[j].properties.sum20102016 = sum20102016;
					json.features[j].properties.sum20102021 = sum20102021;
					json.features[j].properties.sum20162021 = sum20162021;

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

	function setupRegion(authcode) {
			var el=d3.select("#"+authcode);
			var data=el[0][0].__data__
			drawRegionalMap(data,colDomain)

	}

	function drawLegend(colDomain){
		var mobilewidth = (document.getElementById('national').getBoundingClientRect().width)-margin.left - margin.right;
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
					if ((i<3) && (mobilewidth>300)) {
						return "less than £"+Number(colDomain[i])
					}
					if ((i<3) && (mobilewidth<300)) {
						return "< £"+Number(colDomain[i])
					}
					if ((i<=3) && (mobilewidth>300)) {
						return "more than £"+Number(colDomain[i-1])
					}
					if ((i<=3) && (mobilewidth<300)) {
						return "> £"+Number(colDomain[i-1])
					}
				});
		}
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
	//Fills in dynamic name fields above map and case study block
	var name=d.properties.authName
	var div=d3.select("#dynamicName")
		.html(name);
	div=d3.select("#nameholder")
		.html(name);
	//set variables for summaries to pas to draw dynamic text function
	var sum1016=d.properties.sum20102016;
	var sum1021=d.properties.sum20102021;
	var sum1621=d.properties.sum20162021;
	//Create hmtl for the #dynamicBody using the summaryText function
	var html=summaryText(sum1016,sum1021,sum1621,name)
	//insert html into #dynamicBody div
	div=d3.select("#dynamicBody")
		.html(html);
	//console.log(d.properties)

	function summaryText (sum1016,sum1021,sum1621,name){
		console.log("Summaries ",sum1016,sum1021,sum1621)
		return `
			<div id=class="studybody">${name+" is estimated to have lost a total of £"+sum1016.pa+" a year for each working-age adult as a result of the pre-2015 reforms and is anticipated to lose a further £"+sum1621.pa+" a year for each working-age adult as a result of the post-2015 reforms by 2021."}</div>
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
      scale = .9 / Math.max(dx / natWidth, dy / (natHeight-45)),
      translate = [natWidth / 2 - scale * x, (natHeight-45) / 2 - scale * y];

	//Define path generator
	// var newPath = d3.geo.path()
	// 			 .projection(newProjection);

	var regionalsvg = d3.select("#regionHolder")
		.html("")
		.append("svg")
		.attr("width", natWidth)
		.attr("height", natHeight-45);

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

	//put black stroke around selected authority on regional map
	var highlight=d3.select("#new"+d.properties.name)
		.style("stroke","#000000")
		.style("stroke-width",2/scale + "px");
	
	//Make sure that this is in the fron t of the other paths so that the border shows all the way round
	highlight.moveToFront();
	var svg = d3.select("#GB");
	var districts = svg.selectAll("path")
		.style("stroke","#fff1e0")
		.style("stroke-width","0px");

	//put black stroke around selected authority on national map
	highlight=d3.select("#"+d.properties.name)
		.style("stroke","#000000")
		.style("stroke-width","2px");
	};

//Tkes a regiona code and selects the path then passes the bound data to the draw regional map function
export function change_centre(d,colRange) {
	colRange = colRange.split(',');
	var el=d3.select("#"+d);
	var data=el[0][0].__data__	
	drawRegionalMap(data,colRange)
}