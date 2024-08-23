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

// Колонки, которые должны быть подсвечены
let highlightedColumns = [];

// Массив с именами картинок
const ballImageNames = [
    'blue_ball.png',
    'brown_ball.png',
    'yellow_ball.png',
    'indigo_ball.png',
    'orange_ball.png',
    'pink_ball.png',
];

// Шары в каждой колонке
const columns = Array.from({ length: columnCount }, () => []);

// Скорость вращения колонок
let speeds = Array(columnCount).fill(0);

// Создаем переменную для фонового изображения
let slotBackground;

// Массив для загрузки изображений
const ballImages = [];

// Функция для загрузки изображений
function loadImages(callback) {
    let imagesLoaded = 0;

    // Загрузка фонового изображения
    slotBackground = new Image();
    slotBackground.src = 'res/slotBg.png';  // путь к загруженному фону
    slotBackground.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === ballImageNames.length) { // проверка на количество загруженных изображений
            callback();
        }
    };

    // Загрузка изображений шариков и эффектов
    ballImageNames.forEach((name, index) => {
        const img = new Image();
        img.src = `res/balls/${name}`;
        img.onload = () => {
            ballImages[index] = img;
            imagesLoaded++;
            if (imagesLoaded === ballImageNames.length) {
                callback();
            }
        };
    });
}

// Функция для подсветки совпадений
function highlightMatches(ballCounts) {
    highlightedColumns = [];

    // Определяем, какие колонки нужно подсветить
    for (let col = 0; col < columnCount; col++) {
        const count = ballCounts[columns[col][0].imgName] || 0;
        if (count >= 2) {
            highlightedColumns.push(col);
        }
    }

    drawColumns(); // Перерисовать с подсветкой
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

    // setTimeout(() => {
    //     activateOrientationCheck();
    // }, 450);

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

        // Проверяем, есть ли подсветка для текущей колонки
        const isHighlighted = highlightedColumns.includes(col);

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

                    // Рисуем фоновое изображение для подсветки линии
                    if (isHighlighted && isVisible) {
                        ctxSlot.drawImage(ballImages[ballImageNames.length - 2], col * columnWidth, visibleStartY, columnWidth, visibleEndY - visibleStartY); // `flash_line.png`
                    }

                    // Рисуем само изображение шара
                    ctxSlot.drawImage(img, x, y, ballRadius * 2, ballRadius * 2);

                    // Рисуем подсветку для ячейки, если нужно
                    if (isHighlighted && isVisible) {
                        ctxSlot.drawImage(ballImages[ballImageNames.length - 1], x, y, ballRadius * 2, ballRadius * 2); // `flash.png`
                    }
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
// Получение видимых шаров во второй линии
// Получение видимых шаров во второй линии
function getVisibleBallsInSecondLine() {
    const ballHeight = ballRadius * 2 + ballSpacing;
    const secondLineY = topMargin + ballHeight;
    const visibleStartY = topMargin;
    const visibleEndY = canvasSlot.height - bottomMargin;

    const ballCounts = {}; // Пример: { 'blue_ball.png': 2, 'pink_ball.png': 1 }
    const ballNames = {};  // Для хранения имен шаров и их количества во второй строке

    for (let col = 0; col < columnCount; col++) {
        const ballsInColumn = columns[col];
        const visibleBalls = ballsInColumn.filter(ball => {
            const y = ball.y % (ballsPerColumn * ballTotalHeight) - ballRadius;
            // Проверяем, находится ли шар во второй строке и в видимой области
            return y >= secondLineY - ballRadius && y <= secondLineY + ballRadius &&
                y + ballRadius >= visibleStartY && y - ballRadius <= visibleEndY;
        });

        visibleBalls.forEach(ball => {
            const ballName = ball.imgName;
            if (ballCounts[ballName]) {
                ballCounts[ballName]++;
            } else {
                ballCounts[ballName] = 1;
            }

            // Заполняем ballNames для отображения информации
            if (!ballNames[col]) {
                ballNames[col] = [];
            }
            ballNames[col].push(ballName);
        });
    }

    return { ballCounts, ballNames };
}

// Вывод информации о шарах и вычисление коэффициента умножения
function calculateMultiplier(ballCounts) {
    let multiplier = 0;

    // Проверяем количество видимых шаров и считаем коэффициент умножения
    Object.values(ballCounts).forEach(count => {
        if (count >= 2) {
            switch (count) {
                case 2:
                    multiplier += 0.75;
                    break;
                case 3:
                    multiplier += 1.5;
                    break;
                case 4:
                    multiplier += 2;
                    break;
            }
        }
    });

    // Проверка на бонусный шар
    if (multiplier > 0 && ballCounts['pink_ball.png']) {
        multiplier *= 3; // Умножаем на 3, если есть бонусный шар
    }

    return multiplier;
}

// Отображение результата и информации о найденных шарах
function displayResult(ballNames, multiplier) {
    if (multiplier > 0) {
        console.log('You win! Multiplier:', multiplier);
    } else {
        console.log('You lose.');
    }

    // Вывод информации о шарах во второй строке
    Object.entries(ballNames).forEach(([col, names]) => {
        console.log(`Column ${parseInt(col) + 1}: ${names.join(', ')}`);
    });
}

// Основной метод для завершения игры
function endGame() {
    const { ballCounts, ballNames } = getVisibleBallsInSecondLine();
    const multiplier = calculateMultiplier(ballCounts);

    // Подсвечиваем совпадения
    // highlightMatches(ballCounts);

    // Отображаем результат
    displayResult(ballNames, multiplier);
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

// setInterval(activateOrientationCheck, 1000);
