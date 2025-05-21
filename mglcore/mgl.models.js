import * as THREE from 'three';
import {mglGeometry, mglModelGenerator} from 'mglcore/mgl.geometry.js';

export class mglAnimationTrack{
    constructor(key, duration, call){
        this.key = key;
        this.duration = duration;
        this.call = call;
    }
};

export class mglAnimation{
    list = [];

    constructor(model){
        model.animation = this;

    }

    addAnimate(_animate = {}){
        let animate = {
            name: "",
            duration: 2,
            repeat: false,
            mirror: false,
            ..._animate
        };

        this.list.push(animate);

        this.startAnimate(animate);
    }

    startAnimate(animate){
        animate.beginTime = performance.now() * 0.001;
        animate.startTime = performance.now() * 0.001;
        animate.endTime = animate.startTime + animate.duration;

        if(animate.saveit){
            if(animate.object && animate.object[animate.saveit]){
                animate._save = animate.object[animate.saveit].clone();
            } else
                console.error(`Property "${animate.saveit}" does not exist on the object.`);
        }

        if(animate.start)
            animate.start();

        if(animate.animate && animate.animate.start){
            console.log("animate.animate deprecated!")
            animate.animate.start();
        }

        // Ext
        animate._mirror = false;
    }

    updateAnimate(animate){
        let time = performance.now() * 0.001;
        //let deltaTime = animate.endTime - animate.startTime;

        if(time > animate.endTime){
            if(!animate.repeat)
                return 1;

            if(animate.mirror)
                animate._mirror = !animate._mirror;

            animate.startTime = animate.endTime;
            animate.endTime = animate.startTime + animate.duration;
        }

        let value = (time - animate.startTime) / (animate.endTime - animate.startTime);

        if(animate._mirror)
            value = 1 - value;

        if(animate.do)
            animate.do(value);

        if(animate.animate && animate.animate.do)
            animate.animate.do(value);
    }

    endAnimate(animate){
        if(animate.saveit){
            animate.object[animate.saveit].copy(animate._save);
        }

        if(animate.end)
            animate.end();

        if(animate.animate && animate.animate.end)
            animate.animate.end();
    }

    update(){
        let delId = [];

        for(let i = 0; i < this.list.length; i ++){
            if(this.updateAnimate(this.list[i]) >= 1){
                this.endAnimate(this.list[i]);
                delId.push(i);
            }
        }

        for(let i = delId.length - 1; i >= 0; i--){
            this.list.splice(delId[i], 1);
        }
    }

    stop(name, now = 0){
        for(let i = this.list.length - 1; i >= 0; i--){
            if(this.list[i].name == name){
                if(now){
                    this.endAnimate(this.list[i]);
                    this.list.splice(i, 1);
                } else
                    this.list[i].repeat = false;

            }
        }
    }

    stopAll(now = 0){
        for(let i = this.list.length - 1; i >= 0; i--)
            if(now)
                this.endAnimate(this.list[i]);
            else
                this.list[i].repeat = false;


        this.list.length = 0;
    }
};

export class mglAnimations_DELETED{
    // Создаем анимацию тряски
    static createShakeAnimationClip(duration = 2, intensity = 0.2) {
        // Создаем траектории анимации для каждой оси
        const times = [];
        const posXValues = [];
        const posYValues = [];
        const posZValues = [];
        const rotXValues = [];
        const rotYValues = [];
        const rotZValues = [];
        const scaleValues = [];

        // Генерируем ключевые кадры
        const frameCount = 30 * duration; // 30 кадров в секунду
        for (let i = 0; i <= frameCount; i++) {
            const time = i / frameCount * duration;
            times.push(time);

            // Случайные значения для позиции (тряска)
            posXValues.push((Math.random() - 0.5) * intensity);
            posYValues.push((Math.random() - 0.5) * intensity * 0.5);
            posZValues.push((Math.random() - 0.5) * intensity);

            // Случайные значения для вращения
            rotXValues.push((Math.random() - 0.5) * intensity * 0.2);
            rotYValues.push((Math.random() - 0.5) * intensity * 0.2);
            rotZValues.push((Math.random() - 0.5) * intensity * 0.2);

            // Легкое изменение масштаба (пульсация)
            scaleValues.push(1 + (Math.random() - 0.5) * intensity * 0.1);
        }

        // Создаем KeyframeTracks
        const tracks = [
            new THREE.VectorKeyframeTrack(
                '.position',
                times,
                [...posXValues, ...posYValues, ...posZValues].flatMap((v, i) =>
                    new Array(3).fill(0).map((_, j) => j === i % 3 ? v : 0)
                )
            ),
            new THREE.VectorKeyframeTrack(
                '.rotation',
                times,
                [...rotXValues, ...rotYValues, ...rotZValues].flatMap((v, i) =>
                    new Array(3).fill(0).map((_, j) => j === i % 3 ? v : 0)
                )
            ),
            new THREE.VectorKeyframeTrack(
                '.scale',
                times,
                [...scaleValues].flatMap(v => [v, v, v])
            )
        ];

        // Создаем AnimationClip
        return new THREE.AnimationClip('shake', duration, tracks);
    }

    // Создаем анимационный клип движения по восьмёрке
    static createFigureEightAnimationClip(duration = 2, size = 5){
        const times = [];
        const positions = [];

        // Количество ключевых кадров
        const frameCount = 60 * duration; // 60 FPS

        for (let i = 0; i <= frameCount; i++) {
            const time = i / frameCount * duration;
            times.push(time);

            // Параметрические уравнения восьмёрки (лемнискаты)
            const t = (time / duration) * Math.PI * 2;
            const scale = size;

            // Формула лемнискаты Бернулли
            const x = scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
            const z = scale * Math.cos(t) * Math.sin(t) / (1 + Math.sin(t) * Math.sin(t));

            positions.push(x, 0, z); // y = 0 (можно изменить если нужно движение в 3D)
        }

        // Создаем трек анимации
        const track = new THREE.VectorKeyframeTrack(
            '.position',
            times,
            positions
        );

        return new THREE.AnimationClip('figureEight', duration, [track]);
    }
};

export class mglMixer{



};

export class mglSeaMineModel{
    static buildModel(){
        let mmg = new mglModelGenerator();

        function makeMineSpikeOne(mmg, position, rotation){
                let segments = 8;

                mmg.useGroup("black");
                mmg.addModelName("cylinder", { radius: 0.25, length: 0.05, segments: segments * 2, position: position, rotation: rotation });

                mmg.useGroup("red");
                mmg.addModelName("cylinder", { radius: 0.101, length: 0.25, segments: segments, position: position, rotation: rotation });

                mmg.useGroup("white");
                mmg.addModelName("cylinder", { radius: 0.1, length: 0.5, segments: segments, position: position, rotation: rotation });
            }

            function makeMineSpikeRing(mmg, mul, angleSpikes, angleMove){
                let spikes = 4;
                let radius = 1;

                for(let i = 0; i < spikes; i ++){
                    let angle = (i / spikes) * (2 * Math.PI) + angleMove; // Угол для каждого штырька
                    let x = radius * Math.cos(angleSpikes) * Math.cos(angle); // X-координата
                    let y = radius * Math.sin(angleSpikes) * mul; // Y-координата
                    let z = radius * Math.sin(angle) * Math.cos(angleSpikes); // Высота штырька (выше сферы)

                    makeMineSpikeOne(mmg, [x, y, z], [Math.asin(z / radius) * mul, 0, -Math.atan2(x, y)]);
                }
            }

            function makeMineSpikes(mmg, mul){
                let angle = Math.PI / 8;

                makeMineSpikeOne(mmg, [0, mul, 0], [0, 0, 0]);
                makeMineSpikeRing(mmg, mul, angle, 0);
                makeMineSpikeRing(mmg, mul, angle * 2, Math.PI / 4);
            }

            function makeMine(mmg){
                const mat = {
                    //transmission: 0.5,
                    roughness: 0.4,
                    metalness: 0.1,
                    //clearcoat: 0.9,
                    //clearcoatRoughness: 0.9,
                    ior: 1.5,
                    //thickness: 0.9,
                    //envMapIntensity: 0,
                    //flatShading: true,
                };

                mmg.addErase({ name: "sphere", radius: 1 });

                mmg.addGroup("red");
                mmg.setMaterial(new THREE.MeshPhysicalMaterial({ color: 0xff0000, ...mat }));
                mmg.addModelName("sphere", {segments: 16});

                mmg.addGroup("black").setMaterial(new THREE.MeshPhysicalMaterial({ color: 0x000000, ...mat }));
                mmg.addModelName("ring", { radius: .95, tube: .1, rotation: [Math.PI / 2, 0, 0]});

                mmg.addGroup("white").setMaterial(new THREE.MeshPhysicalMaterial({ color: 0xffffff, ...mat }));

                makeMineSpikes(mmg, 1);
                makeMineSpikes(mmg, -1);
            }

        // Make model
        makeMine(mmg);

        let model = mmg.buildModel();

        // Animations
        //model.animations = [];

        //model.animations.push(mglAnimations.createShakeAnimationClip());
        //model.animations.push(mglAnimations.createFigureEightAnimationClip());


        return model;
    };
};