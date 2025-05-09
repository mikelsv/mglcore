import * as THREE from 'three';

export class mglFlashScreen {
    types = {
        UNKNOWN_SCREEN: 0,
        FLASH_SCREEN: 1,
        CIRCLES_SCREEN: 2,
    };

    modes = {
        SINGLE: 0, // hide on end
        MAX: 1, // don't hide on end
        REPEAT: 2 // repeat
    };

    constructor() {
        this.type = this.modes.UNKNOWN_SCREEN;
        this.mode = this.modes.SINGLE;

        //
        this.duration = 1;
        this.flasher = undefined;
        this.state = 0;
        this.startTime = 0;
        this.endTime = 0;
    }

    initFlash(scene, colors = [[0.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 1.5]]){
        this.scene = scene;

        let g = new THREE.PlaneGeometry(1., 1.);
        let m = new THREE.ShaderMaterial({
            uniforms: {
                colors: { value: colors.map(c => new THREE.Vector4(...c)) },
                opacity: { value: .0 },
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector2(innerWidth, innerHeight)},
            },
            vertexShader: `varying vec2 vUv;
              void main(){
                vec4 positions[4];
                positions[0] = vec4(-1.0, 1.0, 0.0, 1.0);
                positions[1] = vec4(1.0, 1.0, 0.0, 1.0);
                positions[2] = vec4(-1.0, -1.0, 0.0, 1.0);
                positions[3] = vec4(1.0, -1.0, 0.0, 1.0);

                gl_Position = positions[gl_VertexID];
                //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

              }`,
                  fragmentShader: `varying vec2 vUv;
                uniform vec4 colors[2];
                uniform float opacity;
                uniform vec2 iResolution;
                void main(){
                    vec2 vUv2 = gl_FragCoord.xy / iResolution;
                    vec2 uv = (vUv2 - 0.5) * 1.0;// * vec2(ratio, 1.);
                    gl_FragColor = mix(colors[0], colors[1], length(uv));
                    gl_FragColor.a *= opacity;
                }`,
                transparent: true
            });

        this.flasher = new THREE.Mesh(g, m);
        this.flasher.visible = false;
        this.flasher.position.y = 1.333;

        this.state = 0;

        scene.add(this.flasher);
    }

    initCircles(scene, color = 0xffffff){
        this.scene = scene;

        let g = new THREE.PlaneGeometry(1., 1.);
        let m = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(color) },
                opacity: { value: .0 },
                iResolution: { value: new THREE.Vector2(innerWidth, innerHeight)},
                iTime: { velue: 0 }
            },
            vertexShader: `varying vec2 vUv;
              void main(){
                vec4 positions[4];
                positions[0] = vec4(-1.0, 1.0, 0.0, 1.0);
                positions[1] = vec4(1.0, 1.0, 0.0, 1.0);
                positions[2] = vec4(-1.0, -1.0, 0.0, 1.0);
                positions[3] = vec4(1.0, -1.0, 0.0, 1.0);

                gl_Position = positions[gl_VertexID];
                //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

              }`,
                  fragmentShader: `
varying vec2 vUv;
uniform vec3 color;
uniform float iTime;
uniform float opacity;
uniform vec2 iResolution;

#define M_PI 3.1415926535897932384626433832795

#define blur 0.01
#define S(a, b, n) smoothstep(a, b, n)

float circleUp(in vec2 uv, in float r) {
    return r - (length(uv));
}

void main(){
    //vec2 vUv2 = gl_FragCoord.xy / iResolution.xy;
    //vec2 uv = (vUv2 - 0.5) * 1.0;// * vec2(ratio, 1.);

    vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / iResolution.y;

    vec3 col = vec3(0.);

    float time = iTime * 2.;
    float cycle = floor(time);
    float part = time - cycle;

    float angle = atan(uv.y, uv.x);

    if(angle < M_PI - part * M_PI * 2.)
        cycle --;

    float c = circleUp(uv, 2. - cycle / 5.);
    c = S(blur, -blur, c);
    col += c * color;

    gl_FragColor = vec4(col, 1.0);
}               `,
                transparent: true
            });

        this.flasher = new THREE.Mesh(g, m);
        this.flasher.visible = false;
        this.flasher.position.y = 1.333;

        this.state = 0;

        scene.add(this.flasher);
    }

    setMode(val){
        this.mode = val;
    }

    setDuration(value){
        this.duration = value;
    }

    start(){
        if(!this.flasher){
            console.error("mglFlashScreen not init for work!");
            return ;
        }

        this.state = 1;
        //this.time = 0;
        this.startTime = Date.now() * 0.001;
        this.endTime = this.startTime + this.duration;
        this.flasher.visible = true;

        // Update resolution
        this.flasher.material.uniforms.iResolution.value = new THREE.Vector2(innerWidth, innerHeight);

        console.log("redFlashBorder alert!");
    }

    stop(){
        this.state = 0;
        this.flasher.visible = false;
    }

    getOpacity(currentTime, maxTime){
        if(this.mode == this.modes.MAX){
            return Math.min(currentTime / maxTime, 1);
        }

        if (currentTime < 0 || currentTime > maxTime) {
            return 0;
        }

        const halfTime = maxTime / 2;

        if (currentTime <= halfTime){
            // Increase transparency from 0 to 1
            return currentTime / halfTime;
        } else {
            // Decrease transparency from 1 to 0
            return (maxTime - currentTime) / halfTime;
        }
    }

    update(camera, deltaTime){
        if(!this.state)
            return ;

        let time = Date.now() * 0.001;

        if(this.endTime < time){
            if(this.mode == this.modes.SINGLE){
                this.state = 0;
                this.flasher.visible = false;
            } else if(this.mode == this.modes.MAX){
                //this.state = 0;
            } else if(this.mode == this.modes.REPEAT){
                this.startTime = Date.now() * 0.001;
            }
        }

        //this.flasher.position.copy(camera.position.clone());
        this.flasher.position.copy(camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3())));
        //this.flasher.lookAt(camera.position.clone());
        this.flasher.material.uniforms.opacity.value = this.getOpacity(time - this.startTime, this.duration);
        this.flasher.material.uniforms.iTime.value = time - this.startTime;
    }

};
