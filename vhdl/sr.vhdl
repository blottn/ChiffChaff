entity sr is Port (
    S : in STD_LOGIC;
    R : in STD_LOGIC;
    O : out STD_LOGIC
);
end sr;

architecture s of sr is

signal q, nq : STD_LOGIC; 
signal ps, pr : STD_LOGIC;
begin

O <= q;
q <= (NOT R) AND (NOT nq);
nq <= (NOT S) AND (NOT q);

end s;

