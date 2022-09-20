import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

// import { ShaderApp } from 'ShaderTools';
import { Shader } from './shaders/OpticalFlow.js';




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);

let Mat = new Shader(renderer)



// const cube = new THREE.Mesh(geometry, Mat.GetCurrent());
// scene.add(cube);

// const cube3 = new THREE.Mesh(geometry, Mat.GetPast());
// cube3.position.x = -2

// scene.add(cube3);


const cube2 = new THREE.Mesh(geometry, Mat.GetMat());
// cube2.position.x = 1
scene.add(cube2);



camera.position.z = 2;

// const controls = new OrbitControls(camera, renderer.domElement);




function animate() {
  // requestAnimationFrame(animate);
  setTimeout( function() {

    
    requestAnimationFrame( animate );
    // controls.update();
    // Shader.Update();
    Mat.render()
    
  }, 1000 / 60);
  
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  // cube2.rotation.y += 0.01;



  renderer.render(scene, camera);
};

animate();