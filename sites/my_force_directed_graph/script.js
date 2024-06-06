const width = window.innerWidth;
const height = window.innerHeight;

// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 200;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.style.margin = 0;
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// Set background color to black
scene.background = new THREE.Color(0x000000);

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

// Tooltip div
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("color", "#ffffff")
  .style("background-color", "#333333");

// SVG HUD
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

// Track mouse movement for camera panning
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Add mouse wheel event listener for zooming
document.addEventListener('wheel', (event) => {
  const zoomSpeed = 0.1;
  camera.position.z += event.deltaY * zoomSpeed;
});

// Function to select a node or edge
function selectObject(object) {
  if (object) {
    selectedText.text(`Selected: ${object.name}`);
    tooltip.html(object.richContent)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px")
      .style("display", "block");
  } else {
    selectedText.text("Selected: None");
    tooltip.style("display", "none");
  }
}

// Fetch graph data from JSON file
fetch('graph.json')
  .then(response => response.json())
  .then(data => {
    const nodes = data.nodes;
    const links = data.links;

    // Create 3D nodes and links
    const nodeGeometry = new THREE.SphereGeometry(5, 32, 32);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6347 }); // Tomato red color for nodes

    const nodes3D = nodes.map(node => {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      mesh.position.set(node.x, node.y, node.z);
      scene.add(mesh);
      return { ...node, mesh };
    });

    const linkMaterial = new THREE.LineBasicMaterial({ color: 0x1e90ff }); // Dodger blue color for links
    const links3D = links.map(link => {
      const positions = new Float32Array(6);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(lineGeometry, linkMaterial.clone());
      scene.add(line);
      return { ...link, line };
    });

    // Function to handle node selection
    function handleNodeSelection(event) {
      event.preventDefault();

      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Get the intersection point with the node
      const intersects = raycaster.intersectObjects(nodes3D.map(node => node.mesh));

      // If there is an intersection, select the corresponding node
      if (intersects.length > 0) {
        const selectedNode = nodes3D.find(node => node.mesh === intersects[0].object);
        selectObject(selectedNode);
      } else {
        selectObject(null);
      }
    }

    // Add event listener for mouse click
    document.addEventListener('click', handleNodeSelection, false);

    // Function to update positions of nodes and links
    function updateGraph() {
      nodes3D.forEach(node => {
        node.mesh.position.set(node.x, node.y, node.z);
      });

      links3D.forEach(link => {
        const positions = link.line.geometry.attributes.position.array;
        positions[0] = nodes[link.source].x;
        positions[1] = nodes[link.source].y;
        positions[2] = nodes[link.source].z;
        positions[3] = nodes[link.target].x;
        positions[4] = nodes[link.target].y;
        positions[5] = nodes[link.target].z;
        link.line.geometry.attributes.position.needsUpdate = true;
      });
    }

    // D3 force-directed graph simulation
    const simulation = d3.forceSimulation(nodes)
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

// Function to select a node or edge
function selectObject(object) {
  if (object) {
    selectedText.text(`Selected: Node ${object.id}`);
    tooltip.html(object.richContent)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px")
      .style("display", "block");

    // Update URL hash
    window.location.hash = `node-${object.id}`;
  } else {
    selectedText.text("Selected: None");
    tooltip.style("display", "none");

    // Clear URL hash
    history.replaceState({}, document.title, ".");
  }
}

// Define raycaster for mouse interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Start animation
animate();
