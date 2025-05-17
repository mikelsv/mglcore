// [Import section]
import * as THREE from 'three';
import {mglLoadingScreen, mglModelsLoader, mglAudioLoader, mglSingleItems, mglGameSpawnClass, mglLights} from 'mglcore/mgl.threejs.js';
import {mglSingleText2d, mglTextControls, mglTextControls2d, mglCenterModel} from 'mglcore/mgl.threejs.js';
import {mglStickControl, mglStickControl2d, mglStickControl3d, mglKeyboardControl, mglMoveControl} from 'mglcore/mgl.controls.js'
import {mglFlashScreen} from 'mglcore/mgl.screen.js';
import {mglItemsType, mglLevelsBuilder} from './levels.js';
import {mglGlslTextures} from 'mglcore/mgl.texture.js';
import {mglStats} from 'mglcore/mgl.stats.js';

// [Render section]
import {scene, camera, renderer, mglInitSections} from 'mglcore/mgl.sections.js';
mglInitSections.renderSection({ alpha: true, shadow: true });

// [Load section]
var mglModels = new mglModelsLoader();
mglModels.setScreen(new mglLoadingScreen());

// https://www.flaticon.com/ru/free-icon/hand_4868355
mglModels.loadModel('icon_hand', './models/icon_hand.png');

//"Pirate Ship" (https://skfb.ly/6Ez7W) by IoannSergeich is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
mglModels.loadModel('pirate_ship', './models/pirate_ship.glb');

// "Sea Mine" (https://skfb.ly/o8RI7) by Bora Özakaltun is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
mglModels.loadModel('sea_mine', './models/sea_mine_sw.glb');

// "Explosive Barrel" (https://skfb.ly/6TzVs) by digitalghast is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
mglModels.loadModel('explosive_barrel', './models/explosive_barrel.glb');

// "LowPoly Podium" (https://skfb.ly/osTGK) by Tibsy is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
mglModels.loadModel('lowpoly_podium', './models/lowpoly_podium.glb');

// "Coin" (https://skfb.ly/oqGSQ) by rukitu is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
mglModels.loadModel('coin', './models/coin.glb');

// "Stylized chest" (https://skfb.ly/oDCnv) by Zlata Budilova is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
//mglModels.loadModel('stylized_chest', './models/stylized_chest.glb');

// Audio
mglModels.loadModel('sound_coin', './audio/korotkiy-zvuk-neskolkih-monet-30643.mp3');
mglModels.loadModel('sound_button', './audio/knopka-klik-v-prostranstve-blizkii.mp3');
mglModels.loadModel('sound_barrel', './audio/derevyannaya-dver-zahlopyivaetsya-37572-[AudioTrimmer.com].mp3');
mglModels.loadModel('sound_frogg', './audio/zvonkaya-lyagushka-chem-to-nedovolna_jfGVDzJZ.mp3');
mglModels.loadModel('sound_mine', './audio/zvukovoy-effekt-vzryiva-minometa.mp3');
mglModels.loadModel('sound_background', './audio/sail-the-seven-seas-20240607-125000.mp3');
mglModels.loadModel('sound_victory', './audio/eternal-victory-20240607-150757.mp3');

// Font
//mglModels.loadModel('helvetiker_regular', 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json');
mglModels.loadModel('font_roboto', './models/Roboto Medium_Regular.json');

// Audio loader
const audio = new mglAudioLoader();

// [Init section]
await mglInitSections.initSection(mglModels);

// [Global section]

// Hero
let hero;
let cube;
let cameraZ = 0;
let firstJump = { state: 0 };

// Level builder
let singleText2d = new mglSingleText2d();
let levelsBuilder;

// Text
let textControls = new mglTextControls();
let textControls2d = new mglTextControls2d();

// Textures
let glslTextures = new mglGlslTextures();
let glslWater;

// Flasher
let redFlashBorder = new mglFlashScreen();
redFlashBorder.initFlash(scene, camera);
redFlashBorder.setMode(redFlashBorder.modes.MAX);
redFlashBorder.setDuration(.2);

let stats;
if(mglBuild.debug){
    stats = new mglStats(renderer);
    stats.showAllPanels();
}

// [Start section]
mglInitSections.waitForReady(() => mglModels.isReady(), gameStart);

function gameStart(){
    mglBuild.log("Start game!", gamer.projectName, gamer.projectVers[0]);
    mglBuild.startGame();

    // Title
    mglBuild.page.setTitle(gamer.lang('GAMER_TITLE'), gamer.lang('GAMER_DESCR'));

    // Canera
    camera.fov = 45;
    camera.updateProjectionMatrix();

    // Test cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
    cube = new THREE.Mesh(geometry, material);
    //scene.add(cube);

    // Hero
    const heroModel = mglModels.getModel('pirate_ship');
    if(heroModel){
        hero = heroModel.scene;
        hero.scale.set(2., 2., 2.);
        scene.add(hero);
    } else {
        const geometry = new THREE.ConeGeometry(1, 2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.5 });
        hero = new THREE.Mesh(geometry, material);
        hero.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(hero);
    }

    // Text
    singleText2d.setHelFont(mglModels.getModel('font_roboto'));
    levelsBuilder = new mglLevelsBuilder();
    levelsBuilder.setCallback(gameCallback);

    // Text
    textControls.init(scene, camera, mglModels.getModel('helvetiker_regular'));
    textControls2d.init(scene, camera, mglModels.getModel('helvetiker_regular'));

    // Water
    {
        const geometry = new THREE.PlaneGeometry(1000, 1000);

        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x0E50CF,
        });

        glslWater = glslTextures.matWaterVoronoi();

        const water = new THREE.Mesh(geometry, glslWater);
        water.position.y = -.1;
        water.rotation.x = - Math.PI / 2;
        scene.add(water);
    }

    // Lights
    scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966, 3 ) );
    mglLights.addShadowedLight(scene, 1, 1, 1, 0xffffff, 3.5 );
    mglLights.addShadowedLight(scene, 0.5, 1, - 1, 0xffd500, 3 );

    // Levels builder
    levelsBuilder.init(scene, camera, hero, singleText2d);

    const sea_mine = mglModels.getModel('sea_mine');
    const box = new THREE.Box3().setFromObject(sea_mine.scene);
    const center = box.getCenter(new THREE.Vector3());
    sea_mine.scene.position.sub(center);

    console.log(sea_mine, center);
    levelsBuilder.loadModel(mglItemsType.MODEL_MINE, sea_mine.scene, new THREE.Vector3(0, 0, 0));

    // Coin
    const coin = mglModels.getModel('coin');
    coin.scene.scale.set(3, 3, 3);
    levelsBuilder.loadModel(mglItemsType.MODEL_COIN, coin.scene, new THREE.Vector3(0, 0, 0));

    // Barrel
    const barrel = mglModels.getModel('explosive_barrel');
    let barrel1 = mglCenterModel(barrel.scene);
    barrel1.rotation.z = Math.PI / 2;
    levelsBuilder.loadModel(mglItemsType.MODEL_BARREL, barrel1, new THREE.Vector3(0, 0, 0));

    {
        const pod = mglModels.getModel('lowpoly_podium');
        levelsBuilder.loadModel(mglItemsType.END_POD, pod.scene, new THREE.Vector3(0, 0, 0));
    }

    {
        //const chest = mglModels.getModel('stylized_chest');
        levelsBuilder.loadModel(mglItemsType.END_CHEST, coin.scene, new THREE.Vector3(0, 0, 0));
    }

    // Cannon
    {
        //const group = new THREE.Group();
        const geometry = new THREE.SphereGeometry(.25);
        const material = new THREE.MeshPhysicalMaterial({ color: 0xff0000});
        const shot = new THREE.Mesh(geometry, material);
        levelsBuilder.loadModel("shot", shot, new THREE.Vector3(0, 0, 0));
    }

    // Icon hand
    const icon_hand = mglModels.getModel('icon_hand');

    {
        const material = new THREE.MeshBasicMaterial({ map: icon_hand, alphaMap2: icon_hand, color: 0x1fffff, transparent: true });
        const geometry = new THREE.PlaneGeometry(5, 5);
        const plane = new THREE.Mesh(geometry, material);

        levelsBuilder.loadModel(mglItemsType.ICON_HAND, plane, new THREE.Vector3(0, 0, 0));
    }

    // Audio
    audio.load(camera, mglModels);
    let sound_background = audio.getAudio("sound_background");
    sound_background.sound.setLoop(true);
    audio.getAudio("sound_victory").sound.setLoop(true);
    audio.playOnClick("sound_background");

    gameReStart();

    // Hide loading screen
    mglModels.getScreen().hideScreen();

    // Go!
    setTimeout(() => {
        levelsBuilder.showShopScreen();
        //levelsBuilder.showWinScreen(5);
        //levelsBuilder.openLevels(scene, camera);
        //levelsBuilder.drawLevel(1);
    }, 1000);
}

function gameReStart(){
    // Gamer
     gamer.gameData.dead = 0;

    //hero.position.set(0, 0, 0);

    redFlashBorder.stop();
}

function playBgAudio(win){
    gamer.tmp.sound_win = win;

    if(!gamer.gameData.opt_music || !hero)
        return ;

    if(win){
        audio.stop("sound_background", { time: 1000 });
        audio.play("sound_victory", { time: 1000 });
    } else {
        audio.play("sound_background", { time: 1000 });
        audio.stop("sound_victory", { time: 1000 });
    }
}

function stopBgAudio(){
    audio.stop("sound_background", { time: 1000 });
    audio.stop("sound_victory", { time: 1000 });
}

function pauseBgAudio(){
    audio.pause("sound_background");
    audio.pause("sound_victory");
}


function playSound(name){
    if(!gamer.gameData.opt_sound)
        return ;

    audio.play(name);
}

function gameCallback(data){
    //console.log("gameCallback(): ", data);

    if(data.type == mglItemsType.STATE_SHOP){
        playSound("sound_button");
        levelsBuilder.showShopScreen();
        redFlashBorder.stop();
    }

    if(data.type == mglItemsType.STATE_LEVELS){
        playSound("sound_button");
        levelsBuilder.showLevelsScreen();
    }

    if(data.type == mglItemsType.STATE_SETTINGS){
        playSound("sound_button");
        levelsBuilder.showSettingsScreen();
    }

    if(data.type == mglItemsType.START){
        redFlashBorder.stop();
        playSound("sound_button");
        hero.rotation.x = 0;
        hero.rotation.z = 0;

        playBgAudio(0);

        mglBuild.startLevel();
        levelsBuilder.startLevel(gamer.gameData.level);
    }

    if(data.type == mglItemsType.LEVEL){
        redFlashBorder.stop();
        playSound("sound_button");
        gamer.gameData.level = data.level;
        hero.rotation.x = 0;
        hero.rotation.z = 0;

        playBgAudio(0);

        mglBuild.startLevel();
        levelsBuilder.startLevel(gamer.gameData.level);
    }

    if(data.type == mglItemsType.END){
        let len = -hero.position.z;

        // Lost
        if(len < levelsBuilder.finishLen){
            redFlashBorder.start();
            levelsBuilder.state = mglItemsType.END;

            //if(data.src == mglItemsType.MODEL_MINE || data.src == mglItemsType.MODEL_BARREL){
                playSound("sound_mine");
                //hero.rotation.x = Math.PI / 2 / 2;
                hero.rotation.z = -Math.PI / 2;
            //}

            setTimeout(() => {
                levelsBuilder.showEndScreen();
            }, 1000);
        } else { // Win
            let mult = Math.trunc((len - levelsBuilder.finishLen) / levelsBuilder.finishItem);

            playBgAudio(1);

            if(mult > 9)
                mult = 9;

            levelsBuilder.state = mglItemsType.END;

            //console.log(levelsBuilder.finishLen, hero.position, mult);

            // Level
            gamer.gameData.level ++;
            if(gamer.gameData.level_max <= gamer.gameData.level)
                gamer.gameData.level_max = gamer.gameData.level;

            // Scene
            setTimeout(() => {
                levelsBuilder.showWinScreen(mult);
            }, 1000);
        }

        mglBuild.stopLevel();
    }

    // Coins
    if(data.type == mglItemsType.MODEL_COIN){
        gamer.gameData.coins_collect ++;
        playSound("sound_coin");
    }

    if(data.type == mglItemsType.MODEL_COIN_SHOP){
        gamer.gameData.coins ++;
        playSound("sound_coin");
    }

     // Barrel destroy
    if(data.type == mglItemsType.MODEL_BARREL){
        playSound("sound_barrel");
    }

    // Shop
    if(data.type == mglItemsType.SHOP_POWER || data.type == mglItemsType.SHOP_RATE || data.type == mglItemsType.SHOP_RANGE)
        gameCallbackShop(data.type);

    // Bonus
    if(data.type == mglItemsType.BONUS_GET){
        pauseBgAudio();
        mglBuild.showReward(bonusCallback);
    }

    if(data.type == mglItemsType.BONUS_GET_REAL){
        let mult = levelsBuilder.getBonusMult();

        let coins = Math.floor(gamer.gameData.coins_collect * gamer.gameData.mult * mult);
        gamer.gameData.coins += coins;
        //gamer.gameData.coins += gamer.gameData.coins_collect * gamer.gameData.mult * mult;

        if(gamer.gameData.level_max == gamer.gameData.level)
            gamer.gameData.level_max ++;

        console.log("BONUS", gamer.gameData.coins, gamer.gameData.mult, mult);

        gamer.saveGameData();
        levelsBuilder.showShopScreen();
        //playBgAudio();
    }

    if(data.type == mglItemsType.BONUS_NOTH){
        let coins = Math.floor(gamer.gameData.coins_collect * gamer.gameData.mult);
        gamer.gameData.coins += coins;

        if(gamer.gameData.level_max == gamer.gameData.level)
            gamer.gameData.level_max ++;

        gamer.saveGameData();
        levelsBuilder.showShopScreen();
    }

    // Condig
    if(data.type == mglItemsType.CONF_SOUND_REV)
        optSound(!gamer.gameData.opt_sound);

    if(data.type == mglItemsType.CONF_SOUND_ON)
        optSound(1);

    if(data.type == mglItemsType.CONF_SOUND_OFF)
        optSound(0);

    if(data.type == mglItemsType.CONF_MUSIC_REV)
        optMusic(!gamer.gameData.opt_music);

    if(data.type == mglItemsType.CONF_MUSIC_ON)
        optMusic(1);

    if(data.type == mglItemsType.CONF_MUSIC_OFF)
        optMusic(0);
}

function bonusCallback(state){
    console.log("Bonus", state);

    if(state == mglBuild.bonusFlags.BONUS_REWARDED)
        gameCallback({ type: mglItemsType.BONUS_GET_REAL });

    if(state == mglBuild.bonusFlags.BONUS_CLOSE)
        playBgAudio(gamer.tmp.sound_win);

    //gameCallback({ type: mglItemsType.BONUS_NOTH });
}

function optSound(value){
    gamer.gameData.opt_sound = value;
    playSound("sound_button");
    levelsBuilder.showSettingsScreen();
}

function optMusic(value){
    gamer.gameData.opt_music = value;
    playSound("sound_button");
    levelsBuilder.showSettingsScreen();

    if(value)
        playBgAudio(gamer.tmp.sound_win);
    else
        stopBgAudio();
}

function gameCallbackShop(type){
    let shop = levelsBuilder.shop.find(item => item.type === type);
    let cost = levelsBuilder.getCost(shop.type, shop.cost, gamer.gameData[shop.k])

    if(gamer.gameData.coins >= cost){
        gamer.gameData.coins -= cost;
        gamer.gameData[shop.k] ++;
        levelsBuilder.showShopScreen();
        gamer.gameData.update();
        playSound("sound_coin");
    } else{
        playSound("sound_frogg");
        console.log("No money, no honey!");
    }
}

// [Controls section]
let stickControl = new mglStickControl();
stickControl.init(scene);

let keyboardControl = new mglKeyboardControl();
keyboardControl.init();

let moveControl = new mglMoveControl();
moveControl.init(stickControl, keyboardControl);


// [Animate section]
let lastTime = 0;

function animate(time){
    requestAnimationFrame(animate);

    // Stats
    if(mglBuild.debug)
        stats.beginAnimate();

    if(!hero)
        return ;

    // Calculate the time elapsed since the last frame
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if(firstJump)
        firstJumpHero();

    if(hero && !gamer.gameData.dead){
        // Movement of the object depending on the keys pressed
        let move = keyboardControl.getMove();

        // Mouse movement
        if(!move.length())
            move = new KiVec2(stickControl.moveX, stickControl.moveY);

        // Disable y
        move.y = 0;

        // Limit maximum speed to 1
        if(move.length() > 1)
            move = move.normalize();

        // Turn the player in the direction of movement
        //if(move.length())
        //    hero.rotation.y = 0;//Math.atan2(move.x, move.y) - Math.PI;

        // On user move
        if(move.length() || stickControl.pointDown)
            levelsBuilder.onMove();

        let ism;
        if(ism = levelsBuilder.isMove()){
            if(ism > 0)
                move.y = -gamer.gameData.vspeed;
            else
                move.x = 0;
        }

        // Debug pause
        if(gamer.debug.pause){
            //move.y = -keyboardControl.keys['ArrowUp'] - keys['KeyW'] + keys['ArrowDown'] + keys['KeyS'];
            move = keyboardControl.getMove();
        }

        // Multiply by the player's speed
        move = move.multiply(gamer.gameData.hspeed * deltaTime);

        // Move the player in the direction of movement
        hero.position.x += move.x;
        hero.position.z += move.y;

        // Limit
        const lim = levelsBuilder.levelWidth / 2;
        if(hero.position.x < -lim)
            hero.position.x = -lim;

        if(hero.position.x > lim)
            hero.position.x = lim;

        // Camera
        let camPos = new THREE.Vector3(1, 5 + cameraZ * 10, 11);

        {
            // New
            const cameraGame = new THREE.Vector3(2, 7, 7);
            //const cameraShop = new THREE.Vector3(3 + 3, 7 + 2, 3);
            const cameraShop = new THREE.Vector3(8, 7, -1);

            if(window.innerHeight > window.innerWidth){
                let aspect = (window.innerHeight / window.innerWidth);
                aspect *= .9;
                cameraGame.multiplyScalar(aspect);
                cameraShop.multiplyScalar(aspect);
            }

            const cameraMoveGame = new THREE.Vector3(0, 0, -5);
            const cameraMoveShop = new THREE.Vector3(-5, 0, 0);

            camPos = new THREE.Vector3().lerpVectors(cameraGame, cameraShop, cameraZ);
            let camMove = new THREE.Vector3().lerpVectors(cameraMoveGame, cameraMoveShop, cameraZ);

            if(!gamer.tmp.camPosX)
                gamer.tmp.camPosX = 0;

            //if(window.innerHeight > window.innerWidth)
            //    camPos.add(new THREE.Vector3(5, 5, gamer.tmp.camPosX))

            //const cameraOffset = new THREE.Vector3(3 + cameraZ * 3, 7 + cameraZ * 2, 7); // Смещение камеры
            camera.position.copy(hero.position).add(camPos); // Поднимаем камеру
            camera.lookAt(hero.position.clone().add(camMove));
        }

        // Camera scroll
        if(levelsBuilder.state == mglItemsType.STATE_SHOP || levelsBuilder.state == mglItemsType.STATE_LEVELS
             || levelsBuilder.state == mglItemsType.END){
                cameraZ = Math.min(cameraZ + deltaTime, 1);
        } else
            cameraZ = Math.max(cameraZ - deltaTime, 0);
    }

    // Controls
    redFlashBorder.update(deltaTime);
    stickControl.update(camera, hero, time);
    levelsBuilder.update(hero, deltaTime);

    // Cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.material.opacity = Math.abs(Math.sin(Date.now() * 0.001));

    // Water
    if(glslWater){
        glslWater.uniforms.iTime.value = time / 1000 / 5;
    }

    // Audio
    audio.update();

    // Render
    renderer.render(scene, camera);

    // Stats
    if(mglBuild.debug)
        stats.endAnimate();
}

// Let's start the animation
animate(0);

// First Jump
function firstJumpHero(){
    if(!hero)
        return ;

    if(firstJump.state == 0){
        firstJump.tweak = new mglTweak();
        firstJump.tweak.start(500);
        firstJump.state = 1;
    }

    if(firstJump.state == 1){
        hero.position.y = firstJump.tweak.value() * 10 - 5;
        hero.rotation.x = firstJump.tweak.mix(Math.PI / 2, -Math.PI / 3, firstJump.tweak.value());

        if(firstJump.tweak.end()){
            firstJump.tweak.start(500);
            firstJump.state = 2;
        }
    }

    if(firstJump.state == 2){
        let value = (1 - firstJump.tweak.value());
        hero.position.y = value * 5;
        hero.rotation.x = firstJump.tweak.mix(0, -Math.PI / 3, value);

        if(firstJump.tweak.end())
            firstJump.state = 3;
    }

    if(firstJump.state == 3){
        firstJump = undefined;
    }
}

// Visiblity
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pauseBgAudio();
    } else {
        playBgAudio(gamer.tmp.sound_win);
    }
});

