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
        camera = new THREE.PerspectiveCamera(35, size.width / size.height, 0.1, 1000);

        // Make render
        renderer = new THREE.WebGLRenderer(options);
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
            '-webkit-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none',
            '-webkit-user-drag': 'none',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'outline': 'none'
        });
    }

    static async initSection(mglModels){
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

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            console.log("Window resized!", window.innerWidth, window.innerHeight);
        });

        // Lock the context menu
        if(!mglBuild.debug){
            const canvas = renderer.domElement;
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        }
    }
};


export class mglApp{
    lastTime = 0;

    // Load section call
    onLoadApp(){
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

    onAnimateApp(){
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
            }
        };

        // [Render section]
        mglInitSections.renderSection(options.render);
        //mglInitSections.renderSection({ alpha: true, shadow: true });

        // [Load section]
        this.mglFiles = new mglFilesLoader();
        this.mglFiles.setScreen(new mglLoadingScreen());

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
                this.mglFiles.getScreen().hideScreen();

               this.startApp();
            });
        })
        .catch((error) => {
            this.mglFiles.getScreen().setError(error);
            console.error("error:", error);
        });
    }

    startApp(){
        mglBuild.log("Start game!", gamer.projectName, gamer.projectVers[0]);
        mglBuild.startGame();

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
        this.onAnimateApp(this.deltaTime);

        //console.log(renderer);

        // Render
        renderer.render(scene, camera);

        // Stats
        if(mglBuild.debug)
            this.stats.endAnimate();
    }

};