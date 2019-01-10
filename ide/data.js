// File of test data
module.exports = {
    ha : {
        i : {'a':1, 'b':1},
        o : {'s':0, 'c':0},
        architecture : {
            signals: {},
            logic: {
                's': {
                    depends : ['a', 'b'],
                    combiner : 'this.s=this.a ^this.b'
                },
                'c': {
                    depends : ['a', 'b'],
                    combiner : 'this.c=this.a &this.b'
                }
            }
        }
    },



    fa : {
        i : {'a':0, 'b':0, 'cin':1},
        o : {'z':0, 'cout':0},
        architecture : {
            signals: {'s':0},
            logic: {
                's' : {
                    depends : ['a', 'b'],
                    combiner : 'this.s=this.a ^this.b'
                },
                'z' : {
                    depends : ['a', 'b', 'cin'],
                    combiner : 'this.z=this.a ^this.b ^this.cin'
                },
                'cout' : {
                    depends : ['a','b','cin','s'],
                    combiner : 'this.cout=(this.a &&this.b )||(this.cin &&this.s )'
                }
            }
        }
    },

    ra : {
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
    }
};
