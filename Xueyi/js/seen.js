import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================
   BASIC SETUP
========================= */

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "black";

/* =========================
   EXIT
========================= */

let exit = document.createElement("div");
exit.innerText = "EXIT";
exit.style.position = "fixed";
exit.style.left = "70%";
exit.style.top = "60%";
exit.style.color = "white";
exit.style.fontFamily = "monospace";
exit.style.fontSize = "20px";
exit.style.opacity = "0";
exit.style.cursor = "pointer";
exit.style.transition = "0.3s";
document.body.appendChild(exit);

exit.addEventListener("click", () => {
    window.location.href = "next.html";
});

/* =========================
   UI BAR
========================= */

let bar = document.createElement("div");
bar.style.position = "fixed";
bar.style.left = "50%";
bar.style.top = "20px";
bar.style.transform = "translateX(-50%)";
bar.style.width = "400px";
bar.style.height = "6px";
bar.style.background = "white";
bar.style.boxShadow = "0 0 15px rgba(255,0,0,0.2)";
document.body.appendChild(bar);

let eat = document.createElement("div");
eat.style.height = "100%";
eat.style.width = "0%";
eat.style.background = "#ff0000";
eat.style.boxShadow = "0 0 10px red";
bar.appendChild(eat);

/* =========================
   SPOTLIGHT
========================= */

let spotlight = document.createElement("div");
spotlight.style.position = "fixed";
spotlight.style.width = "320px";
spotlight.style.height = "320px";
spotlight.style.borderRadius = "50%";
spotlight.style.pointerEvents = "none";
spotlight.style.boxShadow =
    "0 0 70px rgba(255,255,255,0.35), 0 0 0 2500px rgba(0,0,0,0.95)";
spotlight.style.zIndex = "10";
document.body.appendChild(spotlight);

/* =========================
   THREE SETUP
========================= */

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 2, 12);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

/* LIGHT */
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);

scene.add(new THREE.AmbientLight(0x222222));

/* =========================
   BUGS
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
    "../image/bug8.glb",
    "../image/bug9.glb",
    "../image/bug10.glb",
    "../image/bug11.glb",
    "../image/bug12.glb",
    "../image/bug13.glb",
    "../image/bug14.glb",
];

function placeBugs() {
    bugs.forEach(b => scene.remove(b));
    bugs = [];

    bugModels.forEach((src) => {
        loader.load(src, (gltf) => {
            const model = gltf.scene;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.5,
                        metalness: 0.1,
                    });
                }
            });

            let s = 0.25 + Math.random() * 0.25;
            model.scale.setScalar(s);

            model.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4
            );


            model.userData.target = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                model.position.y,
                (Math.random() - 0.5) * 4
            );

            scene.add(model);
            bugs.push(model);
        });
    });
}

placeBugs();

/* =========================
   MOUSE
========================= */

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    spotlight.style.left = (mouseX - 160) + "px";
    spotlight.style.top = (mouseY - 160) + "px";
});

/* =========================
   GAME STATE
========================= */

let eatPower = 0;
let exitTimer = 0;
let exitReady = false;

/* =========================
   ANIMATE
========================= */

function animate() {
    requestAnimationFrame(animate);

    let danger = 0;

    bugs.forEach((b) => {
        if (!b.userData.target) return;

        b.position.x += (b.userData.target.x - b.position.x) * 0.02;
        b.position.z += (b.userData.target.z - b.position.z) * 0.02;

        let dx = b.position.x - (mouseX / window.innerWidth - 0.5) * 6;
        let dz = b.position.z - (mouseY / window.innerHeight - 0.5) * 6;

        let dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 1) danger++;
    });

    eatPower += danger * 0.01;
    eatPower = Math.max(0, Math.min(1, eatPower));

    eat.style.width = (eatPower * 100) + "%";
    eat.style.background = `rgb(255, ${255 - eatPower * 255}, 0)`;

    renderer.render(scene, camera);

    /* EXIT LOGIC */
    if (eatPower > 0.6) {
        exitTimer++;
        if (exitTimer > 120) exitReady = true;
    } else {
        exitTimer = 0;
        exitReady = false;
    }

    if (exitReady) {
        exit.style.opacity = "1";
        exit.style.transform = "scale(1.2)";
    } else {
        exit.style.opacity = "0";
        exit.style.transform = "scale(1)";
    }
}

animate();