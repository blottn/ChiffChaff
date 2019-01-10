// File of test data

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

module.exports = {
    'ha': ha,
    'fa': fa,
    'ra': ra
};
