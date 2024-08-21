
// --------------------------------------------- //
// --------------- Бонусная игра --------------- //
// --------------------------------------------- //

import {checkFirstRun, navigateTo, saveScore} from "./main";
import { bet, deposit } from './main'

// Game state
let timer;
let gameOver = false;

let canvas, ctx;
let canvasWidth, canvasHeight;
let basketWidth, basketHeight;
let basketSpeed, eggSpeedBase, eggSpeedVariance;
const eggInterval = 1000; // milliseconds
const gameDuration = 15; // seconds
let tracks = []; // Массив для хранения следов

let basketX;
let eggs = [];
let score = 0;

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
    red: {score: 0, gameOver: true}
    // red: {score: 0}
};

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

let basketImage = new Image();
basketImage.src = "res/new_platform.png";

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

    basketWidth = 145;
    basketHeight = 127;

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

    if (startButton) startButton.addEventListener('click', startGame);
    // if (restartButton) restartButton.addEventListener('click', startGame);

    setInterval(addEgg, eggInterval);

    document.getElementById('currentBet').textContent = bet;
    document.getElementById('scoreValue').textContent = score || 0;
    checkFirstRun();
    document.getElementById('balanceValue').textContent = localStorage.getItem('currentScore') || 0;
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

// Start a new game
export function prepareGame() {
    setupGame();
    setupTouchControls();
    setupKeyboardControls();

    score = 0;
    basketX = (canvasWidth - basketWidth) / 2;
    eggs = [];
    updateScoreDisplay();
    timerDisplay('block');

    document.getElementById('failPlatformBlock').style.display = 'block';
    document.getElementById('failPlatform').style.display = 'block';
    document.getElementById('play').style.display = 'block';
    document.getElementById('failPlatformAstroBlock').style.display = 'none';
    document.getElementById('failPlatformAstro').style.display = 'none';
    document.getElementById('playPC').style.display = 'none';
}

// Start a new game
export function startGame() {
    document.getElementById('failPlatform').style.display = 'none';
    startTimer();
    if (canvas) {
        canvas.style.display = 'block';
        gameOver = false;
        gameLoop();
    }
}

// function resetGame() {
//     // Останавливаем текущую игру
//     if (timer) {
//         clearInterval(timer);
//     }
//
//     // Сбрасываем состояние игры
//     score = 0;
//     bet = 0;
//     deposit = 1000; // Или любое начальное значение депозита
//     eggs = [];
//     tracks = [];
//     flashFlag = false;
//     touchFlag = false;
//     gameOver = false;
//
//     // Обновляем отображение
//     updateScoreDisplay();
//
//     // Переключаем видимость
//     canvas.style.display = 'none';
//     timerDisplay('none');
// }

// End the game
function endGame(isVictory) {
    canvas.style.display = 'none';
    timerDisplay('none');
    let currentBet = parseInt(document.getElementById('currentBet').innerText, 10);
    if (isVictory) {
        let newScore = parseInt(localStorage.getItem('currentScore')) + score + currentBet; // Сохраняем текущий результат
        saveScore(newScore);

        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = `+${score}`;

        navigateTo('winPage'); // Перенаправляем на страницу победы
    } else {
        let newScore = parseInt(localStorage.getItem('currentScore')) - currentBet; // Сохраняем текущий результат
        saveScore(newScore);

        navigateTo('failPage'); // Перенаправляем на страницу поражения
    }
    gameOver = true;
    clearInterval(timer);
}

function startTimer() {
    console.log('start time');
    let timeRemaining = gameDuration;
    document.getElementById('seconds').textContent = `${timeRemaining}`;
    timer = setInterval(() => {
        timeRemaining--;
        if (timeRemaining >= 10) {
            document.getElementById('seconds').textContent = `${timeRemaining}`;
        } else {
            document.getElementById('seconds').textContent = `0${timeRemaining}`;
        }
        if (timeRemaining <= 0) {
            endGame(score >= 0);
        }
    }, 1000);
}

function addTrack(x, y) {
    tracks.push({x, y, startTime: Date.now()});
}

function drawBasket() {
    ctx.drawImage(basketImage, basketX, canvasHeight - basketHeight - 130, basketWidth, basketHeight);
}

function drawFlashes() {
    if (flashFlag) {
        ctx.globalAlpha = 1;
        ctx.drawImage(flashImage, basketX, canvasHeight - basketHeight - 50 - 150, basketWidth, basketHeight); // Отображаем вспышку
        setTimeout(() => {
            flashFlag = false; // Сбрасываем флаг после короткого времени
        }, 200); // Время отображения вспышки
    }
}

function drawTracks() {
    const currentTime = Date.now();
    ctx.globalAlpha = 0.1; // Устанавливаем полупрозрачность трека
    tracks.forEach(track => {
        const elapsed = currentTime - track.startTime;
        if (elapsed < 200 && !flashFlag) { // Проверяем флаг вспышки
            ctx.drawImage(trackImage, track.x, track.y - 120, trackWidth, trackHeight * 2.5);
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
            ctx.drawImage(img, egg.x - 25, egg.y - 25, 75, 75); // Рисуем шар
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
        if (egg.y > canvasHeight - basketHeight - 150 && egg.x > basketX && egg.x < basketX + basketWidth) {
            const properties = colorProperties[egg.color];
            score += properties.score;
            updateScoreDisplay();
            if (properties.gameOver) {
                endGame(false); // Поражение
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
    document.getElementById('seconds').textContent = gameDuration;
}

function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = score;
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


// Handle touch input for mobile devices
export function setupTouchControls() {
    canvas.addEventListener('touchmove', (event) => {
        if (gameOver) return;
        const touchX = event.touches[0].clientX;
        basketX = Math.min(Math.max(touchX - basketWidth / 2, 0), canvasWidth - basketWidth);
        event.preventDefault();
    }, {passive: false});
}

// Handle keyboard input for desktop
export function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        if (gameOver) return;
        if (event.key === 'ArrowLeft') {
            basketX = Math.max(basketX - basketSpeed, 0);
        } else if (event.key === 'ArrowRight') {
            basketX = Math.min(basketX + basketSpeed, canvasWidth - basketWidth);
        }
    });
}
