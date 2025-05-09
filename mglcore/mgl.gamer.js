// Gamer JS - load, store, save game values.

// Gamer:
// use gamer.loadGameData(); for load game data
// use gamer.gameData .value for get/set values
// use gamer.saveGameData() for save game data

// gamer.base: for base values
// gameg.init() for extended logic

// Set gamer:
// projectName: name of project
// projectVers: versions of project
// base: base values + update() for generated values
// lang: translate

// Use:
// gameData for get / set values

let gamer = {
    base: {
        // Base values

        update(){
            // update generate values
        }
    },

    gameData: {
        new(){
            // Set base values
            for(var key in gamer.base)
                gamer.gameData[key] = gamer.base[key];
        },

        init(){
            this.update();
        }
    },

    loadGameData(){
        const savedData = mglBuild.loadPlayerData(this.projectName + 'gameData');
        this.gameData.new();

        if (savedData){
            const gameData = JSON.parse(savedData); // Parsing data from a string

            this.gameData = {
                ...this.gameData, // Existing data
                ...gameData     // New data from saved JSON
            };

            this.gameData.shop = {
                ...new Object(), // Existing data
                ...gameData.shop // New data from saved JSON
            };

            this.gameData.achieves = {
                ...new Object(), // Existing data
                ...gameData.achieves // New data from saved JSON
            };

        }

        this.gameData.init();
    },

    saveGameData(){
        mglBuild.savePlayerData(this.projectName + 'gameData', JSON.stringify(this.gameData));
    },

    resetGame(){
        this.gameData.new();
        this.gameData.init();
        this.saveGameData();
    },

    lang(id){
        let lang = this.langs[id];

        if(lang){
            let txt = lang[this.gameData.lang];

            if(txt)
                return txt;
        }

        console.error("Lang error: " + id);
        return id;
    },

    // Translations
    langs: {},

    // Mouse
    mouse: {
        pressed: 0,
        pos: new KiVec2(),
        move: new KiVec2(),
        scroll: 10
    },

    // Debug
    debug: {},

    // Temp
    tmp: [],
};