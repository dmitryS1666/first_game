// Configuration
let canvas, ctx;
let canvasWidth, canvasHeight;
let basketWidth, basketHeight;
let basketSpeed, eggSpeedBase, eggSpeedVariance;
const eggInterval = 1000; // milliseconds
const gameDuration = 150; // seconds

const colors = ['yellow', 'blue', 'green', 'red', 'orange', 'purple', 'pink', 'brown', 'cyan', 'magenta'];
const colorProperties = {
    yellow: {score: 10},
    blue: {score: 5},
    green: {score: 2},
    red: {score: 0, gameOver: true},
    orange: {score: -5},
    purple: {score: -10},
    pink: {score: -2},
    brown: {score: 15},
    cyan: {score: 8},
    magenta: {score: 0, gameOver: true},
};

// Game state
let basketX;
let eggs = [];
let score = 0;
let timer;
let gameOver = false;
let highestScore = 0;

let basketImage = new Image();

// Initialize game
function setupGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not found');
        return;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    basketWidth = canvasWidth * 0.2;
    basketHeight = canvasHeight * 0.05;
    basketSpeed = canvasWidth * 0.02;
    eggSpeedBase = canvasHeight * 0.005;
    eggSpeedVariance = canvasHeight * 0.003;

    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const menuButton = document.getElementById('menuButton');

    if (startButton) startButton.addEventListener('click', startGame);
    if (restartButton) restartButton.addEventListener('click', startGame);
    if (menuButton) menuButton.addEventListener('click', showMainMenu);

    setInterval(addEgg, eggInterval);
    showMainMenu();
}

// Resize canvas to fit window
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    basketWidth = canvasWidth * 0.2;
    basketHeight = canvasHeight * 0.05;
    basketSpeed = canvasWidth * 0.02;
}

// Show main menu
function showMainMenu() {
    canvas.style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'block';
    loadHighestScore();
}

// Start a new game
function startGame() {
    score = 0;
    basketX = (canvasWidth - basketWidth) / 2;
    eggs = [];
    updateScoreDisplay();
    startTimer();
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'none';
    canvas.style.display = 'block';
    gameOver = false;
    gameLoop();
}

// End the game
function endGame() {
    canvas.style.display = 'none';
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    saveHighestScore(score);
    document.getElementById('gameOverScreen').style.display = 'block';
    gameOver = true;
    clearInterval(timer);
}

// Start the game timer
function startTimer() {
    let timeRemaining = gameDuration;
    document.getElementById('timer').textContent = `Time: ${timeRemaining}`;
    timer = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer').textContent = `Time: ${timeRemaining}`;
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function drawBasket() {
    basketImage.src = "res/new_platform.png"
    // Проверяем, что изображение загружено
    if (basketImage.complete) {
        ctx.drawImage(basketImage, basketX, canvasHeight - basketHeight, basketWidth, basketHeight);
    } else {
        // Если изображение еще не загружено, выводим отладочное сообщение
        console.error('Basket image is not loaded yet.');
    }
}

// Draw all falling eggs
function drawEggs() {
    // let eggImage = new Image();

    eggs.forEach(egg => {
        ctx.beginPath();
        ctx.arc(egg.x, egg.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = egg.color;
        ctx.fill();
    });

    // basketImage.src = "res/new_platform.png"
    // // Проверяем, что изображение загружено
    // if (basketImage.complete) {
    //     ctx.drawImage(basketImage, basketX, canvasHeight - basketHeight, basketWidth, basketHeight);
    // } else {
    //     // Если изображение еще не загружено, выводим отладочное сообщение
    //     console.error('Basket image is not loaded yet.');
    // }
}

// Update the position of all eggs
function updateEggs() {
    eggs.forEach(egg => {
        egg.y += egg.speed;
        if (egg.y > canvasHeight) {
            eggs = eggs.filter(e => e !== egg);
        }
    });
}

// Check for collisions between eggs and the basket
function handleCollision() {
    eggs.forEach(egg => {
        if (egg.y + 10 > canvasHeight - basketHeight && egg.x > basketX && egg.x < basketX + basketWidth) {
            const properties = colorProperties[egg.color];
            score += properties.score;
            updateScoreDisplay();
            // if (properties.gameOver) {
            //     endGame();
            // }
            eggs = eggs.filter(e => e !== egg);
        }
    });
}

// Update the displayed score
function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Main game loop
function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBasket();
    drawEggs();
    updateEggs();
    handleCollision();
    requestAnimationFrame(gameLoop);
}

// Add a new egg with random properties
function addEgg() {
    if (gameOver) return;
    const x = Math.random() * canvasWidth;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const speed = eggSpeedBase + Math.random() * eggSpeedVariance;
    eggs.push({x, y: 0, color, speed});
}

// Save the highest score to localStorage
function saveHighestScore(score) {
    const savedScore = localStorage.getItem('highestScore') || 0;
    highestScore = Math.max(score, savedScore);
    localStorage.setItem('highestScore', highestScore);
}

// Load the highest score from localStorage
function loadHighestScore() {
    highestScore = localStorage.getItem('highestScore') || 0;
    document.getElementById('lastScore').textContent = `Your highest score: ${highestScore}`;
}

// Handle touch input for mobile devices
function setupTouchControls() {
    canvas.addEventListener('touchmove', (event) => {
        if (gameOver) return;
        const touchX = event.touches[0].clientX;
        basketX = Math.min(Math.max(touchX - basketWidth / 2, 0), canvasWidth - basketWidth);
        event.preventDefault();
    }, { passive: false });
}

// Handle keyboard input for desktop
function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        if (gameOver) return;
        if (event.key === 'ArrowLeft') {
            basketX = Math.max(basketX - basketSpeed, 0);
        } else if (event.key === 'ArrowRight') {
            basketX = Math.min(basketX + basketSpeed, canvasWidth - basketWidth);
        }
    });
}

// Setup the game on page load
setupGame();
setupTouchControls();
setupKeyboardControls();
