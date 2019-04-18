// TODO delete
// File of test data
const vhdl = `entity full_adder is Port (
    A : in STD_LOGIC;
    B : in STD_LOGIC;
    Cin : in STD_LOGIC;
    S : out STD_LOGIC;
    Cout : out STD_LOGIC);
end full_adder;

architecture gate_level of full_adder is

begin

S <= A XOR B XOR Cin ;
Cout <= (A AND B) OR (Cin AND A) OR (Cin AND B) ;

end gate_level;

entity ripple_adder is Port (
    A : in STD_LOGIC;
    B : in STD_LOGIC;
    C : in STD_LOGIC;
    D : in STD_LOGIC;
    Cin : in STD_LOGIC;
    Y : out STD_LOGIC;
    Z : out STD_LOGIC;
    Cout : out STD_LOGIC);
end ripple_adder; -- test in line comment

architecture Behavioral of ripple_adder is

-- Full Adder VHDL Code Component Decalaration
component full_adder Port (
    A : in STD_LOGIC;
    B : in STD_LOGIC;
    Cin : in STD_LOGIC;
    S : out STD_LOGIC;
    Cout : out STD_LOGIC);
end component;

-- Intermediate Carry declaration
signal c1 : STD_LOGIC;

begin

-- Port Mapping Full Adder 2 times
FA1: full_adder port map( A, C, Cin, Y, c1);
FA2: full_adder port map( B, D, c1, Z, Cout);

end Behavioral;`


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
        i : {'a':0, 'b':0, 'c':0, 'd':0, 'cin':1},
        o : {'z0':0, 'z1': 0, 'cout':0},
        architecture : {
            internals : {
                'fa1': {
                    kind : 'fa',
                    depends : ['a','c','cin'],
                    input_map : {'a':'a','b':'c','cin':'cin'},
                    output_map : {'z':'z0','cout':'c1'}
                },
                'fa2': {
                    kind : 'fa',
                    depends : ['b', 'd', 'c1'],
                    input_map : {'a':'b','b':'d','cin':'c1'},
                    output_map : {'z':'z1','cout':'cout'}
                },
            },
            signals: {'c1':0},
            logic: []
        }
    },

    identity : {
        i : {'a': 1},
        o : {'b': 0},
        architecture : {
            signals: {},
            logic: {
                'b' : {
                    'depends' : ['a'],
                    combiner : function(inputs) { return inputs.a.state;}
                }
            }
        }
    },

    tight : {
        i : {'a':1},
        o : {'b':0},
        architecture : {
            internals : {
                'id': {
                    kind : 'identity',
                    depends : ['a'],
                    input_map : {'a':'a'},
                    output_map : {'b':'b'}
                },
            },
            signals: {},
            logic: {
            }
        }
    },

    sampleVHDL: vhdl
};