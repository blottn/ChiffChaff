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

function build(ast) {
    let kinds = {};
    for (item of ast) {
        if (item.type === 'entity') {
            // build entity
            let entity_ast = item.contents;
            let ent = {
                i: {},
                o: {},
                architecture: {
                    internals: {},
                    signals: {},
                    logic: {}
                }
            };
            for (mapping of entity_ast.mappings) {
                let dir = mapping.dir === 'in' ? 'i' : 'o';
                if (mapping.type.type === 'logic') {
                    ent[dir][mapping.name] = 0;
                }
                else {
                    let initial = [];
                    for (var i = 0; i <= mapping.type.high; i++) {
                        initial.push(0);
                    }
                    ent[dir][mapping.name] = initial;
                }
            }
            kinds[entity_ast.def] = ent;
        }
        else if (item.type === 'architecture') {
            console.log(item.contents);
        }
    }
}

function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    console.log(program.parse(commentless));
    build(program.parse(commentless).ast);
}

readFromFile('./fa.vhdl', parse);
