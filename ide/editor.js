function save_contents(data, f_name) {
    const dataType = 'data:text/plain;charset=utf-8'
    let blob = encodeURIComponent(data);
    $('#download_anchor').attr('href', dataType + blob)
        .attr('download', f_name)
        .click();
}

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
    
    save_contents('hello world :D','chaffchaff.vhdl');
});
