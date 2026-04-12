// ===== STAR BACKGROUND =====
const starCanvas = document.querySelector("#stars");
const ctx = starCanvas.getContext("2d");

starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;

starCanvas.style.position = "fixed";
starCanvas.style.top = "0";
starCanvas.style.left = "0";
starCanvas.style.zIndex = "-1";

let stars = [];

for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: Math.random() * 2
    });
}

function animateStars() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);

    ctx.fillStyle = "white";

    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        s.y += 0.3;
        if (s.y > starCanvas.height) s.y = 0;
    });

    requestAnimationFrame(animateStars);
}

animateStars();


// ===== THREE.JS =====
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#three");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 3);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// lights
scene.add(new THREE.AmbientLight(0xffffff, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);


// model
const loader = new GLTFLoader();

loader.load(
    "./image/earth.glb",
    (gltf) => {
        const model = gltf.scene;

        model.scale.set(0.1, 0.1, 0.1);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);

        console.log("MODEL LOADED");
    },
    undefined,
    (err) => {
        console.error("GLB LOAD ERROR:", err);
    }
);

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}

animate();

let hover = false;

window.addEventListener("mousemove", (e) => {
    hover = true;
    earth.scale.set(1.05, 1.05, 1.05);
});

window.addEventListener("mouseleave", () => {
    hover = false;
    earth.scale.set(1, 1, 1);
});

let exploded = false;

window.addEventListener("click", () => {
    exploded = true;


    earth.scale.set(2.5, 2.5, 2.5);

    earth.rotation.x += 1;
    earth.rotation.y += 1;


    document.querySelector("#menu").style.display = "flex";
});
function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y += 0.002;

    if (exploded) {
        earth.scale.x *= 0.98;
        earth.scale.y *= 0.98;
        earth.scale.z *= 0.98;

        camera.position.z *= 0.99;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

setTimeout(() => {
    const menu = document.querySelector("#menu");
    menu.style.display = "flex";
    setTimeout(() => {
        menu.style.opacity = 1;
    }, 100);
}, 1000);