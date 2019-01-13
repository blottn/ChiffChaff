// Test Data

var t_data = require('./data.js');

function graph(ent, kinds) {
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
        this.nodes[name] = new node(() => {this.data.step()},name,sub_entity);
        // add as child correctly 

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
            this.nodes[node].step(this.ctx);
            Object.keys(this.nodes[node].children).map((n) => {
                if (!(nf.includes(this.nodes[node].children[n]))) {
                    nf.push(this.nodes[node].children[n]);
                }
            });
        });
        this.frontier = nf;
    }

    // TODO change this to adding children of inputs
    this.restim = () => {
        this.frontier = this.frontier.concat(Object.keys(ent.i));
    }

    this.restim();
}

function node(combiner, n, internalData) {
    this.combiner = combiner;
    this.name = n;
    this.data = internalData;
    this.children = [];
    this.step = function (ctx) {
        ctx[this.name] = this.combiner.call(ctx);
    }
}

function createDefaultNode(name) {
    return new node(function() {
        return this[name];
    }, name);
}

g = new graph(t_data.ha, {'fa':t_data.fa, 'ra':t_data.ra});
console.log('Completed initialisation\n');
console.log('DEBUG- simulation:');
console.log(g.ctx);
g.step();
console.log(g.ctx);
g.step();
console.log(g.ctx);
