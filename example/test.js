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