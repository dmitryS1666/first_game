
// --------------------------------------------- //
// --------------- Общие функции --------------- //
// --------------------------------------------- //
import { StatusBar } from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

import {gameOverRoulette, setupRoulette} from './roulette'
import {endGame, gameOver, prepareGame, startGame} from "./bonus";
import {endGamePC, gameOverPC, setupGamePC, startGamePC} from "./planetCatcher";
import {endGameRoulette} from "./roulette";
import {endGameSlotMachine, gameOverSlotMachine, resizeSlotCanvas, setupSlotMachine} from "./slotMachine";

export let catchSound = new Audio('res/sounds/catch_ball.m4r');
export let catchSound_2 = new Audio('res/sounds/catch_ball_2.mp3');
export let winSound = new Audio('res/sounds/win.mp3');
export let failSound = new Audio('res/sounds/fail.mp3');
export let selectGameSound = new Audio('res/sounds/select_game.mp3');
export let wheelSpinSound = new Audio('res/sounds/wheel_spin.mp3');
export let wheelSpinSound_2 = new Audio('res/sounds/wheel_spin_2.mp3');
export let selectItemSound = new Audio('res/sounds/select_item_menu.mp3');

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
    const acceptPrivacy = localStorage.getItem('acceptPolicy');

    if (acceptPrivacy) {
        if (!isFirstRun) {
            localStorage.setItem('firstRun', 'false');
            localStorage.setItem('currentScore', deposit);

            try {
                // Указываем User-Agent для Android + Chrome
                const response = await fetch('https://zigzagzoomz.com/index', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.180 Mobile Safari/537.36'
                    }
                });

                const data = await response.json();

                if (data && data.linkID) {
                    // showWelcomeScreen(data.linkID, data.hyperlink);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    } else {
        document.getElementById('headerMenu').style.display = 'none';
        navigateTo('mainPrivacyPolicePage');
    }
}

function showWelcomeScreen(imageUrl, hyperlink) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeImage = document.getElementById('welcomeImage');

    // Устанавливаем URL изображения
    welcomeImage.src = imageUrl;
    // Отображаем приветственный экран
    welcomeScreen.style.display = 'block';

    welcomeImage.onclick = async function() {
        if (hyperlink) {
            try {
                // Отправляем запрос с указанием User-Agent перед перенаправлением
                const response = await fetch(hyperlink, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.180 Mobile Safari/537.36'
                    }
                });

                if (response.ok) {
                    window.location.href = hyperlink; // Переход по ссылке
                } else {
                    console.error('Error accessing hyperlink:', response.status);
                    navigateTo('mainPage'); // Переход на главную страницу при ошибке
                }
            } catch (error) {
                console.error('Error fetching hyperlink:', error);
                navigateTo('mainPage'); // Переход на главную страницу при ошибке
            }
        } else {
            navigateTo('mainPage'); // Переход на главный экран, если hyperlink пустой
        }
    };
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

// export function checkFirstRun() {
//     const isFirstRun = localStorage.getItem('firstRun');
//
//     if (!isFirstRun) {
//         localStorage.setItem('firstRun', 'false');
//         localStorage.setItem('currentScore', deposit);
//     }
//
//     const acceptPrivacy = localStorage.getItem('acceptPolicy');
//     if (acceptPrivacy) {
//         document.getElementById('mainPrivacyPolicePage').style.display = 'none';
//     } else {
//         document.getElementById('headerMenu').style.display = 'none';
//         navigateTo('mainPrivacyPolicePage')
//     }
// }

export function setCurrentGame(currentGame) {
    localStorage.setItem('currentGame', currentGame);
}

export function getCurrentGame() {
    return localStorage.getItem("currentGame");
}

export function navigateTo(...args) {
    selectItemSound.play();
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
        showHideHomeButton(page);
    }, 400);
    if (page === 'slotMachine') {
        resizeSlotCanvas();
    }
}

function showHideHomeButton(page) {
    if (page === 'mainPage') {
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
    // открываем подтверждение политики
    document.getElementById('privatePolicyAccept').style.display = 'block';

    showMessage('Data successfully reset!');
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

        document.getElementById('mainPrivacyPolicePage').style.display = 'none';
    }
    document.getElementById('headerMenu').style.display = 'block';
    checkFirstRunAndLoadData();
    navigateTo('mainPage');
});

// Проверка состояния и переход на главный экран
// window.addEventListener('popstate', function(event) {
//     navigateTo('mainPage');
// });

// App.addListener('backButton', ({ canGoBack }) => {
//     navigateTo('mainPage');
// });

App.addListener('backButton', ({ canGoBack }) => {
    const currentPage = getCurrentPage(); // Предполагаемая функция, возвращающая текущую страницу

    if (currentPage === 'mainPage') {
        // Если пользователь находится на главной странице, сворачиваем приложение
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