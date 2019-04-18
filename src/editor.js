// A collection of utility functions for manupulating the editor

function init(id) {
    var editor = ace.edit(id);
    // set theme and highlighter
    editor.setTheme("ace/theme/monokai");
    let session = editor.getSession();
    session.setMode("ace/mode/vhdl");
    session.setUseWrapMode(true);
    return editor;
}

function getEditor(id) { // wrapper for nice syntax
    return ace.edit(id);
}

module.exports = {
    init: init,
    get: getEditor
}
