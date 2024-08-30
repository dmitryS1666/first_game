(() => {
  // src/roulette.js
  var rouletteSegments = [2, 200, 5e3, 400, 500, 600, 1.5, 800];
  var rouletteCanvas;
  var rouletteCtx;
  var isSpinning = false;
  var score = 0;
  var rouletteImage = new Image();
  rouletteImage.src = "res/roulette-image.png";
  var roulettePointerImage = new Image();
  roulettePointerImage.src = "res/pointer.png";
  function setupRoulette() {
    rouletteCanvas = document.getElementById("rouletteCanvas");
    rouletteCtx = rouletteCanvas.getContext("2d");
    drawRoulette();
    drawPointer();
    document.getElementById("spinButton").addEventListener("click", spinRoulette);
    document.getElementById("currentBetRoulette").textContent = bet;
    document.getElementById("scoreValueRoulette").textContent = score || 0;
    checkFirstRun();
    document.getElementById("balanceValueRoulette").textContent = localStorage.getItem("currentScore") || 0;
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
    const pointerSize = 20;
    if (roulettePointerImage.complete) {
      rouletteCtx.drawImage(
        roulettePointerImage,
        pointerX - pointerSize / 2,
        // Центрируем изображение по оси X
        pointerY,
        // Стрелка у верхней части рулетки
        30,
        // Ширина стрелки
        75
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
    let result2;
    let currentBet = parseFloat(document.getElementById("currentBetRoulette").innerText);
    const adjustedTargetAngle = (winningSegment * segmentAngle + 112) % 360;
    score = rouletteSegments[winningSegment];
    if (score === 2 || score === 1.5) {
      result2 = parseFloat(score) * currentBet;
    } else {
      result2 = parseFloat(score) + currentBet;
    }
    let newScore = parseInt(localStorage.getItem("currentScore")) + score + result2;
    saveScore(newScore);
    const finalScore = document.getElementById("finalScore");
    finalScore.textContent = `+${result2}`;
    navigateTo("winPage");
  }

  // src/bonus.js
  var timer;
  var gameOver = false;
  var canvas;
  var ctx;
  var canvasWidth;
  var canvasHeight;
  var basketWidth;
  var basketHeight;
  var basketSpeed;
  var eggSpeedBase;
  var eggSpeedVariance;
  var eggInterval = 1100;
  var gameDuration = 15;
  var tracks = [];
  var basketX;
  var eggs = [];
  var score2 = 0;
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
  var textDisplays = [];
  function addTextDisplay(x, y, text) {
    textDisplays.push({
      x,
      y,
      text,
      alpha: 1,
      // Начальная непрозрачность
      speed: 2
      // Скорость подъема текста
    });
  }
  function drawTexts() {
    ctx.globalAlpha = 1;
    textDisplays.forEach((textDisplay, index) => {
      ctx.fillStyle = "white";
      ctx.font = "700 30px Montserrat";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(textDisplay.text, textDisplay.x, textDisplay.y);
      textDisplay.y -= textDisplay.speed;
      textDisplay.alpha -= 0.02;
      if (textDisplay.alpha <= 0) {
        textDisplays.splice(index, 1);
      }
    });
    ctx.globalAlpha = 1;
  }
  function setupGame() {
    canvas = document.getElementById("gameCanvas");
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);
    basketWidth = 160;
    basketHeight = 125;
    basketSpeed = canvasWidth * 0.02;
    eggSpeedBase = canvasHeight * 5e-3;
    eggSpeedVariance = canvasHeight * 3e-3;
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
    document.getElementById("scoreValue").textContent = score2 || 0;
    checkFirstRun();
    document.getElementById("balanceValue").textContent = localStorage.getItem("currentScore") || 0;
  }
  function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    basketSpeed = canvasWidth * 0.02;
  }
  function prepareGame() {
    setupGame();
    setupTouchControls();
    setupKeyboardControls();
    score2 = 0;
    eggs = [];
    updateScoreDisplay();
    timerDisplay("block");
    document.getElementById("failPlatformBlock").style.display = "block";
    document.getElementById("failPlatform").style.display = "block";
    document.getElementById("play").style.display = "block";
    document.getElementById("failPlatformAstroBlock").style.display = "none";
    document.getElementById("pipe").style.display = "none";
    document.getElementById("failPlatformAstro").style.display = "none";
    document.getElementById("playPC").style.display = "none";
  }
  function startGame() {
    if (gameOver === false) {
      console.log("\u0418\u0433\u0440\u0430 \u0443\u0436\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u0430.");
      return;
    }
    const startButton = document.getElementById("play");
    if (startButton) {
      startButton.disabled = true;
    }
    basketX = (canvasWidth - basketWidth) / 2;
    document.getElementById("failPlatform").style.display = "none";
    startTimer();
    if (canvas) {
      canvas.style.display = "block";
      gameOver = false;
      gameLoop();
    }
  }
  function endGame(isVictory, isInterrupted = false) {
    if (isInterrupted) {
      gameOver = true;
      clearInterval(timer);
      return;
    }
    canvas.style.display = "none";
    timerDisplay("none");
    gameOver = true;
    const startButton = document.getElementById("play");
    if (startButton) {
      startButton.disabled = false;
    }
    clearInterval(timer);
    let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
    if (isVictory) {
      let newScore = parseInt(localStorage.getItem("currentScore")) + score2 + currentBet;
      saveScore(newScore);
      const finalScore = document.getElementById("finalScore");
      finalScore.textContent = `+${score2}`;
      navigateTo("winPage");
    } else {
      let newScore = parseInt(localStorage.getItem("currentScore")) - currentBet;
      saveScore(newScore);
      navigateTo("failPage");
    }
  }
  function startTimer() {
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
        endGame(score2 >= 0);
      }
    }, 1e3);
  }
  function addTrack(x, y) {
    tracks.push({ x, y, startTime: Date.now() });
  }
  function drawBasket() {
    ctx.drawImage(basketImage, basketX, canvasHeight - basketHeight - 130, basketWidth, basketHeight);
  }
  function drawFlashes() {
    if (flashFlag) {
      ctx.globalAlpha = 1;
      ctx.drawImage(flashImage, basketX, canvasHeight - basketHeight - 50 - 150, basketWidth, basketHeight);
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
        ctx.drawImage(trackImage, track.x, track.y - 120, trackWidth, trackHeight * 2.5);
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
      if (egg.y > canvasHeight) {
        eggs = eggs.filter((e) => e !== egg);
      }
    });
  }
  function handleCollision() {
    flashFlag = false;
    touchFlag = false;
    eggs.forEach((egg) => {
      if (egg.y > canvasHeight - basketHeight - 150 && egg.x > basketX && egg.x < basketX + basketWidth) {
        const properties = colorProperties[egg.color];
        score2 += properties.score;
        updateScoreDisplay();
        let scoreVal = properties.score;
        addTextDisplay(egg.x, egg.y, scoreVal > 0 ? "+" + scoreVal.toString() : scoreVal.toString());
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
    document.getElementById("scoreValue").textContent = score2;
  }
  function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawTracks();
    drawFlashes();
    drawBasket();
    drawEggs();
    updateEggs();
    handleCollision();
    drawTexts();
    requestAnimationFrame(gameLoop);
  }
  function addEgg() {
    if (gameOver) return;
    const x = Math.random() * canvasWidth;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const speed = eggSpeedBase + Math.random() * eggSpeedVariance;
    eggs.push({ x, y: 0, color, speed });
    tracks.push({ x, y: 75, startTime: Date.now() });
  }
  function setupTouchControls() {
    canvas.addEventListener("touchmove", (event) => {
      if (gameOver) return;
      const touchX = event.touches[0].clientX;
      basketX = Math.min(Math.max(touchX - basketWidth / 2, 0), canvasWidth - basketWidth);
      event.preventDefault();
    }, { passive: false });
  }
  function setupKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (gameOver) return;
      if (event.key === "ArrowLeft") {
        basketX = Math.max(basketX - basketSpeed, 0);
      } else if (event.key === "ArrowRight") {
        basketX = Math.min(basketX + basketSpeed, canvasWidth - basketWidth);
      }
    });
  }

  // src/planetCatcher.js
  var timerPC;
  var gameOverPC = false;
  var canvasPC;
  var ctxPC;
  var canvasPCWidth;
  var canvasPCHeight;
  var basketPCWidth;
  var basketPCHeight;
  var basketSpeed2;
  var eggSpeedBase2;
  var eggSpeedVariance2;
  var leftPipeWidth;
  var leftPipeHeight;
  var rightPipeWidth;
  var rightPipeHeight;
  var eggInterval2 = 1e3;
  var gameDuration2 = 15;
  var basketPosition = "left";
  var eggs2 = [];
  var score3 = 0;
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
    // red: {score: 0, gameOverPC: true}
    red: { score: 0 }
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
  var flashImage2 = new Image();
  flashImage2.src = "res/flash.png";
  var leftPipeImage = new Image();
  leftPipeImage.src = "res/l_pipe.png";
  var rightPipeImage = new Image();
  rightPipeImage.src = "res/r_pipe.png";
  var flashes = [];
  var textDisplays2 = [];
  function addTextDisplay2(x, y, text) {
    textDisplays2.push({
      x,
      y,
      text,
      alpha: 1,
      // Начальная непрозрачность
      speed: 2
      // Скорость подъема текста
    });
  }
  function drawTexts2() {
    ctxPC.globalAlpha = 1;
    textDisplays2.forEach((textDisplay, index) => {
      ctxPC.fillStyle = "white";
      ctxPC.font = "700 30px Montserrat";
      ctxPC.textAlign = "left";
      ctxPC.textBaseline = "middle";
      ctxPC.fillText(textDisplay.text, textDisplay.x, textDisplay.y);
      textDisplay.y -= textDisplay.speed;
      textDisplay.alpha -= 0.02;
      if (textDisplay.alpha <= 0) {
        textDisplays2.splice(index, 1);
      }
    });
    ctxPC.globalAlpha = 1;
  }
  function setupGamePC() {
    canvasPC = document.getElementById("planetCatcherCanvas");
    if (!canvasPC) {
      console.error("Canvas element not found");
      return;
    }
    canvasPC.addEventListener("touchstart", (event) => {
      if (gameOverPC) return;
      const touchX = event.touches[0].clientX;
      if (touchX < canvasPCWidth / 2) {
        basketPosition = "left";
      } else {
        basketPosition = "right";
      }
    });
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
    const startButton = document.getElementById("playPC");
    if (startButton) startButton.addEventListener("click", startGamePC);
    setInterval(addEgg2, eggInterval2);
    document.getElementById("currentBet").textContent = bet;
    document.getElementById("scoreValue").textContent = 0;
    checkFirstRun();
    document.getElementById("balanceValue").textContent = localStorage.getItem("currentScore") || 0;
    document.getElementById("failPlatformBlock").style.display = "none";
    document.getElementById("failPlatform").style.display = "none";
    document.getElementById("play").style.display = "none";
    document.getElementById("failPlatformAstroBlock").style.display = "block";
    document.getElementById("failPlatformAstro").style.display = "block";
    document.getElementById("playPC").style.display = "inline-block";
    timerDisplay2("block");
  }
  function resizeCanvasPC() {
    canvasPCWidth = window.innerWidth;
    canvasPCHeight = window.innerHeight;
    canvasPC.width = canvasPCWidth;
    canvasPC.height = canvasPCHeight;
    basketPCWidth = canvasPCWidth * 0.2;
    basketPCHeight = canvasPCHeight * 0.05;
    basketSpeed2 = canvasPCWidth * 0.02;
    eggSpeedBase2 = canvasPCHeight * 5e-3;
    eggSpeedVariance2 = canvasPCHeight * 3e-3;
    leftPipeWidth = canvasPCWidth * 0.32;
    leftPipeHeight = canvasPCHeight * 0.3;
    rightPipeWidth = leftPipeWidth;
    rightPipeHeight = leftPipeHeight;
  }
  function drawPipes() {
    ctxPC.drawImage(leftPipeImage, 0, 28, leftPipeWidth, leftPipeHeight);
    ctxPC.drawImage(rightPipeImage, canvasPCWidth - rightPipeWidth, 28, rightPipeWidth, rightPipeHeight);
  }
  function startGamePC() {
    setupGamePC();
    score3 = 0;
    eggs2 = [];
    basketPosition = "left";
    updateScoreDisplay2();
    clearInterval(timerPC);
    startTimerPC();
    canvasPC.style.display = "block";
    gameOverPC = false;
    document.getElementById("failPlatformAstroBlock").style.display = "none";
    const startButton = document.getElementById("playPC");
    if (startButton) {
      startButton.disabled = true;
    }
    gameLoopPC();
  }
  function endGamePC(isVictory, isInterrupted = false) {
    if (isInterrupted) {
      gameOverPC = true;
      clearInterval(timerPC);
      return;
    }
    gameOverPC = true;
    clearInterval(timerPC);
    canvasPC.style.display = "none";
    timerDisplay2("none");
    document.getElementById("pipeRight").style.display = "block";
    document.getElementById("pipeLeft").style.display = "block";
    let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
    const startButton = document.getElementById("playPC");
    if (startButton) {
      startButton.disabled = false;
    }
    if (isVictory) {
      let newScore = parseInt(localStorage.getItem("currentScore")) + score3 + currentBet;
      saveScore(newScore);
      const finalScore = document.getElementById("finalScore");
      finalScore.textContent = `+${score3}`;
      navigateTo("winPage");
    } else {
      let newScore = parseInt(localStorage.getItem("currentScore")) - currentBet;
      saveScore(newScore);
      navigateTo("failPage");
    }
    document.getElementById("seconds").textContent = gameDuration2;
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
        endGamePC(score3 >= 0);
      }
    }, 1e3);
  }
  function drawBasket2() {
    let basketX2 = basketPosition === "left" ? canvasPCWidth * 0.25 - basketPCWidth / 2 : canvasPCWidth * 0.75 - basketPCWidth / 2;
    ctxPC.save();
    if (basketPosition === "right") {
      ctxPC.scale(-1, 1);
      basketX2 = -basketX2 - basketPCWidth;
    }
    ctxPC.drawImage(basketImage2, basketX2 + 105, canvasPCHeight - basketPCHeight - 130, basketPCWidth, basketPCHeight);
    ctxPC.restore();
  }
  function calculateParabola(egg) {
    let time = egg.time;
    let xStart = egg.startX;
    let yStart = egg.startY;
    let xEnd = egg.fromLeft ? canvasPCWidth / 8 : canvasPCWidth - 60;
    let horizontalRange = canvasPCWidth * 0.08;
    xEnd = egg.fromLeft ? xEnd + horizontalRange : xEnd - horizontalRange;
    let yEnd = canvasPCHeight * 0.3;
    let transitionTime = 20;
    let totalDuration = 140;
    if (time < transitionTime) {
      let t = time / transitionTime;
      egg.x = xStart + (xEnd - xStart) * t;
      egg.y = yStart - (yStart - yEnd) * (1 - t * t);
    } else {
      let t = (time - transitionTime) / (totalDuration - transitionTime);
      egg.x = xEnd;
      egg.y = yEnd + (canvasPCHeight - yEnd - basketPCHeight - 100) * t;
    }
    egg.time++;
  }
  function drawEggs2() {
    eggs2.forEach((egg) => {
      const img = ballImages2[egg.color];
      if (img) {
        ctxPC.save();
        ctxPC.translate(egg.x, egg.y);
        const rotationDirection = egg.fromLeft ? 1 : -1;
        ctxPC.rotate(rotationDirection * egg.time * Math.PI / 180);
        ctxPC.translate(-egg.x, -egg.y);
        ctxPC.drawImage(img, egg.x - 50, egg.y - 50, 70, 70);
        ctxPC.restore();
      }
      calculateParabola(egg);
      egg.time++;
    });
    flashes.forEach((flash) => {
      ctxPC.save();
      ctxPC.globalAlpha = flash.alpha;
      ctxPC.drawImage(flashImage2, flash.x - 50, flash.y - 50, 100, 100);
      ctxPC.restore();
      flash.alpha -= 0.05;
      flash.textAlpha = Math.max(flash.textAlpha - 0.02, 0);
      flash.textOffsetY -= 1;
    });
    flashes = flashes.filter((flash) => flash.alpha > 0 || flash.textAlpha > 0);
  }
  function gameLoopPC() {
    if (gameOverPC) return;
    ctxPC.clearRect(0, 0, canvasPCWidth, canvasPCHeight);
    drawPipes();
    drawBasket2();
    drawEggs2();
    drawTexts2();
    handleCollision2();
    requestAnimationFrame(gameLoopPC);
    document.getElementById("pipeRight").style.display = "none";
    document.getElementById("pipeLeft").style.display = "none";
  }
  function handleCollision2() {
    eggs2.forEach((egg) => {
      let basketX2 = basketPosition === "left" ? canvasPCWidth * 0.25 : canvasPCWidth * 0.75;
      if (egg.y > canvasPCHeight - basketPCHeight - 50 && egg.x > basketX2 - basketPCWidth / 2 && egg.x < basketX2 + basketPCWidth / 2) {
        const properties = colorProperties2[egg.color];
        score3 += properties.score;
        updateScoreDisplay2();
        addTextDisplay2(egg.x, egg.y, properties.score.toString());
        if (properties.gameOverPC) {
          endGamePC(false);
        }
        flashes.push({
          x: egg.x,
          y: egg.y,
          alpha: 1,
          // Прозрачность вспышки
          text: properties.score,
          // Значение для отображения
          textAlpha: 1,
          // Прозрачность текста
          textOffsetX: 60,
          // Смещение текста по X относительно вспышки
          textOffsetY: 0,
          // Смещение текста по Y
          textDuration: 150
          // Длительность отображения текста
        });
        eggs2 = eggs2.filter((e) => e !== egg);
      }
    });
  }
  function updateScoreDisplay2() {
    document.getElementById("scoreValue").textContent = score3;
  }
  function addEgg2() {
    if (gameOverPC) return;
    const fromLeft = Math.random() > 0.5;
    const color = colors2[Math.floor(Math.random() * colors2.length)];
    const startX = fromLeft ? 70 : canvasPCWidth - 65;
    const startY = 265;
    eggs2.push({
      x: startX,
      y: startY,
      startX,
      // Сохраняем начальную позицию по X
      startY,
      // Сохраняем начальную позицию по Y
      color,
      fromLeft,
      time: 0,
      // Время траектории
      rotationSpeed: Math.random() * 2 + 1
      // Случайная скорость вращения
    });
  }
  document.addEventListener("keydown", (event) => {
    if (gameOverPC) return;
    if (event.key === "ArrowLeft") {
      basketPosition = "left";
    } else if (event.key === "ArrowRight") {
      basketPosition = "right";
    }
  });
  function timerDisplay2(state) {
    document.getElementById("timer").style.display = state;
    document.getElementById("seconds").textContent = gameDuration2;
  }

  // src/main.js
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await StatusBar.setBackgroundColor({ color: "transparent" });
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.show();
    } catch (error) {
      console.error("Error setting status bar:", error);
    }
  });
  var deposit = 1e3;
  var bet = 50;
  function saveScore(score4) {
    localStorage.setItem("currentScore", score4);
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
    () => minusBet("currentBet")
  );
  document.getElementById("plusBet").addEventListener(
    "click",
    () => plusBet("currentBet")
  );
  document.getElementById("minusBetRoulette").addEventListener(
    "click",
    () => minusBet("currentBetRoulette")
  );
  document.getElementById("plusBetRoulette").addEventListener(
    "click",
    () => plusBet("currentBetRoulette")
  );
  document.getElementById("minusBetSlot").addEventListener(
    "click",
    () => minusBet("currentBetSlot")
  );
  document.getElementById("plusBetSlot").addEventListener(
    "click",
    () => plusBet("currentBetSlot")
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
    if (!gameOver) {
      endGame(false, true);
    }
    if (!gameOverPC) {
      endGamePC(false, true);
    }
    console.log(args);
    if (args[1] === void 0) {
      showHidePage(overlay, preloader, args[0]);
    } else {
      switch (args[1]) {
        case "bonus":
          navigateTo("mainPage");
          console.log("bonus game");
          showHidePage(overlay, preloader, "gameContainer");
          prepareGame();
          break;
        case "roulette":
          console.log("roulette game");
          showHidePage(overlay, preloader, "rouletteContainer");
          setupRoulette();
          break;
        case "planetCatcher":
          console.log("planetCatcher game");
          showHidePage(overlay, preloader, "gameContainer");
          setupGamePC();
          break;
        case "slotMachine":
          console.log("slotMachine game");
          showHidePage(overlay, preloader, "slotMachineContainer");
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
  function minusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (currentBet - 50 > 0 && deposit > currentBet - 50) {
      document.getElementById(elementId).textContent = currentBet - 50;
    } else {
      alert("The rate must be lower than your deposit.");
    }
  }
  function plusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (deposit > currentBet + 50) {
      document.getElementById(elementId).textContent = currentBet + 50;
    } else {
      alert("The bet must not exceed your deposit.");
    }
  }

  // src/mainMenu.js
  document.addEventListener("DOMContentLoaded", () => {
    let isInitialLoad = true;
    const miniRocket = document.getElementById("miniRocket");
    const listItems = document.querySelectorAll(".levels li");
    function onElementVisible() {
      listItems.forEach((item) => {
        item.addEventListener("click", () => {
          moveRocketToItem(item);
        });
      });
      miniRocket.style.top = "0";
      setInitialRocketPosition();
      isInitialLoad = false;
    }
    function setInitialRocketPosition() {
      if (window.innerWidth > window.innerHeight) {
        setRocketToCenterBottom();
      } else {
        moveRocketToItem(listItems[listItems.length - 1], false);
      }
    }
    function setRocketToCenterBottom() {
      const centerX = window.innerWidth / 2;
      const bottomY = window.innerHeight - miniRocket.getBoundingClientRect().height;
      miniRocket.style.transform = `translate(${centerX - miniRocket.offsetWidth / 2}px, ${bottomY}px) rotate(0deg)`;
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
    function moveRocketToItem(item, shouldNavigate = true) {
      const rect = item.getBoundingClientRect();
      const rocketRect = miniRocket.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isLandscape = screenWidth > screenHeight;
      let offsetX, offsetY;
      if (isLandscape) {
        offsetX = rect.left + rect.width / 2 - rocketRect.height / 2;
        offsetY = rect.top + rect.height / 2 - rocketRect.width / 2;
      } else {
        offsetX = rect.left + rect.width / 2 - rocketRect.width / 2;
        offsetY = rect.top + rect.height / 2 - rocketRect.height / 2;
      }
      miniRocket.style.transform = `translate(${offsetX}px, ${offsetY}px)${isLandscape ? " rotate(90deg)" : " rotate(0deg)"}`;
      listItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");
      if (!isInitialLoad && shouldNavigate) {
        setTimeout(() => {
          const levelNumber = item.getAttribute("value");
          navigateTo("gameContainer", levelNumber);
          isInitialLoad = true;
        }, 350);
      }
    }
    function updateRocketPosition() {
      setInitialRocketPosition();
    }
    window.addEventListener("resize", updateRocketPosition);
    window.addEventListener("orientationchange", updateRocketPosition);
  });

  // src/slotMachine.js
  var rotationSequences = {};
  var rotationCount = 0;
  var result;
  $.fn.startSpin = function(options) {
    result = {};
    const listItems = document.querySelectorAll("li");
    listItems.forEach((li) => li.classList.remove("flash_ball"));
    if (this.length) {
      if ($(this).is(":animated")) return;
      rotationSequences["sequence" + ++rotationCount] = {};
      $(this).attr("data-rotation", rotationCount);
      let itemCount = this.length;
      let currentSequence = 0;
      if (typeof options == "undefined") {
        options = {};
      }
      let endNumbers = [];
      if (typeof options.endNum != "undefined") {
        if ($.isArray(options.endNum)) {
          endNumbers = options.endNum;
        } else {
          endNumbers = [options.endNum];
        }
      }
      for (let i = 0; i < this.length; i++) {
        if (typeof endNumbers[i] == "undefined") {
          endNumbers.push(0);
        }
      }
      rotationSequences["sequence" + rotationCount]["totalRotations"] = itemCount;
      return this.each(function() {
        options.endNum = endNumbers[currentSequence];
        rotationSequences["sequence" + rotationCount]["rotation" + ++currentSequence] = {};
        rotationSequences["sequence" + rotationCount]["rotation" + currentSequence]["spinning"] = true;
        let rotationData2 = {
          total: itemCount,
          sequenceId: rotationCount,
          rotationId: currentSequence
        };
        new SlotMachine(this, options, rotationData2);
      });
    }
    let spinningSlots = [];
    this.each(function(index) {
      rotationData.rotationId = index + 1;
      let machine = new SlotMachine(this, options, rotationData);
      spinningSlots.push(machine);
    });
    return spinningSlots;
  };
  var SlotMachine = function(element, options, rotationData2) {
    let slot = this;
    slot.$element = $(element);
    slot.defaultOptions = {
      easing: "swing",
      // Стандартный easing для анимации
      duration: 2500,
      // Продолжительность одного цикла вращения
      cycles: 3,
      // Количество циклов вращения
      manualStop: false,
      // Остановка по запросу пользователя
      useCustomStopTime: false,
      // Использовать пользовательское время остановки
      customStopTime: 4500,
      // Пользовательское время остановки
      stopOrder: "random",
      // Порядок остановки анимации
      targetNum: 0,
      // Целевое число/позиция для остановки
      onElementEnd: $.noop,
      // Функция, выполняемая при остановке каждого элемента
      onComplete: $.noop
      // Функция, выполняемая при завершении всех элементов
    };
    slot.spinSpeed = 0;
    slot.cycleCount = 0;
    slot.isSpinning = true;
    slot.isCloned = false;
    slot.initialize = function() {
      slot.options = $.extend({}, slot.defaultOptions, options);
      slot.setup();
      slot.startSpin();
    };
    slot.setup = function() {
      let $listItem = slot.$element.find("li").first();
      slot.itemHeight = $listItem.innerHeight();
      slot.itemCount = slot.$element.children().length;
      slot.totalHeight = slot.itemHeight * slot.itemCount;
      if (!slot.isCloned) {
        slot.$element.append(slot.$element.children().clone());
        slot.updateIds();
      }
      slot.spinSpeed = slot.options.duration / slot.options.cycles;
      slot.$element.css({ position: "relative", top: 0 });
    };
    slot.updateIds = function() {
      slot.$element.children("li").each(function(index) {
        let $this = $(this);
        let newId = "col" + rotationData2.rotationId + "-" + index;
        $this.attr("id", newId);
      });
    };
    slot.startSpin = function() {
      slot.isCloned = true;
      if (!slot.isSpinning) return;
      slot.$element.animate({ "top": -slot.totalHeight }, slot.spinSpeed, "linear", function() {
        slot.$element.css("top", 0);
        slot.cycleCount++;
        if (slot.cycleCount >= slot.options.cycles) {
          slot.stopSpin();
        } else {
          slot.startSpin();
        }
      });
    };
    slot.stopSpin = function() {
      if (slot.options.targetNum === 0) {
        slot.options.targetNum = slot.getRandomNumber(1, slot.itemCount);
      }
      if (slot.options.targetNum < 0 || slot.options.targetNum > slot.itemCount) {
        slot.options.targetNum = 1;
      }
      let finalPosition = -(slot.itemHeight * (slot.options.targetNum - 2) + slot.itemHeight);
      let finalDuration = slot.spinSpeed * 1.5 * slot.itemCount / slot.options.targetNum;
      if (slot.options.useCustomStopTime) {
        finalDuration = slot.options.customStopTime;
      }
      slot.$element.animate({ "top": finalPosition }, parseInt(finalDuration), slot.options.easing, function() {
        slot.$element.css("top", finalPosition);
        let el = slot.$element.children("li").eq(slot.options.targetNum);
        let endValue = el.attr("value");
        let endId = el.attr("id");
        result[endId] = endValue;
        slot.completeAnimation(el);
        if ($.isFunction(slot.options.onElementEnd)) {
          slot.options.onElementEnd(endValue);
        }
        rotationSequences["sequence" + rotationData2.sequenceId]["totalRotations"]--;
        if (rotationSequences["sequence" + rotationData2.sequenceId]["totalRotations"] === 0) {
          let resultString = "|";
          let ballCounts = {};
          $.each(rotationSequences["sequence" + rotationData2.sequenceId], function(index, subRotation) {
            if (typeof subRotation == "object") {
              let ballName = subRotation["targetNum"];
              let ballIndex = slot.$element.children("li").filter(`[value='${ballName}']`).index();
              resultString += `${ballIndex}:${ballName}|`;
              ballCounts[ballName] = (ballCounts[ballName] || 0) + 1;
            }
          });
          let multiplier = calculateMultiplier(result);
          console.log("\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u0443\u043C\u043D\u043E\u0436\u0435\u043D\u0438\u044F:", multiplier);
          if (multiplier > 0) {
            flashResult(result);
            showPopupMessage(multiplier);
          }
        }
      });
    };
    slot.completeAnimation = function(targetNum) {
      if (slot.options.stopOrder === "leftToRight" && rotationData2.total !== rotationData2.rotationId) {
        rotationSequences["sequence" + rotationData2.sequenceId]["rotation" + (rotationData2.rotationId + 1)]["spinning"] = false;
      } else if (slot.options.stopOrder === "rightToLeft" && rotationData2.rotationId !== 1) {
        rotationSequences["sequence" + rotationData2.sequenceId]["rotation" + (rotationData2.rotationId - 1)]["spinning"] = false;
      }
      slot.isSpinning = false;
    };
    slot.getRandomNumber = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };
    slot.initialize();
  };
  function calculateMultiplier(balls) {
    let multiplier = 0;
    let ballCounts = transformHashToCount(balls);
    console.log("ballCounts: ");
    console.log(ballCounts);
    Object.values(ballCounts).forEach((count) => {
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
    if (multiplier > 0 && balls["pink"]) {
      console.log(balls["pink"]);
      multiplier *= 3;
    }
    return multiplier;
  }
  function flashResult(resultLine) {
    for (let key in resultLine) {
      let item = document.getElementById(key);
      item.classList.add("flash_ball");
    }
  }
  function transformHashToCount(hash) {
    let count = {};
    for (let key in hash) {
      let value = hash[key];
      count[value] = (count[value] || 0) + 1;
    }
    return count;
  }
  function showPopupMessage(message) {
    const popup = document.getElementById("popup-message");
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
    }, 2e3);
  }
})();
