# MyGL core for web game development

## /demo
https://mikelsv.github.io/mglcore/demo/models_and_ligthing.html - models and lighthing demo

https://mikelsv.github.io/mglcore/demo/models_generator.html - models generator (mglGeometryGenerator) demo

https://mikelsv.github.io/mglcore/demo/demo_fish_game.html - threejs fish game demo

https://mikelsv.github.io/mglcore/demo/demo_water_voronoi.html - water texture

https://mikelsv.github.io/mglcore/demo/console_logs.html - console demo

## Games
https://mikelsv.github.io/mglcore/piratespath - The Pirate's Way.

Please do not clone or publish these games.
You can use this code to study the logic of the game.

## Logic - index.html
```html
    <div mgl_package>
        <script src="../mglcore/mgl.package.js"></script>
        <script>
            mglPackageInit("main.js");
        </script>
    </div>
```
mgl.package.js mglPackageInit(); creates html injection for load project scripts and modules.

Also, `<div mgl_package>` will be replaced on plain text code for build and deployment for extern resources.

## Sections - main module logic

```javascript
// [Import section]
import * as THREE from 'three';

// [Render section]
import {scene, camera, renderer, mglInitSections} from 'mglcore/mgl.sections.js';
mglInitSections.renderSection({ alpha: true, shadow: false });

// [Load section]
var mglModels = new mglModelsLoader();
mglModels.setScreen(new mglLoadingScreen()); // Show loading screen

mglModels.loadModel('font_roboto', './models/Roboto Medium_Regular.json'); // Load file

const mglAudio = new mglAudioLoader();

// [Init section]
await mglInitSections.initSection(mglModels);

// [Global section]
let gameBuilder = new GameBuilder();
let singleText2d = new mglSingleText2d();

// [Start section]
mglInitSections.waitForReady(() => mglModels.isReady(), gameStart);

function gameStart(){
    console.log("Start game!", gamer.projectName, gamer.projectVers[0]);
}

// [Callback section]
function callback(data){...}

// [Controls section]
let stickControl = new mglStickControl3d();
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

    let move = moveControl.getMove(SPEED * deltaTime);

    // Render
    renderer.render(scene, camera);
}

// Let's start the animation
animate(0);
```

## Changelog
0.1 - 08.05.2025 15:35 - Make project and main code

0.2 - 12.05.2025 05:16 - Package logic and simple loading

0.3 - 14.05.2025 09:09 - Make fixed logic structure and sections

0.4 - 15.05.2025 07:16 - Adding mglConsole class

0.5 - 17.05.2025 19:27 - Add piratepatch game. Add mglPages for title and description.

0.6 - 18.05.2025 05:25 - Add mglGeometryGenerator and mglModelGenerator for generating models. Add new demo.

## /mglcore - need to refactory and more structure logic.
mgl.build.js - build functions for any game platforms.

mgl.controls.js - mouse and keyboard controls classes.

mgl.core.js - core helper classes. KiVec2, mglEasting, mglTweak, mglConsole.

mgl.gamer.js - gamer data. Load, store, save game values.

mgl.geometry.js - geometry primitives.

mgl.package.js - package variables for init html.

mgl.screen.js - screen extension. Flash screen.

mgl.sections.js - sections logic helper.

mgl.stats.js - statiscs.

mgl.texture.js - textures on glsl.

mgl.threejs.js - threejs classes.

## /extern
Local copy [threejs](https://github.com/mrdoob/three.js), lil-gui, cannon-es for make build.
