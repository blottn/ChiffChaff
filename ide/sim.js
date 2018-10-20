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
        logic: ['this.s = this.a ^ this.b', 'this.z = this.a ^ this.b ^ this.cin', 'this.cout = (this.a && this.b) || (this.cin && this.s)']
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


run(fa);
