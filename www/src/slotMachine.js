import {bet, checkFirstRun, checkOrientation, isElementVisible} from "./main";

const canvasSlot = document.getElementById('slotCanvas');
const ctxSlot = canvasSlot.getContext('2d');

// Параметры игры
const columnCount = 4;
const ballsPerColumn = 10;
let ballRadius = 30; // Радиус шара
let columnWidth = canvasSlot.width / columnCount;
const ballSpacing = 20;
let isSpinning = false;
const margin = 35; // отступ от верха и низа
let score = 0;

// Массив с именами картинок
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

// Массив для загрузки изображений
const ballImages = [];

// Шары в каждой колонке
const columns = Array.from({length: columnCount}, () => []);

// Скорость вращения колонок
let speeds = Array(columnCount).fill(0);

// Создаем переменную для фонового изображения
let slotBackground;

// Функция для загрузки изображений
function loadImages(callback) {
    let imagesLoaded = 0;

    // Загрузка фонового изображения
    slotBackground = new Image();
    slotBackground.src = 'res/slotBg.png';  // путь к загруженному фону
    slotBackground.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === ballImageNames.length + 1) { // проверка на количество загруженных изображений
            callback();
        }
    };

    // Загрузка изображений шариков
    ballImageNames.forEach((name, index) => {
        const img = new Image();
        img.src = `res/balls/${name}`;
        img.onload = () => {
            ballImages[index] = img;
            imagesLoaded++;
            if (imagesLoaded === ballImageNames.length + 1) {
                callback();
            }
        };
    });
}

// Функция для активации проверки ориентации, если блок видим
function activateOrientationCheck() {
    if (isElementVisible('slotMachineContainer')) {
        window.addEventListener('orientationchange', checkOrientation);
        checkOrientation();
    } else {
        window.removeEventListener('orientationchange', checkOrientation);
    }
}

// Инициализация слот-машины после загрузки изображений
export function initSlotMachine() {
    document.getElementById('slotMachineContainer').addEventListener('click', spin);
    resizeCanvas();

    setTimeout(() => {
        activateOrientationCheck();
    }, 450);

    document.getElementById('spinSlotButton').addEventListener('click', spin);

    // Инициализация колонок
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = {
                imgIndex: i % ballImages.length,
                y: i * (ballRadius * 2 + ballSpacing) + margin // Добавляем отступ сверху
            };
            columns[col].push(ball);
        }
    }

    drawColumns();


    document.getElementById('currentBetSlot').textContent = bet;
    document.getElementById('scoreValueSlot').textContent = score || 0;
    checkFirstRun();
    document.getElementById('balanceValueSlot').textContent = localStorage.getItem('currentScore') || 0;
}

// Функция отрисовки колонок, картинок и фона
function drawColumns() {
    if (slotBackground.complete) {
        ctxSlot.clearRect(0, 0, canvasSlot.width, canvasSlot.height);
        ctxSlot.drawImage(slotBackground, 0, 0, canvasSlot.width, canvasSlot.height);
    }

    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = columns[col][i];
            if (ball && ball.imgIndex !== undefined && ballImages[ball.imgIndex]) {
                const img = ballImages[ball.imgIndex];
                if (img.complete) {
                    const x = col * columnWidth + columnWidth / 2 - ballRadius;
                    const y = (ball.y % canvasSlot.height) - ballRadius;

                    ctxSlot.drawImage(img, x, y, ballRadius * 2, ballRadius * 2);
                }
            }
        }
    }
}

// Функция обновления позиции шаров
function updateColumns() {
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            columns[col][i].y += speeds[col];
        }
    }
}

// Функция для остановки шаров на одной линии
function stopOnLine() {
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = columns[col][i];
            ball.y = Math.round((ball.y - margin) / (ballRadius * 2 + ballSpacing)) * (ballRadius * 2 + ballSpacing) + margin;
        }
    }
    drawColumns(); // Перерисовать шары на линии
}

// Старт анимации
function spin() {
    if (isSpinning) return;
    isSpinning = true;

    speeds = Array(columnCount).fill(10); // задаем одинаковую начальную скорость для всех колонок

    const stopDelays = [1000, 1300, 1600, 1900];

    const animation = setInterval(() => {
        updateColumns();
        drawColumns();
    }, 1000 / 60); // 60fps

    stopDelays.forEach((delay, index) => {
        setTimeout(() => {
            speeds[index] = 0;
            if (index === columnCount - 1) {
                clearInterval(animation);
                stopOnLine(); // Остановка шаров на одной линии
                isSpinning = false;
            }
        }, delay);
    });
}

// Загружаем изображения перед запуском слот-машины
loadImages(initSlotMachine);

function resizeCanvas() {
    const canvasWidth = window.innerWidth * 0.75;
    const canvasHeight = window.innerHeight * 0.7;

    canvasSlot.width = canvasWidth;
    canvasSlot.height = canvasHeight;

    columnWidth = canvasSlot.width / columnCount;
    ballRadius = canvasWidth / 20;

    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = columns[col][i];
            if (ball) {
                ball.y = i * (ballRadius * 2 + ballSpacing) + margin; // Учитываем отступ сверху
            }
        }
    }

    drawColumns();
}

setInterval(activateOrientationCheck, 1000);
