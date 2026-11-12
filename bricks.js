// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts
const BRICK_COLORS = ["#ff6b6b", "#ffd166", "#55d6be", "#6c9eff"];
const BRICK_HIT_EFFECT_DURATION = 14;
const brickHitEffects = [];

// Builds the list of bricks. Each brick is an object with an
// x, y, width, and height.
function makeBricks(level = 1) {
  const list = [];

  // Center the whole block of bricks on the screen.
  const totalWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
  const left = (WIDTH - totalWidth) / 2;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLUMNS; col++) {
      list.push({
        x: left + col * (BRICK_WIDTH + BRICK_GAP),
        y: BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: BRICK_COLORS[(row + level - 1) % BRICK_COLORS.length],
        isTnt: row === level % BRICK_ROWS && col === (level * 3) % BRICK_COLUMNS,
        beeper: { ...Beeper }
      });
    }
  }

  return list;
}

// Draws each hit as a short-lived colored ring that expands and fades.
function drawBrickHitEffects() {
  for (let index = brickHitEffects.length - 1; index >= 0; index--) {
    const effect = brickHitEffects[index];
    const progress = effect.frame / BRICK_HIT_EFFECT_DURATION;
    const radius = 4 + progress * 24;

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2 + (1 - progress) * 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    effect.frame++;
    if (effect.frame >= BRICK_HIT_EFFECT_DURATION) {
      brickHitEffects.splice(index, 1);
    }
  }
}

// Draws every brick in the list.
function drawBricks() {
  for (const brick of bricks) {
    ctx.fillStyle = brick.isTnt ? "#ff4d3d" : brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    if (brick.isTnt) {
      ctx.fillStyle = "#111";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TNT", brick.x + brick.width / 2, brick.y + brick.height / 2);
    }
  }

  drawBrickHitEffects();
}
const BRICK_HIT_EFFECT_DURATION = 14;
const brickHitEffects = [];

function drawBrickHitEffects() {
  for (let index = brickHitEffects.length - 1; index >= 0; index--) {
    const effect = brickHitEffects[index];
    const progress = effect.frame / BRICK_HIT_EFFECT_DURATION;
    const radius = 4 + progress * 24;

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2 + (1 - progress) * 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    effect.frame++;
    if (effect.frame >= BRICK_HIT_EFFECT_DURATION) {
      brickHitEffects.splice(index, 1);
    }
  }
}

function drawBricks() {
  for (const brick of bricks) {
    ctx.fillStyle = brick.isTnt ? "#ff4d3d" : brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    if (brick.isTnt) {
      ctx.fillStyle = "#111";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TNT", brick.x + brick.width / 2, brick.y + brick.height / 2);
    }
  }

  drawBrickHitEffects();
}const BRICK_HIT_EFFECT_DURATION = 14;
const brickHitEffects = [];

function drawBrickHitEffects() {
  for (let index = brickHitEffects.length - 1; index >= 0; index--) {
    const effect = brickHitEffects[index];
    const progress = effect.frame / BRICK_HIT_EFFECT_DURATION;
    const radius = 4 + progress * 24;

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2 + (1 - progress) * 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    effect.frame++;
    if (effect.frame >= BRICK_HIT_EFFECT_DURATION) {
      brickHitEffects.splice(index, 1);
    }
  }
}

function drawBricks() {
  for (const brick of bricks) {
    ctx.fillStyle = brick.isTnt ? "#ff4d3d" : brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    if (brick.isTnt) {
      ctx.fillStyle = "#111";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TNT", brick.x + brick.width / 2, brick.y + brick.height / 2);
    }
  }

  drawBrickHitEffects();
}