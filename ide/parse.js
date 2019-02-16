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

function stripComments(txt,callback) {
    return txt.split('\n').map((line) => line.split(primitives.COMMENT_START)[0])
                          .join('\n');
}

function getEntities(txt) {
    let partParsed = {
        entities : [] 
    };
    
    let entity = new RegExp(primitives.ENTITIY_START);
    
}

function parse(txt) {
    let obj = {};
    //TODO change to be more functional
    let commentless = stripComments(txt);
    let partParsed = getEntities(commentless);
}

readFromFile('./ra.vhdl', parse);
