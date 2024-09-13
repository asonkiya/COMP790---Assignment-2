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

    update() {
        this.angle += this.orbitSpeed;
        this.children.forEach(child => child.update());
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
        this.children.forEach(child => {
            child.draw();
        });
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
    orbitSpeed: 0.01,
});

sun.addChild(earth);

const moon = new CelestialBody({
    context: context,
    radius: 5,
    color: 'grey',
    orbitRadius: 40,
    orbitSpeed: 0.05,
});

earth.addChild(moon);

const mars = new CelestialBody({
    context: context,
    radius: 15,
    color: 'red',
    orbitRadius: 300,
    orbitSpeed: 0.008,
});

sun.addChild(mars);

function mainLoop() {
    update();
    draw();
    requestAnimationFrame(mainLoop);
}

function update() {
    sun.update();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    sun.draw();
    context.restore();
}

mainLoop();
