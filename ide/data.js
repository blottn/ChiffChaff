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
                    combiner : function () { return this.a ^ this.b; }
                },
                'c': {
                    depends : ['a', 'b'],
                    combiner : function () { return this.a & this.b; }
                }
            }
        }
    },

    ha_new : {
        i : {'a':1, 'b':1},
        o : {'s':0, 'c':0},
        architecture : {
            signals: {},
            logic: {
                's': {
                    depends : ['a', 'b'],
                    combiner : function (inputs) {return inputs.a.state ^ inputs.b.state;}
                },
                'c': {
                    depends : ['a', 'b'],
                    combiner : function (inputs) {return inputs.a.state & inputs.b.state; }
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
                    combiner : function() { return this.a ^this.b; }
                },
                'z' : {
                    depends : ['a', 'b', 'cin'],
                    combiner : function() { return this.a ^this.b ^this.cin; }
                },
                'cout' : {
                    depends : ['a','b','cin','s'],
                    combiner : function() { return (this.a &&this.b )||(this.cin &&this.s ); }
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
                    depends : ['a','b','cin'],
                    input_map : {'a':'a[0]','b':'b[0]','cin':'cin'},
                    output_map : {'z':'z','cout':'c'}
                },
                'fa2': {
                    kind : 'fa',
                    depends : ['a', 'b', 'c'],
                    input_map : {'a':'a[1]','b':'b[1]','cin':'c[0]'},
                    output_map : {'z':'z','cout':'cout'}
                },
            },
            signals: {'c':[0]},
            logic: []
        }
    }
};
