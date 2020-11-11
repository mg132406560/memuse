'use strict';

const fs=require('fs')
const path=require('path')
const chart=require('./linesChartFromCSV')

let csvfile=''

const init = (file) => {

    csvfile = path.resolve(file)

    const header='hrtime,rss,heapTotal,heapUsed,external,arrayBuffers\n'

    try{
        fs.writeFileSync(csvfile, header)
    }catch(err){
        console.log(err.message)
        process.exit(1)
    }
    
}

const poll = () => {
    
    try{
        fs.appendFileSync(csvfile,
            process.hrtime.bigint()+','+
            (Math.round(process.memoryUsage().rss/1024/1024*100)/100)+','+
            (Math.round(process.memoryUsage().heapTotal/1024/1024*100)/100)+','+
            (Math.round(process.memoryUsage().heapUsed/1024/1024*100)/100)+','+
            (Math.round(process.memoryUsage().external/1024/1024*100)/100)+','+
            (Math.round(process.memoryUsage().arrayBuffers/1024/1024*100)/100)
            +'\n');
    }catch(err){
        console.log(err.message)
        process.exit(1)
    }
    
}

const end = (file) => {
    
    const svgfile = path.resolve(file)
    
    chart.generate(csvfile,svgfile)
}

module.exports = {init, poll, end}