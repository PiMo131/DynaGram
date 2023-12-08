document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;

        var fileName = file.name.split('.')[0]; // Get the filename without extension

        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            var parsedData = parseData(contents, fileName); // Pass the filename to parseData
            drawTree(parsedData);
        };
        reader.readAsText(file);
    });
});

function parseData(text, rootName) {
    var lines = text.split('\n');
    var root = { name: rootName, children: [] }; // Use the passed filename as root name
    var currentLevel = -1;
    var stack = [root];

    lines.forEach(function(line) {
        var level = line.lastIndexOf("-") + 1;
        var name = line.substring(level).trim();

        while (level <= currentLevel) {
            stack.pop();
            currentLevel--;
        }

        var node = { name: name, children: [] };
        stack[stack.length - 1].children.push(node);
        stack.push(node);
        currentLevel = level;
    });

    return root;
}

function drawTree(data) {
    d3.select('#diagram svg').remove(); // Clear previous tree

    var margin = {top: 20, right: 120, bottom: 20, left: 120};
    var width = 960 - margin.right - margin.left;
    var height = 800 - margin.top - margin.bottom;

    var treeLayout = d3.tree().size([height, width]);
    var root = d3.hierarchy(data);
    treeLayout(root);

    var svg = d3.select('#diagram').append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Draw the links
    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(function(d) { return d.y; })
            .y(function(d) { return d.x; })
        );

    // Draw the nodes
    var nodes = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

    nodes.append('circle')
        .attr('r', 5);

    // Add the labels
    nodes.append('text')
        .attr('dy', -10) // Adjust this value to move labels vertically
        .attr('x', function(d) { return d.children ? -15 : 15; }) // Adjust for left or right side
        .style('text-anchor', function(d) { return d.children ? 'end' : 'start'; })
        .text(function(d) { return d.data.name; });
}
