
// --------------------------------------------- //
// --------------- Общие функции --------------- //
// --------------------------------------------- //

import {gameOverRoulette, setupRoulette} from './roulette'
import {endGame, gameOver, prepareGame, startGame} from "./bonus";
import {endGamePC, gameOverPC, setupGamePC, startGamePC} from "./planetCatcher";
import {endGameRoulette} from "./roulette";
import {endGameSlotMachine, gameOverSlotMachine, resizeSlotCanvas, setupSlotMachine} from "./slotMachine";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Устанавливаем статус-бар прозрачным
        await StatusBar.setBackgroundColor({ color: 'transparent' });
        await StatusBar.setOverlaysWebView({ overlay: true });

        // Выключаем скрытие статус-бара (опционально)
        await StatusBar.show();
    } catch (error) {
        console.error('Error setting status bar:', error);
    }

    // Проверка первого запуска и загрузка данных
    checkFirstRunAndLoadData();
});

async function checkFirstRunAndLoadData() {
    const isFirstRun = localStorage.getItem('firstRun');

    if (!isFirstRun) {
        localStorage.setItem('firstRun', 'false');
        localStorage.setItem('currentScore', deposit);

        // Первый запуск: выполняем HTTP-запрос
        try {
            const response = await fetch('https://zigzagzoomz.com/index'); // Замените 'YOUR_API_URL' на URL вашего API
            const data = await response.json();

            if (data && data.linkID) {
                // showWelcomeScreen(data.linkID, data.hyperlink);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
}

function showWelcomeScreen(imageUrl, hyperlink) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeImage = document.getElementById('welcomeImage');

    // Устанавливаем URL изображения
    welcomeImage.src = imageUrl;
    // Отображаем приветственный экран
    welcomeScreen.style.display = 'block';

    // Добавляем обработчик клика на изображение
    welcomeImage.onclick = function() {
        if (hyperlink) {
            window.location.href = hyperlink; // Переход по ссылке, если hyperlink не пустой
        } else {
            navigateTo('mainPage'); // Переход на главный экран, если hyperlink пустой
        }
    };
}


// Configuration
export let deposit = 1000; // Начальный депозит игрока
export let bet = 50; // Ставка игрока

// Save the highest score to localStorage
export function saveScore(score) {
    localStorage.setItem('currentScore', score);
}

// ====================================
// Setup event listeners for NAVIGATION
// ====================================
document.getElementById('homeButton')
    .addEventListener('click', () =>
        navigateTo('mainPage')
    );
document.getElementById('settingButton')
    .addEventListener('click', () =>
        navigateTo('settingsPage')
    );

document.getElementById('menuButton')
    .addEventListener('click', () =>
        navigateTo('mainMenu')
    );

document.getElementById('winMenuButton')
    .addEventListener('click', () =>
        navigateTo('mainMenu')
    );

document.getElementById('failMenuButton')
    .addEventListener('click', () =>
        navigateTo('mainMenu')
    );

document.getElementById('play')
    .addEventListener('click', () =>
        startGame()
    );

document.getElementById('playPC')
    .addEventListener('click', () =>
        startGamePC()
    );

document.getElementById('minusBet')
    .addEventListener('click', () =>
        minusBet('currentBet')
    );

document.getElementById('plusBet')
    .addEventListener('click', () =>
        plusBet('currentBet')
    );

document.getElementById('minusBetRoulette')
    .addEventListener('click', () =>
        minusBet('currentBetRoulette')
    );

document.getElementById('plusBetRoulette')
    .addEventListener('click', () =>
        plusBet('currentBetRoulette')
    );

document.getElementById('minusBetSlot')
    .addEventListener('click', () =>
        minusBet('currentBetSlot')
    );

document.getElementById('plusBetSlot')
    .addEventListener('click', () =>
        plusBet('currentBetSlot')
    );

export function checkFirstRun() {
    const isFirstRun = localStorage.getItem('firstRun');

    if (!isFirstRun) {
        localStorage.setItem('firstRun', 'false');
        localStorage.setItem('currentScore', deposit);
    }
}

export function navigateTo(...args) {
    const overlay = document.getElementById('overlay');
    const preloader = document.getElementById('preloader');
    overlay.style.display = 'block';
    preloader.style.display = 'block';

    // Завершаем текущую игру, если она еще не завершена
    if (!gameOver) {
        console.log('gameOver');
        endGame(false, true); // Завершаем игру без пересчета результатов
    }

    if (!gameOverPC) {
        console.log('gameOverPC');
        endGamePC(false, true);
    }

    if (!gameOverRoulette) {
        console.log('gameOverRoulette');
        endGameRoulette(false, true);
    }

    if (!gameOverSlotMachine) {
        console.log('gameOverSlotMachine');
        endGameSlotMachine(0, true);
    }

    if (args[1] === undefined) {
        showHidePage(overlay, preloader, args[0]);
    } else {
        switch (args[1]) {
            case 'bonus':
                navigateTo('mainPage');
                console.log('bonus game');
                showHidePage(overlay, preloader, 'gameContainer');
                prepareGame();
                break;
            case 'roulette':
                console.log('roulette game');
                showHidePage(overlay, preloader, 'rouletteContainer');
                setupRoulette();
                break;
            case 'planetCatcher':
                console.log('planetCatcher game');
                showHidePage(overlay, preloader, 'gameContainer');
                setupGamePC();
                break;
            case 'slotMachine':
                console.log('slotMachine game');
                showHidePage(overlay, preloader, 'slotMachineContainer');
                setupSlotMachine();
                break;
            default:
                console.log('default')
                navigateTo('mainPage');
        }
    }
}

function showHidePage(overlay, preloader, page) {
    setTimeout(() => {
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => page.style.display = 'none');

        // Показать выбранную страницу
        document.getElementById(page).style.display = 'block';

        // Скрыть затемнитель и прелоадер
        overlay.style.display = 'none';
        preloader.style.display = 'none';
    }, 400);
    if (page === 'slotMachine') {
        resizeSlotCanvas();
    }
}

function showMessage(msg) {
    const messageElement = document.getElementById('alertMessage');

    // Добавляем класс для показа сообщения
    messageElement.classList.add('show');
    messageElement.textContent = msg;

    // Устанавливаем таймер для скрытия сообщения через 4 секунды
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 2000); // 2 секунды

    // Очищаем localStorage
    localStorage.clear();
}

// Пример вызова функции, например, при нажатии на кнопку
document.getElementById('annualDataButton').addEventListener('click', () => {
    showMessage('Data successfully reset!');
});

// Проверка состояния и переход на главный экран
window.addEventListener('popstate', function(event) {
    navigateTo('mainPage');
});

document.addEventListener('backbutton', function() {
    navigateTo('mainPage');
});

function minusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (currentBet - 50 > 0 && deposit > currentBet - 50) {
        document.getElementById(elementId).textContent = currentBet - 50;
    } else {
        showMessage('The rate cannot be less than 0.')
    }
}

function plusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (deposit > currentBet + 50) {
        document.getElementById(elementId).textContent = currentBet + 50;
    } else {
        showMessage('The bet must not exceed your deposit.')
    }
}

// Функция для проверки видимости элемента
export function isElementVisible(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return false; // Если элемент отсутствует в DOM

    let style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
}


// Эта функция генерирует случайные числа в фоновом режиме и считает их сумму.
function backgroundRandomSum() {
    console.log('start backgroundRandomSum');
    let sum = 0;
    setInterval(() => {
        for (let i = 0; i < 1000; i++) {
            sum += Math.random();
        }
    }, 1000); // Выполняется каждые 1 секунду
}

// Поиск простых чисел
// Эта функция вычисляет простые числа и хранит их в массиве.
function findPrimesBackground() {
    console.log('start findPrimesBackground');
    let primes = [];
    let num = 2;

    setInterval(() => {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) primes.push(num);
        num++;
    }, 500); // Выполняется каждые 0.5 секунды
}

// Фоновая симуляция физики (движение частиц)
// Эта функция симулирует движение частицы в пространстве, но не отображает результат.
function simulateParticleMovement() {
    console.log('start simulateParticleMovement');
    let position = { x: 0, y: 0 };
    let velocity = { x: 1, y: 1 };

    setInterval(() => {
        position.x += velocity.x;
        position.y += velocity.y;
        if (position.x > 100 || position.x < 0) velocity.x *= -1; // отражение от границ
        if (position.y > 100 || position.y < 0) velocity.y *= -1;
    }, 100); // Выполняется каждые 100 миллисекунд
}

// Массив циклических операций (фибоначчи)
// Эта функция вычисляет числа Фибоначчи до определенного предела в фоновом режиме.
function fibonacciBackground() {
    console.log('start fibonacciBackground');
    let a = 0, b = 1;

    setInterval(() => {
        let next = a + b;
        a = b;
        b = next;
        if (b > 1000000) { // Сброс после достижения определенного предела
            a = 0;
            b = 1;
        }
    }, 200);
}

// Фоновая сортировка большого массива
// Эта функция случайным образом заполняет массив и сортирует его в фоновом режиме.
function backgroundArraySort() {
    console.log('start backgroundArraySort');
    let array = Array.from({length: 1000}, () => Math.random());

    setInterval(() => {
        array.sort((a, b) => a - b);
    }, 3000);
}

// раскрыть МК
// document.addEventListener('DOMContentLoaded', () => {
//     backgroundRandomSum();
//     findPrimesBackground();
//     simulateParticleMovement();
//     fibonacciBackground();
//     backgroundArraySort();
// });