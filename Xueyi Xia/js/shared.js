import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ===== TEXT (CENTER TITLE) =====
const title = document.createElement("div");

title.innerText = "INTERCONNECTED SYSTEM";

title.style.position = "fixed";
title.style.top = "50%";
title.style.left = "50%";
title.style.transform = "translate(-50%, -50%)";

title.style.color = "white";
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
    // balls motion
    // =====================
    if (balls.length > 0 && centerModel) {

        let centerX = centerModel.position.x;
        let centerY = centerModel.position.y;
        let centerZ = centerModel.position.z;

        for (let i = 0; i < balls.length; i++) {

            let b = balls[i];

            if (!b.userData.dir) {
                b.userData.dir = new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                );
                b.userData.dir.normalize();
            }

            let dir = b.userData.dir;
            let base = b.userData.base;

            let radius = 2.5 + Math.sin(t + i) * 0.5;

            b.position.x = centerX + dir.x * radius;
            b.position.y = base.y + Math.cos(t * 1.2 + i) * 0.3;
            b.position.z = base.z + Math.sin(t * 0.8 + i) * 0.3;
        }
    }

    // =====================
    // lines motion
    // =====================
    for (let i = 0; i < lines.length; i++) {

        let line = lines[i];

        let a = balls[i];
        let b = balls[i + 1];


        if (!a || !b) continue;

        let pos = line.geometry.attributes.position.array;

        pos[0] = a.position.x;
        pos[1] = a.position.y;
        pos[2] = a.position.z;

        pos[3] = b.position.x;
        pos[4] = b.position.y;
        pos[5] = b.position.z;

        line.geometry.attributes.position.needsUpdate = true;
    }

    // =====================
    // camera
    // =====================
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();