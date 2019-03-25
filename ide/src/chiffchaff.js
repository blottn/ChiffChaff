const parse = require('./parse.js');
const {Sim: Sim} = require('./sim.js');
const editor = require('./editor.js');
const {Timings: Timings} = require('./page.js');
const data = require('./data.js');

const editorId = 'editor';
const selectorId = '#selector';
const listId = '#sim-items';

let sim;
let kinds;
let timings;

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

function updateSim(name = getSelected()) {
    if (sim) {
        sim.use(name);
    }
    else if (kinds) {
        sim = new Sim(name, kinds);
    }
}
function selectorChange(evt) {
    updateSim(getSelected(evt.target));
    initDisplay(sim);
}


window.onload = function() {
    let ed = editor.init(editorId);
    ed.on('change', reload)
    
    ed.setValue(data.sampleVHDL);
    $(selectorId).on('change', selectorChange)
    $('#stepper').click(() => {
        sim.step();
        sim.debug();
        if (timings) {
            sim.update(timings);
        }
    });
}

function reload(changed) {
    console.log('reloaded');
    let ed = editor.get(editorId);
    kinds = parse(ed.getValue());
    updateSelector(kinds);
    updateSim();
    initDisplay(sim);
}

function initDisplay(s) {
    let listQuery = $('#sim-items');
    listQuery.empty();
    let list = listQuery[0];

    let inputs = s.getInputs();
    let outputs = s.getOutputs();
    timings = new Timings(inputs, outputs, list);
}
