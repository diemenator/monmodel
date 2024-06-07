const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 200;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.style.margin = 0;
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x000000);

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

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("color", "#ffffff")
  .style("background-color", "#333333");

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("position", "absolute")
  .style("top", 0)
  .style("left", 0);

const hud = svg.append("g")
  .attr("class", "hud");

const selectedText = hud.append("text")
  .attr("class", "selected-text")
  .attr("x", 10)
  .attr("y", 30)
  .attr("fill", "white")
  .text("Selected: None");

const zoomInButton = hud.append("text")
  .attr("class", "zoom-button")
  .attr("x", 10)
  .attr("y", 60)
  .attr("fill", "white")
  .text("Zoom In")
  .style("cursor", "pointer")
  .on("click", () => {
    camera.position.z -= 10;
  });

const zoomOutButton = hud.append("text")
  .attr("class", "zoom-button")
  .attr("x", 10)
  .attr("y", 90)
  .attr("fill", "white")
  .text("Zoom Out")
  .style("cursor", "pointer")
  .on("click", () => {
    camera.position.z += 10;
  });

let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

document.addEventListener('wheel', (event) => {
  const zoomSpeed = 0.1;
  camera.position.z += event.deltaY * zoomSpeed;
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let nodes3D = [];
let links3D = [];
let simulation;

function selectObject(object) {
  if (object) {
    selectedText.text(`Selected: Node ${object.id}`);
    tooltip.html(object.richContent)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px")
      .style("display", "block");

    window.location.hash = `node-${object.id}`;
  } else {
    selectedText.text("Selected: None");
    tooltip.style("display", "none");

    history.replaceState({}, document.title, ".");
  }
}

function handleNodeSelection(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(nodes3D.map(node => node.mesh));

  if (intersects.length > 0) {
    const selectedNode = nodes3D.find(node => node.mesh === intersects[0].object);
    selectObject(selectedNode);
  } else {
    selectObject(null);
  }
}

document.addEventListener('click', handleNodeSelection, false);

function loadGraphData() {
  const data = JSON.parse(sessionStorage.getItem('graphData'));

  if (!data) return;

  const nodes = data.nodes;
  const links = data.links;

  // Clear existing nodes and links
  nodes3D.forEach(node => scene.remove(node.mesh));
  links3D.forEach(link => scene.remove(link.line));
  nodes3D = [];
  links3D = [];

  // Create 3D nodes and links
  const nodeGeometry = new THREE.SphereGeometry(5, 32, 32);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6347 });

  nodes3D = nodes.map(node => {
    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    mesh.position.set(node.x, node.y, node.z);
    scene.add(mesh);
    return { ...node, mesh };
  });

  const linkMaterial = new THREE.LineBasicMaterial({ color: 0x1e90ff });
  links3D = links.map(link => {
    const positions = new Float32Array(6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const line = new THREE.Line(lineGeometry, linkMaterial.clone());
    scene.add(line);
    return { ...link, line };
  });

  // Initialize or update the simulation
  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).distance(50).strength(1))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(0, 0))
    .on("tick", () => {
      nodes3D.forEach((node, i) => {
        node.x = simulation.nodes()[i].x;
        node.y = simulation.nodes()[i].y;
        node.z = simulation.nodes()[i].z;
      });
      updateGraph();
    });
}

function updateGraph() {
  nodes3D.forEach(node => {
    node.mesh.position.set(node.x, node.y, node.z);
  });

  links3D.forEach(link => {
    const positions = link.line.geometry.attributes.position.array;
    positions[0] = nodes3D[link.source].mesh.position.x;
    positions[1] = nodes3D[link.source].mesh.position.y;
    positions[2] = nodes3D[link.source].mesh.position.z;
    positions[3] = nodes3D[link.target].mesh.position.x;
    positions[4] = nodes3D[link.target].mesh.position.y;
    positions[5] = nodes3D[link.target].mesh.position.z;
    link.line.geometry.attributes.position.needsUpdate = true;
  });
}

function animate() {
  requestAnimationFrame(animate);

  camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 100 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

loadGraphData();
animate();

window.addEventListener('storage', loadGraphData);
