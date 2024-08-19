import {bet, checkFirstRun, checkOrientation, isElementVisible} from "./main";

const canvasSlot = document.getElementById('slotCanvas');
const ctxSlot = canvasSlot.getContext('2d');

// Параметры игры
const columnCount = 4;
const ballsPerColumn = 10;
let ballRadius = 30; // Радиус шара
let columnWidth = canvasSlot.width / columnCount;
const ballSpacing = 10;
let isSpinning = false;

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
        // Активируем событие изменения ориентации
        window.addEventListener('orientationchange', checkOrientation);
        checkOrientation(); // Выполнить проверку сразу при запуске
        console.log('Событие orientationchange активировано');
    } else {
        // Удаляем обработчик события, если блок не видим
        window.removeEventListener('orientationchange', checkOrientation);
        console.log('Событие orientationchange деактивировано');
    }
}

// Инициализация слот-машины после загрузки изображений
export function initSlotMachine() {
    document.getElementById('slotMachineContainer').addEventListener('click', spin);
    resizeCanvas();

    // После инициализации слот-машины активируем проверку ориентации
    setTimeout(() => {
        activateOrientationCheck(); // Проверка ориентации после загрузки игры
    }, 450);

    document.getElementById('spinSlotButton').addEventListener('click', spin);

    // Инициализация колонок (оставляем как в оригинале)
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = {
                imgIndex: i % ballImages.length, // индекс картинки
                y: i * (ballRadius * 2 + ballSpacing) // позиция по Y
            };
            columns[col].push(ball);
        }
    }

    drawColumns();


    // document.getElementById('currentBet').textContent = bet;
    // document.getElementById('scoreValue').textContent = score || 0;
    // checkFirstRun();
    // document.getElementById('balanceValue').textContent = localStorage.getItem('currentScore') || 0;
}

// Функция отрисовки колонок, картинок и фона
function drawColumns() {
    // Сначала рисуем фон
    if (slotBackground.complete) { // Проверяем, загружен ли фон
        ctxSlot.clearRect(0, 0, canvasSlot.width, canvasSlot.height);
        ctxSlot.drawImage(slotBackground, 0, 0, canvasSlot.width, canvasSlot.height);
    }

    // Затем рисуем шары
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = columns[col][i];
            if (ball && ball.imgIndex !== undefined && ballImages[ball.imgIndex]) { // Проверяем, что imgIndex и изображение существуют
                const img = ballImages[ball.imgIndex];
                if (img.complete) { // Проверяем, загружено ли изображение шара
                    const x = col * columnWidth + columnWidth / 2 - ballRadius; // центр колонки по X
                    const y = (ball.y % canvasSlot.height) - ballRadius; // вращаем по высоте холста

                    // Рисуем изображение
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
            columns[col][i].y += speeds[col]; // обновляем позицию Y в зависимости от скорости
        }
    }
}

// Старт анимации
function spin() {
    if (isSpinning) return;
    isSpinning = true;

    speeds = Array(columnCount).fill(10); // задаем одинаковую начальную скорость для всех колонок

    const stopDelays = [1000, 1500, 2000, 2500]; // задержки для остановки каждой колонки

    // Старт обновления анимации
    const animation = setInterval(() => {
        updateColumns();
        drawColumns();
    }, 1000 / 60); // частота обновления 60fps

    // Останавливаем каждую колонку с задержкой
    stopDelays.forEach((delay, index) => {
        setTimeout(() => {
            speeds[index] = 0;
            if (index === columnCount - 1) {
                clearInterval(animation);
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

    // Обновляем позиции шаров после изменения размера
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = columns[col][i];

            if (ball) {
                // Обновляем позицию существующего шара
                ball.y = i * (ballRadius * 2 + ballSpacing);
            }
        }
    }

    drawColumns(); // Перерисовать канвас
}

// Вызвать изменение размера при загрузке страницы
// window.addEventListener('load', resizeCanvas);

// Обновить размеры при изменении размеров окна
// window.addEventListener('resize', resizeCanvas);


// Запуск периодической проверки
setInterval(activateOrientationCheck, 1000); // Периодическая проверка (каждую секунду)
