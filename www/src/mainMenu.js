
// --------------------------------------------- //
// --------------- Основное меню --------------- //
// --------------------------------------------- //
import { isElementVisible, navigateTo } from './main';

document.addEventListener('DOMContentLoaded', () => {
    let isInitialLoad = true; // Флаг для проверки первоначальной загрузки
    const miniRocket = document.getElementById('miniRocket');
    const listItems = document.querySelectorAll('.levels li');

    function onElementVisible() {
        listItems.forEach(item => {
            // События для сенсорных экранов
            // item.addEventListener('touchstart', addShineClass);
            // item.addEventListener('touchend', removeShineClass);
            //
            // // События для настольных браузеров
            // item.addEventListener('mouseover', addShineClass);
            // item.addEventListener('mouseout', removeShineClass);

            item.addEventListener('click', () => {
                moveRocketToItem(item);
            });
        });

        miniRocket.style.top = '0';

        // Установить начальное положение ракеты на последнем элементе, но не выполнять редирект
        moveRocketToItem(listItems[listItems.length - 1]);
        isInitialLoad = false; // Установить флаг в false после инициализации
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


    function moveRocketToItem(item) {
        const rect = item.getBoundingClientRect();
        const rocketRect = miniRocket.getBoundingClientRect();

        const offsetX = rect.left + (rect.width / 2) - (rocketRect.width / 2);
        const offsetY = rect.top + (rect.height / 2) - (rocketRect.height / 2);

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Определяем ориентацию экрана
        const isLandscape = screenWidth > screenHeight;

        miniRocket.style.transform = `translate(${offsetX}px, ${offsetY}px)${isLandscape ? 'rotate(90deg)' : 'rotate(0deg)'}`;

        // Удаляем класс active у всех элементов
        listItems.forEach(li => li.classList.remove('active'));
        // Добавляем класс active только к выбранному элементу
        item.classList.add('active');

        // Если это не первоначальная загрузка, выполняем редирект
        if (!isInitialLoad) {
            setTimeout(() => {
                const levelNumber = item.getAttribute('value');
                // navigateTo('gameContainer', levelNumber);
                // isInitialLoad = true;
            }, 250);
        }
    }

    function updateRocketPosition() {
        moveRocketToItem(listItems[listItems.length - 1]);
    }

    // Добавляем обработчик события изменения размера окна
    window.addEventListener('resize', updateRocketPosition);
    window.addEventListener('orientationchange', updateRocketPosition);
});
