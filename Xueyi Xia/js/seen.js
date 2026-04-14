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
document.body.appendChild(story);

let lines = [
    "YOU HAVE ENTERED THE SYSTEM",
    "YOUR MOVEMENTS ARE BEING TRACKED",
    "YOU ARE NOT IN CONTROL",
    "ESCAPE IF YOU CAN"
];

let i = 0;

function showStory() {
    if (i >= lines.length) {
        story.style.opacity = "0";
        return;
    }

    story.innerText = lines[i];
    story.style.opacity = "1";

    setTimeout(() => {
        story.style.opacity = "0";
        i++;
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

    let elapsedTime = (Date.now() - startTime) / 1000;

    if (elapsedTime > timeLimit && !restartTriggered) {
        restartTriggered = true;


        alert("Time's up! Restarting...");
        window.location.reload();


    }



    let remaining = Math.max(0, timeLimit - elapsedTime);
    if (Math.floor(remaining * 10) % 2 === 0) {
        timer.innerText = "TIME LEFT: " + remaining.toFixed(1);
    }
    // key movement
    if (key) {

        let elapsed = (Date.now() - startTime) / 3000;

        if (elapsed > 10) {

            key.visible = true;


            key.position.x = Math.sin(elapsed * 0.5) * 3;
            key.position.z = Math.cos(elapsed * 0.5) * 2;
            key.position.y = Math.sin(elapsed * 1.5) * 0.8;


            key.rotation.y += 0.03;

            let dx = key.position.x - (mouseX / window.innerWidth - 0.5) * 6;
            let dz = key.position.z - (mouseY / window.innerHeight - 0.5) * 6;

            let dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 1.8) {
                window.location.href = "next.html";
            }

        } else {
            key.visible = false;
        }
    }


    renderer.render(scene, camera);
}

animate();

