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
let isMultiplayer = true; // Enable multiplayer mode for socket connections
let otherPlayers = [];

// UI element references
const snakesEle = document.getElementById('snakesEle');
const rankEle = document.getElementById('rankEle');
const scoreEle = document.getElementById('scoreEle');
const statusEle = document.getElementById('statusEle');






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

// Game state management
let isGamePaused = false;


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
    if (mySnake.points.length > 0 && !isGamePaused) {
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
    if (isGamePaused) return; // Prevent input when game is paused
    if (e.code == 'ArrowUp') keys.up = true;
    if (e.code == 'ArrowDown') keys.down = true;
    if (e.code == 'ArrowLeft') keys.left = true;
    if (e.code == 'ArrowRight') keys.right = true;
};

window.onkeyup = e => {
    if (isGamePaused) return; // Prevent input when game is paused
    if (e.code == 'ArrowUp') keys.up = false;
    if (e.code == 'ArrowDown') keys.down = false;
    if (e.code == 'ArrowLeft') keys.left = false;
    if (e.code == 'ArrowRight') keys.right = false;
};

// Game Over Popup Functions
function showGameOverPopup() {
    const popup = document.getElementById('gameOverPopup');
    const finalScoreElement = document.getElementById('finalScore');
    const finalRankElement = document.getElementById('finalRank');
    
    // Update popup with stored final score and rank
    finalScoreElement.textContent = mySnake.finalScore || 0;
    finalRankElement.textContent = mySnake.finalRank || 1;
    
    // Pause the game
    isGamePaused = true;
    
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
    
    // Unpause the game
    isGamePaused = false;
    
    // Reset the snake
    const snakeIndex = snakes.indexOf(mySnake);
    if (snakeIndex !== -1) {
        snakes.splice(snakeIndex, 1);
    }
    
    // Clear dead points before creating new snake
    Snake.deadPoints = [];
    
    // Create new snake at a safe position
    mySnake = new Snake(canvas.width / 2, canvas.height / 2);
    mySnake.ai = false;
    snakes.push(mySnake);
    
    console.log('You respawned!');
    
    // Reconnect joypad to new snake
    joypad.connectWith(mySnake);
    
    // In multiplayer mode, the server will handle respawn through socket events
    // No need to manually notify server here
    
    // Reset UI elements
    document.getElementById('scoreEle').textContent = '0';
    document.getElementById('rankEle').textContent = '1';
    
    console.log('Game restarted successfully!');
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