var mglPackage = {
    mglMain: 'main.js',
    mglLibPath: '../',
    mglExtScripts: [],
    mglScripts:[
        {src: "mglcore/mgl.core.js"},
        {src: "mglcore/mgl.build.js"},
        {src: "mglcore/mgl.gamer.js"},
        {src: "gamer.js", local: true },
    ],

    initImportMap(){
        this.importMap = {
            "imports": {
                "mglcore/": `${this.mglLibPath}mglcore/`,
                "three": `${this.mglLibPath}extern/three.module.js`,
                "three/addons/": `${this.mglLibPath}extern/addons/`,
                "lil-gui": `${this.mglLibPath}extern/lil-gui.esm.js`,
            }
        };
    },

    injectHtml(){
        if(mglPackage.mglMain)
            this.mglScripts.push({ src: this.mglMain, local: true, type: "module" });

        this.injectImportMap();
        this.injectImportScripts(this.mglExtScripts);
        this.injectImportScripts(this.mglScripts);
    },

    makeCleanHtml(){
        this.mglScripts.push({ src: this.mglMain, local: true, type: "module" });

        this.initImportMap();

        let html = "<script type=importmap>" + JSON.stringify(this.importMap) + "</script>\r\n";
        html = this.addScripts(html, this.mglExtScripts);
        html = this.addScripts(html, this.mglScripts);

        return html;
    },

    addScripts(html, scripts){
        for(let i = 0; i < scripts.length; i ++){
            let item = scripts[i];
            let src = !item.local ? `${this.mglLibPath}${item.src}` : item.src;
            let type = !item.type ? '' : " type=" + item.type;
            html += `<script src='${src}'${type}></script>\r\n`;
        }

        return html;
    },

    // Dynamic Import Map
    injectImportMap(){
        this.initImportMap();

        // Apply importmap
        const script = document.createElement('script');
        script.type = 'importmap';
        script.textContent = JSON.stringify(this.importMap);
        document.head.appendChild(script);
    },

    injectImportScripts(list){
        for(let i = 0; i < list.length; i ++){
            this.loadScript(list[i]);
        }
    },

    loadScript(item) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = !item.local ? `${this.mglLibPath}${item.src}` : item.src;
            script.defer = true;
            script.async = false;

            if(item.type)
                script.type = item.type;

            script.onload = () => {
                //console.log(`${item.src} loaded successfully.`);
                resolve();
            };

            script.onerror = () => {
                console.error(`Error loading script ${item.src}.`);
                reject(new Error(`Error loading script ${item.src}`));
            };

            document.head.appendChild(script);
        });
    }
};

function mglPackageInit(main){
    if(main || main === null)
        mglPackage.mglMain = main;

    mglPackage.injectHtml();
}

if (typeof module !== 'undefined' && module.exports){
    module.exports = { mglPackage };
}