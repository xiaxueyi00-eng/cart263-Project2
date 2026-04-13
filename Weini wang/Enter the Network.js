import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const canvas = document.querySelector('#three-ex');

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


const mainC = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 64, 64),
    new THREE.MeshStandardMaterial({
        color: '#e4fdff',
        emissive: '#cff4fd',
        emissiveIntensity: 1,
        roughness: 0.1
    })
);

mainC.position.x = 0;
mainC.castShadow = false;
scene.add(mainC);

mainC.light = new THREE.PointLight(0xFFFFDD, 2.5, 100);
mainC.light.position.set(0, 0, 0);
mainC.light.castShadow = true;
mainC.light.shadow.mapSize.width = 2048;
mainC.light.shadow.mapSize.height = 2048;
mainC.light.shadow.bias = -0.0001;
scene.add(mainC.light);

const particleCount = 1200;
const positions = [];

for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;

    positions.push(x, y, z);
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
    color: '#bfe5f7',
    size: 0.05,
    transparent: true,
    opacity: 0.8
});


const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);


function animate() {
    mainC.rotation.y += 0.01;
    mainC.rotation.x += 0.005;

    particles.rotation.y += 0.0008;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})