import * as THREE from 'three';
import {mglLoadingScreen, mglModelsLoader, mglAudioLoader, mglSingleItems, mglGameSpawnClass, mglLights} from 'mglcore/mgl.threejs.js';
import {mglStickControl, mglStickControl2d, mglStickControl3d, mglKeyboardControl} from 'mglcore/mgl.controls.js'
import {mglGlslTextures} from 'mglcore/mgl.texture.js';

// Hero
let hero;
let water;

// Variables
let lastTime = 0;
let gameStarted = 0;

// Make scene
const scene = new THREE.Scene();

// Make camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Set the initial position of the camera
camera.go_y = 0;
camera.position.set(3, 15, 10);

// Make render
//const renderer = new THREE.WebGLRenderer({ alpha: true });
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejs'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.alpha = true;
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 1);

// Start game
function gameStart(){
    console.log("Start game!", gamer.projectName, gamer.projectVers[0]);
    mglBuild.start();

    let loadingScreen = new mglLoadingScreen();
    loadingScreen.hideScreen();

    // Hero cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
    hero = new THREE.Mesh(geometry, material);
    scene.add(hero);

    // Textures
    let textures = new mglGlslTextures();

    // Water
    water = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        textures.matWaterVoronoi()
    );
    water.rotation.x = - Math.PI / 2;
    scene.add(water);

    // Lights
    scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966, 3 ) );
    mglLights.addShadowedLight(scene, 1, 1, 1, 0xffffff, 3.5 );
    mglLights.addShadowedLight(scene, 0.5, 1, - 1, 0xffd500, 3 );
}

// Controls
let stickControl = new mglStickControl2d();
stickControl.init(scene, true);

let keyboardControl = new mglKeyboardControl();
keyboardControl.init();

// Go
gameStart();

// Animation function
function animate(time) {
    requestAnimationFrame(animate);

    // Calculate the time elapsed since the last frame
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    { // Move Section //
        let move = keyboardControl.getMove();

        // Mouse movement
        if(!move.length())
            move = new KiVec2(stickControl.moveX, stickControl.moveY);

        // Limit maximum speed to 1
        if(move.length() > 1)
            move = move.normalize();

        // Multiply by the player's speed
        move = move.multiply(10 * deltaTime);

        // Move the player in the direction of movement
        hero.position.x += move.x;
        hero.position.z += move.y;
    }

    camera.lookAt(hero.position.clone());

    // water
    water.material.uniforms.iTime.value = time / 1000 / 5;

    // Render
    renderer.render(scene, camera);
}

// Let's start the animation
animate(0);


// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log("RESIZE!", window.innerWidth, window.innerHeight);
});