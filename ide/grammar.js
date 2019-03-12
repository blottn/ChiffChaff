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
const indexed = ident
    .then(new Terminal('\\s*')
        .then('\\(')
        .then('\\s*')
        .then('\\d*', r => r.ast.right)
        .then('\\s*', ignore)
        .then('\\)', ignore)
        .optionally(),
        (r) => {
            return {
                name : r.ast.left.name,
                index : r.ast.right ? r.ast.right : '0',
                type : r.ast.right ? 'vector' : 'logic'
            }
        });


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
    .then('\\s*', ignore)
    .then(':', ignore)
    .then('\\s*', ignore)
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
    .then(type)
    .then('\\s*;', ignore);

const component_decl = new Terminal('component\\s+')
    .then(ident, (r) => r.ast.right)
    .then('\\s+Port\\s*\\(\\s*', ignore)
    .then(port_contents)
    .then('\\s*\\)\\s*;\\s*end\\s+component\\s*;', (r) => {
        return {
            kind: r.ast.left.left.name,
            mapping: r.ast.left.right
        };
    });



// bit hacky for now TODO support recursive grammars in vernac
let expr;
let operator = new Terminal('\\s+').then('XOR', r => r.ast.right)
    .or(new Terminal('\\s+').then('AND', r => r.ast.right))
    .or(new Terminal('\\s+').then('XOR', r => r.ast.right))
    .or(new Terminal('\\s+').then('OR', r => r.ast.right));

let item = ident
    .or(new Terminal('\\(').then(expr, r => r.ast.right).then('\\)',ignore));

expr = item.then(
    operator
        .then('\\s+', ignore)
        .then(item, (r) => {
            return {
                combiner: r.ast.left,
                left: undefined,
                right: r.ast.right
            };
        })
        .times(0)
        .listen((r) => {
             return !r.ast.length ? {} : r.ast.reduce((acc, item) => {
                return {
                    left : acc,
                    right : item.right,
                    combiner : item.combiner
                };
            });
        }))
    .listen((res) => {
        let tree = res.ast.right;
        let current;
        for (current = tree; current.left != undefined; current = current.left) {}
        current.left = res.ast.left;
        return tree;
    });

item.second.first.second = expr; //quietly ignore this please

const combinatorial_stat = ident
    .then('\\s*<=\\s*', ignore)
    .then(expr)
    .then('\\s*;', ignore);

const comma_indexed = indexed
    .then(new Terminal('\\s*')
        .then(',')
        .then('\\s*')
        .then(indexed, r => r.ast.right)
        .times(0),
        (r) => [r.ast.left].concat(r.ast.right)
    );

const component_stat = ident
    .then('\\s*:\\s*', ignore)
    .then(ident)
    .then('\\s+', ignore)
    .then('port', ignore)
    .then('\\s+', ignore)
    .then('map', ignore)
    .then('\\s*', ignore)
    .then('\\(', ignore)
    .then('\\s*', ignore)
    .then(comma_indexed);

const stat = (new Terminal('\\s*').then(component_decl, r => r.ast.right))
    .or(new Terminal('\\s*').then(signal_decl, r => r.ast.right));

const stats = stat.times(0);

const architecture = new Terminal('\\s*architecture\\s*')
    .then(ident, (r) => r.ast.right)
    .then('\\s+of\\s+', ignore)
    .then(ident)
    .then('\\s+is\\s+', ignore)
    .then(stat.times(0))
    .then('begin\\s+', ignore)
    .then('end', ignore)
    .then('\\s+', ignore)
    .then(ident)
    .then('\\s*;', ignore);

let temp_ra = `
architecture Behavioral of Ripple_Adder is

component full_adder_vhdl_code Port ( A : in STD_LOGIC;
                                      B : in STD_LOGIC;
                                      Cin : in STD_LOGIC;
                                      S : out STD_LOGIC;
                                      Cout : out STD_LOGIC);
end component;

signal c1,c2,c3 : STD_LOGIC;

begin

FA1: full_adder_vhdl_code port map( A(0), B(0), Cin, S(0), c1);
FA2: full_adder_vhdl_code port map( A(1), B(1), c1, S(1), c2);
FA3: full_adder_vhdl_code port map( A(2), B(2), c2, S(2), c3);
FA4: full_adder_vhdl_code port map( A(3), B(3), c3, S(3), Cout);

end Behavioral;`
console.log(architecture.parse(temp_ra));

