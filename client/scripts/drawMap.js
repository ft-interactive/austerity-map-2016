import d3 from 'd3';

export function drawmaps () {
	var margin = {top: 10, right: 10, bottom: 10, left: 18};
		var width = (document.getElementById('GBholder').getBoundingClientRect().width)-margin.left - margin.right;
	    var heightRatio=1.5;
  		var height=mapWidth*heightRatio;

  		//Define map projection
		var projection = d3.geo.mercator()
							   .center([ -5, 54])
							   .translate([ width/2, height/2 ])
							   .scale([ width/0.4 ]);

		//Define path generator
		var path = d3.geo.path()
						 .projection(projection);

		//Colors by Cynthia Brewer (colorbrewer2.org), YlOrRd
		var color = d3.scale.quantize()
		 	.domain([ 0, 100 ])
			.range([ "#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026",]);

		//Create SVG
		var svg = d3.select("#GBholder")
					.append("svg")
					.attr("width", width)
					.attr("height", height);

}