import * as THREE from 'three';

function GetCameraFeed() {
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

const Frag_Shad = /*glsl*/`
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
void main() {
    gl_FragColor = texture2D(tex, vUv);
}
`;

class Shader_RT_Buffer {
  constructor(renderer, fragShader = Frag_Shad, width = 100, height = 100) {
    this.width = width
    this.height = height
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('red');
    this.renderer = renderer

    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.orthoCamera.position.z = .5;

    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter
    });

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        tex: {
          value: GetCameraFeed()
        },
        tol: {
          value: 0.9
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragShader,
    });

    this.scene.add(
      new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat)
    );
  }
  GetRT() {
    return this.renderTarget.texture;
  }
  render() {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.orthoCamera);
    this.renderer.setRenderTarget(null);
  }
  GetMat() {
    return this.mat
  }
}

class ShaderApp {
  constructor(renderer) {
    this.BufA = new Shader_RT_Buffer(renderer);
    this.BufA.render()
    console.log(this.BufA.GetRT())


    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        tex: {
          value: this.BufA.GetRT()
        }
      },
      fragmentShader: farg_ShowTex,
      vertexShader: vertexShader
    });
  }

  GetMat() {
    return this.mat;
  }

  GetBufMat() {
    return this.BufA.GetMat();
  }

  GetBufTex() {
    return this.BufA.GetRT()
  }

  Update() {
    this.BufA.render()
  }
}

let material = new THREE.ShaderMaterial({
  uniforms: {
    tex: {
      value: GetCameraFeed()
    }
  },
  fragmentShader: farg_ShowTex,
  vertexShader: vertexShader
});


export { ShaderApp, material };
