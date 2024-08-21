
// --------------------------------------------- //
// --------------- Ловец планет ---------------- //
// --------------------------------------------- //

import {checkFirstRun, navigateTo, saveScore} from "./main";
import {bet, deposit} from './main';

// Game state
let timerPC;
let gameOver = false;

let canvasPC, ctxPC;
let canvasPCWidth, canvasPCHeight;
let basketPCWidth, basketPCHeight;
let basketSpeed, eggSpeedBase, eggSpeedVariance;
let leftPipeWidth, leftPipeHeight;
let rightPipeWidth, rightPipeHeight;
const eggInterval = 1000; // milliseconds
const gameDuration = 15; // seconds
let basketPosition = 'left'; // Начальное положение корзины (слева или справа)
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
    // red: {score: 0, gameOver: true}
    red: {score: 0}
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
basketImage.src = "res/astro_left.png";

const flashImage = new Image();
flashImage.src = 'res/flash.png';

const leftPipeImage = new Image();
leftPipeImage.src = 'res/l_pipe.png';

const rightPipeImage = new Image();
rightPipeImage.src = 'res/r_pipe.png';

// Переменные для вспышки
let flashes = [];

// Initialize game
export function setupGamePC() {
    canvasPC = document.getElementById('planetCatcherCanvas');
    if (!canvasPC) {
        console.error('Canvas element not found');
        return;
    }

    // Управление движением корзины с помощью касаний
    canvasPC.addEventListener('touchstart', (event) => {
        if (gameOver) return;

        const touchX = event.touches[0].clientX;

        if (touchX < canvasPCWidth / 2) {
            basketPosition = 'left';
        } else {
            basketPosition = 'right';
        }
    });

    ctxPC = canvasPC.getContext('2d');
    if (!ctxPC) {
        console.error('Canvas context not found');
        return;
    }

    resizeCanvasPC();
    window.addEventListener('resize', resizeCanvasPC);

    basketPCWidth = 400;
    basketPCHeight = 392;

    basketSpeed = canvasPCWidth * 0.02;
    eggSpeedBase = canvasPCHeight * 0.005;
    eggSpeedVariance = canvasPCHeight * 0.003;

    // Load ball images
    ballImageNames.forEach((fileName) => {
        const color = fileName.split('_')[0];
        const img = new Image();
        img.src = `res/balls/${fileName}`;
        ballImages[color] = img;
    });

    const startButton = document.getElementById('startButton');
    if (startButton) startButton.addEventListener('click', startGamePC);

    setInterval(addEgg, eggInterval);

    document.getElementById('currentBet').textContent = bet;
    document.getElementById('scoreValue').textContent = 0;
    checkFirstRun();
    document.getElementById('balanceValue').textContent = localStorage.getItem('currentScore') || 0;

    document.getElementById('failPlatformBlock').style.display = 'none';
    document.getElementById('failPlatform').style.display = 'none';
    document.getElementById('play').style.display = 'none';
    document.getElementById('failPlatformAstroBlock').style.display = 'block';
    document.getElementById('failPlatformAstro').style.display = 'block';
    document.getElementById('playPC').style.display = 'inline-block';

    timerDisplay('block');
}

function resizeCanvasPC() {
    canvasPCWidth = window.innerWidth;
    canvasPCHeight = window.innerHeight;
    canvasPC.width = canvasPCWidth;
    canvasPC.height = canvasPCHeight;
    basketPCWidth = canvasPCWidth * 0.2;
    basketPCHeight = canvasPCHeight * 0.05;
    basketSpeed = canvasPCWidth * 0.02;
    eggSpeedBase = canvasPCHeight * 0.005;
    eggSpeedVariance = canvasPCHeight * 0.003;

    // Размеры труб
    leftPipeWidth = canvasPCWidth * 0.15;  // Примерное значение
    leftPipeHeight = canvasPCHeight * 0.4; // Примерное значение
    rightPipeWidth = leftPipeWidth;
    rightPipeHeight = leftPipeHeight;
}

function drawPipes() {
    ctxPC.drawImage(leftPipeImage, 0, canvasPCHeight - leftPipeHeight, leftPipeWidth, leftPipeHeight);
    ctxPC.drawImage(rightPipeImage, canvasPCWidth - rightPipeWidth, canvasPCHeight - rightPipeHeight, rightPipeWidth, rightPipeHeight);
}

// Начало игры
export function startGamePC() {
    setupGamePC();
    score = 0;
    eggs = [];
    basketPosition = 'left'; // Корзина стартует слева
    updateScoreDisplay();
    startTimerPC();
    canvasPC.style.display = 'block';
    gameOver = false;

    document.getElementById('failPlatformAstroBlock').style.display = 'none';

    gameLoopPC();
}

// Конец игры
function endGame(isVictory) {
    canvasPC.style.display = 'none';
    timerDisplay('none');

    let currentBet = parseInt(document.getElementById('currentBet').innerText, 10);
    if (isVictory) {
        let newScore = parseInt(localStorage.getItem('currentScore')) + score + currentBet;
        saveScore(newScore);

        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = `+${score}`;

        navigateTo('winPage');
    } else {
        let newScore = parseInt(localStorage.getItem('currentScore')) - currentBet;
        saveScore(newScore);

        navigateTo('failPage');
    }

    gameOver = true;
    clearInterval(timerPC);
}

// Таймер игры
function startTimerPC() {
    let timeRemaining = gameDuration;
    document.getElementById('seconds').textContent = `${timeRemaining}`;
    timerPC = setInterval(() => {
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

// Отрисовка корзины с учетом отражения
function drawBasket() {
    let basketX = basketPosition === 'left' ? canvasPCWidth * 0.25 - basketPCWidth / 2 : canvasPCWidth * 0.75 - basketPCWidth / 2;

    ctxPC.save(); // Сохраняем текущее состояние контекста

    if (basketPosition === 'right') {
        ctxPC.scale(-1, 1); // Отражаем изображение по вертикали
        basketX = -basketX - basketPCWidth; // Корректируем позицию корзины для правильного отражения
    }

    ctxPC.drawImage(basketImage, basketX + 105, canvasPCHeight - basketPCHeight - 130, basketPCWidth, basketPCHeight);

    ctxPC.restore(); // Восстанавливаем исходное состояние контекста
}

/// Параболическая траектория шаров
function calculateParabola(egg) {
    let time = egg.time;
    let xStart = egg.fromLeft ? 25 : canvasPCWidth - 25; // Начальная позиция с учетом отступов от краев
    let xEnd;

    // Определяем конечную точку в зависимости от стороны начала движения
    if (egg.fromLeft) {
        xEnd = canvasPCWidth / 7; // Конечная точка для шаров, летящих слева - 1/3 от левого края
    } else {
        xEnd = canvasPCWidth - 50; // Конечная точка для шаров, летящих справа - 1/3 от правого края
    }

    let yStart = 150; // Начальная высота на 150px ниже от верха
    let yEnd = canvasPCHeight - basketPCHeight - 100; // Недолетают до конца на 50px

    let t = time / 100;
    egg.x = xStart + (xEnd - xStart) * t;
    egg.y = yStart + (yEnd - yStart) * t;
}

// Обновляем отрисовку
function drawEggs() {
    eggs.forEach(egg => {
        const img = ballImages[egg.color];
        if (img) {
            ctxPC.save(); // Сохраняем текущее состояние контекста

            // Перемещаем контекст к центру яйца и вращаем
            ctxPC.translate(egg.x, egg.y);
            const rotationDirection = egg.fromLeft ? 1 : -1; // Направление вращения: влево или вправо
            ctxPC.rotate((rotationDirection * egg.time * Math.PI) / 180); // Вращаем в зависимости от направления
            ctxPC.translate(-egg.x, -egg.y);

            // Увеличиваем размер шара до 100x100 пикселей
            ctxPC.drawImage(img, egg.x - 50, egg.y - 50, 70, 70);

            ctxPC.restore(); // Восстанавливаем исходное состояние контекста
        }
        calculateParabola(egg); // Обновляем траекторию
        egg.time++; // Увеличиваем время
    });

    // Отображаем вспышки
    flashes.forEach(flash => {
        ctxPC.save();
        ctxPC.globalAlpha = flash.alpha; // Прозрачность вспышки
        ctxPC.drawImage(flashImage, flash.x - 50, flash.y - 50, 100, 100); // Рисуем вспышку
        ctxPC.restore();
        flash.alpha -= 0.05; // Уменьшаем прозрачность для затухания
    });

    // Удаляем вспышки, которые уже затухли
    flashes = flashes.filter(flash => flash.alpha > 0);
}

// Логика игры
function gameLoopPC() {
    if (gameOver) return;
    ctxPC.clearRect(0, 0, canvasPCWidth, canvasPCHeight);
    drawPipes();  // Отрисовываем трубы
    drawBasket();
    drawEggs();
    handleCollision();
    requestAnimationFrame(gameLoopPC);
}

// Проверка столкновений
function handleCollision() {
    eggs.forEach(egg => {
        let basketX = basketPosition === 'left' ? canvasPCWidth * 0.25 : canvasPCWidth * 0.75;
        if (egg.y > canvasPCHeight - basketPCHeight - 50 && egg.x > basketX - basketPCWidth / 2 && egg.x < basketX + basketPCWidth / 2) {
            const properties = colorProperties[egg.color];
            score += properties.score;
            updateScoreDisplay();
            if (properties.gameOver) {
                endGame(false);
            }
            flashes.push({ x: egg.x, y: egg.y, alpha: 1 }); // Добавляем вспышку
            eggs = eggs.filter(e => e !== egg);
        }
    });
}

// Обновляем отображение очков
function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = score;
}

// Добавляем шар
function addEgg() {
    if (gameOver) return;
    const fromLeft = Math.random() > 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Устанавливаем начальную позицию для яиц в зависимости от стороны
    const startX = fromLeft ? 0 : canvasPCWidth - 50; // Позиция выхода из трубы
    const startY = fromLeft ? canvasPCHeight - leftPipeHeight : canvasPCHeight - rightPipeHeight; // Выход из трубы

    console.log('Adding egg:', { color, fromLeft });
    eggs.push({
        x: startX,
        y: startY,
        color: color,
        fromLeft: fromLeft,
        time: 0, // Время траектории
        rotationSpeed: Math.random() * 2 + 1 // Случайная скорость вращения
    });
}

// Управление движением корзины
document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    if (event.key === 'ArrowLeft') {
        basketPosition = 'left';
    } else if (event.key === 'ArrowRight') {
        basketPosition = 'right';
    }
});

// Update the displayed score
function timerDisplay(state) {
    document.getElementById('timer').style.display = state;
    document.getElementById('seconds').textContent = gameDuration;
}
