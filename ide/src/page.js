const itemBase = '<li class="list-group-item"><span>Name</span><div height="50px;"></div></li>';

function transformData(list) {
    let y = [list[0]];
    let x = [0];

    let lastState = list[0];
    let xVal = 1;

    for (let i = 1 ; i < list.length ; i++) {
        let item = list[i];
        if (item == lastState) {
            x.push(xVal);
            y.push(item);
        }
        else {
            y.push(lastState);
            x.push(xVal);
            y.push(item);
            x.push(xVal);
        }
        xVal++;
        lastState = item;
    }
    y.push(lastState);
    x.push(xVal);
    return {
        x: x,
        y: y
    }
}

class Timings {
    constructor(inputs, outputs, root) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.rootNode = root;

        let createNodes = (list, root) => {
            for (let i = 0 ; i < inputs.length ; i++) {
                let node = $(itemBase);
                let name = node.find('span');
                let div = node.find('div');
                
                let data = transformData([0,1,1,1,0,0,1,0]);
                console.log(data);
                let svg = d3.select(div[0])
                    .append('svg');

                

                root.appendChild(node[0]);
            }
        }

        createNodes(this.inputs, this.rootNode);   
        createNodes(this.outputs, this.rootNode);
    }

}

module.exports = {
    Timings: Timings
}
