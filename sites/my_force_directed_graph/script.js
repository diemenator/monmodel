const width = window.innerWidth;
const height = window.innerHeight;

// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 200;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// Load skybox texture
const loader = new THREE.CubeTextureLoader();
const skyboxTexture = loader.load([
  'path/to/skybox/px.jpg',
  'path/to/skybox/nx.jpg',
  'path/to/skybox/py.jpg',
  'path/to/skybox/ny.jpg',
  'path/to/skybox/pz.jpg',
  'path/to/skybox/nz.jpg'
]);
scene.background = skyboxTexture;

// Add particles
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = Math.random() * 1000 - 500;
  particlePositions[i * 3 + 1] = Math.random() * 1000 - 500;
  particlePositions[i * 3 + 2] = Math.random() * 1000 - 500;
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({ color: 0x888888 });
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// D3 force-directed graph setup
const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("position", "absolute")
  .style("top", 0)
  .style("left", 0);

// Tooltip div
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

const numNodes = 10;
const nodes = d3.range(numNodes).map((d, i) => ({
  id: i,
  health: Math.random() * 100,
  richContent: `
    <div>
      <h2>Node ${i}</h2>
      <p>This is a detailed description for node ${i}. You can use <strong>HTML</strong> or <em>Markdown</em> here.</p>
      <img src="https://via.placeholder.com/150" alt="Placeholder Image">
      <button onclick="alert('Button clicked!')">Click Me</button>
      <h3>Sample Table</h3>
      <table>
        <tr><th>Header 1</th><th>Header 2</th></tr>
        <tr><td>Data 1</td><td>Data 2</td></tr>
      </table>
      <h3>SVG Widget</h3>
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="40" fill="blue" />
      </svg>
    </div>
  `
}));
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
  .on("mouseover", (event, d) => {
    tooltip
      .html(d.richContent)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px")
      .style("display", "block");
  })
  .on("mouseout", () => {
    tooltip.style("display", "none");
  })
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

// Track mouse movement for camera panning
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animate and render the Three.js scene
function animate() {
  requestAnimationFrame(animate);

  // Camera panning follows the mouse
  camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 100 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

// Start animation
animate();
