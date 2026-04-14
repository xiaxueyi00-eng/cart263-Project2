import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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

/* =========================
   ANIMATE
========================= */

function animate() {
    requestAnimationFrame(animate);


    if (centerModel && balls.length > 0) {

        balls.forEach((b, i) => {


            if (!b.userData.dir) {
                b.userData.dir = new THREE.Vector3(
                    (Math.random() - 0.5),
                    (Math.random() - 0.5),
                    (Math.random() - 0.5)
                ).normalize();
            }

            let t = Date.now() * 0.001;

            let radius = 2.5 + Math.sin(t + i) * 0.5;

            b.position.x = centerModel.position.x + b.userData.dir.x * radius;
            b.position.y = centerModel.position.y + b.userData.dir.y * radius;
            b.position.z = centerModel.position.z + b.userData.dir.z * radius;
        });
    }

    if (balls.length > 0) {

        let t = Date.now() * 0.001;

        balls.forEach((b, i) => {

            let base = b.userData.base;


            b.position.y = base.y + Math.cos(t * 1.2 + i) * 0.3;
            b.position.z = base.z + Math.sin(t * 0.8 + i) * 0.3;
        });

        balls.forEach((b) => {
            b.position.x += Math.sin(Date.now() * 0.0002) * 0.0005;


        });

        if (balls.length > 1 && lines.length > 0) {

            for (let i = 0; i < lines.length; i++) {

                let a = balls[i].position;
                let b = balls[i + 1].position;

                lines[i].geometry.attributes.position.array.set([
                    a.x, a.y, a.z,
                    b.x, b.y, b.z
                ]);

                lines[i].geometry.attributes.position.needsUpdate = true;
            }
        }
    }
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

/* =========================
   RESIZE
========================= */

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});