import * as THREE from 'three';
import {mglAreaRing, mglHealthBar, mglSingleText2d, mglTextControls, mglTextControls2d} from 'mglcore/mgl.threejs.js';
import {mglGlslTextures} from 'mglcore/mgl.texture.js';

export let mglItemsType = {
    UNKNOWN: 0,
    WAY: 1,
    LEVEL: 2,
    START: 3,
    FINISH: 4,
    END: 5,
    END_POD: 6,
    END_CHEST: 7,
    HERO: 9,

    MODEL_MINE: 10,
    MODEL_BARREL: 11,
    SELECT: 12,
    SELECT_VAL: 13,
    //ITEM_COIN: 14,

    SHOT: 20,

    POWER: 30,
    RATE: 31,
    RANGE: 32,
    SPEED: 33,

    TEXT: 90,

    // State
    STATE_SHOP: 100,
    STATE_LEVELS: 101,
    STATE_SETTINGS: 102,
    STATE_WAIT: 103,
    STATE_RUN: 104,
    STATE_END: 105,

    // Shop
    SHOP_POWER: 200,
    SHOP_RATE: 201,
    SHOP_RANGE: 202,

    // Generate level
    GENERATE_LEVEL: 300,
    GEN_1I_SELECT: 301,
    GEN_1II_SELECT: 302,
    GEN_3I_COIN: 303,
    GEN_3II_COIN_MINE: 304,
    GEN_3II_BARREL: 305,
    GEN_3M_BARREL: 306,
    GEN_3Z_MINE: 307,
    GEN_5III_BARREL: 308,
    GEN_5X_BARREL: 309,
    GEN_15X_BARREL: 310,
    GEN_HELLO_WORLD: 311,
    //generate: ["1I_SELECT", "1II_SELECT", "3I_COIN", "3II_COIN_MINE", "3M_BARREL", "3Z_MINE"],
    GENERATE_LEVEL_END: 399,

    // Models & icons
    MODEL_COIN: 1000,
    MODEL_COIN_SHOP: 1001,
    ICON_HAND: 1002,

    // Mouse
    MOUSE_MOVE: 10000,
    MOUSE_CLICK: 10001,

    // Bonus
    BONUS_CURSOR: 20000,
    BONUS_GET: 20001,
    BONUS_GET_REAL: 20002,
    BONUS_NOTH: 20003,
    //BONUS_EXT_GET: 20003,
    //BONUS_EXT_NOTGET: 20004,

    // Config
    CONF_SOUND_REV: 30000,
    CONF_SOUND_ON: 30001,
    CONF_SOUND_OFF: 30002,
    CONF_MUSIC_REV: 30003,
    CONF_MUSIC_ON: 30004,
    CONF_MUSIC_OFF: 30005,

    MOVE: 99998,
    DELETED: 99999,

    // Constructor
    constructor(){
        // Generate
        for (let i = 0; i <= this.generate.length; i++) {
            this[`GEN_${this.generate[i]}`] = this.GENERATE_LEVEL + i + 1;
        }
    },

    // Get
    getName(id){
        switch(id){
            case mglItemsType.POWER: return "TEXT_POWER";
            case mglItemsType.RATE: return "TEXT_RATE";
            case mglItemsType.RANGE: return "TEXT_RANGE";
        }

        return "UNKNOWN";
    }
};

let mglGeometryOriginId = {
    UP_LEFT: 1,
    UP_CENTER: 2,
    UP_RIGHT: 3,
    CENTER_LEFT: 4,
    CENTER_CENTER: 5,
    CENTER_RIGHT: 6,
    DOWN_LEFT: 7,
    DOWN_CENTER: 8,
    DOWN_RIGHT: 9
};

export class mglLevelsBuilder{
    init(scene, camera, hero, text2d){
        this.levels = [];
        this.models = [];
        this.level = {};
        this.items = [];

        // State
        this.state = mglItemsType.STATE_WAIT;

        // Time
        this.levelTime = 0;
        this.shotTime = 0;

        // Positions
        this.startPos = 3;
        this.startLen = 5;
        this.finishItem = 4;
        this.finishLen = this.finishItem * 10;
        this.endLen = 5;


        // Data
        this.finishMult = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];

        // Scene
        this.scene = scene;
        this.camera = camera;
        this.hero = hero;
        this.text2d = text2d;

        this.setLocation(0);

        // Test Ids
        if(this.testDuplicateValues(mglItemsType)){
            console.error("mglItemsType have duplicates!");
        }

        // Load
        this.enableMouseCallback();
    }

    testDuplicateValues(enumObj) {
        const values = Object.values(enumObj);
        const uniqueValues = new Set(values);
        return values.length !== uniqueValues.size;
    }

    setLocation(id){
        this.locationId = id;
        this.locationRows = 2;
        this.locationWidth = this.locationRows * 3;
        this.levelWidth = this.locationWidth - 2;

        this.loadLevels2();
    }

    // Load
    loadModel(name, mesh, pos){
        let model = {
            name: name,
            mesh: mesh,
            pos: pos
        };

        this.models.push(model);
    }

    // Get
    getModel(name){
        return this.models.find(model => model.name == name);
    }

    getItemById(id){
        let item = this.items.filter(child => child.id == id);
        return item;
    }

    getItemByType(type){
        let item = this.items.filter(child => child.type == type);
        return item;
    }

    // Set
    setCallback(call){
        this.callback = call;
    }

    // Is
    isGame(){
        return this.state == mglItemsType.STATE_RUN;
    }

    isMove(){
        if(this.state == mglItemsType.STATE_RUN)
            return 1;
        else if(this.state == mglItemsType.STATE_END)
            return -1;

        return 0;
    }

    // On
    onMove(){
        if(this.state == mglItemsType.STATE_WAIT){
            this.state = mglItemsType.STATE_RUN;
            let item = this.getItemByType(mglItemsType.ICON_HAND);
            console.log("Me", item, this.state);
            if(item && item.length)
                item[0].mesh.visible = false;
        }
    }

    loadLevels2(){
        this.addLevel({
            id: 1,
            data: [ // ["1I_SELECT", "1II_SELECT", "3I_COIN", "3II_COIN_MINE", "3M_BARREL", "3Z_MINE"],
                { type: mglItemsType.GEN_3Z_MINE},
                { type: mglItemsType.GEN_3I_COIN},
                { type: mglItemsType.GEN_3M_BARREL, values: [1, 1, 5]},
                { type: mglItemsType.GEN_3I_COIN},
                { type: mglItemsType.GEN_3Z_MINE, r: 1},
                { type: mglItemsType.GEN_3I_COIN},
                { type: mglItemsType.GEN_3M_BARREL, values: [1, 1, 5]},
                { type: mglItemsType.GEN_3I_COIN},
                { type: mglItemsType.GEN_3Z_MINE},
                { type: mglItemsType.GEN_3I_COIN},


                //{ l: 10, type: mglItemsType.MODEL_MINE, pos: .5 },
                //{ l: 5, type: mglItemsType.MODEL_MINE, pos: 1. },
                //{ l: 7, type: mglItemsType.MODEL_MINE, pos: .0 },
                //{ l: 7, type: mglItemsType.MODEL_COIN, value: 5, pos: .5 },

                // { l: 10, type: mglItemsType.MODEL_BARREL, value: 1, pos: .0 },
                // { l: 0, type: mglItemsType.MODEL_BARREL, value: 1, pos: 1.0 },
                // { l: 5, type: mglItemsType.MODEL_BARREL, value: 5, pos: .5 },
                // { l: 5, type: mglItemsType.MODEL_COIN, pos: .5 },
        ]});

        this.addLevel({
            id: 2,
            data: [
                { l: 8, type: mglItemsType.SELECT, type2: mglItemsType.POWER, grouped: 1, value: 5, pos: .0},
                { l: 0, type: mglItemsType.SELECT, type2: mglItemsType.POWER, grouped: 1, value: -5, pos: 1.},

                { type: mglItemsType.GEN_3II_COIN_MINE },
                { type: mglItemsType.GEN_3II_COIN_MINE, r: 1 },
                { type: mglItemsType.GEN_3II_BARREL, values: [5, 5, 5, 5, 5, 5] },

                { l: 8, type: mglItemsType.SELECT, type2: mglItemsType.RATE, grouped: 1, value: 3, pos: 1.},
                { l: 0, type: mglItemsType.SELECT, type2: mglItemsType.RATE, grouped: 1, value: -3, pos: .0},

                { type: mglItemsType.GEN_3II_COIN_MINE },
                { type: mglItemsType.GEN_3II_COIN_MINE, r: 1 },
                { type: mglItemsType.GEN_15X_BARREL, value: 1 },
                { type: mglItemsType.GEN_3I_COIN},
                { type: mglItemsType.GEN_15X_BARREL, value: 1 },
        ]});

        this.addLevel({
            id: 3,
            data: [

                { type: mglItemsType.GEN_HELLO_WORLD},
        ]});

        // this.addLevel({
        //     id: 4,
        //     data: this.genLevelFull()
        // });


    }

    loadLevels3(){
        let level1 = {
            id: 1,
            data: [ // , movable: 1
            { l: 1, type: mglItemsType.SELECT, type2: mglItemsType.POWER, grouped: 1, value: 5, pos: .0},
            { l: 0, type: mglItemsType.SELECT, type2: mglItemsType.POWER, grouped: 1, value: -5, pos: 1.},

            { l: 10, type: mglItemsType.MODEL_COIN, value: 5, pos: .0 },

            { l: 10, type: mglItemsType.MODEL_MINE, pos: .5 },
            { l: 5, type: mglItemsType.MODEL_MINE, pos: 1. },
            { l: 5, type: mglItemsType.MODEL_MINE, pos: .0 },
            { l: 10, type: mglItemsType.MODEL_BARREL, value: 5, pos: .0 },
            { l: 0, type: mglItemsType.MODEL_BARREL, value: 1, pos: 1. },
        ]};

        this.addLevel(level1);
    }

    addLevel(level){
        let len = this.startLen;
        let id = 1;
        let gid = 0;
        let optGrouped = 0;
        let i;

        // New data
        let data = [];

        // Generate && rebuild
        for(i = 0; i < level.data.length; i ++){
            if(!level.data[i].l)
                level.data[i].l = 0;

            data.push(level.data[i]);

            if(level.data[i].type >= mglItemsType.GENERATE_LEVEL && level.data[i].type <= mglItemsType.GENERATE_LEVEL_END)
               this.addLevelGen(level, data, level.data[i]);
        }

        // Replace
        level.data = data;

        // Finish
        level.data.push({l: 5, type: mglItemsType.FINISH});

        // Length
        for(i = 0; i < level.data.length; i ++){
            level.data[i].id = id ++;
            len += level.data[i].l;
            level.data[i].len = len;

            // Group
            if(level.data[i].grouped){
                if(!optGrouped || level.data[i].l != 0)
                    optGrouped = ++ gid;
                level.data[i].gid = optGrouped;
            }
        }

        level.finishLen = len;
        level.levelLen = len + this.finishLen;

        this.levels.push(level);
    }

    addLevelGen(level, levelData, item){
        let data;
        let rev = 0;
        let fl = 8;

        // GEN_3Z_MINE
        if(0){
        // GEN_3I_COIN
        } else if(item.type == mglItemsType.GEN_3I_COIN){
                data = [
                    { l: fl, type: mglItemsType.MODEL_COIN, pos: .5 },
                    { l: 5, type: mglItemsType.MODEL_COIN, pos: .5 },
                    { l: 7, type: mglItemsType.MODEL_COIN, pos: .5 },
                ];
        } else if(item.type == mglItemsType.GEN_3II_COIN_MINE){
                data = [
                    { l: fl, type: mglItemsType.MODEL_COIN, pos: .0 },
                    { l: 0, type: mglItemsType.MODEL_MINE, pos: 1. },
                    { l: 5, type: mglItemsType.MODEL_COIN, pos: .0 },
                    { l: 0, type: mglItemsType.MODEL_MINE, pos: 1. },
                    { l: 7, type: mglItemsType.MODEL_COIN, pos: .0 },
                    { l: 0, type: mglItemsType.MODEL_MINE, pos: 1. },
                ];
        // GEN_3M_BARREL
        } else if(item.type == mglItemsType.GEN_3M_BARREL){
            if(!item.values || item.values.length < 3)
                item.values = [1, 1, 1];

                data = [
                    { l: fl, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.values[0] },
                    { l: 0, type: mglItemsType.MODEL_BARREL, pos: 1., value: item.values[1] },
                    { l: 5, type: mglItemsType.MODEL_BARREL, pos: .5, value: item.values[2] },
                ];
        } else if(item.type == mglItemsType.GEN_3II_BARREL){
            if(!item.values || item.values.length < 6)
                item.values = [1, 1, 1, 1, 1, 1];

                data = [
                    { l: fl, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.values[0] },
                    { l: 0, type: mglItemsType.MODEL_BARREL, pos: 1., value: item.values[1] },
                    { l: 5, type: mglItemsType.MODEL_BARREL, pos: 0., value: item.values[2] },
                    { l: 0, type: mglItemsType.MODEL_BARREL, pos: 1., value: item.values[3] },
                    { l: 5, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.values[4] },
                    { l: 0, type: mglItemsType.MODEL_BARREL, pos: 1., value: item.values[5] },
                ];
        // GEN_3Z_MINE
        } else if(item.type == mglItemsType.GEN_3Z_MINE){
            data = [
                { l: fl, type: mglItemsType.MODEL_MINE, pos: .5 },
                { l: 5, type: mglItemsType.MODEL_MINE, pos: 1. },
                { l: 7, type: mglItemsType.MODEL_MINE, pos: .0 },
            ];
        } else if(item.type == mglItemsType.GEN_5III_BARREL){
            data = [];
            data.push({ l: 5, type: mglItemsType.MOVE });

            for(let i = 0; i < 5; i ++){
                data.push({ l: 5, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.value });
                data.push({ l: 0, type: mglItemsType.MODEL_BARREL, pos: 1.0, value: item.value });
            }
        } else if(item.type == mglItemsType.GEN_5X_BARREL){
            data = [];
            data.push({ l: 5, type: mglItemsType.MOVE });
            data.push({ l: 5, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.value });
            data.push({ l: 0, type: mglItemsType.MODEL_BARREL, pos: 1.0, value: item.value });
            data.push({ l: 3, type: mglItemsType.MODEL_BARREL, pos: .5, value: item.value });
            data.push({ l: 3, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.value });
            data.push({ l: 0, type: mglItemsType.MODEL_BARREL, pos: 1.0, value: item.value });
        } else if(item.type == mglItemsType.GEN_15X_BARREL){
            data = [];
            data.push({ l: 5, type: mglItemsType.MOVE });
            for(let i = 0; i < 5; i ++){
                data.push({ l: 3, type: mglItemsType.MODEL_BARREL, pos: .0, value: item.value });
                data.push({ l: 0, type: mglItemsType.MODEL_BARREL, pos: 1.0, value: item.value });
                data.push({ l: 3, type: mglItemsType.MODEL_BARREL, pos: .5, value: item.value });
            }
        } else if(item.type == mglItemsType.GEN_HELLO_WORLD){
            const letters = {
                H: [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1]
                ],
                E: [
                    [1, 1, 1],
                    [1, 0, 0],
                    [1, 1, 1],
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                L: [
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                O: [
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1]
                ],
                W: [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1]
                ],
                R: [
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1]
                ],
                D: [
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1]
                ],
                ' ': [ // Пробел
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]
                ],
                '!': [
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 0, 0],
                    [0, 1, 0]
                ]
            };

            let text = 'HELLO WORLD!';

            data = [];
            data.push({ l: 5, type: mglItemsType.TEXT, text: "Hello World!", size: .7 });
            data.push({ l: 5, type: mglItemsType.MOVE });

            for(let i = 0; i < text.length; i ++){
                let one = letters[text[i]];

                for(let y = 0; y < 5; y ++){
                    for(let x = 0; x < 3; x ++){
                        if(one[4 - y][x])
                            data.push({ l: 0, type: mglItemsType.MODEL_COIN, pos: x * .5 });
                    }

                    data.push({ l: 1, type: mglItemsType.MOVE });
                }

                data.push({ l: 3, type: mglItemsType.MOVE });
            }
        } else{
            data = [];
            console.error("addLevelGen() type not generated!", item.type);
        }

        if(item.r){
            for(let i = 0; i < data.length; i ++){
                data[i].pos = 1 - data[i].pos;
            }
        }

        item.type = mglItemsType.DELETED;
        levelData.push(...data);
    }

    genLevelFull(id){
        let count = 0;
        let maxCount = 12;
        let lastType = -1;

        let types = [
            {type: mglItemsType.GEN_3I_COIN, },
            {type: mglItemsType.GEN_3II_COIN_MINE, r: 1},
            {type: mglItemsType.GEN_3II_BARREL, rvalue: 1},
            {type: mglItemsType.GEN_3M_BARREL, rvalue: 1, },
            {type: mglItemsType.GEN_3Z_MINE, },
            {type: mglItemsType.GEN_5III_BARREL, rvalue: 1 },
            {type: mglItemsType.GEN_5X_BARREL, rvalue: 1 },
            //{type: mglItemsType.GEN_15X_BARREL, rvalue: 1 },
        ];

        let data = [];

        while(count < maxCount){
            let rnd = this.getRandomInt(0, types.length - 1);
            let type = types[rnd];

            if(rnd == lastType)
                continue;

            let item = {
                type: type.type
            };

            if(type.r)
                item.r = this.getRandomInt(0, 1);

            if(type.rvalue){
                item.rvalue = 1; //gamer.gameData.power * 2 + this.getRandomInt(-gamer.gameData.power, gamer.gameData.power);
            }

            data.push(item);

            lastType = rnd;
            count ++;
        }

        return data;
    }

    //
    delLevel(id){
        for(let i = 0; i < this.levels.length; i ++){
            if(this.levels[i].id == id){
                this.levels.splice(i, 1);
                return ;
            }
        }
    }

    // Add items
    addItem(item){
        if(item.movable)
            item.updateChilds = 1;

        this.items.push(item);
        this.scene.add(item.mesh);
    }

    addItemContainer(item){
        if(item.movable)
            item.updateChilds = 1;

        this.items.push(item);
        this.container.add(item.mesh);
    }

    removeItem(item){
        //let child = this.items.filter(child => child == item);

        //if(child){
        //    child.deleted = 1;
        //    this.scene.remove(item.mesh);
        //}

        if(item.child)
            this.removeItem(item.child);

        if(item.child2)
            this.removeItem(item.child2);

        item.deleted = 1;
        this.scene.remove(item.mesh);
    }

    removeItemsById(id){
        this.items.forEach(item => {
            if (item.id === id) {
                this.removeItem(item);
            }
        });
    }

    makeText(text, size, font){
        //let text2d = new mglSingleText2d();
        let mesh = this.text2d.makeShapeText(text, 0xFFFFFF, size);
        return mesh;


        /*
        let texture = this.text2d.makeTexture(text, font);

        const geometry = new THREE.PlaneGeometry(5, 2.5);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.01 });

        return new THREE.Mesh(geometry, material);
        */
    }

    addSelectWindow(element, pos, opt){
        // Window
        let height = 4;
        let geometry = new THREE.PlaneGeometry(3., height);
        let material = new THREE.ShaderMaterial({
            uniforms: {
                state: {value: element.value},
                iResolution: { value: new THREE.Vector2(innerWidth, innerHeight)},
            },
            vertexShader: `varying vec2 vUv;
                void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
                    fragmentShader: `
varying vec2 vUv;
uniform int state;

vec3 makeBorder(vec2 uv, vec3 col){
    float size = 0.02;

    // Вычисляем расстояние до границ
    float distX = min(uv.x, 1.0 - uv.x);
    float distY = min(uv.y, 1.0 - uv.y);
    float dist = min(distX, distY); // Минимальное расстояние до границы

    // Используем smoothstep для создания сглаженной рамки
    float border = smoothstep(size, size - 0.01, dist);

    // Устанавливаем цвет в зависимости от расстояния
    return mix(col, vec3(1.0), border);
}

void main(){
    vec3 col;
    vec2 uv = vUv;

    if(state < 0)
        col = vec3(1., 0., 0.);
    else if(state > 0){
        col = vec3(0., 1., 0.);
    } else
        col = vec3(0., 0., 1.);

    col = makeBorder(uv, col);

    gl_FragColor = vec4(col, 1. - vUv.y);
}`,
                transparent: true
        });

        let item = {
            id: element.id,
            gid: element.gid,
            value: element.value,
            type: mglItemsType.SELECT,
            type2: element.type2,
            mesh: new THREE.Mesh(geometry, material),
            movable: element.movable
        };

        item.mesh.position.copy(pos);
        item.mesh.position.y = height / 2;
        this.addItem(item);

        // Update value
        this.updateSelect(item);

        // Text type
        {
            let item2 = {
                type: mglItemsType.TEXT,
                mesh: this.makeText(gamer.lang(mglItemsType.getName(element.type2)), .6)
            };

            item.child = item2;
            item2.translate = new THREE.Vector3(0, 2, .001);
            item2.mesh.position.copy(item.mesh.position).add(item2.translate);
            this.addItem(item2);
        }
    }

    onSelectShot(item){
        //item.value += gamer.gameData.power;
        item.value ++;
        this.updateSelect(item);
    }

    updateSelect(parent){
        //let child = this.levels.find(child => child.parent == parent.id);

        if(parent.child2)
            this.removeItem(parent.child2);

        // Text count
        {
            let val = parent.value < 0 ? "" + parent.value : "+" + parent.value;

            let sizes = [
                [0, 0, 0, 3],
                [0, 0, 0, 3],
                [.1, .5, 0, 1.8],
                [.1, .7, 0, 1.2],
                [.15, .9, 0, .9],
                [.2, 1., 0, .7],
                [.15, 1.1, 0, .6],
                [.15, 1.2, 0, .5],
                [.15, 1.3, 0, .45],
            ];

            let size = sizes[val.length];

            let item = {
                type: mglItemsType.SELECT_VAL,
                mesh: this.makeText("" + val, size[3]),
                //parent: parent.id
            };

            this.mglGeometryOrigin(item.mesh.geometry, mglGeometryOriginId.CENTER_CENTER);

            parent.child2 = item;
            //item.translate = new THREE.Vector3(size[0] - .2,  size[1] - 1.3, size[2] + .001);
            item.translate = new THREE.Vector3(0, 0, .001);
            item.mesh.position.copy(parent.mesh.position).add(item.translate);

            parent.mesh.material.uniforms.state.value = parent.value;

            this.addItem(item);
        }
    }

    startLevel(id){
        if(id >= 4){
            let level = {
                id: id,
                data: this.genLevelFull(id)
            };

            this.delLevel(id);
            this.addLevel(level);
        }

        let level = this.levels.find(level => level.id == id);

        if(!level)
            return ;

        gamer.gameData.update();

        this.state = mglItemsType.STATE_WAIT;

        // Move hero
        this.hero.position.x = 0;
        this.hero.position.y = 0;
        this.hero.position.z = this.startPos;

        this.newContainer();
        this.clearLevel();

        this.finishLen = level.finishLen;
        this.levelLen = level.levelLen;

        console.log("Level", level.id, level.finishLen, level.levelLen);

        // Make way
        {
            const geometry = new THREE.PlaneGeometry(this.locationWidth, level.levelLen + 2);
            const material = new THREE.MeshBasicMaterial({ color: 0x1E90FF, transparent: false, opacity: .5, side: THREE.DoubleSide})

            let item = {
                type: mglItemsType.WAY,
                mesh: new THREE.Mesh(geometry, material)
            };

            item.mesh.position.z -= level.levelLen / 2 + 2 / 2;
            item.mesh.rotation.x = - Math.PI / 2;
            this.addItem(item);
        }

        // Make start chess
        {
            let glslTextures = new mglGlslTextures();
            const geometry = new THREE.PlaneGeometry(this.locationWidth, 1);
            let material = glslTextures.matChessSquares(new THREE.Vector2(10, 1), 3);

            let item = {
                type: mglItemsType.START,
                mesh: new THREE.Mesh(geometry, material)
            };

            item.mesh.position.z = 0;
            item.mesh.position.y = .001;
            item.mesh.rotation.x = - Math.PI / 2;
            this.addItem(item);
        }

        // Make level $ID text
        {
             let item = {
                type: mglItemsType.TEXT,
                mesh: this.makeText(gamer.lang("LEVEL_TEXT") + " " + id, .6)
            };

            this.mglGeometryOrigin(item.mesh.geometry, mglGeometryOriginId.UP_LEFT);

            item.mesh.position.x = -this.locationWidth / 2 + .3;
            item.mesh.position.y = .001;
            item.mesh.position.z = -.8;
            item.mesh.rotation.x = - Math.PI / 2;
            this.addItem(item);
        }

        // Go go go!
        {
            let item = {
                type: mglItemsType.TEXT,
                mesh: this.makeText(gamer.lang("LEVEL_RUN"), .5)
            };

            this.mglGeometryOrigin(item.mesh.geometry, mglGeometryOriginId.UP_RIGHT);

            item.mesh.position.x = this.locationWidth / 2 - .3;
            item.mesh.position.y = .001;
            item.mesh.position.z = -3;
            item.mesh.rotation.x = - Math.PI / 2;
            this.addItem(item);
        }

        // Developer message
        /*{
            let item = {
                type: mglItemsType.TEXT,
                mesh: this.makeText(gamer.lang("DEVELOPER_MESSAGE"), .5)
            };

            this.mglGeometryOrigin(item.mesh.geometry, mglGeometryOriginId.CENTER_CENTER);

            item.mesh.position.x = 0;
            item.mesh.position.y = .001;
            item.mesh.position.z = -7;
            item.mesh.rotation.x = - Math.PI / 2;
            this.addItem(item);
        }*/

        // Make level
        for(let i = 0; i < level.data.length; i ++){
            let element = level.data[i];
            //len += level.data[i].l;
            //level.data[i].len = len;
            //console.log(element);

            if(element.type == mglItemsType.MODEL_MINE){
                let mine = this.getModel(element.type);

                let item = {
                    type: element.type,
                    mesh: mine.mesh.clone(),
                    movable: element.movable,
                };

                item.mesh.position.set((element.pos - .5) * this.levelWidth, 0, -element.len).add(mine.pos);
                this.addItem(item);
            }

            else if(element.type == mglItemsType.MODEL_BARREL){
                this.addBarrel({len: element.len, pos: element.pos, value: element.value, movable: element.movable });
            }

            else if(element.type == mglItemsType.MODEL_COIN){
                this.addCoin(element.len, element.pos, element.value, element.movable);
            }

            else if(element.type == mglItemsType.SELECT){
                let pos = new THREE.Vector3((element.pos - .5) * this.levelWidth, 0, -element.len);
                this.addSelectWindow(element, pos);
            }
            else if(element.type == mglItemsType.TEXT){
                let item = {
                    type: mglItemsType.TEXT,
                    mesh: this.makeText(element.text, element.size)
                };

                this.mglGeometryOrigin(item.mesh.geometry, mglGeometryOriginId.CENTER_CENTER);

                //item.mesh.position.x = this.locationWidth / 2 - .3;
                item.mesh.position.y = .001;
                item.mesh.position.z = -element.len;

                item.mesh.rotation.x = - Math.PI / 2;
                this.addItem(item);
            }
            else if(element.type == mglItemsType.FINISH){
                let glslTextures = new mglGlslTextures();
                const geometry = new THREE.PlaneGeometry(this.locationWidth, 1);
                let material = glslTextures.matChessSquares(new THREE.Vector2(10, 1), 3);

                let item = {
                    type: mglItemsType.FINISH,
                    mesh: new THREE.Mesh(geometry, material)
                };

                item.mesh.position.z = -element.len;
                item.mesh.position.y = .001;
                item.mesh.rotation.x = - Math.PI / 2;
                this.addItem(item);

                this.makeBarrelFinish(element.len);
            } else if(element.type == mglItemsType.MOVE || element.type == mglItemsType.DELETED){
                // Ignore
            } else
                console.error("startLevel() id not found: ", element.type);
        }

        // Make end circle
        let endLen = this.locationWidth / 2 + 3;
        {
            const geometry = new THREE.CircleGeometry(this.locationWidth / 2 + 3, 64);
            const material = new THREE.MeshBasicMaterial({ color: 0x1E90FF, transparent: false, opacity: .5, side: THREE.DoubleSide})

            let item = {
                type: mglItemsType.END,
                mesh: new THREE.Mesh(geometry, material)
            };

            item.mesh.rotation.x = -Math.PI / 2;
            item.mesh.position.z = -level.levelLen - endLen;
            this.addItem(item);
        }

        // Podium
        let pod = this.getModel(mglItemsType.END_POD);

        let item = {
            type: mglItemsType.END_POD,
            mesh: pod.mesh.clone(),
        };

        item.mesh.scale.set(2, 2, 2);
        item.mesh.position.y = -3;
        item.mesh.position.z = -level.levelLen - endLen;
        this.addItem(item);

        {   // chest
            let chest = this.getModel(mglItemsType.END_CHEST);

            let item = {
                type: mglItemsType.END_CHEST,
                mesh: chest.mesh.clone(),
            };

            item.mesh.position.y = 4.1;
            item.mesh.position.z = -level.levelLen - endLen;
            this.addItem(item);
        }


        { // Add icon_hand
            let icon_hand = this.getModel(mglItemsType.ICON_HAND);

            let item = {
                type: mglItemsType.ICON_HAND,
                mesh: icon_hand.mesh,
            };

            item.mesh.scale.set(.5, .5, .5);
            item.mesh.position.y = 2;
            item.mesh.rotation.x = -Math.PI / 2;
            item.mesh.visible = true;

            this.addItem(item);
        }
    }

    addBarrel(el){
        // el: len, pos, value, movable = false, timeOffset = 0

        let barrel = this.getModel(mglItemsType.MODEL_BARREL);

        if(el.rvalue)
            el.value = gamer.gameData.power * 2 + this.getRandomInt(-gamer.gameData.power, gamer.gameData.power);

        if(!el.value || el.value < 0)
            el.value = 1;

        if(!el.timeOffset)
            el.timeOffset = 0;

        let item = {
            type: mglItemsType.MODEL_BARREL,
            len: el.len,
            pos: el.pos,
            mesh: barrel.mesh.clone(),
            movable: el.movable,
        };

        item.mesh.position.set((el.pos - .5) * this.levelWidth, 0, -el.len).add(barrel.pos);
        this.addItem(item);

        //if(element.type == mglItemsType.BARREL){
            item.value = el.value;
            item.updateChilds = 1;
            item.timeOffset = el.timeOffset;
            this.updateBarrel(item);
        //}
    }

    addCoin(len, pos, value, movable = false, timeOffset = 0){
        let model = this.getModel(mglItemsType.MODEL_COIN);

        let item = {
            type: mglItemsType.MODEL_COIN,
            mesh: model.mesh.clone(),
            movable: movable,
        };

        item.mesh.position.set((pos - .5) * this.levelWidth, 1, -len).add(model.pos);
        this.addItem(item);
    }

    clearLevel(){
        //console.log("clearLevel()", this.items.length);

        while(this.items.length > 0){
            let item = this.items[0];
            this.scene.remove(item.mesh);
            this.items.splice(0, 1);
        }
    }

    makeBarrelFinish(len){
        let h = this.finishItem;
        len += h;

        let arr = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

        for(let i = 0; i < arr.length; i ++){
            if(this.locationRows == 2){
                this.addBarrel({ len: len + i * h, pos: 0.2, value: arr[i], timeOffset: i * 100 });
                //this.addBarrel(len + i * h, 0.5, arr[i], 0, i * 100);
                this.addBarrel({ len: len + i * h, pos: .8, value: arr[i], timeOffset: i * 100 });
            }

            // Text
            let item = {
                type: mglItemsType.TEXT,
                mesh: this.makeText("x" + this.finishMult[i], 1),
            };

            item.mesh.geometry.center();
            item.mesh.position.copy(new THREE.Vector3(-this.levelWidth - .5, .001, -len - i * h));
            item.mesh.rotation.x = -Math.PI / 2;
            this.addItem(item);
        }
    }

    onBarrelShot(item){
        item.value -= gamer.gameData.power;

        if(item.value > 0)
            this.updateBarrel(item);
        else{
            this.callback({type: mglItemsType.MODEL_BARREL});
            this.removeItem(item.child);
            this.removeItem(item);

            // Add coin
            //console.log("Add coin", item);
            this.addCoin(item.len, item.pos, 0, 0);
        }
    }

    updateBarrel(parent){
        if(parent.child)
            this.removeItem(parent.child);

        let item = {
            type: mglItemsType.TEXT,
            mesh: this.makeText("" + parent.value, 1),
            parent: parent
        };

        parent.child = item;
        item.translate = new THREE.Vector3(0, 2, 0);
        item.mesh.position.copy(parent.mesh.position).add(item.translate);
        item.mesh.geometry.center();

        this.addItem(item);
    }

    makeShot(hero){
        let shot = this.getModel("shot")//;

        const shot1 = new THREE.Mesh(
            new THREE.SphereGeometry(.2, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xFF90FF})
        );

        let item = {
            type: mglItemsType.SHOT,
            mesh: shot.mesh.clone(),
            length: 0
        };

        item.mesh.position.set(hero.position.x, 1, hero.position.z - 1).add(shot.pos);
        this.addItem(item);
    }

    update(hero, deltaTime){
        this.levelTime += deltaTime;

        for(let i = this.items.length - 1; i >= 0; i --){
            let item = this.items[i];

            if(item.deleted){
                this.items.splice(i, 1);
                continue;
            }

            if(item.type == mglItemsType.TEXT)
                continue;

            if(item.type == mglItemsType.MODEL_MINE){
                item.mesh.rotation.y = -(Date.now() * 0.001);

                // Intersection
                const box1 = new THREE.Box3().setFromObject(hero);
                const box2 = this.shrinkBox(new THREE.Box3().setFromObject(item.mesh), .75);

                //if(this.isGame() && hero.position.distanceTo(item.mesh.position) < 5 && this.isIntersectBox(box1, this.shrinkBox(box2, .8))){
                if(this.isGame() && hero.position.distanceTo(item.mesh.position) < 5 && this.isIntersectHeroEnemy(box1, box2)){
                    this.callback({type: mglItemsType.END, src: mglItemsType.MODEL_MINE});
                }
            }

            if(item.type == mglItemsType.SELECT){
                // Intersection
                const box1 = new THREE.Box3().setFromObject(hero);
                const box2 = new THREE.Box3().setFromObject(item.mesh);

                if(this.isGame() && this.isIntersectBox(box1, this.shrinkBox(box2, .8)) && !item.moveto){
                    if(item.type2 == mglItemsType.POWER)
                        gamer.gameData.power = Math.max(gamer.gameData.power + item.value, 1);

                    if(item.type2 == mglItemsType.RANGE)
                        gamer.gameData.range = Math.max(gamer.gameData.range + item.value, 1);

                    if(item.type2 == mglItemsType.RATE)
                        gamer.gameData.rate = Math.max(gamer.gameData.rate + item.value, 1);

                    if(item.gid)
                    this.items.forEach(it => {
                        if (it.gid === item.gid && it.id != item.id) {
                            this.removeItem(it);
                        }
                    });

                    this.itemMoveTo(item, new THREE.Vector3(item.mesh.position.x <= 0 ? -5 : 5, 3, item.mesh.position.z - 3), 3000);
                    continue;
                }
            }

            if(item.type == mglItemsType.MODEL_BARREL){
                item.mesh.rotation.x = (Date.now() * 0.001);
                item.mesh.position.y = -Math.abs(Math.sin(Date.now() * 0.001 + item.timeOffset)) / 2;

                // Intersection
                const box1 = new THREE.Box3().setFromObject(hero);
                const box2 = new THREE.Box3().setFromObject(item.mesh);

                if(this.isGame() && hero.position.distanceTo(item.mesh.position) < 5 && this.isIntersectHeroEnemy(box1, box2)){
                    this.callback({type: mglItemsType.END, src: mglItemsType.MODEL_BARREL});
                    return 1;
                }
            }

            if(item.type == mglItemsType.MODEL_COIN){
                item.mesh.rotation.y = -Math.sin(Date.now() * 0.001) * Math.PI;

                // Intersection
                const box1 = new THREE.Box3().setFromObject(hero);
                const box2 = new THREE.Box3().setFromObject(item.mesh);

                if(this.isGame() && !item.moveto && this.isIntersectBox(box1, this.shrinkBox(box2, 1))){
                    this.tmp_coin_lr = !this.tmp_coin_lr;

                    this.itemMoveTo(item, this.hero.position.clone().add(new THREE.Vector3(this.tmp_coin_lr ? 10 : -10, 10, 10)), 3000);
                    this.callback({type: mglItemsType.MODEL_COIN});
                }
            }

            if(item.type == mglItemsType.SHOT){
                item.mesh.position.z -= gamer.gameData.shot_speed * deltaTime;
                item.length += gamer.gameData.shot_speed * deltaTime;

                if(item.length >= gamer.gameData.range){
                    this.scene.remove(item.mesh);
                    this.items.splice(i, 1);
                    continue;
                }

                if(this.testShot(item)){
                    this.scene.remove(item.mesh);
                    this.items.splice(i, 1);
                    continue;
                }
            }

            if(item.type == mglItemsType.ICON_HAND){
                item.mesh.position.x = Math.sin(Date.now() * 0.001 * 2) * 3;
                item.mesh.lookAt(this.camera.position);
            }

            if(item.type == mglItemsType.BONUS_CURSOR){
                const time = Date.now() * 0.001 * item.cursorSpeed;
                const x = Math.sin(time) * item.cursorLim;
                item.mesh.position.x = x;

                //item.mesh.position.x += item.cursorSpeed * item.cursorDir * deltaTime;

                //if (item.mesh.position.x > item.cursorLim) {
                //    item.mesh.position.x = Math.min(item.mesh.position.x, item.cursorLim);
                //    item.cursorDir = -1;
                //} else if (item.mesh.position.x < -item.cursorLim) {
                //    item.mesh.position.x = Math.max(item.mesh.position.x, -item.cursorLim);
                //    item.cursorDir = 1;
                //}
            }

            // Movable
            if(item.moveto){
                item.mesh.position.copy(this.moveTo(item.moveto.startTime, item.moveto.endTime, item.moveto.startPos, item.moveto.endPos));
            }

            if(item.movable)
                item.mesh.position.x = Math.sin(Date.now() * 0.001) / Math.PI * this.levelWidth * 2;

            if(item.updateChilds){
                if(item.child){
                    item.child.mesh.position.copy(item.mesh.position).add(item.child.translate);
                }

                if(item.child2){
                    item.child2.mesh.position.copy(item.mesh.position).add(item.child2.translate);
                }
            }

        }

        // Shot
        if(this.shotTime < this.levelTime && this.isMove() > 0){
            this.makeShot(hero);
            this.shotTime = this.levelTime + 1 / Math.sqrt(gamer.gameData.rate);
        }

        // Container position
        if(this.container){
            //this.container.position.copy(this.hero.position);
            this.container.position.y = this.hero.position.y + 3;
            this.container.lookAt(this.camera.position);
        }

        // Move container 2
        if(this.container2 && this.container2.goto){
            if(this.container2.position.x > this.container2.goto.x){
                this.container2.position.x -= 25 * deltaTime;
            } else if(this.container2.position.z < this.container2.goto.z){
                this.container2.position.z += 25 * deltaTime;
            } else
                delete this.container2.goto;
        }

        // End level
        if(this.isGame() && this.hero.position.z < -this.levelLen){
            this.hero.position.y += deltaTime * 10;

            if(this.hero.position.z < -this.levelLen - 4){
                this.callback({type: mglItemsType.END});
            }
        }
    }

    itemMoveTo(item, pos, time){
        if(item.moveto)
            return 0;

        item.moveto = {
            startTime: Date.now(),
            endTime: Date.now() + time,
            startPos: item.mesh.position,
            endPos: pos
        };

        if(item.child)
            item.updateChilds = true;

        return 1;
    }

    moveTo(startTime, endTime, startPos, endPos) {
        const currentTime = Date.now(); // Текущее время в миллисекундах
        const elapsedTime = currentTime - startTime; // Время, прошедшее с начала движения
        const totalDuration = endTime - startTime; // Общая продолжительность движения

        // Проверяем, не вышло ли время
        if (elapsedTime >= totalDuration) {
            return endPos.clone(); // Если время вышло, возвращаем конечную позицию
        }

        // Вычисляем интерполяцию
        const t = elapsedTime / totalDuration; // Нормализованное время (от 0 до 1)
        return startPos.clone().lerp(endPos, t); // Линейная интерполяция
    }

    // Функция для уменьшения размеров Box3
    shrinkBox(box, factor) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).multiplyScalar(factor); // Уменьшаем размер

        // Устанавливаем новые границы
        box.min.set(center.x - size.x / 2, center.y - size.y / 2, center.z - size.z / 2);
        box.max.set(center.x + size.x / 2, center.y + size.y / 2, center.z + size.z / 2);

        return box;
    }

    testShot(shot){
        for(let i = this.items.length - 1; i >= 0; i --){
            let item = this.items[i];

            if(item.type == mglItemsType.SELECT){
                const box1 = new THREE.Box3().setFromObject(shot.mesh);
                const box2 = new THREE.Box3().setFromObject(item.mesh);

                if(this.isIntersectBox(box1, box2)){
                    this.onSelectShot(item);
                    return 1;
                }
            }

            if(item.type == mglItemsType.MODEL_BARREL){
                const box1 = new THREE.Box3().setFromObject(shot.mesh);
                const box2 = new THREE.Box3().setFromObject(item.mesh);

                if(this.isIntersectBox(box1, box2)){
                    this.onBarrelShot(item);
                    return 1;
                }
            }
        }
    }

    isIntersectHeroEnemy(hero, enemy){
        hero = this.shrinkBox(hero, .7);
        enemy = this.shrinkBox(enemy, .7);

        return hero.intersectsBox(enemy);
    }

    isIntersectBox(box1, box2) {
        return box1.intersectsBox(box2);
    }

    InRange(unitPos, heroPos, range) {
        // Calculate the square of the distance between the unit and the hero
        const dx = unitPos.x - heroPos.x;
        const dy = unitPos.y - heroPos.y;
        const dz = unitPos.z - heroPos.z;

        const distanceSquared = dx * dx + dy * dy + dz * dz;// Square of distance
        const rangeSquared = range * range;// Square of radius

        // Check if the unit is within the radius
        return distanceSquared <= rangeSquared;
    }

    // End
    endGame(){
        if(this.state == mglItemsType.STATE_RUN){
            this.state = mglItemsType.STATE_END;

            if(this.endGameCall)
                this.endGameCall();
        }
    }

    // Callback
    enableMouseCallback(){
        let scene = this.scene;
        let camera = this.camera;
        let callback = this.callback;

        // Mouse control
        function onMouseClick(event){
            onMouseCall(event, mglItemsType.MOUSE_CLICK);
        }

        function onMouseMove(event){
            onMouseCall(event, mglItemsType.MOUSE_MOVE);
        }

        function onMouseCall(event, type) {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children);
            if(!intersects.length)
                return ;

            if(type == mglItemsType.MOUSE_CLICK){
                for(let i = 0; i < intersects.length; i ++){
                    if(intersects[i].object.calldata){
                        intersects[i].object.callback(intersects[i].object.calldata);
                        break;
                    }
                }
            } else {
                if(gamer.tmp.tmpLastMouseMoveObj){
                    gamer.tmp.tmpLastMouseMoveObj.material.color.set(0xffffff);
                    delete gamer.tmp.tmpLastMouseMoveObj;
                }

                for(let i = 0; i < intersects.length; i ++){
                    let obj = intersects[i].object;

                    //console.log("R", i, obj.userData, obj);

                    if(obj.calldata){
                        if(obj.calldata.aColor){
                            obj.calldata.txt.material.color.set(obj.calldata.aColor);
                            gamer.tmp.tmpLastMouseMoveObj = obj.calldata.txt;
                            return ;
                        }
                    }

                    // Click active
                    if(obj.material.name == "Gold"){
                        let mesh = getParentAtLevel(obj, 5);

                        if(mesh.mgl_item && mesh.mgl_item.clactive){
                            //if(mesh.mgl_this.itemMoveTo(mesh.mgl_item, mesh.mgl_this.hero.position.clone().add(new THREE.Vector3(mesh.mgl_this.tmp_coin_lr ? 10 : -10, 10, 10)), 3000))
                            if(mesh.mgl_this.itemMoveTo(mesh.mgl_item, mesh.mgl_this.hero.position.clone().add(new THREE.Vector3(0, 10, mesh.mgl_this.hero.position.z + (mesh.mgl_this.tmp_coin_lr ? 10 : -10))), 3000))
                                callback({ type: mglItemsType.MODEL_COIN_SHOP });
                                mesh.mgl_this.tmp_coin_lr = !mesh.mgl_this.tmp_coin_lr;
                        }
                    }
                }
            }

            return ;
        }

        function getParentAtLevel(obj, level){
            let currentObject = obj;

            for (let i = 0; i < level; i++) {
                if (currentObject.parent) {
                    currentObject = currentObject.parent; // Переходим к следующему родителю
                } else {
                    return null; // Если родитель не найден, возвращаем null
                }
            }

            return currentObject; // Возвращаем найденный родитель
        }

        window.addEventListener('click', onMouseClick);
        window.addEventListener('mousemove', onMouseMove);
    }

    findParentByName(mesh, name) {
        let currentObject = mesh.parent; // Начинаем с родителя текущего объекта

        while (currentObject) {
            if (currentObject.name === name) {
                return currentObject; // Возвращаем родителя, если имя совпадает
            }
            currentObject = currentObject.parent; // Переходим к следующему родителю
        }

        return null; // Если родитель не найден, возвращаем null
    }

    // Container
    newContainer(){
        if(this.container2){
            while (this.container2.children.length > 0) {
                const child = this.container2.children[0];
                this.container2.remove(child);
            }

            this.scene.remove(this.container2);
            delete this.container2;
        }

        // Last container
        this.container2 = this.container;

        // New container
        this.container = new THREE.Group();
        this.container.position.copy(this.hero.position);
        this.container.position.y += 3;
        this.container.scale.set(.3, .3, .3);
        //this.container.position.z = 1;
        this.scene.add(this.container);

        //
        //const aspectRatio = window.innerWidth / window.innerHeight;
        //const distance = this.container.position.distanceTo(this.camera.position);
        // Вычисляем масштаб
        //const scale = distance / (20 / 2); // 20 - ширина плоскости
        //this.container.scale.set(scale * aspectRatio, scale * aspectRatio, scale * aspectRatio); // Масштабируем по X и Y

        const fovRad = this.camera.fov * (Math.PI / 180); // Переводим FOV в радианы
        const visibleHeightAtDistance = 2 * Math.tan(fovRad / 2) * this.container.position.distanceTo(this.camera.position);
        let scale = visibleHeightAtDistance / 20; // 20 — размер плоскости

        //const scale = calculateScale(this.camera);
        //scale = 1;
        //this.container.scale.set(scale, scale, scale);
        //console.log("Scale", scale);

        // Container size
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.y = - 0.02;
        //plane.rotation.x = -Math.PI / 2; // Поворачиваем плоскость так, чтобы она была горизонтальной
        //this.container.add(plane);

        // Создаем каркас плоскости
        const edges = new THREE.EdgesGeometry(planeGeometry); // Получаем геометрию краев
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Цвет линии
        const lineSegments = new THREE.LineSegments(edges, lineMaterial); // Создаем линии
        //this.container.add(lineSegments);

        if(this.container2){
            this.container2.position.copy(this.hero.position);
            this.container2.position.y = 3.5;
            //this.container2.position.copy(this.container.position);
            this.container2.goto = new THREE.Vector3().copy(this.hero.position);
            this.container2.goto.x -= 100;
            this.container2.goto.y -= 10;
        }
    }

    // Shop
    showShopScreen(){
        this.state = mglItemsType.STATE_SHOP;
        this.newContainer();

        // Coins
        this.AddCoins(gamer.gameData.coins, new THREE.Vector3(0, 8, 0));

        // Buttons
        this.addButton(gamer.lang("MENU_START"), new THREE.Vector3(0, 0, 0), {type: mglItemsType.START});
        this.addButton(gamer.lang("MENU_LEVELS"), new THREE.Vector3(0, -3, 0), {type: mglItemsType.STATE_LEVELS});
        this.addButton(gamer.lang("MENU_SETTINGS"), new THREE.Vector3(5, -7, 0), {type: mglItemsType.STATE_SETTINGS});

        for(let i = 0; i < 3; i ++)
            this.addShopCard(i);
    }

    showSettingsScreen(){
        this.state = mglItemsType.STATE_SETTINGS;
        this.newContainer();

        // Buttons
        let soundPos = new THREE.Vector3(-4, 3, 0);
        let musicPos = new THREE.Vector3(-4, 0, 0);

        // Sound
        this.addButton(gamer.lang("MENU_SOUND"), soundPos, {type: mglItemsType.CONF_SOUND_REV});
        this.addButton(gamer.lang("MENU_SOUND_ON"), soundPos.add(new THREE.Vector3(10, 0, 0)), {type: mglItemsType.CONF_SOUND_ON, disable: gamer.gameData.opt_sound});
        this.addButton(gamer.lang("MENU_SOUND_OFF"), soundPos.add(new THREE.Vector3(4, 0, 0)), {type: mglItemsType.CONF_SOUND_OFF, disable: !gamer.gameData.opt_sound});

        // Musci
        this.addButton(gamer.lang("MENU_MUSIC"), musicPos, {type: mglItemsType.CONF_MUSIC_REV});
        this.addButton(gamer.lang("MENU_SOUND_ON"), musicPos.add(new THREE.Vector3(10, 0, 0)), {type: mglItemsType.CONF_MUSIC_ON, disable: gamer.gameData.opt_music});
        this.addButton(gamer.lang("MENU_SOUND_OFF"), musicPos.add(new THREE.Vector3(4, 0, 0)), {type: mglItemsType.CONF_MUSIC_OFF, disable: !gamer.gameData.opt_music});

        // Back
        this.addButton(gamer.lang("MENU_BACK"), new THREE.Vector3(5, -7, 0), {type: mglItemsType.STATE_SHOP});
    }

    showEndScreen(){
        this.state = mglItemsType.END;
        this.newContainer();

        this.addButton(gamer.lang("MENU_RESTART"), new THREE.Vector3(0, 1, 0), {type: mglItemsType.START});
        this.addButton(gamer.lang("MENU_SHOP"), new THREE.Vector3(0, -2, 0), {type: mglItemsType.STATE_SHOP});

        // Coins
        let model = this.getModel(mglItemsType.MODEL_COIN);
        for(let i = 0; i < gamer.gameData.coins_collect; i ++){
            let item = {
                type: mglItemsType.MODEL_COIN,
                mesh: model.mesh.clone(),
                clactive: 1
            };

            let pos = new THREE.Vector3(0, this.getRandomInt(-4, 5), this.getRandomInt(-5, 5));

            item.mesh.clactive = 1;
            item.mesh.position.copy(this.hero.position).add(pos);
            item.mesh.mgl_this = this;
            item.mesh.mgl_item = item;
            this.addItem(item);
        }
    }

    showWinScreen(mult){
        this.state = mglItemsType.END;
        this.newContainer();
        //this.container.position.z = 1;

        mult = this.finishMult[mult];
        gamer.gameData.mult = mult;

        // Bonus
        let bonusWidth = 0, bonusHeight = 2, bonusPos = 0;
        let w = .5;
        let up = 3;

        const bonus = [
            {mult: 2, color: 0xf6520A, width: w * 5},
            {mult: 3, color: 0xffad00, width: w * 4},
            {mult: 4, color: 0xffd701, width: w * 3},
            {mult: 5, color: 0x35ca41, width: w * 2},
            {mult: 4, color: 0xffd701, width: w * 3},
            {mult: 3, color: 0xffad00, width: w * 4},
            {mult: 2, color: 0xf6520A, width: w * 5},
        ];

        for (let i = 0; i < bonus.length; i++) {
            bonusWidth += bonus[i].width;
        }

        for (let i = 0; i < bonus.length; i++) {
            const geometry = new THREE.PlaneGeometry(bonus[i].width, bonusHeight);
            const material = new THREE.MeshBasicMaterial({
                color: bonus[i].color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.x = -bonusWidth/2 + bonus[i].width/2 + bonusPos;
            plane.position.y = up;
            this.container.add(plane);

            // Сохраняем информацию о бонусе в объекте
            plane.userData = {
                bonus: 1,
                mult: bonus[i].mult,
                width: bonus[i].width
                //bonus: bonuses[i],
                //color: colors[i],
                //index: i
            };

            // Text
            let txt = this.makeText("x" + bonus[i].mult, .5);
            txt.geometry.center();
            txt.position.copy(plane.position);
            txt.position.z += .001;
            this.container.add(txt);

            bonusPos += bonus[i].width;
        }

        // Bonus cursor
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, 0);
        triangleShape.lineTo(-0.3, 0.6);
        triangleShape.lineTo(0.3, 0.6);
        triangleShape.lineTo(0, 0);

        const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
        const triangleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        const cursor = new THREE.Mesh(triangleGeometry, triangleMaterial);
        cursor.position.x = -1234567;
        cursor.position.y = bonusHeight / 2 - 0.3 + up;
        cursor.position.z = 0.001;

        let item = {
            type: mglItemsType.BONUS_CURSOR,
            mesh: cursor,
            cursorSpeed: 3,
            cursorDir: 1,
            cursorLim: bonusWidth / 2 - .3
        }

        this.addItemContainer(item);

        // Coins
        let coins = Math.floor(gamer.gameData.coins_collect * mult);
        this.AddCoins(gamer.gameData.coins_collect + " x " + mult + " = " + (coins), new THREE.Vector3(-3, 2 + up, 0));

        // Buttons
        this.addButton(gamer.lang("BONUS_GET"), new THREE.Vector3(0, up - 3, 0), {type: mglItemsType.BONUS_GET});
        this.addButton(gamer.lang("BONUS_NOTH"), new THREE.Vector3(0, up - 7, 0), {type: mglItemsType.BONUS_NOTH});
    }

    getBonusMult(){
        let cursor = this.getItemByType(mglItemsType.BONUS_CURSOR)[0];
        console.log(cursor);

        for(let i = 0; i < this.container.children.length; i ++){
            let obj = this.container.children[i];

            if(obj.userData && obj.userData.bonus){
                if(obj.position.x - obj.userData.width / 2 <= cursor.mesh.position.x && obj.position.x + obj.userData.width / 2 >= cursor.mesh.position.x)
                    return obj.userData.mult;
            }
        }

        return 1;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    addButton(text, pos, data){
        // Text
        let txt = this.makeText(text, 1);
        txt.geometry.center();
        txt.position.copy(pos);
        txt.position.z += .005;

        // Card
        const width = txt.geometry.boundingBox.max.x - txt.geometry.boundingBox.min.x + 1;
        const height = txt.geometry.boundingBox.max.y - txt.geometry.boundingBox.min.y + 1;

        const cardGeometry = new THREE.PlaneGeometry(width, height);
        const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff, side: THREE.DoubleSide });
        const cardMaterial2 = new THREE.MeshBasicMaterial({ color: 0xD5E1EE, side: THREE.DoubleSide });
        const card = new THREE.Mesh(cardGeometry, !data.disable ? cardMaterial : cardMaterial2);
        card.position.copy(pos);

        // data
        data.txt = txt;
        data.aColor = 0xff0000;
        //{ type: type, txt: txt, aColor: 0xff0000, nColor: 0xffffff };

        // Callback
        if(!data.disable){
            card.callback = this.callback;
            card.calldata = data;
        }

        // Container
        this.container.add(card);
        this.container.add(txt);
    }

    AddCoins(value, pos){
        // Coin
        const coinModel = this.getModel(mglItemsType.MODEL_COIN);
        const coin = coinModel.mesh.clone();
        coin.position.copy(pos);

        // Cost text
        let txt = this.makeText("" + value, 1);
		this.mglGeometryOrigin(txt.geometry, mglGeometryOriginId.CENTER_LEFT);
        txt.position.copy(coin.position);
        txt.position.x += .75;
        txt.position.y += 0;
        txt.position.z += .01;

        // Container
        this.container.add(coin);
        this.container.add(txt);
    }

    shop = [
        { name: "TEXT_RATE", k: "rate_level", cost: 80, pos: new THREE.Vector3(-6, 4, 0), type: mglItemsType.SHOP_RATE},
        { name: "TEXT_POWER", k: "power_level", cost: 100, pos: new THREE.Vector3(0, 4, 0), type: mglItemsType.SHOP_POWER},
        { name: "TEXT_RANGE", k: "range_level", cost: 50, pos: new THREE.Vector3(6, 4, 0), type: mglItemsType.SHOP_RANGE},
    ];

    addShopCard(id){
        let shop = this.shop;

        // Window
        let height = 4;
        let geometry = new THREE.PlaneGeometry(3., height);
        let material = new THREE.ShaderMaterial({
            uniforms: {
                state: {value: 1},
                iResolution: { value: new THREE.Vector2(innerWidth, innerHeight)},
            },
            vertexShader: `varying vec2 vUv;
                void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
                    fragmentShader: `varying vec2 vUv;
                uniform int state;

vec3 makeBorder(vec2 uv, vec3 col){
    float size = 0.02;

    // Вычисляем расстояние до границ
    float distX = min(uv.x, 1.0 - uv.x);
    float distY = min(uv.y, 1.0 - uv.y);
    float dist = min(distX, distY); // Минимальное расстояние до границы

    // Используем smoothstep для создания сглаженной рамки
    float border = smoothstep(size, size - 0.01, dist);

    // Устанавливаем цвет в зависимости от расстояния
    return mix(col, vec3(1.0), border);
}

                void main(){
                    vec3 col;
                    vec2 uv = vUv;

                    if(state < 0)
                        col = vec3(1., 0., 0.);
                    else if(state > 0){
                        col = vec3(0., 1., 0.);
                    } else
                        col = vec3(0., 0., 1.);

                    col = makeBorder(uv, col);

                    gl_FragColor = vec4(col, 1. - vUv.y);
                }`,
                transparent: true
        });

        // Card
        const card = new THREE.Mesh(geometry, material);
        card.position.copy(shop[id].pos);

        // Name text
        let txt = this.makeText(gamer.lang(shop[id].name), .8);
        txt.geometry.center();
        txt.position.copy(card.position);
        txt.position.y += 2.5;
        txt.position.z += .01;

        // Value text
        let txt2 = this.makeText("" + gamer.gameData[shop[id].k], 2);
        txt2.geometry.center();
        txt2.position.copy(card.position);
        txt2.position.y += .2;
        txt2.position.z += .01;

        // Coin
        const coinModel = this.getModel(mglItemsType.MODEL_COIN);
        const coin = coinModel.mesh.clone();
        coin.position.copy(card.position);
        coin.position.x -= 1;
        coin.position.y -= 1.5;

        // Cost text
        let cost = this.getCost(shop[id].type, shop[id].cost, gamer.gameData[shop[id].k]);
        let txt3 = this.makeText("" + cost, .5);
		this.mglGeometryOrigin(txt3.geometry, mglGeometryOriginId.CENTER_LEFT);
        //txt3.geometry.center();
        txt3.position.copy(coin.position);
        txt3.position.x += .75;
        txt3.position.y += 0;
        txt3.position.z += .01;

        if(cost > gamer.gameData.coins)
            card.material.uniforms.state.value = -1;

        // Callback
        card.callback = this.callback;
        card.calldata = { type: shop[id].type };

        // Container
        this.container.add(card);
        this.container.add(txt);
        this.container.add(txt2);
        this.container.add(txt3);
        this.container.add(coin);
    }

    mglGeometryOrigin(geometry, origin){
        let _offset = new THREE.Vector3();
        geometry.computeBoundingBox();

        if(geometry.boundingBox.isEmpty())
            _offset.set( 0, 0, 0 );
        else {
            if(origin % 3 == 1)
                _offset.x = geometry.boundingBox.min.x;
            else if(origin % 3 == 2)
                _offset.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) * 0.5;
            else
                _offset.x = geometry.boundingBox.max.x;

            if(Math.trunc((origin - 1) / 3) ==  0)
                _offset.y = geometry.boundingBox.min.y;
            else if(Math.trunc((origin - 1) / 3) ==  1)
                _offset.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) * 0.5;
            else if(Math.trunc((origin - 1) / 3) ==  2)
                _offset.y = geometry.boundingBox.max.y;
        }

        _offset.negate();
        geometry.translate( _offset.x, _offset.y, _offset.z );
    }

    mglGeometryOrigin2(geometry, ox, oy){
        let _offset = new THREE.Vector3();
        geometry.computeBoundingBox();

        if(geometry.boundingBox.isEmpty()){
            _offset.set( 0, 0, 0 );
            geometry.translate( _offset.x, _offset.y, _offset.z );
            return ;
        }
        else {
            _offset.x = geometry.boundingBox.min.x + geometry.boundingBox.max.x * ox;
            _offset.y = geometry.boundingBox.min.y + geometry.boundingBox.max.y * oy;
        }

        _offset.negate();
        geometry.translate( _offset.x, _offset.y, _offset.z );
    }

    addReStartButton(){
        // Card
        const cardGeometry = new THREE.PlaneGeometry(4, 2);
        const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff, side: THREE.DoubleSide });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);

        // Text
        let txt = this.makeText("Restart!", 1);
        txt.geometry.center();
        txt.position.copy(card.position);
        txt.position.z += .01;

        // Callback
        card.callback = this.callback;
        card.calldata = { type: mglItemsType.START };

        // Container
        this.container.add(card);
        this.container.add(txt);
    }

    addShopButton(){
        // Card
        const cardGeometry = new THREE.PlaneGeometry(4, 2);
        const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff, side: THREE.DoubleSide });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        card.position.y = 2;

        // Text
        let txt = this.makeText("Shop", 1);
        txt.geometry.center();
        txt.position.copy(card.position);
        txt.position.z += .01;

        // Callback
        card.callback = this.callback;
        card.calldata = { type: mglItemsType.STATE_SHOP };

        // Container
        this.container.add(card);
        this.container.add(txt);
    }

    getCost(type, baseCost, level) {
        //const baseCost = 50; // Начальная стоимость
        const costMultiplier = 1.5; // Множитель для увеличения стоимости

        // Расчет стоимости следующего уровня
        const nextLevelCost = Math.floor(baseCost * Math.pow(costMultiplier, level - 1));
        return nextLevelCost;
    }

    // Levels
    showLevelsScreen(){
        this.state = mglItemsType.STATE_LEVELS;
        this.newContainer();

        // Levels
        for (let i = 0; i < 16; i++) {
            let pos = new THREE.Vector3(0, 0, 0);
            pos.x = (i % 4) * 3 - 6;
            pos.y = -Math.floor(i / 4) * 3 + 6 + 1;
            pos.z = 0;

            this.addButton("" + (i + 1), pos, {type: mglItemsType.LEVEL, level: i + 1, disable: i >= gamer.gameData.level_max});
        }

        this.addButton(gamer.lang("MENU_ENDLESS"), new THREE.Vector3(-1.5, -6 + .5 + 1, 0), {type: mglItemsType.LEVEL, level: 17, disable: gamer.gameData.level_max < 17});

        return ;
    }

};