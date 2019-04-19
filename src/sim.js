/*  Filename: chiffchaff.js
    Directory: src/
    Author: Nicholas Blott
    Email: blottn@tcd.ie
    Description: The simulator, creates a graph representing the VHDL 
                 entity to be simulated.
*/

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
        
        // create sub graph
        this.sub_ents[name] = new graph(kinds[descriptor.kind], kinds);
    });

    // link in the sub entities
    Object.keys(this.sub_ents).map((name) => {
        let current = this.sub_ents[name];
        let descriptor = ent.architecture.internals[name];

        // tether inputs with nodes in parent graph
        current.inputs = current.inputs.map((input) => {
            let new_node = this.nodes[descriptor.input_map[input.name]];
            new_node.children = new_node.children.concat(input.children);
            // remap the parents
            input.children.map((child) => {
                child.parents[input.name] = new_node;
            });
            return new_node;
        });
        
        // tether outputs with nodes in parent graph
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

    
    
    // step each node, add their children to a new frontier
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
        
        // assign new states only after completed a pass
        this.frontier.map((node) => node.changeState());
        
        // return the items in the frontier that changed
        this.frontier = nf;
        return this.frontier;
    }

    // mark an input as unstable (add children to frontier)
    this.flipped = function(node) {
        let nf = this.frontier.map(n => n);
        node.children.map((c) => {
            if (!(nf.includes(c))) {
                nf.push(c);
            }
        });
        this.frontier = nf;
    }

    this.restim = () => { // adds children of inputs to frontier
        this.frontier = this.frontier.concat(this.inputs
                                .map((input) => input.children)
                                .reduce((acc, current) => acc.concat(current))
                                .filter((val, ind, arr) => arr.indexOf(val) == ind));
    }

    // debug
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

// node constructor
function node(opts) {
    this.id = id += 1;

    this.logic = opts.logic;
    this.name = opts.name;
    this.state = opts.state;
    
    this.children = [];
    this.parents = {};
    this.callback;

    this.step = function() {
        this.nextState = this.logic(this.parents);
        if (this.callback)
            this.callback(this.state); // callback for visualiser
        return this.children;
    }

    this.changeState = function() {
        if (this.nextState != undefined) {
            this.state = this.nextState;
        }
    }

    this.toString = function() { // debugger
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

 // wraps graph in some util functions
class Sim {
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
        if (name in this.ctx) {
            this.graph = new graph(this.ctx[name], this.ctx);
            this.graph.restim();
        }
    }

    debug() {
        console.log(Object.values(this.graph.nodes).map(stateName));
        console.log(this.graph.frontier.map(stateName));
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

module.exports = {
    Sim: Sim
};
