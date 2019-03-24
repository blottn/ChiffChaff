const itemBase = '<li class="list-group-item"><span style="display: inline; float: left;">Name</span><div height="50px;" style="display: inline; float: right;"></div></li>';

function transformData(list) {
    return list.map((item, index) => {return {x: index, y: item};});
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
                const margin = 4;
                const lightGreen = '#78ff01';
                let data = transformData([0,1,1,1,0,0,1,0]);

                let yScale = d3.scaleLinear().range([height - margin, margin]);
                let xScale = d3.scaleLinear().range([margin,width - margin]);
                
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
                    })
                    .curve(d3.curveStep);

                let svg = d3.select(div[0])
                    .append('svg')
                    .attr('fill', 'black')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                
                svg.append('rect')
                    .attr('fill', 'black')
                    .attr('width', '100%')
                    .attr('height', '100%');

                svg.append('path')
                    .attr('d', line(data))
                    .attr('stroke', lightGreen)
                    .attr('stroke-width', 1);

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
