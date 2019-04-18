/*  Filename: chiffchaff.js
    Directory: src/
    Author: Nicholas Blott
    Email: blottn@tcd.ie
    Description: The root script that is injected into the webpage,
                 links together all other scripts.
*/

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

// helper for getting the current item in the selector
function getSelected(selector = $(selectorId)[0]) { // default selector param
    return selector.options[selector.selectedIndex].value;
}

// update values in the selector given this set of parsed entities
function updateSelector(kinds) {
    let select = $(selectorId)[0];
    $(select).empty(); // clear
    for (name of Object.keys(kinds)) { // for each, create a new selector option
        select.add(new Option(name, name));
    }
}

// update the simulator with a new set of objects
function updateSim(kinds, name = getSelected()) {
    sim = new Sim(name, kinds);
}

// on the selector selecting a new item
function selectorChange(evt) {
    updateSim(kinds, getSelected(evt.target));
    initDisplay(sim); // init visualiser
}


window.onload = function() {
    // initialise editor
    let ed = editor.init(editorId);

    // setup listeners
    ed.on('input', reload)

    $(selectorId).on('change', selectorChange)

    $('#stepper').click(() => {
        sim.step();
        sim.debug();
        if (timings) {
            sim.update(timings);
        }
    });

    ed.setValue(data.sampleVHDL,1); // set initial data

}

// called on code changing
function reload(changed) {
    let ed = editor.get(editorId);
    kinds = parse(ed.getValue()); // reparse data
    updateSelector(kinds); // update selector wheel
    updateSim(kinds); // update simulator
    initDisplay(sim); // initialise visualiser
}

// initialise display of simulator
function initDisplay(simulator) {
    let listQuery = $('#sim-items');
    listQuery.empty();
    let list = listQuery[0];

    let inputs = simulator.getInputs();
    let outputs = simulator.getOutputs();
    timings = new Timings(inputs, outputs, list, simulator);
}
