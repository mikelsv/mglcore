# MyGL core for web game development

## /demo
https://mikelsv.github.io/mglcore/demo/models_and_ligthing.html - models and lighthing demo

https://mikelsv.github.io/mglcore/demo/demo_fish_game.html - threejs fish game demo

https://mikelsv.github.io/mglcore/demo/demo_water_voronoi.html - water texture

https://mikelsv.github.io/mglcore/demo/console_logs.html - console demo

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
