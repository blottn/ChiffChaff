// Test Data

/*let ra =  {
    i : {'a':1, 'b':1, 'cin':1},
    o : {'z':0, 'cout':0},
    architecture : {
        signals: {'s':0},
        logic: ['this.s=this.a ^this.b', 'this.z=this.a ^this.b ^this.cin', 'this.cout=(this.a &&this.b )||(this.cin &&this.s )']
    }
}*/

let fa =  {
    i : {'a':0, 'b':0, 'cin':1},
    o : {'z':0, 'cout':0},
    architecture : {
        internals : {
            // add some internals here and add their ios to the context
        },
        signals: {'s':0},
        logic: ['this.s=this.a ^this.b', 'this.z=this.a ^this.b ^this.cin', 'this.cout=(this.a &&this.b )||(this.cin &&this.s )'],
        hierarchy : { 's' : { notional: true ,parents: ['a','b'] }, 'z': { notional: false ,parents: ['a','b','cin']}, 'cout':{notional: false, parents: ['a','b','cin','s']}}
    }
}



// TODO write some helper parsing functions

function graph(ent) {
    this.ctx = {};
    this.nodes = {};
    this.frontier = [];

    Object.values([ent.i, ent.o, ent.architecture.signals]).map((set) => {
        Object.keys(set).map((name) => {
            this.nodes[name] = new node(() => this.ctx[name]);

            // initialise values in context
            if (name in ent.i) {
                this.ctx[name] = ent.i[name]
            }
            if (name in ent.architecture.signals) {
                this.ctx[name] = ent.architecture.signals[name];
            }
        });
    });
    
    // link the nodes
    Object.values(ent.architecture.logic).map((logic) => {
        let split = logic.split('=');

        let lhs = split[0].split('.')[1];
        if (!(lhs in this.nodes)) { // this likely wont happen
            this.nodes[lhs] = new node(new Function(logic));
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

function node(step) {
    this.step = step;
    this.children = [];
}

g = new graph(fa);
g.step();
g.step();
console.log(g);


/// ISSUE IS THAT THE NODES STILL HAVE WRONG STEP FUNCTION
