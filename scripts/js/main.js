import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { material } from 'Shader';
import { ShaderApp } from 'Shader';

let Shader = new ShaderApp()



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);


const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


const cube2 = new THREE.Mesh(geometry, Shader.GetMat());
cube2.position.x = 3
scene.add(cube2);

const cube3 = new THREE.Mesh(geometry, material);
cube3.position.x = -3

scene.add(cube3);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);

function getCircleY(radians, radius) {
    return Math.sin(radians) * radius;
  }


function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // cube2.rotation.y += 0.01;

    controls.update();
   
    Shader.Update(.9);
    

    renderer.render(scene, camera);
};

animate();