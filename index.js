/** * @type {HTMLCanvasElement} */
const canvas = document.getElementById("app");

/** * @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");


// canvas.width = 1360;
// canvas.height = 744;
// canvas.width = 1350;
canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.lineJoin = "round";
ctx.lineCap = "round";


const INFINITY = 0;
const defRad = 5;
let animId;

let maxFoods = 800;
let maxSnakes = 25;

const foods = [];

const snakes = [];

let mySnake = new Snake(canvas.width / 2, canvas.height / 2);
mySnake.moveRand = () => undefined;
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

const center = { x: 500, y: 500 };

let i = 0;

function drawBoundary(ctx, lineWidth = 10) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = lineWidth;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
}

const zoom = 5;
const zoomFactorX = canvas.width / 2 / zoom;
const zoomFactorY = canvas.height / 2 / zoom;


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

        if (++i % 17 === 0) s.moveRand();
        else if (i % 5 === 0) spawnSnake();

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
    requestAnimationFrame(animate);
}

animate();

setInterval(() => {
    const ind = snakes.findIndex(s => s.points.length == 0);
    if (ind !== -1) snakes.splice(ind, 1);
    snakesEle.innerText = snakes.length;
    scoreEle.innerText = mySnake.points.length;

    const tSnakes = [...snakes];
    tSnakes.sort((a, b) => b.points.length - a.points.length);
    rankEle.innerText = tSnakes.findIndex(snake => snake == mySnake) + 1;
}, 1500);

window.onkeydown = e => {
    if (e.code == 'ArrowUp') mySnake.moveUp();
    else if (e.code == 'ArrowDown') mySnake.moveDown();
    else if (e.code == 'ArrowLeft') mySnake.moveLeft();
    else if (e.code == 'ArrowRight') mySnake.moveRight();
};
