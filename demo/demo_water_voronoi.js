// [Import section]
import * as THREE from 'three';
import {mglLoadingScreen, mglModelsLoader, mglAudioLoader, mglSingleItems, mglGameSpawnClass, mglLights} from 'mglcore/mgl.threejs.js';
import {mglStickControl, mglStickControl2d, mglStickControl3d, mglKeyboardControl, mglMoveControl} from 'mglcore/mgl.controls.js'
import {mglGlslTextures} from 'mglcore/mgl.texture.js';

// [Render section]
import {scene, camera, renderer, mglInitSections} from 'mglcore/mgl.sections.js';
mglInitSections.renderSection({ alpha: true, shadow: false });
camera.position.set(3, 15, 10);

// [Load section]
var mglModels = new mglModelsLoader();
mglModels.setScreen(new mglLoadingScreen());

// [Init section]
await mglInitSections.initSection(mglModels);

// [Global section]

// Hero
let hero;
let water;

// [Start section]
mglInitSections.waitForReady(() => mglModels.isReady(), gameStart);

// Start game
function gameStart(){
    console.log("Start game!", gamer.projectName, gamer.projectVers[0]);
    mglBuild.startGame();

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

    // Hide loading screen
    mglModels.getScreen().hideScreen();
}

// [Controls section]
let stickControl = new mglStickControl2d();
stickControl.init(scene, true);

let keyboardControl = new mglKeyboardControl();
keyboardControl.init();

let moveControl = new mglMoveControl();
moveControl.init(stickControl, keyboardControl);

// [Animate section]
let lastTime = 0;

function animate(time){
    requestAnimationFrame(animate);

    // Calculate the time elapsed since the last frame
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    // Move
    if(hero){
        let move = moveControl.getMoveFromCamera(camera, deltaTime * 10);
        hero.position.x += move.x;
        hero.position.z += move.y;

        // Camera
        camera.lookAt(hero.position.clone());
    }

    // water
    if(water)
        water.material.uniforms.iTime.value = time / 1000 / 5;

    // Render
    renderer.render(scene, camera);
}

// Let's start the animation
animate(0);
