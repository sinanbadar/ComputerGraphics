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

camera.position.set(0, 8, 12); 
controls.target.set(0, 1.4, 0); 
controls.update();

const introScreen = document.getElementById('intro-screen');
const startButton = document.getElementById('start-button');
const characterNameInput = document.getElementById('character-name');

startButton.addEventListener('click', () => {
  const name = characterNameInput.value.trim();
  if (!name) {
    alert('Please enter a name.');
    return;
  }

  document.querySelectorAll('.name-field').forEach(f => f.value = name);
  introScreen.style.display = 'none';
  
  const nameDisplay = document.getElementById('name-display');
  nameDisplay.textContent = name;
  nameDisplay.style.display = 'block';


  const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const end = { x: 2, y: 1.5, z: 5 };

  gsap.to(start, {
    duration: 2.5,
    x: end.x,
    y: end.y,
    z: end.z,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.position.set(start.x, start.y, start.z);
      controls.update();
    },
    onComplete: () => {
      zoomToBody(); 
    }
  });

  gsap.to(controls.target, {
    duration: 2.5,
    x: 0,
    y: 0.8,
    z: 0,
    ease: "power2.inOut",
    onUpdate: () => controls.update()
  });
});


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

    const eyeFiles = ['eyes1.glb', 'eyes2.glb', 'eyes3.glb', 'eyes4.glb'];	
    const eyeLoader = new GLTFLoader();
    window.eyeModels = {};
    window.currentEyeIndex = 1;

    eyeFiles.forEach((fileName, i) => {
      eyeLoader.load(`./Models/${fileName}`, (gltfEye) => {
        const eye = gltfEye.scene;
        eye.position.set(0, -1.28, -0.05); 
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

    const noseFiles = ['nose1.glb', 'nose2.glb', 'nose3.glb', 'nose4.glb'];
    const noseLoader = new GLTFLoader();
    window.noseModels = {};
    window.currentNoseIndex = 1;

    noseFiles.forEach((fileName, i) => {
      noseLoader.load(`./Models/${fileName}`, (gltfNose) => {
      const nose = gltfNose.scene;

      nose.traverse(obj => {
        if (obj.isMesh) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0xf2c9a1,
            roughness: 0.6,
            metalness: 0.1
          });
          obj.material.needsUpdate = true;
        }
      });

      nose.position.set(0, -1.25, -0.07);
      nose.rotation.set(0, 0, 0);
      nose.scale.set(1, 1, 1);
      nose.visible = false;

      const headBone = bones.head;
      if (headBone) {
        headBone.add(nose);
      }

      window.noseModels[i + 1] = nose;
    });
    });

    const mouthFiles = ['mouth1.glb', 'mouth2.glb', 'mouth3.glb', 'mouth4.glb'];
    const mouthLoader = new GLTFLoader();
    window.mouthModels = {};
    window.currentMouthIndex = 1;

    mouthFiles.forEach((fileName, i) => {
      mouthLoader.load(`./Models/${fileName}`, (gltfMouth) => {
      const mouth = gltfMouth.scene;

      mouth.traverse(obj => {
        if (obj.isMesh) {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0xf2c9a1,
            roughness: 0.6,
            metalness: 0.1
          });
          obj.material.needsUpdate = true;
        }
      });

      mouth.position.set(0, -1.27, -0.03);
      mouth.rotation.set(0, 0, 0);
      mouth.scale.set(1, 1, 1);
      mouth.visible = false;

      const headBone = bones.head;
      if (headBone) {
        headBone.add(mouth);
      }

      window.mouthModels[i + 1] = mouth;
    });
    });
  },
);

    export let stagePlane = null;
    let currentShaderIndex = 0;
    export const shaderStages = [];

    export function initStageShader(scene) {
      const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);

     const commonVertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const shader1 = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
        vertexShader: commonVertexShader,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            float wave = sin(vUv.x * 20.0 + time * 2.0) * 0.1 + sin(vUv.y * 30.0 + time * 1.5) * 0.1;
            vec3 color = vec3(0.0, 0.4 + wave, 0.8 + wave);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });

      const shader2 = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
        vertexShader: commonVertexShader,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            float gridX = step(0.95, fract(vUv.x * 10.0));
            float gridY = step(0.95, fract(vUv.y * 10.0));
            float glow = max(gridX, gridY);
            vec3 color = mix(vec3(0.0), vec3(0.0, 1.0, 2.0), glow);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });

      const shader3 = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0.0 } },
        vertexShader: commonVertexShader,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            float r = 0.5 + 0.5 * sin(time + vUv.x * 10.0);
            float g = 0.5 + 0.5 * sin(time + vUv.y * 10.0 + 2.0);
            float b = 0.5 + 0.5 * sin(time + vUv.x * 10.0 + 4.0);
            gl_FragColor = vec4(r, g, b, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });

      shaderStages.push(shader1, shader2, shader3);

       currentShaderIndex = Math.floor(Math.random() * shaderStages.length);
      stagePlane = new THREE.Mesh(geometry, shaderStages[currentShaderIndex]);
      stagePlane.rotation.x = -Math.PI / 2;
      scene.add(stagePlane);
    }

    export function cycleShader() {
      if (!stagePlane) return;
      currentShaderIndex = (currentShaderIndex + 1) % shaderStages.length;
      stagePlane.material = shaderStages[currentShaderIndex];
      stagePlane.material.needsUpdate = true;
    }

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

    function animate() {
      requestAnimationFrame(animate);

      shaderStages.forEach(shader => {
        if (shader.uniforms?.time) {
          shader.uniforms.time.value += 0.01;
        }
      });

      renderer.render(scene, camera);
    }
animate();

export { scene, camera, renderer, controls };
