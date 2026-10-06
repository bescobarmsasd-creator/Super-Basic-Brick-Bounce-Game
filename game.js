// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450
const MAX_LEVELS = 100;
let level = 1;
let gameWon = false;


// ------------------------------------------------------------
// THE BALL
// x and y are the top-left corner. vx and vy are how many pixels
// the ball moves each update (vx = sideways, vy = up/down).
// A positive vy means the ball is moving DOWN the screen.
// ------------------------------------------------------------
const BALL_SPEED = 4;

const ball = {
  x: 0,
  y: 0,
  width: 12,
  height: 12,
  vx: 0,
  vy: 0
};

// Put the ball in the center and reset its speed and direction.
function resetBall() {
  ball.x = WIDTH / 2 - ball.width / 2;
  ball.y = HEIGHT / 2 - ball.height / 2;
  const speed = BALL_SPEED + Math.floor((level - 1) / 20);
  ball.vx = speed;  // right
  ball.vy = speed;  // down
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 30,
  width: 90,
  height: 12,
  speed: 6
};

const BULLET_SPEED = 8;
const GUN_COOLDOWN = 12;
const bullets = [];
let gunCooldown = 0;
const balls = [ball];
const powerUps = [];
const POWERUP_SPEED = 2;
const MULTIBALL_EXTRA = 199;
const MAX_BALLS = 200;
const aircraft = [];
const JUMPSCARE_CHANCE = 0.16;
const JUMPSCARE_DURATION = 48;
let jumpscareTimer = 0;


// ------------------------------------------------------------
// THE BRICKS (the list is filled in by makeBricks() in bricks.js)
// ------------------------------------------------------------
let bricks = [];


// ------------------------------------------------------------
// KEYBOARD
// keys["arrowleft"] is true while the left arrow is held down.
// ------------------------------------------------------------
const keys = {};

document.addEventListener("keydown", function (event) {
  keys[event.key.toLowerCase()] = true;
  // Stop the arrow keys from scrolling the page.
  if (event.key.startsWith("Arrow") || event.code === "Space") {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


// ------------------------------------------------------------
// UPDATE: runs 60 times every second. Move things, then check
// what they touched.
// ------------------------------------------------------------
function update() {
  if (gameWon) {
    return;
  }
  if (jumpscareTimer > 0) {
    jumpscareTimer--;
  }
  movePaddle();
  fireGun();
  moveBullets();
  updatePowerUps();
  updateAircraft();

  for (let index = balls.length - 1; index >= 0; index--) {
    const currentBall = balls[index];
    moveBall(currentBall);
    bounceOffWalls(currentBall);   // collisions.js
    bounceOffPaddle(currentBall);  // collisions.js
    bounceOffBricks(currentBall);  // collisions.js
    if (currentBall.y > HEIGHT) {
      balls.splice(index, 1);
    }
  }

  hitBricksWithBullets(); // collisions.js

  if (balls.length === 0) {
    if (Math.random() < JUMPSCARE_CHANCE) {
      jumpscareTimer = JUMPSCARE_DURATION;
    }
    resetBall();
    balls.push(ball);
  }

  if (bricks.length === 0) {
    advanceLevel();
  }
}

function advanceLevel() {
  if (level >= MAX_LEVELS) {
    gameWon = true;
    return;
  }

  level++;
  bricks = makeBricks(level);
  bullets.length = 0;
  powerUps.length = 0;
  aircraft.length = 0;
  balls.length = 0;
  resetBall();
  balls.push(ball);
}

function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
    paddle.x = paddle.x - paddle.speed;
  }
  if (keys["arrowright"] || keys["d"]) {
    paddle.x = paddle.x + paddle.speed;
  }

  // Keep the paddle on the screen.
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }
}

function moveBall(targetBall = ball) {
  targetBall.x = targetBall.x + targetBall.vx;
  targetBall.y = targetBall.y + targetBall.vy;
}

function fireGun() {
  if (gunCooldown > 0) {
    gunCooldown--;
  }
  if (keys[" "] && gunCooldown === 0) {
    bullets.push({
      x: paddle.x + paddle.width / 2 - 2,
      y: paddle.y - 10,
      width: 4,
      height: 10
    });
    gunCooldown = GUN_COOLDOWN;
  }
}

function moveBullets() {
  for (let index = bullets.length - 1; index >= 0; index--) {
    bullets[index].y -= BULLET_SPEED;
    if (bullets[index].y + bullets[index].height < 0) {
      bullets.splice(index, 1);
    }
  }
}

function updatePowerUps() {
  for (let index = powerUps.length - 1; index >= 0; index--) {
    const powerUp = powerUps[index];
    powerUp.y += POWERUP_SPEED;
    if (boxesTouch(powerUp, paddle)) {
      if (powerUp.type === "nuke") {
        bricks.length = 0;
      } else if (powerUp.type === "airstrike") {
        triggerAirStrike();
      } else {
        addMultiball();
      }
      powerUps.splice(index, 1);
    } else if (powerUp.y > HEIGHT) {
      powerUps.splice(index, 1);
    }
  }
}

function addMultiball() {
  if (balls.length === 0) {
    return;
  }

  const source = balls[0];
  const speed = Math.hypot(source.vx, source.vy) || BALL_SPEED;
  const baseAngle = Math.atan2(source.vy, source.vx);
  for (let index = 0; index < MULTIBALL_EXTRA && balls.length < MAX_BALLS; index++) {
    const angle = baseAngle + (index - (MULTIBALL_EXTRA - 1) / 2) * 0.35;
    balls.push({
      x: source.x,
      y: source.y,
      width: source.width,
      height: source.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
  }
}

function triggerAirStrike() {
  const targetRows = [...new Set(bricks.map((brick) => brick.y))]
    .sort((first, second) => first - second)
    .slice(0, 2);
  for (let index = bricks.length - 1; index >= 0; index--) {
    if (targetRows.includes(bricks[index].y)) {
      bricks.splice(index, 1);
    }
  }

  aircraft.push(
    { type: "f22", x: -82, y: 24, width: 78, speed: 10 },
    { type: "b29", x: -100, y: 66, width: 94, speed: 6 }
  );
}

function updateAircraft() {
  for (let index = aircraft.length - 1; index >= 0; index--) {
    aircraft[index].x += aircraft[index].speed;
    if (aircraft[index].x > WIDTH + aircraft[index].width) {
      aircraft.splice(index, 1);
    }
  }
}

function drawAircraft() {
  for (const plane of aircraft) {
    if (plane.type === "f22") {
      ctx.fillStyle = "#dce5ea";
      ctx.beginPath();
      ctx.moveTo(plane.x + 76, plane.y + 12);
      ctx.lineTo(plane.x + 38, plane.y + 7);
      ctx.lineTo(plane.x + 24, plane.y);
      ctx.lineTo(plane.x + 30, plane.y + 12);
      ctx.lineTo(plane.x + 24, plane.y + 24);
      ctx.lineTo(plane.x + 38, plane.y + 17);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#64b5f6";
      ctx.fillRect(plane.x + 46, plane.y + 10, 12, 4);
      ctx.fillStyle = "#fff";
      ctx.font = "8px monospace";
      ctx.fillText("F-22", plane.x + 45, plane.y + 30);
    } else {
      ctx.fillStyle = "#bfc9ce";
      ctx.beginPath();
      ctx.moveTo(plane.x + 92, plane.y + 15);
      ctx.lineTo(plane.x + 38, plane.y + 10);
      ctx.lineTo(plane.x + 16, plane.y);
      ctx.lineTo(plane.x + 25, plane.y + 15);
      ctx.lineTo(plane.x + 16, plane.y + 30);
      ctx.lineTo(plane.x + 38, plane.y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#7d8b91";
      ctx.fillRect(plane.x + 38, plane.y + 5, 8, 5);
      ctx.fillRect(plane.x + 38, plane.y + 20, 8, 5);
      ctx.fillStyle = "#fff";
      ctx.font = "8px monospace";
      ctx.fillText("B-29", plane.x + 49, plane.y + 34);
    }
  }
}

function drawJumpscare() {
  if (jumpscareTimer === 0) {
    return;
  }

  const centerX = WIDTH / 2 + (jumpscareTimer % 3 - 1) * 5;
  const centerY = HEIGHT / 2;
  const scale = 1 + (JUMPSCARE_DURATION - jumpscareTimer) * 0.002;

  ctx.fillStyle = "rgba(8, 0, 2, 0.94)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#26130f";
  ctx.beginPath();
  ctx.ellipse(centerX - 88 * scale, centerY - 98 * scale, 48 * scale, 58 * scale, -0.25, 0, Math.PI * 2);
  ctx.ellipse(centerX + 88 * scale, centerY - 98 * scale, 48 * scale, 58 * scale, 0.25, 0, Math.PI * 2);
  ctx.ellipse(centerX, centerY, 132 * scale, 158 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff3b28";
  ctx.beginPath();
  ctx.ellipse(centerX - 48 * scale, centerY - 22 * scale, 19 * scale, 27 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + 48 * scale, centerY - 22 * scale, 19 * scale, 27 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#56352a";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 38 * scale, 74 * scale, 56 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#090507";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 88 * scale, 57 * scale, 47 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e7d9c5";
  for (let tooth = -2; tooth <= 2; tooth++) {
    const toothX = centerX + tooth * 20 * scale;
    ctx.beginPath();
    ctx.moveTo(toothX - 8 * scale, centerY + 54 * scale);
    ctx.lineTo(toothX + 8 * scale, centerY + 54 * scale);
    ctx.lineTo(toothX, centerY + 74 * scale);
    ctx.closePath();
    ctx.fill();
  }
}


// ------------------------------------------------------------
// DRAW: paints everything on the canvas. Black background,
// white shapes.
// ------------------------------------------------------------
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`LEVEL ${String(level).padStart(2, "0")} / ${MAX_LEVELS}`, 12, 14);

  ctx.fillStyle = "#ffd166";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "#55d6be";
  for (const currentBall of balls) {
    ctx.fillRect(currentBall.x, currentBall.y, currentBall.width, currentBall.height);
  }
  ctx.fillStyle = "#f4f1de";
  ctx.fillRect(paddle.x + paddle.width / 2 - 3, paddle.y - 6, 6, 8);

  ctx.fillStyle = "#55d6be";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  for (const powerUp of powerUps) {
    const isNuke = powerUp.type === "nuke";
    const isAirStrike = powerUp.type === "airstrike";
    ctx.fillStyle = isNuke ? "#ff4d5a" : isAirStrike ? "#64b5f6" : "#f9c74f";
    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    ctx.fillStyle = "#111";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = isNuke ? "NUKE" : isAirStrike ? "AIR" : "x5";
    ctx.fillText(label, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
  }

  drawAircraft();
  drawBricks();  // bricks.js
  drawJumpscare();

  if (gameWon) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ALL 100 LEVELS CLEARED!", WIDTH / 2, HEIGHT / 2);
  }
}


// ------------------------------------------------------------
// THE GAME LOOP
// The browser calls frame() every time it is ready to draw.
// Some screens are faster than others, so we make sure update()
// always runs exactly 60 times per second on every computer.
// ------------------------------------------------------------
const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function frame(now) {
  leftover = leftover + (now - lastTime);
  lastTime = now;

  // If the tab was hidden for a while, don't try to catch up.
  if (leftover > 250) {
    leftover = 250;
  }

  while (leftover >= STEP) {
    update();
    leftover = leftover - STEP;
  }

  draw();
  requestAnimationFrame(frame);
}

function start() {
  bricks = makeBricks(level);  // bricks.js
  resetBall();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
