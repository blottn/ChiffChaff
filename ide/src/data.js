// TODO delete
// File of test data
const vhdl = `entity full_adder_vhdl_code is
 Port ( A : in STD_LOGIC;
 B : in STD_LOGIC;
 Cin : in STD_LOGIC;
 S : out STD_LOGIC;
 Cout : out STD_LOGIC);
end full_adder_vhdl_code;

architecture gate_level of full_adder_vhdl_code is

begin

 S <= A XOR B XOR Cin ;
 Cout <= (A AND B) OR (Cin AND A) OR (Cin AND B) ;

end gate_level;

entity Ripple_Adder is
Port ( A : in STD_LOGIC_VECTOR (3 downto 0);
B : in STD_LOGIC_VECTOR (3 downto 0);
Cin : in STD_LOGIC;
S : out STD_LOGIC_VECTOR (3 downto 0);
Cout : out STD_LOGIC);
end Ripple_Adder; -- test in line comment

architecture Behavioral of Ripple_Adder is

-- Full Adder VHDL Code Component Decalaration
component full_adder_vhdl_code Port ( A : in STD_LOGIC;
                                      B : in STD_LOGIC;
                                      Cin : in STD_LOGIC;
                                      S : out STD_LOGIC;
                                      Cout : out STD_LOGIC);
end component;

-- Intermediate Carry declaration
signal c1,c2,c3 : STD_LOGIC;

begin

-- Port Mapping Full Adder 4 times
FA1: full_adder_vhdl_code port map( A(0), B(0), Cin, S(0), c1);
FA2: full_adder_vhdl_code port map( A(1), B(1), c1, S(1), c2);
FA3: full_adder_vhdl_code port map( A(2), B(2), c2, S(2), c3);
FA4: full_adder_vhdl_code port map( A(3), B(3), c3, S(3), Cout);

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
