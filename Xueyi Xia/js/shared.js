import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let humanGlowing = false;
let electricMode = false;

// ===== TEXT (CENTER TITLE) =====
const title = document.createElement("div");

title.innerText = "INTERCONNECTED SYSTEM";

title.style.position = "fixed";
title.style.top = "50%";
title.style.left = "50%";
title.style.transform = "translate(-50%, -50%)";

title.style.color = "white";
title.style.fontSize = "40px";
title.style.fontFamily = "Helvetica, Arial, sans-serif";
title.style.fontWeight = "100";
title.style.letterSpacing = "8px";
title.style.textTransform = "uppercase";
title.style.opacity = "0.7";
document.body.appendChild(title);


setTimeout(() => {
    title.style.opacity = "0.6";
}, 500);
/* =========================
   BASIC SETUP
========================= */

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "black";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =========================
   LIGHT
========================= */

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 5, 5);
scene.add(light);

/* =========================
   LOADER
========================= */

const loader = new GLTFLoader();

/* =========================
   CENTER MODEL (human)
========================= */

let centerModel;

loader.load("../image/human.glb", (gltf) => {
    centerModel = gltf.scene;

    centerModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x4aa3ff,
                roughness: 0.6,
                metalness: 0.2
            });
        }
    })
    centerModel.scale.set(1, 1, 1);
    scene.add(centerModel);
});

/* =========================
   BALLS SYSTEM
========================= */

let balls = [];
const ballCount = 58;
let lines = [];





loader.load("../image/ball.glb", (gltf) => {

    for (let i = 0; i < ballCount; i++) {

        const b = gltf.scene.clone();


        const scale = 3 + Math.random() * 2;
        b.scale.set(scale, scale, scale);



        b.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 10
        );


        b.userData.base = b.position.clone();
        b.userData.offset = Math.random() * 100;

        scene.add(b);
        balls.push(b);

        if (i !== 0) {
            b.userData.info = {
                title: "Ball " + i,
                desc: "This is a simple node."
            };
        }
    }
});


/* =========================
   LINES
========================= */
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x6fa8dc,
    transparent: true,
    opacity: 0.6
});

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
   MOUSE
========================= */

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});



function animate() {

    requestAnimationFrame(animate);

    let t = Date.now() * 0.001;

    // =====================
    // BALLS MOVEMENT
    // =====================
    if (balls.length > 0 && centerModel) {

        let centerX = centerModel.position.x;
        let centerY = centerModel.position.y;
        let centerZ = centerModel.position.z;

        for (let i = 0; i < balls.length; i++) {

            let ball = balls[i];

            // create random direction once
            if (!ball.userData.dir) {

                ball.userData.dir = new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                );

                ball.userData.dir.normalize();
            }

            let dir = ball.userData.dir;
            let base = ball.userData.base;

            let radius = 2.5 + Math.sin(t + i) * 0.5;

            ball.position.x = centerX + dir.x * radius;
            ball.position.y = base.y + Math.cos(t * 1.2 + i) * 0.3;
            ball.position.z = base.z + Math.sin(t * 0.8 + i) * 0.3;
        }
    }

    // =====================
    // LINES MOVEMENT
    // =====================
    for (let i = 0; i < lines.length; i++) {

        let line = lines[i];

        let ballA = balls[i];
        let ballB = balls[i + 1];

        if (!ballA || !ballB) continue;

        let pos = line.geometry.attributes.position.array;

        // point A
        pos[0] = ballA.position.x;
        pos[1] = ballA.position.y;
        pos[2] = ballA.position.z;

        // point B
        pos[3] = ballB.position.x;
        pos[4] = ballB.position.y;
        pos[5] = ballB.position.z;

        // electric effect
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

    // =====================
    // CAMERA MOVEMENT
    // =====================
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;

    camera.lookAt(scene.position);

    // =====================
    // RENDER
    // =====================
    renderer.render(scene, camera);
}

// start animation loop
animate();

window.addEventListener("pointerdown", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (!centerModel) return;

    const hits = raycaster.intersectObject(centerModel, true);

    // only react when human is clicked
    if (hits.length > 0) {

        // toggle states ONLY ONCE
        humanGlowing = !humanGlowing;
        electricMode = humanGlowing;

        // update material
        centerModel.traverse((child) => {

            if (!child.isMesh) return;

            // keep same material, just change emissive
            child.material.emissive = new THREE.Color(
                humanGlowing ? 0x4aa3ff : 0x000000
            );

            child.material.emissiveIntensity = humanGlowing ? 1.5 : 0;
        });

        const isRightSide = event.clientX > window.innerWidth / 2;

        if (isRightSide) {
            window.location.href = "seen.html";
        }
    }
});