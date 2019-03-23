let parse = require('./parse.js');
let editor = require('./editor.js');
let data = require('./data.js');

window.onload = function() {
    let ed = editor.init('editor');
    ed.setValue(data.sampleVHDL);
    console.log(parse(ed.getValue()));
}

