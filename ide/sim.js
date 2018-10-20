let fa =  {
    i : {'a':0, 'b':0, 'cin':1},
    o : {'z':0, 'cout':0},
    architecture : {
        internals : {
            // add some internals here and add their ios to the context
        },
        signals: {'s':false},
        logic: ['this.s = this.a ^ this.b', 'this.z = this.a ^ this.b ^ this.cin', 'this.cout = (this.a && this.b) || (this.cin && this.s)']
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
    })
    console.log(ctx);
}


//run(fa);

/*
{
    roots : ['a','b','cin']
}
*/


function graph(ent) {
    let logic = ent.architecture.logic;
    this.nodes = {}; //object of signal -> node
    logic.map((l) => {
        let lhs = l.split('=')[0];
        let name = lhs.split('.')[1];
        /*if (!(name in this.nodes)) {
            this.nodes[name] = new node(l);
        }
        else {
            this.nodes[name].step = l;
        }*/

        let rhs = l.split('=')[1];
        //calculate parents
        console.log(rhs.split(' ').map((x) => x.split('.')));

    });
}

console.log(new graph(fa));


function node(step) {
    this.step = step;
    this.children = [];
}
