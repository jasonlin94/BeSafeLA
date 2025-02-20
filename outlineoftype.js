function drawtree() {
    // main svg
    var svg = d3.select("div#v-pills-type").select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(20,0)");       // move right 20px.

    // x-scale and x-axis
    // var experienceName = ["", "Basic 1.0","Alright 2.0","Handy 3.0","Expert 4.0","Guru 5.0"];
    // var formatSkillPoints = function (d) {
    //     return experienceName[d % 6];
    // }
    var xScale = d3.scaleLinear()
        .domain([10000, 20000])
        .range([0, 350]);

    var xAxis = d3.axisTop()
        .scale(xScale)
        .ticks(10)
    // .tickFormat(formatSkillPoints);

    // Setting up a way to handle the data
    var tree = d3.cluster()                 // This D3 API method setup the Dendrogram datum position.
        .size([height, width - 500])    // Total width - bar chart width = Dendrogram chart width
        .separation(function separate(a, b) {
            return a.parent == b.parent            // 2 levels tree grouping for category
                || a.parent.parent == b.parent
                || a.parent == b.parent.parent ? 0.4 : 0.8;
        });

    var stratify = d3.stratify()            // This D3 API method gives cvs file flat data array dimensions.
        .parentId(function (d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

    d3.csv("layout.csv", row, function (error, data) {
        if (error) throw error;

        var root = stratify(data);
        tree(root);

        // Draw every datum a line connecting to its parent.
        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                return "M" + d.y + "," + d.x
                    + "C" + (d.parent.y + 100) + "," + d.x
                    + " " + (d.parent.y + 100) + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });

        // Setup position for every datum; Applying different css classes to parents and leafs.
        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        // Draw every datum a small circle.
        node.append("circle")
            .attr("r", 4);

        // Setup G for every leaf datum.
        var leafNodeG = g.selectAll(".node--leaf")
            .append("g")
            .attr("class", "node--leaf-g")
            .attr("transform", "translate(" + 8 + "," + -13 + ")");

        leafNodeG.append("rect")
            .attr("class", "shadow")
            .style("fill", function (d) { return d.data.color; })
            .attr("width", 2)
            .attr("height", 20)
            .attr("rx", 2)
            .attr("ry", 2)
            .transition()
            .duration(800)
            .attr("width", function (d) { return xScale(d.data.value); });

        leafNodeG.append("text")
            .attr("dy", 14.5)
            .attr("x", 5)
            .style("text-anchor", "start")
            .style("font-size", "11px")
            .text(function (d) {
                return d.data.id.substring(d.data.id.lastIndexOf(".") + 1).split(" ")[0];
            });

        // Write down text for every parent datum
        var internalNode = g.selectAll(".node--internal");
        internalNode.append("text")
            .attr("y", -10)
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .text(function (d) {
                return d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
            });

        // Emphasize the y-axis baseline.
        svg.selectAll(".grid").select("line")
            .style("stroke-dasharray", "20,1")
            .style("stroke", "black");

        // The moving ball
        var ballG = svg.insert("g")
            .attr("class", "ballG")
            .attr("transform", "translate(" + 1100 + "," + height / 2 + ")");
        ballG.insert("circle")
            .attr("class", "shadow")
            .style("fill", "steelblue")
            .attr("r", );
        ballG.insert("text")
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .attr("dy", 3);

        // Animation functions for mouse on and off events.
        d3.selectAll(".node--leaf-g")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        function handleMouseOver(d) {
            tooltip.style("left", d3.event.pageX + 10 + "px");
            tooltip.style("top", d3.event.pageY - 25 + "px");
            tooltip.style("display", "inline-block");
            tooltip.html(d.data.id.substring(d.data.id.lastIndexOf(".") + 1));
            
            var leafG = d3.select(this);

            leafG.select("rect")
                .attr("stroke", "#4D4D4D")
                .attr("stroke-width", "2");

            var ballGMovement = ballG.transition()
                .duration(400)
                .attr("transform", "translate(" + (d.y
                    + xScale(d.data.value) + 90) + ","
                + (d.x + 1.5) + ")");

            ballGMovement.select("circle")
                .style("fill", d.data.color)
                .attr("r", 18);

            ballGMovement.select("text")
                .delay(300)
                .text(d3.format(",")(d.data.value));

            
        }
        function handleMouseOut() {
            var leafG = d3.select(this);

            leafG.select("rect")
                .attr("stroke-width", "0");

            tooltip.style("display", "none");
        }

    });
}
function row(d) {
    return {
        id: d.id,
        value: +d.value,
        color: d.color
    };
}
drawtree();