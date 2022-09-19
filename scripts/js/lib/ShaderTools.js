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
    const tex = new THREE.VideoTexture(video);
  
    return tex
  
  }

const VERTEX_SHADER = `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`;
const FARG_RT_SHADER = /*glsl*/`
uniform sampler2D RT;
varying vec2 vUv;
 
void main() {
    gl_FragColor = texture2D(RT, vUv);
}
`;

class Shader_RT_Buffer {
    constructor(renderer,uniforms, fragShader = FARG_RT_SHADER, width = 512, height = 512) {
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
            uniforms: uniforms,
            vertexShader: VERTEX_SHADER,
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

export { Shader_RT_Buffer, VERTEX_SHADER, FARG_RT_SHADER, GetCameraFeed};
