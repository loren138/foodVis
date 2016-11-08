
// ID for each state, row and column starts at 0,0
var stateGrid = {
"ME" : { "state": "ME", "row": 0, "col": 11 },
"AK" : { "state": "AK", "row": 1, "col": 0 },
"VT" : { "state": "VT", "row": 1, "col": 9 },
"NH" : { "state": "NH", "row": 1, "col": 10 },
"MA" : { "state": "MA", "row": 1, "col": 11 },
"WA" : { "state": "WA", "row": 2, "col": 1 },
"MT" : { "state": "MT", "row": 2, "col": 2 },
"ND" : { "state": "ND", "row": 2, "col": 3 },
"SD" : { "state": "SD", "row": 2, "col": 4 },
"MN" : { "state": "MN", "row": 2, "col": 5 },
"WI" : { "state": "WI", "row": 2, "col": 6 },
"MI" : { "state": "MI", "row": 2, "col": 7 },
"NY" : { "state": "NY", "row": 2, "col": 9 },
"CT" : { "state": "CT", "row": 2, "col": 10 },
"RI" : { "state": "RI", "row": 2, "col": 11 },
"OR" : { "state": "OR", "row": 3, "col": 1 },
"ID" : { "state": "ID", "row": 3, "col": 2 },
"WY" : { "state": "WY", "row": 3, "col": 3 },
"NE" : { "state": "NE", "row": 3, "col": 4 },
"IA" : { "state": "IA", "row": 3, "col": 5 },
"IL" : { "state": "IL", "row": 3, "col": 6 },
"IN" : { "state": "IN", "row": 3, "col": 7 },
"OH" : { "state": "OH", "row": 3, "col": 8 },
"PA" : { "state": "PA", "row": 3, "col": 9 },
"NJ" : { "state": "NJ", "row": 3, "col": 10 },
"CA" : { "state": "CA", "row": 4, "col": 0 },
"NV" : { "state": "NV", "row": 4, "col": 1 },
"UT" : { "state": "UT", "row": 4, "col": 2 },
"CO" : { "state": "CO", "row": 4, "col": 3 },
"KS" : { "state": "KS", "row": 4, "col": 4 },
"MO" : { "state": "MO", "row": 4, "col": 5 },
"KY" : { "state": "KY", "row": 4, "col": 6 },
"WV" : { "state": "WV", "row": 4, "col": 7 },
"DC" : { "state": "DC", "row": 4, "col": 8 },
"MD" : { "state": "MD", "row": 4, "col": 9 },
"DE" : { "state": "DE", "row": 4, "col": 10 },
"AZ" : { "state": "AZ", "row": 5, "col": 2 },
"NM" : { "state": "NM", "row": 5, "col": 3 },
"OK" : { "state": "OK", "row": 5, "col": 4 },
"AR" : { "state": "AR", "row": 5, "col": 5 },
"TN" : { "state": "TN", "row": 5, "col": 6 },
"VA" : { "state": "VA", "row": 5, "col": 7 },
"NC" : { "state": "NC", "row": 5, "col": 8 },
"HI" : { "state": "HI", "row": 6, "col": 0 },
"TX" : { "state": "TX", "row": 6, "col": 3 },
"LA" : { "state": "LA", "row": 6, "col": 4 },
"MS" : { "state": "MS", "row": 6, "col": 5 },
"AL" : { "state": "AL", "row": 6, "col": 6 },
"GA" : { "state": "GA", "row": 6, "col": 7 },
"SC" : { "state": "SC", "row": 6, "col": 8 },
"FL" : { "state": "FL", "row": 7, "col": 7 }
};

var selectedStates = {};
var stateIDs = Object.getOwnPropertyNames(stateGrid);
// select states start with "M"
stateIDs.forEach(function(stateID) {
	selectedStates[stateID] = stateID.startsWith("M");
});

var xScale, yScale, xDomain, yDomain;

var height = 240;
var width = 360;

var svg = d3.select("#plotMap").append("svg")
.attr("height", height)
.attr("width", width);

var mapStartPt = {X: 0, Y: 0}
var stateWidth = 29;
var gap = 1;
var legendStartPt = {X: 107, Y: 832};
var legendWidth = 30;
var legendHeight = 11;

// draw legend of the map
//var legendColor = d3.scale.threshold()
//    .domain([50, 100, 150, 200, 250, 300])
//    .range(["#9dc7e4","#82a9c7","#678aa6","#566f86","#304862", "#152740"]);

// Draw the title of the map
//var titleStartPt = {X:0, Y: 0}
//var maptitle = svg.append("text")
//                .attr("x", titleStartPt.X)
  //              .attr("y", titleStartPt.Y)
    //            .attr("class", "title")
      //          .text("Shipment Weight by State, 2012");
    
// draw the states map
var stateGroup = svg;
    //.append("g")
      //          .attr("transform", function () {
        //            return "translate(" + mapStartPt.X + "," + mapStartPt.Y + ")"; });

var stateXScale = d3.scale.linear().domain([0,11]).range([0, 11 * (stateWidth + gap)]);
var stateYScale = d3.scale.linear().domain([0,7]).range([0, 7 * (stateWidth + gap)]);

var stateGroups = stateGroup.selectAll("g").data(stateIDs)
    .enter().append("g").attr('id', function(stateID) {
        return 'stateMap'+stateID;
    })
    .attr("transform", function (stateID) {
            return "translate(" + stateXScale(stateGrid[stateID].col) + "," 
            + stateYScale(stateGrid[stateID].row) + ")"; });

var stateRects = stateGroups.append("rect")
    .attr("width", stateWidth)
    .attr("height", stateWidth)
    .style("fill", function (stateID) 
                    { if (selectedStates[stateID]) { return "#152740"; } 
                      else { return "#9dc7e4"; } } );

stateRects.on("click", function (stateID) {
	// select (or unselect) the state
	selectedStates[stateID] = ! selectedStates[stateID]
	// Update the color of the state box
	stateRects.style("fill", function (stateID) 
                            { if (selectedStates[stateID]) { return "#152740"; } 
                            else { return "#9dc7e4"; } } );
});

stateGroups.append("text")
    .attr("class", "stateID")
    .style("pointer-events", "none")
    .attr("x", stateWidth / 2)
    .attr("y", stateWidth / 2)
    .text(function (d) { return d; });