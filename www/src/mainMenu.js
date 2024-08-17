
// --------------------------------------------- //
// --------------- Основное меню --------------- //
// --------------------------------------------- //
import { navigateTo } from './main'

document.addEventListener('DOMContentLoaded', () => {
    // Функция, которую нужно выполнить, когда элемент станет видимым
    let isInitialLoad = true; // Флаг для проверки первоначальной загрузки
    const miniRocket = document.getElementById('miniRocket');
    const listItems = document.querySelectorAll('.levels li');

    function onElementVisible() {
        listItems.forEach(item => {
            // События для сенсорных экранов
            item.addEventListener('touchstart', addShineClass);
            item.addEventListener('touchend', removeShineClass);

            // События для настольных браузеров
            item.addEventListener('mouseover', addShineClass);
            item.addEventListener('mouseout', removeShineClass);

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

        const offsetX = 50;
        const offsetY = rect.top + (rect.height / 2) - (rocketRect.height / 2);

        miniRocket.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

        // Удаляем класс active у всех элементов
        listItems.forEach(li => li.classList.remove('active'));
        // Добавляем класс active только к выбранному элементу
        item.classList.add('active');

        // Если это не первоначальная загрузка, выполняем редирект
        if (!isInitialLoad) {
            setTimeout(() => {
                const levelNumber = item.getAttribute('data-number');
                navigateTo('gameContainer', levelNumber)
                isInitialLoad = true;
            }, 250);
        }
    }

    function addShineClass(event) {
        event.currentTarget.classList.add('shinePlanet');
    }

    function removeShineClass(event) {
        event.currentTarget.classList.remove('shinePlanet');
    }
});

