const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let gameOver = false;
let pauseGame = false;
const SKELETON_WIDTH = 70;
const SKELETON_HEIGHT = 70;
let skeletonDamage = 1;
const START_MAX_SPEED = 3;
const START_MIN_SPEED = 1.5;
let maxSpeed = START_MAX_SPEED;
let minSpeed = START_MIN_SPEED;
let speedIncrement = 0.5;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 70;
const PLAYER_SPEED = 5;
const HEALTH_SIZE = 50;
const healthBar = document.querySelector("progress");
let healthOnGround = false;
const STAR_SIZE = 50;
let starOnGround = false;
let starPower = 3;
let scoreMiliseconds = 0;
let score = 0;
let highScore = 0;
let scoreText = document.getElementById("score");
let highScoreText = document.getElementById("highscore");

function randomLocation(max, size) {
  return Math.random() * (max - size);
}

function randomSpeed() {
  return Math.random() * (maxSpeed - minSpeed) + minSpeed;
}

class Sprite {
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

requestAnimationFrame(drawScene);

//SOURCE: https://openclipart.org/detail/227980/pixel-character
var playerImage = new Image();
playerImage.src = "https://image.ibb.co/fPcP2w/8_Bit_Character_1_copy.png";

class Player extends Sprite {
  constructor(x, y, width, height, speed) {
    super();
    this.image = playerImage;
    Object.assign(this, { x, y, width, height, speed });
  }
}

let player = new Player(
  canvas.width / 2,
  canvas.height / 2,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED
);

//SOURCE: http://keywordsuggest.org/gallery/748456.html
var skeletonImage = new Image();
skeletonImage.src = "https://image.ibb.co/evLP06/game_skeleton.png";

class Enemy extends Sprite {
  constructor(x, y, width, height, speed) {
    super();
    this.image = skeletonImage;
    Object.assign(this, { x, y, width, height, speed });
  }
}

let enemies = [
  new Enemy(
    canvas.width + 50,
    canvas.height / 2,
    SKELETON_WIDTH,
    SKELETON_HEIGHT,
    randomSpeed()
  ),
  new Enemy(
    0,
    canvas.width + 50,
    SKELETON_WIDTH,
    SKELETON_HEIGHT,
    randomSpeed()
  ),
  new Enemy(600, -50, SKELETON_WIDTH, SKELETON_HEIGHT, randomSpeed()),
  new Enemy(
    600,
    canvas.width + 50,
    SKELETON_WIDTH,
    SKELETON_HEIGHT,
    randomSpeed()
  )
];

function skeletonCollision() {
  for (let x = 0; x < enemies.length; x++) {
    for (let y = enemies.length - 1; y > x; y--) {
      if (haveCollided(enemies[x], enemies[y])) {
        jumpBack(enemies[x], enemies[y], 1);
      }
    }
  }
}

function newEnemy() {
  enemies.push(
    new Enemy(
      0,
      canvas.width + 50,
      SKELETON_WIDTH,
      SKELETON_HEIGHT,
      randomSpeed()
    )
  );
}

//SOURCE: https://pixabay.com/en/pixel-heart-heart-pixel-symbol-red-2779422/
var healthImage = new Image();
healthImage.src = "https://image.ibb.co/eO8KYR/pixel_heart_2779422_960_720.png";

class Health extends Sprite {
  constructor(x, y, width, height) {
    super();
    this.image = healthImage;
    Object.assign(this, { x, y, width, height });
  }
}

let health = new Health(
  randomLocation(canvas.width, HEALTH_SIZE),
  randomLocation(canvas.height, HEALTH_SIZE),
  HEALTH_SIZE,
  HEALTH_SIZE
);

function newHealth() {
  health.x = randomLocation(canvas.width, HEALTH_SIZE);
  health.y = randomLocation(canvas.height, HEALTH_SIZE);
  health.draw();
}

function checkHealth() {
  health.draw();
  if (haveCollided(player, health)) {
    healthBar.value += 30;
    healthOnGround = false;
  }
}

//SOURCE: https://www.stockunlimited.com/similar/2008684.html
var starImage = new Image();
starImage.src = "https://image.ibb.co/hSUbDR/pixel_gold_star_2021368.png";

class Star extends Sprite {
  constructor(x, y, width, height) {
    super();
    this.image = starImage;
    Object.assign(this, { x, y, width, height });
  }
}

let star = new Star(
  randomLocation(canvas.width, STAR_SIZE),
  randomLocation(canvas.height, STAR_SIZE),
  STAR_SIZE,
  STAR_SIZE
);

function newStar() {
  star.x = randomLocation(canvas.width, HEALTH_SIZE);
  star.y = randomLocation(canvas.height, HEALTH_SIZE);
  star.draw();
}

function checkStar() {
  star.draw();
  if (haveCollided(player, star)) {
    for (let x = 0; x < starPower; x++) {
      enemies.shift();
    }
    minSpeed = minSpeed - speedIncrement;
    maxSpeed = maxSpeed - speedIncrement;
    starOnGround = false;
  }
}

let mouse = {
  x: 0,
  y: 0
};

function updateMouse(event) {
  const { left, top } = canvas.getBoundingClientRect();
  mouse.x = event.clientX - left;
  mouse.y = event.clientY - top;
}

document.body.addEventListener("mousemove", updateMouse);

function haveCollided(sprite1, sprite2) {
  return (
    sprite1.x < sprite2.x + sprite2.width &&
    sprite1.x + sprite1.width > sprite2.x &&
    sprite1.y < sprite2.y + sprite2.height &&
    sprite1.height + sprite1.y > sprite2.y
  );
}

function checkBounds(sprite) {
  if (sprite.x < 0) {
    sprite.x = 0;
  } else if (sprite.x + sprite.width > canvas.width) {
    sprite.x = canvas.width - sprite.width;
  }
  if (sprite.y < 0) {
    sprite.y = 0;
  } else if (sprite.y + sprite.height > canvas.height) {
    sprite.y = canvas.height - sprite.height;
  }
}

function writeInstructions() {
  ctx.font = "20px VT323";
  ctx.fillStyle = "white";
  ctx.fillText("MOVE mouse to move.", 10, 20);
  ctx.fillText("CLICK to pause.", 10, 40);
}

var backgroundImage = new Image();
backgroundImage.src = "https://image.ibb.co/gF02nm/game_background2.jpg";

function clearBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  writeInstructions();
}

function distanceBetween(sprite1, sprite2) {
  return Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
}

function moveToward(leader, follower, speed) {
  let dx = leader.x - follower.x;
  let dy = leader.y - follower.y;
  let hypot = distanceBetween(leader, follower);

  let speedx = speed * (dx / hypot);
  let speedy = speed * (dy / hypot);

  if (!(hypot < speed)) {
    follower.x += speedx;
    follower.y += speedy;
  }
}

function jumpBack(spriteJumping, sprite2, amount) {
  if (spriteJumping.x > sprite2.y) {
    spriteJumping.x = spriteJumping.x + amount;
  } else {
    spriteJumping.x = spriteJumping.x - amount;
  }
  if (spriteJumping.y > sprite2.y) {
    spriteJumping.y = spriteJumping.y + amount;
  } else {
    spriteJumping.y = spriteJumping.y - amount;
  }
}

function updateScene() {
  if (healthOnGround) {
    checkHealth();
  }
  if (starOnGround) {
    checkStar();
  }
  checkBounds(player);
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  skeletonCollision();
  checkHit();
  updateScore();
  if (pauseGame) {
    loadPauseScreen();
  } else if (healthBar.value > 0) {
    requestAnimationFrame(drawScene);
  } else {
    endGame();
  }
}

function checkHit() {
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player)) {
      jumpBack(enemy, player, 4);
      healthBar.value -= skeletonDamage;
    }
  });
}

function updateScore() {
  scoreMiliseconds++;
  if (scoreMiliseconds % 100 === 0) {
    score++;
    if (score % 5 === 0) {
      if (maxSpeed < player.speed) {
        minSpeed += speedIncrement;
        maxSpeed += speedIncrement;
      }
      newEnemy();
    }
    checkPowerups();
    scoreText.innerHTML = score;
  }
}

function checkPowerups() {
  if (score % 5 === 0) {
    newHealth();
    healthOnGround = true;
  }
  if (score % 10 === 0) {
    newStar();
    starOnGround = true;
    skeletonDamage += skeletonDamage * 0.5;
  }
}

function drawScene() {
  clearBackground();
  player.draw();
  enemies.forEach(enemy => enemy.draw());

  updateScene();
}

function loadPauseScreen() {
  ctx.font = "120px VT323";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  ctx.font = "30px VT323";
  ctx.fillText(
    "HEALTH appears every five seconds.",
    canvas.width / 2,
    canvas.height / 2 + 50
  );
  ctx.fillText(
    "A STAR appears every ten seconds.",
    canvas.width / 2,
    canvas.height / 2 + 80
  );
  ctx.fillText(
    "A STAR kills three skeletons.",
    canvas.width / 2,
    canvas.height / 2 + 110
  );
  ctx.textAlign = "left";
}

function endGame() {
  gameOver = true;
  ctx.font = "120px VT323";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.font = "50px VT323";
  ctx.fillText("CLICK to play again", canvas.width / 2, canvas.height / 2 + 50);
  ctx.textAlign = "left";
}

function mouseClick(event) {
  if (gameOver) {
    resetGame();
  } else {
    if (pauseGame) {
      requestAnimationFrame(drawScene);
    }
    pauseGame = !pauseGame;
  }
}

function resetGame() {
  healthBar.value = 100;
  healthOnGround = false;
  starOnGround = false;
  resetScore();
  resetEnemies();
  gameOver = false;
  requestAnimationFrame(drawScene);
}

function resetEnemies() {
  maxSpeed = START_MAX_SPEED;
  minSpeed = START_MIN_SPEED;
  enemies.forEach(enemy => {
    enemy.speed = randomSpeed();
    jumpBack(enemy, player, 300);
  });
  while (enemies.length > 4) {
    enemies.pop();
  }
}

function resetScore() {
  scoreMiliseconds = 0;
  if (score > highScore) {
    highScore = score;
    highScoreText.innerHTML = highScore;
  }
  score = 0;
  scoreText.innerHTML = 0;
}