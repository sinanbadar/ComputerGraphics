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

        camera.position.set(2, 1.5, 5);
        camera.lookAt(0, 0.8, 0);

        character.position.set(0, 0, 0);
        character.scale.set(1, 1, 1);

        const skinnedMesh = character.getObjectByProperty('type', 'SkinnedMesh');
        if (!skinnedMesh) {
            console.error('SkinnedMesh not found');
            return;
        }

        const skeleton = skinnedMesh.skeleton;
        const headBone = skeleton.bones.find(bone => bone.name.toLowerCase().includes('head'));

        if (!headBone) {
            console.error('Head bone not found');
            return;
        }

        window.headBone = headBone;

        const slider = document.getElementById('slider-head');
        if (slider && window.noUiSlider) {
            noUiSlider.create(slider, {
                start: 50,
                connect: [true, false],
                range: {
                    min: 0,
                    max: 100
                }
            });

            slider.noUiSlider.on('update', (values, handle) => {
                const scale = parseFloat(values[handle]) / 50;
                if (window.headBone) {
                    window.headBone.scale.set(scale, scale, scale);
                }
            });
        }
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
