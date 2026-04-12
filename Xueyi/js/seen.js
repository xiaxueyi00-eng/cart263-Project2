/*
  SEEN — Three.js Perception System
  Move the light to reconstruct hidden fragments.
*/

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ================= SCENE =================
const scene = new THREE.Scene();

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 3;

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ================= CONTROLS =================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ================= LIGHT =================
scene.add(new THREE.AmbientLight(0xffffff, 2));

// ================= MOUSE =================
const mouse = new THREE.Vector2();

// ================= BUG SYSTEM =================
const bugs = [];
let bugModel = null;

// ================= ADD BUG FUNCTION =================
function addBug(x, y, z) {

    const clone = bugModel.clone();

    clone.position.set(x, y, z);

    clone.visible = false;

    // 🐛 crawl direction
    clone.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.005
    );

    scene.add(clone);
    bugs.push(clone);
}

// ================= LOAD MODEL =================
const loader = new GLTFLoader();

loader.load("../image/bug.glb", (gltf) => {

    bugModel = gltf.scene;
    bugModel.scale.set(0.2, 0.2, 0.2);

    // ================= MANUAL PLACEMENT =================
    addBug(0, 0, 0);
    addBug(2, 1, -1);
    addBug(-2, -1, 1);
    addBug(1.5, -1, 0.5);
    addBug(-1.5, 1, -0.5);
    addBug(0.5, 2, -1.5);
});

// ================= MOUSE MOVE =================
window.addEventListener("mousemove", (e) => {

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ================= ANIMATE =================
function animate() {

    requestAnimationFrame(animate);

    bugs.forEach(b => {

        // 🐛 crawl movement
        b.position.add(b.userData.velocity);

        // 🔄 slight rotation (alive feeling)
        b.rotation.y += 0.01;

        // 👁️ circular scan reveal
        const dx = b.position.x - (mouse.x * 3);
        const dy = b.position.y - (mouse.y * 2);

        const dist = Math.sqrt(dx * dx + dy * dy);

        // 🌟 scan radius
        b.visible = dist < 1.3;
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();