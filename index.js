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

// Multiplayer variables
let isMultiplayer = true;
let otherPlayers = [];






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

    // Handle local player (mySnake)
    if (mySnake.points.length > 0) {
        mySnake.move();
        mySnake.checkCollisionsWithBoundary();
        
        // Check collisions with other players
        if (isMultiplayer) {
            otherPlayers.forEach(otherPlayer => {
                mySnake.checkCollisionsWidthOtherSnakes(otherPlayer);
            });
            
            // Send player update to server
            if (multiplayerClient && multiplayerClient.isConnected) {
                multiplayerClient.sendPlayerUpdate(mySnake);
            }
        }
        
        // Check food collisions
        foods.forEach(food => {
            const res = mySnake.checkCollisionsWithFood(food);
            if (res) {
                if (isMultiplayer && multiplayerClient && multiplayerClient.isConnected) {
                    multiplayerClient.sendFoodEaten(food.id);
                } else {
                    food.regenerate();
                }
            }
        });

        // Check dead points collisions
        Snake.deadPoints = Snake.deadPoints.filter(p => !mySnake.checkCollisionsWithFood(p));
        
        mySnake.draw(ctx);
    }
    
    // Handle AI snakes (only in single player mode)
    if (!isMultiplayer) {
        snakes.forEach(s => {
            if (s !== mySnake) {
                s.move();
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
            }
        });
    } else {
        // Draw other multiplayer players
        if (multiplayerClient && multiplayerClient.isConnected) {
            otherPlayers = multiplayerClient.getOtherPlayers();
            otherPlayers.forEach(player => {
                player.draw(ctx);
            });
        }
    }

    foods.forEach(food => food.draw(ctx));
    Snake.drawDeadpoints(ctx);

    ctx.restore();

    joypad.draw(ctx);
    requestAnimationFrame(animate);
}

animate();

setInterval(() => {
    if (!isMultiplayer) {
        spawnSnake();
        const ind = snakes.findIndex(s => s.points.length == 0);
        if (ind !== -1) snakes.splice(ind, 1);
        snakesEle.innerText = snakes.length;
        
        const tSnakes = [...snakes];
        tSnakes.sort((a, b) => b.points.length - a.points.length);
        rankEle.innerText = tSnakes.findIndex(snake => snake == mySnake) + 1;
    } else {
        // In multiplayer mode, player count is updated via WebSocket
        // Rank calculation with other players
        if (multiplayerClient && multiplayerClient.isConnected) {
            const allPlayers = [mySnake, ...otherPlayers].filter(p => p.points.length > 0);
            allPlayers.sort((a, b) => b.points.length - a.points.length);
            rankEle.innerText = allPlayers.findIndex(player => player === mySnake) + 1;
        }
    }
    
    scoreEle.innerText = mySnake.points.length;
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

// Game Over Popup Functions
function showGameOverPopup() {
    const popup = document.getElementById('gameOverPopup');
    const finalScore = document.getElementById('finalScore');
    const finalRank = document.getElementById('finalRank');
    
    // Update popup with current score and rank
    finalScore.textContent = mySnake.points.length;
    finalRank.textContent = document.getElementById('rankEle').textContent;
    
    // Show the popup
    popup.style.display = 'flex';
}

function hideGameOverPopup() {
    const popup = document.getElementById('gameOverPopup');
    popup.style.display = 'none';
}

function restartGame() {
    // Hide the popup
    hideGameOverPopup();
    
    // Reset the snake
    const snakeIndex = snakes.indexOf(mySnake);
    if (snakeIndex !== -1) {
        snakes.splice(snakeIndex, 1);
    }
    
    // Create new snake
    mySnake = new Snake(canvas.width / 2, canvas.height / 2);
    mySnake.ai = false;
    snakes.push(mySnake);
    
    // Reconnect joypad to new snake
    joypad.connectWith(mySnake);
    
    // Clear dead points
    Snake.deadPoints = [];
    
    // Reset UI elements
    document.getElementById('scoreEle').textContent = '0';
    document.getElementById('rankEle').textContent = '1';
}

// Add event listener for restart button
document.addEventListener('DOMContentLoaded', function() {
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
});

// Also allow restarting with spacebar when popup is visible
window.addEventListener('keydown', function(e) {
    const popup = document.getElementById('gameOverPopup');
    if (popup && popup.style.display === 'flex' && e.code === 'Space') {
        e.preventDefault();
        restartGame();
    }
});