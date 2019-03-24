const itemBase = '<li class="list-group-item"><span style="display: inline; float: left;">Name</span><div height="50px;" style="display: inline; float: right;"></div></li>';

function transformData(list) {
    let y = [list[0]];
    let x = [0];

    let lastState = list[0];
    let xVal = 1;
    
    let points = [];

    for (let i = 1 ; i < list.length ; i++) {
        let item = list[i];
        if (item == lastState) {
            x.push(xVal);
            y.push(item);
            points.push({x: xVal, y: item});
        }
        else {
            y.push(lastState);
            x.push(xVal);
            points.push({x: xVal, y: lastState});
            y.push(item);
            x.push(xVal);
            points.push({x: xVal, y: item});
        }
        xVal++;
        lastState = item;
    }
    points.push({x: xVal, y:lastState});
    return points;
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
               
                const width = 350;
                const height = 32;

                let data = transformData([0,1,1,1,0,0,1,0]);

                let yScale = d3.scaleLinear().range([height,0]);
                let xScale = d3.scaleLinear().range([0,width]);
                
                let xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(data.length);

                let yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(data.length);
                
                // scale data
                xScale.domain(d3.extent(data, (d) => d.x));
                
                yScale.domain([0, 
                    d3.max(data, function (d) {
                        return d.y;
                    })
                ]);

                let line = d3.line()
                    .x((d) => {
                        return xScale(d.x);
                    })
                    .y((d) => {
                        return yScale(d.y);
                    });

                let svg = d3.select(div[0])
                    .append('svg')
                    .attr('fill', 'black')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr('fill', 'black');
                
                svg.append('path')
                    .attr('d', line(data))
                    .attr('stroke', 'blue')
                    .attr('stroke-width', 3);

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
