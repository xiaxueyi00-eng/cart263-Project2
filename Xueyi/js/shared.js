import * as THREE from "three";

let scene, camera, renderer;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let nodes = [];
let lines = [];

let sharedLoad = 0;
let dataIntensity = 0.05;

init();
animate();
