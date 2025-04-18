import * as THREE from 'three';

const renderer - new THREE.WebGLRenderer({antialias: true})
import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Optional: expose objects if needed in other files
export { scene, camera, renderer, light };

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



// sliders.forEach((slider) => {
//   slider.addEventListener('input', () => {
//     const intensity = slider.value / 100;
    
//     // Example: control scene brightness or object scale
//     // scene.background = new THREE.Color(`rgb(${255 * intensity}, ${200 * intensity}, ${255})`);
//     // object.scale.set(intensity, intensity, intensity);
    
//     console.log('Slider changed:', slider.value); // dev only
//   });
// });
