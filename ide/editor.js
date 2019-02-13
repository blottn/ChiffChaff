function init_editor() {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    let session = editor.getSession();
    session.setMode("ace/mode/vhdl");
    session.setUseWrapMode(true);
}

$(function () {
    // onload
    init_editor();
    
});
