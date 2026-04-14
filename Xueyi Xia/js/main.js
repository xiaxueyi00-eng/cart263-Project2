import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
/* =========================
   STAR BACKGROUND (2D CANVAS)
========================= */
// Get canvas for star animation
const starCanvas = document.querySelector("#stars");
const ctx = starCanvas.getContext("2d");
// Set canvas size to full screen
starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;
// Fix canvas as background layer
starCanvas.style.position = "fixed";
starCanvas.style.top = 0;
starCanvas.style.left = 0;
starCanvas.style.zIndex = -1;
// Create star particles
let stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 2
    });
}
// Animate stars falling downward
function animateStars() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
    // Draw stars
    ctx.fillStyle = "white";

    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        // Move star downward
        s.y += 0.3;
        // Reset position when out of screen
        if (s.y > starCanvas.height) s.y = 0;
    });

    requestAnimationFrame(animateStars);
}
animateStars();


/* =========================
   THREE.JS BASIC SCENE SETUP
========================= */

// Create 3D scene
const scene = new THREE.Scene();
// Create camera (FOV, aspect ratio, near, far)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Set initial camera position
camera.position.set(0, 0, 3);
// Get WebGL canvas
const canvas = document.querySelector("#three");
// Create renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true // allow transparent background
});

renderer.setSize(window.innerWidth, window.innerHeight);

/* =========================
   CONTROLS (ORBIT CAMERA)
========================= */

// Enable mouse orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

/* =========================
   LIGHTING
========================= */

// Soft ambient light (global lighting)
scene.add(new THREE.AmbientLight(0xffffff, 2));
// Directional light (like sun light)
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

/* =========================
   LOAD 3D MODEL
========================= */
const loader = new GLTFLoader();

let model = null;      // store loaded model
let exploded = false;  // state: whether animation is triggered


loader.load(
    "../image/earth.glb",
    (gltf) => {
        model = gltf.scene;
        // Scale model down
        model.scale.set(0.1, 0.1, 0.1);
        // Center model geometry
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        // Add model to scene
        scene.add(model);
    }
);

// ===== INTERACTION =====
window.addEventListener("mousemove", () => {
    if (model && !exploded) {
        model.scale.set(0.11, 0.11, 0.11);
    }
});

/* =========================
   ANIMATION LOOP
========================= */

function animate() {
    requestAnimationFrame(animate);
    // Normal rotation before explosion
    if (model && !exploded) {
        model.rotation.y += 0.002;
    }
    // Explosion state animation
    if (model && exploded) {
        model.scale.multiplyScalar(0.98);
        camera.position.z *= 0.99;
    }
    // Update controls
    controls.update();
    // Render scene
    renderer.render(scene, camera);
}

animate();

/* =========================
   CLICK EVENT (TRIGGER MENU)
========================= */

// Click model/canvas to trigger "explosion + UI reveal"
renderer.domElement.addEventListener("pointerdown", () => {
    if (!model) return;

    exploded = true;

    const menu = document.getElementById("menu");
    menu.classList.add("show");
    document.body.classList.add("menu-open");
    // Show menu UI
    const items = menu.querySelectorAll("a");
    // Animate menu items appearing one by one
    setTimeout(() => {
        items.forEach((item, i) => {
            setTimeout(() => {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            }, i * 100);
        });
    }, 2000);
});