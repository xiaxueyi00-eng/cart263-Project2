import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const canvas = document.querySelector('#three-ex');

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


const mainC = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 64, 64),
    new THREE.MeshStandardMaterial({
        color: '#e4fdff',
        emissive: '#cff4fd',
        emissiveIntensity: 1,
        roughness: 0.1
    })
);

mainC.position.x = 0;
mainC.castShadow = false;
scene.add(mainC);

mainC.light = new THREE.PointLight(0xFFFFDD, 2.5, 100);
mainC.light.position.set(0, 0, 0);
mainC.light.castShadow = true;
mainC.light.shadow.mapSize.width = 2048;
mainC.light.shadow.mapSize.height = 2048;
mainC.light.shadow.bias = -0.0001;
scene.add(mainC.light);

const particleCount = 1200;
const positions = [];

for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 60;
    const y = (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 60;

    positions.push(x, y, z);
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
    color: '#bfe5f7',
    size: 0.05,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const nodeGroup = new THREE.Group();
scene.add(nodeGroup);

const nodes = [];
const lines = [];

const nodeCount = 35;

for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshStandardMaterial({
            color: '#8fdfff',
            emissive: '#8fdfff',
            emissiveIntensity: 0.6,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
        })

    );

    const radius = 1.8 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3;

    node.position.x = Math.cos(angle) * radius;
    node.position.y = y;
    node.position.z = Math.sin(angle) * radius;

    node.userData = {
        baseY: node.position.y,
        offset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1
    };

    nodeGroup.add(node);
    nodes.push(node);

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(6); // x1,y1,z1,x2,y2,z2
    lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
        color: '#66ccff',
        transparent: true,
        opacity: 0.3
    });

    const line = new THREE.Line(lineGeometry, lineMaterial);

    scene.add(line);
    lines.push(line);
}

const clock = new THREE.Clock();
const tempNodeWorld = new THREE.Vector3();
const tempMainWorld = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hoveredNode = null;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    if (hoveredNode) {
        console.log('clicked node:', hoveredNode);
        hoveredNode.material.emissiveIntensity = 2.5;

        setTimeout(() => {
            hoveredNode.material.emissiveIntensity = 1.2;
        }, 150);
    }
});

function animate() {
    const elapsedTime = clock.getElapsedTime();

    mainC.rotation.y += 0.01;
    mainC.rotation.x += 0.005;

    particles.rotation.y += 0.0008;

    nodeGroup.rotation.y += 0.0015;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const line = lines[i];

        node.position.y =
            node.userData.baseY +
            Math.sin(elapsedTime * node.userData.speed + node.userData.offset) * 0.08;

        node.getWorldPosition(tempNodeWorld);
        mainC.getWorldPosition(tempMainWorld);

        const linePositions = line.geometry.attributes.position.array;

        linePositions[0] = tempNodeWorld.x;
        linePositions[1] = tempNodeWorld.y;
        linePositions[2] = tempNodeWorld.z;

        linePositions[3] = tempMainWorld.x;
        linePositions[4] = tempMainWorld.y;
        linePositions[5] = tempMainWorld.z;

        line.geometry.attributes.position.needsUpdate = true;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);

    if (hoveredNode) {
        hoveredNode.scale.set(1, 1, 1);
        hoveredNode.material.emissiveIntensity = 0.6;
        hoveredNode = null;
    }

    if (intersects.length > 0) {
        hoveredNode = intersects[0].object;
        hoveredNode.scale.set(1.4, 1.4, 1.4);
        hoveredNode.material.emissiveIntensity = 2;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})