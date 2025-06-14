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

    // Extend
    levels = [];

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
        return this._vertices.length;
    }

    beginModel(){
        this._vertices = [];
        this._normals = [];
        this._indices = [];
        this._uvs = [];
    }

    endModel(){
        if(this.erases)
            this.useEraces();

        const vertMove = this.vertices.length / 3;

        for(let i = 0; i < this._indices.length; i ++)
            this.indices.push(this._indices[i] + vertMove);

        this.vertices.push(...this._vertices);
        this.normals.push(...this._normals);
        this.uvs.push(...this._uvs);
    }

    addVert(x, y, z){
        this._vertices.push(x, y, z);
    }

    addVertNorm(x, y, z, nx, ny, nz){
        this._vertices.push(x, y, z);
        this._normals.push(nx, ny, nz);
    }

    addUv(x, y){
        this._uvs.push(x, y);
    }

    addIndex(x, y, z){
        this._indices.push(x, y, z);
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

                this.addVertNorm(vertex.x, vertex.y, vertex.z, faceNormal.x, faceNormal.y, faceNormal.z);
                this.addUv(face.uv[i][0], face.uv[i][1]);
            }

            // Добавляем индексы для 2 треугольников грани
            this.addIndex(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            this.addIndex(vertexIndex, vertexIndex + 2, vertexIndex + 3);

            vertexIndex += 4;
        });

        this.endModel();
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
                this.addVertNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);
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

        this.endModel();
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
                this.addVertNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);
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
                this.addIndex(a, d, b);
                this.addIndex(b, d, c);
            }
        }

        this.endModel();
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

                this.addVertNorm(vertex.x, vertex.y, vertex.z, normal.x, normal.y, normal.z);
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
            const topVertex = new THREE.Vector3(0, halfLength, 0);
            const topNormal = new THREE.Vector3(0, 1, 0);
            topVertex.applyQuaternion(quaternion).add(center);
            topNormal.applyQuaternion(quaternion).normalize();
            this.addVertNorm(topVertex.x, topVertex.y, topVertex.z, topNormal.x, topNormal.y, topNormal.z);
            this.addUv(0.5, 0.5);

            // Нижний торец
            const bottomVertex = new THREE.Vector3(0, -halfLength, 0);
            const bottomNormal = new THREE.Vector3(0, -1, 0);

            bottomVertex.applyQuaternion(quaternion).add(center);
            bottomNormal.applyQuaternion(quaternion).normalize();

            this.addVertNorm(bottomVertex.x, bottomVertex.y, bottomVertex.z, bottomNormal.x, bottomNormal.y, bottomNormal.z);
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

                this.addVertNorm(topVertex.x, topVertex.y, topVertex.z, topNormal.x, topNormal.y, topNormal.z);
                this.addUv((Math.cos(theta) + 1) / 2, (Math.sin(theta) + 1) / 2);

                // Нижний торец
                const bottomVertex = new THREE.Vector3(px, -halfLength, pz);
                const bottomNormal = new THREE.Vector3(Math.cos(theta), -halfLength, Math.sin(theta));

                bottomVertex.applyQuaternion(quaternion).add(center);
                bottomNormal.applyQuaternion(quaternion).normalize();

                this.addVertNorm(bottomVertex.x, bottomVertex.y, bottomVertex.z, bottomNormal.x, bottomNormal.y, bottomNormal.z);
                this.addUv((Math.cos(theta) + 1) / 2, (Math.sin(theta) + 1) / 2);
            }

            // Индексы для торцов
            for (let x = 0; x < options.segments; x++) {
                // Верхний торец
                const topCenter = baseIndex;
                const topA = baseIndex + 2 + x * 2;
                const topB = baseIndex + 2 + ((x + 1) % options.segments) * 2;
                this.addIndex(topCenter, topB, topA);

                // Нижний торец
                const bottomCenter = baseIndex + 1;
                const bottomA = baseIndex + 3 + x * 2;
                const bottomB = baseIndex + 3 + ((x + 1) % options.segments) * 2;
                this.addIndex(bottomCenter, bottomA, bottomB);
            }
        }

        this.endModel();
    }

    // Multilevel
    addLevel(level){
        this.levels.push(level);
    }

    cleanLevels(){
        this.levels.length = 0;
    }

    makeLevels(_options = {}){
        let options = {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            ..._options
        };

        this.beginModel();

        const levels = this.levels;

        // Проверка на валидность данных
        if(!levels || levels.length < 2){
            mglBuild.error("mglGeometryGenerator.makeLevels(): Not enough levels to build a model");
            return ;
        }

        // 1. Генерация вершин и UV-координат
        for(let levelIdx = 0; levelIdx < levels.length; levelIdx++){
            const level = levels[levelIdx];
            if (!level.pois || level.pois.length === 0){
                mglBuild.error(`mglGeometryGenerator.makeLevels(): Level ${levelIdx} does not contain points`, level);
                continue;
            }

            const numPoints = level.pois.length;
            const yPos = levelIdx / (levels.length - 1); // Нормализованная высота для UV

            for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
                const point = level.pois[pointIdx];
                console.log(point);
                // Добавляем вершину
                //vertices.push(point[0], point[1] || levelIdx, point[2]); // Если point.y не задан, используем levelIdx
                this.addVert(point[0], point[1] || levelIdx, point[2]);
                // UV: равномерное распределение по X и Z, Y зависит от уровня
                //uvs.push(pointIdx / numPoints, yPos);
                this.addUv(pointIdx / numPoints, yPos);
                // Нормаль будет вычислена позже
            }
        }

    // 2. Генерация индексов (соединение уровней)
    for (let levelIdx = 0; levelIdx < levels.length - 1; levelIdx++) {
        const currentLevel = levels[levelIdx];
        const nextLevel = levels[levelIdx + 1];
        const currentPoints = currentLevel.pois.length;
        const nextPoints = nextLevel.pois.length;

        // Соединяем текущий уровень со следующим
        for (let i = 0; i < Math.max(currentPoints, nextPoints); i++) {
            const currIdx0 = i % currentPoints;
            const currIdx1 = (i + 1) % currentPoints;
            const nextIdx0 = i % nextPoints;
            const nextIdx1 = (i + 1) % nextPoints;

            // Добавляем два треугольника (квад -> два треугольника)
            this.addIndex(
                getVertexIndex(levelIdx, currIdx0, currentPoints, levels),
                getVertexIndex(levelIdx, currIdx1, currentPoints, levels),
                getVertexIndex(levelIdx + 1, nextIdx0, nextPoints, levels),
            );
            this.addIndex(
                getVertexIndex(levelIdx + 1, nextIdx0, nextPoints, levels),

                getVertexIndex(levelIdx, currIdx1, currentPoints, levels),
                getVertexIndex(levelIdx + 1, nextIdx1, nextPoints, levels),
            );
        }
    }

    // 3. Вычисление нормалей (усреднение по треугольникам)
    computeNormals(this._vertices, this._indices, this._normals);


    // Вспомогательная функция для вычисления индекса вершины
    function getVertexIndex(levelIdx, pointIdx, pointsInLevel, levels) {
        let globalIndex = 0;
        for (let i = 0; i < levelIdx; i++) {
            globalIndex += levels[i].pois.length;
        }
        return globalIndex + pointIdx;
    }

    // Вычисление нормалей
    function computeNormals(vertices, indices, normals) {
        // Инициализируем массив нормалей нулями
        normals.length = vertices.length;
        normals.fill(0);

        // Вычисляем нормали для каждого треугольника
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i] * 3;
            const i1 = indices[i + 1] * 3;
            const i2 = indices[i + 2] * 3;

            const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]];
            const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
            const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];

            // Векторы сторон треугольника
            const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
            const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

            // Векторное произведение (нормаль к треугольнику)
            const normal = [
                edge1[1] * edge2[2] - edge1[2] * edge2[1],
                edge1[2] * edge2[0] - edge1[0] * edge2[2],
                edge1[0] * edge2[1] - edge1[1] * edge2[0],
            ];

            // Добавляем нормаль к каждой вершине треугольника
            for (let j = 0; j < 3; j++) {
                const idx = indices[i + j] * 3;
                normals[idx] += normal[0];
                normals[idx + 1] += normal[1];
                normals[idx + 2] += normal[2];
            }
        }

        // Нормализуем нормали
        for (let i = 0; i < normals.length; i += 3) {
            const length = Math.sqrt(
                normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2
            );
            if (length > 0) {
                normals[i] /= length;
                normals[i + 1] /= length;
                normals[i + 2] /= length;
            }
        }
    }

        this.endModel();
    }

    // Tree Generator
    makeTree(_options = {}){
        let options = {
            treeLimit: 10,
            ... _options
        };

        this.beginModel();

        let box = function(vId, fId){
            const vert = [[0, -1, 0], [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [-1, 1, -1], [1, 1, -1], [1,  1, 1], [-1, 1, 1]];
            const uvs = [[7, 7], [0, 0], [1, 0], [1, 1], [0, 1], [0, 0], [1, 0], [1, 1], [0, 1]];

            if(vId == 0){
                return { vert: [0, -1, 0], norm: [0, -1, 0], uv: [.5, .5], id: [1, 2, 3, 4] };
            } else if(vId < 5){
                return { vert: vert[vId], norm: [vert[vId][0] * 0.5773502691896258, vert[vId][1] * 0.5773502691896258, vert[vId][2] * 0.5773502691896258], uv: uvs[vId],
                    id: fId == 0 ? [vId != 4 ? (vId + 1) : 1] : [vId + 4] };
            }else if(vId < 9){
                return { vert: vert[vId], norm: [vert[vId][0] * 0.5773502691896258, vert[vId][1] * 0.5773502691896258, vert[vId][2] * 0.5773502691896258], uv: uvs[vId],
                    id: fId < 5 ? [vId != 8 ? vId + 1 : 5] :
                    (Math.abs(vId - fId) != 1 && vId != 5 && fId != 8) ? [vId != 5 ? vId - 1 : 8] : [9]
                    //id: fId < 5 ? [fId != 4 ? (fId + 1) : 1] : []
                    //    id: fId < 5 ? [vId != 5 ? (vId - 1) : 8] : [9]
                };
            } else if(vId == 9){
                return { vert: [0, 1, 0], norm: [0, 1, 0], uv: [.5, .5], id: [] };
            } else if(vId == undefined){
                return { verts: 10 };
            }
        }

        if(!options.call)
            options.call = box;

        if(!options.call){
            console.error("mglGeometryGenerator.makeTree() need options 'call' for generate tree points.");
            return ;
        }

        const verts = options.call().verts;

        for(let i = 0; i < verts; i ++){
            const result = options.call(i);
            this.addVertNorm(...result.vert, ...result.norm);
            this.addUv(...result.uv);
        }

        this.makeThreeIndex(options, undefined, 0, 0);
        this.endModel();
    }

    makeThreeIndex(options, vId0, vId1, iteration){
        const result = options.call(vId1, vId0);

        //console.log("STEP", iteration);

        if(options.treeLimit && iteration >= options.treeLimit)
            return ;

        for(let i = 0; i < result.id.length; i ++){

            //if(vId1 > 7)
                //continue;

            //console.log(vId1 + ' -> ' + result.id[i]);

            //const next = call(result.id[i]);

            // There are 3 points
            //for(let j = 0; j < next.id.length; j ++){
                if(vId0 != undefined){
                    console.log(vId0, vId1, result.id[i]);

                    this.addIndex(vId0, vId1, result.id[i]);
                    //console.log("index", vId0, vId1, result.id[i]);
                }
                this.makeThreeIndex(options, vId1, result.id[i], iteration + 1);
            //}
        }
    }

    // Erases
    setErases(erases){
        this.erases = erases;
    }

    useEraces(){
        for(const erase of this.erases){
            if(erase.name == "sphere"){
                const radius = erase.radius - 0.001;

                const vertices = this._vertices;
                const indices = this._indices;

                const newIndices = [];
                const usedVertices = new Set(); // Хранит индексы используемых вершин

                // 1. Фильтрация треугольников
                for (let i = 0; i < indices.length; i += 3) {
                    const i0 = indices[i];
                    const i1 = indices[i + 1];
                    const i2 = indices[i + 2];

                    // Получаем координаты вершин
                    const v0 = [vertices[i0 * 3], vertices[i0 * 3 + 1], vertices[i0 * 3 + 2]];
                    const v1 = [vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]];
                    const v2 = [vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]];

                    // Вычисляем расстояние от каждой вершины до (0, 0, 0)
                    const dist0 = Math.sqrt(v0[0] ** 2 + v0[1] ** 2 + v0[2] ** 2);
                    const dist1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2);
                    const dist2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2);

                    // Проверяем, что ВСЕ вершины треугольника внутри сферы радиуса `radius`
                    const isAllVerticesInside =
                        dist0 < radius &&
                        dist1 < radius &&
                        dist2 < radius;

                    // Если не все вершины маленькие, сохраняем треугольник
                    if (!isAllVerticesInside) {
                        newIndices.push(i0, i1, i2);
                        usedVertices.add(i0);
                        usedVertices.add(i1);
                        usedVertices.add(i2);
                    }
                }

                // 2. Удаление неиспользуемых вершин и пересчёт индексов
                const oldToNewIndexMap = {}; // Старые индексы → новые
                const newVertices = [];
                let newIndex = 0;

                // Собираем только используемые вершины
                for (let i = 0; i < vertices.length / 3; i++) {
                    if (usedVertices.has(i)) {
                        oldToNewIndexMap[i] = newIndex++;
                        newVertices.push(
                            vertices[i * 3],
                            vertices[i * 3 + 1],
                            vertices[i * 3 + 2]
                        );
                    }
                }

                 // Если есть нормали и UV, их тоже нужно пересчитать
                const newNormals = [];
                for (let i = 0; i < this._normals.length / 3; i++) {
                    if (usedVertices.has(i)) {
                        newNormals.push(
                            this._normals[i * 3],
                            this._normals[i * 3 + 1],
                            this._normals[i * 3 + 2]
                        );
                    }
                }

                const newUVs = [];
                for (let i = 0; i < this._uvs.length / 2; i++) {
                    if (usedVertices.has(i)) {
                        newUVs.push(
                            this._uvs[i * 2],
                            this._uvs[i * 2 + 1]
                        );
                    }
                }

                // Обновляем индексы в newIndices
                const finalIndices = newIndices.map(oldIndex => oldToNewIndexMap[oldIndex]);

                // Обновляем исходные массивы
                this._vertices = newVertices;
                this._normals = newNormals;
                this._uvs = newUVs;
                this._indices = finalIndices;
            } else
                mglBuild.error(`mglGeometryGenerator useEraces() erase '${erase.name}' not exist.`);

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
        //console.log(this.indices);
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

    erases = [];

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

    addModelName(name, options){
        if(!this.groupNow){
            mglBuild.warn(`mglModelGenerator addModelCube() create 'noname' group.`);
            this.addGroup("noname");
        }

        if(this.erases)
            this.groupNow.mgg.setErases(this.erases);

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

    addErase(_options = {}){
        let options = {
            position: [0, 0, 0],
            ..._options
        };

        if(!options.name){
            mglBuild.error(`mglModelGenerator addErase() name is undefined.`);
            return;
        }

        this.erases.push(options);
    }

    buildModel(){
        const build = new THREE.Group();

        for(const group of this.groups){
            let geometry = group.mgg.buildGeometry();
            let material = group.material ? group.material : new THREE.MeshBasicMaterial({ color: 0xffc0c0});
            let mesh = new THREE.Mesh(geometry, material);
            mesh.name = group.name;
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

        makeMine(this);

        return this;
    }
};