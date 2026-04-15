import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/loaders/GLTFLoader.js";
/* =========================
   STAR BACKGROUND (2D CANVAS)
========================= */
const starCanvas = document.querySelector("#stars");
const ctx = starCanvas.getContext("2d");

starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;

starCanvas.style.position = "fixed";
starCanvas.style.top = "0";
starCanvas.style.left = "0";
starCanvas.style.zIndex = "-1";

let stars = [];

for (let i = 0; i < 200; i++) {
    let star = {
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 2
    };

    stars.push(star);
}

function animateStars() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);

    ctx.fillStyle = "white";

    for (let i = 0; i < stars.length; i++) {

        let s = stars[i];

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        s.y = s.y + 0.3;

        if (s.y > starCanvas.height) {
            s.y = 0;
        }
    }

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
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
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


loader.load("image/earth.glb", (gltf) => {
    model = gltf.scene;

    const finalScale = 0.1;

    model.scale.set(0.001, 0.001, 0.001);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    model.userData.finalScale = finalScale;
    model.userData.growing = true;
});

// ===== INTERACTION =====
window.addEventListener("mousemove", function () {

    if (model && exploded === false) {
        model.scale.set(0.11, 0.11, 0.11);
    }
});

/* =========================
   ANIMATION LOOP
========================= */
function animate() {

    requestAnimationFrame(animate);

    if (model && exploded === false) {
        model.rotation.y = model.rotation.y + 0.002;
    }

    if (model && exploded === true) {

        model.scale.multiplyScalar(0.98);

        camera.position.z = camera.position.z * 0.99;
    }

    controls.update();

    renderer.render(scene, camera);
}

animate();
/* =========================
   CLICK EVENT (TRIGGER MENU)
========================= */

// Click model/canvas to trigger "explosion + UI reveal"
renderer.domElement.addEventListener("pointerdown", function () {

    // If model is not loaded, stop running
    if (model == null) {
        return;
    }

    // =========================
    // 1. Set state
    // =========================
    exploded = true;

    // =========================
    // 2. Get menu element
    // =========================
    var menu = document.getElementById("menu");

    // =========================
    // 3. Show menu (add CSS class)
    // =========================
    menu.classList.add("show");
    document.body.classList.add("menu-open");

    // =========================
    // 4. Get all menu items (links)
    // =========================
    var items = menu.querySelectorAll("a");

    // =========================
    // 5. Wait before animation starts
    // =========================
    setTimeout(function () {

        // =========================
        // 6. Show items one by one
        // =========================
        for (var i = 0; i < items.length; i++) {

            showItem(items[i], i);
        }

    }, 2000);
});


// =========================
// Helper function: show each menu item
// =========================
function showItem(item, index) {

    setTimeout(function () {

        // Make item visible
        item.style.opacity = "1";

        // Move item to normal position
        item.style.transform = "translateY(0)";

    }, index * 100);
}