import './style.css'
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { getFresnelMat } from "./getFresnelMat.js";



const _VS = `
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;
  
  varying float vReflectionFactor;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  
    vec3 I = worldPosition.xyz - cameraPosition;
  
    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
  
    gl_Position = projectionMatrix * mvPosition;
`;

const _FS = `
  uniform vec3 color1;
  uniform vec3 color2;
  
  varying float vReflectionFactor;
  
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
`;


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

camera.position.setZ(0)

const earthtexture = new THREE.TextureLoader().load('earth.jpg')
const cloudtexture = new THREE.TextureLoader().load('cloud.jpg')
const lightstexture = new THREE.TextureLoader().load('lights.jpg')

const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight);



function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(1500));

    star.position.set(x, y, z);
    scene.add(star);
}

Array(2500).fill().forEach(addStar);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const renderScene = new RenderPass(scene, camera)
const composer = new EffectComposer(renderer)
composer.render

composer.addPass(renderScene)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 2, 0.2);
composer.addPass(bloomPass)
bloomPass.threshold = 0.005
composer.addPass(bloomPass)
const outputPass = new OutputPass();
composer.addPass(outputPass)
const spaceTexture = new THREE.TextureLoader().load('space.jpg');



const ambient = new THREE.AmbientLight(0xffffff)
ambient.intensity = 0.00

const light = new THREE.PointLight(0xffffff)
light.intensity = 19000
light.position.set(-100, 20, 40)
scene.add(light, ambient)

const geomeetry = new THREE.IcosahedronGeometry(10, 10);
const matterial = getFresnelMat()
const sphere = new THREE.Mesh(geomeetry, matterial);



const geometry = new THREE.IcosahedronGeometry(10, 10)
const material = new THREE.MeshStandardMaterial({ map: earthtexture })
const earth = new THREE.Mesh(geometry, material)
const material2 = new THREE.MeshStandardMaterial({
    map: cloudtexture,

    blending: THREE.AdditiveBlending,
    //transparent: true,
    opacity: 0.99
})
const material3 = new THREE.MeshBasicMaterial({
    map: lightstexture,

    blending: THREE.AdditiveBlending,
    //transparent: true,
    opacity: 0.2
})



const clouds = new THREE.Mesh(geometry, material2)
const lights = new THREE.Mesh(geometry, material3)

lights.scale.setScalar(1.01)
clouds.scale.setScalar(1.01)
earth.add(lights)
earth.add(clouds)
earth.add(sphere);



const moontexture = new THREE.TextureLoader().load('moon.jpg');
const geometry1 = new THREE.IcosahedronGeometry(4, 10)
const material1 = new THREE.MeshBasicMaterial({ map: moontexture })
const moon = new THREE.Mesh(geometry1, material1)

moon.position.setY(-25)
moon.position.setX(30)
sphere.scale.setScalar(1.02)

earth.add(moon)
earth.rotation.z += 0.6
scene.add(earth)

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    earth.rotation.y = t * -0.001 + 1.6;
    //let x = 10
    //let z = 10
    //x += 30 * Math.sin(t * 0.001)
    //z += 30 * Math.sin(t * 0.001)
    //
    //moon.position.setZ(x)
    //moon.position.setX(z)
    //




    camera.position.z = t * -0.01 + 17;
    //camera.position.setZ(80)

}

document.body.onscroll = moveCamera;
moveCamera();

document.body.onscroll = moveCamera;
moveCamera();




animate()


function animate() {
    requestAnimationFrame(animate)





    renderer.render(scene, camera)
        //composer.render()
}