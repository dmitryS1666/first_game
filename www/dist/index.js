(() => {
  // src/roulette.js
  var rouletteSegments = [2, 200, 5e3, 400, 500, 600, 1.5, 800];
  var rouletteCanvas;
  var rouletteCtx;
  var isSpinning = false;
  var rouletteImage = new Image();
  rouletteImage.src = "res/roulette-image.png";
  var roulettePointerImage = new Image();
  roulettePointerImage.src = "res/pointer.png";
  function setupRoulette() {
    rouletteCanvas = document.getElementById("rouletteCanvas");
    rouletteCtx = rouletteCanvas.getContext("2d");
    drawPointer();
    drawRoulette();
    document.getElementById("spinButton").addEventListener("click", spinRoulette);
  }
  var rotationAngle = 22.5 * (Math.PI / 180);
  function drawRoulette() {
    const radius = rouletteCanvas.width / 2;
    const angle = 2 * Math.PI / rouletteSegments.length;
    rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.save();
    rouletteCtx.translate(radius, radius);
    rouletteCtx.rotate(rotationAngle);
    rouletteCtx.drawImage(rouletteImage, -radius, -radius, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.rotate(-rotationAngle);
    for (let i = 0; i < rouletteSegments.length; i++) {
      const startAngle = i * angle;
      const endAngle = startAngle + angle;
      const midAngle = (startAngle + endAngle) / 2;
      rouletteCtx.save();
      rouletteCtx.rotate(midAngle);
      rouletteCtx.translate(0, -radius / 2);
      rouletteCtx.restore();
    }
    rouletteCtx.restore();
  }
  function drawPointer() {
    const pointerX = rouletteCanvas.width / 2;
    const pointerY = 0;
    const pointerSize = 40;
    if (roulettePointerImage.complete) {
      rouletteCtx.drawImage(
        roulettePointerImage,
        pointerX - pointerSize / 2,
        // Центрируем изображение по оси X
        pointerY,
        // Стрелка у верхней части рулетки
        pointerSize,
        // Ширина стрелки
        pointerSize
        // Высота стрелки
      );
    } else {
      roulettePointerImage.onload = () => {
        rouletteCtx.drawImage(
          roulettePointerImage,
          pointerX - pointerSize / 2,
          pointerY,
          pointerSize,
          pointerSize
        );
      };
    }
  }
  function spinRoulette() {
    if (isSpinning) return;
    isSpinning = true;
    const spinDuration = 3e3;
    const segmentAngle = 360 / rouletteSegments.length;
    const winningSegment = Math.floor(Math.random() * rouletteSegments.length);
    const targetAngle = winningSegment * segmentAngle;
    const adjustedTargetAngle = (targetAngle + 22.5) % 360;
    const totalSpinAngle = 360 * 3 + (360 - adjustedTargetAngle);
    let startTime = null;
    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const currentAngle = totalSpinAngle * progress;
      rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
      rouletteCtx.save();
      rouletteCtx.translate(rouletteCanvas.width / 2, rouletteCanvas.height / 2);
      rouletteCtx.rotate(currentAngle * Math.PI / 180);
      rouletteCtx.translate(-rouletteCanvas.width / 2, -rouletteCanvas.height / 2);
      drawRoulette();
      rouletteCtx.restore();
      drawPointer();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        handleRouletteResult(winningSegment);
        isSpinning = false;
      }
    }
    requestAnimationFrame(animate);
  }
  function handleRouletteResult(winningSegment) {
    const segmentAngle = 360 / rouletteSegments.length;
    const adjustedTargetAngle = (winningSegment * segmentAngle + 112) % 360;
    console.log(`\u0412\u044B\u0438\u0433\u0440\u044B\u0448\u043D\u044B\u0439 \u0441\u0435\u043A\u0442\u043E\u0440: ${rouletteSegments[winningSegment]}`);
  }

  // src/bonus.js
  var timer;
  var gameOver = false;
  var canvas2;
  var ctx;
  var canvasWidth2;
  var canvasHeight2;
  var basketWidth;
  var basketHeight;
  var basketSpeed;
  var eggSpeedBase;
  var eggSpeedVariance;
  var eggInterval = 1e3;
  var gameDuration = 15;
  var tracks = [];
  var basketX;
  var eggs = [];
  var score = 0;
  var colors = ["blue", "brown", "yellow", "earth", "green", "indigo", "orange", "purple", "pink", "red"];
  var colorProperties = {
    blue: { score: 5 },
    brown: { score: 15 },
    yellow: { score: 10 },
    earth: { score: 25 },
    green: { score: 2 },
    indigo: { score: 0 },
    orange: { score: -5 },
    purple: { score: -10 },
    pink: { score: -2 },
    red: { score: 0, gameOver: true }
    // red: {score: 0}
  };
  var ballImages = {};
  var ballImageNames = [
    "blue_ball.png",
    "brown_ball.png",
    "yellow_ball.png",
    "earth_ball.png",
    "green_ball.png",
    "indigo_ball.png",
    "orange_ball.png",
    "pink_ball.png",
    "purple_ball.png",
    "red_ball.png"
  ];
  var basketImage = new Image();
  basketImage.src = "res/new_platform.png";
  var flashImage = new Image();
  flashImage.src = "res/flash.png";
  var trackImage = new Image();
  trackImage.src = "res/track.png";
  var touchFlag = false;
  var flashFlag = false;
  var trackWidth = 30;
  var trackHeight = 80;
  function setupGame() {
    canvas2 = document.getElementById("gameCanvas");
    if (!canvas2) {
      console.error("Canvas element not found");
      return;
    }
    ctx = canvas2.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    basketWidth = 145;
    basketHeight = 127;
    basketSpeed = canvasWidth2 * 0.02;
    eggSpeedBase = canvasHeight2 * 5e-3;
    eggSpeedVariance = canvasHeight2 * 3e-3;
    ballImageNames.forEach((fileName) => {
      const color = fileName.split("_")[0];
      const img = new Image();
      img.src = `res/balls/${fileName}`;
      ballImages[color] = img;
    });
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    if (startButton) startButton.addEventListener("click", startGame);
    setInterval(addEgg, eggInterval);
    document.getElementById("currentBet").textContent = bet;
    document.getElementById("scoreValue").textContent = score || 0;
    checkFirstRun();
    document.getElementById("balanceValue").textContent = localStorage.getItem("currentScore") || 0;
  }
  function resizeCanvas() {
    canvasWidth2 = window.innerWidth;
    canvasHeight2 = window.innerHeight;
    canvas2.width = canvasWidth2;
    canvas2.height = canvasHeight2;
    basketWidth = canvasWidth2 * 0.2;
    basketHeight = canvasHeight2 * 0.05;
    basketSpeed = canvasWidth2 * 0.02;
  }
  function prepareGame() {
    setupGame();
    setupTouchControls();
    setupKeyboardControls();
    score = 0;
    basketX = (canvasWidth2 - basketWidth) / 2;
    eggs = [];
    updateScoreDisplay();
    timerDisplay("block");
    document.getElementById("failPlatformBlock").style.display = "block";
    document.getElementById("failPlatform").style.display = "block";
    document.getElementById("play").style.display = "block";
    document.getElementById("failPlatformAstroBlock").style.display = "none";
    document.getElementById("failPlatformAstro").style.display = "none";
    document.getElementById("playPC").style.display = "none";
  }
  function startGame() {
    document.getElementById("failPlatform").style.display = "none";
    startTimer();
    if (canvas2) {
      canvas2.style.display = "block";
      gameOver = false;
      gameLoop();
    }
  }
  function endGame(isVictory) {
    canvas2.style.display = "none";
    timerDisplay("none");
    if (isVictory) {
      let newScore = parseInt(localStorage.getItem("currentScore")) + score;
      saveScore(newScore);
      const finalScore = document.getElementById("finalScore");
      finalScore.textContent = `+${score}`;
      navigateTo("winPage");
    } else {
      let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
      let newScore = parseInt(localStorage.getItem("currentScore")) - currentBet;
      saveScore(newScore);
      navigateTo("failPage");
    }
    gameOver = true;
    clearInterval(timer);
  }
  function startTimer() {
    console.log("start time");
    let timeRemaining = gameDuration;
    document.getElementById("seconds").textContent = `${timeRemaining}`;
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining >= 10) {
        document.getElementById("seconds").textContent = `${timeRemaining}`;
      } else {
        document.getElementById("seconds").textContent = `0${timeRemaining}`;
      }
      if (timeRemaining <= 0) {
        endGame(score >= 0);
      }
    }, 1e3);
  }
  function addTrack(x, y) {
    tracks.push({ x, y, startTime: Date.now() });
  }
  function drawBasket() {
    ctx.drawImage(basketImage, basketX, canvasHeight2 - basketHeight - 130, basketWidth, basketHeight);
  }
  function drawFlashes() {
    if (flashFlag) {
      ctx.globalAlpha = 1;
      ctx.drawImage(flashImage, basketX, canvasHeight2 - basketHeight - 50 - 150, basketWidth, basketHeight);
      setTimeout(() => {
        flashFlag = false;
      }, 200);
    }
  }
  function drawTracks() {
    const currentTime = Date.now();
    ctx.globalAlpha = 0.1;
    tracks.forEach((track) => {
      const elapsed = currentTime - track.startTime;
      if (elapsed < 200 && !flashFlag) {
        ctx.drawImage(trackImage, track.x - trackWidth / 2, track.y - trackHeight / 2, trackWidth, trackHeight);
      }
    });
    ctx.globalAlpha = 1;
    if (flashFlag) {
      tracks = [];
    } else {
      tracks = tracks.filter((track) => currentTime - track.startTime < 200);
    }
  }
  function drawEggs() {
    eggs.forEach((egg) => {
      const img = ballImages[egg.color];
      if (img) {
        ctx.drawImage(img, egg.x - 25, egg.y - 25, 75, 75);
      } else {
        ctx.beginPath();
        ctx.arc(egg.x, egg.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = egg.color;
        ctx.fill();
      }
    });
  }
  function updateEggs() {
    eggs.forEach((egg) => {
      egg.y += egg.speed;
      addTrack(egg.x, egg.y - 75);
      if (egg.y > canvasHeight2) {
        eggs = eggs.filter((e) => e !== egg);
      }
    });
  }
  function handleCollision() {
    flashFlag = false;
    touchFlag = false;
    eggs.forEach((egg) => {
      if (egg.y > canvasHeight2 - basketHeight - 150 && egg.x > basketX && egg.x < basketX + basketWidth) {
        const properties = colorProperties[egg.color];
        score += properties.score;
        updateScoreDisplay();
        if (properties.gameOver) {
          endGame(false);
        }
        eggs = eggs.filter((e) => e !== egg);
        touchFlag = true;
        flashFlag = true;
      }
    });
  }
  function timerDisplay(state) {
    document.getElementById("timer").style.display = state;
    document.getElementById("seconds").textContent = gameDuration;
  }
  function updateScoreDisplay() {
    document.getElementById("scoreValue").textContent = score;
  }
  function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvasWidth2, canvasHeight2);
    drawTracks();
    drawFlashes();
    drawBasket();
    drawEggs();
    updateEggs();
    handleCollision();
    requestAnimationFrame(gameLoop);
  }
  function addEgg() {
    if (gameOver) return;
    const x = Math.random() * canvasWidth2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const speed = eggSpeedBase + Math.random() * eggSpeedVariance;
    eggs.push({ x, y: 0, color, speed });
    tracks.push({ x, y: 75, startTime: Date.now() });
  }
  function setupTouchControls() {
    canvas2.addEventListener("touchmove", (event) => {
      if (gameOver) return;
      const touchX = event.touches[0].clientX;
      basketX = Math.min(Math.max(touchX - basketWidth / 2, 0), canvasWidth2 - basketWidth);
      event.preventDefault();
    }, { passive: false });
  }
  function setupKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (gameOver) return;
      if (event.key === "ArrowLeft") {
        basketX = Math.max(basketX - basketSpeed, 0);
      } else if (event.key === "ArrowRight") {
        basketX = Math.min(basketX + basketSpeed, canvasWidth2 - basketWidth);
      }
    });
  }

  // src/planetCatcher.js
  var timerPC;
  var gameOver2 = false;
  var canvasPC;
  var ctxPC;
  var canvasPCWidth;
  var canvasPCHeight;
  var basketPCWidth;
  var basketPCHeight;
  var basketSpeed2;
  var eggSpeedBase2;
  var eggSpeedVariance2;
  var eggInterval2 = 1e3;
  var gameDuration2 = 15;
  var basketPosition = "left";
  var eggs2 = [];
  var score2 = 0;
  var colors2 = ["blue", "brown", "yellow", "earth", "green", "indigo", "orange", "purple", "pink", "red"];
  var colorProperties2 = {
    blue: { score: 5 },
    brown: { score: 15 },
    yellow: { score: 10 },
    earth: { score: 25 },
    green: { score: 2 },
    indigo: { score: 0 },
    orange: { score: -5 },
    purple: { score: -10 },
    pink: { score: -2 },
    red: { score: 0, gameOver: true }
  };
  var ballImages2 = {};
  var ballImageNames2 = [
    "blue_ball.png",
    "brown_ball.png",
    "yellow_ball.png",
    "earth_ball.png",
    "green_ball.png",
    "indigo_ball.png",
    "orange_ball.png",
    "pink_ball.png",
    "purple_ball.png",
    "red_ball.png"
  ];
  var basketImage2 = new Image();
  basketImage2.src = "res/astro_left.png";
  function setupGamePC() {
    canvasPC = document.getElementById("planetCatcherCanvas");
    if (!canvasPC) {
      console.error("Canvas element not found");
      return;
    }
    ctxPC = canvasPC.getContext("2d");
    if (!ctxPC) {
      console.error("Canvas context not found");
      return;
    }
    resizeCanvasPC();
    window.addEventListener("resize", resizeCanvasPC);
    basketPCWidth = 400;
    basketPCHeight = 392;
    basketSpeed2 = canvasPCWidth * 0.02;
    eggSpeedBase2 = canvasPCHeight * 5e-3;
    eggSpeedVariance2 = canvasPCHeight * 3e-3;
    ballImageNames2.forEach((fileName) => {
      const color = fileName.split("_")[0];
      const img = new Image();
      img.src = `res/balls/${fileName}`;
      ballImages2[color] = img;
    });
    const startButton = document.getElementById("startButton");
    if (startButton) startButton.addEventListener("click", startGamePC);
    setInterval(addEgg2, eggInterval2);
    document.getElementById("currentBet").textContent = bet;
    document.getElementById("scoreValue").textContent = score2 || 0;
    checkFirstRun();
    document.getElementById("balanceValue").textContent = localStorage.getItem("currentScore") || 0;
    document.getElementById("failPlatformBlock").style.display = "none";
    document.getElementById("failPlatform").style.display = "none";
    document.getElementById("play").style.display = "none";
    document.getElementById("failPlatformAstroBlock").style.display = "block";
    document.getElementById("failPlatformAstro").style.display = "block";
    document.getElementById("playPC").style.display = "inline-block";
  }
  function resizeCanvasPC() {
    canvasPCWidth = window.innerWidth;
    canvasPCHeight = window.innerHeight;
    canvasPC.width = canvasPCWidth;
    canvasPC.height = canvasPCHeight;
    basketPCWidth = canvasPCWidth * 0.2;
    basketPCHeight = canvasPCHeight * 0.05;
    basketSpeed2 = canvasPCWidth * 0.02;
  }
  function startGamePC() {
    setupGamePC();
    score2 = 0;
    eggs2 = [];
    basketPosition = "left";
    updateScoreDisplay2();
    startTimerPC();
    canvasPC.style.display = "block";
    gameOver2 = false;
    document.getElementById("failPlatformAstroBlock").style.display = "none";
    gameLoopPC();
  }
  function endGame2(isVictory) {
    canvasPC.style.display = "none";
    if (isVictory) {
      let newScore = parseInt(localStorage.getItem("currentScore")) + score2;
      saveScore(newScore);
      const finalScore = document.getElementById("finalScore");
      finalScore.textContent = `+${score2}`;
      navigateTo("winPage");
    } else {
      let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
      let newScore = parseInt(localStorage.getItem("currentScore")) - currentBet;
      saveScore(newScore);
      navigateTo("failPage");
    }
    gameOver2 = true;
    clearInterval(timerPC);
  }
  function startTimerPC() {
    let timeRemaining = gameDuration2;
    document.getElementById("seconds").textContent = `${timeRemaining}`;
    timerPC = setInterval(() => {
      timeRemaining--;
      if (timeRemaining >= 10) {
        document.getElementById("seconds").textContent = `${timeRemaining}`;
      } else {
        document.getElementById("seconds").textContent = `0${timeRemaining}`;
      }
      if (timeRemaining <= 0) {
        endGame2(score2 >= 0);
      }
    }, 1e3);
  }
  function drawBasket2() {
    let basketX2 = basketPosition === "left" ? canvasPCWidth * 0.25 - basketPCWidth / 2 : canvasPCWidth * 0.75 - basketPCWidth / 2;
    ctxPC.drawImage(basketImage2, basketX2 + 105, canvasPCHeight - basketPCHeight - 280, basketPCWidth, basketPCHeight);
  }
  function calculateParabola(egg) {
    let time = egg.time;
    let xStart = egg.fromLeft ? 0 : canvasPCWidth;
    let xEnd = basketPosition === "left" ? canvasPCWidth * 0.25 : canvasPCWidth * 0.75;
    let yStart = 0;
    let yEnd = canvasPCHeight - basketPCHeight - 50;
    let t = time / 100;
    egg.x = xStart + (xEnd - xStart) * t;
    egg.y = yStart + (yEnd - yStart) * t * t;
  }
  function drawEggs2() {
    eggs2.forEach((egg) => {
      const img = ballImages2[egg.color];
      if (img) {
        ctxPC.drawImage(img, egg.x - 25, egg.y - 25, 50, 50);
      }
      calculateParabola(egg);
    });
  }
  function gameLoopPC() {
    if (gameOver2) return;
    ctxPC.clearRect(0, 0, canvasPCWidth, canvasPCHeight);
    drawBasket2();
    drawEggs2();
    handleCollision2();
    requestAnimationFrame(gameLoopPC);
  }
  function handleCollision2() {
    eggs2.forEach((egg) => {
      let basketX2 = basketPosition === "left" ? canvasPCWidth * 0.25 : canvasPCWidth * 0.75;
      if (egg.y > canvasPCHeight - basketPCHeight - 50 && egg.x > basketX2 - basketPCWidth / 2 && egg.x < basketX2 + basketPCWidth / 2) {
        const properties = colorProperties2[egg.color];
        score2 += properties.score;
        updateScoreDisplay2();
        if (properties.gameOver) {
          endGame2(false);
        }
        eggs2 = eggs2.filter((e) => e !== egg);
      }
    });
  }
  function updateScoreDisplay2() {
    document.getElementById("scoreValue").textContent = score2;
  }
  function addEgg2() {
    if (gameOver2) return;
    const fromLeft = Math.random() > 0.5;
    const color = colors2[Math.floor(Math.random() * colors2.length)];
    eggs2.push({
      x: fromLeft ? 0 : canvasPCWidth,
      y: 0,
      color,
      fromLeft,
      time: 0
      // Время траектории
    });
  }
  document.addEventListener("keydown", (event) => {
    if (gameOver2) return;
    if (event.key === "ArrowLeft") {
      basketPosition = "left";
    } else if (event.key === "ArrowRight") {
      basketPosition = "right";
    }
  });

  // src/slotMachine.js
  var canvasSlot = document.getElementById("slotCanvas");
  var ctxSlot = canvasSlot.getContext("2d");
  var columnCount = 4;
  var ballsPerColumn = 10;
  var ballRadius = 30;
  var columnWidth = canvasSlot.width / columnCount;
  var ballSpacing = 10;
  var isSpinning2 = false;
  var ballImageNames3 = [
    "blue_ball.png",
    "brown_ball.png",
    "yellow_ball.png",
    "earth_ball.png",
    "green_ball.png",
    "indigo_ball.png",
    "orange_ball.png",
    "pink_ball.png",
    "purple_ball.png",
    "red_ball.png"
  ];
  var ballImages3 = [];
  var columns = Array.from({ length: columnCount }, () => []);
  var speeds = Array(columnCount).fill(0);
  var slotBackground;
  function loadImages(callback) {
    let imagesLoaded = 0;
    slotBackground = new Image();
    slotBackground.src = "res/slotBg.png";
    slotBackground.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === ballImageNames3.length + 1) {
        callback();
      }
    };
    ballImageNames3.forEach((name, index) => {
      const img = new Image();
      img.src = `res/balls/${name}`;
      img.onload = () => {
        ballImages3[index] = img;
        imagesLoaded++;
        if (imagesLoaded === ballImageNames3.length + 1) {
          callback();
        }
      };
    });
  }
  function activateOrientationCheck() {
    if (isElementVisible("slotMachineContainer")) {
      window.addEventListener("orientationchange", checkOrientation);
      checkOrientation();
      console.log("\u0421\u043E\u0431\u044B\u0442\u0438\u0435 orientationchange \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E");
    } else {
      window.removeEventListener("orientationchange", checkOrientation);
      console.log("\u0421\u043E\u0431\u044B\u0442\u0438\u0435 orientationchange \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E");
    }
  }
  function initSlotMachine() {
    document.getElementById("slotMachineContainer").addEventListener("click", spin);
    setTimeout(() => {
      activateOrientationCheck();
    }, 450);
    document.getElementById("spinSlotButton").addEventListener("click", spin);
    for (let col = 0; col < columnCount; col++) {
      for (let i = 0; i < ballsPerColumn; i++) {
        const ball = {
          imgIndex: i % ballImages3.length,
          // индекс картинки
          y: i * (ballRadius * 2 + ballSpacing)
          // позиция по Y
        };
        columns[col].push(ball);
      }
    }
    drawColumns();
  }
  function drawColumns() {
    if (slotBackground.complete) {
      ctxSlot.clearRect(0, 0, canvasSlot.width, canvasSlot.height);
      ctxSlot.drawImage(slotBackground, 0, 0, canvasSlot.width, canvasSlot.height);
    }
    for (let col = 0; col < columnCount; col++) {
      for (let i = 0; i < ballsPerColumn; i++) {
        const ball = columns[col][i];
        const img = ballImages3[ball.imgIndex];
        if (img.complete) {
          const x = col * columnWidth + columnWidth / 2 - ballRadius;
          const y = ball.y % canvasSlot.height - ballRadius;
          ctxSlot.drawImage(img, x, y, ballRadius * 2, ballRadius * 2);
        }
      }
    }
  }
  function updateColumns() {
    for (let col = 0; col < columnCount; col++) {
      for (let i = 0; i < ballsPerColumn; i++) {
        columns[col][i].y += speeds[col];
      }
    }
  }
  function spin() {
    if (isSpinning2) return;
    isSpinning2 = true;
    speeds = Array(columnCount).fill(10);
    const stopDelays = [1e3, 1500, 2e3, 2500];
    const animation = setInterval(() => {
      updateColumns();
      drawColumns();
    }, 1e3 / 60);
    stopDelays.forEach((delay, index) => {
      setTimeout(() => {
        speeds[index] = 0;
        if (index === columnCount - 1) {
          clearInterval(animation);
          isSpinning2 = false;
        }
      }, delay);
    });
  }
  loadImages(initSlotMachine);
  setInterval(activateOrientationCheck, 1e3);

  // src/main.js
  var deposit = 1e3;
  var bet = 50;
  function saveScore(score3) {
    localStorage.setItem("currentScore", score3);
  }
  document.getElementById("homeButton").addEventListener(
    "click",
    () => navigateTo("mainPage")
  );
  document.getElementById("settingButton").addEventListener(
    "click",
    () => navigateTo("settingsPage")
  );
  document.getElementById("menuButton").addEventListener(
    "click",
    () => navigateTo("mainMenu")
  );
  document.getElementById("winMenuButton").addEventListener(
    "click",
    () => navigateTo("mainMenu")
  );
  document.getElementById("failMenuButton").addEventListener(
    "click",
    () => navigateTo("mainMenu")
  );
  document.getElementById("play").addEventListener(
    "click",
    () => startGame()
  );
  document.getElementById("playPC").addEventListener(
    "click",
    () => startGamePC()
  );
  document.getElementById("minusBet").addEventListener(
    "click",
    () => minusBet()
  );
  document.getElementById("plusBet").addEventListener(
    "click",
    () => plusBet()
  );
  function checkFirstRun() {
    const isFirstRun = localStorage.getItem("firstRun");
    if (!isFirstRun) {
      localStorage.setItem("firstRun", "false");
      localStorage.setItem("currentScore", deposit);
    }
  }
  function navigateTo(...args) {
    const overlay = document.getElementById("overlay");
    const preloader = document.getElementById("preloader");
    overlay.style.display = "block";
    preloader.style.display = "block";
    console.log(args);
    if (args[1] === void 0) {
      showHidePage(overlay, preloader, args[0]);
    } else {
      switch (args[1]) {
        case "bonus":
          console.log("eggs catcher");
          showHidePage(overlay, preloader, "gameContainer");
          prepareGame();
          break;
        case "roulette":
          console.log("roulette");
          showHidePage(overlay, preloader, "rouletteContainer");
          setupRoulette();
          break;
        case "planetCatcher":
          console.log("planetCatcher");
          showHidePage(overlay, preloader, "gameContainer");
          setupGamePC();
          break;
        case "slotMachine":
          console.log("slotMachine");
          showHidePage(overlay, preloader, "slotMachineContainer");
          initSlotMachine();
          break;
        default:
          console.log("default");
          navigateTo("mainPage");
      }
    }
  }
  function showHidePage(overlay, preloader, page) {
    setTimeout(() => {
      document.querySelectorAll(".page").forEach((page2) => page2.style.display = "none");
      document.getElementById(page).style.display = "block";
      overlay.style.display = "none";
      preloader.style.display = "none";
    }, 400);
  }
  function minusBet() {
    let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
    if (currentBet - 50 > 0 && deposit > currentBet - 50) {
      document.getElementById("currentBet").textContent = currentBet - 50;
    } else {
      alert("\u0421\u0442\u0430\u0432\u043A\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0435 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C \u0432\u0430\u0448 \u0434\u0435\u043F\u043E\u0437\u0438\u0442.");
    }
  }
  function plusBet() {
    let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
    if (deposit > currentBet + 50) {
      document.getElementById("currentBet").textContent = currentBet + 50;
    } else {
      alert("\u0421\u0442\u0430\u0432\u043A\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0435 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C \u0432\u0430\u0448 \u0434\u0435\u043F\u043E\u0437\u0438\u0442.");
    }
  }
  function checkOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const orientationMessage = document.getElementById("orientationMessage");
    const slotMachineContainer = document.getElementById("slotMachineContainer");
    if (isElementVisible("slotMachineContainer")) {
      if (isPortrait) {
        orientationMessage.style.display = "flex";
        slotMachineContainer.style.filter = "blur(10px)";
      } else {
        orientationMessage.style.display = "none";
        slotMachineContainer.style.filter = "none";
      }
    } else {
      window.removeEventListener("orientationchange", checkOrientation);
    }
  }
  function isElementVisible(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return false;
    let style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  // src/mainMenu.js
  document.addEventListener("DOMContentLoaded", () => {
    let isInitialLoad = true;
    const miniRocket = document.getElementById("miniRocket");
    const listItems = document.querySelectorAll(".levels li");
    function onElementVisible() {
      listItems.forEach((item) => {
        item.addEventListener("touchstart", addShineClass);
        item.addEventListener("touchend", removeShineClass);
        item.addEventListener("mouseover", addShineClass);
        item.addEventListener("mouseout", removeShineClass);
        item.addEventListener("click", () => {
          moveRocketToItem(item);
        });
      });
      miniRocket.style.top = "0";
      moveRocketToItem(listItems[listItems.length - 1]);
      isInitialLoad = false;
    }
    const element = document.getElementById("mainMenu");
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          if (element.style.display !== "none") {
            onElementVisible();
          }
        }
      }
    });
    const config = { attributes: true };
    observer.observe(element, config);
    function moveRocketToItem(item) {
      const rect = item.getBoundingClientRect();
      const rocketRect = miniRocket.getBoundingClientRect();
      const offsetX = 50;
      const offsetY = rect.top + rect.height / 2 - rocketRect.height / 2;
      miniRocket.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      listItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");
      if (!isInitialLoad) {
        setTimeout(() => {
          const levelNumber = item.getAttribute("value");
          navigateTo("gameContainer", levelNumber);
          isInitialLoad = true;
        }, 250);
      }
    }
    function addShineClass(event) {
      event.currentTarget.classList.add("shinePlanet");
    }
    function removeShineClass(event) {
      event.currentTarget.classList.remove("shinePlanet");
    }
  });
})();
