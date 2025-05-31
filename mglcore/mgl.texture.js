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

    // https://www.shadertoy.com/view/XsXSWS
    // size {x, y} - plane size
    // type: 0 - red, 1 - green, 3 - blue
    static matFire(_options = {}){
        let options ={
            //size: {x:1, y: 1}
            type: 0,
            strength: 1,
            ... _options
        };

        let material = new THREE.ShaderMaterial({
            uniforms: {
                iTime: { value: 0 },
                iType: { value: !options.type ? 0 : options.type },
                iStrength: { value: options.strength },
                //iRes: {value: iRes},
                //iSize: { value: iSize},
            },
            vertexShader: `varying vec2 vUv;
              void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }`,
            fragmentShader: `
varying vec2 vUv;
uniform float iTime;
uniform int iType;
uniform float iStrength;

//////////////////////
// Fire Flame shader

// procedural noise from IQ
vec2 hash( vec2 p )
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			 dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
	const float K1 = 0.366025404; // (sqrt(3)-1)/2;
	const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2 i = floor( p + (p.x+p.y)*K1 );

	vec2 a = p - i + (i.x+i.y)*K2;
	vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
	vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;

	vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );

	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));

	return dot( n, vec3(70.0) );
}

float fbm(vec2 uv)
{
	float f;
	mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
	f  = 0.5000*noise( uv ); uv = m*uv;
	f += 0.2500*noise( uv ); uv = m*uv;
	f += 0.1250*noise( uv ); uv = m*uv;
	f += 0.0625*noise( uv ); uv = m*uv;
	f = 0.5 + 0.5*f;
	return f;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
	vec2 uv = vUv;
    uv /= 2.;
    uv.x -= .15;

	vec2 q = uv;
	q.x *= 5.;
	q.y *= 2.;

	//float strength = floor(q.x+1.);
	float T3 = max(3.,1.25*iStrength)*iTime;
	q.x = mod(q.x,5.)-0.5;
	q.y -= 0.25;
	float n = fbm(iStrength*q - vec2(0,T3));
	float c = 1. - 16. * pow( max( 0., length(q*vec2(1.8+q.y*1.5,.75) ) - n * max( 0., q.y+.25 ) ),1.2 );
//	float c1 = n * c * (1.5-pow(1.25*uv.y,4.));
	float c1 = n * c * (1.5-pow(2.50*uv.y,4.));
	c1 = clamp(c1,0.,1.);

	vec3 col = vec3(1.5*c1, 1.5*c1*c1*c1, c1*c1*c1*c1*c1*c1);

    if(iType == 1)
    	col = 0.85*col.yxz;
    if(iType == 2)
	    col = col.zyx;

	float a = c * (1.-pow(uv.y,3.));
	fragColor = vec4( mix(vec3(0.),col,a), 1.0);
}

void main(){
	vec4 fragColor;// = vec4(0., 0., 0., 1.);
    mainImage(fragColor, gl_FragCoord.xy);
    gl_FragColor = fragColor;
}
                `,
            transparent: true
        });

        return material;
    }

};

export let mglGlslMainExsamples = {
    shaders: [
        { name: "shadertoy", title: "Shadertoy new", code: "col.xyz = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));"},
        { name: "rainbow_gradient", title: "Rainbow gradient", code: "col.xyz = 0.5 + 0.5 * cos(iTime + uv.xyx * 5.0 + vec3(0, 2, 4));"},
        { name: "rainbow_waves", title: "Rainbow Waves", code: "col.xyz = 0.5 + 0.5 * cos(iTime + uv.xyx * 10.0 + vec3(0, 1, 2));"},
        { name: "pseudo_random_noise", title: "Pseudo-random noise", code: "col.xyz = 0.5 + 0.5 * cos(iTime + uv.xyx * 20.0 + vec3(0, 3, 6) * fract(sin(uv.x * 10.0) * 10000.0));"},
        { name: "blink_color", title: "Blink Color", code: "col = vec4(1., 1., 1., 0.5 + 0.5 * sin(iTime));"},
        { name: "concentric_circles", title: "Concentric circles", code: "float d = length(uv - 0.5); col.xyz = 0.5 + 0.5 * cos(-iTime + d * 10.0 + vec3(0, 2, 4));"},
        { name: "chessboard", title: "Chessboard", code: "vec2 tile = floor(uv * 10.0); float pattern = mod(tile.x + tile.y, 2.0); col.xyz = vec3(1.0) * pattern;" },
        { name: "pulsating_circle", title: "Pulsating circle", code: "float d = length(uv - 0.5); col.xyz = vec3(smoothstep(0.3, 0.3 + 0.1 * sin(iTime), d));"},
        { name: "colored_stripes", title: "Chessnoise", code: "col.xyz = vec3(sin(uv.x * 20.0 + iTime), cos(uv.y * 15.0 + iTime * 0.7), sin((uv.x + uv.y) * 10.0 + iTime * 1.3)) * 0.5 + 0.5;"},
        { name: "chessnoise", title: "Chessnoise", code: "float noise = sin(uv.x * 50.0 + iTime) * sin(uv.y * 30.0 + iTime); col.xyz = vec3(noise * 0.5 + 0.5, noise * 0.3, 0.0);"},
        { name: "spiral", title: "Spiral", code: `
vec2 center = uv - 0.5;
float angle = atan(center.y, center.x);
float radius = length(center);
col.xyz = vec3(sin(angle * 5.0 + radius * 20.0 - iTime * 2.0));
`},

    { name: "pixel_rain", title: "Pixel rain", code: `
vec2 pixelUV = floor(uv * 50.0) / 50.0;
float speed = fract(pixelUV.x * 10.0);
float drop = fract(iTime * speed + pixelUV.y * 10.0);
col.xyz = vec3(step(0.95, drop));
`},

    { name: "rainbow", title: "Rainbow", code: "float hue = uv.x + sin(iTime * 1.5) * 0.1; col.xyz = 0.5 + 0.5 * cos(6.28318 * hue + vec3(0, 2, 4));"},

    { name: "flashing_chaos", title: "Flashing chaos", code: `
col.xyz = vec3(
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
    itemId = 0;

    // Types
    MGLCT_UNKNOWN = 0;
    MGLCT_BEFORE = 1;
    MGLCT_MAIN = 2;
    MGLCT_AFTER = 3;

    constructor(){}

    getRandomId(){
        this.itemId ++;
        return `rId_${this.itemId}_`;
    }

    addItem(item){
        this.items.push(item);
    }

    addMainColor(_options = {}){
        let options = {
            color: 0xffffff,
            ... _options
        };

        const rId = this.getRandomId();

        let item = {
            type: this.MGLCT_MAIN,
            main: 'mainImage',
            fragmentShader: `
uniform vec3 ${rId}color;

void mainImage(inout vec4 fragColor, inout vec2 uv){
    fragColor = vec4(${rId}color, 1.);
}`,
            uniforms: {
                [`${rId}color`]: { value: new THREE.Color(options.color) }
            },
        }

        this.addItem(item);

    }

    addMainTemplate(name = "shadertoy"){
        let code = mglGlslMainExsamples.getShader(name);

        let item = {
            type: this.MGLCT_MAIN,
            main: 'mainImage',
            fragmentShader: `
void mainImage(inout vec4 fragColor, inout vec2 uv){
    // Time varying pixel color
    vec4 col = vec4(0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4)), 1.);
    ${code}

    // Output to screen
    fragColor = col;
}`
        }

        this.addItem(item);

        return this;
    }

    addheightDiscard(_options = {}){
        let options = {
            height: 1,
            ... _options
        };

        let item = {
            type: this.MGLCT_AFTER,
            uniforms: {
                multipleDiscard: { value: options.height },
                heightDiscard: { value: 1 }
            },
            main: 'fHeightDiscard',
            fragmentShader: `
uniform float heightDiscard;
uniform float multipleDiscard;

void fHeightDiscard(inout vec4 fragColor, inout vec2 uv){
    float stepHeight = 0.001;
    float maxHeight = (vPosition.y + multipleDiscard) / multipleDiscard; // Нормируем по высоте
    //float alpha = smoothstep(0.0, stepHeight, heightDiscard * 2. - maxHeight);
    float alpha = heightDiscard * 2. > maxHeight ? 1. : 0.;

    //vec3 col = mix(vec3(1.), fragColor.xyz, alpha);
    //fragColor = vec4(col, alpha);

    if(alpha <= 0.0)
        discard;
}`
        }

        this.addItem(item);
    }

    // Hatching
    // Lines angle
    // Lines frequency
    addHatchingLines(_options = {}){
        let options = {
            width: .5,
            angle: - Math.PI / 6,
            freq: 30,
            rotate: .2,
            ... _options
        };

        let item = {
            type: this.MGLCT_AFTER,
            uniforms: {
                mglcHlWidth: { value: options.width },
                mglcHlAngle: { value: options.angle },
                mglcHlFreq: { value: options.freq },
                mglcHlRotate: { value: options.rotate }
            },
            main: 'mglcHlMain',
            fragmentShader: `
uniform float mglcHlWidth;
uniform float mglcHlAngle;
uniform float mglcHlFreq;
uniform float mglcHlRotate;

void mglcHlMain(inout vec4 fragColor, inout vec2 uv){
    // Increase coordinates to create the effect of slanted lines
    float angle = mglcHlAngle + iTime * mglcHlRotate; // Slanted angle
    float freq = mglcHlFreq; // Frequency of lines

    // Calculate the value for slanted lines
    float stripes = smoothstep(mglcHlWidth + .2, mglcHlWidth - .15,
        abs(sin(uv.x * cos(angle) * freq + uv.y * sin(angle) * freq)));
        //sin((uv.x + uv.y * angle) * frequency);


    if(stripes <= 0.0)
        fragColor.a = stripes;
    //    discard;
}`
        }

        this.addItem(item);
    }

    addBorder(_options = {}){
        let options = {
            size: [1, 1], // Box size
            borderSize: .1, // Border size
            borderFree: 0, // Free size
            borderSmooth: .05, // Border smooth
            borderColor: 0xffffff, // Border color
            ... _options
        };

        const rId = this.getRandomId();

        let item = {
            type: this.MGLCT_AFTER,
            uniforms: {
                [`${rId}size`]: { value: options.size },
                [`${rId}borderSize`]: { value: options.borderSize },
                [`${rId}borderSmooth`]: { value: options.borderSmooth },
                [`${rId}borderFree`]: { value: options.borderFree },
                [`${rId}borderColor`]: { value: new THREE.Color(options.borderColor) }
            },
            main: `${rId}main`,
            fragmentShader: `
uniform vec2 ${rId}size;
uniform float ${rId}borderSize;
uniform float ${rId}borderSmooth;
uniform float ${rId}borderFree;
uniform vec3 ${rId}borderColor;

void ${rId}main(inout vec4 fragColor, inout vec2 uv){
    vec2 point = uv * ${rId}size;
    vec2 size = ${rId}size;
    float borderSize = ${rId}borderSize;
    float borderSmooth = ${rId}borderSmooth;
    float borderFree = ${rId}borderFree;
    vec4 borderColor = vec4(${rId}borderColor, 1.);

    float distanceToBorder = min(min(point.x, point.y), min(size.x - point.x, size.y - point.y)) - borderFree;

    float alpha = max(
        smoothstep(.0, -min(0.1, borderSmooth), distanceToBorder),
        smoothstep(borderSize, borderSize + borderSmooth, distanceToBorder)
    );

    fragColor = mix(borderColor, fragColor, alpha);

    // Calculate smoothing
    //float alpha = smoothstep(borderSize, borderSize + borderSmooth, distanceToBorder);
    //fragColor = mix(borderColor, fragColor, alpha);
}`
        }

        this.addItem(item);
    }

    buildTexture(_options = {}){
        let options = {
            ... _options
        };


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

void main(){
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
                const item = main = this.items[i];

                 for(const key in item.uniforms)
                    build.uniforms[key] = item.uniforms[key];

                calsList.push(item.main);
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

            if(material.uniforms.heightDiscard)
                material.uniforms.heightDiscard.value = value;
        }

        return material;
    }

};



export class mglGlslOceanWaves{
    // Ocean waves. Original: https://shaderfrog.com/2/editor/cman0hya60004paurgo9i4oza
    // Options:
    // iQuality
    // 0 - only color and texture
    // 1 - frag simple wave
    // 2 - frag Gerstner wave
    // 3 - vert simple wave
    // 4 - vert Gerstner wave

    genCommon(options){
        return `
precision highp float;
precision highp int;

#define PI 3.14159

// Input
uniform float iTime;
//uniform int iQuality;
#define iQuality ${options.iQuality}
uniform sampler2D iTexture;


// Temp
uniform float time;

uniform float normalOffset;
uniform float fbmHeight;
uniform float fbmScale;
uniform vec3 pMove;
uniform vec3 pSize;
uniform vec3 pScale;
uniform float waveHeight;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveSharpness;

// Vertex
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;

vec3 GerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal, float time) {
  float steepness = wave.z;
  float wavelength = wave.w;
  float k = 2.0 * 3.14159 / wavelength;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(wave.xy);
  float f = k * (dot(d, p.xz) - c * time);
  float a = steepness / k;

  tangent += vec3(
    -d.x * d.x * (steepness * sin(f)),
    d.x * (steepness * cos(f)),
    -d.x * d.y * (steepness * sin(f))
  );
  binormal += vec3(
    -d.x * d.y * (steepness * sin(f)),
    d.y * (steepness * cos(f)),
    -d.y * d.y * (steepness * sin(f))
  );
  return vec3(
    d.x * (a * cos(f)),
    a * sin(f),
    d.y * (a * cos(f))
  );
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}

float snoise(vec4 v, float time) {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
            0.276393202250021,  // 2 * G4
            0.414589803375032,  // 3 * G4
            -0.447213595499958); // -1 + 4 * G4

    // First corner
    vec4 i  = floor(v + dot(v, vec4(0.309016994374947451)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

    // Other corners

    // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    // Permutations
    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                        i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                    + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
            + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}

float surface(vec4 coord, float time) {
	float n = 0.0;

	n += 0.25 * abs( snoise( coord * 4.0, time ) );
	n += 0.5 * abs( snoise( coord * 8.0, time ) );
	n += 0.25 * abs( snoise( coord * 16.0, time ) );
	n += 0.125 * abs( snoise( coord * 32.0, time ) );
	n += 0.125 * abs( snoise( coord * 64.0, time ) );

	return n;
}

vec3 displace(vec3 point, float time) {
	//vec3 tangent = orthogonal(normal);
	//vec3 binormal = normalize(cross(normal, tangent));

  vec3 tangent = vec3(0.0, 0.0, 1.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);

  float yScale = clamp(point.y * 2.0, 0.0, 1.0);

  // Undo the flattening of the position scale
  float reset = (1.0 / pScale.y);
  point.y += surface(
    vec4((point + time * 0.1) * fbmScale, 1.0), time
  ) * fbmHeight * reset;

  vec3 wave1 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(-1.0, 0.0), waveSharpness, pScale.x * 0.5 * waveFrequency * pSize.x),
    point,
    tangent,
    binormal,
    time
  );
  vec3 wave2 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(1.0, 0.0), 0.25, 4.0 * waveFrequency * pSize.x),
    point,
    tangent,
    binormal,
    time
  );
  vec3 wave3 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(1.0, 1.0), 0.15, 6.0 * waveFrequency * pSize.x),
    point,
    tangent,
    binormal,
    time
  );
  vec3 wave4 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(1.0, 1.0), 0.4, 2.0 * waveFrequency * pSize.x),
    point,
    tangent,
    binormal,
    time
  );

  vec3 newPos = point;
  float scale = waveHeight * yScale * reset;
  newPos += wave1 * scale;
  newPos += wave2 * scale * 0.5;
  newPos += wave3 * scale * 0.5;
  newPos += wave4 * scale * 0.2;

  //vHeight = newPos.y;

  return newPos;
}

// http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z)
    ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
}
        `;
    }

    genFrag(options){
        //let texCode = options.texture ? `col.xyz = texture(iTexture, vUv).xyz;` : ''; // col = calcColor();
        let texCode = options.texture ? `texture(iTexture, sUv)` : 'vec4(1.)'; // col = calcColor();
        let common = this.genCommon(options);

       return `
${common}

uniform vec3 waterColor;
uniform vec3 waterHighlight;

uniform float offset;
uniform float contrast;
uniform float brightness;

vec3 calcColor(vec3 color, float vHeight){
  float mask = (pow(vHeight, 2.) - offset) * contrast;
  vec3 diffuseColor = mix(color, waterHighlight, mask);
  diffuseColor *= brightness;
  return diffuseColor;
}

${options.fragCode}

void main(){
    vec3 col = waterColor;
    vec2 uv = vUv;
    vec2 sUv = fract(uv * pSize.xz);
    float height = vHeight;

    vec4 tex = ${texCode};
    ${options.fragMain}

    if(iQuality == 0){
        height = .5;
    }

    if(iQuality == 1){
        float wave = sin(vPosition.x * waveFrequency + iTime * waveSpeed) * waveHeight;
        height = wave;
    }

    if(iQuality == 2){
        float scaledTime = iTime * waveSpeed;
        vec3 newPosition = displace(vPosition, scaledTime);
        height = newPosition.y;
    }

    vec3 waveCol = calcColor(col, height);
/*
    if(uv.y < .1)
        gl_FragColor = vec4(col, 1.);
    else if(uv.y < .2)
        gl_FragColor = vec4(waveCol, 1.);
    else if(uv.y < .3)
        gl_FragColor = vec4(waveCol * tex.rgb, 1.);

    else if(uv.y < .4)

    gl_FragColor = vec4(
        mix(
        waveCol * tex.rgb,
        waveCol,
        1.0 - clamp(height * 50.0, 0.0, 1.0)
        ),
        1.0
    );

    else*/
        gl_FragColor = vec4(waveCol * tex.rgb, 1.);

}
        `;

    }

    genVert(options){
        let common = this.genCommon(options);

        return  `
${common}

${options.vertCode}

void main(){
    vUv = uv;
    float yScale = clamp(position.y * 2.0, 0.0, 1.0);
    vec3 position = position * pScale;
    float scaledTime = time * waveSpeed;
    vec3 finalPos;

    if(iQuality <= 2){
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vHeight = 0.;
        return ;
    }

    // Simple wave
    if(iQuality == 3){
        // Undo the flattening of the position scale
        float reset = (1.0 / pScale.y);
        vec3 point = position;
        point.y += surface(
            vec4((point + time * 0.1) * fbmScale, 1.0), time
        ) * fbmHeight * reset;

        vec3 tangent = vec3(0.0, 0.0, 1.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);

        vec3 wave1;
        wave1.y = sin(point.x - time * waveSpeed) * waveHeight;

        vec3 newPos = point;
        float scale = waveHeight * yScale * reset;
        newPos += wave1 * scale;
        //newPos += wave2 * scale * 0.5;
        //newPos += wave3 * scale * 0.5;
        //newPos += wave4 * scale * 0.2;

        //finalPos = point;
        finalPos = newPos;

        vHeight = finalPos.y;
    } else if(iQuality == 4){
        float scaledTime = time * waveSpeed;
        vec3 displacedPosition = displace(position, scaledTime);
        finalPos = mix(position, displacedPosition, yScale);
    } else if(iQuality == 5){
        float scaledTime = time * waveSpeed;
        vec3 displacedPosition = displace(position, scaledTime);

        vec3 tangent = orthogonal(normal);
        vec3 bitangent = normalize(cross(normal, tangent));
        vec3 neighbour1 = position + tangent * normalOffset;
        vec3 neighbour2 = position + bitangent * normalOffset;
        vec3 displacedNeighbour1 = displace(neighbour1, scaledTime);
        vec3 displacedNeighbour2 = displace(neighbour2, scaledTime);

        // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
        vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
        vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

        // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
        vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));

        vNormal = normalMatrix * displacedNormal;

        finalPos = mix(position, displacedPosition, yScale);
    }

    ${options.vertMain}

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}
        `;
    }

    buildShader(_options = {}){
        let options = {
            // Main
            iQuality: 4, // Constant value

            // Vertex
            vertCode: "",
            vertMain: "",
            //normalOffset: .1,
            fbmHeight: 0.042,
            fbmScale: 2.371,
            pMove: [0, 0, 0],
            pSize: [1, 1, 1],
            pScale: [1, 1, 1],
            waveHeight: 0.848,
            waveSpeed: 1,
            waveFrequency: 0.625,
            waveSharpness: 0.744,

            // Fragment
            fragCode: "",
            fragMain: "",
            waterColor: new THREE.Color(0, 0.6666666666666666, 1),
            waterHighlight: new THREE.Color(1, 1, 1),
            texture: undefined,
            offset: 0.0,
            contrast: 1.,
            brightness: 1.,

            uniforms: {
                //iTime: { value: 0 }
            },
            ... _options
        };

        options.uniforms = {
            // Global
            time: { value: 0 },
            iTime: { value: 0 },
            //iQuality: { value: options.iQuality },

            // Vertex
            //normalOffset: { value: .1 },
            fbmHeight: { value: options.fbmHeight },
            fbmScale: { value: options.fbmScale },
            pMove: { value: options.pMove },
            pSize: { value: options.pSize },
            pScale: { value: options.pScale },
            waveHeight: { value: options.waveHeight },
            waveSpeed: { value: options.waveSpeed },
            waveFrequency: { value: options.waveFrequency },
            waveSharpness: { value: options.waveSharpness },

            // Fragment
            iTexture: { value: options.texture },
            waterColor: { value: options.waterColor },
            waterHighlight: { value: options.waterHighlight },
            offset: { value: options.offset },
            contrast: { value: options.contrast },
            brightness: { value: options.brightness },
            ... options.uniforms
        };

        // Shaders
        const vertexShader = this.genVert(options);
        const fragmentShader = this.genFrag(options);

        // Materiaal
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: options.uniforms,
        });

        material.update = function(deltaTime){
            material.uniforms.iTime.value += deltaTime;
            material.uniforms.time.value += deltaTime;
        }

        return material;
    }
};