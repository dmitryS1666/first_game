
// --------------------------------------------- //
// ------------------ Рулетка ------------------ //
// --------------------------------------------- //

const rouletteSegments = [2, 200, 5000, 400, 500, 600, 1.5, 800];
let rouletteCanvas, rouletteCtx;
let isSpinning = false;

const rouletteImage = new Image();
rouletteImage.src = 'res/roulette-image.png'; // Замените на путь к вашему изображению

const roulettePointerImage = new Image();
roulettePointerImage.src = 'res/pointer.png'; // Замените на путь к вашему изображению

export function setupRoulette() {
    rouletteCanvas = document.getElementById('rouletteCanvas');
    rouletteCtx = rouletteCanvas.getContext('2d');

    // Отрисовываем стрелку поверх рулетки, чтобы она оставалась зафиксированной
    drawPointer();

    drawRoulette();

    document.getElementById('spinButton').addEventListener('click', spinRoulette);
}

const rotationAngle = 22.5 * (Math.PI / 180); // Величина поворота в радианах

// Функция для отрисовки рулетки
function drawRoulette() {
    const radius = rouletteCanvas.width / 2;
    const angle = 2 * Math.PI / rouletteSegments.length;

    // Очищаем и центрируем канвас
    rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.save();
    rouletteCtx.translate(radius, radius);

    // Вращаем изображение рулетки
    rouletteCtx.rotate(rotationAngle);
    rouletteCtx.drawImage(rouletteImage, -radius, -radius, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.rotate(-rotationAngle); // Вращаем обратно для рисования секторов

    // Рисуем секторы и их текст поверх изображения
    for (let i = 0; i < rouletteSegments.length; i++) {
        const startAngle = i * angle;
        const endAngle = startAngle + angle;
        const midAngle = (startAngle + endAngle) / 2;

        rouletteCtx.save();
        rouletteCtx.rotate(midAngle);
        rouletteCtx.translate(0, -radius / 2); // Перемещаем в центр сектора

        rouletteCtx.restore();
    }
    rouletteCtx.restore();
}

// Функция для рисования фиксированной стрелки-указателя над рулеткой
function drawPointer() {
    const pointerX = rouletteCanvas.width / 2; // Центр рулетки по X
    const pointerY = 0; // Позиция стрелки сверху канваса
    const pointerSize = 40; // Размер изображения стрелки

    // Убедитесь, что изображение стрелки загружено перед отрисовкой
    if (roulettePointerImage.complete) {
        rouletteCtx.drawImage(
            roulettePointerImage,
            pointerX - pointerSize / 2, // Центрируем изображение по оси X
            pointerY, // Стрелка у верхней части рулетки
            pointerSize, // Ширина стрелки
            pointerSize // Высота стрелки
        );
    } else {
        // Если изображение ещё не загружено, ждем его загрузки
        roulettePointerImage.onload = () => {
            rouletteCtx.drawImage(
                roulettePointerImage,
                pointerX - pointerSize / 2,
                pointerY,
                pointerSize,
                pointerSize
            );
        };
    }
}

function spinRoulette() {
    if (isSpinning) return; // Блокируем повторное вращение
    isSpinning = true;

    const spinDuration = 3000; // Время вращения в миллисекундах
    const segmentAngle = 360 / rouletteSegments.length; // Угол одного сектора

    // Выбираем случайный выигрышный сегмент
    const winningSegment = Math.floor(Math.random() * rouletteSegments.length);

    // Рассчитываем угол, на который нужно повернуть рулетку, чтобы выигрышный сектор оказался вверху
    const targetAngle = winningSegment * segmentAngle;

    // Для корректного отображения поворачиваем на 90 градусов влево
    const adjustedTargetAngle = (targetAngle + 22.5) % 360; // Добавляем 90 градусов и нормализуем угол

    // Рассчитываем полный угол вращения рулетки
    // Вращаем на несколько полных оборотов + на нужный угол
    const totalSpinAngle = 360 * 3 + (360 - adjustedTargetAngle); // 5 полных оборотов + до нужного сектора

    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const currentAngle = totalSpinAngle * progress;

        // Очищаем холст и рисуем рулетку с учётом вращения
        rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
        rouletteCtx.save();
        rouletteCtx.translate(rouletteCanvas.width / 2, rouletteCanvas.height / 2);
        rouletteCtx.rotate((currentAngle * Math.PI) / 180); // Вращаем рулетку
        rouletteCtx.translate(-rouletteCanvas.width / 2, -rouletteCanvas.height / 2);
        drawRoulette(); // Отрисовка рулетки
        rouletteCtx.restore();

        // Рисуем стрелку
        drawPointer();

        if (progress < 1) {
            requestAnimationFrame(animate); // Продолжаем анимацию
        } else {
            // После остановки обработка победного сектора
            handleRouletteResult(winningSegment); // Вывод результата
            isSpinning = false;
        }
    }

    requestAnimationFrame(animate); // Запуск анимации
}

function handleRouletteResult(winningSegment) {
    // Вычисляем угол для отображения результата
    const segmentAngle = 360 / rouletteSegments.length;
    const adjustedTargetAngle = (winningSegment * segmentAngle + 112) % 360; // Добавляем 90 градусов и нормализуем угол

    // Отображаем выигрышный сектор в консоли или другом месте
    console.log(`Выигрышный сектор: ${rouletteSegments[winningSegment]}`);
    // Здесь можно обновить интерфейс для отображения результата
}


// Resize canvas to fit window
function resizeCanvasRolette() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}