// --------------------------------------------- //
// --------------- Общие функции --------------- //
// --------------------------------------------- //
export let catchSound = new Audio('res/sounds/catch_ball.m4r');
export let catchSound_2 = new Audio('res/sounds/catch_ball_2.mp3');
export let winSound = new Audio('res/sounds/win.mp3');
export let failSound = new Audio('res/sounds/fail.mp3');
export let selectGameSound = new Audio('res/sounds/select_game.mp3');
export let wheelSpinSound = new Audio('res/sounds/wheel_spin.mp3');
export let wheelSpinSound_2 = new Audio('res/sounds/wheel_spin_2.mp3');
export let selectItemSound = new Audio('res/sounds/select_item_menu.mp3');

import {Browser} from '@capacitor/browser';
import {App} from '@capacitor/app';
import {endGame, gameOver, prepareGame, startGame} from "./bonus";
import {endGameRoulette, gameOverRoulette, setupRoulette} from "./roulette";
import {endGameSlotMachine, gameOverSlotMachine, resizeSlotCanvas, setupSlotMachine} from "./slotMachine";
import {endGamePC, gameOverPC, setupGamePC, startGamePC} from "./planetCatcher";

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    localStorage.setItem('firstRun', 'true');
    checkFirstRunAndLoadData();
    setupAppListeners();
});


function loadBanner() {
    if (window.BannerLoader && typeof window.BannerLoader.loadBanner === "function") {
        window.BannerLoader.loadBanner();
    } else {
        console.log("BannerLoader interface not available.");
    }
}

function checkFirstRunAndLoadData() {
    setTimeout(() => {
        preloader('block');
    }, 1600);

    let acceptPrivacy = localStorage.getItem('acceptPolicy');
    let firstRun = localStorage.getItem('firstRun');

    if (acceptPrivacy) {
        try {
            // Вызов метода для загрузки баннера
            if (firstRun !== 'false') {
                loadBanner();
            }
            setTimeout(() => {
                preloader('none');
            }, 1700);
        } catch (error) {
            console.error('Error fetching JSON:', error);
            navigateTo('mainPage');
        }
    } else {
        setTimeout(() => {
            preloader('none');
        }, 1700);
        document.getElementById('headerMenu').style.display = 'none';
        navigateTo('mainPrivacyPolicePage');
    }
}

export function preloader(status) {
    document.getElementById('overlay').style.display = status;
    document.getElementById('preloader').style.display = status;
}

function setupAppListeners() {
    App.addListener('appStateChange', (state) => {
        if (state.isActive) {
            // Приложение было открыто (активировано)
            console.log('Приложение активировано.');
            localStorage.setItem('firstRun', 'true');
            checkFirstRunAndLoadData();
        } else {
            // Приложение было свернуто или перешло в фоновый режим
            console.log('Приложение в фоновом режиме.');
        }
    });
}

export function vibrate(duration) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
        console.log('Vibration API is supported.');
    } else {
        console.log('Vibration API is not supported.');
    }
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
    .addEventListener('click', () => {
        navigateTo('gameContainer', getCurrentGame());
});

document.getElementById('failMenuButton')
    .addEventListener('click', () =>
        navigateTo('gameContainer', getCurrentGame())
    );

document.getElementById('play')
    .addEventListener('click', () => {
        selectItemSound.play();
        startGame();
    });

document.getElementById('playPC')
    .addEventListener('click', () => {
        selectItemSound.play();
        startGamePC();
    });

document.getElementById('minusBet')
    .addEventListener('click', () => {
        selectItemSound.play();
        minusBet('currentBet');
    });

document.getElementById('plusBet')
    .addEventListener('click', () => {
        selectItemSound.play();
        plusBet('currentBet')
    });

document.getElementById('minusBetRoulette')
    .addEventListener('click', () => {
        selectItemSound.play();
        minusBet('currentBetRoulette')
    });

document.getElementById('plusBetRoulette')
    .addEventListener('click', () => {
        selectItemSound.play();
        plusBet('currentBetRoulette')
    });

document.getElementById('minusBetSlot')
    .addEventListener('click', () => {
        selectItemSound.play();
        minusBet('currentBetSlot');
    });

document.getElementById('plusBetSlot')
    .addEventListener('click', () => {
        selectItemSound.play();
        plusBet('currentBetSlot');
    });

export function setCurrentGame(currentGame) {
    localStorage.setItem('currentGame', currentGame);
}

export function getCurrentGame() {
    return localStorage.getItem("currentGame");
}

export function navigateTo(...args) {
    selectItemSound.play();
    preloader('block');

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
        showHidePage(args[0]);
    } else {
        switch (args[1]) {
            case 'bonus':
                console.log('bonus game');
                showHidePage('gameContainer');
                prepareGame();
                break;
            case 'roulette':
                console.log('roulette game');
                showHidePage('rouletteContainer');
                setupRoulette();
                break;
            case 'planetCatcher':
                console.log('planetCatcher game');
                showHidePage('gameContainer');
                setupGamePC();
                break;
            case 'slotMachine':
                console.log('slotMachine game');
                showHidePage('slotMachineContainer');
                setupSlotMachine();
                break;
            default:
                console.log('default')
                showHidePage('mainPage');
        }
    }
}

function showHidePage(page) {
    setTimeout(() => {
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => page.style.display = 'none');

        // Показать выбранную страницу
        document.getElementById(page).style.display = 'block';

        // Скрыть затемнитель и прелоадер
        preloader('none');

        showHideHomeButton(page);
    }, 500);
    if (page === 'slotMachine') {
        resizeSlotCanvas();
    }
}

function showHideHomeButton(page) {
    if (page === 'mainPage') {
        localStorage.setItem('firstRun', 'false');
        document.getElementById('homeButton').style.display = 'none';
    } else {
        document.getElementById('homeButton').style.display = 'block';
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
}

// очистка данных
document.getElementById('annualDataButton').addEventListener('click', () => {
    selectItemSound.play();
    // Очищаем localStorage
    localStorage.clear();
    showMessage('Data successfully reset!');

    // открываем подтверждение политики
    setTimeout(() => {
        document.getElementById('headerMenu').style.display = 'none';
        navigateTo('mainPrivacyPolicePage');
    }, 2200); // 2 секунды
});

// открыть политику
document.getElementById('privatePolicyButton').addEventListener('click', () => {
    selectItemSound.play();
    navigateTo('privacyPolicePage');
});

// читать политику
document.getElementById('privatePolicyRead').addEventListener('click', async () => {
    selectItemSound.play();
    try {
        await Browser.open({ url: 'https://cosmicdog.online/' });
    } catch (e) {
        console.error('Error opening browser:', e);
    }
});

// читать политику
document.getElementById('mainPrivatePolicyRead').addEventListener('click', async () => {
    selectItemSound.play();
    try {
        await Browser.open({ url: 'https://cosmicdog.online/' });
    } catch (e) {
        console.error('Error opening browser:', e);
    }
});

// подтвердить политику
document.getElementById('privatePolicyAccept').addEventListener('click', () => {
    selectItemSound.play();
    let acceptPolicy = localStorage.getItem("acceptPolicy");
    if (!acceptPolicy) {
        localStorage.setItem('acceptPolicy', 'true');
        showMessage('Policy successfully accept!');
    }
    navigateTo('mainPage');
    document.getElementById('headerMenu').style.display = 'block';

    localStorage.setItem('currentScore', deposit);
    localStorage.setItem('firstRun', 'true');
    checkFirstRunAndLoadData();
});

App.addListener('backButton', ({ canGoBack }) => {
    const currentPage = getCurrentPage(); // Предполагаемая функция, возвращающая текущую страницу

    if (currentPage === 'mainPage' || currentPage === 'mainPrivacyPolicePage') {
    // Если пользователь находится на главной странице или странице политики, сворачиваем приложение
        localStorage.setItem('firstRun', 'true');
        App.minimizeApp();
    } else {
       // Если пользователь не на главной странице, переходим на нее
        navigateTo('mainPage');
    }
});

function getCurrentPage() {
    // Получаем все элементы с классом 'page'
    const pages = document.querySelectorAll('.page');

    // Проходим по каждому элементу
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Проверяем, виден ли элемент (не имеет display: none)
        if (window.getComputedStyle(page).display !== 'none') {
            // Возвращаем ID видимой страницы
            return page.id;
        }
    }

    // Если ничего не найдено, возвращаем null или другое значение по умолчанию
    return null;
}

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