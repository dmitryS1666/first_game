import { bet, checkFirstRun, checkOrientation, isElementVisible } from "./main";

const canvasSlot = document.getElementById('slotCanvas');
const ctxSlot = canvasSlot.getContext('2d');

// Параметры игры
const columnCount = 4;
const ballsPerColumn = 10; // Увеличено для хранения всех шаров
let ballRadius = 30; // Радиус шара
let columnWidth = canvasSlot.width / columnCount;
const ballSpacing = 15;
let isSpinning = false;
let score = 0;

const topMargin = 30;
const bottomMargin = 35;
const visibleBallCount = 3; // Количество видимых шаров
const ballTotalHeight = ballRadius * 2 + ballSpacing;

// Массив с именами картинок
const ballImageNames = [
    'blue_ball.png',
    'brown_ball.png',
    'yellow_ball.png',
    'indigo_ball.png',
    'orange_ball.png',
    'pink_ball.png',
];

// Массив для загрузки изображений
const ballImages = [];

// Шары в каждой колонке
const columns = Array.from({ length: columnCount }, () => []);

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
                imgName: ballImageNames[i % ballImageNames.length], // Сохраняем имя изображения
                y: i * ballTotalHeight // Располагаем шары за пределами видимой области
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
        const visibleStartY = topMargin;
        const visibleEndY = canvasSlot.height - bottomMargin;

        for (let i = 0; i < ballsPerColumn; i++) {
            const ball = columns[col][i];
            if (ball && ball.imgIndex !== undefined && ballImages[ball.imgIndex]) {
                const img = ballImages[ball.imgIndex];
                if (img.complete) {
                    const x = col * columnWidth + columnWidth / 2 - ballRadius;
                    const y = ball.y % (ballsPerColumn * ballTotalHeight) - ballRadius;

                    // Определение видимости шара
                    const isVisible = y + ballRadius >= visibleStartY && y + ballRadius <= visibleEndY;

                    // Установка прозрачности
                    ctxSlot.globalAlpha = isVisible ? 1.0 : 0.0;
                    ctxSlot.drawImage(img, x, y, ballRadius * 2, ballRadius * 2);
                }
            }
        }
    }

    // Возврат прозрачности в стандартное состояние
    ctxSlot.globalAlpha = 1.0;
}

// Функция обновления позиции шаров
function updateColumns() {
    for (let col = 0; col < columnCount; col++) {
        for (let i = 0; i < ballsPerColumn; i++) {
            columns[col][i].y += speeds[col];
        }
    }
}

// Плавное выравнивание
function smoothStopOnLine(columnIndex) {
    const visibleHeight = canvasSlot.height - topMargin - bottomMargin;
    const ballTotalHeight = ballRadius * 2 + ballSpacing;
    const visibleBallHeight = ballTotalHeight * visibleBallCount;

    // Определяем конечные позиции для всех шаров в колонке
    const column = columns[columnIndex];
    column.forEach(ball => {
        const ballHeight = ballRadius * 2 + ballSpacing;
        let correctedY = ball.y - topMargin;
        correctedY = Math.floor(correctedY / ballHeight) * ballHeight + topMargin;
        ball.finalY = correctedY + topMargin; // Сохраняем целевую позицию
    });

    let animationFrame = 0;
    const maxFrames = 30;
    const animationInterval = 1000 / 60; // 60 fps

    const animation = setInterval(() => {
        animationFrame++;
        const progress = animationFrame / maxFrames;

        if (progress >= 1) {
            clearInterval(animation);
            // Устанавливаем окончательные позиции
            columns[columnIndex].forEach(ball => {
                ball.y = ball.finalY;
            });
            drawColumns(); // Перерисовать с обновленными позициями
            return;
        }

        // Плавная интерполяция
        columns[columnIndex].forEach(ball => {
            ball.y = ball.y + (ball.finalY - ball.y) * progress;
        });

        drawColumns(); // Перерисовать с текущими позициями
    }, animationInterval);
}

// Проверка второй линии и вывод информации о шарах
function endGame() {
    const ballHeight = ballRadius * 2 + ballSpacing;
    const secondLineY = topMargin + ballHeight; // Y-положение второй строки
    const visibleStartY = topMargin;
    const visibleEndY = canvasSlot.height - bottomMargin;

    // Сформируем строку с именами изображений шаров во второй строке, которые видны
    let resultMessage = '';

    for (let col = 0; col < columnCount; col++) {
        const ballsInColumn = columns[col];
        const visibleBalls = ballsInColumn.filter(ball => {
            const y = ball.y % (ballsPerColumn * ballTotalHeight) - ballRadius;
            // Проверяем, находится ли шар во второй строке и в видимой области
            return y >= secondLineY - ballRadius && y <= secondLineY + ballRadius &&
                y + ballRadius >= visibleStartY && y - ballRadius <= visibleEndY;
        });

        // Добавляем имена видимых шаров во второй строке к результату
        if (visibleBalls.length > 0) {
            resultMessage += `Column ${col + 1}: ${visibleBalls.map(ball => `${ball.imgName}`).join(', ')}\n`;
        }
    }

    // Выводим результат в консоль, если есть видимые шары
    if (resultMessage) {
        console.log(resultMessage.trim());
    } else {
        console.log('No balls in the second line are visible.');
    }
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
            smoothStopOnLine(index); // Плавная корректировка и остановка
            if (index === columnCount - 1) {
                setTimeout(() => {
                    clearInterval(animation);
                    isSpinning = false;
                    endGame(); // Проверка второй линии после остановки
                }, 100); // Небольшая задержка для плавности
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
    canvasSlot.height = canvasHeight;  // Оставляем высоту канваса неизменной

    columnWidth = canvasSlot.width / columnCount;
    ballRadius = canvasWidth / 20;

    // Перерисовать колонки
    drawColumns();
}

setInterval(activateOrientationCheck, 1000);
