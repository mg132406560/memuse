# memuse
Javascript library to record memory utilization statistics (rss,heapTotal,heapUsed,external,arrayBuffers) and generate a lines chart svg file.
## Usage:
```
// load the library
const memuse=require('../memuse')
// or if you want to reuse accross all your code
global.memuse=require('../../memuse')

// create an empty file to record statistics
memuse.init('./mem.csv')

// append a new line to the file with current statistics
memuse.poll()

// generate lines chart into SVG file
memuse.end('./mem.svg')
```