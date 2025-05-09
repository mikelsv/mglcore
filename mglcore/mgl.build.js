let mglBuild = {
    platform: "local",
    debug: false,

    init(){
        console.log("mglBuild.init() for ", this.platform);
    },

    start(){
        console.log("Game started!");
    },

    loadPlayerData(key){
        return localStorage.getItem(key);
    },

    savePlayerData(key, value){
        return localStorage.setItem(key, value);
    },

    showReward(callback){
        console.log("Rewarded");
        callback(true);
    },

    updateLang(){}
};

async function mglBuildInit(){}