/*  Filename: chiffchaff.js
    Directory: src/
    Author: Nicholas Blott
    Email: blottn@tcd.ie
    Description: The parser's second pass, converts the ast into something usable.
*/

const program = require('./grammar.js');
const {Sim : Sim} = require('./sim.js');

function strip(txt) {
    return txt.split('\n')
        .map((line) => line.split('--')[0])
        .join('\n');
}

// execute second pass of parser
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
            if (!(arch_ast.def.kind in kinds)) {
                let ent = {
                    i: {},
                    o: {},
                    architecture: {
                        internals: {},
                        signals: {},
                        logic: {}
                    }
                };
                kinds[arch_ast.def.kind] = ent;
            }

            ent = kinds[arch_ast.def.kind];

            let out = buildPreStats(ent, arch_ast.pre_stat);
            
            buildPostStats(out, arch_ast.post_stat);
        }
    }
    return kinds;
}


// build statements from before a begin in an architecture
function buildPreStats(ent, preStats) {
    let out = {
        ent: ent,
        components: {}
    };

    for (stat of preStats) {
        if (stat.type === 'component') {
            let comp_ast = stat.contents;
            out.components[comp_ast.kind] = comp_ast.mapping;
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
            for (let i = 0 ; i < names.length; i++) {
                let name = names[i];
                if (type.type === 'vector') {
                    ent.architecture.signals[name.name] = Array.from(initial_val);
                }
                else {
                    ent.architecture.signals[name.name] = initial_val;
                }
            }
        }
    }
    return out;
}

// flattens an expression tree into valid js
function flattenExpr(tree) {
    if (tree.invert) {
        return '(1^' + flattenExpr(tree.val) + ')';
    }
    if (tree.combiner) {
        return '( ' + flattenExpr(tree.left)
            + ' '
            + tree.combiner
            + ' '
            + flattenExpr(tree.right) + ' )';
    }
    else {
        return tree.name;
    }
}

// finds names in a tree
function findDependencies(tree) {
    if (tree.combiner) {
        return findDependencies(tree.left).concat(findDependencies(tree.right));
    }
    else if (tree.invert) {
        return findDependencies(tree.val);
    }
    else {
        return [tree.name];
    }
}

// constructs statements after begin in architecture
function buildPostStats(ctx, postStats) {
    ent = ctx.ent;
    comps = ctx.components;
    for (stat of postStats) {
        if (stat.kind === 'combinatorial') {
            let step = stat;
            let depends = findDependencies(step.rhs);
            let exprString = flattenExpr(step.rhs);
            let expr = exprString.replace(/AND/g, ' && ')
                .replace(/XOR/g, ' ^ ')
                .replace(/NOT/g, ' ! ')
                .replace(/OR/g, ' || ')
                .replace(/[A-Za-z]+\w*(?:\((\d+)\))?/g, (name, index) => {
                    return 'inputs.' 
                        + name 
                        + '.state' 
                        + (index ? '[' + index + ']' : '');
                });
            // construct js from string
            ent.architecture.logic[step.lhs] = {
                depends: Array.from(new Set(depends)),
                combiner: new Function('inputs', 'return ' + expr + ' ;')
            };
        }
        else if (stat.kind === 'component') {
            let mappings = comps[stat.type];
            ent.architecture.internals[stat.name] = {
                kind: stat.type,
                depends: [],
                input_map : {},
                output_map : {}
            };
            let depends = [];
            for (var i = 0; i < stat.map.length ; i++) {
                let map_set;
                if (mappings[i].dir === 'in') {
                    map_set = ent.architecture.internals[stat.name].input_map;
                    depends.push(mappings[i].name);
                } else if (mappings[i].dir === 'out') {
                    map_set = ent.architecture.internals[stat.name].output_map;
                }
                map_set[mappings[i].name] = stat.map[i].name;
            }
            ent.architecture.internals[stat.name].depends = Array.from(new Set(depends));
        }
    }
}

function parse(txt) {
    return build(program.parse(strip(txt)).ast);
}

module.exports = parse;
