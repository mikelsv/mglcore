import * as THREE from 'three';

export class mglGlslTextures{
    matOneColor(color){
        if(!color)
            color = 0xff0000;

        const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: false,
        });

        return material;
    }

    matTwoColors(colors = [0xff0000, 0x00ff00]){
        const colorArray = new Float32Array(colors.length * 3);
        colors.forEach((color, index) => {
            const c = new THREE.Color(color);
            colorArray[index * 3] = c.r;     // Red component
            colorArray[index * 3 + 1] = c.g; // Green component
            colorArray[index * 3 + 2] = c.b; // Blue component
        });

        const material = new THREE.ShaderMaterial({
            uniforms: {
                colors: { value: colorArray }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                uniform vec3 colors[2];
                void main() {
                    if (vPosition.x > 0.0) {
                        gl_FragColor = vec4(colors[0], 1.0);
                    } else {
                        gl_FragColor = vec4(colors[1], 1.0);
                    }
                }
            `,
            side: THREE.DoubleSide
        });

        return material;
    }

    matFourColors(colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]){
        const colorArray = new Float32Array(colors.length * 3);
        colors.forEach((color, index) => {
            const c = new THREE.Color(color);
            colorArray[index * 3] = c.r;     // Red component
            colorArray[index * 3 + 1] = c.g; // Green component
            colorArray[index * 3 + 2] = c.b; // Blue component
        });

        const material = new THREE.ShaderMaterial({
            uniforms: {
                colors: { value: colorArray }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                uniform vec3 colors[4];
                void main() {
                    if (vPosition.x > 0.0 && vPosition.y > 0.0) {
                        gl_FragColor = vec4(colors[0], 1.0);
                    } else if (vPosition.x > 0.0 && vPosition.y <= 0.0) {
                        gl_FragColor = vec4(colors[1], 1.0);
                    } else if (vPosition.x <= 0.0 && vPosition.y > 0.0) {
                        gl_FragColor = vec4(colors[2], 1.0);
                    } else {
                        gl_FragColor = vec4(colors[3], 1.0);
                    }
                }
            `,
            side: THREE.DoubleSide
        });

        return material;
    }

    // Rounded corners (square - circle)
    matRoundedCourners(borderColor = 0xff0000, borderRadius = .5, borderSize = .1, size = {x: 1, y: 1}, bgColor){
        const material = new THREE.ShaderMaterial({
            uniforms: {
                borderColor: { value: new THREE.Color(borderColor) },
                borderRadius: { value: borderRadius }, // Corner rounding radius (0-0.5)
                bgColor: { value: new THREE.Color(bgColor) },
                bgNo: { value: bgColor == undefined },
                borderSize: { value: borderSize }, // Frame thickness
                size: { value: size },
                opacity: { value: 1}
            },
            vertexShader: `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
            `,
            fragmentShader: `
uniform vec3 borderColor;
uniform float borderRadius;
uniform vec3 bgColor;
uniform bool bgNo;
uniform vec2 size;
uniform float borderSize;
uniform float opacity;
float borderStep = .02;
varying vec2 vUv;

float makeSquare(vec2 centeredUv){
    // Рассчитываем расстояние от края для скругления углов
    vec2 cornerDist = abs(centeredUv) - (1.0 - borderRadius);
    float cornerMask = length(max(cornerDist, 0.0)) / borderRadius;

    // Основная форма (1 - внутри, 0 - снаружи)
    float square = 1.0 - smoothstep(1.0 - borderStep, 1.0, max(abs(centeredUv.x), abs(centeredUv.y)));

    // Форма с закругленными углами
    float roundedSquare = 1.0 - smoothstep(1.0 - borderStep, 1.0, cornerMask);

    // Комбинируем квадрат и закругленные углы
    float finalShape = min(square, roundedSquare);

    // Внутренняя часть (без рамки)
    //float innerShape = 1.0 - smoothstep(1.0 - borderStep * 2.0, 1.0, cornerMask);

    // Рамка (разница между внешней и внутренней частями)
    //float border = finalShape - innerShape;

    // Цвета
    //vec3 finalColor = mix(bgColor, borderColor, border);
    vec3 finalColor = borderColor;

    // Альфа-канал (прозрачность за пределами формы)
    //float alpha = finalShape;

    return finalShape;
}

vec2 signedShift(vec2 uv, float strength) {
    return sign(uv) * abs(uv) * (1.0 - strength);
}

void main(){
    // Центрируем UV координаты (-1..1)
    vec2 centeredUv = 2.0 * vUv - 1.0;

    vec3 finalColor = borderColor;

    float alpha = makeSquare(centeredUv);

    centeredUv *= size;
    centeredUv = sign(centeredUv) * max(abs(centeredUv) + borderSize, 0.0);
    centeredUv /= size;
    float betta = makeSquare(centeredUv);

    if(!bgNo){
        if(betta > 0.)
            finalColor = mix(borderColor, bgColor, betta);
    } else {
        alpha -= betta;
    }

    gl_FragColor = vec4(finalColor, alpha * opacity);
}
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        return material;
    }


    // Make Chess Square
    // iRes - resolution (x, y)
    // iSize - square size (x)
    matChessSquares(iRes, iSize){
        let m = new THREE.ShaderMaterial({
            uniforms: {
                iRes: {value: iRes},
                iSize: { value: iSize},
            },
            vertexShader: `varying vec2 vUv;
              void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }`,
            fragmentShader: `varying vec2 vUv;
                uniform vec2 iRes;
                uniform float iSize;
                void main(){
                // Get the fragment coordinates
                vec2 coord = vUv * iRes * iSize;

                // Calculate color depending on coordinates
                if (mod(floor(coord.x) + floor(coord.y), 2.0) == 0.0) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Белый цвет
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Черный цвет
                }
              }`,
            transparent: true
        });

        return m;
    }

    matWaterVoronoi(){
        // Based on https://www.shadertoy.com/view/fds3zf

        let m = new THREE.ShaderMaterial({
            uniforms: {
                iResolution: { value: new THREE.Vector2(innerWidth, innerHeight)},
                iTime: {value: 0}
            },
            vertexShader: `varying vec2 vUv;
              void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }`,
            fragmentShader: `
varying vec2 vUv;
uniform vec2 iResolution;
uniform float iTime;

#define Scale 100.

//return the random offset of the block center and it's index
vec2 random(vec2 block_index){
    vec2 p = vec2(block_index);
    vec2 ret = fract(sin(vec2(dot(p,vec2(123.1,311.7)),dot(p,vec2(269.5,183.3))))*4358.5453);

    return ret;
    //return vec2(0., 0.);
}

//Effect: voronoi
vec3 voronoi( in vec2 point )
{
    //index of the bottom-left block
    vec2 block_index = floor(point);

    float waveSpeed = iTime / 0.9;
    //local position of the point
    vec2 f = fract(point);

    //loop through surrunding 9 block, find the closest center to the point.
    vec2 min_offset, min_vec;
    float min_dist = 50.;
    for( int j=-1; j<=1; j++ ){
        for( int i=-1; i<=1; i++ )
        {
            vec2 offset = vec2(i, j);
            //local position of the current block center
            vec2 block_center = random(block_index + offset);
            block_center = .5 + .5 * sin(waveSpeed + 7. * block_center);
            block_center += offset;
            vec2 vec = block_center - f;
            float dist = dot(vec, vec);//distance

            if( dist < min_dist )
            {
                min_dist = dist;
                min_offset = offset;
                min_vec = vec;
            }
        }
    }

    //loop through the surrunding blocks of the closest block and
    //calculate the distance between the point and the border between these two centers,
    //return the minimal distance found.
    min_dist = 50.;
    for( int j=-2; j<=2; j++ ){
        for( int i=-2; i<=2; i++ )
        {
            vec2 offset = min_offset + vec2(i, j);
            //local position of the current block center
            vec2 block_center = random(block_index + offset);
            block_center = .5 + .5 * sin(waveSpeed + 7. * block_center);
            block_center += offset;
            vec2 vec = block_center - f;

            min_dist = min(min_dist, dot( 0.5*(min_vec + vec), normalize(vec - min_vec)));
        }
    }
    return vec3(min_dist, min_vec);
}

//return the highlight mask and the vec2 towars the center of it's block
vec3 getBorder(in vec2 point)
{
    //real distance between the point and the seperate line
    vec3 d = voronoi(point);
    float fac = length(d.yz);

    //reduce highlight at position closer to center
    float v = (1. - smoothstep(0.,0.4,d.x)) * fac * fac;

    //round the tip of the border
    vec2 blend = d.yz * smoothstep(0., 0.5, d.x);
    return vec3(v, blend);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1) based on y
    //vec2 defaultUV = fragCoord / iResolution.xy;
    vec2 defaultUV = vUv;// * iResolution.xy;

    vec2 uv = defaultUV * Scale;
    defaultUV *= 3.;

    //hightlight pass
    vec3 vor = getBorder(uv + 0. * iTime * vec2(-0.2, 0.));
    //shadow pass
    vec3 svor = getBorder(uv + .3 + 0. * iTime * vec2(-0.2, 0.));

    //the highlight
    float v = vor.x;
    vec3 col = vec3(v, v, v*0.6) * 1.;

    //blend texture coord towards block center based on v
    vec2 blend = vor.yz;
    blend *= v;
    //vec3 baseTexture = untileTexture(defaultUV + (blend * 0.8), .8);//textureLod( iChannel0, defaultUV + (blend * 0.7), 0.0 ).xyz;
    vec3 baseTexture = vec3(.3);//untileTexture(defaultUV + (blend * 0.8), .8);//textureLod( iChannel0, defaultUV + (blend * 0.7), 0.0 ).xyz;
    col += baseTexture;

    //add shadow
    col -= smoothstep(.1, .2, svor.x) * svor.x / 2.6;

    //add some blue
    col.b = 0.9915;

    //output
    fragColor = vec4(col,1.0);
}

//out highp vec4 fragColor;
void main(){
	vec4 fragColor = vec4(0., 0., 0., 1.);
    mainImage(fragColor, gl_FragCoord.xy);
    gl_FragColor = fragColor;
}

                `,
            transparent: false
        });

        return m;
    }


    // MultilineTextures - make y line multiple textures.
    // size: {x, y} - place size
    // textures: [texture1, texture2, ...] - textures
    // ranges: [yStart, yEnd, textureId, y1Start ...] - ranges

    static matMultilineTextures(size, textures, ranges){
        // Создаем шейдерный материал
        const MAX_TEXTURES = textures.length; // Максимальное количество текстур
        const MAX_RANGES = ranges.length / 3; // Максимальное количество диапазонов (3 значения на диапазон)
        let textureCode = '';

        // Генерируем строки для выбора текстуры
        for (let i = 0; i < MAX_TEXTURES; i++) {
            textureCode += (i ? 'else ' : '') + `if (texIndex == ${i}) gl_FragColor = texture2D(textures[${i}], tiledUv);\n`;
        }


        // Вершинный шейдер
        const vertexShader = `
varying vec2 vUv;

void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
        `;

        // Фрагментный шейдер
        const fragmentShader = `
uniform float width;
uniform float height;
uniform sampler2D textures[${MAX_TEXTURES}]; // Замените ${MAX_TEXTURES} на максимальное количество текстур
uniform float ranges[${MAX_RANGES * 3}]; // [y1_start, y1_end, texId1, y2_start, y2_end, texId2, ...]
uniform int rangesCount;

varying vec2 vUv;

void main() {
    float yPos = vUv.y * height;
    int texIndex = -1;
    float yStart = 0.0;
    float yRange = 0.0;

    // Поиск подходящего диапазона
    for(int i = 0; i < ${MAX_RANGES}; i++){
        if(i >= rangesCount)
            break;

        int idx = i * 3;
        yStart = ranges[idx];
        float yEnd = ranges[idx + 1];
        int texId = int(ranges[idx + 2]);

        if(yPos >= yStart && yPos <= yEnd){
            texIndex = texId;
            yRange = yEnd - yStart;
            break;
        }
    }

    if (texIndex < 0){
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); // Фиолетовый цвет, если текстура не найдена
        return;
    }

    // Тайлинг текстуры
    vec2 tiledUv;
    tiledUv.x = vUv.x;
    tiledUv.y = fract((yPos - yStart) / yRange); // Повторяем по Y в пределах своего диапазона

    // Нормализация координат текстуры с учетом размера
    vec2 scaledUv = vec2(vUv.x * width, (yPos - ranges[texIndex * 3]) / (ranges[texIndex * 3 + 1] - ranges[texIndex * 3]));

    // Получение цвета из соответствующей текстуры
    ${textureCode}
    else
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Красный цвет, если текстура не обработана
}
`;
        const material = new THREE.ShaderMaterial({
            uniforms: {
                width: { value: size.x }, // Ширина области
                height: { value: size.y }, // Высота области
                textures: {
                    value: textures
                },
                ranges: { value: new Float32Array(ranges)},
                rangesCount: { value: MAX_RANGES }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        return material;
    }


    // https://codepen.io/mjurczyk/pen/OJXrqjK
    matGeometryToonFire(_params = {}){
        const params = {
            renderBloom: true,
            renderFlat: true,
            renderTemperature: false,
            renderSmooth: true,

            fireHeatOffset: 1.4,
            fireHeatIntensity: 3.2,
            ..._params
        };

        const generateTexture = () => {
            const resolution = params.renderSmooth ? 32 : 512;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = canvas.height = resolution;

            for (let i = 0; i < 5000; i++) {
                ctx.fillStyle = `hsl(0, 0%, ${Math.random() * 50 + 50}%)`;
                ctx.save();
                ctx.beginPath();

                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;

                const size = canvas.width / 20;
                const width = size + Math.random() * size;
                const height = size + Math.random() * size;

                ctx.translate(x, y);
                ctx.arc(x, y, width, 0, Math.PI * 2, true);
                ctx.fill();

                ctx.restore();
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.MirroredRepeatWrapping;
            texture.wrapT = THREE.MirroredRepeatWrapping;

            return texture;
        };

          const material = new THREE.ShaderMaterial({
    uniforms: {
      fDt: {
        value: 0.0
      },
      fSpeed: {
        value: 1.0
      },
      tMapA: {
        type: "t",
        value: generateTexture()
      },
      tMapB: {
        type: "t",
        value: generateTexture()
      },
    },
    vertexShader: `
      varying vec4 vPos;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

        vPos = viewMatrix * vec4(position + cameraPosition, 1.);
      }
    `,
    fragmentShader: `
      uniform sampler2D tMapA;
      uniform sampler2D tMapB;
      uniform float fDt;
      uniform float fSpeed;

      varying vec4 vPos;

      void main() {
        float mask = 0.75 - vPos.y * 0.5;
        vec2 uv = vec2(vPos.x * 0.25 + 0.5, vPos.y * 0.25 + 0.5);

        float dx = fSpeed * fDt;
        vec2 uvA = uv - vec2(dx * 0.5, dx);
        vec2 uvB = vec2(1.0 - uv.x, uv.y) - vec2(dx * 0.5, dx);

        vec4 texA = texture2D(tMapA, uvA);
        vec4 texB = texture2D(tMapB, uvB);
        vec3 tex = (texA + texB).xyz;

        ${params.renderTemperature ? `
          gl_FragColor = vec4(mask, mask, mask, mask * tex);
        ` : `
          gl_FragColor = vec4(mask + .3, mask / 2.0 + .1, mask / 8.0 + .05, mask * tex);
        `}

        vec3 texAbove = texture2D(tMapA, vec2(uvA.x, uvA.y + 0.01)).xyz;

        if (length(texAbove - tex) < .7) {
          gl_FragColor *= 1.5;
        }

        ${params.renderFlat ? `
          if (gl_FragColor.w < .98) {
            gl_FragColor.w = 0.0;
          } else {
            gl_FragColor.w = 1.0;
          }

          if (length(tex) >= 3.2) {
            gl_FragColor *= 1.2;
            gl_FragColor.w = 1.0;
          }

          vec4 heatMask = (texA + texB + vec4(mask)) / 4.0;

          if (length(heatMask) >= ${params.fireHeatOffset} && gl_FragColor.w > .9) {
            gl_FragColor *= ${params.fireHeatIntensity};
            gl_FragColor.w = 1.0;
          }
        ` : ''}
      }
    `,
    transparent: true,
  });

        material.update = function(){
            material.uniforms.fDt.value += 0.005;
        }

        return material;
    }

};

export let mglGlslMainExsamples = {
    shaders: [
        { name: "shadertoy", title: "Shadertoy new", code: "col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));"},
        { name: "rainbow_gradient", title: "Rainbow gradient", code: "col = 0.5 + 0.5 * cos(iTime + uv.xyx * 5.0 + vec3(0, 2, 4));"},
        { name: "rainbow_waves", title: "Rainbow Waves", code: "col = 0.5 + 0.5 * cos(iTime + uv.xyx * 10.0 + vec3(0, 1, 2));"},
        { name: "pseudo_random_noise", title: "Pseudo-random noise", code: "col = 0.5 + 0.5 * cos(iTime + uv.xyx * 20.0 + vec3(0, 3, 6) * fract(sin(uv.x * 10.0) * 10000.0));"},
        { name: "blink_color", title: "Blink Color", code: "col = vec3(0.5 + 0.5 * sin(iTime));"},
        { name: "concentric_circles", title: "Concentric circles", code: "float d = length(uv - 0.5); col = 0.5 + 0.5 * cos(-iTime + d * 10.0 + vec3(0, 2, 4));"},
        { name: "chessboard", title: "Chessboard", code: "vec2 tile = floor(uv * 10.0); float pattern = mod(tile.x + tile.y, 2.0); col = vec3(1.0) * pattern;" },
        { name: "pulsating_circle", title: "Pulsating circle", code: "float d = length(uv - 0.5); col = vec3(smoothstep(0.3, 0.3 + 0.1 * sin(iTime), d));"},
        { name: "colored_stripes", title: "Chessnoise", code: "col = vec3(sin(uv.x * 20.0 + iTime), cos(uv.y * 15.0 + iTime * 0.7), sin((uv.x + uv.y) * 10.0 + iTime * 1.3)) * 0.5 + 0.5;"},
        { name: "chessnoise", title: "Chessnoise", code: "float noise = sin(uv.x * 50.0 + iTime) * sin(uv.y * 30.0 + iTime); col = vec3(noise * 0.5 + 0.5, noise * 0.3, 0.0);"},
        { name: "spiral", title: "Spiral", code: `
vec2 center = uv - 0.5;
float angle = atan(center.y, center.x);
float radius = length(center);
col = vec3(sin(angle * 5.0 + radius * 20.0 - iTime * 2.0));
`},

    { name: "pixel_rain", title: "Pixel rain", code: `
vec2 pixelUV = floor(uv * 50.0) / 50.0;
float speed = fract(pixelUV.x * 10.0);
float drop = fract(iTime * speed + pixelUV.y * 10.0);
col = vec3(step(0.95, drop));
`},

    { name: "rainbow", title: "Rainbow", code: "float hue = uv.x + sin(iTime * 0.5) * 0.1; col = 0.5 + 0.5 * cos(6.28318 * hue + vec3(0, 2, 4));"},

    { name: "flashing_chaos", title: "Flashing chaos", code: `
col = vec3(
    fract(sin(uv.x * 100.0 + iTime) * 43758.5453),
    fract(cos(uv.y * 80.0 + iTime * 2.0) * 23421.631),
    fract(sin((uv.x + uv.y) * 70.0 + iTime * 1.5) * 12345.678)
);
        `},
    ],

    getShader(name){
        let find = this.shaders.find(item => item.name == name);
        if(!find){
            console.error(`mglGlslMainExsamples.getShader(): shader name ${name} not found.`);
            return this.shaders[0].code;
        }

        return find.code;
    },

    getNamesList(){
        let list = [];

        for(const item of this.shaders){
            list.push(item.name);
        }

        return list;
    }
};

// Texture combinator
// Combine shaders: before, main, after.
// Variables:
// iTime (float) - time
// iResolution (float, float) - resolution
export class mglGlslCombineTextures{
    items = [];

    // Types
    MGLCT_UNKNOWN = 0;
    MGLCT_BEFORE = 1;
    MGLCT_MAIN = 2;
    MGLCT_AFTER = 3;

    constructor(){}

    addItem(item){
        this.items.push(item);
    }

    addMainTemplate(name = "shadertoy"){
        let code = mglGlslMainExsamples.getShader(name);

        let item = {
            type: this.MGLCT_MAIN,
            main: 'mainImage',
            fragmentShader: `
void mainImage(inout vec4 fragColor, inout vec2 uv){
    // Normalized pixel coordinates (from 0 to 1)
    //vec2 uv = fragCoord / iResolution.xy;

    // Зеркально отражаем x-координату, чтобы 0 и 1 совпадали
    //uv.x = abs(2.0 * (uv.x - floor(uv.x + 0.5))); // [0 → 1 → 0]

    // Time varying pixel color
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0,2,4));
    ${code}

    // Output to screen
    fragColor = vec4(col, 1.0);
}`
        }

        this.addItem(item);
    }

    addheightDiscard(){
        let item = {
            type: this.MGLCT_AFTER,
            uniforms: {
                heightDiscard: { value: 1 }
            },
            main: 'fHeightDiscard',
            fragmentShader: `
uniform float heightDiscard;

void fHeightDiscard(inout vec4 fragColor, inout vec2 uv){
    float stepHeight = 0.1;
    float maxHeight = vPosition.y + 1.0; // Нормируем по высоте
    float alpha = smoothstep(0.0, stepHeight, heightDiscard * 2. - maxHeight);

    //vec3 col = mix(vec3(1.), fragColor.xyz, alpha);
    //fragColor = vec4(col, alpha);

    if(alpha <= 0.0)
        discard;
}`
        }

        this.addItem(item);
    }

    matOneColor(color = 0xff0000){
        // Material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(color) },
                height: { value: 0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision mediump float;
                varying vec3 vPosition;
                uniform vec3 color;
                uniform float height;

                void main() {
                    float stepHeight = 0.1; // Высота шага
                    float maxHeight = vPosition.y + 1.0; // Нормируем по высоте
                    float alpha = smoothstep(0.0, stepHeight, height * 2. - maxHeight);

                    vec3 col = mix(vec3(1.), color, alpha);
                    gl_FragColor = vec4(col, alpha); // Цвет куба

                    if(gl_FragColor.a <= 0.0)
                        discard;

                }
            `,
            transparent: false,
            side: THREE.DoubleSide
        });

        return material;
    }

    buildTexture(){
        let build = {
            uniforms: {
                iTime: { value: 0 },
            },
            vertexShader: `
                precision mediump float;
                varying vec3 vPosition;
                varying vec2 vUv;

                // input
                uniform float iTime;

float explosionSpeed = 0.3; // Скорость разлёта
float explosionStrength = 1.; // Сила разлёта

// Функция для генерации псевдослучайного числа
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float rand(float seed) {
    return fract(sin(seed * 12.9898) * 43758.5453);
}


                void main(){
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);


// Random
if(false){
    // Получаем базовую позицию вершины
    vec3 newPosition = position;

    // Генерируем уникальный ID для каждого треугольника
    float triangleId = float(gl_VertexID / 3); // 3 вершины = 1 треугольник

    // Псевдослучайное направление разлёта
    vec3 randomDir = vec3(
        rand(vec2(triangleId, 0.0)) - 0.5,
        rand(vec2(triangleId, 1.0)) - 0.5,
        rand(vec2(triangleId, 2.0)) - 0.5
    );
    //randomDir = normalize(randomDir);

    // Двигаем треугольник наружу
    float explosionFactor = explosionStrength * iTime * explosionSpeed;
    newPosition += randomDir * explosionFactor;

    // Добавляем вращение (опционально)
    float angle = iTime * 2.0;
    //newPosition.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * newPosition.xz;

    // Стандартная трансформация Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

// No deformation
if(false){

// Получаем базовую позицию вершины
    vec3 basePosition = position;

    // Вычисляем ID треугольника (3 вершины = 1 треугольник)
    int triangleId = gl_VertexID / 3;

    // Генерируем случайное направление для треугольника (одинаковое для всех его вершин)
    vec3 randomDir = vec3(
        rand(float(triangleId)) - 0.5,
        rand(float(triangleId + 1)) - 0.5,
        rand(float(triangleId + 2)) - 0.5
    );
    randomDir = normalize(randomDir);

    // Вычисляем силу разлёта
    float explosionFactor = explosionStrength * iTime * explosionSpeed;

    // Сдвигаем ВСЕ вершины треугольника в одном направлении
    vec3 newPosition = basePosition + randomDir * explosionFactor;

    // Опционально: добавляем вращение вокруг центра
    float angle = iTime * 2.0;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    newPosition.xz = rot * (newPosition.xz);

    // Стандартная трансформация Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

// Un center
if(false){
    const vec3 center = vec3(0.0);

    // Получаем базовую позицию вершины
    vec3 basePosition = position;

    // Вычисляем ID треугольника (3 вершины = 1 треугольник)
    int triangleId = gl_VertexID / 3;

    // Находим направление от центра к треугольнику
    vec3 triangleCenter = vec3(0.0); // Можно вычислить точнее (см. пояснения ниже)
    vec3 dirFromCenter = normalize(basePosition - center);

    // Сила разлёта (можно добавить задержку для волнового эффекта)
    float delay = float(triangleId) * 0.0; // Задержка для каждого треугольника
    float explosionFactor = explosionStrength * max(0.0, iTime - delay) * explosionSpeed;

    // Двигаем ВСЕ вершины треугольника в одном направлении
    vec3 newPosition = basePosition + dirFromCenter * explosionFactor;

    // Стандартная трансформация Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

                    // float offset = sin(iTime + position.x * 10.0) * 0.5;
                    // vec3 newPosition = position + normalize(position) * offset;
                    // gl_Position = vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                precision mediump float;
                varying vec3 vPosition;
                varying vec2 vUv;
                //uniform vec4 color;

                // input
                uniform float iTime;
            `,
            transparent: true,
            side: THREE.DoubleSide
        };

        // Cals
        let calsList = [];

        // Before
        for (let i = this.items.length - 1; i >= 0; i--){
            if(this.items[i].type === this.MGLCT_BEFORE){
                let item = this.items[i];
                build.fragmentShader += item.fragmentShader;

                for(const key in item.uniforms)
                    build.uniforms[key] = item.uniforms[key];

                calsList.push(item.main);
                break;
            }
        }

        // Main
        let main = -1;

        for (let i = this.items.length - 1; i >= 0; i--){
            if(this.items[i].type === this.MGLCT_MAIN){
                main = this.items[i];
                calsList.push(main.main);
                break;
            }
        }

        // After
        for (let i = this.items.length - 1; i >= 0; i--){
            if(this.items[i].type === this.MGLCT_AFTER){
                let item = this.items[i];
                build.fragmentShader += item.fragmentShader;

                for(const key in item.uniforms)
                    build.uniforms[key] = item.uniforms[key];

                calsList.push(item.main);
                break;
            }
        }

        if(!main){
            console.error("mglGlslCombineTextures.buildTexture(): main module not found!");
            return ;
        }

        build.fragmentShader += main.fragmentShader;

        // Calls
        let calls = "";
        for(const call of calsList){
            calls += `${call}(fragColor, uv);\r\n`;
        }

        build.fragmentShader += `
void main(){
    vec4 fragColor = vec4(0.);
    vec2 uv = vUv;

    ${calls}

    gl_FragColor = fragColor;
}
        `;

        // Build
        const material = new THREE.ShaderMaterial(build);

        material.update = function(value, beginTime){
            material.uniforms.iTime.value = performance.now() * 0.001 - beginTime;
            material.uniforms.heightDiscard.value = value;
        }

        return material;
    }

};