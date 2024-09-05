import {isElementVisible, navigateTo, selectGameSound, wheelSpinSound} from './main';

document.addEventListener('DOMContentLoaded', () => {
    let isInitialLoad = true; // Флаг для проверки первоначальной загрузки
    const miniRocket = document.getElementById('miniRocket');
    const listItems = document.querySelectorAll('.levels li');

    function onElementVisible() {
        listItems.forEach(item => {
            // События для кликов на элементах списка
            item.addEventListener('click', () => {
                moveRocketToItem(item);
            });
        });

        miniRocket.style.top = '0';

        // Установить начальное положение ракеты в зависимости от ориентации
        setInitialRocketPosition();
        isInitialLoad = false; // Установить флаг в false после инициализации
    }

    // Функция для установки начальной позиции ракеты в зависимости от ориентации экрана
    function setInitialRocketPosition() {
        // if (window.innerWidth > window.innerHeight) {
            // Горизонтальная ориентация: центрировать внизу экрана
            // setRocketToCenterBottom();
        // } else {
            // Вертикальная ориентация: установить на последнем элементе
            moveRocketToItem(listItems[listItems.length - 1], false); // false чтобы не вызвать navigateTo
        // }
    }

    // Устанавливает ракету в центр нижней части экрана
    function setRocketToCenterBottom() {
        const centerX = window.innerWidth / 2;
        const bottomY = window.innerHeight - miniRocket.getBoundingClientRect().height;

        miniRocket.style.transform = `translate(${centerX - miniRocket.offsetWidth / 2}px, ${bottomY}px) rotate(0deg)`;
    }

    // Получаем элемент, за изменением которого будем следить
    const element = document.getElementById('mainMenu');

    // Создаем новый MutationObserver и передаем ему коллбэк
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (element.style.display !== 'none') {
                    onElementVisible();
                }
            }
        }
    });

    // Конфигурация наблюдателя: отслеживание изменений атрибутов
    const config = {attributes: true};

    // Запускаем наблюдение
    observer.observe(element, config);

    function moveRocketToItem(item, shouldNavigate = true) {
        const rect = item.getBoundingClientRect();
        const rocketRect = miniRocket.getBoundingClientRect();

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Определяем ориентацию экрана
        const isLandscape = screenWidth > screenHeight;

        let offsetX, offsetY;

        if (isLandscape) {
            // Горизонтальная ориентация
            offsetX = rect.left + (rect.width / 2) - (rocketRect.height / 2);
            offsetY = rect.top + (rect.height / 2) - (rocketRect.width / 2);
        } else {
            // Вертикальная ориентация
            offsetX = rect.left + (rect.width / 2) - rocketRect.width / 2;
            offsetY = rect.top + (rect.height / 2) - (rocketRect.height / 2);
        }

        miniRocket.style.transform = `translate(${offsetX}px, ${offsetY}px)${isLandscape ? ' rotate(90deg)' : ' rotate(0deg)'}`;

        // Удаляем класс active у всех элементов
        listItems.forEach(li => li.classList.remove('active'));
        // Добавляем класс active только к выбранному элементу
        item.classList.add('active');

        // Если это не первоначальная загрузка и требуется переход, выполняем редирект
        if (!isInitialLoad && shouldNavigate) {
            setTimeout(() => {
                const levelNumber = item.getAttribute('value');
                selectGameSound.play();
                navigateTo('gameContainer', levelNumber);
                isInitialLoad = true;
            }, 350);
        }
    }

    // Добавляем обработчики событий изменения размера окна и изменения ориентации экрана
    window.addEventListener('resize', setInitialRocketPosition);
    window.addEventListener('orientationchange', setInitialRocketPosition);
});
