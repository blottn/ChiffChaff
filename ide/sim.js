// Test Data

var t_data = require('./data.js');

function graph(ent, kinds) {
    this.ent = ent;
    this.ctx = {};
    this.nodes = {};
    // represents values that can change in the next cycle
    // this should probably initially be all values
    this.frontier = []; 

    Object.values([ent.i, ent.o, ent.architecture.signals]).map((set) => {
        Object.keys(set).map((name) => {
            this.nodes[name] = createDefaultNode(name);
            // initialise values in context
            if (name in ent.i) {
                this.ctx[name] = ent.i[name]
            }
            if (name in ent.architecture.signals) {
                this.ctx[name] = ent.architecture.signals[name];
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
            this.nodes[p].children.push(name);
        });
    });

    // link the nodes
    Object.keys(ent.architecture.logic).map((name) => {
        let logic = ent.architecture.logic[name];
        this.nodes[name].combiner = logic.combiner;
        logic.depends.map((p) => {
            this.nodes[p].children.push(name);
        });
    });

    this.step = function() {
        let nf = []
        this.frontier.map((node) => {
            let unstable = this.nodes[node].step(this.ctx);
            unstable.map((n) => {
                if (!(nf.includes(n))) {
                    nf.push(n);
                }
            });
        });
        // return the items in the frontier that changed
        this.frontier = nf;
        return this.frontier.filter((x) => { return Object.keys(this.ent.o).includes(x)});
    }

    // TODO change this to adding children of inputs
    this.restim = () => {
        this.frontier = this.frontier.concat(Object.keys(ent.i));
    }

    this.restim();
}

function node(opts) {
    this.opts = opts;
    this.logic = opts.logic;
    this.name = opts.name;
    this.children = [];
    
    this.step = function(ctx) {
        if (this.logic instanceof Function) {
            ctx[this.name] = this.logic.call(ctx);
        }
        else {
            this.logic.step();
        }

        // return children that need an update (for new frontier);
        let cs = this.children;

        if ( !(this.logic instanceof Function)) {
            let changed = this.logic.step();
            console.log('sub entity changed outputs: ');
            console.log(changed);

            // map changed to correct names
            console.log(changed);
            console.log('into:');
            var cc = changed.map((item) => {
                let name = this.opts.descriptor.output_map[item];
                // set the value and add to frontier?
                ctx[name] = this.logic.ctx[item];
                return name;
            });
            console.log(cc);

            // sub entity is stable
            if (this.logic.frontier.length > 0) {
                return [this.name];
            }

        }
        return cs;
    }
}

function createDefaultNode(name) {
    return new node({name : name, logic : function() {
        return this.children;
    }});
}

g = new graph(t_data.ra, {'fa':t_data.fa, 'ra':t_data.ra});
console.log('Completed initialisation\n');
console.log('DEBUG- simulation:');
g.step();
console.log('############## end step 1');
g.step();
console.log('############## end step 2');
console.log(g.frontier);
g.step();
console.log('############## end step 3');
