import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

// import { ShaderApp } from 'ShaderTools';
// import { Shader } from './shaders/OpticalFlow.js';
import { Shader } from './shaders/Particals.js';
import { Sim } from './lib/fbo.js';






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.background = new THREE.Color('blue');

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);

const sim = new Sim(renderer)
// let Mat = new Shader(renderer, scene)

const cube1 = new THREE.Mesh(geometry, sim.getSimMat());
cube1.position.x = 3;
scene.add(cube1);



const cube2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { map: sim.getFrameOut()} ) );
cube2.position.x = -3;
scene.add(cube2);


// const cube2 = new THREE.Mesh(geometry, Mat.GetMat());
// scene.add(cube2);



camera.position.z = 4;

const controls = new OrbitControls(camera, renderer.domElement);




function animate() {
  // requestAnimationFrame(animate);
  setTimeout( function() {

    
    requestAnimationFrame( animate );
    // controls.update();
    // Shader.Update();
    // Mat.render()
    sim.render()
    
  }, 1000 / 60);
  
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  // cube2.rotation.y += 0.01;



  renderer.render(scene, camera);
};

animate();