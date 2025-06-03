import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.update();

const gltfLoader = new GLTFLoader();
let modelScene = null;

gltfLoader.load(
  './Models/character.glb',
  (gltf) => {
    modelScene = gltf.scene;
    scene.add(modelScene);

    window.skinMeshes = [];
    modelScene.traverse((obj) => {
      if (obj.isMesh) {
        const skinMat = new THREE.MeshStandardMaterial({
          color: 0xf2c9a1,
          roughness: 0.6,
          metalness: 0.1
        });
        obj.material = skinMat;
        obj.material.needsUpdate = true;
        window.skinMeshes.push(obj);
      }
    });

    const skinnedMesh = modelScene.getObjectByProperty('type', 'SkinnedMesh');
    if (!skinnedMesh) {
      console.error('SkinnedMesh not found in character.glb');
      return;
    }

    const skeleton = skinnedMesh.skeleton;
    const bones = {
      head: skeleton.bones.find(b => b.name.toLowerCase().includes('head')),
      rightArm: skeleton.bones.find(b => b.name.toLowerCase().includes('rightarm')),
      leftArm: skeleton.bones.find(b => b.name.toLowerCase().includes('leftarm')),
      torso: skeleton.bones.find(b =>
        b.name.toLowerCase().includes('spine') ||
        b.name.toLowerCase().includes('torso')
      ),
      leftLeg: skeleton.bones.find(b =>
        b.name.toLowerCase().includes('leftupleg') ||
        b.name.toLowerCase().includes('leftleg')
      ),
      rightLeg: skeleton.bones.find(b =>
        b.name.toLowerCase().includes('rightupleg') ||
        b.name.toLowerCase().includes('rightleg')
      ),
      leftFoot: skeleton.bones.find(b => b.name.toLowerCase().includes('leftfoot')),
      rightFoot: skeleton.bones.find(b => b.name.toLowerCase().includes('rightfoot')),
      leftHand: skeleton.bones.find(b => b.name.toLowerCase().includes('lefthand')),
      rightHand: skeleton.bones.find(b => b.name.toLowerCase().includes('righthand'))
    };
    Object.entries(bones).forEach(([key, bone]) => {
      if (!bone) console.warn(`${key} bone not found`);
    });
    window.bones = bones;

    const hairFiles = ['hair1.glb', 'hair2.glb', 'hair3.glb', 'hair4.glb', 'hair5.glb'];
    const hairLoader = new GLTFLoader();
    window.hairModels = {};
    window.currentHairIndex = 1;

    hairFiles.forEach((fileName, i) => {
      hairLoader.load(`./Models/${fileName}`, (gltfHair) => {
        const hair = gltfHair.scene;

        hair.position.set(0, 0.39, -0.06);
        hair.rotation.set(0, 0, 0);
        hair.scale.set(1, 1, 1);
        hair.visible = false;
        const headBone = bones.head;
        if (headBone) {
          headBone.add(hair);
        }
        window.hairModels[i + 1] = hair;
      });
    });

    const eyeFiles = ['eyes1.glb', 'eyes2.glb', 'eyes3.glb', 'eyes4.glb', 'eyes5.glb'];	
    const eyeLoader = new GLTFLoader();
    window.eyeModels = {};
    window.currentEyeIndex = 1;

    eyeFiles.forEach((fileName, i) => {
      eyeLoader.load(`./Models/${fileName}`, (gltfEye) => {
        const eye = gltfEye.scene;
        eye.position.set(0, -1.28, -0.05); // adjust as needed
        eye.rotation.set(0, 0, 0);
        eye.scale.set(1, 1, 1);
        eye.visible = false;
        const headBone = bones.head;
        if (headBone) {
          headBone.add(eye);
        }
        window.eyeModels[i + 1] = eye;
      });
    });
  },
  undefined,
  (error) => console.error('Error loading character.glb:', error)
);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

export { scene, camera, renderer, controls };
