import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ===== STAR BACKGROUND =====
const starCanvas = document.querySelector("#stars");
const ctx = starCanvas.getContext("2d");

starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;

starCanvas.style.position = "fixed";
starCanvas.style.top = 0;
starCanvas.style.left = 0;
starCanvas.style.zIndex = -1;

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


// ===== SCENE =====
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);

const canvas = document.querySelector("#three");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// lights
scene.add(new THREE.AmbientLight(0xffffff, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// ===== MODEL (ONLY ONCE) =====
const loader = new GLTFLoader();

let model = null;
let exploded = false;

loader.load(
    "../image/earth.glb",
    (gltf) => {
        model = gltf.scene;

        model.scale.set(0.1, 0.1, 0.1);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);
    }
);

// ===== INTERACTION =====
window.addEventListener("mousemove", () => {
    if (model && !exploded) {
        model.scale.set(0.11, 0.11, 0.11);
    }
});

// ===== ANIMATE =====
function animate() {
    requestAnimationFrame(animate);

    if (model && !exploded) {
        model.rotation.y += 0.002;
    }

    if (model && exploded) {
        model.scale.multiplyScalar(0.98);
        camera.position.z *= 0.99;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// ===== CLICK =====
renderer.domElement.addEventListener("pointerdown", () => {
    if (!model) return;

    exploded = true;

    const menu = document.getElementById("menu");
    menu.classList.add("show");
    document.body.classList.add("menu-open");

    const items = menu.querySelectorAll("a");

    setTimeout(() => {
        items.forEach((item, i) => {
            setTimeout(() => {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            }, i * 100);
        });
    }, 2000);
});