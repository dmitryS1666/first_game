// Инициализация объекта для хранения последовательностей вращений
let rotationSequences = {};

// Переменная для отслеживания количества начатых вращений
let rotationCount = 0;

// jQuery метод для запуска анимации вращения
$.fn.startSpin = function (options) {
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

        // Клонируем элементы для бесшовного эффекта
        slot.$element.append(slot.$element.children().clone());

        slot.spinSpeed = slot.options.duration / slot.options.cycles;

        // Устанавливаем стили для бесшовной анимации
        slot.$element.css({ position: 'relative', top: 0 });
    };

    slot.startSpin = function () {
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

                let endValue = slot.$element.children('li').eq(slot.options.targetNum).attr('value');

                slot.completeAnimation(endValue);

                if ($.isFunction(slot.options.onElementEnd)) {
                    slot.options.onElementEnd(endValue);
                }

                if (rotationSequences['sequence' + rotationData.sequenceId]['totalRotations'] === 0) {
                    let resultString = '|';
                    let ballCounts = {}; // Инициализируем объект для подсчета шаров

                    $.each(rotationSequences['sequence' + rotationData.sequenceId], function(index, subRotation) {
                        if (typeof subRotation == 'object') {
                            let ballName = subRotation['targetNum']; // Имя шара
                            ballCounts[ballName] = (ballCounts[ballName] || 0) + 1;
                            resultString += ballName + '|';
                        }
                    });

                    // Вызов функции calculateMultiplier
                    let multiplier = calculateMultiplier(ballCounts);
                    console.log('Коэффициент умножения:', multiplier);

                    if ($.isFunction(slot.options.onComplete)) {
                        slot.options.onComplete(resultString);
                    }
                }
            });
    };

    slot.completeAnimation = function(targetNum) {
        if (slot.options.stopOrder === 'leftToRight' && rotationData.total !== rotationData.rotationId) {
            rotationSequences['sequence' + rotationData.sequenceId]['rotation' + (rotationData.rotationId + 1)]['spinning'] = false;
        } else if (slot.options.stopOrder == 'rightToLeft' && rotationData.rotationId !== 1) {
            rotationSequences['sequence' + rotationData.sequenceId]['rotation' + (rotationData.rotationId - 1)]['spinning'] = false;
        }
        rotationSequences['sequence' + rotationData.sequenceId]['totalRotations']--;
        rotationSequences['sequence' + rotationData.sequenceId]['rotation' + rotationData.rotationId]['targetNum'] = targetNum;
    };

    slot.getRandomNumber = function (low, high) {
        return Math.floor(Math.random() * (1 + high - low)) + low;
    };

    this.initialize();
};

// Функция для вычисления коэффициента умножения
function calculateMultiplier(ballCounts) {
    let multiplier = 0;

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
    if (multiplier > 0 && ballCounts['pink_ball.png']) {
        multiplier *= 3; // Умножаем на 3, если есть бонусный шар
    }

    return multiplier;
}
