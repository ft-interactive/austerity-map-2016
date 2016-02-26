import d3 from 'd3';

//code based on Caroline Nevitt’s d3.module 4 exercise
export function drawmaps (mapData,colDomain) {
	colDomain = colDomain.split(',');
	var svg = d3.select("#mapHolder")
	.html("")
	var margin = {top: 10, right: 10, bottom: 10, left: 18};
	var width = (document.getElementById('mapHolder').getBoundingClientRect().width)-margin.left - margin.right;
	var height=width*1.3;

	//Define map projection
	var projection = d3.geo.mercator()
						   .center([ -3, 55.7])
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
		.attr("width", width)
		.attr("height", height);

	//Load in GeoJSON data
	d3.json("data/authorities2.json", function(json) {
	//Merge the constituency data and GeoJSON into a single array
	//Loop through once for each Living wage data value
	for (var i = 0; i < mapData.length; i++) {

		//Grab ConstituencyID
		var dataConstituencyName = mapData[i].id;
		
		//Grab data value, and convert from string to float
		var dataValue = +mapData[i].value;
		//console.log(dataConstituencyName,dataValue)

		//Find the corresponding ConstituencyID inside the GeoJSON
		for (var j = 0; j < json.features.length; j++) {
		
			//We'll check the official ISO country code
			var jsonConstituencyName = json.features[j].properties.name;
			//console.log(jsonConstituencyName)

			if (dataConstituencyName == jsonConstituencyName) {
		
				//Copy the data value into the GeoJSON
				json.features[j].properties.value = dataValue;
				
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
	   .on("click", regional);


	// svg.append("g")
    //             .attr("class", "legendLinear")
    //             .attr("transform", "translate(30, 50)");
            
    //     var legendLinear = d3.legend.color()
    //         .shapeWidth(20)
    //         .shapeHeight(20)
    //         .labels(["0-10", "10-20", "20-30", "30-40", "40-50"])
    //         .labelAlign("start")
    //         .orient("vertical")
    //         .title("Percentage of employee jobs below living wage")
    //         .ascending(false)
    //         .scale(color);
        
    //     svg.select(".legendLinear")
    //         .call(legendLinear);

	function colourLookup(d){
		console.log(d.id)
		var value = lookup[d.id].value
		if(value == 'x') return '#fff1e0';
		return color(value);

	};

	function regional(d){
		console.log(d.properties.name);
		var coords = d3.select("#"+d.properties.name).node().getBoundingClientRect();
		console.log("coords ",coords);



		// var ops = projection.scale()/width;
		// 		var opth = projection.translate()[0];
		// 		var optv = projection.translate()[1];
		// 		console.log(ops,opth,optv);

		//Define second map projection
		console.log("width etc",(width/2), (height/2) )
		var newProjection = d3.geo.mercator()
			.center(projection.invert([(coords.left+coords.right)/2,(coords.top+coords.bottom)/4]))
			//.center([ -3, 54.6])
			.scale(width*30)
			.translate([ width/4, height/4 ])
			.rotate([0, 0]);
		//Define path generator
		var newPath = d3.geo.path()
					 .projection(newProjection);

		var regionalsvg = d3.select("#regionHolder")
			.html("")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		regionalsvg.selectAll("path")
		   .data(json.features)
		   .enter()
		   .append("path")
		   .attr("d", newPath)
		   .attr("id", function (d) { return "new"+d.properties.name})
		   .attr("fill","#ccc2c2")
		   .style("stroke","#fff1e0")
		   .style("stroke-width","1px");

		var highlight=d3.select("#new"+d.properties.name)
			.attr("fill","#bb6d82")

		var coords = highlight.node().getBoundingClientRect();
		console.log("coords ",coords);

		regionalsvg
			.style('left', (coords.left+coords.right)+'px')
			.style('top', 100+'px');



	};

});




}