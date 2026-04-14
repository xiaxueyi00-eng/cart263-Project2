import * as THREE from "three";
/* ======================
   Background Image
====================== */

document.documentElement.style.backgroundColor = "black";
document.body.style.backgroundColor = "black";

document.body.style.margin = "0";
document.body.style.overflow = "hidden";


/* ======================
   Scene
====================== */
const scene = new THREE.Scene();

/* ======================
   Renderer
====================== */
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);


renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";



/* ======================
   Fog
====================== */
scene.fog = new THREE.Fog(0x000000, 1, 10);

/* ======================
   Camera
====================== */
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 8;
camera.lookAt(0, 0, 0);

/* ======================
   Light
====================== */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

/* ======================
   Nodes
====================== */
const nodes = [];
const geometry = new THREE.SphereGeometry(0.3, 16, 16);

function createNode(x, y, z, type = "normal") {
    const material = new THREE.MeshStandardMaterial({
        color: 0x4da3ff,
        emissive: 0x001a33,
        emissiveIntensity: 1.2,
        roughness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    mesh.userData = {
        type,
        state: "normal",
        neighbors: []
    };

    scene.add(mesh);
    nodes.push(mesh);
    return mesh;
}

/* ======================
   Generate Nodes
====================== */
for (let i = 0; i < 300; i++) {
    createNode(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        Math.random() < 0.2 ? "immune" : "normal"
    );
}

/* ======================
   Build Connections
====================== */
function buildConnections() {
    for (let a of nodes) {
        for (let b of nodes) {
            if (a === b) continue;

            const dist = a.position.distanceTo(b.position);
            if (dist < 3) {
                a.userData.neighbors.push(b);
            }
        }
    }
}
buildConnections();

/* ======================
   Infection System
====================== */
function infect(node, delay = 300) {
    node.scale.set(2.2, 2.2, 2.2);

    setTimeout(() => {
        node.scale.set(1, 1, 1);
    }, 150);
    if (node.userData.state !== "normal") return;
    if (node.userData.type === "immune") return;

    node.userData.state = "infected";

    node.material.color.set(0xff3355);
    node.material.emissive.set(0xff0033);
    node.material.emissiveIntensity = 2;
    node.scale.set(1.6, 1.6, 1.6);

    setTimeout(() => {
        node.scale.set(1, 1, 1);
        node.material.emissiveIntensity = 1.2;
    }, 200);

    setTimeout(() => {
        node.userData.neighbors.forEach((n) => {
            if (n.userData.state === "normal") {


                createTrailLine(node, n);


                if (Math.random() < 0.4) {
                    infect(n, delay + 300);
                }
            }
        });
    }, delay);
}

/* ======================
   Click Interaction
====================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(nodes);

    if (hits.length > 0) {
        infect(hits[0].object);
    }


});


function createTrailLine(a, b) {
    const points = [
        a.position.clone(),
        b.position.clone()
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color: 0xff3355,
        transparent: true,
        opacity: 0.6
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);


    let alpha = 1;

    function fade() {
        alpha -= 0.02;
        line.material.opacity = alpha;

        if (alpha <= 0) {
            scene.remove(line);
        } else {
            requestAnimationFrame(fade);
        }
    }

    fade();
}
/* ======================
   Animate
====================== */
function animate() {
    requestAnimationFrame(animate);

    nodes.forEach((n, i) => {
        n.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
    });

    nodes.forEach((n) => {
        if (n.userData.state === "infected") {
            const s = 1 + Math.sin(Date.now() * 0.01) * 0.08;
            n.scale.set(s, s, s);
        }
    });
    renderer.render(scene, camera);
}

animate();