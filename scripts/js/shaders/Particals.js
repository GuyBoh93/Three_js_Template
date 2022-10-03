import * as THREE from '../lib/three.module.js';
import { Shader_RT_Buffer, GetCameraFeed, VERTEX_SHADER } from '../lib/ShaderTools.js';



const FRAG_P_POS = `
uniform sampler2D RT;

varying vec2 vUv;


void main()
{
  vec4 new_Pos = texture2D(RT, vUv) + vec4(0.1,0.01, 0.,.0);
  gl_FragColor = new_Pos;
  // gl_FragColor = vec4(vUv.x,vUv.y,.0,1.);

}
`;

const VERTEX_P_SHADER = `

    uniform sampler2D RT_pos;
    uniform vec2 ID;


    varying vec2 vUv;
    varying vec4 colour;

      
    void main() {
        vUv = uv;
        float dist = 3.;
        vec4 pos = (texture2D(RT_pos, ID));
        colour= pos;
        pos = pos*vec4(dist,dist,dist,0);

        // pos = vec4(vec3(pos), 0);

        // gl_Position = projectionMatrix * modelViewMatrix * (vec4(position,1.0) * pos);
        gl_Position = projectionMatrix * modelViewMatrix * (vec4(position,1.0) + pos);

    }
`;

const FRAG_P_Color = `
uniform sampler2D RT_pos;
uniform vec2 ID;


varying vec2 vUv;
varying vec4 colour;



void main()
{
  vec4 pos = texture2D(RT_pos, ID);

    // gl_FragColor = vec4(0.5,.5,.5,1);
    // gl_FragColor = pos;
    gl_FragColor = colour;


}
`;


class Shader {
  constructor(renderer, scene) {
    this.uniforms = {
      RT: {
        value: new THREE.WebGLRenderTarget(10, 10, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.NearestFilter
        })
      }
    }
    this.ParticalPos = new Shader_RT_Buffer(renderer, this.uniforms, FRAG_P_POS, VERTEX_SHADER, 10, 10)
    // this.ParticalPos.GetMat().uniforms.RT.value = this.ParticalPos.GetRT()

    const geometry = new THREE.BoxGeometry(.1, .1, .1);


    for (var x = 0; x < 1; x += 0.1) {
      for (var y = 0; y < 1; y += 0.1) {

        let uniforms = {
          RT_pos: {
            value: this.ParticalPos.GetRT()
          },
          ID: {
            value: new THREE.Vector2(x, y)
          }
        }



        let Partical = new Shader_RT_Buffer(renderer, uniforms, FRAG_P_Color, VERTEX_P_SHADER)
        // const cube2 = new THREE.Mesh(geometry, this.Partical);
        scene.add(new THREE.Mesh(geometry, Partical.GetMat()));
      }
    }
  }

  GetMat() {
    return this.Partical.GetMat()
  }

  GetPosRT() {
    return this.ParticalPos.GetMat()
  }


  render() {
    this.ParticalPos.render()
    // this.CamFeedBufCurnt.render()

    // this.OpticalFlow.render()
    // console.log(this.OpticalFlow.GetRT())
  }

}

export { Shader };

