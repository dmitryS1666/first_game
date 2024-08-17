
// --------------------------------------------- //
// --------------- Общие функции --------------- //
// --------------------------------------------- //

import {setupRoulette} from './roulette'
import {prepareGame, startGame} from "./bonus";
import {setupGamePC, startGamePC} from "./planetCatcher";

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
        minusBet()
    );

document.getElementById('plusBet')
    .addEventListener('click', () =>
        plusBet()
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

    if (args[1] === undefined) {
        showHidePage(overlay, preloader, args[0]);
    } else {
        switch (args[1]) {
            case '1':
                console.log('eggs catcher');
                showHidePage(overlay, preloader, 'gameContainer');
                prepareGame();
                break;
            case '2':
                console.log('roulette');
                showHidePage(overlay, preloader, 'rouletteContainer');
                setupRoulette();
                break;
            case '3':
                console.log('planetCatcher');
                showHidePage(overlay, preloader, 'gameContainer');
                setupGamePC();
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

function minusBet() {
    let currentBet = parseInt(document.getElementById('currentBet').innerText, 10);
    if (currentBet - 50 > 0 && deposit > currentBet - 50) {
        document.getElementById('currentBet').textContent = currentBet - 50;
    } else {
        alert('Ставка должна не превышать ваш депозит.');
    }
}

function plusBet() {
    let currentBet = parseInt(document.getElementById('currentBet').innerText, 10);
    if (deposit > currentBet + 50) {
        document.getElementById('currentBet').textContent = currentBet + 50;
    } else {
        alert('Ставка должна не превышать ваш депозит.');
    }
}
