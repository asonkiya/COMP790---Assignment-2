const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

class CelestialBody {
    constructor(options) {
        this.context = options.context;
        this.radius = options.radius;
        this.color = options.color;
        this.orbitRadius = options.orbitRadius || 0;
        this.orbitSpeed = options.orbitSpeed || 0;
        this.angle = options.initialAngle || 0;
        this.children = [];
    }

    addChild(body) {
        this.children.push(body);
    }

    update(timestep) {
        this.angle += this.orbitSpeed * (timestep / 1000);
        this.children.forEach(child => child.update(timestep));
    }

    draw() {
        const ctx = this.context;
        ctx.save();
        ctx.rotate(this.angle);
        ctx.translate(this.orbitRadius, 0);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        this.children.forEach(child => child.draw());
        ctx.restore();
    }
}

class Spaceship {
    constructor(context) {
        this.context = context;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2 + 200;
        this.width = 40;
        this.height = 60;
        this.speed = 200;
        this.angle = 0;
        this.rotationSpeed = Math.PI;
        this.keysDown = {};
        this.setupKeyboardListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', event => {
            this.keysDown[event.key] = true;
        });

        window.addEventListener('keyup', event => {
            this.keysDown[event.key] = false;
        });
    }

    update(timestep) {
        const distance = (this.speed * timestep) / 1000;
        const rotation = (this.rotationSpeed * timestep) / 1000;

        if (this.keysDown['ArrowLeft']) {
            this.angle -= rotation;
        }
        if (this.keysDown['ArrowRight']) {
            this.angle += rotation;
        }
        if (this.keysDown['ArrowUp']) {
            this.x += distance * Math.sin(this.angle);
            this.y -= distance * Math.cos(this.angle);
        }
        if (this.keysDown['ArrowDown']) {
            this.x -= distance * Math.sin(this.angle);
            this.y += distance * Math.cos(this.angle);
        }
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    }

    draw() {
        const ctx = this.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

const sun = new CelestialBody({
    context: context,
    radius: 50,
    color: 'yellow',
});

const earth = new CelestialBody({
    context: context,
    radius: 20,
    color: 'blue',
    orbitRadius: 200,
    orbitSpeed: 30 * (Math.PI / 180),
});

sun.addChild(earth);

const moon = new CelestialBody({
    context: context,
    radius: 5,
    color: 'grey',
    orbitRadius: 40,
    orbitSpeed: 120 * (Math.PI / 180),
});

earth.addChild(moon);

const mars = new CelestialBody({
    context: context,
    radius: 15,
    color: 'red',
    orbitRadius: 300,
    orbitSpeed: 24 * (Math.PI / 180),
});

sun.addChild(mars);

const spaceship = new Spaceship(context);

let fps = 60,
    framesThisSecond = 0,
    lastFpsUpdate = 0,
    lastFrameTimeMs = 0,
    delta = 0,
    timestep = 1000 / 60;

function panic() {
    delta = 0;
}

function mainLoop(timestamp) {
    if (lastFrameTimeMs === 0) {
        lastFrameTimeMs = timestamp;
    }

    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    let numUpdateSteps = 0;
    while (delta >= timestep) {
        update(timestep);
        delta -= timestep;

        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }

    draw();

    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * framesThisSecond + 0.75 * fps;
        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;

    requestAnimationFrame(mainLoop);
}

function update(timestep) {
    sun.update(timestep);
    spaceship.update(timestep);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    sun.draw();
    context.restore();
    spaceship.draw();

    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText('FPS: ' + Math.round(fps), 10, 20);
}

requestAnimationFrame(mainLoop);
