# memuse
This module purpose is to record memory utilization statistics (rss,heapTotal,heapUsed,external,arrayBuffers) and generate a lines chart svg file.
```
// global.memuse=require('../../memuse')
const memuse=require('../memuse')

memuse.init('./mem.csv')

memuse.poll()

memuse.end('./mem.svg')
```