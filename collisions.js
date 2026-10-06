// ============================================================
// collisions.js: what happens when the ball touches something
//
// To "bounce", we flip the ball's speed:
//   hit something sideways -> vx = -vx
//   hit something above or below -> vy = -vy
// ============================================================

// Returns true if two rectangles (like the ball and a brick) overlap.
function boxesTouch(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


// The ball bounces off the left, right, and top walls.
// (The bottom is not a wall: falling off the bottom resets the ball.)
function bounceOffWalls(targetBall = ball) {
  if (targetBall.x < 0) {
    targetBall.x = 0;
    targetBall.vx = -targetBall.vx;
  }
  if (targetBall.x + targetBall.width > WIDTH) {
    targetBall.x = WIDTH - targetBall.width;
    targetBall.vx = -targetBall.vx;
  }
  if (targetBall.y < 0) {
    targetBall.y = 0;
    targetBall.vy = -targetBall.vy;
  }
}


// The ball bounces off the top of the paddle.
// ball.vy > 0 means "the ball is moving down", so it only bounces
// when it is falling onto the paddle.
function bounceOffPaddle(targetBall = ball) {
  if (boxesTouch(targetBall, paddle) && targetBall.vy > 0) {
    targetBall.y = paddle.y - targetBall.height;  // sit on top of the paddle
    targetBall.vy = -targetBall.vy;
  }
}


// The ball bounces off and breaks the brick it touches.
function bounceOffBricks(targetBall = ball) {
  for (let index = 0; index < bricks.length; index++) {
    const brick = bricks[index];
    if (!boxesTouch(targetBall, brick)) {
      continue;  // not touching this brick, check the next one
    }

    // How far has the ball pushed into the brick on each side?
    const overlapX = Math.min(targetBall.x + targetBall.width, brick.x + brick.width) - Math.max(targetBall.x, brick.x);
    const overlapY = Math.min(targetBall.y + targetBall.height, brick.y + brick.height) - Math.max(targetBall.y, brick.y);

    if (overlapX < overlapY) {
      // The ball hit the brick's left or right side.
      targetBall.vx = -targetBall.vx;
      if (targetBall.x < brick.x) {
        targetBall.x = brick.x - targetBall.width;     // left of the brick
      } else {
        targetBall.x = brick.x + brick.width;    // right of the brick
      }
    } else {
      // The ball hit the brick's top or bottom.
      targetBall.vy = -targetBall.vy;
      if (targetBall.y < brick.y) {
        targetBall.y = brick.y - targetBall.height;    // above the brick
      } else {
        targetBall.y = brick.y + brick.height;   // below the brick
      }
    }

    destroyBrick(index);
    break;  // bounce off one brick per update, then stop looking
  }
}


function destroyBrick(index) {
  const target = bricks[index];
  if (!target) {
    return;
  }

  bricks.splice(index, 1);
  if (!target.isTnt) {
    if (Math.random() < 0.2) {
      const dropRoll = Math.random();
      const type = dropRoll < 0.2 ? "nuke" : dropRoll < 0.4 ? "airstrike" : "multiball";
      powerUps.push({
        x: target.x + target.width / 2 - 14,
        y: target.y,
        width: 28,
        height: 16,
        type
      });
    }
    return;
  }

  const blastX = target.x + target.width / 2;
  const blastY = target.y + target.height / 2;
  const blastRadius = 78;
  for (let brickIndex = bricks.length - 1; brickIndex >= 0; brickIndex--) {
    const brick = bricks[brickIndex];
    const dx = brick.x + brick.width / 2 - blastX;
    const dy = brick.y + brick.height / 2 - blastY;
    if (Math.hypot(dx, dy) <= blastRadius) {
      bricks.splice(brickIndex, 1);
    }
  }
}


function hitBricksWithBullets() {
  for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = bullets[bulletIndex];
    for (let brickIndex = 0; brickIndex < bricks.length; brickIndex++) {
      if (!boxesTouch(bullet, bricks[brickIndex])) {
        continue;
      }

      destroyBrick(brickIndex);
      bullets.splice(bulletIndex, 1);
      break;
    }
  }
}
