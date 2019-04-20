/*  Filename: data.js
    Directory: src/
    Author: Nicholas Blott
    Email: blottn@tcd.ie
    Description: A collection of test and sample data for filling the webpage.
*/


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
    sampleVHDL: vhdl
};
