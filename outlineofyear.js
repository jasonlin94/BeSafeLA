var svg_year = d3.select("#v-pills-time").select("svg"),
    margin = { top: 20, right: 20, bottom: 100, left: 40 },
    margin2 = { top: 330, right: 20, bottom: 30, left: 40 },
    width1 = +svg_year.attr("width") - margin.left - margin.right,
    height1 = +svg_year.attr("height") - margin.top - margin.bottom,
    height2 = +svg_year.attr("height") - margin2.top - margin2.bottom;


var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleTime().range([0, width1]),
    x2 = d3.scaleTime().range([0, width1]),
    y = d3.scaleLinear().range([height1, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width1, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width1, height1]])
    .extent([[0, 0], [width1, height1]])
    .on("zoom", zoomed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) { return x(d.date); })
    .y0(height1)
    .y1(function (d) { return y(d.case); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) { return x2(d.date); })
    .y0(height2)
    .y1(function (d) { return y2(d.case); });

svg_year.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width1)
    .attr("height", height1);

var focus = svg_year.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg_year.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("dforYear.csv", type, function (error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([10000, d3.max(data, function (d) { return d.case; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height1 + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    svg_year.append("rect")
        .attr("class", "zoom")
        .attr("width", width1)
        .attr("height", height1)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);
    svg_year.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width1 / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
    d.date = parseDate(d.date);
    d.case = +d.case;
    return d;
}