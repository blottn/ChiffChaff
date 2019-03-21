// file reader for testing:
const fs = require('fs');
const symbols = require('./symbols.js');
const program = require('./grammar.js');

function readFromFile(path, handler) {
    fs.readFile(path, 'utf8', function(err, contents) {
        if (err)
            console.log(err);
        handler(contents);
    });
}

function stripComments(txt) {
    return txt.split('\n')
        .map((line) => line.split(symbols.COMMENT_START)[0])
        .join('\n');
}

function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    console.log(JSON.stringify(program.parse(commentless).ast));
    
}

readFromFile('./ra.vhdl', parse);
