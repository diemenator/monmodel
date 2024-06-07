function fetchGraphData() {
  fetch('graph.json')
    .then(response => response.json())
    .then(data => {
      // Get current data from session storage
      const currentData = JSON.parse(sessionStorage.getItem('graphData')) || { nodes: [], links: [] };

      // Preserve positions of existing nodes
      data.nodes.forEach(newNode => {
        const existingNode = currentData.nodes.find(node => node.id === newNode.id);
        if (existingNode) {
          newNode.x = existingNode.x;
          newNode.y = existingNode.y;
          newNode.z = existingNode.z;
        } else {
          // Position new nodes close to preexisting adjacent ones
          const adjacentLink = data.links.find(link => link.source === newNode.id || link.target === newNode.id);
          if (adjacentLink) {
            const adjacentNodeId = adjacentLink.source === newNode.id ? adjacentLink.target : adjacentLink.source;
            const adjacentNode = data.nodes.find(node => node.id === adjacentNodeId);
            if (adjacentNode) {
              newNode.x = adjacentNode.x + (Math.random() - 0.5) * 10;
              newNode.y = adjacentNode.y + (Math.random() - 0.5) * 10;
              newNode.z = adjacentNode.z + (Math.random() - 0.5) * 10;
            }
          }
        }
      });

      // Update session storage with new data
      sessionStorage.setItem('graphData', JSON.stringify(data));

      // Trigger storage event to update the renderer
      window.dispatchEvent(new Event('storage'));
    });
}

setInterval(fetchGraphData, 5000); // Poll every 5 seconds
fetchGraphData();
