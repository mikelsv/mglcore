import * as THREE from 'three';

export let scene, camera, renderer;

export class mglInitSections{
    static waitForReady(checkFunction, callback){
        const interval = setInterval(() => {
            if (checkFunction()) {
                clearInterval(interval); // Stop checking
                callback(); // Call callback
            }
        }, 100); // Check every 100 milliseconds
    }

    static renderSection(options = {}){
        // Make scene
        scene = new THREE.Scene();

        // Make camera
        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Make render
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.alpha = options.alpha ? true : false;
        renderer.setClearColor(0x000000, 1);
        renderer.shadowMap.enabled = options.shadow ? true : false; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        document.body.appendChild(renderer.domElement);

        // Styles
        const canvas = renderer.domElement;
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