let parse = require('./parse.js');
let {Sim: Sim} = require('./sim.js');
let editor = require('./editor.js');
let page = require('./page.js');
let data = require('./data.js');

const editorId = 'editor';
const selectorId = '#selector';
const listId = '#sim-items';

let sim;
let kinds;

function getSelected(selector = $(selectorId)[0]) {
    return selector.options[selector.selectedIndex].value;
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

function selectorChange(evt) {
    updateSim(evt.target, kinds);
    if (sim) {
        sim.use(getSelected(evt.target))
    }
    else if (kinds) {
        sim = new Sim(getSelected(evt.target), kinds);
    }
}

function updateSim(name = getSelected()) {
    if (sim) {
        sim.use(name);
    }
    else if (kinds) {
        sim = new Sim(name, kinds);
    }
}

window.onload = function() {
    let ed = editor.init(editorId);
    ed.on('change', reload)
    
    ed.setValue(data.sampleVHDL);
    $(selectorId).on('change', selectorChange)
    $('#stepper').click(() => {
        console.log('step');
    });
}

function reload(changed) {
    console.log('reloaded');
    let ed = editor.get(editorId);
    kinds = parse(ed.getValue());
    updateSelector(kinds);
    updateSim();
    display(sim);
}

function display(s) {
    let listQuery = $('#sim-items');
    listQuery.empty();
    let list = listQuery[0];

    let inputs = s.getInputs();
    let outputs = s.getOutputs();
    

}
