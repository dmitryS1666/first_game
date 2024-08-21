
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
    leftPipeWidth = canvasPCWidth * 0.32;  // Примерное значение
    leftPipeHeight = canvasPCHeight * 0.3; // Примерное значение
    rightPipeWidth = leftPipeWidth;
    rightPipeHeight = leftPipeHeight;
}

function drawPipes() {
    ctxPC.drawImage(leftPipeImage, 0, 28, leftPipeWidth, leftPipeHeight);
    ctxPC.drawImage(rightPipeImage, canvasPCWidth - rightPipeWidth, 28, rightPipeWidth, rightPipeHeight);
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

    document.getElementById('pipeRight').style.display = 'block';
    document.getElementById('pipeLeft').style.display = 'block';

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
// function calculateParabola(egg) {
//     let time = egg.time;
//
//     // Используем startX и startY для начальной позиции
//     let xStart = egg.startX;
//     let xEnd;
//
//     // Определяем конечную точку в зависимости от стороны начала движения
//     if (egg.fromLeft) {
//         xEnd = canvasPCWidth / 7; // Конечная точка для шаров, летящих слева
//     } else {
//         xEnd = canvasPCWidth - 50; // Конечная точка для шаров, летящих справа
//     }
//
//     let yStart = egg.startY; // Начальная высота (50px от верха)
//     let yEnd = canvasPCHeight - basketPCHeight - 100; // Недолетают до конца на 50px
//
//     let t = time / 100;
//     egg.x = xStart + (xEnd - xStart) * t;
//     egg.y = yStart + (yEnd - yStart) * t;
// }
function calculateParabola(egg) {
    let time = egg.time;

    // Начальные позиции
    let xStart = egg.startX;
    let yStart = egg.startY;

    // Конечная точка по X (центр экрана) и Y (высота горки)
    let xEnd = egg.fromLeft ? canvasPCWidth / 8 : canvasPCWidth - 60; // Центр экрана

    // Уменьшаем ширину горизонтального движения в три раза
    let horizontalRange = canvasPCWidth * 0.08;
    xEnd = egg.fromLeft ? xEnd + horizontalRange : xEnd - horizontalRange;

    let yEnd = canvasPCHeight * 0.3; // Высота горки (уменьшена для более резкого склона)

    // Время перехода от параболы к вертикальному падению
    let transitionTime = 20; // Время на скатывание с горки
    let totalDuration = 140; // Общее время движения

    if (time < transitionTime) {
        // Параболическое движение (спуск по горке)
        let t = time / transitionTime;
        egg.x = xStart + (xEnd - xStart) * t;
        egg.y = yStart - (yStart - yEnd) * (1 - t * t); // Спуск по горке
    } else {
        // Вертикальное падение после "горки"
        let t = (time - transitionTime) / (totalDuration - transitionTime);

        // Зафиксированная конечная точка по x и плавное снижение по y
        egg.x = xEnd; // Зафиксированная x после "горки"
        egg.y = yEnd + (canvasPCHeight - yEnd - basketPCHeight - 100) * t; // Плавное вертикальное падение вниз
    }

    egg.time++; // Увеличиваем время для движения
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

    // Отображаем вспышки и текст
    flashes.forEach(flash => {
        ctxPC.save();

        // Отображаем вспышку
        ctxPC.globalAlpha = flash.alpha;
        ctxPC.drawImage(flashImage, flash.x - 50, flash.y - 50, 100, 100);

        // Отображаем текст
        ctxPC.fillStyle = 'white';
        ctxPC.font = '700 30px Montserrat'; // Задаем стиль шрифта
        ctxPC.textAlign = 'left'; // Выравнивание по левому краю
        ctxPC.textBaseline = 'middle';
        ctxPC.globalAlpha = flash.textAlpha;
        ctxPC.fillText(flash.text, flash.x + flash.textOffsetX, flash.y + flash.textOffsetY);

        ctxPC.restore();

        // Плавное исчезновение вспышки
        flash.alpha -= 0.05;
        flash.textAlpha = Math.max(flash.textAlpha - 0.02, 0); // Плавное исчезновение текста

        // Плавное движение текста вверх
        flash.textOffsetY -= 1; // Поднимаем текст вверх
    });

    // Удаляем вспышки и текст, которые уже затухли
    flashes = flashes.filter(flash => flash.alpha > 0 || flash.textAlpha > 0);
}

// Логика игры
function gameLoopPC() {
    if (gameOver) return;
    ctxPC.clearRect(0, 0, canvasPCWidth, canvasPCHeight);
    drawPipes();
    drawBasket();
    drawEggs();
    handleCollision();
    requestAnimationFrame(gameLoopPC);

    document.getElementById('pipeRight').style.display = 'none';
    document.getElementById('pipeLeft').style.display = 'none';
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

            // Добавляем вспышку и текст
            flashes.push({
                x: egg.x,
                y: egg.y,
                alpha: 1, // Прозрачность вспышки
                text: properties.score, // Значение для отображения
                textAlpha: 1, // Прозрачность текста
                textOffsetX: 60, // Смещение текста по X относительно вспышки
                textOffsetY: 0, // Смещение текста по Y
                textDuration: 150 // Длительность отображения текста
            });

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
    const startX = fromLeft ? 70 : canvasPCWidth - 65; // Отступ 30px от краев
    const startY = 265; // Сдвигаем на 50px от верха

    eggs.push({
        x: startX,
        y: startY,
        startX: startX, // Сохраняем начальную позицию по X
        startY: startY, // Сохраняем начальную позицию по Y
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
