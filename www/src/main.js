
// --------------------------------------------- //
// --------------- Общие функции --------------- //
// --------------------------------------------- //

import {setupRoulette} from './roulette'
import {prepareGame, startGame} from "./bonus";
import {setupGamePC, startGamePC} from "./planetCatcher";
import {initSlotMachine} from "./slotMachine";

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

    console.log(args);

    if (args[1] === undefined) {
        showHidePage(overlay, preloader, args[0]);
    } else {
        switch (args[1]) {
            case 'bonus':
                console.log('eggs catcher');
                showHidePage(overlay, preloader, 'gameContainer');
                prepareGame();
                break;
            case 'roulette':
                console.log('roulette');
                showHidePage(overlay, preloader, 'rouletteContainer');
                setupRoulette();
                break;
            case 'planetCatcher':
                console.log('planetCatcher');
                showHidePage(overlay, preloader, 'gameContainer');
                setupGamePC();
                break;
            case 'slotMachine':
                console.log('slotMachine');
                showHidePage(overlay, preloader, 'slotMachineContainer');
                initSlotMachine();
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
}

function minusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (currentBet - 50 > 0 && deposit > currentBet - 50) {
        document.getElementById(elementId).textContent = currentBet - 50;
    } else {
        alert('The rate must be lower than your deposit.');
    }
}

function plusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (deposit > currentBet + 50) {
        document.getElementById(elementId).textContent = currentBet + 50;
    } else {
        alert('The bet must not exceed your deposit.');
    }
}

// Функция для проверки ориентации экрана
export function checkOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const orientationMessage = document.getElementById('orientationMessage');
    const slotMachineContainer = document.getElementById('slotMachineContainer');

    if (isElementVisible('slotMachineContainer')) {  // Проверка видимости блока
        if (isPortrait) {
            // Если вертикальная ориентация, показать сообщение и скрыть игру
            orientationMessage.style.display = 'flex';
            slotMachineContainer.style.filter = 'blur(10px)'; // Заблюрить игру
        } else {
            // Если горизонтальная ориентация, убрать сообщение и показать игру
            orientationMessage.style.display = 'none';
            slotMachineContainer.style.filter = 'none'; // Убрать блюр
        }
    } else {
        // Если слот-машина не видима, убрать обработчик события
        window.removeEventListener('orientationchange', checkOrientation);
    }
}

// Функция для проверки видимости элемента
export function isElementVisible(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return false; // Если элемент отсутствует в DOM

    let style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
}
