document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('fileInput');
    var makeDiagramButton = document.getElementById('makeDiagram');
    var nodeColorPicker = document.getElementById('nodeColorPicker');
    var bgColorPicker = document.getElementById('bgColorPicker');
    var selectedFile;
    var nodeColor = nodeColorPicker.value;
    var bgColor = bgColorPicker.value;
    var fileContent = '';

    fileInput.addEventListener('change', function(e) {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            var reader = new FileReader();
            reader.onload = function(e) {
                fileContent = e.target.result;
            };
            reader.readAsText(selectedFile);
        }
    });

    nodeColorPicker.addEventListener('change', function() {
        nodeColor = nodeColorPicker.value;
    });

    bgColorPicker.addEventListener('change', function() {
        bgColor = bgColorPicker.value;
    });

    makeDiagramButton.addEventListener('click', function() {
        if (fileContent) {
            var parsedData = parseData(fileContent, selectedFile.name.split('.')[0]);
            drawTree(parsedData, nodeColor, bgColor);
        } else {
            alert("Please select a file.");
        }
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

function drawTree(data, nodeColor, bgColor) {
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
        .style('background-color', bgColor) // Use bgColor for background color
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
        )
        .style('fill', 'none')
        .style('stroke', nodeColor) // Use nodeColor for link color
        .style('stroke-width', '2px');

    // Draw the nodes
    var nodes = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

    nodes.append('circle')
        .attr('r', 5)
        .style('fill', nodeColor) // Use nodeColor for node fill
        .style('stroke', 'black'); // You can change this if needed

    // Add the labels
    nodes.append('text')
    .attr('dy', '-1em') // Move the text up above the node
    .attr('x', 0) // Center the text horizontally
    .style('text-anchor', 'middle') // Ensure the text is centered
    .text(function(d) { return d.data.name; });
}
