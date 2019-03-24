entity full_adder_vhdl_code is
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
Port ( A : in STD_LOGIC;
B : in STD_LOGIC;
C : in STD_LOGIC;
D : in STD_LOGIC;
Cin : in STD_LOGIC;
Y : out STD_LOGIC;
Z : out STD_LOGIC;
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
signal c1 : STD_LOGIC;

begin

-- Port Mapping Full Adder 2 times
FA1: full_adder_vhdl_code port map( A, C, Cin, Y, c1);
FA2: full_adder_vhdl_code port map( B, D, c1, Z, c2);

end Behavioral;
