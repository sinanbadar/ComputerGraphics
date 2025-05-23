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

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);


export { scene, camera, renderer, light };

const loader = new GLTFLoader();
loader.load(
  './Models/character.glb',
  (gltf) => {
    const character = gltf.scene;
    scene.add(character);

    character.position.set(0, 0, 0);
    character.scale.set(1, 1, 1);

    controls.target.set(0, 0.8, 0); 
    controls.update(); 


    camera.position.set(2, 1.5, 5);
    camera.lookAt(0, 0.8, 0);

    const skinnedMesh = character.getObjectByProperty('type', 'SkinnedMesh');
    if (!skinnedMesh) {
      console.error('SkinnedMesh not found');
      return;
    }

   window.skinMeshes = [];

   character.traverse(obj => {
      if (obj.isMesh) {
        const skinMaterial = new THREE.MeshStandardMaterial({
          color: 0xf2c9a1, 
          roughness: 0.6,
          metalness: 0.1
        });
        obj.material = skinMaterial;
        obj.material.needsUpdate = true;
        window.skinMeshes.push(obj);
      }
    });

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

    Object.entries(bones).forEach(([key, bone]) => {
      if (!bone) console.warn(`${key} bone not found`);
    });

    window.bones = bones;

    const hairFiles = ['hair1.glb', 'hair2.glb', 'hair3.glb', 'hair4.glb', 'hair5.glb'];
    const hairLoader = new GLTFLoader();
    window.hairModels = {}; 
    window.currentHairIndex = 1;

    hairFiles.forEach((fileName, i) => {
    hairLoader.load(`./Models/${fileName}`, (gltf) => {
      const hair = gltf.scene;

      hair.traverse(obj => {
        if (obj.isMesh) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0xffffff, // starting hair color
            roughness: 0.5,
            metalness: 0.1
          });
          obj.material.needsUpdate = true;
        }
      });

      if (fileName === 'hair1.glb') {
        hair.position.set(0, 0.39, -0.06);
      } else if (fileName === 'hair2.glb') {
        hair.position.set(0, 0.39, -0.07); 
      } else if (fileName === 'hair3.glb') {
        hair.position.set(0, 0.39, -0.06); 
      } else if (fileName === 'hair4.glb') {
        hair.position.set(0, 0.39, -0.06); 
      } else if (fileName === 'hair5.glb') {
        hair.position.set(0, 0.39, -0.06); 
      }


      hair.rotation.set(0, 0, 0);
      hair.scale.set(1, 1, 1);

      hair.visible = false;

      if (bones.head) {
        bones.head.add(hair);
        console.log(`${fileName} attached to head`);
      } else {
        console.warn(`Head bone not found for ${fileName}`);
      }

      window.hairModels[i + 1] = hair;
    });
  });
    },
  undefined,
  (err) => console.error('Error loading character.glb:', err)
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
