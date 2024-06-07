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
let selectedNode = null;
let dragging = false;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  if (dragging && selectedNode) {
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5).unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    console.log('yeah');
    selectedNode.fx = pos.x;
    selectedNode.fy = pos.y;

    selectedNode.x = pos.x;
    selectedNode.y = pos.y;
    // Update the Three.js mesh position

    selectedNode.mesh.position.set(pos.x, pos.y, pos.z);
    simulation.alphaTarget(0.2).restart();
  }
});

document.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(nodes3D.map(node => node.mesh));

  if (intersects.length > 0) {
    selectedNode = nodes3D.find(node => node.mesh === intersects[0].object);
    selectObject(selectedNode);
    dragging = true;
    console.log('dragging');
    simulation.alphaTarget(0.3).restart();
  } else {
    selectObject(null);
  }
});

document.addEventListener('mouseup', () => {
  if (selectedNode) {
    selectedNode.fx = null;
    selectedNode.fy = null;
    selectedNode = null;
    dragging = false;
    console.log('not dragging');
    simulation.alphaTarget(0);
  }
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

const nodeGeometry = new THREE.SphereGeometry(5, 32, 32);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6347 });
const linkMaterial = new THREE.LineBasicMaterial({ color: 0x1e90ff });

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

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function objectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

function loadGraphData() {
  if (dragging) return;
  const data = JSON.parse(sessionStorage.getItem('graphData'));

  if (!data) return;

  const nodes = data.nodes;
  const links = data.links;

  let nodesChanged = false;
  let linksChanged = false;

  // Update nodes
  nodes.forEach(newNode => {
    let existingNode = nodes3D.find(n => n.id === newNode.id);
    if (existingNode) { // Only compare IDs
      existingNode.health = newNode.health;
      existingNode.richContent = newNode.richContent;
    } else {
      // Add new nodes
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      mesh.position.set(newNode.x, newNode.y, newNode.z);
      scene.add(mesh);
      nodes3D.push({ ...newNode, mesh });
      nodesChanged = true;
    }
  });

  // Remove deleted nodes
  nodes3D = nodes3D.filter(node => {
    if (nodes.find(n => n.id === node.id)) {
      return true;
    } else {
      scene.remove(node.mesh);
      nodesChanged = true;
      return false;
    }
  });

  // Update links
  links.forEach(newLink => {
    let existingLink = links3D.find(l => l.source === newLink.source && l.target === newLink.target);
    if (existingLink) {
      existingLink.health = newLink.health;
      existingLink.richContent = newLink.richContent;
    } else {
      // Add new links
      const positions = new Float32Array(6);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(lineGeometry, linkMaterial.clone());
      scene.add(line);
      links3D.push({ ...newLink, line });
      linksChanged = true;
    }
  });

  // Remove deleted links
  links3D = links3D.filter(link => {
    if (links.find(l => l.source === link.source && l.target === link.target)) {
      return true;
    } else {
      scene.remove(link.line);
      linksChanged = true;
      return false;
    }
  });

  // Initialize or update the simulation
  if (!simulation) {
    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).distance(50).strength(1))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(0, 0))
      .on("tick", () => {
        nodes3D.forEach((node, i) => {
            if (dragging && (selectedNode == node)) {
              simulation.nodes()[i].x = node.x;
              simulation.nodes()[i].y = node.y;
              simulation.nodes()[i].z = node.z;
            } else {
              node.x = simulation.nodes()[i].x;
              node.y = simulation.nodes()[i].y;
              node.z = simulation.nodes()[i].z;
            }
        });
        updateGraph();
      });
  } else {
    // Update simulation only if there are changes
    if (nodesChanged || linksChanged) {
      const currentNodes = simulation.nodes();
      const currentLinks = simulation.force("link").links();
      nodes.forEach(newNode => {
        let existingNode = currentNodes.find(n => n.id === newNode.id);
        if (!existingNode) {
          currentNodes.push(newNode);
        }
      });
      currentNodes.forEach(existingNode => {
        let newNode = nodes.find(n => n.id === existingNode.id);
        if (newNode) {
          existingNode.health = newNode.health;
          existingNode.richContent = newNode.richContent;
        }
      });

      // Update links
      links.forEach(newLink => {
        let existingLink = currentLinks.find(l => l.source.id === newLink.source && l.target.id === newLink.target);
        if (!existingLink) {
          currentLinks.push(newLink);
        }
      });

      simulation.nodes(currentNodes);
      simulation.force("link").links(currentLinks);
      simulation.alpha(1).restart();
    }
  }
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
