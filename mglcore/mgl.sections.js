import * as THREE from 'three';
import {mglLoadingScreen, mglFilesLoader, mglAudioLoader, mglLights} from 'mglcore/mgl.threejs.js';
import {mglStats} from 'mglcore/mgl.stats.js';

export let scene, camera, renderer;

export class mglInitSections{
    static waitForReady(checkFunction, callback){
        const interval = setInterval(() => {
            if(checkFunction()){
                clearInterval(interval); // Stop checking
                callback(); // Call callback
            }
        }, 100); // Check every 100 milliseconds
    }

    static renderSection(options = {}){
        // Make scene
        scene = new THREE.Scene();

        let size = !options.canvas ? { width: window.innerWidth, height: window.innerHeight } : { width: options.canvas.offsetWidth, height: options.canvas.offsetHeight };

        // Make camera
        camera = new THREE.PerspectiveCamera(options.camera.fov, size.width / size.height, 0.1, 1000);
        //console.log(options, size, window.innerWidth, window.innerHeight);

        // Make render
        renderer = new THREE.WebGLRenderer(options.render);
        renderer.setSize(size.width, size.height);
        renderer.alpha = options.alpha ? true : false;
        renderer.setClearColor(0x000000, 1);
        renderer.shadowMap.enabled = options.shadow ? true : false; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

        if(!options.canvas)
            document.body.appendChild(renderer.domElement);

        // Styles
        const canvas = renderer.domElement;

        if(!options.canvas)
            Object.assign(canvas.style, {
            'user-select': 'none',
            'touch-action': 'manipulation',
            '-khtml-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none',
            '-webkit-text-size-adjust': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-user-select': 'none',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'outline': 'none'
        });

        // Body styles
        //  Object.assign(document.body.style, {
        //     'user-select': 'none',
        //     'touch-action': 'manipulation',
        //     '-khtml-user-select': 'none',
        //     '-moz-user-select': 'none',
        //     '-ms-user-select': 'none',
        //     '-webkit-text-size-adjust': 'none',
        //     '-webkit-touch-callout': 'none',
        //     '-webkit-user-drag': 'none',
        //     '-webkit-user-select': 'none',
        //  });

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            console.log("Window resized!", window.innerWidth, window.innerHeight);
        });

    }

    static async initSection(mglModels){
        // Debug url
        const url = new URL(window.location.href);
        const mgldebugValue = url.searchParams.get("mgldebug");
        if(mgldebugValue !== null && mgldebugValue !== undefined){
            mglBuild.debug = mgldebugValue !== 'false' && mgldebugValue !== '0';
        }

        // Console && page
        mglBuild.console = new mglConsole({ init: mglBuild.debug });
        mglBuild.log = (...args) => mglBuild.console.log(...args);
        mglBuild.warn = (...args) => mglBuild.console.warn(...args);
        mglBuild.error = (...args) => mglBuild.console.error(...args);

        // Page
        mglBuild.page = new mglHtmlPage();

        if(gamer.title && mglBuild.debug)
            mglBuild.page.setTitle(gamer.title, gamer.descr);

        // Init build
        await mglBuildInit();

        // Load game data
        gamer.loadGameData();
        mglBuild.updateLang();
        mglModels.getScreen().setLoadingText(gamer.lang("LOADING_MESSAGE"));

        // Lock the context menu
        if(!mglBuild.debug && !url.searchParams.get("mglmenu")){
            const canvas = renderer.domElement;
            canvas.addEventListener('contextmenu', (e) => {
                console.log("!contextmenu");
                e.preventDefault();
                return false;
            }, { passive: false });
        }
    }
};

export class mglApp{
    lastTime = 0;

    // Load section call
    onLoadApp(mglFiles){
        // this.mglFiles.loadFile('name', 'url');
    }

    onInitApp(){
        // this.hero = new Hero();
    }

    onStartApp(){
        // scene.add(this.hero);

        // Demo
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xfff000 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Don't forget your camera!
        camera.position.set(0, 5, 5);
        camera.lookAt(0, 0, 0);
    }

    onAnimateApp(deltaTime){
        // hero.position.set(1, 2, 3);
    }

    // Run this app
    runApp(_options = {}){
        let options = {
            ... _options,
            render: {
                alpha: false,
                antialias: true,
                shadow: false,
                ... _options.render
            },
            camera: {
                 fov: 45,
                 ... _options.camera
            },
        };

        // [Render section]
        mglInitSections.renderSection(options);
        //mglInitSections.renderSection({ alpha: true, shadow: true });

        // [Load section]
        this.mglFiles = new mglFilesLoader();
        this.mglFiles.setScreen(new mglLoadingScreen());
        gamer.mglFiles = this.mglFiles;

        // User call
        this.onLoadApp();

        // Audio loader
        // const audio = new mglAudioLoader();

        // [Init section]
        mglInitSections.initSection(this.mglFiles)
        .then(() => {
            this.onInitApp();

            // Stats
            if(mglBuild.debug){
                this.stats = new mglStats(renderer);
                this.stats.showAllPanels();
            }

            this.mglFiles.asyncLoad()
            .then(() => {
                // Audio
                this.mglAudio = new mglAudioLoader();
                this.mglAudio.load(camera, this.mglFiles);

                // Hide screen
                this.mglFiles.getScreen().hideScreen();

                // Start app
               this.startApp();
            });
        })
        .catch((error) => {
            this.mglFiles.getScreen().setError(error);
            console.error("error:", error);
        });
    }

    startApp(){
        mglBuild.log("Start app!", gamer.projectName, gamer.projectVers[0]);
        mglBuild.startApp();

        this.onStartApp();

        // Animate
        this.animateApp(performance.now());
    }

    // [Animate section]
    animateApp(time){
         this.animationId = requestAnimationFrame(this.animateApp.bind(this));

        // Stats
        if(mglBuild.debug)
            this.stats.beginAnimate();

        // Calculate the time elapsed since the last frame
        this.deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // User call
        this.onAnimateApp(time, this.deltaTime);

        //console.log(renderer);

        // Render
        renderer.render(scene, camera);

        // Stats
        if(mglBuild.debug)
            this.stats.endAnimate();
    }

};

// level builder class

export class mglLevelBuilder{
    // Textures
    textures = [];

    getTexture(id){
        let item = this.textures.find(item => item.id == id);
        if(item)
            return item.texture;

        return undefined;
    }

    addTexture(id, texture){
        let item = {
            id: id,
            texture: texture
        };

        this.textures.push(item);
    }

    removeTexture(id){
        let index = this.textures.findIndex(item => item.id === id);

        if(index !== -1){
            this.textures.splice(index, 1);
        }
    }

    clearTextures(){
        this.textures.length = 0;
    }

    // Font
    setFont(font){
        this.mglFont = font;
    }

    // Draw
    drawText2d(_optiopns = {}){
        let options = {
            text: "test",
            size: 1,
            color: 0xffffff,
            position: new THREE.Vector3(0, 0, 0),
            ... _optiopns
        };

        const material = new THREE.MeshBasicMaterial({
            color: options.color,
            side: THREE.DoubleSide
        });

        const shapes = this.mglFont.generateShapes(options.text, options.size);
        const geometry = new THREE.ShapeGeometry(shapes);

        geometry.computeBoundingBox();

        const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(xMid, 0, 0);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(options.position);

        return mesh;
    }

    // Buttons


    // Callbacks
    callback(){} // general
    callbutton(){} // button

    // Update
    update(time, deltaTime){} // Animate

    // Test
    testDuplicateValues(enumObj) {
        const values = Object.values(enumObj);
        const uniqueValues = new Set(values);
        return values.length !== uniqueValues.size;
    }
};