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
    let entities = {};

    // TODO move these to primitives
    let entity_start = 'entity';
    let name_regex = '([A-Za-z]+\\w*)';
    let is_port = 'is\\sPort\\s*\\(\\s*';
    let params = '(.*)';
    let end = '(?=\\);\\s*end\\s*\\1\\s*;)'
    let entity_regex = new RegExp('(?<='
                            + entity_start
                            + '\\s+'
                            + name_regex
                            + '\\s+'
                            + is_port
                            +')'
                            + params
                            + end, 'gsm');
    // find all signatures

    let input = txt;
    let ent_desc;
    while (ent_desc = entity_regex.exec(input)) {
        let ent_name = ent_desc[1];
        let descriptor = {
                          'in' : {},
                          'out' : {}};

        let vector_type = 'STD_LOGIC_VECTOR'
                            + '(?='
                            + '\\s*\\((\\d)\\sdownto\\s(\\d)\\)'
                            + ')';
        let memoryless_v_type = 'STD_LOGIC_VECTOR\\s*\\((?:\\d)\\sdownto\\s(?:\\d)\\)'

        let logic_type = 'STD_LOGIC'
        let item ='\\s*'
                  + name_regex
                  + '\\s+'
                  + ':'
                  + '\\s+'
                  + '(in|out)'
                  + '\\s+'
                  + '(' + vector_type + '|' + logic_type + ')';
        let memoryless_item ='\\s*'
                  + '(?:[A-Za-z]+\\w*)'
                  + '\\s+'
                  + ':'
                  + '\\s+'
                  + '(?:in|out)'
                  + '\\s+'
                  + '(?:' + memoryless_v_type + '|' + logic_type + ')';
        let itemiser = new RegExp(item + '(?=;' + memoryless_item + '|' + '\\s*)','gsm');
        while(res = itemiser.exec(ent_desc[0])) {
            let io_name = res[1];
            let io_kind = res[2];
            let io_type = res[3];
            // TODO check valid

            if (io_type === 'STD_LOGIC') {
                descriptor[io_kind][io_name] = 0; // set to default value
            }
            if (io_type === 'STD_LOGIC_VECTOR') {
                let first = res[4];
                let last = res[5];
                let size = first - last;
                // init arr
                descriptor[io_kind][io_name] = {val : [],
                                                first : first,
                                                last : last};
                for (let i = 0; i < size ; i++) {
                    descriptor[io_kind][io_name].val.push(0);
                }
            }
        }
        entities[ent_name] = descriptor;
    }
    return entities;
}


function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    let partParsed = getEntities(commentless);
    console.log(partParsed);
}

readFromFile('./ra.vhdl', parse);
