const ast = require('./ast.js');
const {Terminal : Terminal, Empty: Empty} = require('vernac');

class Ident {
    constructor(name) {
        this.name = name;
    }
}

// bit of utility
const ignore = (r) => r.ast.left;
const one_space = new Terminal('\\s+');
const zero_space = new Terminal('\\s*');

// primitive items
const ident = new Terminal('[A-Za-z]+\\w*', ast.Ident.builder);
const direction = new Terminal('in').or(new Terminal('out'), ast.Dir.builder);
const logic_type = new Terminal('STD_LOGIC');
const vector_type = new Terminal('STD_LOGIC_VECTOR')
    .then(zero_space, ignore)
    .then('\\(',ignore)
    .then('\\s*',ignore)
    .then('\\d+')
    .then('\\s+', ignore)
    .then('downto', ignore)
    .then('\\s+', ignore)
    .then('\\d+')
    .then('\\)', ignore)
    .listen((res) => {
        return {
            type: 'vector',
            high: res.ast.left.left.right,
            low: res.ast.left.right
        };
    });

const type = vector_type.or(logic_type);


// Entity
const port_item = ident
    .then('\\s+', ignore)
    .then(':', ignore)
    .then('\\s+', ignore)
    .then(direction)
    .then('\\s+', ignore)
    .then(type, (r) => {
        return {
            name : r.ast.left.left.name,
            dir : r.ast.left.right.dir,
            type : r.ast.right
        };
    });

const port_contents = port_item
    .then(new Terminal('\\s*;\\s*')
    .then(port_item, (r) => r.ast.right)
    .times(0), (res) => {
        return [res.ast.left].concat(res.ast.right);
    });

const entity = new Terminal('entity')
    .then('\\s+', ignore)
    .then(ident, (r) => r.ast.right)
    .then('\\s+', ignore)
    .then('is', ignore)
    .then('\\s+', ignore)
    .then('Port', ignore)
    .then('\\s*', ignore)
    .then('\\(\\s*', ignore)
    .then(port_contents)
    .then('\\s*\\)\\s*;', ignore);


//architecture
const comma_separated_names = ident
    .then(
        new Terminal('\\s*,\\s*')
            .then(ident, (r) => r.ast.right)
            .times(0)
    )
    .listen((r) => [r.ast.left].concat(r.ast.right));

const signal_decl = new Terminal('signal\\s+')
    .then(comma_separated_names, (r) => r.ast.right)
    .then('\\s*:\\s*', ignore)
    .then(type);

const architecture = new Terminal('\\s*architecture\\s*')
    .then(ident, (r) => r.ast.right)
    .then('\\s+of\\s+', ignore)
    .then(ident)
    .then('\\s+is\\s+', ignore)
    .then('begin\\s+', ignore)
    .then('end', ignore);

console.log(signal_decl.parse('signal asdf, abc : STD_LOGIC'));
