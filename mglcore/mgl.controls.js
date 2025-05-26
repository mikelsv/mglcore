import * as THREE from 'three';

// Sticks
export class mglStickControl{
    constructor(){
        this.pointDown = 0;
        this.touchId = null;
        this.startX = 0;
        this.startY = 0;
        this.moveX = 0;
        this.moveY = 0;

        this.radius = 50;
        this.optSens = 4;
    }

    init(){
        // Touch device
        const isTouchDevice = 'ontouchstart' in window;

        // Add mouse event handlers
        if(!isTouchDevice){
            window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
            //window.addEventListener('wheel', this.onMouseScroll.bind(this));
        } else {
            window.addEventListener('touchstart', this.onTouchStart.bind(this), false);
            window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
            window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        }
    }

    getMove(speed = 1){
        return new KiVec2(this.moveX * speed, this.moveY * speed);
    }

    setRadius(val){
        this.radius = val;
    }

    setSens(val){
        this.optSens = val;
    }

    // Mouse button click handler
    onMouseDown(event) {
        this.pointDown = 1;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.moveX = 0;
        this.moveY = 0;
    }

    // Mouse movement handler
    onMouseMove(event) {
        if(this.pointDown){
            let dx = event.clientX - this.startX;
            let dy = event.clientY - this.startY;

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
    onMouseUp(event) {
        this.pointDown = 0;
        this.moveX = 0;
        this.moveY = 0;
    }

    // Touch start
    onTouchStart(event){
        if (this.touchId === null) {
            const touch = event.touches[0];
            this.touchId = touch.identifier;

            this.pointDown = 1;
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.moveX = 0;
            this.moveY = 0;
        }
    }

    // Touch move
    onTouchMove(event){
        const touch = Array.from(event.touches).find(t => t.identifier === this.touchId);
        if (touch) {
            let dx = touch.clientX - this.startX;
            let dy = touch.clientY - this.startY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.radius) {
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
    onTouchEnd(event) {
        if (Array.from(event.changedTouches).some(t => t.identifier === this.touchId)) {
            this.touchId = null;
            this.pointDown = 0;
            this.moveX = 0;
            this.moveY = 0;
        }
    }

    // Function for handling scroll event
     onMouseScroll(event) {
        event.preventDefault(); // Prevent the default page scrolling behavior
        const delta = event.deltaY;

        if(delta < 0)
            gamer.mouse.scroll --;
        else
            gamer.mouse.scroll ++;
    }

    update(){}
};

// mglStickControl2d
export class mglStickControl2d extends mglStickControl{
    constructor(){
        super()

        this.jstSize = 100;
        this.knobSize = 40;
    }

    init(scene, show = true){
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

        // Set styles for the joystick via JavaScript
        Object.assign(this.joystick.style, {
            position: 'absolute',
            width: this.jstSize + 'px',
            height: this.jstSize + 'px',
            backgroundColor: 'rgba(219, 52, 135, 0.3)',
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
            backgroundColor: 'rgba(219, 52, 169, 0.7)',
            borderRadius: '50%',
            top: '30px',
            left: '30px',
            zIndex: '101'
        });

        super.init();
    }

    // Mouse
    onMouseDown(event) {
        super.onMouseDown(event);
        this.joystick.style.display = 'block';
        this.joystick.style.left = (this.startX - this.jstSize / 2) + 'px';
        this.joystick.style.top = (this.startY - this.jstSize / 2) + 'px';
        this.joystickKnob.style.left = (this.jstSize - this.knobSize) / 2 + 'px';
        this.joystickKnob.style.top = (this.jstSize - this.knobSize) / 2 + 'px';
    }

    onMouseMove(event) {
        super.onMouseMove(event);

        let delta = (this.jstSize - this.knobSize) / 2;
        this.joystickKnob.style.left = (delta + this.moveX * delta) + 'px';
        this.joystickKnob.style.top =  (delta + this.moveY * delta) + 'px';
    }

    onMouseUp(event) {
        super.onMouseUp(event);
        this.joystick.style.display = 'none';
    }

    // Touch
    onTouchStart(event) {
        super.onTouchStart(event);
        this.joystick.style.display = 'block';
        this.joystick.style.left = (this.startX - this.jstSize / 2) + 'px';
        this.joystick.style.top = (this.startY - this.jstSize / 2) + 'px';
        this.joystickKnob.style.left = (this.jstSize - this.knobSize) / 2 + 'px';
        this.joystickKnob.style.top = (this.jstSize - this.knobSize) / 2 + 'px';
    }

    onTouchMove(event) {
        super.onTouchMove(event);

        let delta = (this.jstSize - this.knobSize) / 2;
        this.joystickKnob.style.left = (delta + this.moveX * delta) + 'px';
        this.joystickKnob.style.top =  (delta + this.moveY * delta) + 'px';
    }

    onTouchEnd(event) {
        super.onTouchEnd(event);
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