const {Terminal : Terminal, Empty: Empty} = require('vernac');

class Ident {
    constructor(name) {
        this.name = name;
    }
}

const ident = new Terminal('[A-Za-z]+\\w*');

ident.listen((res) => {
    return new Ident(res.result);
});


