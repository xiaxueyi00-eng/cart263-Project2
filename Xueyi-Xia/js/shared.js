import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// Raycaster for detecting mouse clicks on 3D objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// State variables controlling interaction modes
let humanGlowing = false;
let electricMode = false;
let systemIntensity = 0;
/* =========================
   TITLE UI (CENTER TEXT)
========================= */

// Create HTML title overlay
const title = document.createElement("div");

title.innerText = "INTERCONNECTED SYSTEM";
// Center the title on screen
title.style.position = "fixed";
title.style.top = "50%";
title.style.left = "50%";
title.style.transform = "translate(-50%, -50%)";
// Typography styling
title.style.color = "white";
title.style.fontSize = "40px";
title.style.fontWeight = "100";
title.style.letterSpacing = "8px";
title.style.textTransform = "uppercase";
title.style.opacity = "0.7";
document.body.appendChild(title);
// Slight fade adjustment after load
setTimeout(() => {
    title.style.opacity = "0.6";
}, 500);
/* =========================
   BASIC SETUP
========================= */

// Remove default margins and disable scrolling
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
// Set background color
document.body.style.background = "black";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
// Create camera (perspective view)
const camera = new THREE.PerspectiveCamera(
    75,// field of view
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// Move camera away from origin
camera.position.z = 5;
// Create WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* =========================
   LIGHTING
========================= */
// Soft global lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
// Directional light (simulates sun / main source)
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 5, 5);
scene.add(light);

/* =========================
   LOADER (GLTF MODELS)
========================= */
const loader = new GLTFLoader();

/* =========================
   CENTER MODEL (human)
========================= */

let centerModel;
// Load main human model
loader.load("../image/human.glb", (gltf) => {
    centerModel = gltf.scene;
    // Apply custom material to all meshes
    centerModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x4aa3ff,
                roughness: 0.6,
                metalness: 0.2
            });
        }
    })

    // Scale model
    centerModel.scale.set(1, 1, 1);
    // Add to scene
    scene.add(centerModel);
});

/* =========================
   BALLS SYSTEM
========================= */

let balls = [];
const ballCount = 58;
let lines = [];
// Load ball model and clone it multiple times
loader.load("../image/ball.glb", (gltf) => {

    for (let i = 0; i < ballCount; i++) {

        const b = gltf.scene.clone();
        // Random size variation
        const scale = 3 + Math.random() * 2;
        b.scale.set(scale, scale, scale);
        // Random 3D position
        b.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 10
        );
        // Store base position for animation reference
        b.userData.base = b.position.clone();
        // Random phase offset for movement variation
        b.userData.offset = Math.random() * 100;
        b.userData.dir = new THREE.Vector3(
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            (Math.random() - 0.5)
        ).normalize();
        scene.add(b);
        balls.push(b);



    }
});

/* =========================
   CONNECTION LINES
========================= */

// Line material for connecting nodes
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x6fa8dc,
    transparent: true,
    opacity: 0.6
});
// Create lines between consecutive balls
for (let i = 0; i < ballCount - 1; i++) {

    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3()
    ]);

    const line = new THREE.Line(geometry, lineMaterial);

    scene.add(line);
    lines.push(line);
}
/* =========================
   MOUSE INPUT
========================= */

let mouseX = 0;
let mouseY = 0;
// Track normalized mouse position (-1 to 1)
document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

/* =========================
   ANIMATION LOOP
========================= */

function animate() {

    requestAnimationFrame(animate);

    let t = Date.now() * 0.001;

    controls.update();

    /* =====================
          BALL MOVEMENT (ORBIT SYSTEM)
       ===================== */

    if (balls.length > 0 && centerModel) {

        for (let i = 0; i < balls.length; i++) {

            let ball = balls[i];

            let dir = ball.userData.dir;
            let base = ball.userData.base;

            // Dynamic radius creates breathing/orbit effect
            let baseRadius = 2.5;
            let radius = Math.max(
                0.8,
                baseRadius - systemIntensity + Math.sin(t + i) * 0.5
            );

            // Orbital movement around center model
            ball.position.x = centerModel.position.x + dir.x * radius;
            ball.position.y = base.y + Math.cos(t * 1.2 + i) * 0.3;
            ball.position.z = base.z + Math.sin(t * 0.8 + i) * 0.3;
        }
    }

    /* =====================
       LINE UPDATES (CONNECTIONS)
    ===================== */

    for (let i = 0; i < lines.length; i++) {

        let line = lines[i];
        let ballA = balls[i];
        let ballB = balls[i + 1];

        if (!ballA || !ballB) continue;

        let pos = line.geometry.attributes.position.array;

        // Update line start point
        pos[0] = ballA.position.x;
        pos[1] = ballA.position.y;
        pos[2] = ballA.position.z;

        // Update line end point
        pos[3] = ballB.position.x;
        pos[4] = ballB.position.y;
        pos[5] = ballB.position.z;

        /* Electric mode visual effect */
        if (electricMode === true) {
            line.material.color.set(0x00aaff);
            line.material.opacity =
                0.4 + Math.sin(Date.now() * 0.01 + i) * 0.3;
        } else {
            line.material.color.set(0x6fa8dc);
            line.material.opacity = 0.6;
        }

        line.geometry.attributes.position.needsUpdate = true;
    }

    /* =====================
       RENDER SCENE
    ===================== */

    renderer.render(scene, camera);
}

// Start animation loop
animate();


/* =========================
   CLICK INTERACTION (RAYCASTING)
========================= */

window.addEventListener("pointerdown", function (event) {

    // If model is not ready, stop running the code
    if (centerModel == null) {
        return;
    }

    // =========================
    // 1. Get mouse position on screen
    // =========================
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    // =========================
    // 2. Convert screen position to Three.js coordinates (-1 to 1)
    // =========================
    var x = (mouseX / window.innerWidth) * 2 - 1;
    var y = -(mouseY / window.innerHeight) * 2 + 1;

    mouse.x = x;
    mouse.y = y;

    // =========================
    // 3. Set ray from camera
    // =========================
    raycaster.setFromCamera(mouse, camera);

    // =========================
    // 4. Check if the model is clicked
    // =========================
    var result = raycaster.intersectObject(centerModel, true);

    if (result.length > 0) {

        // =========================
        // 5. Toggle glow state (on / off)
        // =========================
        if (humanGlowing == true) {
            humanGlowing = false;
            electricMode = false;

        } else {
            humanGlowing = true;
            electricMode = true;
            systemIntensity = Math.min(systemIntensity + 1.5, 2);


        }

        // =========================
        // 6. Change model material color
        // =========================
        centerModel.traverse(function (child) {

            if (child.isMesh == true) {

                // If glowing is ON
                if (humanGlowing == true) {
                    child.material.emissive = new THREE.Color(0x4aa3ff);
                    child.material.emissiveIntensity = 1.5;
                }

                // If glowing is OFF
                else {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            }
        });

        // =========================
        // 7. Check if click is on the right side of screen
        // =========================
        var isRightSide = false;

        if (mouseX > window.innerWidth / 2) {
            isRightSide = true;
        }

        // =========================
        // 8. If right side clicked, go to next page
        // =========================
        if (isRightSide == true) {
            window.location.href = "seen.html";
        }
    }
});