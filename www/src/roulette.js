
// --------------------------------------------- //
// ------------------ Рулетка ------------------ //
// --------------------------------------------- //

import {
    bet,
    // checkFirstRun,
    navigateTo,
    saveScore, selectItemSound,
    setCurrentGame,
    wheelSpinSound,
    wheelSpinSound_2,
    winSound
} from "./main";

const rouletteSegments = [2, 200, 5000, 400, 500, 600, 1.5, 800];
let rouletteCanvas, rouletteCtx;
let isSpinning = false; // Флаг для отслеживания вращения рулетки
let score = 0;
export let gameOverRoulette = false; // Флаг для отслеживания состояния игры

const rouletteImage = new Image();
rouletteImage.src = 'res/roulette-image.png'; // Замените на путь к вашему изображению

const roulettePointerImage = new Image();
roulettePointerImage.src = 'res/pointer.png'; // Замените на путь к вашему изображению

export function setupRoulette() {
    rouletteCanvas = document.getElementById('rouletteCanvas');
    rouletteCtx = rouletteCanvas.getContext('2d');

    drawRoulette(); // Отрисовываем рулетку

    // Отрисовываем стрелку поверх рулетки, чтобы она оставалась зафиксированной
    drawPointer();

    document.getElementById('spinButton').addEventListener('click', spinRoulette);

    document.getElementById('currentBetRoulette').textContent = bet;
    document.getElementById('scoreValueRoulette').textContent = score || 0;
    // checkFirstRun();
    document.getElementById('balanceValueRoulette').textContent = localStorage.getItem('currentScore') || 0;
}

// Величина поворота в радианах
const rotationAngle = 22.5 * (Math.PI / 180);

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
    const pointerSize = 20; // Размер изображения стрелки

    // Убедитесь, что изображение стрелки загружено перед отрисовкой
    if (roulettePointerImage.complete) {
        rouletteCtx.drawImage(
            roulettePointerImage,
            pointerX - pointerSize / 2, // Центрируем изображение по оси X
            pointerY, // Стрелка у верхней части рулетки
            30, // Ширина стрелки
            75 // Высота стрелки
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

// Функция для запуска вращения рулетки
function spinRoulette() {
    selectItemSound.play();
    if (isSpinning) return; // Блокируем повторное вращение
    isSpinning = true;
    gameOverRoulette = false;

    wheelSpinSound_2.play();

    const spinDuration = 4000; // Время вращения в миллисекундах
    const segmentAngle = 360 / rouletteSegments.length; // Угол одного сектора

    // Выбираем случайный выигрышный сегмент
    const winningSegment = Math.floor(Math.random() * rouletteSegments.length);

    // Рассчитываем угол, на который нужно повернуть рулетку, чтобы выигрышный сектор оказался вверху
    const targetAngle = winningSegment * segmentAngle;

    // Для корректного отображения поворачиваем на 90 градусов влево
    const adjustedTargetAngle = (targetAngle + 22.5) % 360; // Добавляем 90 градусов и нормализуем угол

    // Рассчитываем полный угол вращения рулетки
    // Вращаем на несколько полных оборотов + на нужный угол
    const totalSpinAngle = 360 * 3 + (360 - adjustedTargetAngle); // 3 полных оборота + до нужного сектора

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
            isSpinning = false;
            if(!gameOverRoulette) {
                endGameRoulette(winningSegment); // Вывод результата
            }
        }
    }

    requestAnimationFrame(animate); // Запуск анимации
}

export function endGameRoulette(winningSegment, isInterrupted = false) {
    if (isInterrupted) {
        gameOverRoulette = true;
        return;
    }

    let result;
    let currentBet = parseFloat(document.getElementById('currentBetRoulette').innerText);

    score = rouletteSegments[winningSegment]

    if (score === 2 || score === 1.5) {
        result = parseFloat(score) * currentBet;
    } else {
        result = parseFloat(score) + currentBet;
    }

    let newScore = parseInt(localStorage.getItem('currentScore')) + score + result; // Сохраняем текущий результат
    saveScore(newScore);

    const finalScore = document.getElementById('finalScore');
    finalScore.textContent = `+${result}`;

    gameOverRoulette = true; // Игра завершена
    setCurrentGame('roulette');
    setTimeout(() => {
        winSound.play();
        navigateTo('winPage'); // Перенаправляем на страницу победы
    }, 800);
}
