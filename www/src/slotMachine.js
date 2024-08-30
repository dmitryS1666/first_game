// Инициализация объекта для хранения последовательностей вращений
let rotationSequences = {};

// Переменная для отслеживания количества начатых вращений
let rotationCount = 0;
let result;

// jQuery метод для запуска анимации вращения
$.fn.startSpin = function (options) {
    result = {};

    const listItems = document.querySelectorAll('li');
    listItems.forEach(li => li.classList.remove('flash_ball'));

    // Проверяем, есть ли элементы, к которым применяется функция
    if (this.length) {
        // Если элемент уже анимируется, выходим из функции
        if ($(this).is(':animated')) return;

        // Создаем новую основную последовательность вращения
        rotationSequences['sequence' + (++rotationCount)] = {};

        // Устанавливаем атрибут 'data-rotation' для текущего элемента
        $(this).attr('data-rotation', rotationCount);

        // Общее количество элементов для вращения
        let itemCount = this.length;
        let currentSequence = 0;

        // Инициализация опций, если они не заданы
        if (typeof options == 'undefined') {
            options = {};
        }

        // Предварительное определение номеров окончаний вращений
        let endNumbers = [];
        if (typeof options.endNum != 'undefined') {
            if ($.isArray(options.endNum)) {
                endNumbers = options.endNum;
            } else {
                endNumbers = [options.endNum];
            }
        }

        for (let i = 0; i < this.length; i++) {
            if (typeof endNumbers[i] == 'undefined') {
                endNumbers.push(0);
            }
        }

        // Устанавливаем количество вращающихся элементов
        rotationSequences['sequence' + rotationCount]['totalRotations'] = itemCount;

        return this.each(function () {
            options.endNum = endNumbers[currentSequence];
            rotationSequences['sequence' + rotationCount]['rotation' + (++currentSequence)] = {};
            rotationSequences['sequence' + rotationCount]['rotation' + currentSequence]['spinning'] = true;

            let rotationData = {
                total: itemCount,
                sequenceId: rotationCount,
                rotationId: currentSequence
            };

            // Создаем новый объект SlotMachine с текущими параметрами
            (new SlotMachine(this, options, rotationData));
        });
    }

    let spinningSlots = [];

    this.each(function (index) {
        rotationData.rotationId = index + 1; // Обновляем идентификатор вращения
        let machine = new SlotMachine(this, options, rotationData);
        spinningSlots.push(machine);
    });

    return spinningSlots; // Возвращаем массив всех слот машин
};

// Конструктор SlotMachine для создания эффекта слот-машины
let SlotMachine = function (element, options, rotationData) {
    let slot = this;
    slot.$element = $(element);

    slot.defaultOptions = {
        easing: 'swing',        // Стандартный easing для анимации
        duration: 2500,        // Продолжительность одного цикла вращения
        cycles: 3,             // Количество циклов вращения
        manualStop: false,     // Остановка по запросу пользователя
        useCustomStopTime: false, // Использовать пользовательское время остановки
        customStopTime: 4500,  // Пользовательское время остановки
        stopOrder: 'random',   // Порядок остановки анимации
        targetNum: 0,          // Целевое число/позиция для остановки
        onElementEnd: $.noop,  // Функция, выполняемая при остановке каждого элемента
        onComplete: $.noop,    // Функция, выполняемая при завершении всех элементов
    };

    slot.spinSpeed = 0;
    slot.cycleCount = 0;
    slot.isSpinning = true;  // Флаг вращения
    slot.isCloned = false;   // Флаг для отслеживания клонирования

    slot.initialize = function () {
        slot.options = $.extend({}, slot.defaultOptions, options);
        slot.setup();
        slot.startSpin();
    };

    slot.setup = function () {
        let $listItem = slot.$element.find('li').first();
        slot.itemHeight = $listItem.innerHeight();
        slot.itemCount = slot.$element.children().length;
        slot.totalHeight = slot.itemHeight * slot.itemCount;

        // Клонируем элементы для бесшовного эффекта и обновляем их ID
        if (!slot.isCloned) {
            slot.$element.append(slot.$element.children().clone());
            slot.updateIds();  // Обновляем ID после клонирования
        }

        slot.spinSpeed = slot.options.duration / slot.options.cycles;

        // Устанавливаем стили для бесшовной анимации
        slot.$element.css({position: 'relative', top: 0});
    };

    // Функция для обновления уникальных ID
    slot.updateIds = function () {
        slot.$element.children('li').each(function (index) {
            let $this = $(this);
            // Присваиваем новый уникальный ID
            let newId = 'col' + rotationData.rotationId + '-' + index;
            $this.attr('id', newId);
        });
    };

    slot.startSpin = function () {
        slot.isCloned = true;  // Устанавливаем флаг клонирования
        if (!slot.isSpinning) return;  // Проверяем, вращается ли элемент

        slot.$element
            .animate({'top': -slot.totalHeight}, slot.spinSpeed, 'linear', function () {
                slot.$element.css('top', 0); // Сбрасываем позицию для бесшовной анимации
                slot.cycleCount++;

                if (slot.cycleCount >= slot.options.cycles) {
                    slot.stopSpin();
                } else {
                    slot.startSpin();  // Рекурсивный вызов для следующего цикла
                }
            });
    };

    // Обновите функцию `stopSpin` для вызова всплывающего сообщения
    slot.stopSpin = function () {
        if (slot.options.targetNum === 0) {
            slot.options.targetNum = slot.getRandomNumber(1, slot.itemCount);
        }

        // Проверка на выход за пределы
        if (slot.options.targetNum < 0 || slot.options.targetNum > slot.itemCount) {
            slot.options.targetNum = 1;
        }

        // Рассчитываем конечную позицию так, чтобы вторая строка была в центре
        let finalPosition = -((slot.itemHeight * (slot.options.targetNum - 2)) + slot.itemHeight);

        let finalDuration = ((slot.spinSpeed * 1.5) * (slot.itemCount)) / slot.options.targetNum;
        if (slot.options.useCustomStopTime) {
            finalDuration = slot.options.customStopTime;
        }

        slot.$element
            .animate({'top': finalPosition}, parseInt(finalDuration), slot.options.easing, function () {
                slot.$element.css('top', finalPosition);

                let el = slot.$element.children('li').eq(slot.options.targetNum);
                let endValue = el.attr('value');
                let endId = el.attr('id');

                result[endId] = endValue

                slot.completeAnimation(el);

                if ($.isFunction(slot.options.onElementEnd)) {
                    slot.options.onElementEnd(endValue);
                }

                // Уменьшаем количество вращающихся элементов в текущей последовательности
                rotationSequences['sequence' + rotationData.sequenceId]['totalRotations']--;

                if (rotationSequences['sequence' + rotationData.sequenceId]['totalRotations'] === 0) {
                    let resultString = '|';
                    let ballCounts = {}; // Инициализируем объект для подсчета шаров

                    // Подсчитываем количество каждого шара во второй строке
                    $.each(rotationSequences['sequence' + rotationData.sequenceId], function (index, subRotation) {
                        if (typeof subRotation == 'object') {
                            let ballName = subRotation['targetNum']; // Имя шара

                            // Получаем индекс шара
                            let ballIndex = slot.$element.children('li').filter(`[value='${ballName}']`).index();

                            // Обновляем строку результатов
                            resultString += `${ballIndex}:${ballName}|`;

                            ballCounts[ballName] = (ballCounts[ballName] || 0) + 1;
                        }
                    });

                    // Вызов функции calculateMultiplier
                    let multiplier = calculateMultiplier(result);
                    console.log('Коэффициент умножения:', multiplier);

                    if (multiplier > 0) {
                        flashResult(result);
                        // добавить рзмер ставки х multiplier
                        showPopupMessage(multiplier);
                    }
                }
            });
    };

    slot.completeAnimation = function (targetNum) {
        if (slot.options.stopOrder === 'leftToRight' && rotationData.total !== rotationData.rotationId) {
            rotationSequences['sequence' + rotationData.sequenceId]['rotation' + (rotationData.rotationId + 1)]['spinning'] = false;
        } else if (slot.options.stopOrder === 'rightToLeft' && rotationData.rotationId !== 1) {
            rotationSequences['sequence' + rotationData.sequenceId]['rotation' + (rotationData.rotationId - 1)]['spinning'] = false;
        }

        slot.isSpinning = false;  // Флаг окончания вращения
    };

    slot.getRandomNumber = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    slot.initialize(); // Инициализируем слот машину
};

// Функция для вычисления коэффициента умножения
function calculateMultiplier(balls) {
    let multiplier = 0;
    let ballCounts = transformHashToCount(balls);
    console.log('ballCounts: ');
    console.log(ballCounts);

    // Проверяем количество видимых шаров и считаем коэффициент умножения
    Object.values(ballCounts).forEach(count => {
        if (count >= 2) {
            switch (count) {
                case 2:
                    multiplier += 0.75;
                    break;
                case 3:
                    multiplier += 1.5;
                    break;
                case 4:
                    multiplier += 2;
                    break;
            }
        }
    });

    // Проверка на бонусный шар
    if (multiplier > 0 && balls['pink']) {
        console.log(balls['pink']);
        multiplier *= 3; // Умножаем на 3, если есть бонусный шар
    }

    return multiplier;
}

function flashResult(resultLine) {
    for (let key in resultLine) {
        let item = document.getElementById(key);
        item.classList.add('flash_ball');
    }
}

// Преобразование хэша в формат для подсчета
function transformHashToCount(hash) {
    let count = {};

    // Подсчитываем количество каждого шара
    for (let key in hash) {
        let value = hash[key];
        count[value] = (count[value] || 0) + 1;
    }

    return count;
}

// Функция для отображения всплывающего текста
function showPopupMessage(message) {
    const popup = document.getElementById('popup-message');
    popup.textContent = message;
    popup.classList.add('show');

    // Убираем сообщение через 2 секунды
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000); // Удаляем через 2 секунды
}
