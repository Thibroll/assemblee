
import * as d3 from 'd3';
import { path } from 'd3';
import { stackOffsetDiverging } from 'd3';


export  default()=>{
  // util
  function series(s, n) { var r = 0; for (var i = 0; i <= n; i++) { r+=s(i); } return r; }
  function sortData(data, param) {return data.sort(function(a,b){return d3.ascending(a[param], b[param])});}
  function randn(n, i)  {return n * ((Math.random()) ** i) * 2 / i; }
  
  /* params */
  var width = 800,
    height = 600,
    innerRadiusCoef = 0.4,
    colorMap = d3.schemePaired,
    metric = "id";

  /* inner variables */
  var seatPositions = [],
    svg, chartDiv, seatsEnter, seatX, seatY, seatRadius, seatColor, outerParliamentRadius, innerParliementRadius, seatCount;
  
  function parliament(datum){
    datum.each(generateParliament);
  }

  function generateParliament(data){
    outerParliamentRadius = Math.min(width/2, height);
    innerParliementRadius = outerParliamentRadius * innerRadiusCoef;
    seatCount = data.length;

    //Computation of parliament seats
    //positions of the seats inside the parliament
    var nRows = 0;
    var maxSeatNumber = 0;
    var b = 0.5;
    (function() {
      var a = innerRadiusCoef / (1 - innerRadiusCoef);
      while (maxSeatNumber < seatCount) {
        nRows++;
        b += a;
        /* NOTE: the number of seats available in each row depends on the total number
        of rows and floor() is needed because a row can only contain entire seats. So,
        it is not possible to increment the total number of seats adding a row. */
        maxSeatNumber = series(function(i) { return Math.floor(Math.PI * (b + i)); }, nRows-1);
      }
    })();
    const rowWidth = (outerParliamentRadius - innerParliementRadius) / nRows;
    (function() {
      var seatsToRemove = maxSeatNumber - seatCount;
      for (var i = 0; i < nRows; i++) {
        var rowRadius = innerParliementRadius + rowWidth * (i + 0.5);
        var rowSeats = Math.floor(Math.PI * (b + i)) - Math.floor(seatsToRemove / nRows) - (seatsToRemove % nRows > i ? 1 : 0);
        var anglePerSeat = Math.PI / rowSeats;
        for (var j = 0; j < rowSeats; j++) {
          var s = {};
          s.polar = {
            r: rowRadius,
            teta: -Math.PI + anglePerSeat * (j + 0.5)
          };
          s.cartesian = {
            x: s.polar.r * Math.cos(s.polar.teta),
            y: s.polar.r * Math.sin(s.polar.teta)
          };
          seatPositions.push(s);
        }
      };
    })();
  
    /* sort the seats by angle */
    seatPositions.sort(function(a,b) {
      return a.polar.teta - b.polar.teta || b.polar.r - a.polar.r;
    });

    /* helpers to get value from seat data */
    seatX = function(d,i) { return seatPositions[i].cartesian.x + width / 2; };
    seatY = function(d,i) { return seatPositions[i].cartesian.y + outerParliamentRadius; };
    seatRadius = function(d) { return innerRadiusCoef * rowWidth; };
    seatColor = (d) => (d3.scaleOrdinal().domain(data.map(x=>x[metric])).range(colorMap))(d[metric]);
  
    //create div for parliament svg and legend
    chartDiv = d3.select(this)
      .append("div").attr("id", "assembleeChart");

    //initiate svg
    svg = chartDiv.append("svg");
    svg.attr("id", "assembleSvg")
      .attr("width", width).attr("height", height);

    // create a tooltip
    var tooltip = d3.select(this)
      .append("div")
        .style("visibility", "hidden")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("width", "fit-content")
        .style("padding", "5px")
        .style("position", "absolute");

    //events
    var handleMouseOver = (event)=>{
      tooltip
        .style("visibility", "visible");
      d3.select(event.target)
        .style("stroke", "black");
    };
    var handleMouseMove = (event)=>{
      var data = event.target.__data__;
      tooltip
        .html(data.civ + ' ' + data.prenom + ' ' + data.nom + '<br>' +
        data.groupe + '<br>' +
        data.age + ' ans<br>' + 
        data.departementNom  + ' (' + data.departementCode + ')<br>' +
        data.job)
        .style("left", (event.pageX+15+"px"))
        .style("top", (event.pageY+15+"px"));
    };
    var handleMouseLeave = (event)=>{
      tooltip
        .style("visibility", "hidden");
      d3.select(event.target)
        .style("stroke", "none");
    };

    data = sortData(data, metric);
    let seats = svg.selectAll(".seat");

    // generate seats
    seatsEnter = seats
      .data(data, function(d){ return d.id;})
      .enter()
      .append('circle')
        .attr('class', 'seat')
        .attr("cx", seatX)
        .attr("cy", seatY)
        .attr("r", seatRadius)
        .attr("fill", seatColor)
        .each((d,i) => d.sourceCoordinates = seatPositions[i])
         .on("mouseover", handleMouseOver)
         .on("mousemove", handleMouseMove)
         .on("mouseleave", handleMouseLeave);

    legend();

  }

  function legend(){
    var legendMargin = {top: 30, right: 30, bottom: 100, left: 60},
      legendWidth = width - legendMargin.left - legendMargin.right,
      legendHeight = height - legendMargin.top - legendMargin.bottom;

    d3.select('#legendSvg').remove();
    var legend = chartDiv.append("svg").attr("id", "legendSvg").attr('width', width).attr('height', height)
      .append("g").attr("transform",
      "translate(" + legendMargin.left + "," + legendMargin.top + ")");

    let data = svg.selectAll(".seat").data();
    let legendData = d3.rollups(data, v => v.length, d => d[metric]);
    legendData = sortData(legendData, 0);

    var x = d3.scaleBand()
    .range([ 0, legendWidth ])
    .domain(legendData.map(d => d[0]))
    .padding(0.2);
    legend.append("g")
    .attr("transform", "translate(0," + legendHeight + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    var y = d3.scaleLinear()
    .domain([0, Math.max(...legendData.map(d => d[1])) + 5])
    .range([ legendHeight, 0]);
    legend.append("g")
    .call(d3.axisLeft(y));

    legend.selectAll("mybar")
    .data(legendData)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d[0]); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return legendHeight - y(d[1]); })
      .attr("fill", (d) => d3.scaleOrdinal().domain(data.map(x=>x[metric])).range(colorMap)(d[0]));
  }

  parliament.width = function(value){
    if (!arguments.length) return width;
    width = value;
    return parliament;

  };  parliament.height = function(value){
    if (!arguments.length) return height;
    height = value;
    return parliament;
  };

  parliament.colorMap = function(value){
    if (!arguments.length) return colorMap;
    colorMap = value;
    return parliament;
  };

  parliament.innerRadiusCoef = function(value) {
    if (!arguments.length) return innerRadiusCoef;
    innerRadiusCoef = value;
    return parliament;
  };

  parliament.metric = function(value) {
    if (!arguments.length) return metric;
    metric = value;
    if (seatsEnter){
      let data = seatsEnter.data();
      data = sortData(data, metric);
      let seats = svg.selectAll(".seat")
        .data(data, function(d){ return d.id;});

      seats
      .transition()
        .delay((d,i) => randn(300,1))
        .duration((d,i) => randn(1000, 1))
        .tween("transform", function(d,i) {
          let line = d3.path();
          line.arc(width/2, outerParliamentRadius, d.sourceCoordinates.polar.r, d.sourceCoordinates.polar.teta, 
            seatPositions[i].polar.teta, d.sourceCoordinates.polar.teta > seatPositions[i].polar.teta);
          var path = svg.append("path")
            .attr("d", line)
            .style("stroke", "none")
            .style("fill", "none");
          
          var length = path.node().getTotalLength();
          var r = d3.interpolate(0, length); 
          let moveFct = function(t){
            var point = path.node().getPointAtLength(r(t)); 
            d3.select(this)
              .attr("cx", point.x) 
              .attr("cy", point.y)
          }
          path.remove();
          d.sourceCoordinates = seatPositions[i];
          return moveFct;
        })
      .attr("fill", seatColor)
      .transition()
      .delay((d,i) => randn(300,1))
       .duration((d,i) => randn(700, 1))
       .attr("cx", seatX)
       .attr("cy", seatY);

      legend();
    }
    return parliament;
  };
  
  return parliament;
}
