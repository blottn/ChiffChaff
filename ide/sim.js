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
            this.nodes[name] = new node(() => this.ctx[name],name);
            this.nodes[name].stepText = 'default';
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
    Object.values(ent.architecture.logic).map((logic) => {
        let split = logic.split('=');

        let lhs = split[0].split('.')[1];
        if (!(lhs in this.nodes)) { // this likely wont happen
            console.error('oh no this one generated it?');
            this.nodes[lhs] = new node(new Function(logic),lhs);
        }
        else {
            this.nodes[lhs].stepText = logic
            this.nodes[lhs].step = new Function(logic);
        }
        let rhs = split[1];

        let parents = rhs.split(' ').map((tok) => tok.split('.'))
                                    .filter((item) => item.length == 2)
                                    .map((list) => list[1])
                                    .map((p) => {
                                        if (! (p in this.nodes)) {
                                            // is it possible this will be hit?
                                            console.error('oh i do have to think about this');
                                        }
                                        this.nodes[p].children.push(lhs);
                                    });

    });

    this.step = function() {
        let nf = []
        this.frontier.map((node) => {
            this.nodes[node].step.call(this.ctx);
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

function node(step, n, internalData) {
    this.step = step;
    this.name = n;
    this.data = internalData;
    this.children = [];
}

t_data
g = new graph(t_data.ha, {'fa':t_data.fa, 'ra':t_data.ra});
console.log('Completed initialisation\n');
console.log('DEBUG- simulation:');
g.step();
g.step();
console.log(g.ctx);
