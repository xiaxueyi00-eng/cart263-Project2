import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//create a 3D scene and set the background color
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

//select the canvas element from html
const canvas = document.querySelector('#three-ex');

//create a perspective camera  
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

//move the camera
camera.position.z = 5;

//add the camera to the scene
scene.add(camera);

//set renderer size
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

//Enable mouse orbit control
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//create the main central sphere
const mainC = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 64, 64),
    new THREE.MeshStandardMaterial({
        color: '#e4fdff',
        emissive: '#cff4fd',
        emissiveIntensity: 1,
        roughness: 0.1
    })
);

//set the position of main sphere
mainC.position.x = 0;
mainC.castShadow = false;
//add main shpere in to scene
scene.add(mainC);

//creat light inside the main sphere
mainC.light = new THREE.PointLight(0xFFFFDD, 2.5, 100);
//set the light position at center
mainC.light.position.set(0, 0, 0);
mainC.light.castShadow = true;
mainC.light.shadow.mapSize.width = 2048;
mainC.light.shadow.mapSize.height = 2048;
mainC.light.shadow.bias = -0.0001;

//add the light to scene
scene.add(mainC.light);

//set the number particles for the background
const particleCount = 1200;
const positions = [];

//generate random positions
for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 60;
    const y = (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 60;

    positions.push(x, y, z);
}

//create geometry for the particles
const particleGeometry = new THREE.BufferGeometry();

//set the attribute 
particleGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
);

//creat the material for the particles
const particleMaterial = new THREE.PointsMaterial({
    color: '#bfe5f7',
    size: 0.05,
    transparent: true,
    opacity: 0.8
});

//create particle system
const particles = new THREE.Points(particleGeometry, particleMaterial);

//add particle to scene
scene.add(particles);

// create group for nodes
const nodeGroup = new THREE.Group();
scene.add(nodeGroup);

// arrays to store nodes, lines and flows
const nodes = [];
const lines = [];
const dataFlows = [];

// number of nodes
const nodeCount = 35;

//create nodes
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

    //random circular placement
    const radius = 1.8 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3;

    node.position.x = Math.cos(angle) * radius;
    node.position.y = y;
    node.position.z = Math.sin(angle) * radius;

    //store custom animation data
    node.userData = {
        baseY: node.position.y,
        offset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1,
        isAbsorbing: false,
        isHovered: false,
        isSelected: false
    };

    //add node to group
    nodeGroup.add(node);
    nodes.push(node);

    //create geometry for a line connecting node to main shpere
    const lineGeometry = new THREE.BufferGeometry();

    //creat array to store 2 points(start and end )
    const linePositions = new Float32Array(6); // x1,y1,z1,x2,y2,z2

    // attach position data to geometry
    lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3)
    );

    // create line material 
    const lineMaterial = new THREE.LineBasicMaterial({
        color: '#66ccff',
        transparent: true,
        opacity: 0.3
    });

    // create the line object
    const line = new THREE.Line(lineGeometry, lineMaterial);

    // add line to scene
    scene.add(line);

    // store line for later updates
    lines.push(line);

    // create a small sphere that moves along the line
    const flow = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 8, 8),
        new THREE.MeshBasicMaterial({
            color: '#f4fbff'
        })
    );

    //store animation data for flow
    flow.userData = {
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004
    };

    //add flow to scene
    scene.add(flow);
    dataFlows.push(flow);
}

//clock for animation timing
const clock = new THREE.Clock();

//temporary vectors to store positions
const tempNodeWorld = new THREE.Vector3();
const tempMainWorld = new THREE.Vector3();

//raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
//store mouse position
const mouse = new THREE.Vector2();

// store currently hovered node
let hoveredNode = null;

// input UI elements
const inputOverlay = document.querySelector('#inputOverlay');
const thoughtInput = document.querySelector('#thoughtInput');

// currently selected node
let selectedNode = null;

// whether final absorption has started
let finalAbsorb = false;
// whether main sphere should shrink
let shrinkMainC = false;

//set the function for the final absorption for mainC
function triggerFinalAbsorb() {
    // prevent triggering twice
    if (finalAbsorb) return;

    finalAbsorb = true;

    // loop through all nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const line = lines[i];

        // if node is visible and not already absorbing
        if (node.visible && !node.userData.isAbsorbing) {
            // start absorbing animation
            node.userData.isAbsorbing = true;
            node.userData.isSelected = false;
            node.userData.isHovered = false;
        }

        if (line) {
            line.visible = true;
        }
    }

    // hide all data flow particles
    for (let i = 0; i < dataFlows.length; i++) {
        dataFlows[i].visible = false;
    }

    // hide input windows
    inputOverlay.style.display = 'none';
    thoughtInput.blur();
}

//convert mouse position to normalized device coordinates (-1 to 1)
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

//add click event
window.addEventListener('click', () => {
    //set the ray from camera to mouse
    raycaster.setFromCamera(mouse, camera);

    //if mainC is clicked
    const mainIntersect = raycaster.intersectObject(mainC);

    //if main sphere is clicked, run the final absorption
    if (mainIntersect.length > 0) {
        triggerFinalAbsorb();
        return;
    }

    // if there is a hovered node AND it is not currently being absorbed
    if (hoveredNode && !hoveredNode.userData.isAbsorbing) {
        // if there is already a selected node and it is different from the hovered one
        if (selectedNode && selectedNode !== hoveredNode) {
            selectedNode.userData.isSelected = false;
            // Reset its color back to default (blue)
            selectedNode.material.color.set('#8fdfff');
            selectedNode.material.emissive.set('#8fdfff');
        }

        // set the currently hovered node as the selected node
        selectedNode = hoveredNode;
        selectedNode.userData.isSelected = true;

        // change color to yellow 
        selectedNode.material.color.set('#fffc3f');
        selectedNode.material.emissive.set('#fffc3f');
        selectedNode.material.emissiveIntensity = 2.2;

        // Show the input window
        inputOverlay.style.display = 'block';
        thoughtInput.value = '';
        thoughtInput.focus();
    }
});

//listen for keydown event on the input field
thoughtInput.addEventListener('keydown', (event) => {
    // if the pressed key is enter
    if (event.key === 'Enter') {
        const text = thoughtInput.value.trim();

        if (!text || !selectedNode) return;

        //save the input in to local storage
        localStorage.setItem('lastThought', text);

        inputOverlay.style.display = 'none';
        thoughtInput.value = '';

        //start animation for the absorption
        selectedNode.userData.isAbsorbing = true;
        selectedNode.userData.isSelected = false;
    }
});

//set the animation
function animate() {
    const elapsedTime = clock.getElapsedTime();

    //rotate main sphere slowly
    mainC.rotation.y += 0.01;
    mainC.rotation.x += 0.005;

    //rotate background particles
    particles.rotation.y += 0.0008;

    //rotate the whole node system
    nodeGroup.rotation.y += 0.0015;

    //loop through every node
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const line = lines[i];

        // if node is not being absorbed
        if (!node.userData.isAbsorbing) {
            //make node float up and down 
            node.position.y =
                node.userData.baseY +
                Math.sin(elapsedTime * node.userData.speed + node.userData.offset) * 0.08;
        }

        //if node is hovered
        if (node.userData.isHovered && !node.userData.isSelected && !node.userData.isAbsorbing) {
            //slightly enlarge node
            node.scale.set(1.25, 1.25, 1.25);
            node.material.emissiveIntensity = 1.2;
        }
        // if node is selected
        else if (node.userData.isSelected && !node.userData.isAbsorbing) {
            node.scale.set(1.35, 1.35, 1.35);
            node.material.emissiveIntensity = 2.2;
        }
        // default state
        else if (!node.userData.isAbsorbing) {
            node.scale.set(1, 1, 1);
            node.material.emissiveIntensity = 0.6;
        }

        // if node is being absorbed (node become small and increase light)
        if (node.userData.isAbsorbing) {
            node.position.lerp(new THREE.Vector3(0, 0, 0), 0.06);
            node.scale.multiplyScalar(0.97);

            node.material.emissiveIntensity = 2.5;
            node.material.color.lerp(new THREE.Color('#ffffff'), 0.08);
            node.material.emissive.lerp(new THREE.Color('#ffffff'), 0.08);

            if (node.position.length() < 0.12 || node.scale.x < 0.05) {
                node.visible = false;
                line.visible = false;
                node.userData.isAbsorbing = false;

                if (selectedNode === node) {
                    selectedNode = null;
                }

                mainC.scale.set(1.1, 1.1, 1.1);
                setTimeout(() => {
                    mainC.scale.set(1, 1, 1);
                }, 120);
            }
        }

        //if node and mainC is absorption, hide line
        if (!node.visible || !mainC.visible) {
            line.visible = false;
            continue;
        } else {
            line.visible = true;
        }

        //get the node and mainc position
        node.getWorldPosition(tempNodeWorld);
        mainC.getWorldPosition(tempMainWorld);

        //get line position array
        const linePositions = line.geometry.attributes.position.array;

        //update start point for node
        linePositions[0] = tempNodeWorld.x;
        linePositions[1] = tempNodeWorld.y;
        linePositions[2] = tempNodeWorld.z;

        //update end point for mainC
        linePositions[3] = tempMainWorld.x;
        linePositions[4] = tempMainWorld.y;
        linePositions[5] = tempMainWorld.z;

        //redo the line
        line.geometry.attributes.position.needsUpdate = true;

        //get flow particle
        const flow = dataFlows[i];

        //move forward along line
        flow.userData.progress += flow.userData.speed;

        //reset if reached the minac
        if (flow.userData.progress > 1) {
            flow.userData.progress = 0;
        }

        const t = flow.userData.progress;

        flow.position.x = tempNodeWorld.x + (tempMainWorld.x - tempNodeWorld.x) * t;
        flow.position.y = tempNodeWorld.y + (tempMainWorld.y - tempNodeWorld.y) * t;
        flow.position.z = tempNodeWorld.z + (tempMainWorld.z - tempNodeWorld.z) * t;
    }

    //creat ray from mouse
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);

    //reset hover state for all nodes
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].userData.isHovered = false;
    }

    //reset hoveredNode
    hoveredNode = null;

    if (intersects.length > 0) {
        hoveredNode = intersects[0].object;

        if (!hoveredNode.userData.isAbsorbing) {
            hoveredNode.userData.isHovered = true;
        }
    }

    //if final absorption started and mainCnot shrinking yet
    if (finalAbsorb && !shrinkMainC) {
        let anyVisibleNode = false;

        //check if any node is till visible
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].visible) {
                anyVisibleNode = true;
                break;
            }
        }
        // if none node left, shrinking main sphere
        if (!anyVisibleNode) {
            shrinkMainC = true;
        }
    }

    //if main spere should shrink
    if (shrinkMainC) {

        //gradually shrink
        mainC.scale.multiplyScalar(0.98);

        //if small than 0.02 hide the mainC
        if (mainC.scale.x < 0.02) {
            mainC.visible = false;
            shrinkMainC = false;

            for (let i = 0; i < lines.length; i++) {
                lines[i].visible = false;
            }

            for (let i = 0; i < dataFlows.length; i++) {
                dataFlows[i].visible = false;
            }

            //jump to next page
            setTimeout(() => {
                window.location.href = "upload.html";
            }, 800);
        }
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

//add windows resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})