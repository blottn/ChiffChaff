let data = require('./data.js');
function graph(ent, kinds) {
    this.ent = ent;
    
    // this should probably initially be all values
    this.frontier = [];

    this.inputs = [];
    this.outputs = [];

    this.nodes = {};

    // first create placeholder nodes
    [ent.i, ent.o, ent.architecture.signals].map((set) => {
        Object.keys(set).map((name) => {
            this.nodes[name] = new node({
                name : name,
                state : set[name],
                logic : function() {
                    return this.state; // default to no change
                }
            });
        });
    });

    // create inputs list
    Object.keys(ent.i).map((input) => {
        this.inputs.push(this.nodes[input]);
    });

    // create outputs list
    Object.keys(ent.o).map((input) => {
        this.outputs.push(this.nodes[input]);
    });

    // link together primary nodes
    Object.keys(ent.architecture.logic).map((name) => {
        ent.architecture.logic[name].depends.map((par) => {
            this.nodes[par].children.push(this.nodes[name]);
            this.nodes[name].parents[par] = this.nodes[par];
        });
        this.nodes[name].logic = ent.architecture.logic[name].combiner;
    });


    this.sub_ents = {};

    // generate the sub entities
    Object.keys(ent.architecture.internals || {}).map((name) => {
        let descriptor = ent.architecture.internals[name];
        this.sub_ents[name] = new graph(kinds[descriptor.kind], kinds);
    });

    // link in the sub entities
    Object.keys(this.sub_ents).map((name) => {
        let current = this.sub_ents[name];
        let descriptor = ent.architecture.internals[name];

        // tether inputs
        current.inputs = current.inputs.map((input) => {
            let new_node = this.nodes[descriptor.input_map[input.name]];
            new_node.children = new_node.children.concat(input.children);
            // remap the parents
            input.children.map((child) => {
                child.parents[input.name] = new_node;
            });
            return new_node;
        });
        
        // tether outputs
        current.outputs = current.outputs.map((old_out) => {
            let new_node = this.nodes[descriptor.output_map[old_out.name]];
            new_node.parents = old_out.parents;
            Object.keys(old_out.parents).map((p_name) => {
                par = old_out.parents[p_name];
                par.children = par.children.map((child) => {
                    if (child.id == old_out.id)
                        return new_node;
                    else
                        return child;
                });
            });
            new_node.logic = old_out.logic;
            return new_node;
        });
    });

    
    
    this.step = function() {
        let nf = [];
        this.frontier.map((node) => {
            let unstable = node.step();
            // new unstable nodes
            unstable.map((n) => {
                if (!(nf.includes(n))) {
                    nf.push(n);
                }
            });
        });
        // return the items in the frontier that changed
        this.frontier = nf;
        return this.frontier;
    }

    this.flipped = function(node) {
        console.log('destablizing: ' + node.name);
        console.log(this.frontier.map(stateName));
        let nf = this.frontier.map(n => n);
        if (!(nf.includes(node))) {
            nf.push(node)
        }
        console.log(nf.map(stateName));
        this.frontier = nf;
    }

    this.restim = () => { // adds children of inputs to frontier
        this.frontier = this.frontier.concat(this.inputs
                                .map((input) => input.children)
                                .reduce((acc, current) => acc.concat(current))
                                .filter((val, ind, arr) => arr.indexOf(val) == ind));
    }

    this.toString = (prefix = '') => {
        let txt = prefix + 'state:\n';
        txt += prefix + 'nodes:\n';
        Object.keys(this.nodes).map((name) => {
            let node = this.nodes[name];
            txt += prefix + '' + node.toString();
        });
        
        txt += prefix + 'sub entities:\n';
        Object.keys(this.sub_ents).map((name) => {
            txt += prefix + this.sub_ents[name].toString('\t' + name + ': ');
            txt += '\n';
        });
        
        return txt;
    }
}

// uhoh globals
let id = -1;

function node(opts) {
    this.id = id += 1;

    this.logic = opts.logic;
    this.name = opts.name;
    this.state = opts.state;
    
    this.children = [];
    this.parents = {};
    this.callback;

    this.step = function() {
        this.state = this.logic(this.parents);
        if (this.callback)
            this.callback(this.state);
        return this.children;
    }

    this.toString = function() {
        return '' + this.id + ' ' + this.name + ' ' + this.state + '\n';
    }

    this.onStep = function(callback) {
        this.callback = callback;
    }
}

// helper
function getter(key) {
    return this.graph.nodes[key];
}

class Sim{
    constructor(name, ctx) {
        this.ctx = ctx;
        this.name = name;
        if (name in this.ctx) {
            this.graph = new graph(ctx[name], ctx);
            this.graph.restim();
        }
    }

    step() {
        return this.graph.step();
    }

    use(name) {
        console.log('using: ' + name);
        if (name in this.ctx) {
            this.graph = new graph(this.ctx[name], this.ctx);
            this.graph.restim();
        }
    }

    debug() {
        console.log(Object.values(this.graph.nodes).map(stateName));
    }

    getInputs() {
        return Object.keys(this.graph.ent.i).map(getter.bind(this));
    }

    getOutputs() {
        return Object.keys(this.graph.ent.o).map(getter.bind(this));
    }

    update(timings) {
        Object.values(this.getInputs())
            .concat(Object.values(this.getOutputs()))
            .map((node) => {
                timings.update(node.name, node.state);
            });
    }

    flipped(node) {
        this.graph.flipped(node);
    }
}

function stateName(n) {
    return n.name + ': ' + n.state;
}
/*
let g = new graph(data.ra, data);
console.log(Object.values(g.nodes).map(stateName));
g.nodes['a'].state = 1;
console.log(Object.values(g.nodes).map(stateName));
g.restim();
console.log(Object.values(g.nodes).map(stateName));
g.step();
console.log(Object.values(g.nodes).map(stateName));
g.step();
g.step();
g.step();
g.step();
g.step();
let nodes = g.nodes;
let keys = Object.keys(nodes);
for (var i = 0; i < keys.length; i++) {
    let n = g.nodes[keys[i]];
  //  console.log(n.name);
 //   console.log(n.children.reduce((a, n) => {return a + ' ' + n.name + ' ' + n.id}, ''));
   // console.log('');
}

TODO remove this debug stuff
*/

module.exports = {
    Sim: Sim
};
