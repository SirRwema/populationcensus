queue()
    .defer(d3.json, "/censusdata/perdistrict")
    .defer(d3.json, "static/geojson/ug-all.geo.json")
    .await(makeGraphs);

function makeGraphs(error, censusJson, districtsJson) {
	var populationCensusProject = censusJson;

	var ndx = crossfilter(populationCensusProject);

	//assigning dc.js dimensions
	var urbanTypeDim = ndx.dimension(function(d) {return d["urban"];});
	var ruralTypeDim =  ndx.dimension(function(d) {return d["rural"];});
	var householdDim =  ndx.dimension(function(d) {return d["household"];});
	var regionDim = ndx.dimension(function(d){return d["region"];});
	var nonehouseholdDim =  ndx.dimension(function(d) {return d["household"];});
	var maleDim = ndx.dimension(function(d){return d["male"];});
	var femaleDim = ndx.dimension(function(d){return d["females"];});
	var districtDim = ndx.dimension(function(d) {return d["district"];});
	var dictrict = ndx.dimension(function(d) {return d["district"];});
	var totalpopulationDim = ndx.dimension(function(d){return d["total"];});

	//assigning data groups
	var all = ndx.groupAll();
	var numPopulationByHousehold = householdDim.group();
	var numPopulationByNonHousehold = nonehouseholdDim.group();
	var numPopulationByRegion = regionDim.group();
	var numPopulationByRural = ruralTypeDim.group();
	var numPopulationByUrban = urbanTypeDim.group();
	var numPopulationByMale = maleDim.group();
	var numPopulationByFemale = femaleDim.group();
	var totalpopulationByDist = districtDim.group().reduceSum(function(d){
		return d["total"];
	});
	var totalpopulationByRegion = regionDim.group().reduceSum(function(d){
		return d["total"];
	});
	var totalpopulation = ndx.groupAll().reduceSum(function(d) {return d["total"];});

	var max_districts = totalpopulationByDist.top(1)[0].value;
	var minDate = 100;
	var maxDate = 3000000;
	

	//defining our charts from dc.js
	var pchart = dc.pieChart("#donut-chart");
	var percentageLevelChart = dc.rowChart("#percentage-type-row-chart");
	var householdLevelChart = dc.rowChart("#district-level-row-chart");
	var ugChart = dc.geoChoroplethChart("#ug-chart");
	var districtname = dc.numberDisplay("#district-name-nd");
	var totalpopulationND = dc.numberDisplay("#total-population-nd");

	//passing charts all necessary parameters

	districtname
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d;})
		.group(all);

	totalpopulationND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalpopulation)
		.formatNumber(d3.format(".3s"));

	pchart
		.height(220)
		//.width(350)
		.radius(90)
		.innerRadius(40)
		.transitionDuration(1000)
		.dimension(regionDim)
		.group(totalpopulationByRegion);

    householdLevelChart
    	.width(300)
    	.height(250)
    	.dimension(regionDim)
    	.group(totalpopulationByRegion)
    	.xAxis().ticks(4);

    percentageLevelChart
    	.width(300)
    	.height(250)
    	.dimension(regionDim)
    	.group(totalpopulationByRegion)
    	.xAxis().ticks(4);

    ugChart.width(800)
    	.height(300)
    	.dimension(districtDim)
    	.group(totalpopulationByDist)
    	.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
    	.colorDomain([0, 200])
    	.overlayGeoJson(censusJson["features"],"District" ,function(d){
    		return d.properties.name;

    	})
    	.projection(d3.geo.albersUsa()
    		.scale(600)
    		.translate([340, 150]))

    	.title(function(p){
    		return "District: " +p["key"]
    			+"\n"
    			+"Total Population: " + Math.round(p["value"]) ;

         
    	});
	dc.renderAll();
};