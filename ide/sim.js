let fa =  {
    i : {'a':0, 'b':0, 'cin':1},
    o : {'z':0, 'cout':0},
    architecture : {
        internals : {
            // add some internals here and add their ios to the context
        },
        signals: {'s':false},
        logic: ['this.s=this.a ^this.b', 'this.z=this.a ^this.b ^this.cin', 'this.cout=(this.a &&this.b )||(this.cin &&this.s )'],
        hierarchy : { 's' : { notional: true ,parents: ['a','b'] }, 'z': { notional: false ,parents: ['a','b','cin']}, 'cout':{notional: false, parents: ['a','b','cin','s']}}
    }
}

let ra =  {
    i : {'a':1, 'b':1, 'cin':1},
    o : {'z':0, 'cout':0},
    architecture : {
        signals: {'s':false},
        logic: ['this.s=this.a ^ this.b', 'this.z= this.a ^ this.b ^ this.cin', 'this.cout= ( this.a && this.b ) || ( this.cin && this.s )']
    }
}

function run(o) {
    ctx = {}
    //inputs
    for (key in o.i) {
        ctx[key] = o.i[key]
    }

    //outputs
    for (key in o.o) {
        ctx[key] = o.o[key]
    }

    //signals
    for (m in o.architecture.signals) {
        ctx[m] = o.architecture.signals[m]
    }

    o.architecture.logic.map((func) => {
        f = new Function(func);
        f.call(ctx);
    });
    console.log(ctx);
}

function graph(ent,ctx) {
    this.ctx = {};
    this.nodes = {}; //object of signal -> node
    this.frontier = [];

    Object.values([ent.i, ent.o, ent.architecture.signals]).map((set) => {
        Object.keys(set).map((name) => {
            this.nodes[name] = new node(() => this.ctx[name]);
        });
    });

    this.restim = () => {
        this.frontier = this.frontier.concat(Object.keys(ent.i));
    }

    // link the nodes
    Object.values(ent.architecture.logic).map((logic) => {
        let split = logic.split('=');

        let lhs = split[0].split('.')[1];
        if (!(lhs in this.nodes)) {
            this.nodes[lhs] = new node(new Function(logic));
        }
        else {
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

    this.step = () => { //TODO debug
        let nf = []
        this.frontier.map((node) => {
            console.log(this.nodes[node]);
            this.nodes[node].step.call(this.ctx);
            Object.keys(this.nodes[node].children).map((n) => {
                if (!(nf.includes(this.nodes[node].children[n]))) {
                    nf.push(this.nodes[node].children[n]);
                }
            });
        });
        this.frontier = nf;
    }

    this.restim();
}

g = new graph(fa, {});
console.log(g);
g.step();
console.log(g);

function node(step) {
    this.step = step;
    this.children = [];
}
