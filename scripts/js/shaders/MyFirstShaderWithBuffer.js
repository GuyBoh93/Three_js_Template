import * as THREE from 'three';

function GetCameraFeed(){
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

  return iChannel1

}


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
// float tol = 0.5;
uniform float tol; 
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


const farg_ShowTex = /*glsl*/`
uniform sampler2D tex;
varying vec2 vUv;
// float tol = 0.5;
uniform float tol; 
void main() {
    gl_FragColor = texture2D(tex, vUv);
}
`;




class ShaderApp {
  constructor() {
    self.mat = new THREE.ShaderMaterial({
      uniforms: {
        tex: {
          value: GetCameraFeed()
        },
        tol: {
          value: 0.5
        },
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader
    });
  }

  GetMat(){
    return self.mat
  }

  Update(tol){
    self.mat.uniforms['tol'].value = tol
  }
}

let material = new THREE.ShaderMaterial({
  uniforms: {
    tex: {
      value: GetCameraFeed()
    },
    tol: {
      value: 0.5
    }
  },
  fragmentShader: fragmentShader,
  vertexShader: vertexShader
});


export { ShaderApp , material};
