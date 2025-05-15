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
};