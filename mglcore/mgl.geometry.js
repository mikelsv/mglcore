import * as THREE from 'three';

// MyGL geometry primitives
// 0.1 - 13.05.2025 - 18:07 - Diamonds

export class mglGeometry{
    alignMax(value, min, max){
        return value >= max ? value - max + min : value;
    }

    pushAlignMax3(arr, value, min, max){
        for(let i = 0; i < 3; i ++)
            if(value[i] >= max)
                value[i] = value[i] - max + min;

        arr.push(value[0], value[1], value[2]);
    }

    finishGerometry(vertices, indices){
        // Geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }

    // Diamond -
    // /\ = length / 2
    // \/

    makeDiamond(radius = .25, length = .5, segments = 4){
        const vertices = [];
        const indices = [];

        // Vertices
        vertices.push(0, length, 0);
        vertices.push(0, -length, 0);

        for(let i = 0; i < segments; i ++){
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            vertices.push(x, 0, z);
        }

        // Indeces
        for(let i = 0; i < segments; i ++){
            this.pushAlignMax3(indices, [0, 2 + i + 1, 2 + i], 2, segments + 2);
            this.pushAlignMax3(indices, [1, 2 + i, 2 + i + 1], 2, segments + 2);
        }

        return this.finishGerometry(vertices, indices);
    }

    // Diamond 2
    //  /\  = tipLength
    //  \/  = bodyLength

    makeDiamond2(bodyRadius = .25, tipLength = .25, bodyLength = .5, segments = 6){
        const vertices = [];
        const indices = [];

        // Vertices
        vertices.push(0, tipLength, 0);
        vertices.push(0, -bodyLength, 0);

        for(let i = 0; i < segments; i ++){
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * bodyRadius;
            const z = Math.sin(angle) * bodyRadius;
            vertices.push(x, 0, z);
        }

        // Indeces
        for(let i = 0; i < segments; i ++){
            this.pushAlignMax3(indices, [0, 2 + i + 1, 2 + i], 2, segments + 2);
            this.pushAlignMax3(indices, [1, 2 + i, 2 + i + 1], 2, segments + 2);
        }

        return this.finishGerometry(vertices, indices);
    }


    // Diamond Body
    //  /\  = tipLength
    // | |  = bodyLength
    //  \/  = tipLength

    makeDiamondBody(bodyRadius = .25, tipLength = .25, bodyLength = .95, segments = 6){
        const vertices = [];
        const indices = [];

        // Vertices
        const topY = tipLength + bodyLength / 2;
        vertices.push(0, topY, 0);
        vertices.push(0, -topY, 0);

        for(let i = 0; i < segments; i ++){
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * bodyRadius;
            const z = Math.sin(angle) * bodyRadius;
            vertices.push(x, bodyLength / 2, z);
        }

        for(let i = 0; i < segments; i ++){
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * bodyRadius;
            const z = Math.sin(angle) * bodyRadius;
            vertices.push(x, -bodyLength / 2, z);
        }

        // Indeces
        let topV = 2;
        let botV = 2 + segments;

        for(let i = 0; i < segments; i ++){
            let topThis = topV + i;
            let botThis = botV + i;
            let topNext = this.alignMax(topThis + 1, topV, segments + topV);
            let botNext = this.alignMax(botThis + 1, botV, segments + botV);

            indices.push(0, topNext, topThis); // Top
            indices.push(1, botThis, botNext); // Bottom
            indices.push(topThis, topNext, botThis); // Body
            indices.push(topNext, botNext, botThis); // Body

            // Old
            //this.pushAlignMax3(indices, [0, topV + i + 1, topV + i], topV, segments + topV); // Top
            //this.pushAlignMax3(indices, [1, botV + i, botV + i + 1], botV, segments + botV); // Bottom
            //indices.push(topV + i, this.alignMax(topV + i + 1, topV, segments + topV), botV + i); // Body
            //indices.push(this.alignMax(topV + i + 1, topV, segments + topV), this.alignMax(botV + i + 1, botV, segments + botV), botV + i); // Body
        }

        return this.finishGerometry(vertices, indices);
    }

};

// Generate geometry
export class mglGeometryGenerator{
    vertices = [];
    normals = [];
    indices = [];
    uvs = [];

    verticeNow = 0;

    getVertCount(){
        return this.vertices.length;
    }

    getUvCount(){
        return this.uvs.length
    }

    getIndexCount(){
        return this.indices.length;
    }

    getVertLenNow(){
        return this.vertices.length - this.verticeNow * 3;
    }

    beginModel(){
        this.verticeNow = this.vertices.length / 3;
        //this.indicesId = this.indices.length;
    }

    addVertice(x, y, z){
        this.vertices.push(x, y, z);
    }

    addVerticeNorm(x, y, z, nx, ny, nz){
        this.vertices.push(x, y, z);
        this.normals.push(nx, ny, nz);
    }

    addUv(x, y){
        this.uvs.push(x, y);
    }

    addIndex(x, y, z){
        this.indices.push(x + this.verticeNow, y + this.verticeNow, z + this.verticeNow);
    }

    makeCube(_options = {}){
        let options = {
        size: 1,            // Размер куба (длина ребра)
        position: [0, 0, 0], // Позиция центра
        rotation: [0, 0, 0],  // Вращение [x, y, z] в радианах
        ..._options
        };

        this.beginModel();

        const half = options.size / 2;

        // Вспомогательные переменные
        const center = new THREE.Vector3(...options.position);
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(...options.rotation)
        );

        // 6 граней куба (нормали и UV-координаты)
        const faces = [
            { normal: [0, 0, 1], uv: [[0, 0], [1, 0], [1, 1], [0, 1]] },  // Передняя
            { normal: [0, 0, -1], uv: [[1, 0], [0, 0], [0, 1], [1, 1]] },  // Задняя
            { normal: [0, 1, 0], uv: [[0, 1], [0, 0], [1, 0], [1, 1]] },  // Верхняя
            { normal: [0, -1, 0], uv: [[0, 0], [1, 0], [1, 1], [0, 1]] }, // Нижняя
            { normal: [-1, 0, 0], uv: [[1, 0], [1, 1], [0, 1], [0, 0]] }, // Левая
            { normal: [1, 0, 0], uv: [[0, 0], [0, 1], [1, 1], [1, 0]] }   // Правая
        ];

        // Вершины для каждой грани (4 вершины на грань)
        const faceVertices = [
            // Передняя грань (z+)
            [[-half, -half, half], [half, -half, half], [half, half, half], [-half, half, half]],
            // Задняя грань (z-)
            [[half, -half, -half], [-half, -half, -half], [-half, half, -half], [half, half, -half]],
            // Верхняя грань (y+)
            [[-half, half, -half], [-half, half, half], [half, half, half], [half, half, -half]],
            // Нижняя грань (y-)
            [[-half, -half, -half], [half, -half, -half], [half, -half, half], [-half, -half, half]],
            // Левая грань (x-)
            [[-half, -half, -half], [-half, -half, half], [-half, half, half], [-half, half, -half]],
            // Правая грань (x+)
            [[half, -half, half], [half, -half, -half], [half, half, -half], [half, half, half]]
        ];

        let vertexIndex = 0;

        // Обрабатываем каждую грань
        faces.forEach((face, faceIdx) => {
            const faceNormal = new THREE.Vector3().fromArray(face.normal);
            faceNormal.applyQuaternion(quaternion).normalize();

            // Добавляем 4 вершины грани
            for (let i = 0; i < 4; i++) {
            const vertex = new THREE.Vector3().fromArray(faceVertices[faceIdx][i]);
            vertex.applyQuaternion(quaternion).add(center);

            //vertices.push(vertex.x, vertex.y, vertex.z);
            //normals.push(faceNormal.x, faceNormal.y, faceNormal.z);
            //uvs.push(...face.uv[i]);
                this.addVerticeNorm(vertex.x, vertex.y, vertex.z, faceNormal.x, faceNormal.y, faceNormal.z);
                this.addUv(face.uv[i][0], face.uv[i][1]);
            }

            // Добавляем индексы для 2 треугольников грани
            this.addIndex(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            this.addIndex(vertexIndex, vertexIndex + 2, vertexIndex + 3);

            vertexIndex += 4;
        });
    }

    makeCube3(size, position = [0, 0, 0], rotation = [0, 0, 0]){
        this.beginModel();

        const halfSize = size / 2;

        // Вершины куба (8 вершин)
        const vertices = [
            // Передняя грань
            [-halfSize, -halfSize, halfSize],  // 0
            [halfSize, -halfSize, halfSize],   // 1
            [halfSize, halfSize, halfSize],    // 2
            [-halfSize, halfSize, halfSize],   // 3

            // Задняя грань
            [-halfSize, -halfSize, -halfSize], // 4
            [halfSize, -halfSize, -halfSize],  // 5
            [halfSize, halfSize, -halfSize],   // 6
            [-halfSize, halfSize, -halfSize]   // 7
        ];

        // Применяем позицию и вращение к вершинам
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(rotation[0], rotation[1], rotation[2])
        );

        const positionedVertices = vertices.map(v => {
            const vector = new THREE.Vector3(v[0], v[1], v[2]);
            vector.applyMatrix4(rotationMatrix);
            vector.add(new THREE.Vector3(...position));
            return [vector.x, vector.y, vector.z];
        });

        // Добавляем вершины
        positionedVertices.forEach(v => {
            this.addVertice(v[0], v[1], v[2]);
        });

        // Индексы для 12 треугольников (6 граней по 2 треугольника)
        const indices = [
            // Передняя грань
            [0, 1, 2], [2, 3, 0],

            // Задняя грань
            [5, 4, 7], [7, 6, 5],

            // Верхняя грань
            [3, 2, 6], [6, 7, 3],

            // Нижняя грань
            [4, 5, 1], [1, 0, 4],

            // Левая грань
            [4, 0, 3], [3, 7, 4],

            // Правая грань
            [1, 5, 6], [6, 2, 1]
        ];

        // Добавляем индексы
        indices.forEach(triangle => {
            this.addIndex(triangle[0], triangle[1], triangle[2]);
        });
    }

    makeCube2(size = 1, position = [0, 0, 0], rotation = [0, 0, 0]){
        const half = size / 2;

        // Вершины куба (8 вершин)
        const vertices = [
            // Передняя грань
            [-half, -half, half],  // 0
            [half, -half, half],   // 1
            [half, half, half],    // 2
            [-half, half, half],   // 3

            // Задняя грань
            [-half, -half, -half], // 4
            [half, -half, -half],  // 5
            [half, half, -half],   // 6
            [-half, half, -half]   // 7
        ];

        // Нормали для каждой грани
        const faceNormals = [
            [0, 0, 1],   // Передняя
            [0, 0, -1],  // Задняя
            [0, 1, 0],   // Верхняя
            [0, -1, 0],  // Нижняя
            [-1, 0, 0],  // Левая
            [1, 0, 0]    // Правая
        ];

        // UV-координаты (для каждой вершины каждой грани)
        const uvCoords = [
            [0, 0], [1, 0], [1, 1], [0, 1] // Стандартные для каждой грани
        ];

        // Индексы вершин для 12 треугольников (6 граней × 2 треугольника)
        const faces = [
            // Передняя грань (z+)
            { v: [0, 1, 2, 3], n: 0, uv: uvCoords },
            // Задняя грань (z-)
            { v: [5, 4, 7, 6], n: 1, uv: uvCoords },
            // Верхняя грань (y+)
            { v: [3, 2, 6, 7], n: 2, uv: uvCoords },
            // Нижняя грань (y-)
            { v: [4, 5, 1, 0], n: 3, uv: uvCoords },
            // Левая грань (x-)
            { v: [4, 0, 3, 7], n: 4, uv: uvCoords },
            // Правая грань (x+)
            { v: [1, 5, 6, 2], n: 5, uv: uvCoords }
        ];

        // Применяем позицию и вращение
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(rotation[0], rotation[1], rotation[2])
        );
        const posVector = new THREE.Vector3().fromArray(position);

        // Результирующие данные
        /*const result = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: []
        };*/

        let vertexIndex = 0;

        // Обрабатываем каждую грань
        faces.forEach(face => {
            // Индексы вершин для двух треугольников грани
            const tri1 = [face.v[0], face.v[1], face.v[2]];
            const tri2 = [face.v[0], face.v[2], face.v[3]];

            // Добавляем индексы
            //result.indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            //result.indices.push(vertexIndex + 3, vertexIndex + 4, vertexIndex + 5);
            this.addIndex(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            this.addIndex(vertexIndex + 3, vertexIndex + 4, vertexIndex + 5);
            vertexIndex += 6;

            // Обрабатываем оба треугольника
            [...tri1, ...tri2].forEach(vIdx => {
            // Вершина
            const vertex = new THREE.Vector3().fromArray(vertices[vIdx]);
            vertex.applyMatrix4(rotationMatrix).add(posVector);
            //result.vertices.push(vertex.x, vertex.y, vertex.z);

            // Нормаль (одинаковая для всех вершин грани)
            const normal = new THREE.Vector3().fromArray(faceNormals[face.n]);
            normal.applyMatrix4(rotationMatrix).normalize();
            //result.normals.push(normal.x, normal.y, normal.z);

            this.addVerticeNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);

            // UV-координаты (рассчитываем для каждого треугольника)
            let uv;
            if (vIdx === face.v[0]) uv = face.uv[0];
            else if (vIdx === face.v[1]) uv = face.uv[1];
            else if (vIdx === face.v[2]) uv = face.uv[2];
            else uv = face.uv[3];

            //result.uvs.push(uv[0], uv[1]);
            });
        });

        //return result;
    }

    makeSphere(_options = {}){
        let options = {
            radius: 1,              // Радиус сферы
            segments: 16,           // Количество сегментов (вертикальных и горизонтальных)
            arc: Math.PI * 2,       // Угол дуги (по умолчанию полная сфера)
            position: [0, 0, 0],    // Позиция центра
            rotation: [0, 0, 0],    // Вращение
            ..._options
        };

        this.beginModel();

        // Вспомогательные переменные
        const center = new THREE.Vector3(...options.position);
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(...options.rotation)
        );

        // Генерация вершин
        for (let y = 0; y <= options.segments; y++) {
            const phi = (y / options.segments) * Math.PI; // От 0 до π (вертикаль)

            for (let x = 0; x <= options.segments; x++) {
                const theta = (x / options.segments) * options.arc; // От 0 до arc (горизонталь)

                // Позиция вершины (сферические координаты)
                const px = options.radius * Math.sin(phi) * Math.cos(theta);
                const py = options.radius * Math.cos(phi);
                const pz = options.radius * Math.sin(phi) * Math.sin(theta);

                // Нормаль (нормализованный вектор от центра)
                const nx = px / options.radius;
                const ny = py / options.radius;
                const nz = pz / options.radius;

                // UV-координаты
                const u = x / options.segments;
                const v = y / options.segments;

                // Применяем трансформации
                const vertex = new THREE.Vector3(px, py, pz);
                vertex.applyQuaternion(quaternion).add(center);

                const normal = new THREE.Vector3(nx, ny, nz);
                normal.applyQuaternion(quaternion);

                // Добавляем данные
                //vertices.push(vertex.x, vertex.y, vertex.z);
                //normals.push(normal.x, normal.y, normal.z);
                //uvs.push(u, v);
                this.addVerticeNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);
                this.addUv(u, v);
            }
        }

        // Генерация индексов
        for (let y = 0; y < options.segments; y++) {
            for (let x = 0; x < options.segments; x++) {
                const a = (options.segments + 1) * y + x;
                const b = (options.segments + 1) * (y + 1) + x;
                const c = (options.segments + 1) * (y + 1) + x + 1;
                const d = (options.segments + 1) * y + x + 1;

                // Два треугольника образуют квад
                this.addIndex(a, d, b);
                this.addIndex(b, d, c);
            }
        }
    }

    makeSphere2(radius = 1, position = [0, 0, 0], segments = 16){
        this.beginModel();

        // Генерация вершин сферы (адаптированный алгоритм UV-сферы)
        const phiSegments = segments;
        const thetaSegments = segments * 2;

        // Вершины
        for (let i = 0; i <= phiSegments; i++) {
            const phi = Math.PI * i / phiSegments;

            for (let j = 0; j <= thetaSegments; j++) {
                const theta = 2 * Math.PI * j / thetaSegments;

                const x = position[0] + radius * Math.sin(phi) * Math.cos(theta);
                const y = position[1] + radius * Math.sin(phi) * Math.sin(theta);
                const z = position[2] + radius * Math.cos(phi);

                this.addVertice(x, y, z);
            }
        }

        // Индексы для треугольников
        for (let i = 0; i < phiSegments; i++) {
            for (let j = 0; j < thetaSegments; j++) {
                const first = i * (thetaSegments + 1) + j;
                const second = first + thetaSegments + 1;

                this.addIndex(first, second, first + 1);
                this.addIndex(second, second + 1, first + 1);
            }
        }
    }

    makeRing(_options = {}){
        let options = {
        radius: 1,              // Радиус всего кольца
        tube: 0.4,              // Радиус трубки
        radialSegments: 16,     // Сегменты по радиусу
        tubularSegments: 32,    // Сегменты по окружности трубки
        arc: Math.PI * 2,       // Угол дуги (по умолчанию полное кольцо)
        position: [0, 0, 0],    // Позиция центра
        rotation: [0, 0, 0],    // Вращение
        ..._options
        };

        this.beginModel();

        // Вспомогательные переменные
        const center = new THREE.Vector3(...options.position);
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(...options.rotation)
        );

        // Генерация вершин
        for (let j = 0; j <= options.radialSegments; j++) {
            for (let i = 0; i <= options.tubularSegments; i++) {
                const u = (i / options.tubularSegments) * options.arc;
                const v = (j / options.radialSegments) * Math.PI * 2;

                // Позиция вершины
                const x = (options.radius + options.tube * Math.cos(v)) * Math.cos(u);
                const y = (options.radius + options.tube * Math.cos(v)) * Math.sin(u);
                const z = options.tube * Math.sin(v);

                // Нормаль (нормализованный вектор от центра трубки)
                const nx = Math.cos(u) * Math.cos(v);
                const ny = Math.sin(u) * Math.cos(v);
                const nz = Math.sin(v);

                // UV-координаты
                const uvX = i / options.tubularSegments;
                const uvY = j / options.radialSegments;

                // Применяем трансформации
                const vertex = new THREE.Vector3(x, y, z);
                vertex.applyQuaternion(quaternion).add(center);

                const normal = new THREE.Vector3(nx, ny, nz);
                normal.applyQuaternion(quaternion);

                // Добавляем данные
                //vertices.push(vertex.x, vertex.y, vertex.z);
                //normals.push(normal.x, normal.y, normal.z);
                //uvs.push(uvX, uvY);
                this.addVerticeNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);
                this.addUv(uvX, uvY);
            }
        }

        // Генерация индексов
        for (let j = 1; j <= options.radialSegments; j++) {
            for (let i = 1; i <= options.tubularSegments; i++) {
                const a = (options.tubularSegments + 1) * (j - 1) + (i - 1);
                const b = (options.tubularSegments + 1) * j + (i - 1);
                const c = (options.tubularSegments + 1) * j + i;
                const d = (options.tubularSegments + 1) * (j - 1) + i;

                // Два треугольника образуют квад
                //indices.push(a, b, d);
                //indices.push(b, c, d);
                this.addIndex(a, d, b);
                this.addIndex(b, d, c);
            }
        }
    }

    makeCylinder(_options = {}){
        let options = {
            radius: 1,              // Радиус цилиндра
            length: 2,              // Длина (высота) цилиндра
            segments: 16,           // Количество сегментов по окружности
            position: [0, 0, 0],    // Позиция центра
            rotation: [0, 0, 0],    // Вращение
            ..._options
        };

        this.beginModel();

        // Вспомогательные переменные
        const halfLength = options.length / 2;
        const center = new THREE.Vector3(...options.position);
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(...options.rotation)
        );

        // Генерация вершин боковой поверхности
        for (let y = 0; y <= 1; y++) { // Два кольца вершин (верх и низ)
            const yPos = y * options.length - halfLength;

            for (let x = 0; x <= options.segments; x++) {
                const theta = (x / options.segments) * Math.PI * 2;

                // Позиция вершины
                const px = options.radius * Math.cos(theta);
                const py = yPos;
                const pz = options.radius * Math.sin(theta);

                // Нормаль (горизонтальная для боковой поверхности)
                const nx = Math.cos(theta);
                const ny = yPos;
                const nz = Math.sin(theta);

                // UV-координаты
                const u = x / options.segments;
                const v = y;

                // Применяем трансформации
                const vertex = new THREE.Vector3(px, py, pz);
                vertex.applyQuaternion(quaternion).add(center);

                const normal = new THREE.Vector3(nx, ny, nz);
                normal.applyQuaternion(quaternion).normalize();

                //vertices.push(vertex.x, vertex.y, vertex.z);
                //normals.push(normal.x, normal.y, normal.z);
                //uvs.push(u, v);
                this.addVerticeNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);
                this.addUv(u, v);
            }
        }

        // Генерация индексов боковой поверхности
        for (let x = 0; x < options.segments; x++) {
            const a = x;
            const b = x + 1;
            const c = options.segments + 1 + x;
            const d = options.segments + 1 + x + 1;

            this.addIndex(a, c, b);
            this.addIndex(b, c, d);
        }

        {
            const baseIndex = this.getVertLenNow() / 3;

            // Верхний торец
            //vertices.push(center.x, center.y + halfLength, center.z);
            //normals.push(0, 1, 0);
            //uvs.push(0.5, 0.5);
            const topVertex = new THREE.Vector3(0, halfLength, 0);
            const topNormal = new THREE.Vector3(0, 1, 0);
            topVertex.applyQuaternion(quaternion).add(center);
            topNormal.applyQuaternion(quaternion).normalize();
            this.addVerticeNorm(topVertex.x, topVertex.y, topVertex.z, topNormal.x, topNormal.y, topNormal.z);
            this.addUv(0.5, 0.5);

            // Нижний торец
            //vertices.push(center.x, center.y - halfLength, center.z);
            //normals.push(0, -1, 0);
            //uvs.push(0.5, 0.5);
            const bottomVertex = new THREE.Vector3(0, -halfLength, 0);
            const bottomNormal = new THREE.Vector3(0, -1, 0);
            bottomVertex.applyQuaternion(quaternion).add(center);
            bottomNormal.applyQuaternion(quaternion).normalize();
            this.addVerticeNorm(bottomVertex.x, bottomVertex.y, bottomVertex.z, bottomNormal.x, bottomNormal.y, bottomNormal.z);
            this.addUv(0.5, 0.5);

            // Вершины для торцов
            for (let x = 0; x <= options.segments; x++) {
                const theta = (x / options.segments) * Math.PI * 2;
                const px = options.radius * Math.cos(theta);
                const pz = options.radius * Math.sin(theta);

                // Верхний торец
                const topVertex = new THREE.Vector3(px, halfLength, pz);
                const topNormal = new THREE.Vector3(Math.cos(theta), halfLength, Math.sin(theta));
                topVertex.applyQuaternion(quaternion).add(center);
                topNormal.applyQuaternion(quaternion).normalize();
                //vertices.push(topVertex.x, topVertex.y, topVertex.z);
                //normals.push(0, 1, 0);
                //uvs.push((Math.cos(theta) + 1) / 2, (Math.sin(theta) + 1) / 2);
                this.addVerticeNorm(topVertex.x, topVertex.y, topVertex.z, topNormal.x, topNormal.y, topNormal.z);
                this.addUv((Math.cos(theta) + 1) / 2, (Math.sin(theta) + 1) / 2);

                // Нижний торец
                const bottomVertex = new THREE.Vector3(px, -halfLength, pz);
                const bottomNormal = new THREE.Vector3(Math.cos(theta), -halfLength, Math.sin(theta));
                bottomVertex.applyQuaternion(quaternion).add(center);
                bottomNormal.applyQuaternion(quaternion).normalize();
                //vertices.push(bottomVertex.x, bottomVertex.y, bottomVertex.z);
                //normals.push(0, -1, 0);
                //uvs.push((Math.cos(theta) + 1) / 2, (Math.sin(theta) + 1) / 2);
                this.addVerticeNorm(bottomVertex.x, bottomVertex.y, bottomVertex.z, bottomNormal.x, bottomNormal.y, bottomNormal.z);
                this.addUv((Math.cos(theta) + 1) / 2, (Math.sin(theta) + 1) / 2);
            }

            // Индексы для торцов
            for (let x = 0; x < options.segments; x++) {
                // Верхний торец
                const topCenter = baseIndex;
                const topA = baseIndex + 2 + x * 2;
                const topB = baseIndex + 2 + ((x + 1) % options.segments) * 2;
                //indices.push(topCenter, topA, topB);
                this.addIndex(topCenter, topB, topA);

                // Нижний торец
                const bottomCenter = baseIndex + 1;
                const bottomA = baseIndex + 3 + x * 2;
                const bottomB = baseIndex + 3 + ((x + 1) % options.segments) * 2;
                //indices.push(bottomCenter, bottomB, bottomA);
                this.addIndex(bottomCenter, bottomA, bottomB);
            }
        }
    }

    buildGeometry(_options = {}){
        let options = {
            fract: 1,
            ..._options
        };

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));

        if(options.fract == 1)
            geometry.setIndex(this.indices);
        else {
            const splice = this.indices.slice(0, Math.floor(Math.floor(this.getIndexCount() / 3) * options.fract) * 3);
            const indeces = new Uint16Array(splice);
            geometry.setIndex(new THREE.BufferAttribute(indeces, 1));
        }
        //geometry.computeVertexNormals();

        return geometry;
    }

    cleanAll(){
        this.vertices.length = 0;
        this.normals.length = 0;
        this.uvs.length = 0;
        this.indices.length = 0;
    }
};

// mglModelGenerator: addGroup, setMaterial, addModel, buildModel.
export class mglModelGenerator{
    groups = [];
    groupNow = undefined;

    // Group
    addGroup(name){
        this.groupNow = this.groups.find(group => group.name == name);

        if(this.groupNow)
            mglBuild.warn(`mglModelGenerator addGroup() name existing: '${name}'.`);
        else {
            this.groupNow = {
                name: name,
                material: undefined,
                mgg: new mglGeometryGenerator(),
            };
            this.groups.push(this.groupNow);
        }

        return this;
    }

    useGroup(name){
        this.groupNow = this.groups.find(group => group.name == name);

        if(!this.groupNow){
            mglBuild.warn(`mglModelGenerator useGroup() name '${name}' not exist.`);
        }

        return this;
    }

    setMaterial(material){
        if(!this.groupNow){
            mglBuild.warn(`mglModelGenerator setMaterial() create 'noname' group.`);
            this.addGroup("noname");
        }

        this.groupNow.material = material;
    }

    addModelCube(size = 1, position = [0, 0, 0], rotation = [0, 0, 0]){
        if(!this.groupNow){
            mglBuild.warn(`mglModelGenerator addModelCube() create 'noname' group.`);
            this.addGroup("noname");
        }

        this.groupNow.mgg.makeCube(size, position, rotation);
    }

    addModelName(name, options){
        if(!this.groupNow){
            mglBuild.warn(`mglModelGenerator addModelCube() create 'noname' group.`);
            this.addGroup("noname");
        }

        if(name == "cube")
            this.groupNow.mgg.makeCube(options);
        else if(name == "sphere")
            this.groupNow.mgg.makeSphere(options);
        else if(name == "ring")
            this.groupNow.mgg.makeRing(options);
        else if(name == "cylinder")
            this.groupNow.mgg.makeCylinder(options);
        else
            mglBuild.error(`mglModelGenerator addModelName() name '${name}' not exist.`);
    }

    buildModel(){
        const build = new THREE.Group();

        for(const group of this.groups){
            let geometry = group.mgg.buildGeometry();
            let material = group.material ? group.material : new THREE.MeshBasicMaterial({ color: 0xffc0c0});
            let mesh = new THREE.Mesh(geometry, material);
            build.add(mesh);
        }

        return build;
    }
};

export class mglModelGeneratorExt extends mglModelGenerator{

    makeMineModel(){
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

                mmg.addGroup("red");
                mmg.setMaterial(new THREE.MeshPhysicalMaterial({ color: 0xff0000, ...mat }));
                mmg.addModelName("sphere", {segments: 16});

                mmg.addGroup("black").setMaterial(new THREE.MeshPhysicalMaterial({ color: 0x000000, ...mat }));
                mmg.addModelName("ring", { radius: .95, tube: .1, rotation: [Math.PI / 2, 0, 0]});

                mmg.addGroup("white").setMaterial(new THREE.MeshPhysicalMaterial({ color: 0xffffff, ...mat }));

                makeMineSpikes(mmg, 1);
                makeMineSpikes(mmg, -1);
            }

        makeMine(this);
    }
};