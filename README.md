# memuse
![npm](https://img.shields.io/npm/v/memuse)
![npm bundle size](https://img.shields.io/bundlephobia/min/memuse)

Javascript library to record memory utilization statistics (rss,heapTotal,heapUsed,external,arrayBuffers) and generate a lines chart svg file.
You can add a tag to the statistics whenever you need into your code so you could easily locate which piece of code is running when polling the statistics.
## Usage:
```
// load the library
const memuse=require('memuse')
// or if you want to reuse accross all your code
global.memuse=require('memuse')

// create an empty file to record statistics
memuse.init('./mem.csv')

// append a new line to the file with current statistics
memuse.poll()

// generate lines chart into SVG file
memuse.end('./mem.svg')
```
Here is an example:

```
const memuse=require('memuse')
const randomstring = require('randomstring')

memuse.init('./mem.csv')

let array=[]
for (let index = 0; index < 10000; index++) {
    array[index]=randomstring.generate(32)
    memuse.poll()
}

memuse.tag('start deletion')

for (let index = 0; index < 10000; index++) {
    array.splice(index)
    memuse.poll()
}

memuse.end('./mem.svg')
```

Which produce:

![alt text](./example/mem.svg)