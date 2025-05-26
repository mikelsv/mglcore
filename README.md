# MyGL core for web game development

Ho-ho-ho. A big update has arrived. Sections are no longer needed! Now we have mglApp. It hides complex calls inside itself, leaving you with only simple and pleasant code.

And also open the documentation section. It is small for now, but we will work on it.

https://mikelsv.github.io/mglcore/docs/ - Documentation for working with the project.

## /demo
https://mikelsv.github.io/mglcore/demo/models_and_ligthing.html - models and lighthing demo

https://mikelsv.github.io/mglcore/demo/models_generator.html - models generator (mglGeometryGenerator) demo

https://mikelsv.github.io/mglcore/demo/demo_fish_game.html - threejs fish game demo

https://mikelsv.github.io/mglcore/demo/demo_water_voronoi.html - water texture

https://mikelsv.github.io/mglcore/demo/console_logs.html - console demo

## /todo

https://mikelsv.github.io/mglcore/todo/sea_mine.html - Blender and generating a model from primitives.

https://mikelsv.github.io/mglcore/todo/sea_mine_animate.html - Generating a model and animating it from primitives.

https://mikelsv.github.io/mglcore/todo/parametric_modeling.html - Parametric Modeling. Point Tree Function.

## Games
https://mikelsv.github.io/mglcore/piratespath - The Pirate's Way.

Please do not clone or publish these games.
You can use this code to study the logic of the game.

## Changelog
0.1 - 08.05.2025 15:35 - Make project and main code

0.2 - 12.05.2025 05:16 - Package logic and simple loading

0.3 - 14.05.2025 09:09 - Make fixed logic structure and sections

0.4 - 15.05.2025 07:16 - Adding mglConsole class

0.5 - 17.05.2025 19:27 - Add piratepatch game. Add mglPages for title and description.

0.6 - 18.05.2025 05:25 - Add mglGeometryGenerator and mglModelGenerator for generating models. Add new demo.

0.6abcd - 18.05.2025 18:52 - ToDo: sea_mine. Blender vs generation.

#### 0.7 - 21.05.2025 01:30
[x] mglModelsLoader is deprecated class! Use new mglFilesLoader!

[ ] ToDo: sea_mine animation. Generating a model and animating it from primitives.

[x] (a) New mglGlslCombineTextures for combinate glsl textures.

[ ] (b) ToDo: Parametric Modeling.

#### 0.8 - 26.05.2025 09:06
[x] The mglApp class has been created. Now it is possible to work with the library through it, which significantly simplifies its use.

[x] Added documentation section.

[x] The mglStats class has become even more informative and easier to use.


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
