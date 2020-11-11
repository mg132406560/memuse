const d3 = require('d3')
const jsdom = require('jsdom')
const fs = require('fs')

// use csv-parse instead of d3.csv because it requires fetch function implemented into browsers but not nodejs
const parse = require('csv-parse')

const { JSDOM } = jsdom
const { document } = (new JSDOM('')).window

exports.generate = (csvfile, svgfile) => {

  const body=d3.select(document).select('body')
  
  const width = 960
  const height = 500
  const margin = 5
  const padding = 5
  const adj = 30
  
  // add svg
  const svg = body.append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '-'
          + adj + ' -'
          + adj + ' '
          + (width + adj *3) + ' '
          + (height + adj*3))
    .style('padding', padding)
    .style('margin', margin)
    .classed('svg-content', true);
  
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
  parse(file,(err,data)=>{
    
    const header=data[0]
    const slices = header.slice(1).map((item,index) => {
      return {
          id: item,
          values: data.slice(1).map((d) => {
              return {
                date: +d[0],
                measurement: +d[index+1] //'+' convert to num
              }
          })
      }
    })
  
    // console.log(JSON.stringify(slices))
  
    // adjust scales to svc size
    const xScale = d3.scaleLinear().range([0,width])
    const yScale = d3.scaleLinear().rangeRound([height, 0])
  
    // set scales with min and max values
    xScale.domain(d3.extent(data.slice(1),(d)=>{
      return d[0]
    }))
    yScale.domain([(0), d3.max(slices, (c) => {
      return d3.max(c.values, (d) => {
        return d.measurement+4
      })
    })])
  
    // apply scales to axis
    // ticks by number of values
    const yaxis = d3.axisLeft()
      .ticks(10)
      .scale(yScale) 
    // ticks by number of days
    const xaxis = d3.axisBottom()
      .ticks((data[0].slice(1)).length)
      .scale(xScale)
  
    // add axis to svg
    // move xaxis to bottom
    // and rotate labels
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xaxis)
      .selectAll('text')
      .attr('transform', 'rotate(-65)')
      .style('text-anchor', 'end')
    // rotate yaxis 90deg
    svg.append('g')
      .attr('class', 'axis')
      .call(yaxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('dy', '.75em')
      .attr('y', 6)
      .style('text-anchor', 'end')
      .text('KBytes')
    // axis style
    svg.selectAll('.axis text')
      .style('fill', '#2b2929')
      .style('font-family', 'Georgia')
      .style('font-size', '120%')
  
    svg.selectAll('.axis line')
      .style('stroke', '#706f6f')
      .style('stroke-width', 0.5)
      .style('shape-rendering', 'crispEdges')
  
    svg.selectAll('.axis path')
      .style('stroke', '#706f6f')
      .style('stroke-width', 0.7)
      .style('shape-rendering', 'crispEdges')
  
    // define line function
    const line = d3.line()
      .x(function(d) { return xScale(d.date) })
      .y(function(d) { return yScale(d.measurement) })
  
    // bind data to lines 
    const lines = svg.selectAll('lines')
      .data(slices)
      .enter()
      .append('g')
  
    // generate unique id for each lines set (path)
    let id = 0;
    const ids = function () {
      return 'line-'+id++;
    }    
  
    // add each line to its own lines set (path)
    lines.append('path')
      .attr('class', ids)
      .attr('d', function(d) { 
        return line(d.values)
      })
    
    // paths styles
    svg.select('path.line-0')
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width','2')
  
    svg.select('path.line-1')
      .style('fill', 'none')
      .style('stroke', 'steelblue')
      .style('stroke-dasharray', 2)
      .style('stroke-width','2')
  
    svg.select('path.line-2')
      .style('fill', 'none')
      .style('stroke', 'steelblue')
      .style('stroke-dasharray', 6)
      .style('stroke-width','2')
    
    svg.select('path.line-3')
      .style('fill', 'none')
      .style('stroke', 'steelblue')
  
    svg.select('path.line-4')
      .style('fill', 'none')
      .style('stroke', 'steelblue')
  
    // add text at the end of each lines set to identify the serie
    lines.append('text')
      .attr('class','serie_label')
      .datum((d) => {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]
        } 
      })
      .attr('transform', (d) => {
        // return 'translate(' + (xScale(timeConv(d.value.date)) + 10)  
        //       + ',' + (yScale(d.value.measurement) + 5 ) + ')'
        return 'translate(' + (xScale(d.value.date) + 10)  
        + ',' + (yScale(d.value.measurement) + 5 ) + ')'
      })
      .attr('x', 5)
      .text((d) => { 
        return d.id;
      })
    // serie name style
    svg.selectAll('text.serie_label')
      .style('fill', '#2b2929')
      .style('font-family', 'Georgia')
      .style('font-size', '80%')
    try{
      fs.writeFileSync(svgfile, body.html())
    }catch(err){
      console.log(err.message)
      process.exit(1)
    }
  })
}
