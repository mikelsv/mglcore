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