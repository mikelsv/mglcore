var mglBuild = {
    platform: "local",
    build: "-",
    debug: true,

    bonusFlags: {
        BONUS_OPEN: 1,
        BONUS_REWARDED: 2,
        BONUS_ERROR: 3,
        BONUS_CLOSE: 4
    },

    init(){
        mglBuild.log("mglBuild.init() for ", this.platform);
    },

    startGame(){
        mglBuild.log("mglBuild. Game started!");
    },

    startLevel(){
        mglBuild.log("mglBuild. Level started!");
    },

    stopLevel(){
        mglBuild.log("mglBuild. Level ended!");
    },

    loadPlayerData(key){
        return localStorage.getItem(key);
    },

    savePlayerData(key, value){
        return localStorage.setItem(key, value);
    },

    showReward(callback){
        //console.log("Rewarded");
        callback(this.bonusFlags.BONUS_OPEN);
        callback(this.bonusFlags.BONUS_REWARDED);
        callback(this.bonusFlags.BONUS_CLOSE);
    },

    updateLang(){}
};

async function mglBuildInit(){
    mglBuild.log("mglBuild.init() ", mglBuild.build, mglBuild.platform);
    // mglBuild.log("This", "is", "test");
}