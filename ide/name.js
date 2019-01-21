function getCode(text) {
    buildup = [];
    for (ind in text) {
        buildup.push(text.charCodeAt(ind));
    }
    return buildup;
}

const limit = 122;

function stringcrement(vals) {
    if (vals.length != 0) {
        if (vals[vals.length - 1] < limit) {
            vals[vals.length - 1] += 1;
        }
        else {
            vals.splice(vals.length - 1);
            stringcrement(vals).push('a'.charCodeAt(0));
        }
    }
    else {
        vals.push('a'.charCodeAt(0));
    }
    return vals;
}

function unaryFromCharCode(code) {
    return String.fromCharCode(code);
}

function namer() {
    this.state = '';
    this.next = () => {
        return this.state = stringcrement(getCode(this.state)).map(unaryFromCharCode).join('');
    };
}


module.exports = new namer();
