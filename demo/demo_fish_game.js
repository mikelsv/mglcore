import * as THREE from 'three';
import {mglLoadingScreen, mglModelsLoader, mglAudioLoader, mglSingleItems, mglLights} from 'mglcore/mgl.threejs.js';
import {mglGameSpawnClass, mglAreaRing} from 'mglcore/mgl.threejs.js';
import {mglFlashScreen} from 'mglcore/mgl.screen.js';
import {mglStickControl, mglStickControl2d, mglStickControl3d, mglKeyboardControl} from 'mglcore/mgl.controls.js'
import {mglGlslTextures} from 'mglcore/mgl.texture.js';

// Hero
let hero;
let cube;
let water;

// Variables
let lastTime = 0;
let gameStarted = 0;

// Loader
var mglModels = new mglModelsLoader();
mglModels.loadModel('buoy', './models/buoy.glb');
mglModels.loadModel('clown_fish', './models/clown_fish.glb');

// Spawn
let gameSpawn = new mglGameSpawnClass(mglModels);


// Make scene
const scene = new THREE.Scene();

// Make camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 15, 10);

// Make render
//const renderer = new THREE.WebGLRenderer({ alpha: true });
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejs'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.alpha = true;
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 1);


// Start game
gameStartTest();

function gameStartTest(){
    if(mglModels.isReady()){
        gameStart();
        return 1;
    }

    setTimeout(() => {
        gameStartTest();
    }, 100);
}

// Start game
function gameStart(){
    console.log("Start game!", gamer.projectName, gamer.projectVers[0]);
    mglBuild.start();

    let loadingScreen = new mglLoadingScreen();
    loadingScreen.hideScreen();

    // Hero
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
    hero = new THREE.Mesh(geometry, material);
    scene.add(hero);

    {// Cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
        cube = new THREE.Mesh(geometry, material);
    }

    // Spawn
    gameSpawn.init(scene);

    // Spawn model
    const buoyModel = mglModels.getModel('buoy');
    if(buoyModel){
        buoyModel.scene.scale.set(.02, .02, .02);
        gameSpawn.setSpawnModel(buoyModel.scene);
    }

    const unitModel = mglModels.getModel('clown_fish');
    if(unitModel){
        unitModel.scene.scale.set(.1, .1, .1);
        gameSpawn.setUnitModel(unitModel.scene);
    }

    gameSpawn.setUnitModel(cube);

    // Spawns
    gameSpawn.addSpawn(new KiVec2(0, 0), 5, 10, 1000);
    gameSpawn.addSpawn(new KiVec2(20, 0), 5, 10, 1000);

    // Ground
    water = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        //new THREE.BoxGeometry(5, 5, 5),
        //new THREE.MeshPhongMaterial( { color: 0xcbcbcb, specular: 0x474747 } )
        new THREE.MeshBasicMaterial({ color: 0x1E90FF, transparent: false, opacity: .5, side: THREE.DoubleSide}) // Цвет воды
    );
    water.rotation.x = - Math.PI / 2;
    scene.add( water );

    // Lights
    scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966, 3 ) );
    mglLights.addShadowedLight(scene, 1, 1, 1, 0xffffff, 3.5 );
    mglLights.addShadowedLight(scene, 0.5, 1, - 1, 0xffd500, 3 );
}


// Controls
let stickControl = new mglStickControl3d();
stickControl.init(scene, true);

let keyboardControl = new mglKeyboardControl();
keyboardControl.init();

// Hero area
let heroArea = new mglAreaRing();
heroArea.init(scene, 5);

// Flasher
let redFlashBorder = new mglFlashScreen();
redFlashBorder.initFlash(scene);

// Animation function
function animate(time) {
    requestAnimationFrame(animate);

    // Calculate the time elapsed since the last frame
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if(hero)
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

        camera.position.copy(hero.position.clone().add(new THREE.Vector3(0, 15, 10)));
        camera.lookAt(hero.position.clone());
    }

    // Controls
    if(hero){
        redFlashBorder.update(camera, time);
        stickControl.update(camera, hero, time);
        heroArea.update(camera, hero, time);
        gameSpawn.update(scene, time, hero.position, 5);

        hero.rotation.x += 0.01;
        hero.rotation.y += 0.01;
    }



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