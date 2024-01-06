import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#f7f052");

//Data
const stoics = [
  {
    name: "Marcus Aurelius",
    title: "Roman Emperor & Stoic Philosopher",
    quotes: [
      "You have power over your mind — not outside events. Realize this, and you will find strength.",
      "The happiness of your life depends upon the quality of your thoughts.",
      "Waste no more time arguing about what a good man should be. Be one.",
    ],
    info: "Marcus Aurelius was the son of the praetor Marcus Annius Verus and his wife, Domitia Calvilla. He was related through marriage to the emperors Trajan and Hadrian. Marcus's father died when he was three, and he was raised by his mother and paternal grandfather. After Hadrian's adoptive son, Aelius Caesar, died in 138, Hadrian adopted Marcus's uncle Antoninus Pius as his new heir. In turn, Antoninus adopted Marcus and Lucius, the son of Aelius. Hadrian died that year, and Antoninus became emperor. Now heir to the throne, Marcus studied Greek and Latin under tutors such as Herodes Atticus and Marcus Cornelius Fronto. He married Antoninus's daughter Faustina in 145.",
    relativeCameraPos: [5, 0.5, -7],
  },
  {
    name: "Lucius Seneca (The Younger)",
    title: "Statesman, dramatist & satirist",
    quotes: [
      "I am not born for one corner; the whole world is my native land.",
      "Regard a friend as loyal, and you will make him loyal.",
      "He who spares the wicked injures the good.",
    ],
    info: "Seneca was born in Corduba in Hispania, and raised in Rome, where he was trained in rhetoric and philosophy. His father was Seneca the Elder, his elder brother was Lucius Junius Gallio Annaeanus, and his nephew was the poet Lucan. In AD 41, Seneca was exiled to the island of Corsica under emperor Claudius,[2] but was allowed to return in 49 to become a tutor to Nero. When Nero became emperor in 54, Seneca became his advisor and, together with the praetorian prefect Sextus Afranius Burrus, provided competent government for the first five years of Nero's reign. Seneca's influence over Nero declined with time, and in 65 Seneca was forced to take his own life for alleged complicity in the Pisonian conspiracy to assassinate Nero, of which he was probably innocent.[3] His stoic and calm suicide has become the subject of numerous paintings.",
    relativeCameraPos: [31, 0.5, -7],
  },
];

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

  updateModelPosition();
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
camera.position.set(5, 0.5, -7);
camera.rotation.y = Math.PI;
scene.add(camera);

// Models & Animations
const gltfLoader = new GLTFLoader();
let currentBust = null;

let marcusBustOriginalPos = new THREE.Vector3();
let senecaBustOriginalPos = new THREE.Vector3();

let marcusBust = null;
gltfLoader.load("models/ma_bust/scene.gltf", (gltf) => {
  marcusBust = gltf.scene;
  marcusBust.lookAt(camera.position);
  marcusBustOriginalPos.copy(marcusBust.position);

  scene.add(marcusBust);

  currentBust = marcusBust;
  updateModelPosition();

  modelsLoaded++;
  hideLoadingScreen();
});

let senecaBust = null;
gltfLoader.load("models/seneca_bust/scene.gltf", (gltf) => {
  senecaBust = gltf.scene;

  senecaBust.position.set(30, 0, 2);
  senecaBust.rotation.y = Math.PI;
  senecaBust.scale.set(.6, 0.6, 0.6);
  senecaBustOriginalPos.copy(senecaBust.position);

  scene.add(senecaBust);
  updateModelPosition();

  modelsLoaded++;
  hideLoadingScreen();
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

let targetCameraPosition;

function moveCamera(pos) {
  console.log("Trying to move camera to: " + pos);

  targetCameraPosition = pos.clone();
}

//#region Functions
//StoicTracker
let currentStoicIndex = 0;

function updateModelPosition() {
  if (currentBust) {
    // Calculate the offset based on aspect ratio
    const aspect = sizes.width / sizes.height;
    let offset = new THREE.Vector3();

    if (aspect > 1) {
      // Wider screens: adjust the horizontal position
      offset.set(aspect * 1, 0, 0); // Adjust multiplier as needed
    } else {
      // Taller screens: adjust the vertical position (if necessary)
      offset.set(2 / aspect, 0, 0); // Adjust divider as needed
    }

    // Apply this offset to the original position
    if (currentBust === marcusBust) {
      currentBust.position.copy(marcusBustOriginalPos.clone().add(offset));
    } else if (currentBust === senecaBust) {
      currentBust.position.copy(senecaBustOriginalPos.clone().add(offset));
    }
  }
}

function updateStoicInfo() {
  if (currentStoicIndex > stoics.length - 1) {
    currentStoicIndex = 0;
  }
  const stoic = stoics[currentStoicIndex];

  document.getElementById("name").textContent = stoic.name;
  document.getElementById("sub-heading").textContent = stoic.title;

  const quotesList = document.getElementById("quotes");
  quotesList.innerHTML = "";
  stoic.quotes.forEach((quote) => {
    const li = document.createElement("li");
    li.textContent = quote;
    quotesList.appendChild(li);
  });

  document.getElementById(
    "information-section"
  ).innerHTML = `<p>${stoic.info}</p>`;
}

updateStoicInfo();

function setCurrentBust() {
  switch (currentStoicIndex) {
    case 0:
      currentBust = marcusBust;
      break;
    case 1:
      currentBust = senecaBust;
      break;
  }
}

let modelsLoaded = 0;
const totalModels = 2; // Set this to the number of models you are loading

const hideLoadingScreen = () => {
  if (modelsLoaded === totalModels) {
    document.getElementById('loading-screen').style.display = 'none';
  }
};

document
  .getElementById("next-stoic-button")
  .addEventListener("click", (event) => {
    currentStoicIndex++;
    updateStoicInfo();
    setCurrentBust();

    const newCamPos = new THREE.Vector3(
      stoics[currentStoicIndex].relativeCameraPos[0],
      stoics[currentStoicIndex].relativeCameraPos[1],
      stoics[currentStoicIndex].relativeCameraPos[2]
    );
    moveCamera(newCamPos);

    document.getElementById("main-section").scrollTop = 0;
  });
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
const modelRotationMultipler = 0.3;
const rotationRange = Math.PI / 1.8;

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (marcusBust) {
    time += deltaTime;

    marcusBust.rotation.y =
      (Math.sin(time * modelRotationMultipler) * rotationRange) / 2;
  }

  if (senecaBust) {
    senecaBust.rotation.y = 
      Math.PI + (-Math.sin(time * modelRotationMultipler) * rotationRange) / 2;
  }

  if (targetCameraPosition) {
    camera.position.lerp(targetCameraPosition, lerpFactor);

    if (camera.position.distanceTo(targetCameraPosition) < distanceThreshold) {
      targetCameraPosition = null;
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
