let parse = require('./parse.js');
let {Sim: Sim} = require('./sim.js');
let editor = require('./editor.js');
let page = require('./page.js');
let data = require('./data.js');

const editorId = 'editor';
const selectorId = '#selector';
const listId = '#sim-items';

let simObj;

window.onload = function() {
    let ed = editor.init(editorId);
    ed.on('change', reload)
    
    ed.setValue(data.sampleVHDL);

    $('#stepper').click(() => {
        if (simObj) 
        console.log('step');
    });
}

function getSelected() {
    return $(selectorId)[0].options[$(selectorId)[0].selectedIndex].value;
}

function updateSelector(kinds) {
    let select = $(selectorId)[0];
    // clear first
    for (let i = 0; i < select.options.length; i++) {
        select.options[i] = null;
    }
    for (name of Object.keys(kinds)) {
        select.add(new Option(name, name));
    }
}

function reload(changed) {
    let ed = editor.get(editorId);
    let kinds = parse(ed.getValue());
    updateSelector(kinds);
    display();
}

function display() {
   // let selected = getSelected()
    
    let listQuery = $('#sim-items');
    listQuery.empty();
    let list = listQuery[0];
    
}
