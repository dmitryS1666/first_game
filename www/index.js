// Configuration
let canvas, ctx;
let canvasWidth, canvasHeight;
let basketWidth, basketHeight;
let basketSpeed, eggSpeedBase, eggSpeedVariance;
const eggInterval = 1000; // milliseconds
const gameDuration = 150; // seconds
const flashDuration = 100; // Duration of the flash in milliseconds
let flashes = []; // Array to keep track of flashes
let tracks = []; // Массив для хранения следов

const colors = ['blue', 'brown', 'yellow', 'earth', 'green', 'indigo', 'orange', 'purple', 'pink', 'red'];
const colorProperties = {
    blue: {score: 5},
    brown: {score: 15},
    yellow: {score: 10},
    earth: {score: 25},
    green: {score: 2},
    indigo: {score: 0},
    orange: {score: -5},
    purple: {score: -10},
    pink: {score: -2},
    red: {score: 0, gameOver: true},
};

// Image references
const ballImages = {};
const ballImageNames = [
    'blue_ball.png',
    'brown_ball.png',
    'yellow_ball.png',
    'earth_ball.png',
    'green_ball.png',
    'indigo_ball.png',
    'orange_ball.png',
    'pink_ball.png',
    'purple_ball.png',
    'red_ball.png'
];

// Game state
let basketX;
let eggs = [];
let score = 0;
let timer;
let gameOver = false;
let highestScore = 0;

let basketImage = new Image();
let flashImage = new Image();
flashImage.src = "res/flash.png";

let trackImage = new Image();
trackImage.src = "res/track.png";

let touchFlag = false; // Флаг касания
let flashFlag = false; // Флаг вспышки

const trackWidth = 30; // Задайте ширину трека
const trackHeight = 80; // Задайте высоту трека

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

    // Load ball images
    ballImageNames.forEach((fileName) => {
        const color = fileName.split('_')[0];
        const img = new Image();
        img.src = `res/balls/${fileName}`;
        ballImages[color] = img;
    });

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
    timerDisplay('block');
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
    timerDisplay('none');
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    saveHighestScore(score);
    document.getElementById('gameOverScreen').style.display = 'block';
    gameOver = true;
    clearInterval(timer);
}

// Start the game timer
function startTimer() {
    let timeRemaining = gameDuration;
    document.getElementById('seconds').textContent = `${timeRemaining}`;
    timer = setInterval(() => {
        timeRemaining--;
        document.getElementById('seconds').textContent = `${timeRemaining}`;
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function addTrack(x, y) {
    tracks.push({ x, y, startTime: Date.now() });
}

function addFlash(x, y) {
    flashes.push({ x, y, startTime: Date.now() });
}

function drawBasket() {
    basketImage.src = "res/new_platform.png";
    // Проверяем, что изображение загружено
    if (basketImage.complete) {
        ctx.drawImage(basketImage, basketX, canvasHeight - basketHeight, basketWidth, basketHeight);
    } else {
        // Если изображение еще не загружено, выводим отладочное сообщение
        console.error('Basket image is not loaded yet.');
    }
}

function drawFlashes() {
    if (flashFlag) {
        ctx.globalAlpha = 1;
        ctx.drawImage(flashImage, basketX, canvasHeight - basketHeight - 50, basketWidth, basketHeight); // Отображаем вспышку
        setTimeout(() => {
            flashFlag = false; // Сбрасываем флаг после короткого времени
        }, 100); // Время отображения вспышки
    }
}

function drawTracks() {
    const currentTime = Date.now();
    ctx.globalAlpha = 0.1; // Устанавливаем полупрозрачность трека
    tracks.forEach(track => {
        const elapsed = currentTime - track.startTime;
        if (elapsed < 200 && !flashFlag) { // Проверяем флаг вспышки
            ctx.drawImage(trackImage, track.x - trackWidth / 2, track.y - trackHeight / 2, trackWidth, trackHeight);
        }
    });
    ctx.globalAlpha = 1; // Сброс прозрачности
    if (flashFlag) {
        tracks = []; // Очищаем следы, если была вспышка
    } else {
        tracks = tracks.filter(track => (currentTime - track.startTime) < 200); // Удаляем старые следы
    }
}

function drawEggs() {
    eggs.forEach(egg => {
        const img = ballImages[egg.color];
        if (img) {
            ctx.drawImage(img, egg.x - 25, egg.y - 25, 50, 50); // Рисуем шар
        } else {
            // Резервный случай
            ctx.beginPath();
            ctx.arc(egg.x, egg.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = egg.color;
            ctx.fill();
        }
    });
}

// Update the position of all eggs
function updateEggs() {
    eggs.forEach(egg => {
        egg.y += egg.speed;
        addTrack(egg.x, egg.y - 75); // Добавляем след для текущего положения
        if (egg.y > canvasHeight) {
            eggs = eggs.filter(e => e !== egg);
        }
    });
}

// Check for collisions between eggs and the basket
function handleCollision() {
    flashFlag = false; // Сбрасываем флаг вспышки
    touchFlag = false; // Сбрасываем флаг касания
    eggs.forEach(egg => {
        if (egg.y + 25 > canvasHeight - basketHeight && egg.x > basketX && egg.x < basketX + basketWidth) {
            const properties = colorProperties[egg.color];
            score += properties.score;
            updateScoreDisplay();
            if (properties.gameOver) {
                endGame();
            }
            eggs = eggs.filter(e => e !== egg);
            touchFlag = true; // Устанавливаем флаг касания
            flashFlag = true; // Устанавливаем флаг вспышки
        }
    });
}

// Update the displayed score
function timerDisplay(state) {
    document.getElementById('timer').style.display = state;
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Main game loop
function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawTracks(); // Рисуем следы
    drawFlashes(); // Рисуем вспышки
    drawBasket();
    drawEggs(); // Рисуем шары
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
    // Добавляем трек за шаром
    tracks.push({x, y: 75, startTime: Date.now()});
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
