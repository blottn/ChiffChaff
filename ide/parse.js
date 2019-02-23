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
    
    let entity_regex;


    entity_regex = new RegExp('entity\\s([A-Za-z]+\\w*)\\sis\\sPort(.*)(?=end\\s\\1)','gsm');
    with(primitives) {
        // find all signatures

        let input = txt;
        let ent_desc;
        while (ent_desc = entity_regex.exec(input)) {
            console.log(ent_desc[0]);
        }
        
   /*     while (input != '' && input.indexOf(ENTITY_START >= 0)) {
            let start = input.indexOf(ENTITY_START) + ENTITY_START.length;
            if (start < input.length) {
                 
            }
            else {
                // fail parsing expected entity name
            }
        }*/
    }

}

function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    let partParsed = getEntities(commentless);
}

readFromFile('./ra.vhdl', parse);
