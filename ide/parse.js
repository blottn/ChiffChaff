// file reader for testing:
var fs = require('fs');
var primitives = require('./primitives.js');

function readFromFile(path, handler) {
    fs.readFile(path, 'utf8', function(err, contents) {
        if (err)
            console.log(err);
        handler(contents);
    });
}

function stripComments(txt,callback) {
    return txt.split('\n').map((line) => line.split(primitives.COMMENT_START)[0])
                          .join('\n');
}

function getInitialVal(type,first,last) {
    if (type == 'STD_LOGIC') {
        return 0;
    }
    else {
        let arr = new Array(first - last);
        for (let i = 0 ; i < first - last ; i++) {
            arr[i] = 0;
        }
        return arr;
    }
};

function getEntities(txt) {
    let entities = {};

    // TODO move these to primitives
    let entity_start = 'entity';
    let name_regex = '([A-Za-z]+\\w*)';
    let is_port = 'is\\s+Port\\s*\\(\\s*';
    let params = '(.*)';
    let end = '(?=\\)\\s*;\\s*end\\s*\\1\\s*;)'
    let entity_regex = new RegExp('(?<='
                            + entity_start
                            + '\\s+'
                            + name_regex
                            + '\\s+'
                            + is_port
                            +')'
                            + params
                            + end, 'gsm');
    // find all signatures

    let input = txt;
    let ent_desc;
    while (ent_desc = entity_regex.exec(input)) {
        let ent_name = ent_desc[1];
        let descriptor = {
                          'in' : {},
                          'out' : {}};

        let vector_type = 'STD_LOGIC_VECTOR'
                            + '(?='
                            + '\\s*\\((\\d)\\sdownto\\s(\\d)\\)'
                            + ')';
        let memoryless_v_type = 'STD_LOGIC_VECTOR\\s*\\((?:\\d)\\sdownto\\s(?:\\d)\\)'

        let logic_type = 'STD_LOGIC'
        let item ='\\s*'
                  + name_regex
                  + '\\s+'
                  + ':'
                  + '\\s+'
                  + '(in|out)'
                  + '\\s+'
                  + '(' + vector_type + '|' + logic_type + ')';
        let memoryless_item ='\\s*'
                  + '(?:[A-Za-z]+\\w*)'
                  + '\\s+'
                  + ':'
                  + '\\s+'
                  + '(?:in|out)'
                  + '\\s+'
                  + '(?:' + memoryless_v_type + '|' + logic_type + ')';
        let itemiser = new RegExp(item + '(?=;' + memoryless_item + '|' + '\\s*)','gsm');
        while(res = itemiser.exec(ent_desc[0])) {
            let io_name = res[1];
            let io_kind = res[2];
            let io_type = res[3];
            // TODO check valid

            if (io_type === 'STD_LOGIC') {
                descriptor[io_kind][io_name] = 0; // set to default value
            }
            if (io_type === 'STD_LOGIC_VECTOR') {
                let first = res[4];
                let last = res[5];
                let size = first - last;
                // init arr
                descriptor[io_kind][io_name] = {val : [],
                                                first : first,
                                                last : last};
                for (let i = 0; i < size ; i++) {
                    descriptor[io_kind][io_name].val.push(0);
                }
            }
        }
        entities[ent_name] = descriptor;
    }
    return entities;
}

function getSignals(entity, txt) {
    with (primitives) {
        let comma_names = NAME + '(?:\\s*,\\s*' + NAME + ')*';
        let signal = new RegExp('(?<=\\s*)signal\\s+'
                            + '(' + comma_names + ')'
                            + '\\s+:\\s*'
                            + TYPE
                            + '\\s*;','gsm');

        let signal_decl;
        while (signal_decl = signal.exec(txt)) {
            let list = signal_decl[1];
            let type = signal_decl[2];
            let upper = signal_decl[3];
            let lower = signal_decl[4];
            let names = list.split(',');

            names.map((n) => entity['architecture']['signals'][n.trim()] = getInitialVal(type,upper,lower));
        }
    }
}

function get_mappings(txt) {
    with (primitives) {
        let itemiser = new RegExp('(' + NAME + ')'
                                + '\\s*:\\s*'
                                + '(in|out)\\s*'
                                + TYPE + '\\s*');
        return txt.split(';').map((component) => {
            let res = component.trim().match(itemiser);
            return {
                name : res[1],
                kind : res[2],
                type : res[3]

            };
        });
    }
}

function getComponents(txt) {
    with (primitives) {
        let start_component = 'component\\s*'
                            + '(' + NAME + ')'
                            + '\\s+Port\\s+\\(\\s*';
        let mappings = '(.*?)'
        let end_component = '\\s*\\)\\s*;\\s*'
                            + 'end\\s*component\\s*;';
        let component = new RegExp(start_component
                                + mappings
                                + end_component
                                ,'gsm');

        let components = [];

        let res;
        while (res = component.exec(txt)) {
            let component_name = res[1];
            let component_body = res[2];
            let mappings = get_mappings(component_body);
            
            components.push({
                name : component_name,
                mappings : mappings
            });
        }

        return components;
    }
}

function getLogic(entity, components, txt) {
    let logic_txt = txt.split('begin')[1];
    with (primitives) {
        let combinatorial_instantiation = '\\s*(' + NAME + ')'
                                        + '\\s*'
                                        + '<='
                                        + '\\s*(.*?)\\s*'
                                        + ';';


        let component_instantiation = '\\s*(' + NAME + ')'
                                    + '\\s*'
                                    + ':'
                                    + '\\s+'
                                    + '(' + NAME + ')'
                                    + '\\s+'
                                    + 'port\\s+map\\s*\\('
                                    + '(.*?)'
                                    + '\\);';
        // TODO change to be a string replace
        let res;
        let finder = new RegExp(combinatorial_instantiation + '|' + component_instantiation,'gsm');
        while (res = finder.exec(logic_txt)) {
            if (res[3] == undefined) { // is a component_instantiation
                let o = res[1];
                let combinator = res[2];
                let operators = new RegExp('xor|or|and|not','igsm');
                console.log(combinator.match(operators));
                console.log(combinator);
                combinator = combinator.replace(operators, (item) => {
                    return item.replace(/xor/i,'^')
                        .replace(/or/i,'||')
                        .replace(/and/i,'&&')
                        .replace(/not/i,'!');
                });
                console.log(o);
                console.log(combinator);
            }
            else {
                let instance_name = res[3];
                let instance_component = res[4];
                let instance_mapping = res[5];
                console.log(instance_name);
                console.log(instance_component);
                console.log(instance_mapping);
            }
        }
    }
}

function getArchitecture(entities, txt) {
    with (primitives) {
        let arch_start = 'architecture\\s+';
        let comma_names = NAME + '(?:\\s*,\\s*' + NAME + ')*';
        let arch_regex = new RegExp(arch_start 
                                + '(' + NAME + ')'
                                + '\\s+of\\s+'
                                + '(' + NAME + ')'
                                + '\\s+is\\s+'
                                + '(.*)'
                                + 'end\\s+\\1\\s*;','gsm');

        
        let res = '';
        while (architecture = arch_regex.exec(txt)) {
            //architecture body
            let arch_name = architecture[1];
            let ent_name = architecture[2];
            let body = architecture[3];
            entities[ent_name].architecture = {
                internals : {},
                signals : {},
                logic : {}
            };

            getSignals(entities[ent_name], body);
            let components = getComponents(body);
            getLogic(entities[ent_name], components, body);
        }
    }
}

function parse(txt) {
    let obj = {};

    //TODO change to be more functional
    let commentless = stripComments(txt);
    commentless = commentless.replace(/\r?\n|\r/gm,' ');
    let partParsed = getEntities(commentless);
    componentised = getArchitecture(partParsed, commentless);
    
}

readFromFile('./fa.vhdl', parse);
