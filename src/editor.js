function save(data, f_name) {
    let download_anchor = document.createElement('a');

    document.body.appendChild(download_anchor);
    
    let blob = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
    download_anchor.setAttribute('href', blob);
    download_anchor.setAttribute('download', f_name)
    
    download_anchor.click();

    document.body.removeChild(download_anchor);
}

function init(id) {
    var editor = ace.edit(id);
    editor.setTheme("ace/theme/monokai");
    let session = editor.getSession();
    session.setMode("ace/mode/vhdl");
    session.setUseWrapMode(true);
    return editor;
}

function getEditor(id) {
    return ace.edit(id);
}

module.exports = {
    init: init,
    get: getEditor,
    save: save
}