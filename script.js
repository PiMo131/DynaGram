document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('fileInput');
    var textInput = document.getElementById('textInput');
    var makeDiagramButton = document.getElementById('makeDiagram');
    var nodeColorPicker = document.getElementById('nodeColorPicker');
    var bgColorPicker = document.getElementById('bgColorPicker');
    var selectedColor = nodeColorPicker.value;
    var backgroundColor = bgColorPicker.value;

    makeDiagramButton.addEventListener('click', function() {
        var inputData = fileInput.files.length ? fileInput.files[0] : textInput.value.trim();
        createDiagrams(inputData, selectedColor, backgroundColor);
    });

    nodeColorPicker.addEventListener('change', function() {
        selectedColor = nodeColorPicker.value;
    });

    bgColorPicker.addEventListener('change', function() {
        backgroundColor = bgColorPicker.value;
    });
});

function createDiagrams(inputData, nodeColor, bgColor) {
    d3.select('#diagram').html(''); // Clear previous diagrams

    if (inputData instanceof File) {
        var reader = new FileReader();
        reader.onload = function(e) {
            processInputData(e.target.result, nodeColor, bgColor);
        };
        reader.readAsText(inputData);
    } else if (inputData) {
        processInputData(inputData, nodeColor, bgColor);
    } else {
        alert("Please upload a file or enter text.");
    }
}

function processInputData(inputText, nodeColor, bgColor) {
    var blocks = inputText.split(/\n(?=\w)/); // Split on new lines that start with a word character
    blocks.forEach(function(block) {
        var treeData = parseData(block.trim());
        if (treeData) {
            drawTree(treeData, nodeColor, bgColor);
        }
    });
}


function parseData(block) {
    var lines = block.split('\n');
    var root = { name: lines[0].trim(), children: [] };
    var stack = [root];
    var currentLevel = 0;

    lines.slice(1).forEach(function(line) {
        var level = line.lastIndexOf("-") + 1;
        var name = line.substring(level).trim();

        if (!name) return; // Skip empty lines

        while (level < currentLevel) {
            stack.pop();
            currentLevel--;
        }

        var node = { name: name, children: [] };
        stack[stack.length - 1].children.push(node);
        stack.push(node);
        currentLevel = level + 1;
    });

    return root;
}


function drawTree(data, nodeColor, bgColor) {
    var margin = {top: 20, right: 120, bottom: 20, left: 120};
    var width = 960 - margin.right - margin.left;
    var height = 800 - margin.top - margin.bottom;

    // Create a new SVG for each tree diagram
    var svg = d3.select('#diagram').append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .style('background-color', bgColor)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var treeLayout = d3.tree().size([height, width]);
    var root = d3.hierarchy(data);
    treeLayout(root);

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
        .style('stroke', nodeColor)
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
        .style('fill', nodeColor)
        .style('stroke', 'black');

    // Add the labels centered above the nodes
    nodes.append('text')
        .attr('dy', '-1em') // Move the text up above the node
        .attr('x', 0) // Center the text horizontally
        .style('text-anchor', 'middle') // Ensure the text is centered
        .text(function(d) { return d.data.name; });
}
