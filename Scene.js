import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from './Build/controls/OrbitControls.js';

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const scene = new THREE.Scene();
scene.background = null;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

export { scene, camera, renderer, light };

const loader = new GLTFLoader();
loader.load(
  './Models/character.glb',
  (gltf) => {
    const character = gltf.scene;
    scene.add(character);

    character.position.set(0, 0, 0);
    character.scale.set(1, 1, 1);

    camera.position.set(2, 1.5, 5);
    camera.lookAt(0, 0.8, 0);

    const skinnedMesh = character.getObjectByProperty('type', 'SkinnedMesh');
    if (!skinnedMesh) {
      console.error('SkinnedMesh not found');
      return;
    }

    const skeleton = skinnedMesh.skeleton;
    const bones = {
      head: skeleton.bones.find(b => b.name.toLowerCase().includes('head')),
      rightArm: skeleton.bones.find(b => b.name.toLowerCase().includes('rightarm')),
      leftArm: skeleton.bones.find(b => b.name.toLowerCase().includes('leftarm')),
      torso: skeleton.bones.find(b =>
        b.name.toLowerCase().includes('spine') || b.name.toLowerCase().includes('torso')
      ),
      leftLeg: skeleton.bones.find(b => b.name.toLowerCase().includes('leftupleg') || b.name.toLowerCase().includes('leftleg')),
      rightLeg: skeleton.bones.find(b => b.name.toLowerCase().includes('rightupleg') || b.name.toLowerCase().includes('rightleg'))
    };

    // Check bones
    Object.entries(bones).forEach(([key, bone]) => {
      if (!bone) console.warn(`${key} bone not found`);
    });

    // Make bones accessible globally
    window.bones = bones;
  },
  undefined,
  (err) => console.error('Error loading GLB:', err)
);

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
