function save_contents(data, f_name) {
    let download_anchor = document.createElement('a');

    document.body.appendChild(download_anchor);
    
    let blob = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
    download_anchor.setAttribute('href', blob);
    download_anchor.setAttribute('download', f_name)
    
    download_anchor.click();

    document.body.removeChild(download_anchor);
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
