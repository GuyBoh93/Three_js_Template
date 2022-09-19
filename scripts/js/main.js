import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { material } from 'Shader';
import { ShaderApp } from 'Shader';




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);

let Shader = new ShaderApp(renderer)



const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


const cube2 = new THREE.Mesh(geometry, Shader.GetMat());
cube2.position.x = 3
scene.add(cube2);

const cube3 = new THREE.Mesh(geometry, Shader.GetBufMat());
cube3.position.x = -3
scene.add(cube3);

const ma = new THREE.MeshPhongMaterial({
  map: Shader.GetBufTex()
});

const cube4 = new THREE.Mesh(geometry, ma);
cube4.position.y = -3
scene.add(cube4);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);




function animate() {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  // cube2.rotation.y += 0.01;

  controls.update();

  Shader.Update();


  renderer.render(scene, camera);
};

animate();