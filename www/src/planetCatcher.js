
// --------------------------------------------- //
// --------------- Ловец планет ---------------- //
// --------------------------------------------- //

import {checkFirstRun, currentGame, navigateTo, saveScore} from "./main";
import {bet} from './main';

// Game state
let timerPC;
export let gameOverPC = false;

let canvasPC, ctxPC;
let canvasPCWidth, canvasPCHeight;
let basketPCWidth, basketPCHeight;
let basketSpeed, eggSpeedBase, eggSpeedVariance;
let leftPipeWidth, leftPipeHeight;
let rightPipeWidth, rightPipeHeight;
const eggInterval = 2200; // milliseconds
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
    red: {score: 0, gameOverPC: true}
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

let textDisplays = []; // Массив для хранения информации о всплывающих текстах

// Функция для создания текста
function addTextDisplay(x, y, text) {
    textDisplays.push({
        x,
        y,
        text,
        alpha: 1, // Начальная непрозрачность
        speed: 2 // Скорость подъема текста
    });
}

// Функция для отрисовки текста
function drawTexts() {
    ctxPC.globalAlpha = 1; // Устанавливаем непрозрачность текста

    textDisplays.forEach((textDisplay, index) => {
        ctxPC.fillStyle = 'white';
        ctxPC.font = '700 30px Montserrat';
        ctxPC.textAlign = 'left';
        ctxPC.textBaseline = 'middle';

        ctxPC.fillText(textDisplay.text, textDisplay.x, textDisplay.y);

        // Обновляем позицию текста для создания эффекта подъема
        textDisplay.y -= textDisplay.speed;
        textDisplay.alpha -= 0.02; // Плавное исчезновение

        // Удаляем текст, когда он полностью исчез
        if (textDisplay.alpha <= 0) {
            textDisplays.splice(index, 1);
        }
    });
    ctxPC.globalAlpha = 1; // Сброс прозрачности
}

// Initialize game
export function setupGamePC() {
    document.getElementById('planetCatcherCanvas').style.display = 'block';
    canvasPC = document.getElementById('planetCatcherCanvas');

    const startButton = document.getElementById('playPC');
    if (startButton) {
        startButton.disabled = false; // Разблокируем кнопку
    }

    if (!canvasPC) {
        console.error('Canvas element not found');
        return;
    }

    // Слушатель на изменение ориентации экрана
    window.addEventListener('resize', resizeCanvasPC);
    window.addEventListener('orientationchange', resizeCanvasPC);

    // Управление движением корзины с помощью касаний
    canvasPC.addEventListener('touchstart', (event) => {
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

    if (startButton) startButton.removeEventListener('click', startGamePC);
    if (startButton) startButton.addEventListener('click', startGamePC);

    setInterval(addEgg, eggInterval);

    document.getElementById('currentBet').textContent = bet;
    document.getElementById('scoreValue').textContent = 0;
    checkFirstRun();
    document.getElementById('balanceValue').textContent = localStorage.getItem('currentScore') || 0;

    document.getElementById('pipe').style.display = 'block';
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('failPlatformBlock').style.display = 'none';
    document.getElementById('failPlatform').style.display = 'none';
    document.getElementById('play').style.display = 'none';
    document.getElementById('failPlatformAstroBlock').style.display = 'block';
    document.getElementById('failPlatformAstro').style.display = 'block';
    document.getElementById('playPC').style.display = 'inline-block';

    timerDisplay('block');
}

export function resizeCanvasPC() {
    let isLandscape = window.innerWidth > window.innerHeight;
    if (isLandscape > 0) {
        canvasPCWidth = window.innerWidth - 200;
        canvasPC.style.transform = 'translateX(100px)';

        basketPCWidth = 313;
        basketPCHeight = 305;
    } else {
        canvasPCWidth = window.innerWidth;
        canvasPC.style.transform = 'translateX(0)';

        basketPCWidth = 350;
        basketPCHeight = 342;
    }
    canvasPCHeight = window.innerHeight;

    canvasPC.width = canvasPCWidth;
    canvasPC.height = canvasPCHeight;

    // Размеры труб
    leftPipeWidth = 130;// * 0.32;  // Примерное значение
    leftPipeHeight = 270;// * 0.3; // Примерное значение

    rightPipeWidth = leftPipeWidth;
    rightPipeHeight = leftPipeHeight;
}

function drawPipes() {
    let orientation = window.innerWidth - window.innerHeight;
    if (orientation > 0) {
        ctxPC.drawImage(leftPipeImage, 0, -160, leftPipeWidth, leftPipeHeight);
        ctxPC.drawImage(rightPipeImage, canvasPCWidth - rightPipeWidth, -160, rightPipeWidth, rightPipeHeight);
    } else {
        ctxPC.drawImage(leftPipeImage, 0, 28, leftPipeWidth, leftPipeHeight);
        ctxPC.drawImage(rightPipeImage, canvasPCWidth - rightPipeWidth, 28, rightPipeWidth, rightPipeHeight);
    }
}

// Начало игры
export function startGamePC() {
    gameOverPC = false;

    setupGamePC();
    score = 0;
    eggs = [];
    basketPosition = 'left'; // Корзина стартует слева
    updateScoreDisplay();

    // Сбрасываем таймер перед началом игры
    clearInterval(timerPC); // Очищаем таймер перед новой игрой
    startTimerPC(); // Запускаем таймер
    canvasPC.style.display = 'block';

    document.getElementById('failPlatformAstroBlock').style.display = 'none';

    // Деактивируем кнопку "Старт" после начала игры
    const startButton = document.getElementById('playPC');
    if (startButton) {
        startButton.disabled = true; // Блокируем кнопку
    }

    gameLoopPC();
}

// Конец игры
export function endGamePC(isVictory, isInterrupted = false) {
    // Если игра прервана, не пересчитываем результат
    if (isInterrupted) {
        gameOverPC = true;
        clearInterval(timerPC);
        return;
    }

    gameOverPC = true; // Игра завершена
    clearInterval(timerPC); // Очистка таймера
    canvasPC.style.display = 'none';
    timerDisplay('none');

    document.getElementById('pipe').style.display = 'block';

    let currentBet = parseInt(document.getElementById('currentBet').innerText, 10);

    // Активируем кнопку "Старт" после завершения игры
    const startButton = document.getElementById('playPC');
    if (startButton) {
        startButton.disabled = false; // Разблокируем кнопку
    }

    if (isVictory) {
        let newScore = parseInt(localStorage.getItem('currentScore')) + score + currentBet;
        saveScore(newScore);

        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = `+${score}`;

        currentGame = 'planetCatcher';
        navigateTo('winPage');
    } else {
        let newScore = parseInt(localStorage.getItem('currentScore')) - currentBet;
        saveScore(newScore);

        currentGame = 'planetCatcher';
        navigateTo('failPage');
    }

    // Сброс отображения таймера после завершения игры
    document.getElementById('seconds').textContent = gameDuration;
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
            endGamePC(score >= 0);
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

    let isLandscape = window.innerWidth > window.innerHeight;
    if (isLandscape) {
        ctxPC.drawImage(basketImage, basketX + 105, canvasPCHeight - basketPCHeight + 50, basketPCWidth, basketPCHeight);
    } else {
        ctxPC.drawImage(basketImage, basketX + 105, canvasPCHeight - basketPCHeight - 130, basketPCWidth, basketPCHeight);
    }

    ctxPC.restore(); // Восстанавливаем исходное состояние контекста
}

// Параболическая траектория шаров
function calculateParabola(egg) {
    let time = egg.time;
    // Определение ориентации экрана и установка коэффициентов скорости
    let isLandscape = window.innerWidth > window.innerHeight;

    // Начальные позиции
    let xStart = egg.startX;
    let yStart = egg.startY;

    // Конечная точка по X (центр экрана) и Y (высота горки)
    let xEnd = egg.fromLeft ? canvasPCWidth / 8 : canvasPCWidth - 60; // Центр экрана

    // Уменьшаем ширину горизонтального движения
    let horizontalRange = canvasPCWidth * 0.08;
    if (isLandscape) {
        xEnd = egg.fromLeft ? xEnd + horizontalRange : xEnd - horizontalRange;
    } else {
        xEnd = egg.fromLeft ? xEnd + horizontalRange + 20 : xEnd - horizontalRange - 20;
    }

    let yEnd = canvasPCHeight * 0.3; // Высота горки

    // Время перехода от параболы к вертикальному падению
    let transitionTime = 40;
    let totalDuration = 140;

    let speedMultiplier = isLandscape ? 0.5 : 1; // Уменьшаем общую скорость падения в 2 раза при горизонтальной ориентации
    let initialSpeedMultiplier = isLandscape ? 0.33 : 1; // Уменьшаем начальную скорость выкатывания в 3 раза при горизонтальной ориентации

    if (time < transitionTime) {
        // Параболическое движение (спуск по горке)
        let t = (time / transitionTime) * initialSpeedMultiplier; // Используем initialSpeedMultiplier для замедления начальной скорости
        egg.x = xStart + (xEnd - xStart) * t;
        egg.y = yStart - (yStart - yEnd) * (1 - t * t); // Спуск по горке
    } else {
        // Вертикальное падение после "горки"
        let t = (time - transitionTime) / (totalDuration - transitionTime);

        // Зафиксированная конечная точка по x и плавное снижение по y
        egg.x = xEnd; // Зафиксированная x после "горки"

        if (isLandscape) {
            let yPos = yEnd + (canvasPCHeight - yEnd - 100) * t; // Плавное вертикальное падение вниз
            egg.y = yPos > 0 ? yPos : yPos * -1;
        } else {
            egg.y = yEnd + (canvasPCHeight - yEnd - basketPCHeight - 100) * t; // Плавное вертикальное падение вниз
        }
    }

    // Умножаем прирост времени на коэффициент скорости для падения
    egg.time += speedMultiplier; // Увеличиваем время для движения
}

// Обновляем отрисовку
function drawEggs() {
    eggs.forEach(egg => {
        const img = ballImages[egg.color];
        if (img) {
            ctxPC.save(); // Сохраняем текущее состояние контекста

            // Перемещаем контекст к центру изображения яйца
            ctxPC.translate(egg.x, egg.y);
            const rotationDirection = egg.fromLeft ? 1 : -1; // Направление вращения: влево или вправо
            ctxPC.rotate((rotationDirection * egg.time * Math.PI) / 180); // Вращаем в зависимости от направления

            // Отрисовываем изображение яйца, смещая его на половину ширины и высоты для центрирования
            ctxPC.drawImage(img, -35, -35, 70, 70);

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
        ctxPC.drawImage(flashImage, flash.x - 70, flash.y - 70, 140, 140);

        // Отображаем текст
        ctxPC.fillStyle = 'white';
        ctxPC.font = '700 30px Montserrat'; // Задаем стиль шрифта
        ctxPC.textAlign = 'left'; // Выравнивание по левому краю
        ctxPC.textBaseline = 'middle';
        ctxPC.globalAlpha = flash.textAlpha;

        ctxPC.restore();

        // Плавное исчезновение вспышки
        flash.alpha -= 0.59;
    });

    // Удаляем вспышки и текст, которые уже затухли
    flashes = flashes.filter(flash => flash.alpha > 0 || flash.textAlpha > 0);
}

// Логика игры
export function gameLoopPC() {
    if (gameOverPC) return;
    ctxPC.clearRect(0, 0, canvasPCWidth, canvasPCHeight);
    drawPipes();
    drawBasket();
    drawEggs();
    drawTexts();
    handleCollision();
    requestAnimationFrame(gameLoopPC);

    document.getElementById('pipe').style.display = 'none';
}

// Проверка столкновений
function handleCollision() {
    let isLandscape = window.innerWidth > window.innerHeight;

    eggs.forEach(egg => {
        let basketX = basketPosition === 'left' ? canvasPCWidth * 0.25 : canvasPCWidth * 0.75;
        let basketTop; // Верхняя граница корзины

        if (isLandscape) {
            basketTop = canvasPCHeight - basketPCHeight + 50;
        } else {
            basketTop = canvasPCHeight - basketPCHeight - 50;
        }

        // Проверка на касание только верхней части корзины
        if (egg.y > basketTop && egg.y < basketTop + 50 && // Проверяем, находится ли яйцо в пределах верхней части корзины
            egg.x > basketX - basketPCWidth / 2 && egg.x < basketX + basketPCWidth / 2) { // Проверяем по горизонтали

            const properties = colorProperties[egg.color];
            score += properties.score;
            updateScoreDisplay();

            // Вызов функции вибрации при касании платформы
            if ("vibrate" in navigator) {
                navigator.vibrate(100); // Вибрация длительностью 100 миллисекунд
            }

            // Добавляем всплывающее сообщение с текстом
            let scoreVal = properties.score
            addTextDisplay(egg.x, egg.y, (scoreVal > 0 ? '+' + scoreVal.toString() : scoreVal.toString()));

            if (properties.gameOverPC) {
                endGamePC(false);
            }

            // Добавляем вспышку и текст
            flashes.push({
                x: egg.x,
                y: egg.y,
                alpha: 1
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
    if (gameOverPC) return;

    // Определяем случайный интервал для появления нового шара
    setTimeout(() => {
        const fromLeft = Math.random() > 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Устанавливаем начальную позицию для яиц в зависимости от стороны
        const startX = fromLeft ? 70 : canvasPCWidth - 65; // Отступ 30px от краев
        const startY = 265; // Сдвигаем на 50px от верха

        // Проверяем, нет ли уже шары в этой области
        const isOverlapping = eggs.some(egg =>
            Math.abs(egg.x - startX) < 70 && Math.abs(egg.y - startY) < 70
        );

        if (!isOverlapping) {
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

        // Устанавливаем следующий случайный интервал
        setTimeout(addEgg, eggInterval + Math.random() * 2000); // Интервал от 1 до 3 секунд
    }, Math.random() * 2000); // Задержка перед добавлением шара от 0 до 2 секунд
}

// Управление движением корзины
document.addEventListener('keydown', (event) => {
    if (gameOverPC) return;
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
