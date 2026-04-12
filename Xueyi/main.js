import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// light
scene.add(new THREE.AmbientLight(0xffffff, 1));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3, 3, 3);
scene.add(light);

// loader
const loader = new GLTFLoader();

let earth;

// 🌍 load your GLB
loader.load(
    "model/earth.glb",
    (gltf) => {
        earth = gltf.scene;


        earth.scale.set(1, 1, 1);

        scene.add(earth);
    },
    undefined,
    (error) => {
        console.error("GLB load error:", error);
    }
);

// resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// animate
function animate() {
    requestAnimationFrame(animate);

    if (earth) {
        earth.rotation.y += 0.002;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();