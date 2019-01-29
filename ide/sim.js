// Test Data

var t_data = require('./data.js');


function graph(ent, kinds) {
    this.ent = ent;
    
    // this should probably initially be all values
    this.frontier = [];
    this.inputs = [];

    this.nodes = {};

    // first create placeholder nodes
    [ent.i, ent.o, ent.architecture.signals].map((set) => {
        Object.keys(set).map((name) => {
            this.nodes[name] = new node({
                name : name,
                state : set[name],
                logic : function() {
                    return this.children;
                }
            });
        });
    });

    // go back over and tie them all together
    Object.keys(ent.architecture.logic).map((name) => {
        ent.architecture.logic[name].depends.map((par) => {
            this.nodes[par].children.push(this.nodes[name]);
            this.nodes[name].parents[par] = this.nodes[par];
        });
        this.nodes[name].logic = ent.architecture.logic[name].combiner;
    });

    // create inputs list
    Object.keys(ent.i).map((input) => {
        inputs.push(this.nodes[input]);
    });

    // TODO fix this to link directly into the graph should probably happen before node linking to avoid undef pointers
    Object.keys(ent.architecture.internals || {}).map((name) => {
        let descriptor = ent.architecture.internals[name];

        let sub_entity = new graph(kinds[descriptor.kind], kinds);

        nodes[name] = new node({
            name : name,
            logic : sub_entity,
            descriptor : ent.architecture.internals[name]
        });

        // add as child correctly
        descriptor.depends.map((p) => {
            nodes[name].parents[p] = nodes[p];
            nodes[p].children.push(nodes[name]);
        });
    });

    this.step = function() {
        console.log(this.frontier);
        let nf = [];
        this.frontier.map((node) => {
            let unstable = node.step();
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
        console.log(this.frontier);
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
    this.state = opts.state;

    this.children = [];
    this.parents = {};
    this.step = function() {

        // return children that need an update (for new frontier);
        let cs = this.children;

        if (this.logic instanceof Function) {
            this.state = this.logic(this.parents);
        }
        else {
            let changed = this.logic.step();

            // map changed to correct names
            var cc = changed.map((item) => {
                let name = this.opts.descriptor.output_map[item];
                // set the value
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
console.log('############## end step 1');
console.log('changed outputs next and then frontier: ');
console.log(g.step());
console.log('############## end step 2');
console.log('changed outputs next and then frontier: ');
console.log(g.step());
console.log('############## end step 3');
console.log(g.step());
console.log('############## end step 4');
