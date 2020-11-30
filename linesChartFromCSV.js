const d3 = require('d3')
const jsdom = require('jsdom')
const fs = require('fs')

// use csv-parse instead of d3.csv because it requires fetch function implemented into browsers but not nodejs
const parse = require('csv-parse')

const { JSDOM } = jsdom
const { document } = (new JSDOM('')).window

exports.generate = (csvfile, svgfile) => {

  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 50, bottom: 100, left: 50},
  width = 1200 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const body=d3.select(document).select('body')
  const svg = body.append('svg')
  .attr('xmlns', 'http://www.w3.org/2000/svg')
  .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');
  
  // load and parse data.csv file
  // timestamp, serieA, serieB, serieC, ...
  // to
  // [ {id: serieA, values: [ {date: 123, value: 456}, ...] }, {id: serieB, values: ...}, ... ]
  let file=''
  try{
    file=fs.readFileSync(csvfile)
  }catch(err){
    console.log(err.message)
    process.exit(1)
  }

  let head=[]
  parse(file,{columns: header => head=header},(err,data)=>{

    if (err) throw err;
    
    // init tags array
    let tags = []

    // format the data
    data.forEach(function(d) {
      d.hrtime = +d.hrtime
      d.rss = +d.rss
      d.heapTotal = +d.heapTotal
      d.heapUsed = +d.heapUsed
      d.external = +d.external
      d.arrayBuffers = +d.arrayBuffers
      // if tag not empty, push to tags array
      if(d.tag!=='')
        tags.push(d)
    });
    
    // console.log(data)

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { 
      return d.hrtime; 
    }));
    y.domain([0, d3.max(data, function(d) {
      return Math.max(d.rss, d.heapTotal, d.heapUsed, d.external, d.arrayBuffers); 
    })]);

    // set the colour scale
    var color = d3.scaleOrdinal(d3.schemeDark2);

    legendSpace = width/head.length; // spacing for the legend

    head.slice(1).forEach((h,i)=>{
      if(h!='tag'){
        // Add the line paths
        svg.append('path')
          .data([data])
          .attr('class', 'line')
          .style('stroke', function() { // Add the colours dynamically
            return color(h); })
          .style('stroke-width', '2px')
          .style('fill', 'none')
          .attr('d', d3.line()
            .x(function(d) { return x(d.hrtime); })
            .y(function(d) { return y(d[h]); }));
  
        // Add the Legend
        svg.append('text')
          .attr('x', (legendSpace/2)+i*legendSpace)  // space legend
          .attr('y', height + (margin.bottom/2)+ 5)
          // .attr('class', 'legend')    // style the legend
          .style('fill', function() { // Add the colours dynamically
              return color(h); })
          .text(h);
      } else {

        // console.log(tags)

        // Add the tag lines
        svg.selectAll('tags')	
          .data(tags)			
          .enter().append('line')
          .style('stroke', 'red')
          .style('stroke-width', 3)
          .style('stroke-dasharray','10,10')
          .attr('x1', function(d) { return x(d.hrtime); })
          .attr('y1', 0)
          .attr('x2', function(d) { return x(d.hrtime); })
          .attr('y2', height)

        svg.selectAll('tags-label')	
          .data(tags)
          .enter().append('text')
          .attr('x', function(d) { return x(d.hrtime); })
          .attr('y', 0)
          .text(function(d) { return d.tag; });
      }
    })

    // Add the X Axis
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .append('text')
      .attr('transform', 'translate(' + width+ ', 10)')
      .attr('dy', '.75em')
      .attr('y', 6)
      .style('text-anchor', 'end')
      .text('Time')
      .style('fill', '#2b2929')
      .style('font-family', 'Georgia')
      .style('font-size', '120%');

    // Add the Y Axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('dy', '.75em')
      .attr('y', 6)
      .style('text-anchor', 'end')
      .text('KBytes')
      .style('fill', '#2b2929')
      .style('font-family', 'Georgia')
      .style('font-size', '120%');

    try{
      fs.writeFileSync(svgfile, body.html())
    }catch(err){
      console.log(err.message)
      process.exit(1)
    }
  })
}
