import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
let mouseX = 0;
let mouseY = 0;

// Game state controller (used to switch between PLAYING / WIN)
let STATE = "PLAYING";
/* =========================
   BASIC SETUP
   Page / global styling setup
========================= */

// Remove default margins and disable scrolling
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
// Set background to black for immersive experience
document.body.style.background = "black";

/* =========================
   STORY TEXT (INTRO NARRATIVE)
========================= */
// Create HTML overlay for story text (UI layer above WebGL)
let story = document.createElement("div");
document.body.appendChild(story);

// Centered text styling
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
// Story sequence (intro narrative)
let storyLines = [
    "YOU HAVE ENTERED THE SYSTEM",
    "YOUR MOVEMENTS ARE BEING TRACKED",
    "YOU ARE NOT IN CONTROL",
    "ESCAPE IF YOU CAN"
];

let storyIndex = 0;
// Function to display story line by line
function showStory() {

    // End condition: hide text after finishing all lines
    if (storyIndex >= storyLines.length) {
        story.style.opacity = "0";
        return;
    }
    // Show current line
    story.innerText = storyLines[storyIndex];
    story.style.opacity = "1";
    // Fade out after 2 seconds
    setTimeout(() => {
        story.style.opacity = "0";

        storyIndex++;
        // Wait before showing next line
        setTimeout(showStory, 1200);
    }, 2000);
}
// Start story after 1 second delay
setTimeout(showStory, 1000);

/* =========================
   SPOTLIGHT EFFECT (FLASHLIGHT VIEW)
========================= */
// Create spotlight overlay (simulates limited vision / flashlight)
let spotlight = document.createElement("div");
spotlight.style.position = "fixed";
spotlight.style.width = "320px";
spotlight.style.height = "320px";
spotlight.style.borderRadius = "50%";
spotlight.style.pointerEvents = "none";
// Dark vignette effect around center circle
spotlight.style.boxShadow =
    "0 0 70px rgba(255,255,255,0.35), 0 0 0 2500px rgba(0,0,0,0.95)";
spotlight.style.zIndex = "10";
document.body.appendChild(spotlight);

/* =========================
   THREE.JS SCENE SETUP
========================= */
const scene = new THREE.Scene();
// Add fog for depth perception (objects fade with distance)
scene.fog = new THREE.Fog(0x000000, 2, 12);
// GLTF model loader
const loader = new GLTFLoader();

let key;
// Load key model (interactive object)
loader.load("../image/key.glb", (gltf) => {
    key = gltf.scene;
    // Scale down model
    key.scale.set(0.5, 0.5, 0.5);
    // Initial position in scene
    key.position.set(0, 0, -2);
    // Hidden at start (appears later in game)
    key.visible = false;

    scene.add(key);
});
// Perspective camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// Move camera backward
camera.position.z = 5;

// WebGL renderer (transparent background enabled)
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Use modern color space for better realism
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Add renderer canvas to page
document.body.appendChild(renderer.domElement);
/* =========================
   LIGHTING SETUP
========================= */

// Directional light (simulates main light source)
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);

// Ambient light (soft global illumination)
scene.add(new THREE.AmbientLight(0x222222));


/* =========================
   BUGS
========================= */

let bugs = [];
// List of bug model files
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
// Function to randomly place bug models in the scene
function placeBugs() {

    // Remove previous bugs
    for (let i = 0; i < bugs.length; i++) {
        scene.remove(bugs[i]);
    }

    bugs = [];
    // Load each bug model
    for (let i = 0; i < bugModels.length; i++) {

        loader.load(bugModels[i], function (gltf) {

            let model = gltf.scene;
            // Apply uniform material to all meshes
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xff3b3b


                    });
                }
            });
            // Random scale
            let scale = 0.25 + Math.random() * 0.25;
            model.scale.set(scale, scale, scale);
            // Random position in 3D space
            model.position.x = (Math.random() - 0.5) * 8;
            model.position.y = (Math.random() - 0.5) * 6;
            model.position.z = (Math.random() - 0.5) * 4;
            // Random movement target (optional future animation use)
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
// Spawn bugs into the scene
placeBugs();


/* =========================
   MOUSE
========================= */
// Track mouse movement for interaction + spotlight
document.addEventListener("mousemove", function (event) {

    mouseX = event.clientX;
    mouseY = event.clientY;

    // Move spotlight with cursor
    spotlight.style.left = (mouseX - 160) + "px";
    spotlight.style.top = (mouseY - 160) + "px";
});
/* =========================
   GAME STATE
========================= */
let startTime = Date.now();
let timeLimit = 60;// seconds
let restartTriggered = false;

// UI timer display
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
   ANIMATION LOOP
========================= */
function animate() {

    requestAnimationFrame(animate);

    let now = Date.now();
    let elapsedTime = (now - startTime) / 1000;

    // Calculate remaining time
    let remaining = timeLimit - elapsedTime;

    // Restart game when time runs out

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

    if (STATE === "PLAYING" && key) {

        let t = (Date.now() - startTime) / 2000;
        // Key appears after 10 seconds
        if (t > 10) {

            key.visible = true;
            // Floating animation
            key.position.x = Math.sin(t * 0.5) * 3;
            key.position.z = Math.cos(t * 0.5) * 2;
            key.position.y = Math.sin(t * 1.5) * 0.8;

            key.rotation.y += 0.03;
            // Convert mouse position into scene interaction space
            let mx = (mouseX / window.innerWidth - 0.5) * 6;
            let mz = (mouseY / window.innerHeight - 0.5) * 6;

            let dx = key.position.x - mx;
            let dz = key.position.z - mz;

            let dist = dx * dx + dz * dz;
            /* Hover effect when mouse is close */
            if (dist < 3) {
                key.scale.set(0.6, 0.6, 0.6);
            } else {
                key.scale.set(0.5, 0.5, 0.5);
                key._lockStart = null;
            }
            /* Hold interaction to "unlock" */
            if (dist < 3) {

                if (!key._lockStart) {
                    key._lockStart = Date.now();
                }
                // If hovering long enough → win
                if (Date.now() - key._lockStart > 800) {

                    STATE = "WIN";

                    window.location.href = "../../Weini-wang/submit.html";
                }
            }

        } else {
            key.visible = false;
        }
    }

    // Render scene each frame
    renderer.render(scene, camera);
}

animate();


