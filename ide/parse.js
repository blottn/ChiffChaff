// file reader for testing:
var fs = require('fs');

function readFromFile(path, handler) {
    fs.readFile(path, 'utf8', function(err, contents) {
        if (err)
            console.log(err);
        handler(contents);
    });
}

function stripComments(txt) {
    
}

function parse(txt) {
    console.log(txt);
    let obj = {};
    stripComments(txt);
}

readFromFile('./ra.vhdl', parse);
