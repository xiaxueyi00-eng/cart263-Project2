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

function createStars() {
    stars = [];

    for (let i = 0; i < 200; i++) {
        let star = {
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            r: Math.random() * 2
        };

        stars.push(star);
    }
}

createStars();

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

const finalText = document.querySelector("#finalText");
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
let moveToCorner = false;  // state: move the earth to corner
let textShown = false; // state：final text 
let clickCount = 0; // Count times the user clicks


loader.load("image/earth.glb", (gltf) => {
    model = gltf.scene;

    //target size 
    const finalScale = 0.1;

    //set it start very small 
    model.scale.set(0.001, 0.001, 0.001);

    //compute box to center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    //add model to the scene
    scene.add(model);

    model.userData.finalScale = finalScale;
    model.userData.growing = false;
    model.userData.fullSize = false;
});

/* =========================
   ANIMATION LOOP
========================= */
function animate() {

    //keep the animation loop running
    requestAnimationFrame(animate);

    //slowly rotate the earth model
    if (model) {
        model.rotation.y += 0.002;
    }

    //if the model is in growing state
    if (model && model.userData.growing) {

        //target final size
        const target = model.userData.finalScale;

        model.scale.x += (target - model.scale.x) * 0.03;
        model.scale.y += (target - model.scale.y) * 0.03;
        model.scale.z += (target - model.scale.z) * 0.03;

        //stop growing
        if (Math.abs(target - model.scale.x) < 0.001) {
            model.scale.set(target, target, target);

            //update state
            model.userData.growing = false;
            model.userData.fullSize = true;
        }
    }

    //move to bottom-right
    if (model && moveToCorner) {

        //scale down
        model.scale.x += (0.035 - model.scale.x) * 0.05;
        model.scale.y += (0.035 - model.scale.y) * 0.05;
        model.scale.z += (0.035 - model.scale.z) * 0.05;

        //move towards target position
        model.position.x += (3 - model.position.x) * 0.05;
        model.position.y += (-1.3 - model.position.y) * 0.05;
        model.position.z += (0 - model.position.z) * 0.05;
    }

    //update orbit controls 
    controls.update();

    renderer.render(scene, camera);
}

animate();

//listen for user click interactions
window.addEventListener("click", function () {
    //if model not loaded yet, do nothing
    if (model == null) return;

    clickCount++;

    //click 1, start growing animation
    if (clickCount === 1) {
        model.userData.growing = true;
    }

    //click 2, move earth to corner and show message
    else if (clickCount === 2) {
        moveToCorner = true;

        //only show text once
        if (!textShown) {
            finalText.innerHTML = "TO UPLOAD IS TO EXPOSE";
            finalText.style.opacity = "1";
            textShown = true;
        }
    }

    //click 3, back to homepage
    else if (clickCount === 3) {
        window.location.href = "../xueyi-xia/html/index.html";
    }
});

//add windows resize
window.addEventListener('resize', () => {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    createStars();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})
