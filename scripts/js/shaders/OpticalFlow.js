import * as THREE from 'three';
import { Shader_RT_Buffer, GetCameraFeed, FARG_RT_SHADER } from 'ShaderTools';



const OPTICALFLOW_SHADER = `

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

uniform vec3      iResolution;           // viewport resolution (in pixels)

varying vec2 vUv;


const float lod = 2.0;
const float lodscale = 4.0; // 2 ^ lod


float intensity(vec2 loc, float time) {
	float i0 = dot(textureLod(iChannel0, loc, lod).rgb, vec3(1.0));
    float i1 = dot(textureLod(iChannel1, loc, lod).rgb, vec3(1.0));
    return mix(i0, i1, time);
}

void main()
{
  
    // lucas-kanade optical flow 
    // https://en.wikipedia.org/wiki/Lucas%E2%80%93Kanade_method
    mat2 AtA = mat2(0.0, 0.0, 0.0, 0.0);
    vec2 Atb = vec2(0.0, 0.0);
    vec2 p = (vUv.xy - vec2(3.0)) /iResolution.xy;
    float xstart = p.x;
    vec2 px_step = lodscale / iResolution.xy;
    for (int i = 0; i < 7; ++i) {
        p.x = xstart;
        for (int j = 0; j < 7; ++j) {
            float I = intensity(p, 0.0);
            float It = I - intensity(p, 1.0);
            float Ix = intensity(p + vec2(1.0, 0.0) * px_step, 0.0) - I;
            float Iy = intensity(p + vec2(0.0, 1.0) * px_step, 0.0) - I;
            
            AtA += mat2(Ix * Ix, Ix * Iy, Ix * Iy, Iy * Iy);
            Atb -= vec2(It * Ix, It * Iy);
            p.x += px_step.x;
        }
        p.y += px_step.y;
    }
    mat2 AtAinv = mat2(AtA[0][0], -AtA[0][1], -AtA[1][0], AtA[1][1]) /
        (AtA[0][0] * AtA[1][1] - AtA[1][0] * AtA[0][1]);
    
    vec2 flow = AtAinv * Atb;
    
    gl_FragColor = vec4(0.5 + 0.1 * flow,0.0,1.0);
}
`;


const TEST_Shader = `

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

uniform vec3      iResolution;           // viewport resolution (in pixels)

varying vec2 vUv;
float tol = 0.1;

void main()
{ 
  float a = texture2D(iChannel0, vUv).x;
  float b = texture2D(iChannel1, vUv).x;



  if (b > a-tol && b < a+tol){
    gl_FragColor = vec4(0.0,0,0,1);
  }
  else{
    gl_FragColor = vec4 (1.0,0,0,1);

  }
  // gl_FragColor = texture2D(iChannel0, vUv) + texture2D(iChannel1, vUv);

}

`;

class Shader {
  constructor(renderer) {
    this.uniforms = {
      RT: {
        value: GetCameraFeed()
      }
    }
    this.CamFeedBufCurnt = new Shader_RT_Buffer(renderer, this.uniforms)
    this.uniforms = {
      RT: {
        value: this.CamFeedBufCurnt.GetRT()
      }
    }
    this.CamFeedBufPast = new Shader_RT_Buffer(renderer, this.uniforms)





    this.uniforms = {
      iChannel0: {
        value: this.CamFeedBufCurnt.GetRT()
      },
      iChannel1: {
        value: this.CamFeedBufPast.GetRT()
      },
      iResolution:{
        value: new THREE.Vector3(100,100,100)
      }
    }
    this.OpticalFlow = new Shader_RT_Buffer(renderer, this.uniforms, TEST_Shader)


  }

  GetMat() {
    return this.OpticalFlow.GetMat()
  }

  GetCurrent(){
    return this.CamFeedBufCurnt.GetMat()

  }

  GetPast(){
    return this.CamFeedBufPast.GetMat()

  }

  render() {
    this.CamFeedBufPast.render()
    this.CamFeedBufCurnt.render()

    // this.OpticalFlow.render()
    // console.log(this.OpticalFlow.GetRT())
  }

}

export { Shader };

