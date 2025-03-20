import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

// Constants for the CuBiC game
const LARGE_CUBE_SIZE = 128; // Size of the containing cube
const GRID_SIZE = 16; // 16x16x16 grid
const MINI_CUBE_SIZE = LARGE_CUBE_SIZE / 64; // Much smaller mini-cubes (2 units)
const GRID_SPACING = LARGE_CUBE_SIZE / (GRID_SIZE - 1); // Space between grid points

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(LARGE_CUBE_SIZE, LARGE_CUBE_SIZE, LARGE_CUBE_SIZE);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true; // Enable WebXR
document.body.appendChild(renderer.domElement);

// Add VR button
document.body.appendChild(VRButton.createButton(renderer));

// Orbit controls for PC
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = LARGE_CUBE_SIZE * 3;
controls.minDistance = MINI_CUBE_SIZE * 2;

// Create a mini-cube with color based on position
function createMiniCube(x, y, z) {
    const geometry = new THREE.BoxGeometry(MINI_CUBE_SIZE, MINI_CUBE_SIZE, MINI_CUBE_SIZE);
    
    // Calculate RGB values (0-255) based on position
    const r = Math.floor((x / (GRID_SIZE - 1)) * 255);
    const g = Math.floor((y / (GRID_SIZE - 1)) * 255);
    const b = Math.floor((z / (GRID_SIZE - 1)) * 255);
    
    // Create emissive material
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(r/255, g/255, b/255),
        emissive: new THREE.Color(r/255 * 0.5, g/255 * 0.5, b/255 * 0.5),
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.7
    });
    
    const cube = new THREE.Mesh(geometry, material);
    
    // Position the cube in the grid with proper spacing
    const posX = (x * GRID_SPACING) - (LARGE_CUBE_SIZE / 2);
    const posY = (y * GRID_SPACING) - (LARGE_CUBE_SIZE / 2);
    const posZ = (z * GRID_SPACING) - (LARGE_CUBE_SIZE / 2);
    cube.position.set(posX, posY, posZ);
    
    // Store cube data for interaction
    cube.userData = {
        gridPosition: { x, y, z },
        color: { r, g, b }
    };
    
    // Add edge highlighting (inverted colors)
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(1 - r/255, 1 - g/255, 1 - b/255)
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    cube.add(edges);
    
    return cube;
}

// Create the grid of cubes
const cubes = [];
for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
            const cube = createMiniCube(x, y, z);
            scene.add(cube);
            cubes.push(cube);
        }
    }
}

// Add subtle ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Add directional light for better visibility
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1, 1, 1);
scene.add(dirLight);

// Raycaster for cube selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedCube = null;

// Mouse interaction
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubes);
    
    if (intersects.length > 0) {
        const clickedCube = intersects[0].object;
        
        if (selectedCube) {
            selectedCube.material.emissiveIntensity = 0.5;
        }
        
        selectedCube = clickedCube;
        selectedCube.material.emissiveIntensity = 1.0;
        
        if (event.detail === 2) { // Double click
            enterFirstPersonView(clickedCube);
        }
        
        updateInfo(clickedCube);
    }
}

function enterFirstPersonView(cube) {
    const offset = new THREE.Vector3(0, 0, GRID_SPACING);
    camera.position.copy(cube.position).add(offset);
    controls.target.copy(cube.position);
}

function updateInfo(cube) {
    const info = document.getElementById('info');
    const pos = cube.userData.gridPosition;
    const color = cube.userData.color;
    info.innerHTML = `
        Selected Cube:<br>
        Position: (${pos.x}, ${pos.y}, ${pos.z})<br>
        Color: RGB(${color.r}, ${color.g}, ${color.b})<br>
        <br>
        Controls:<br>
        - Click and drag to rotate<br>
        - Scroll wheel to zoom<br>
        - Click cube to select<br>
        - Double-click for first-person view
    `;
}

// Event listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// VR Setup (only when VR button is clicked)
let vrEnabled = false;
const vrButton = document.createElement('button');
vrButton.textContent = 'Enter VR';
vrButton.style.position = 'absolute';
vrButton.style.bottom = '20px';
vrButton.style.right = '20px';
vrButton.style.padding = '12px 24px';
vrButton.style.border = 'none';
vrButton.style.borderRadius = '4px';
vrButton.style.backgroundColor = '#2196F3';
vrButton.style.color = 'white';
vrButton.style.cursor = 'pointer';
vrButton.style.fontFamily = 'Arial, sans-serif';
vrButton.style.fontSize = '16px';

vrButton.onclick = () => {
    if (!vrEnabled) {
        // Enable WebXR
        renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(renderer));
        
        // Setup VR controllers
        const controllerModelFactory = new XRControllerModelFactory();
        
        const controller1 = renderer.xr.getController(0);
        scene.add(controller1);
        
        const controller2 = renderer.xr.getController(1);
        scene.add(controller2);
        
        const controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        scene.add(controllerGrip1);
        
        const controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        scene.add(controllerGrip2);
        
        // VR controller interaction
        controller1.addEventListener('selectstart', onControllerSelect);
        controller2.addEventListener('selectstart', onControllerSelect);
        
        vrEnabled = true;
        vrButton.style.display = 'none';
    }
};

document.body.appendChild(vrButton);

function onControllerSelect(event) {
    const controller = event.target;
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    
    const intersects = raycaster.intersectObjects(cubes);
    if (intersects.length > 0) {
        const intersectedCube = intersects[0].object;
        if (selectedCube) {
            selectedCube.material.emissiveIntensity = 0.5;
        }
        selectedCube = intersectedCube;
        selectedCube.material.emissiveIntensity = 1.0;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate(); 