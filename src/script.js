import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const debugObject = {
  animationToPlay: 0,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f7f052');

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  updateModelPositionAndScale();
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(5, .5, -7);
camera.rotation.y = Math.PI;
scene.add(camera);

// Models & Animations
const gltfLoader = new GLTFLoader();

let marcusBust = null;
gltfLoader.load("models/ma_bust/scene.gltf", (gltf) => {
  marcusBust = gltf.scene;
  marcusBust.lookAt(camera.position);
    
  scene.add(marcusBust);

  updateModelPositionAndScale();
});

//StoicTracker
let currentStoicIndex = 0;

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(-10, 5, -10);
scene.add(directionalLight);

let targetCameraPosition;

function moveCamera(pos, newTargetPos) {
   console.log("Trying to move camera to: " + pos);
   
   targetCameraPosition = pos.clone();
}

//#region Functions
function updateModelPositionAndScale() {
  if (marcusBust) {
    // Adjust position and scale based on screen size
    const scale = Math.min(window.innerWidth / 800, window.innerHeight / 600); // Example scale calculation

    // Position adjustment to center the model
    // The exact values here depend on the desired position and the size/shape of the model
    const offset = new THREE.Vector3(3, 0, 0); // Adjust this offset as needed

    // Adjust position based on aspect ratio
    const aspect = sizes.width / sizes.height;
    if (aspect > 1) {
      // Wider screens: move model to the right (or left)
      marcusBust.position.set(0 * aspect, offset.y, offset.z);
    } else {
      // Taller screens: adjust model position vertically if needed
      marcusBust.position.set(offset.x, offset.y, offset.z);
    }
  }
}
//#endregion

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const lerpFactor = 0.01;
const distanceThreshold = 0.1;

let time = 0;
const modelRotationMultipler = .3;
const rotationRange = Math.PI / 1.8;

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if(marcusBust){
    time += deltaTime;

    marcusBust.rotation.y = Math.sin(time * modelRotationMultipler) * rotationRange / 2;
  }

  if(targetCameraPosition){
    camera.position.lerp(targetCameraPosition, lerpFactor);

    if(camera.position.distanceTo(targetCameraPosition) < distanceThreshold){
      targetCameraPosition = null;
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
