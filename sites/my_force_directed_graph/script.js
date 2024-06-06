const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const numNodes = 10;
const nodes = d3.range(numNodes).map((d, i) => ({ id: i, health: Math.random() * 100 }));
const links = d3.range(numNodes - 1).map((d, i) => ({ source: i, target: i + 1, health: Math.random() * 100 }));

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

const linkLabels = svg.append("g")
  .selectAll(".link-label")
  .data(links)
  .enter()
  .append("text")
  .attr("class", "link-label")
  .attr("dy", -3)
  .text(d => `Health: ${d.health.toFixed(1)}`);

const linkHealthBarsBg = svg.append("g")
  .selectAll(".link-health-bar-bg")
  .data(links)
  .enter()
  .append("rect")
  .attr("class", "health-bar-bg")
  .attr("width", 50)
  .attr("height", 5);

const linkHealthBarsFg = svg.append("g")
  .selectAll(".link-health-bar-fg")
  .data(links)
  .enter()
  .append("rect")
  .attr("class", "health-bar-fg")
  .attr("width", d => (d.health / 100) * 50)
  .attr("height", 5);

const node = svg.append("g")
  .selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("fill", d => d3.schemeCategory10[d.id % 10])
  .call(drag(simulation));

const nodeLabels = svg.append("g")
  .selectAll(".node-label")
  .data(nodes)
  .enter()
  .append("text")
  .attr("class", "node-label")
  .attr("dy", -15)
  .text(d => `Node ${d.id}`);

const nodeHealthBarsBg = svg.append("g")
  .selectAll(".node-health-bar-bg")
  .data(nodes)
  .enter()
  .append("rect")
  .attr("class", "health-bar-bg")
  .attr("width", 50)
  .attr("height", 5);

const nodeHealthBarsFg = svg.append("g")
  .selectAll(".node-health-bar-fg")
  .data(nodes)
  .enter()
  .append("rect")
  .attr("class", "health-bar-fg")
  .attr("width", d => (d.health / 100) * 50)
  .attr("height", 5);

node.append("title")
  .text(d => `Node ${d.id}\nHealth: ${d.health.toFixed(1)}`);

function ticked() {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  linkLabels
    .attr("x", d => (d.source.x + d.target.x) / 2)
    .attr("y", d => (d.source.y + d.target.y) / 2);

  linkHealthBarsBg
    .attr("x", d => (d.source.x + d.target.x) / 2 - 25)
    .attr("y", d => (d.source.y + d.target.y) / 2 - 3);

  linkHealthBarsFg
    .attr("x", d => (d.source.x + d.target.x) / 2 - 25)
    .attr("y", d => (d.source.y + d.target.y) / 2 - 3)
    .attr("width", d => (d.health / 100) * 50);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  nodeLabels
    .attr("x", d => d.x)
    .attr("y", d => d.y);

  nodeHealthBarsBg
    .attr("x", d => d.x - 25)
    .attr("y", d => d.y + 12);

  nodeHealthBarsFg
    .attr("x", d => d.x - 25)
    .attr("y", d => d.y + 12)
    .attr("width", d => (d.health / 100) * 50);
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
