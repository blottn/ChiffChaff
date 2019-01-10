// Test Data

let ha = {
    i : {'a':1, 'b':1},
    o : {'s':0, 'c':0},
    architecture : {
        signals: {},
        logic: ['this.s=this.a ^this.b', 'this.c=this.a &this.b']
    }
};

let fa =  {
    i : {'a':0, 'b':0, 'cin':1},
    o : {'z':0, 'cout':0},
    architecture : {
        internals: {
        },
        signals: {'s':0},
        logic: ['this.s=this.a ^this.b', 'this.z=this.a ^this.b ^this.cin', 'this.cout=(this.a &&this.b )||(this.cin &&this.s )'],
    }
};

let ra =  {
    i : {'a':[0,0], 'b':[0,0], 'cin':1},
    o : {'z':[0,0], 'cout':0},
    architecture : {
        internals : {
            'fa1': {
                kind : 'fa',
                input_map : {'a':'a[0]','b':'b[0]','cin':'cin'},
                output_map : {'z':'z[0]','cout':'c[0]'}
            },
            'fa2': {
                kind : 'fa',
                input_map : {'a':'a[1]','b':'b[1]','cin':'c[0]'},
                output_map : {'z':'z[1]','cout':'cout'}
            },

        },
        signals: {'c':[0]},
        logic: []
    }
};

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
        console.log('started step');
        let nf = []
        this.frontier.map((node) => {
            console.log('stepped on ' + node + ' ' + this.nodes[node].stepText);
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


g = new graph(ha, {'fa':fa, 'ra':ra});
console.log('Completed initialisation\n');
console.log('DEBUG- simulation:');
console.log(g.frontier);
g.step();
console.log(g.frontier);
g.step();
console.log(g.ctx);
