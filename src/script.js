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

// Models & Animations
let mixer;
const gltfLoader = new GLTFLoader();

gltfLoader.load("models/AdamHead/glTF/adamHead.gltf", (gltf) => {
  gltf.scene.position.set(-20, 0, 0);
  scene.add(gltf.scene);
});

gltfLoader.load("models/AdamHead/glTF/adamHead.gltf", (gltf) => {
  gltf.scene.position.set(0, 0, 0);
  scene.add(gltf.scene);
});

gltfLoader.load("models/AdamHead/glTF/adamHead.gltf", (gltf) => {
  gltf.scene.position.set(20, 0, 0);
  scene.add(gltf.scene);
});

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
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 1.2, -4);
scene.add(camera);

// Controls
document.getElementById("camera-position-1").addEventListener("click", () => moveCamera(new THREE.Vector3(20, 1.2, -4), new THREE.Vector3(20, 0, 0)));
document.getElementById("camera-position-2").addEventListener("click", () => moveCamera(new THREE.Vector3(0, 1.2, -4), new THREE.Vector3(0, 0, 0)));
document.getElementById("camera-position-3").addEventListener("click", () => moveCamera(new THREE.Vector3(-20, 1.2, -4), new THREE.Vector3(-20, 0, 0)));

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

let targetCameraPosition;

function moveCamera(pos, newTargetPos) {
   console.log("Trying to move camera to: " + pos);
   
   targetCameraPosition = pos.clone();
   controls.target.set(newTargetPos.x, newTargetPos.y, newTargetPos.z);
}

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

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if(targetCameraPosition){
    camera.position.lerp(targetCameraPosition, lerpFactor);

    if(camera.position.distanceTo(targetCameraPosition) < distanceThreshold){
      targetCameraPosition = null;
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
