import d3 from 'd3';

//code based on Caroline Nevitt’s d3.module 4 exercise
export function drawmaps (mapData) {
	var svg = d3.select("#mapHolder")
	.html("")
	var margin = {top: 10, right: 10, bottom: 10, left: 18};
	var width = (document.getElementById('mapHolder').getBoundingClientRect().width)-margin.left - margin.right;
	var height=width*1.5;

	//Define map projection
	var projection = d3.geo.mercator()
						   .center([ -3, 55.5])
						   .translate([ width/2, height/2 ])
						   .scale([ width/0.25 ]);

	//Define path generator
	var path = d3.geo.path()
					 .projection(projection);

	//colour range will eventually be loaded from bertha as will vary for each information range loaded
	var color = d3.scale.threshold()
    .domain([0.02, 0.05, 0.08, 0.20, 0.30])
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
		   .attr("fill",function (d) { return color(d.properties.value)});

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

		});




}