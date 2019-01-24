// Test Data

var t_data = require('./data.js');
var namer = require('./name.js');


function graph(ent, kinds, prefix, ctx) {
    this.ent = ent;
    this.ctx = {};
    
    // TODO get rid of this.
    this.nodes = {};
    // represents values that can change in the next cycle
    // this should probably initially be all values
    this.frontier = [];

    this.roots = [];

    // TODO condense and compartmentalise this into helper functions
    // initial node creation
    [ent.i, ent.o, ent.architecture.signals].map((set) => {
        Object.keys(set).map((name) => {
            // initialise values in context
            if (name in ent.i) {
                this.nodes[name] = createDefaultNode(name);
                this.nodes[name].state = ent.i[name];
            }
            else {
                this.nodes[name] = new node({
                    name : name,
                    logic : () => {}
                });
                if (name in ent.architecture.logic) {
                    let logic = ent.architecture.logic[name];
                    this.nodes[name].logic = logic.combiner;
                    logic.depends.map((p) => {
                        this.nodes[name].parents[p] = this.nodes[p];
                        this.nodes[p].children.push(this.nodes[name]);
                    });
                }
                if (name in ent.o) {
                    this.nodes[name].state = ent.o[name];
                }

                if (name in ent.architecture.signals) {
                    this.nodes[name].state = ent.architecture.signals[name];
                }
            }
        });
    });
    
    Object.keys(ent.architecture.internals || {}).map((name) => {
        let descriptor = ent.architecture.internals[name];

        let sub_entity = new graph(kinds[descriptor.kind]);
        this.nodes[name] = new node({
            name : name,
            logic : sub_entity,
            descriptor : ent.architecture.internals[name]
        });
        // add as child correctly
        descriptor.depends.map((p) => {
            this.nodes[name].parents[p] = this.nodes[p];
            this.nodes[p].children.push(this.nodes[name]);
        });
    });
    this.step = function() {
        let nf = [];
        this.frontier.map((node) => {
            let unstable = node.step(this.ctx);
            // new unstable nodes
            unstable.map((n) => {
                if (!n.isPrimitive()) {
                    let descriptor = this.ent.architecture.internals[n.name];
                    Object.keys(descriptor.input_map).filter((key) => {
                        // Mark it as unstable
                    });
                }
                if (!(nf.includes(n))) {
                    nf.push(n);
                }
            });
        });
        // return the items in the frontier that changed
        this.frontier = nf;
        return this.frontier.filter((x) => { return Object.keys(this.ent.o).includes(x)});
    }

    this.restim = () => { // adds children of inputs to frontier
        this.frontier = this.frontier.concat(Object.keys(ent.i)
                .map((name) => this.nodes[name].children)
                .reduce((acc, current) => acc.concat(current))
                .filter((val, ind, arr) => arr.indexOf(val) == ind));
    }
    this.restim();
}

function node(opts) {
    this.opts = opts;
    this.logic = opts.logic;
    
    this.name = opts.name;
    this.state;

    this.children = [];
    this.parents = {};
    this.step = function(ctx) {

        // return children that need an update (for new frontier);
        let cs = this.children;

        if (this.logic instanceof Function) {
            this.state = this.logic.call(this.parents);
        }
        else {
            let changed = this.logic.step();

            // map changed to correct names
            var cc = changed.map((item) => {
                let name = this.opts.descriptor.output_map[item];
                // set the value
                ctx[name] = this.logic.ctx[item];
                return name;
            });

            // sub entity is stable
            if (this.logic.frontier.length > 0) {
                cc.push(this.name);;
            }
            cs = cc;
        }
        return cs;
    }

    this.isPrimitive = function() {
        return this.logic instanceof Function;
    }
}

function createDefaultNode(name) {
    return new node({name : name, logic : function() {
        // this can probably be scrapped
        return this.children;
    }});
}

g = new graph(t_data.ha_new, {'fa':t_data.fa, 'ra':t_data.ra});
console.log('Completed initialisation\n');
console.log('DEBUG- simulation:');
console.log(g.step());
console.log(g.nodes['a'].children);
console.log('############## end step 1');
console.log('changed outputs next and then frontier: ');
console.log(g.step());
console.log('############## end step 2');
console.log('changed outputs next and then frontier: ');
console.log(g.step());
console.log('############## end step 3');
console.log(g.step());
console.log('############## end step 4');
