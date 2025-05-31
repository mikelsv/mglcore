import * as THREE from 'three';

// Sticks
export class mglStickControl{
    constructor(camera){
        this.camera = camera;

        this.pointDown = 0;
        this.touchId = null;
        this.startX = 0;
        this.startY = 0;
        this.moveX = 0;
        this.moveY = 0;

        this.radius = 50;
        this.optSens = 4;

        this.flagTouchDevice = false;
    }

    init(){
        // Touch device
        this.flagTouchDevice = 'ontouchstart' in window;

        // Add mouse event handlers
        if(!this.flagTouchDevice){
            window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
            //window.addEventListener('wheel', this.onMouseScroll.bind(this));
        } else {
            window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
            window.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        }

        // document.addEventListener('dblclick', function(event) { event.preventDefault();}, { passive: false }); // Disable double click

    }

    isTouchDevice(){
        return this.flagTouchDevice;
    }

    // Get normalize mouse move
    getMove(speed = 1){
        return new KiVec2(this.moveX * speed, this.moveY * speed);
    }

    getMousePosAtY(y = 0){
        let point = mglMoveControl.getScreenPointAtY(this.camera, y, this.mouseX / window.innerWidth, this.mouseY / window.innerHeight);
        return point;
    }

    getMoveForHero(position, speed = 1){
        if(this.pointDown){
            if(this.flagTouchDevice === false){
                const point = this.getMousePosAtY(position.y);
                const move = new KiVec2(point.x - position.x, point.z - position.z).normalize().multiply(speed);

                return move;
            } else
                return this.getMove(speed);
        }

        return new KiVec2();
    }

    setRadius(val){
        this.radius = val;
    }

    setSens(val){
        this.optSens = val;
    }

    // Mouse button click handler
    onMouseDown(event){
        this.pointDown = performance.now();
        this.startX = this.mouseX = event.clientX;
        this.startY = this.mouseY = event.clientY;
        this.moveX = 0;
        this.moveY = 0;
    }

    // Mouse movement handler
    onMouseMove(event){
        if(this.pointDown){
            let dx = event.clientX - this.startX;
            let dy = event.clientY - this.startY;

            this.mouseX = event.clientX;
            this.mouseY = event.clientY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if(distance > this.radius){
                dx = dx * this.radius / distance;
                dy = dy * this.radius / distance;
            }

            // Update the motion vector (normalized)
            this.moveX = dx / this.radius;
            this.moveY = dy / this.radius;
        }
    }

    // Mouse button release handler
    onMouseUp(event){
        this.pointDown = 0;
        this.moveX = 0;
        this.moveY = 0;
    }

    // Touch start
    onTouchStart(event){
        if (this.touchId === null){
            const touch = event.touches[0];
            this.touchId = touch.identifier;

            this.pointDown = performance.now();
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.moveX = 0;
            this.moveY = 0;
        }

        // Disable menu and other
        event.preventDefault();
        console.log("!start");
    }

    // Touch move
    onTouchMove(event){
        const touch = Array.from(event.touches).find(t => t.identifier === this.touchId);
        if (touch) {
            let dx = touch.clientX - this.startX;
            let dy = touch.clientY - this.startY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.radius){
                dx = dx * this.radius / distance;
                dy = dy * this.radius / distance;
            }

            // Update the motion vector (normalized)
            this.moveX = dx / this.radius;
            this.moveY = dy / this.radius;

            event.preventDefault();
        }
    }

    // Touch end
    onTouchEnd(event){
        if (Array.from(event.changedTouches).some(t => t.identifier === this.touchId)){
            this.touchId = null;
            this.pointDown = 0;
            this.moveX = 0;
            this.moveY = 0;
        }
    }

    // Function for handling scroll event
     onMouseScroll(event){
        event.preventDefault(); // Prevent the default page scrolling behavior
        const delta = event.deltaY;

        if(delta < 0)
            gamer.mouse.scroll --;
        else
            gamer.mouse.scroll ++;
    }

    update(){}

    static getScreenPointAtY(camera, y, normalizedX, normalizedY) {
        // Convert normalized coordinates (0..1) to NDC (-1..1)
        const ndcX = (normalizedX * 2) - 1; // 0..1 -> -1..1
        const ndcY = -(normalizedY * 2) + 1; // 0..1 -> 1..-1 (invert Y)

        // Cast a ray from the camera through the specified screen point
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

        // Plane at the specified Y height
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);

        // Find the intersection of the ray with the plane
        const point = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, point);

        return point;
    }
};

// mglStickControl2d
export class mglStickControl2d extends mglStickControl{
    constructor(camera, color = 0xffffff){
        super(camera)

        this.jstSize = 100;
        this.knobSize = 40;
        this.color = new THREE.Color(color);
        this.show = false;
    }

    init(show = true){
        super.init();

        this.show = show;

        if(!show)
            return ;

        // Create a joystick element
        this.joystick = document.createElement('div');
        this.joystick.id = 'mgjGameStickJoystick';

        // Create a joystick knob element
        this.joystickKnob = document.createElement('div');
        this.joystickKnob.id = 'mgjGameStickJoystickkKnob';

        // Add the knob to the joystick
        this.joystick.appendChild(this.joystickKnob);

        // Add the joystick to the game area
        //const threejs = document.getElementById('threejs');
        document.body.appendChild(this.joystick);

        const rgbaColor = `rgba(${Math.floor(this.color.r * 255)}, ${Math.floor(this.color.g * 255)}, ${Math.floor(this.color.b * 255)}, 0.5)`;

        // Set styles for the joystick via JavaScript
        Object.assign(this.joystick.style, {
            position: 'absolute',
            width: this.jstSize + 'px',
            height: this.jstSize + 'px',
            backgroundColor: 'transparent',
            border: `2px solid ${rgbaColor}`,
            //backgroundColor: 'rgba(219, 52, 135, 0.3)',
            borderRadius: '50%',
            bottom: '50px',
            left: '50px',
            display: 'none', // Initially hidden
            zIndex: '100'
        });

        // Set styles for the joystick knob
        Object.assign(this.joystickKnob.style, {
            position: 'absolute',
            width: '40px',
            height: '40px',
            backgroundColor: `${rgbaColor}`,
            borderRadius: '50%',
            top: '30px',
            left: '30px',
            zIndex: '101'
        });
    }

    // Mouse
    onMouseDown(event){
        super.onMouseDown(event);

        if(!this.show)
            return ;

        this.joystick.style.display = 'block';
        this.joystick.style.left = (this.startX - this.jstSize / 2) + 'px';
        this.joystick.style.top = (this.startY - this.jstSize / 2) + 'px';
        this.joystickKnob.style.left = (this.jstSize - this.knobSize) / 2 + 'px';
        this.joystickKnob.style.top = (this.jstSize - this.knobSize) / 2 + 'px';
    }

    onMouseMove(event){
        super.onMouseMove(event);

        if(!this.show)
            return ;

        let delta = (this.jstSize - this.knobSize) / 2;
        this.joystickKnob.style.left = (delta + this.moveX * delta) + 'px';
        this.joystickKnob.style.top =  (delta + this.moveY * delta) + 'px';
    }

    onMouseUp(event){
        super.onMouseUp(event);

        if(!this.show)
            return ;

        this.joystick.style.display = 'none';
    }

    // Touch
    onTouchStart(event){
        super.onTouchStart(event);

        if(!this.show)
            return ;

        this.joystick.style.display = 'block';
        this.joystick.style.left = (this.startX - this.jstSize / 2) + 'px';
        this.joystick.style.top = (this.startY - this.jstSize / 2) + 'px';
        this.joystickKnob.style.left = (this.jstSize - this.knobSize) / 2 + 'px';
        this.joystickKnob.style.top = (this.jstSize - this.knobSize) / 2 + 'px';
    }

    onTouchMove(event){
        super.onTouchMove(event);

        if(!this.show)
            return ;

        let delta = (this.jstSize - this.knobSize) / 2;
        this.joystickKnob.style.left = (delta + this.moveX * delta) + 'px';
        this.joystickKnob.style.top =  (delta + this.moveY * delta) + 'px';
    }

    onTouchEnd(event) {
        super.onTouchEnd(event);

        if(!this.show)
            return ;

        this.joystick.style.display = 'none';
    }

    // update(){}
};

// mglStickControl3d
export class mglStickControl3d extends mglStickControl{
    init(scene, show = true){
        // Create a circle
        const geometry = new THREE.CircleGeometry(1, 64);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
        this.circle = new THREE.Mesh(geometry, material);
        scene.add(this.circle);

        // Create ring
        const geometry2 = new THREE.RingGeometry(2, 1.95, 64);
        const material2 = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
        this.ring = new THREE.Mesh(geometry2, material2);
        scene.add(this.ring);

        super.init();

        this.setVisible(show);
    }

    // true / false
    setVisible(val){
        if(val)
            val = true;
        else
            val = false;

        this.circle.visible = val;
        this.ring.visible = val;
    }

    update(camera, hero){
        if(!hero)
            return ;

        this.ring.position.copy(hero.position).add(new THREE.Vector3(0, 0, 0));
        this.circle.position.copy(hero.position).add(new THREE.Vector3(this.moveX, 0, 0 + this.moveY));
        this.circle.lookAt(camera.position);
        this.ring.lookAt(camera.position);
    }

};

export class mglKeyboardControl{
    // Variables for storing key state
    keys = {
        KeyW: 0, KeyA: 0, KeyS: 0, KeyD: 0, // WASD
        ArrowLeft: 0, ArrowRight: 0, ArrowUp: 0, ArrowDown: 0 // Arrows
    };

    init(){
        let control = this;

        // Keystroke handler
        window.addEventListener('keydown', (event) => {
            control.keys[event.code] = true;
        });

        // Key release handler
        window.addEventListener('keyup', (event) => {
            control.keys[event.code] = false;
        });
    }

    getMove(){
        const keys = this.keys;

        return new KiVec2(
            -keys['ArrowLeft'] - keys['KeyA'] + keys['ArrowRight'] + keys['KeyD'],
            -keys['ArrowUp'] - keys['KeyW'] + keys['ArrowDown'] + keys['KeyS']
        );
    }
}

export class mglMoveControl{
    constructor(camera){
        this.camera = camera;
    }

    init(mouse, keyboard){
        this.mouse = mouse;
        this.keyboard = keyboard;
    }

    initMouseKeyboard(){
        this.mouse = new mglStickControl();
        this.keyboard = new mglKeyboardControl();

        this.mouse.init();
        this.keyboard.init();
    }

    initKeyboard(){
        this.mouse = { getMove(){ return new KiVec2(); }}; // Blank
        this.keyboard = new mglKeyboardControl();
        this.keyboard.init();
    }

    getMove(speed = 1){
        let move = this.mouse.getMove();

        if(!move.length())
            move = this.keyboard.getMove();

        // Limit maximum speed to 1
        if(move.length() > 1)
            move = move.normalize();

        // Speed
        move = move.multiply(speed);

        return move;
    }

    getKeybMove(speed = 1){
        let move = this.keyboard.getMove().normalize();

        if(!this.camera)
            return move.multiply(speed);

        // Get the camera direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        // Remove the Y component so that the movement is on the plane
        cameraDirection.y = 0;
        cameraDirection.normalize();

        // Get the motion vector
        const right = new THREE.Vector3();
        this.camera.getWorldDirection(right);
        right.cross(new THREE.Vector3(0, 1, 0)); // Get the vector to the right

        // Calculate the new position
        const moveDirection = new THREE.Vector3();
        moveDirection.addScaledVector(cameraDirection, -move.y); // Forward/backward movement
        moveDirection.addScaledVector(right, move.x); // Move left/right

        return new KiVec2(moveDirection.x, moveDirection.z).multiply(speed);
    }

    getMoveFromCamera(camera, speed = 1){
        let move = this.getMove();

        // Get the camera direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        // Remove the Y component so that the movement is on the plane
        cameraDirection.y = 0;
        cameraDirection.normalize();

        // Get the motion vector
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(new THREE.Vector3(0, 1, 0)); // Get the vector to the right

        // Calculate the new position
        const moveDirection = new THREE.Vector3();
        moveDirection.addScaledVector(cameraDirection, -move.y); // Forward/backward movement
        moveDirection.addScaledVector(right, move.x); // Move left/right

        return new KiVec2(moveDirection.x, moveDirection.z).multiply(speed);
    }

    getFullMove(position, speed){
        if(this.mouse.pointDown){
            if(this.mouse.flagTouchDevice === false){
                const point = this.getMousePosAtY(position.y);
                const move = new KiVec2(point.x - position.x, point.z - position.z).normalize().multiply(speed);

                return move;
            } else
                return this.getMoveFromCamera(this.camera, speed);
        }

        return this.getKeybMove(speed);
    }

    getMousePosAtY(y){
        let point = mglMoveControl.getScreenPointAtY(this.camera, y, this.mouse.mouseX / window.innerWidth, this.mouse.mouseY / window.innerHeight);
        return point;
    }

    static getScreenPointAtY(camera, y, normalizedX, normalizedY) {
        // Convert normalized coordinates (0..1) to NDC (-1..1)
        const ndcX = (normalizedX * 2) - 1; // 0..1 -> -1..1
        const ndcY = -(normalizedY * 2) + 1; // 0..1 -> 1..-1 (invert Y)

        // Cast a ray from the camera through the specified screen point
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

        // Plane at the specified Y height
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);

        // Find the intersection of the ray with the plane
        const point = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, point);

        return point;
    }

    static getScreenCornersAtY(camera, y){
        // Normalized screen corner coordinates (-1..1)
        const cornersNDC = [
            new THREE.Vector3(-1, -1, -1), // Bottom left (near)
            new THREE.Vector3(1, -1, -1), // Bottom right
            new THREE.Vector3(1, 1, -1), // Top right
            new THREE.Vector3(-1, 1, -1), // Top left
            new THREE.Vector3(-1, -1, -1), // Bottom left again
        ];

        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y); // Y plane
        const worldCorners = [];

        cornersNDC.forEach(ndc => {
            raycaster.setFromCamera(ndc, camera);
            const point = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, point);
            worldCorners.push(point);
        });

        return worldCorners; // [leftBottom, rightBottom, leftTop, rightTop]
    }

    static getScreenPointByCorners(corners, x, y){
        // Interpolate vertically between the top and bottom corners
        const top = corners[3].clone().lerp(corners[2], x); // top line
        const bottom = corners[0].clone().lerp(corners[1], x); // bottom line

        // Interpolate horizontally between the top and bottom lines
        const point = top.clone().lerp(bottom, y);

        return point;
    }
};

export class mglWindowControl{
    static addResizeEvent(camera, renderer){
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            console.log("Window resized!", window.innerWidth, window.innerHeight);
        });
    }

    static addDisableContextMenu(){
        // Lock the context menu
        const canvas = document.getElementById('threejs')
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }
};