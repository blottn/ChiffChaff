class Ast {
    constructor(type) {
        this.type = type;
    }

    static builder(res) {
        return new Ast();
    }
}

class Ident extends Ast {
    constructor(name) {
        super('ident');
        this.name = name;
    }

    static builder(res) {
        return new Ident(res.result);
    }
}

class Type extends Ast {
    constructor(name, size = new Size(1, 0)) {
        super('type');
        this.name = name;
        this.size = size;
    }
    
    static builder(res) {
        return new Type(res.ast.left, res.ast.right.right);
    }
}

class Dir extends Ast {
    constructor(dir) {
        super('dir');
        this.dir = dir;
    }

    static builder(res) {
        return new Dir(res.result);
    }
}

class Size extends Ast {
    constructor(first, second) {
        super('size');
        this.first = first;
        this.second = second;
    }

    static builder(res) {
        return new Size(res.ast.left, res.ast.right.right);
    }
}

class Entity extends Ast {
    constructor(name, ports) {
        super('entity');
        this.name = name;
        this.ports = ports;
    }

    static builder(res) {
        return new Entity(res.ast.left, res.ast.right.right.left);
    }
}

class Bracketed extends Ast {
    constructor(contents) {
        super('bracketed');
        this.contents = contents;
    }

    static builder(res) {
        return new Bracketed(res.ast.left.right);
    }
}

module.exports = {
    Ident: Ident,
    Type: Type,
    Size: Size,
    Dir: Dir,
    Bracketed: Bracketed
}
