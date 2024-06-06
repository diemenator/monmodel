const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const numNodes = 10;
const nodes = d3.range(numNodes).map((d, i) => ({ id: i }));
const links = d3.range(numNodes - 1).map((d, i) => ({ source: i, target: i + 1 }));

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).distance(50).strength(1))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .on("tick", ticked);

const link = svg.append("g")
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke", "#999")
  .attr("stroke-width", 2);

const node = svg.append("g")
  .selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("fill", d => d3.schemeCategory10[d.id % 10])
  .call(drag(simulation));

node.append("title")
  .text(d => `Node ${d.id}`);

function ticked() {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
}

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}
