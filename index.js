/** * @type {HTMLCanvasElement} */
const canvas = document.getElementById("app");

/** * @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
ctx.lineJoin = "round";
ctx.lineCap = "round";


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const INFINITY = 0;
const coeffD2R = Math.PI / 180;
const coeffR2D = 180 / Math.PI;
const defRad = 5;

const zoom = 6;
const zoomFactorX = canvas.width / 2 / zoom;
const zoomFactorY = canvas.height / 2 / zoom;

const foods = [];
const snakes = [];
const keys = {};

let maxFoods = 1000;
let maxSnakes = 25;

let mySnake = new Snake(canvas.width / 2, canvas.height / 2);
mySnake.ai = false;
snakes.push(mySnake);






Array(maxFoods).fill(undefined).forEach(function () {
    foods.push(new Food());
});


function spawnSnake() {
    if (snakes.length > maxSnakes) return;
    const randX = Math.random() * canvas.width - 50;
    const randY = Math.random() * canvas.height - 50;
    snakes.push(new Snake(randX, randY));
}

function drawBoundary(ctx, lineWidth = 10) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = lineWidth;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
}


const joypad = new Joypad();
joypad.connectWith(mySnake);


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);

    ctx.translate(
        zoomFactorX - mySnake.getHead().x,
        zoomFactorY - mySnake.getHead().y
    );

    drawBoundary(ctx);

    snakes.forEach(s => {
        s.move();

        // s.cutIfCollidedWithSelf();       // TODO: fix this logic
        s.checkCollisionsWithBoundary();

        snakes.forEach(function (s2) {
            s2.checkCollisionsWidthOtherSnakes(s);
        });

        foods.forEach(food => {
            const res = s.checkCollisionsWithFood(food);
            if (res) food.regenerate();
        });

        Snake.deadPoints = Snake.deadPoints.filter(p => !s.checkCollisionsWithFood(p));

        s.draw(ctx);
    });

    foods.forEach(food => food.draw(ctx));
    Snake.drawDeadpoints(ctx);

    ctx.restore();

    joypad.draw(ctx);
    requestAnimationFrame(animate);
}

animate();

setInterval(() => {
    spawnSnake();
    const ind = snakes.findIndex(s => s.points.length == 0);
    if (ind !== -1) snakes.splice(ind, 1);
    snakesEle.innerText = snakes.length;
    scoreEle.innerText = mySnake.points.length;

    const tSnakes = [...snakes];
    tSnakes.sort((a, b) => b.points.length - a.points.length);
    rankEle.innerText = tSnakes.findIndex(snake => snake == mySnake) + 1;
}, 1200);


window.onkeydown = e => {
    if (e.code == 'ArrowUp') keys.up = true;
    if (e.code == 'ArrowDown') keys.down = true;
    if (e.code == 'ArrowLeft') keys.left = true;
    if (e.code == 'ArrowRight') keys.right = true;
};

window.onkeyup = e => {
    if (e.code == 'ArrowUp') keys.up = false;
    if (e.code == 'ArrowDown') keys.down = false;
    if (e.code == 'ArrowLeft') keys.left = false;
    if (e.code == 'ArrowRight') keys.right = false;
};