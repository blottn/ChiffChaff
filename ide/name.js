function getCode(text) {
    buildup = [];
    for (ind in text) {
        buildup.push(text.charCodeAt(ind));
    }
    return buildup;
}


function stringcrement(text) {
    if (text == "") {
        return text;
    }
    else {
        if (text.charCodeAt(text.length - 1) < 122) {
            return text.substring(0,text.length - 1);
        }
    }
}

function namer() {
    this.state = 'a';
    this.next = () => {
        return stringcrement(this.state);
    };
}


module.exports = new namer();
