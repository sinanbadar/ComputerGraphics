import * as THREE from 'three';

// Removed duplicate and incorrect renderer declaration
// import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';

import { OrbitControls } from './Build/controls/OrbitControls.js';

const camera = new THREE.PerspectiveCamera(
  25,                                    
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

export { scene, camera, renderer, light };

const loader = new GLTFLoader();
loader.load(
  './Models/character.glb', 
  (gltf) => {
    const character = gltf.scene;
    scene.add(character);

    camera.position.set(2, 1.5, 5);         
    camera.lookAt(0, 0.8, 0);  

    character.position.set(0, 0, 0);
    character.scale.set(1, 1, 1);

    window.character = character;
  },
  undefined,
  (error) => {
    console.error('Error loading character.glb:', error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
