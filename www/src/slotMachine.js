const canvasSlot = document.getElementById('slotCanvas');
const ctxSlot = canvasSlot.getContext('2d');

// Параметры игры
const columnCount = 4;
const ballsPerColumn = 10;
const ballRadius = 30; // Радиус шара
const columnWidth = canvasSlot.width / columnCount;
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

// Инициализация слот-машины после загрузки изображений
export function initSlotMachine() {
    document.getElementById('spinSlotButton').addEventListener('click', spin);

    // Инициализация колонок
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
