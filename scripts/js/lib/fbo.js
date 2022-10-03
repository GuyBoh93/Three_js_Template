import * as THREE from './three.module.js';


function CreateTextureFromData(width, height, data, options) {
    options || (options = {});

    var texture = new THREE.DataTexture(
        new Float32Array(data),
        width,
        height,
        THREE.RGBAFormat,
        THREE.FloatType,
        null,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
    );

    texture.needsUpdate = true;

    return texture;

};


class FBO {
    constructor(textureWidth, renderer, Frag_Shader, vert_Shader) {
        // var gl = renderer.getContext();
        // if (!gl.getExtension("OES_texture_float")) {
        //     alert("No OES_texture_float support for float textures!");
        //     return;
        // }

        // if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
        //     alert("No support for vertex shader textures!");
        //     return;
        // }







        this.renderer = renderer;
        this.timer = .5;
        this.sceneRTTPos = new THREE.Scene();
        this.sceneRTTPos.background = new THREE.Color('red');


        this.cameraRTT = new THREE.OrthographicCamera(-textureWidth / 2, textureWidth / 2, textureWidth / 2, -textureWidth / 2, -1000000, 1000000);
        this.cameraRTT.position.z = 1;
        this.sceneRTTPos.add(this.cameraRTT);

        // this.sceneRTTPos = sceneRTTPos;




        this.positionTextureIn = new THREE.WebGLRenderTarget(textureWidth, textureWidth, {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false,
        });

        this.positionTextureOut = this.positionTextureIn.clone();

        this.flip = true

        this.simulationMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                tPositions: { type: 't', value: this.positionTextureIn.texture },
                timer: { type: 'f', value: this.timer },
            },
            vertexShader: vert_Shader,
            fragmentShader: Frag_Shader,
        });

        var plane = new THREE.PlaneGeometry(textureWidth, textureWidth);
        var quad = new THREE.Mesh(plane, this.simulationMaterial);
        quad.position.z = -100;
        this.sceneRTTPos.add(quad);

        this.textureWidth = textureWidth;
    }



    simulate() {
        var lastFrame = this.positionTextureIn;
        this.positionTextureIn = this.positionTextureOut;
        this.positionTextureOut = lastFrame;
        if (this.flip) {
            this.timer = this.timer + 0.01
            if (this.timer >= 1) {
                this.flip = false
            }
        }
        else {
            this.timer = this.timer - 0.01
            if (this.timer < 0) {
                this.flip = true
            }

        }
        this.simulationMaterial.uniforms.timer.value = this.timer;

        this.simulationMaterial.uniforms.tPositions.value = this.positionTextureIn.texture;

        this.renderer.setRenderTarget(this.positionTextureOut,);
        this.renderer.render(this.sceneRTTPos, this.cameraRTT);
        this.renderer.setRenderTarget(null);
    }
}




class Sim {

    constructor(renderer) {

        // make sure the user's browser supports textures with float values
        // if (!renderer.context.getExtension('OES_texture_float')) {
        //     alert('OES_texture_float is not supported :(');
        // };

        var w = 20,
            h = 20,
            data = new Float32Array(w * h * 3);

        for (var i = 0; i < data.length; i++) {
            data[i] = i % 3 == 0
                ? 0
                : Math.random() * 10
        };


        // var texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
        // texture.minFilter = THREE.NearestFilter;
        // texture.magFilter = THREE.NearestFilter;
        // texture.needsUpdate = true;

        // make PosBuffer
        var sim_VS = `
        precision mediump float;

        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform float timer;

    
        attribute vec2 uv; // stores x,y offsets of each point in texture
        attribute vec3 position;
    
        varying vec2 vUv;
    
        void main() {
        //   vUv = vec2(uv.x, 1.0 - uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `
        var sim_FS = `
        precision mediump float;
        uniform float timer;


        uniform sampler2D tPositions;
        uniform sampler2D origin;
    
        varying vec2 vUv;
    
        void main() {
    
          // read the supplied x,y,z vert positions
          vec3 pos = texture2D(tPositions, vUv).xyz;
    
          // manipulate the position attributes somehow
          pos.x += cos(pos.y) / 100.0;
          pos.y += tan(pos.x) / 100.0;
    
          // render the new positional attributes
        //   gl_FragColor = vec4(pos, 1.0);
          gl_FragColor = vec4(timer, (timer *-1. )+1.,0.,1.);

        }
        `
        this.posFbo = new FBO(w, renderer, sim_FS, sim_VS);
        this.posFbo.simulate();
    }

  

    getFrameOut() {
        return this.posFbo.positionTextureOut.texture;
    }


    getSimMat() {
        return this.posFbo.simulationMaterial;
    }

    render() {
        // make output of sim frag shader input to sim vert shader
        // this.timer = this.timer + 0.001
        // this.simulationMaterial.uniforms.timer.value = this.timer
        // this.simulationMaterial.uniforms.tPositions.value = fboParticles.in.texture;

        this.posFbo.simulate();



    }
}

export { FBO, Sim };
