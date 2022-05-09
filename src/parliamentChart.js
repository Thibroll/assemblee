
import * as d3 from 'd3';

const metric = "id";

export default ({dataUrl, width=800}) => {
  let svg = d3.create('svg');
  let parliament = parliamentChart();
  d3.csv(dataUrl).then((response) => svg.datum(response).call(parliament));
  return svg.innerHTML;
}

function parliamentChart(){
  // util
  function series(s, n) { var r = 0; for (var i = 0; i <= n; i++) { r+=s(i); } return r; }
  
  /* params */
  var width,
    height,
    innerRadiusCoef = 0.4,
    colorMap = d3.schemeCategory10;
  
  function parliament(datum){
    datum.each(generateParliament);
  }

  function generateParliament(data){
    width = width ? width : this.width.baseVal.value;
    height = height ? height : this.height.baseVal.value;
    console.log(width);

    const outerParliamentRadius = Math.min(width/2, height);
    const innerParliementRadius = outerParliamentRadius * innerRadiusCoef;
    const seatCount = data.length;

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
    var seatPositions = [];
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

    let svg = d3.select(this);

    /* helpers to get value from seat data */
    var seatX = function(d,i) { return seatPositions[i].cartesian.x + width / 2; };
    var seatY = function(d,i) { return seatPositions[i].cartesian.y + + outerParliamentRadius; };
    var seatRadius = function(d) { return innerRadiusCoef * rowWidth; };
    var seatColor = (d) => (d3.scaleOrdinal().domain(data.map(x=>x[metric])).range(colorMap))(d[metric]);
  
    data = data.sort(function(a,b){return d3.ascending(a[metric], b[metric])});
    const seats = svg.selectAll("seat").data(data, d=>d.id);

    //events
    var handleMouseOver =  (event)=>{};
    var handleMouseOut = (event)=>{};
    
    const seatsEnter = seats
      .enter()
      .append('circle')
      .attr('class', 'seat')
      .attr("cx", seatX)
      .attr("cy", seatY)
      .attr("r", seatRadius)
      .attr("fill", seatColor)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  }

  parliament.colorMap = function(value){
    if (!arguments.length) return colorMap;
    colorMap = value;
    return parliament;
  }

  parliament.innerRadiusCoef = function(value) {
    if (!arguments.length) return innerRadiusCoef;
    innerRadiusCoef = value;
    return parliament;
  };

  return parliament;
}