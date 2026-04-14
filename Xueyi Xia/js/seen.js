import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================
   BASIC SETUP
========================= */

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "black";


/* =========================
   STORY TEXT
========================= */

let story = document.createElement("div");
document.body.appendChild(story);

story.style.position = "fixed";
story.style.top = "40%";
story.style.left = "50%";
story.style.transform = "translate(-50%, -50%)";
story.style.color = "white";
story.style.fontFamily = "monospace";
story.style.fontSize = "22px";
story.style.textAlign = "center";
story.style.opacity = "0";
story.style.transition = "1s";

let storyLines = [
    "YOU HAVE ENTERED THE SYSTEM",
    "YOUR MOVEMENTS ARE BEING TRACKED",
    "YOU ARE NOT IN CONTROL",
    "ESCAPE IF YOU CAN"
];

let storyIndex = 0;

function showStory() {

    if (storyIndex >= storyLines.length) {
        story.style.opacity = "0";
        return;
    }

    story.innerText = storyLines[storyIndex];
    story.style.opacity = "1";

    setTimeout(() => {
        story.style.opacity = "0";

        storyIndex++;

        setTimeout(showStory, 1200);
    }, 2000);
}

setTimeout(showStory, 1000);



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

const loader = new GLTFLoader();

let key;

loader.load("../image/key.glb", (gltf) => {
    key = gltf.scene;

    key.scale.set(0.5, 0.5, 0.5);
    key.position.set(0, 0, -2);

    key.visible = false;

    scene.add(key);
});

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
    "../image/bug14.glb"
];

function placeBugs() {

    // remove old
    for (let i = 0; i < bugs.length; i++) {
        scene.remove(bugs[i]);
    }

    bugs = [];

    for (let i = 0; i < bugModels.length; i++) {

        loader.load(bugModels[i], function (gltf) {

            let model = gltf.scene;

            model.traverse(function (child) {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.5,
                        metalness: 0.1
                    });
                }
            });

            let scale = 0.25 + Math.random() * 0.25;
            model.scale.set(scale, scale, scale);

            model.position.x = (Math.random() - 0.5) * 8;
            model.position.y = (Math.random() - 0.5) * 6;
            model.position.z = (Math.random() - 0.5) * 4;

            model.userData.target = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                model.position.y,
                (Math.random() - 0.5) * 4
            );

            scene.add(model);
            bugs.push(model);
        });
    }
}

placeBugs();


/* =========================
   MOUSE
========================= */

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", function (event) {

    mouseX = event.clientX;
    mouseY = event.clientY;

    spotlight.style.left = (mouseX - 160) + "px";
    spotlight.style.top = (mouseY - 160) + "px";
});

/* =========================
   GAME STATE
========================= */
let startTime = Date.now();
let timeLimit = 80;
let restartTriggered = false;


let timer = document.createElement("div");
timer.style.position = "fixed";
timer.style.top = "50px";
timer.style.left = "50%";
timer.style.transform = "translateX(-50%)";
timer.style.color = "white";
timer.style.fontFamily = "Arial";
timer.style.fontSize = "18px";
timer.style.zIndex = "9999";
document.body.appendChild(timer);

/* =========================
   ANIMATE
========================= */

function animate() {

    requestAnimationFrame(animate);

    let now = Date.now();
    let elapsedTime = (now - startTime) / 1000;

    // =====================
    // timer
    // =====================
    let remaining = timeLimit - elapsedTime;

    if (remaining < 0 && !restartTriggered) {
        restartTriggered = true;
        alert("Time's up! Restarting...");
        window.location.reload();
    }

    if (remaining < 0) remaining = 0;

    timer.innerText = "TIME LEFT: " + remaining.toFixed(1);

    // =====================
    // key logic
    // =====================

    if (key) {

        let t = (Date.now() - startTime) / 3000;

        if (t > 10) {

            key.visible = true;

            key.position.x = Math.sin(t * 0.5) * 3;
            key.position.z = Math.cos(t * 0.5) * 2;
            key.position.y = Math.sin(t * 1.5) * 0.8;

            key.rotation.y += 0.03;


            let mx = (mouseX / window.innerWidth - 0.5) * 6;
            let mz = (mouseY / window.innerHeight - 0.5) * 6;

            let dx = key.position.x - mx;
            let dz = key.position.z - mz;

            let dist = dx * dx + dz * dz;


            if (dist < 3) {
                key.scale.set(0.6, 0.6, 0.6); // 放大一点
                key.material && (key.material.emissive = new THREE.Color(0xffffff));
            } else {
                key.scale.set(0.5, 0.5, 0.5);
            }

            if (dist < 3) {

                if (!key._lockStart) {
                    key._lockStart = Date.now();
                }

                if (Date.now() - key._lockStart > 800) {
                    window.location.href = "next.html";
                }

            } else {
                key._lockStart = null;
            }

        } else {
            key.visible = false;
        }
    }

    renderer.render(scene, camera);
}

animate();


