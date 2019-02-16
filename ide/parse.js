// file reader for testing:
var fs = require('fs');
var primitives = require('./primitives.js');

function readFromFile(path, handler) {
    fs.readFile(path, 'utf8', function(err, contents) {
        if (err)
            console.log(err);
        handler(contents);
    });
}

function stripComments(txt) {
    return txt.split('\n').map((line) => line.split(primitives.COMMENT_START)[0])
                          .join('\n');
}

function parse(txt) {
    let obj = {};
    let commentless = stripComments(txt);

}

readFromFile('./ra.vhdl', parse);
