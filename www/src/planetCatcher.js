
// --------------------------------------------- //
// --------------- Ловец планет ---------------- //
// --------------------------------------------- //

let pcCanvas, ctxPC, pcBasket;

const balls = [];
const colorsPlanet = ["red", "blue", "green", "yellow", "purple"];

function setupPC() {
    pcCanvas = document.getElementById("planetCatcherCanvas");
    ctxPC = pcCanvas.getContext("2d");

    pcBasket = {
        x: pcCanvas.width / 2 - 50,
        y: pcCanvas.height - 30,
        width: 100,
        height: 20,
        speed: 7,
        isMoving: false,
        startTouchX: 0,
        currentTouchX: 0
    };

// Обработка касаний
    pcCanvas.addEventListener("touchstart", (event) => {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            pcBasket.isMoving = true;
            pcBasket.startTouchX = touch.clientX;
            pcBasket.currentTouchX = touch.clientX;
        }
    });

    pcCanvas.addEventListener("touchmove", (event) => {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            pcBasket.currentTouchX = touch.clientX;
        }
    });

    pcCanvas.addEventListener("touchend", () => {
        pcBasket.isMoving = false;
    });

// Создание нового шара каждые 2 секунды
    setInterval(createBall, 2000);

    gameLoopPC();
}

function createBall() {
    const isLeft = Math.random() < 0.5;
    const ball = {
        x: isLeft ? 0 : pcCanvas.width,
        y: 0,
        radius: 15 + Math.random() * 10,
        color: colorsPlanet[Math.floor(Math.random() * colorsPlanet.length)],
        angle: 0,
        speedX: isLeft ? 2 + Math.random() * 2 : -(2 + Math.random() * 2),
        speedY: 2 + Math.random() * 2,
        rotationSpeed: 0.1 + Math.random() * 0.05
    };
    balls.push(ball);
}

function updatePcBasket() {
    if (pcBasket.isMoving) {
        // Перемещаем корзину в соответствии с текущим касанием
        const touchPositionX = pcBasket.currentTouchX;
        pcBasket.x = Math.max(0, Math.min(pcCanvas.width - pcBasket.width, touchPositionX - pcBasket.width / 2));
    }
}

function updateBalls() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        ball.angle += ball.rotationSpeed;

        // Проверка на столкновение с корзиной
        if (
            ball.x + ball.radius > pcBasket.x &&
            ball.x - ball.radius < pcBasket.x + pcBasket.width &&
            ball.y + ball.radius > pcBasket.y &&
            ball.y - ball.radius < pcBasket.y + pcBasket.height
        ) {
            balls.splice(i, 1); // Удалить пойманный шар
            i--;
            continue;
        }

        // Удалить шары, которые вышли за границы канваса
        if (ball.y - ball.radius > pcCanvas.height) {
            balls.splice(i, 1);
            i--;
        }
    }
}

function drawPcBasket() {
    ctxPC.fillStyle = "brown";
    ctxPC.fillRect(pcBasket.x, pcBasket.y, pcBasket.width, pcBasket.height);
}

function drawBalls() {
    for (const ball of balls) {
        ctxPC.save();
        ctxPC.translate(ball.x, ball.y);
        ctxPC.rotate(ball.angle);
        ctxPC.beginPath();
        ctxPC.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctxPC.fillStyle = ball.color;
        ctxPC.fill();
        ctxPC.restore();
    }
}

function draw() {
    ctxPC.clearRect(0, 0, pcCanvas.width, pcCanvas.height);
    drawPcBasket();
    drawBalls();
}

function update() {
    updatePcBasket();
    updateBalls();
}

function gameLoopPC() {
    update();
    draw();
    requestAnimationFrame(gameLoopPC);
}
