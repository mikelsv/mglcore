import * as THREE from 'three';
import {mglGeometry, mglGeometryGenerator, mglModelGenerator} from 'mglcore/mgl.geometry.js';
import GUI from 'lil-gui';

// Lights
export const lights = {
    ambientLight: {
        item: new THREE.AmbientLight(0x606060) // Мягкий белый свет
    },
    directionalLight: {
        item: new THREE.DirectionalLight(0xffffff, 1), // Направленный свет
        update: function(){
            this.item.castShadow = true;
        }
    },
    hemisphereLight: {
        item: new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
    },
    pointLight: {
        item: new THREE.PointLight(0xffffff, 1, 100) // Точечный свет
    },
    spotLight: {
        item: new THREE.SpotLight(0xffffff, 1) // Прожектор
    }
};

// Materials
export const materials = {
    MeshBasicMaterial: { new: function(){ return new THREE.MeshBasicMaterial(); }},
    MeshNormalMaterial: { new: function(){ return new THREE.MeshNormalMaterial(); }},
    MeshLambertMaterial: { new: function(){ return new THREE.MeshLambertMaterial(); }},
    MeshPhongMaterial: { new: function(){ return new THREE.MeshPhongMaterial(); }},
    MeshPhysicalMaterial: {
        new: function(){
            return new THREE.MeshPhysicalMaterial({ color: 0x00ffff,
                transmission: 0.5,
                roughness: 0.1,
                metalness: 0.0,
                clearcoat: 0.9,
                clearcoatRoughness: 0.1,
                ior: 1.5,
                thickness: 0.5,
                envMapIntensity: 1, });
        }
    },
    MeshStandardMaterial: {
        new: function(){
            let material = new THREE.MeshStandardMaterial({});
         }
    },
    MeshToonMaterial: { new: function(){ return new THREE.MeshToonMaterial(); }},
    ShaderMaterial: { new: function(){
        let textures = new mglGlslTextures();
        let material = textures.matWaterVoronoi();

        material.update = function(deltaTime){
            material.uniforms.iTime.value += deltaTime;
        }

        return material;
    }}
};

// Geometry generator
export let mgg = new mglGeometryGenerator();

export const geometry = {
    cube:{
        call: mgg.makeCube.bind(mgg)
    },
    sphere:{
        call: mgg.makeSphere.bind(mgg)
    },
    ring:{
        call: mgg.makeRing.bind(mgg)
    },
    cylinder:{
        call: mgg.makeCylinder.bind(mgg)
    }
};

// Gui
export const gui = new GUI();