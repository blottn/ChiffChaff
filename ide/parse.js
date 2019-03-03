// file reader for testing:
const fs = require('fs');
const vernac = require('vernac');
const symbols = require('./symbols.js');

function readFromFile(path, handler) {
    fs.readFile(path, 'utf8', function(err, contents) {
        if (err)
            console.log(err);
        handler(contents);
    });
}

function stripComments(txt) {
    return txt.split('\n').map((line) => line.split(symbols.COMMENT_START)[0])
                          .join('\n');
}

function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    commentless = commentless.replace(/\r?\n|\r/gm,' ');
    new VhdlParser(commentless).parse();
}

readFromFile('./fa.vhdl', parse);

function VhdlParser(input) {
    this.input = input;
    this.currentIndex = 0;
    this.currentSymbol = '';
    
    //helpers

    this.getNextChar = function() {
        if (this.currentIndex < input.length)
            return input.charAt(this.currentIndex++);
        else
            return '';
    }

    this.nextSymbol = function() {
        let symbol = '';
        let accumulator = '';
        while (symbol === '') {
            let c = this.getNextChar();
            if (c == '') {
                return false;
            }
            console.log(c);
            accumulator = accumulator + c;

        }
        return true;
    }

    // rules
    this.program = function() {
        return 1;
    }

    // start
    this.parse = function() {
        this.nextSymbol();
        return this.program();
    }
}
