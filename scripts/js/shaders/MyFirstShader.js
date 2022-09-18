import * as THREE from 'three';

const video = document.getElementById('video');
const option = {
  video: true,
  audio: false
};

// Get image from camera
navigator.getUserMedia(option, (stream) => {
  video.srcObject = stream;  // Load as source of video tag
  video.addEventListener("loadeddata", () => {
    // ready
  });
}, (error) => {
  console.log(error);
});
const iChannel1 = new THREE.VideoTexture(video);


const vertexShader = /*glsl*/`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /*glsl*/`
uniform sampler2D tex;
varying vec2 vUv;
float tol = 0.5;
void main() {
  if (texture2D(tex, vUv)[0]>tol){
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    
  }
  else if (texture2D(tex, vUv)[1]>tol-0.1){
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);  
  }
  else if (texture2D(tex, vUv)[2]>tol-0.2){
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);  
  }
  else{
    gl_FragColor = texture2D(tex, vUv);
  }
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

const material = new THREE.ShaderMaterial({
  uniforms: {
    tex: {
      type: "t",
      value: iChannel1
    },
  },
  fragmentShader: fragmentShader,
  vertexShader: vertexShader
});


export { material };
