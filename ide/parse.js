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
            let arch_ast = item.contents;

            // init if it doesn't exist
            if (!(arch_ast.def.name in kinds)) {
                let ent = {
                    i: {},
                    o: {},
                    architecture: {
                        internals: {},
                        signals: {},
                        logic: {}
                    }
                };
                kinds[arch_ast.def.name] = ent;
            }

            ent = kinds[arch_ast.def.name];

            buildPreStats(ent, arch_ast.pre_stat);
            buildPostStats(ent, arch_ast.post_stat);
        }
    }
}

function buildPreStats(ent, preStats) {
    for (stat of preStats) {
        if (stat.type === 'component') {
            let comp_ast = stat.contents;
            console.log(comp_ast);
        }
        else if (stat.type === 'signal') {
            let signal_ast = stat.contents;
            let type = signal_ast.right;
            let initial_val = 0;
            if (type.type === 'vector') {
                initial_val = [];
                for (let i = 0; i < type.high ; i++) {
                    initial_val.push(0);
                }
            }
            let names = signal_ast.left;
            for (name of names) {
                ent.architecture.signals[name.name] = initial_val;
            }
        }
    }
    return ent;
}

function buildPostStats(ent, postStats) {
    for (stat of postStats) {
        if (stat.kind === 'combinatorial') {

        }
        else if (stat.kind === 'component') {

        }
    }
}

function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    build(program.parse(commentless).ast);
}

readFromFile('./ra.vhdl', parse);
