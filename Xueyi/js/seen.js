import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================
   BASIC SETUP
========================= */

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "black";

/* =========================
   DOM OVERLAY (SPOTLIGHT + TEXT)
========================= */

let spotlight = document.createElement("div");
spotlight.style.position = "fixed";
spotlight.style.width = "320px";
spotlight.style.height = "320px";
spotlight.style.borderRadius = "50%";
spotlight.style.pointerEvents = "none";
spotlight.style.boxShadow =
    "0 0 70px rgba(255,255,255,0.35), 0 0 0 2500px rgba(0,0,0,0.95)";
spotlight.style.transition = "left 0.05s, top 0.05s";
spotlight.style.zIndex = "10";
document.body.appendChild(spotlight);

let secretText = document.createElement("div");
secretText.innerText = "YOU ARE NOT INVISIBLE";
secretText.style.position = "fixed";
secretText.style.left = "50%";
secretText.style.top = "50%";
secretText.style.transform = "translate(-50%, -50%)";
secretText.style.fontFamily = "monospace";
secretText.style.fontSize = "24px";
secretText.style.letterSpacing = "6px";
secretText.style.color = "white";
secretText.style.opacity = "0";
secretText.style.transition = "opacity 0.4s ease";
secretText.style.zIndex = "2";
document.body.appendChild(secretText);

/* =========================
   THREE.JS SETUP
========================= */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* LIGHT */
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

/* =========================
   GLB LOADER (BUGS)
========================= */

const loader = new GLTFLoader();

let bugs = [];

let bugModels = [
    "../image/bug.glb",
    "../image/bug1.glb",
    "../image/bug2.glb",
    "../image/bug3.glb",
    "../image/bug4.glb",
    "../image/bug5.glb",
    "../image/bug6.glb",
    "../image/bug7.glb",

];

function placeBugs() {

    bugs.forEach(b => scene.remove(b));
    bugs = [];

    let cols = 3;

    bugModels.forEach((src, i) => {

        loader.load(src, (gltf) => {

            let model = gltf.scene;

            let col = i % cols;
            let row = Math.floor(i / cols);

            model.position.x = (col - 1) * 2.2;
            model.position.y = (1 - row) * 2.2;
            model.position.z = 0;

            model.scale.set(0.6, 0.6, 0.6);

            scene.add(model);
            bugs.push(model);
        });

    });
}

placeBugs();
window.addEventListener("resize", placeBugs);

/* =========================
   MOUSE INTERACTION
========================= */

let hoverTimer = null;
let hovering = false;

document.addEventListener("mousemove", (e) => {

    /* spotlight follow */
    spotlight.style.left = (e.clientX - 160) + "px";
    spotlight.style.top = (e.clientY - 160) + "px";

    /* center reveal */
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;

    let dx = e.clientX - cx;
    let dy = e.clientY - cy;

    let distCenter = Math.sqrt(dx * dx + dy * dy);

    if (distCenter < 140) {

        secretText.style.opacity = "1";

        if (!hovering) {
            hovering = true;

            hoverTimer = setTimeout(() => {
                window.location.href = "../weini/document.html";
            }, 3000);
        }

    } else {

        secretText.style.opacity = "0";
        hovering = false;

        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }

    /* =========================
       3D REVEAL (BUGS)
    ========================= */

    let mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );

    bugs.forEach((b) => {

        let dx = mouse.x - b.position.x * 0.2;
        let dy = mouse.y - b.position.y * 0.2;

        let d = Math.sqrt(dx * dx + dy * dy);

        if (d < 0.6) {
            b.visible = true;
            b.scale.set(0.7, 0.7, 0.7);
        } else {
            b.visible = false;
        }
    });

});

/* =========================
   KEYBOARD NAV
========================= */

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
        window.location.href = "../weini/document.html";
    }
});

/* =========================
   ANIMATION LOOP
========================= */

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);

    let time = Date.now() * 0.001;

    bugs.forEach((b, i) => {


        let speed = 0.002;

        b.position.x += Math.sin(time + i * 10) * speed;
        b.position.z += Math.cos(time + i * 8) * speed;


        b.position.y += Math.sin(time * 2 + i) * 0.0015;

        b.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}
animate();

