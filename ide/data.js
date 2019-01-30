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
        i : {'a':0, 'b':0, 'cin':0},
        o : {'z':0, 'cout':0},
        architecture : {
            signals: {'s':0},
            logic: {
                's' : {
                    depends : ['a', 'b'],
                    combiner : function(inputs) { return inputs.a.state ^inputs.b.state; }
                },
                'z' : {
                    depends : ['a', 'b', 'cin'],
                    combiner : function(inputs) { return inputs.a.state ^inputs.b.state ^inputs.cin.state; }
                },
                'cout' : {
                    depends : ['a','b','cin','s'],
                    combiner : function(inputs) { return (inputs.a.state &&inputs.b.state )||(inputs.cin.state &&inputs.s.state ); }
                }
            }
        }
    },

    ra : {
        i : {'a':[0,0], 'b':[0,0], 'cin':1},
        o : {'z0':0, 'z1': 0, 'cout':0},
        architecture : {
            internals : {
                'fa1': {
                    kind : 'fa',
                    depends : ['a','b','cin'],
                    input_map : {'a':'a','b':'b','cin':'cin'},
                    output_map : {'z':'z0','cout':'c'}
                },
                'fa2': {
                    kind : 'fa',
                    depends : ['a', 'b', 'c'],
                    input_map : {'a':'a','b':'b','cin':'c'},
                    output_map : {'z':'z1','cout':'cout'}
                },
            },
            signals: {'c':0},
            logic: []
        }
    }
};
