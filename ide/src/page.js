const itemBase = `<li class="list-group-item">
    <div class="container" style="padding:0px;">
    <div class="row" style="height:10%">
    <div class="col-sm-3">
        <div class="row" style="height:auto">
            <div class="col-sm-7">
                <p id="name" style="display: inline; float: left;">A</p>
                <p style="display: inline;">:</p>
            </div>
            <div class="col-5" style="">
        	    <div style="background-color:black;border-radius: 4px;text-align: center;">
            	    <p id="state" style="margin: auto;color:lightgreen;">0</p>
        	    </div>
            </div>
        </div>
    </div>
    <div class="col-sm-2">
        <button type="button" class="btn btn-info" style="display:none;">
            Flip
        </button>
    </div>
    <div class="col-sm-7">
        <div id="svg-root" height="50px;" style="display: block;">
        </div>
        <p>T &rarr;</p>
    </div>
    </div>
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
                let name = node.find('#name');
                let state = node.find('#state');
                let div = node.find('#svg-root');
                name.text(list[i].name);
                state.text(list[i].state);
                if (flippable) {
                    node.find('button')
                        .attr('style', 'float:left;display:inline;')
                        .click(() => {
                            list[i].state = list[i].state ^ 1;
                            this.sim.flipped(list[i]);
                            state.text(list[i].state);
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
                    .curve(d3.curveStepAfter);
                

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
                this.data[list[i].name].root = node;
                this.data[list[i].name].line = line;
                root.appendChild(node[0]);
            }
        }

        createNodes(this.inputs, this.rootNode, true);
        createNodes(this.outputs, this.rootNode);
    }
    
    update(name, state) {
        let dataItem = this.data[name];
        let root = $(dataItem.root);
        
        dataItem.vals.unshift(state);
        dataItem.vals.pop();

        let renderData = transformData(this.data[name].vals);
        let pathNode = root.find('path');
        let stateNode = root.find('#state');
        stateNode.text(state);

        pathNode.attr('d', this.data[name].line(renderData));
    }
}

module.exports = {
    Timings: Timings
}
