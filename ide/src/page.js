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
    constructor(inputs, outputs, root, sim) {
        this.sim = sim;
        this.inputs = inputs;
        this.outputs = outputs;
        this.rootNode = root;
        this.data = {};

        let createNodes = (list, root, flippable) => {
            for (let i = 0 ; i < list.length ; i++) {
                let node = $(itemBase);
                let name = node.find('span');
                let div = node.find('div');
                name.text(list[i].name);

                if (flippable) {
                    node.find('button')
                        .attr('style', 'float:left;display:inline;margin:8px; margin-left:36px;')
                    node.click(() => {
                        list[i].state = list[i].state ^ 1;
                        this.sim.flipped(list[i]);
                    });
                }
               
                // initial data;

                this.data[list[i].name] = {vals: initialData()};
                let tData= transformData(this.data[list[i].name].vals);


                let yScale = d3.scaleLinear().range([height - margin, margin]);
                let xScale = d3.scaleLinear().range([-1,width]);
                
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
                    .curve(d3.curveStepBefore);
                

                let svg = d3.select(div[0])
                    .append('svg')
                    .attr('fill', 'black')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g');

                 svg.append('rect')
                    .attr('fill', 'black')
                    .attr('width', '100%')
                    .attr('height', '100%');
               
                let grid = svg.append("g")	
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis
                        .tickSize(-height)
                        .tickFormat("")
                    );
                
                svg.append('path')
                    .attr('d', line(tData))
                    .attr('stroke', lightGreen)
                    .attr('fill', '#66666600')
                    .attr('stroke-width', 1.5);

                this.data[list[i].name].svg = svg;
                this.data[list[i].name].root = div;
                this.data[list[i].name].line = line;
                root.appendChild(node[0]);
            }
        }

        createNodes(this.inputs, this.rootNode, true);
        createNodes(this.outputs, this.rootNode);
    }
    
    update(name, state) {
        console.log('updating ' + name + ' ' + state);
        let dataItem = this.data[name];
        let root = $(dataItem.root);
        
        dataItem.vals.shift();
        dataItem.vals.push(state);

        let renderData = transformData(this.data[name].vals);
        let pathNode = root.find('path');

        pathNode.attr('d', this.data[name].line(renderData));
    }
}

module.exports = {
    Timings: Timings
}
