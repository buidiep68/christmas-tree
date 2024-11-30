// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 11, 20);
camera.lookAt(0, 5, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add tree trunk
const trunkGeometry = new THREE.CylinderGeometry(0.5, 1.5, 3, 32);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
trunk.position.y = -3;

// Add tree layers
function createTreeLayer(radius, height, positionY) {
  const coneGeometry = new THREE.ConeGeometry(radius, height, 30);
  const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);

  cone.position.y = positionY;
  cone.userData.material = coneMaterial;
  return cone;
}
function addGifts(group, numGifts) {
  const giftColors = [0xff0000, 0xffffff, 0xffd700]; // Colors for gifts
  for (let i = 0; i < numGifts; i++) {
    const boxSize = Math.random() * 0.8 + 1; // Random box size
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const color = giftColors[Math.floor(Math.random() * giftColors.length)];
    const boxMaterial = new THREE.MeshStandardMaterial({ color: color });
    const gift = new THREE.Mesh(boxGeometry, boxMaterial);

    // Random position near the trunk
    gift.position.set(
      (Math.random() - 0.5) * 6, // Spread gifts around the tree
      -3.5 + boxSize / 2,         // Ensure gifts sit on the ground
      (Math.random() - 0.5) * 6
    );

    // Slight rotation for variety
    gift.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    group.add(gift);
  }
}


// Add decorative lights
function addDecorativeLights(group, layerRadius, layerHeight, yPosition, numLights) {
  const lightColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff69b4];
  for (let i = 0; i < numLights; i++) {
    const sphereGeometry = new THREE.SphereGeometry(0.15, 15, 10);
    const color = lightColors[Math.floor(Math.random() * lightColors.length)];
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1,
    });
    const light = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const angle = (i / numLights) * Math.PI * 2;
    const radius = layerRadius * 0.9;
    light.position.set(
      radius * Math.cos(angle),
      yPosition + Math.random() * layerHeight * 0.2,
      radius * Math.sin(angle)
    );
    group.add(light);
  }
}

// Add spiral lights dynamically
function addDynamicSpiral(treeGroup, turns, height, baseRadius, segments) {
  const materials = [];
  const spheres = [];

  for (let i = 0; i < segments; i++) {
    const progress = i / segments;
    const angle = progress * Math.PI * 2 * turns;
    const currentRadius = baseRadius * (1 - progress * 0.8);
    const x = currentRadius * Math.cos(angle);
    const z = currentRadius * Math.sin(angle);
    const y = progress * height - height / 7 + 1.5;

    const sphereGeometry = new THREE.SphereGeometry(0.2, 13, 13);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffcc00,
      emissiveIntensity: 0.0,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);

    materials.push(sphereMaterial);
    spheres.push(sphere);
    treeGroup.add(sphere);
  }

  let lightProgress = 0;
  function updateSpiral() {
    lightProgress += 0.002; // Slower update for blinking
    if (lightProgress > 1) lightProgress = 0;

    for (let i = 0; i < segments; i++) {
      const progress = i / segments;
      const phase = (lightProgress - progress + 1) % 1;

      if (phase < 0.5) {
        materials[i].emissiveIntensity = phase * 2; // Fade in
        materials[i].emissive.set(0xffff00); // Yellow
      } else {
        materials[i].emissiveIntensity = (1 - phase) * 2; // Fade out
        materials[i].emissive.set(0xff0000); // Red
      }
    }
  }

  return updateSpiral;
}

// Add falling snowflakes
const snowflakes = [];
function addSnowflakes(numSnowflakes) {
  const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const snowGeometry = new THREE.SphereGeometry(0.1, 8, 8);

  for (let i = 0; i < numSnowflakes; i++) {
    const snowflake = new THREE.Mesh(snowGeometry, snowMaterial);

    snowflake.position.set(
      (Math.random() - 0.5) * 50,
      Math.random() * 20 + 5,
      (Math.random() - 0.5) * 50
    );

    snowflakes.push(snowflake);
    scene.add(snowflake);
  }
}

function animateSnowflakes() {
  snowflakes.forEach((snowflake) => {
    snowflake.position.y -= 0.05;

    if (snowflake.position.y < -5) {
      snowflake.position.y = Math.random() * 20 + 5;
      snowflake.position.x = (Math.random() - 0.5) * 50;
      snowflake.position.z = (Math.random() - 0.5) * 50;
    }
  });
}

// Assemble tree
const treeLayers = [];
function createTree() {
  const treeGroup = new THREE.Group();
  treeGroup.add(trunk);

  const layers = [
    { radius: 5, height: 4, positionY: 2 },
    { radius: 4, height: 3.5, positionY: 4 },
    { radius: 3, height: 3, positionY: 6 },
    { radius: 2, height: 2.5, positionY: 8 },
    { radius: 1.5, height: 2, positionY: 10 },
  ];

  layers.forEach((layer) => {
    const cone = createTreeLayer(layer.radius, layer.height, layer.positionY);
    treeLayers.push(cone.userData.material);
    treeGroup.add(cone);

    addDecorativeLights(treeGroup, layer.radius, layer.height, layer.positionY, 25);
  });

  const starGeometry = new THREE.IcosahedronGeometry(0.5, 0);
  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffff00,
    emissiveIntensity: 1,
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.y = 11.5;
  treeGroup.add(star);

  addGifts(treeGroup, 20);
  return treeGroup;
}

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 15, 13);
scene.add(directionalLight);

// Create tree and snowflakes
const tree = createTree();
const updateSpiral = addDynamicSpiral(tree, 8, 9.5, 7, 250);
scene.add(tree);
addSnowflakes(500);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  tree.rotation.y += 0.005;
  updateSpiral();
  // Animate tree colors with gradient based on green
  const time = Date.now() * 0.001; // Get current time
  treeLayers.forEach((material, index) => {
    const baseHue = 120 / 360; // Hue for green (120 degrees in HSL)
    const lightness = 0.3 + Math.sin(time + index * 0.5) * 0.1; // Vary lightness between 0.2 and 0.4
    const saturation = 0.8; // Keep saturation high for vivid green

    const color = new THREE.Color();
    color.setHSL(baseHue, saturation, lightness); // Use HSL to set color
    material.color = color; // Update material color
  });
  animateSnowflakes();

  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add background music
const audio = document.createElement('audio');
audio.src = '/music/magic-christmas-night-264068.mp3'; // Replace with your music file path
audio.loop = true;

document.body.addEventListener('click', () => {
  audio.play().catch((error) => {
    console.log('Failed to play audio:', error);
  });
});

// Display a message prompting the user to click
const message = document.createElement('div');
message.innerText = 'Click anywhere to enable music!';
message.style.position = 'absolute';
message.style.top = '20%';
message.style.left = '50%';
message.style.transform = 'translate(-50%, -50%)';
message.style.color = 'white';
message.style.fontSize = '24px';
message.style.zIndex = '9999';
document.body.appendChild(message);

// Remove the message after the first click
document.body.addEventListener('click', () => {
  document.body.removeChild(message);
});

