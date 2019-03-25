const itemBase = `<li class="list-group-item">
        <span style="display: inline; float: left;">Name</span>
        <button type="button" class="btn btn-info" style="margin:8px;display:none;">
            Flip
        </button>
        <div height="50px;" style="display: inline; float: right;">
        </div>
    </li>`;

const width = 250;
const height = 32;
const margin = 4;
const lightGreen = '#17a2b8';
               


function transformData(list) {
    return list.map((item, index) => {return {x: index, y: item};});
}

function initialData() {
    let data = [];
    for (let i = 0; i < 10; i++) {
        data.push(0);
    }
    return data;
}

class Timings {
    constructor(inputs, outputs, root) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.rootNode = root;
        this.data = {};
        let createNodes = (list, root, flipOpts) => {
            for (let i = 0 ; i < list.length ; i++) {
                let node = $(itemBase);
                let name = node.find('span');
                let div = node.find('div');
                name.text(list[i].name);

                if (flipOpts) {
                    node.find('button').attr('style', 'float:left;display:inline;margin:8px; margin-left:36px;');
                }
               
                // initial data;

                this.data[list[i].name] = {vals: initialData()};
                let tData= transformData(this.data[list[i].name].vals);


                let yScale = d3.scaleLinear().range([height - margin, margin]);
                let xScale = d3.scaleLinear().range([margin,width - margin]);
                
                let xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(tData.length);

                let yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(tData.length);
                
                // scale data
                xScale.domain(d3.extent(tData, (d) => d.x));
                
                yScale.domain([0,1]) 

                let line = d3.line()
                    .x((d) => {
                        return xScale(d.x);
                    })
                    .y((d) => {
                        return yScale(d.y);
                    })
                    .curve(d3.curveStep);

                let svg = d3.select(div[0])
                    .append('svg')
                    .attr('fill', 'black')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                
                this.data[list[i].name].svg = svg;

                svg.append('rect')
                    .attr('fill', 'black')
                    .attr('width', '100%')
                    .attr('height', '100%');

                svg.append('path')
                    .attr('d', line(tData))
                    .attr('stroke', lightGreen)
                    .attr('stroke-width', 1);

                root.appendChild(node[0]);
            }
        }

        createNodes(this.inputs, this.rootNode, true);
        createNodes(this.outputs, this.rootNode);
    }
    
    update(name, state) {
        console.log('updating ' + name + ' : ' + state);
        this.data[name].vals.shift();
        this.data[name].vals.push(state);
        let renderData = transformData(this.data[name].vals);
        let svg = this.data[name].svg;
       /* d3.select(svg)
            .selectAll('path')
            .data*/
    }
}

module.exports = {
    Timings: Timings
}
