const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 650;

const survivorImage = new Image();
const zombieImage = new Image();
const boxImage = new Image();
survivorImage.src = 'survivor.png';
zombieImage.src = 'zombie.png';
boxImage.src = 'box.png';

const survivor = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 100, 
    height: 120, 
    health: 100,
    isAlive: true,
    isJumping: false,
    jumpSpeed: 0,
    gravity: 0.2,
    moveSpeed: 50,
};

const zombies = [];
const bullets = [];
const zombieBullets = [];
const boxes = [
    { x: 150, y: canvas.height - 240, width: 90, height: 90 },
    { x: 300, y: canvas.height - 280, width: 90, height: 90 },
    { x: 450, y: canvas.height - 210, width: 90, height: 90 },
    { x: 600, y: canvas.height - 250, width: 90, height: 90 },
    { x: 750, y: canvas.height - 150, width: 90, height: 90 },
    { x: 50, y: canvas.height - 90, width: 90, height: 90 },
    { x: 600, y: canvas.height - 90, width: 90, height: 90 }
];
const zombieSpeed = 0.5;
const bulletSpeed = 5;
const gravity = 0.1;
let gameOver = false;
let gamePaused = false;
let tracing = false;
let traceStartX = 0;
let traceStartY = 0;
let traceEndX = 0;
let traceEndY = 0;
let score = 0;
let timeRemaining = 300; // 5 minutes in seconds

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawImage(img, x, y, width, height) {
    ctx.drawImage(img, x, y, width, height);
}

function drawSurvivor() {
    drawImage(survivorImage, survivor.x - survivor.width / 2, survivor.y - survivor.height / 2, survivor.width, survivor.height);
}

function drawZombie(zombie) {
    drawImage(zombieImage, zombie.x, zombie.y, zombie.width, zombie.height);
}

function drawBullet(bullet) {
    drawRect(bullet.x, bullet.y, bullet.width, bullet.height, 'red');
}

function drawZombieBullet(bullet) {
    drawRect(bullet.x, bullet.y, bullet.width, bullet.height, 'green');
}

function drawBoxes() {
    boxes.forEach(box => {
        drawImage(boxImage, box.x, box.y, box.width, box.height);
    });
}

function drawTraceLine() {
    if (tracing) {
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(traceStartX, traceStartY);
        ctx.lineTo(traceEndX, traceEndY);
        ctx.stroke();
    }
}

function spawnZombie() {
    const x = Math.random() > 0.4  ? 0 : canvas.width - 20;
    const y = canvas.height - 85;
    zombies.push({ x, y, width: 80, height: 90, speed: zombieSpeed, direction: x === 0 ? 'right' : 'left' }); // Increased size
}

function zombieShoot(zombie) {
    const angle = Math.atan2(survivor.y - zombie.y, survivor.x - zombie.x);
    const vx = bulletSpeed * Math.cos(angle);
    const vy = bulletSpeed * Math.sin(angle);
    zombieBullets.push({
        x: zombie.x + zombie.width / 2,
        y: zombie.y + zombie.height / 2,
        width: 10,
        height: 4,
        vx: vx,
        vy: vy
    });
}

function update() {
    if (!survivor.isAlive) {
        gameOver = true;
        alert(`Game Over! You have been overtaken by the zombies,Your score is: ${score}`);
        return;
    }

    // Move survivor
    if (survivor.isJumping) {
        survivor.y -= survivor.jumpSpeed;
        survivor.jumpSpeed -= survivor.gravity;

        // Check for collision with boxes while jumping
        boxes.forEach(box => {
            if (survivor.y < box.y + box.height &&
                survivor.y + survivor.height > box.y &&
                survivor.x > box.x &&
                survivor.x < box.x + box.width) {
                survivor.y = box.y - survivor.height / 2;
                survivor.isJumping = false;
            }
        });

        if (survivor.y >= canvas.height - survivor.height / 2) {
            survivor.y = canvas.height - survivor.height / 2;
            survivor.isJumping = false;
        }
    }

    // Move zombies
    zombies.forEach((zombie, index) => {
        if (zombie.direction === 'left') {
            zombie.x -= zombie.speed;
        } else {
            zombie.x += zombie.speed;
        }

        // Check collision with survivor horizontally
        if (zombie.y > survivor.y - survivor.height / 2 && 
            zombie.y < survivor.y + survivor.height / 2 && 
            zombie.x < survivor.x + survivor.width / 2 && 
            zombie.x + zombie.width > survivor.x - survivor.width / 2) {
            survivor.health -= 10;
            zombies.splice(index, 1);
            if (survivor.health <= 0) {
                survivor.isAlive = false;
                survivor.health = 0;
            }
            document.getElementById('healthValue').innerText = survivor.health;
        }

        // Make zombies shoot at specific interval
        if (Math.random() <0.001) {
            zombieShoot(zombie);
        }
        
    });

    // Move zombie bullets
    zombieBullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            zombieBullets.splice(index, 1);
        }

        // Check collision with survivor
        if (bullet.x < survivor.x + survivor.width / 2 &&
            bullet.x + bullet.width > survivor.x - survivor.width / 2 &&
            bullet.y < survivor.y + survivor.height / 2 &&
            bullet.y + bullet.height > survivor.y - survivor.height / 2) {
            survivor.health -= 5;
            zombieBullets.splice(index, 1);
            if (survivor.health <= 0) {
                survivor.isAlive = false;
                survivor.health = 0;
                alert(`Game Over! You have been overtaken by the zombies,Your score is:${score} `);
            }
            document.getElementById('healthValue').innerText = survivor.health;
        }
    });

    // Move bullets
    bullets.forEach((bullet, index) => {
        bullet.y += bullet.vy;
        bullet.vy += gravity;
        bullet.x += bullet.vx;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }

        // Check collision with zombies
        zombies.forEach((zombie, zIndex) => {
            if (bullet.x < zombie.x + zombie.width &&
                bullet.x + bullet.width > zombie.x &&
                bullet.y < zombie.y + zombie.height &&
                bullet.y + bullet.height > zombie.y) {
                zombies.splice(zIndex, 1);
                bullets.splice(index, 1);
                score += 5; // Increase score for each zombie killed
                document.getElementById('scoreValue').innerText = score;
            }
        });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSurvivor();
    zombies.forEach(zombie => drawZombie(zombie));
    bullets.forEach(bullet => drawBullet(bullet));
    zombieBullets.forEach(bullet => drawZombieBullet(bullet));
    drawBoxes();
    drawTraceLine();
}

function gameLoop() {
    if (gameOver) return;
    if (!gamePaused) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function updateTimer() {
    if (timeRemaining > 0) {
        timeRemaining--;
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('timerValue').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        gameOver = true;
        alert(`Time's up! Your score: ${score}`);
    }
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        gamePaused = !gamePaused;
    } else if (e.key === ' ') {
        if (!survivor.isJumping) {
            survivor.isJumping = true;
            survivor.jumpSpeed = 10;
        }
    } else if (e.key === 'a' || e.key === 'A') {
        survivor.x -= survivor.moveSpeed;
    } else if (e.key === 'd' || e.key === 'D') {
        survivor.x += survivor.moveSpeed;
    }
});

canvas.addEventListener('mousedown', (e) => {
    tracing = true;
    traceStartX = survivor.x;
    traceStartY = survivor.y;
    traceEndX = e.offsetX;
    traceEndY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (tracing) {
        traceEndX = e.offsetX;
        traceEndY = e.offsetY;
    }
});

canvas.addEventListener('mouseup', (e) => {
    tracing = false;
    const dx = traceEndX - traceStartX;
    const dy = traceEndY - traceStartY;
    const angle = Math.atan2(dy, dx);
    const vx = bulletSpeed * Math.cos(angle);
    const vy = bulletSpeed * Math.sin(angle);
    bullets.push({
        x: survivor.x,
        y: survivor.y,
        width: 10,
        height: 4,
        vx: vx,
        vy: vy
    });
});

setInterval(() => {
    if (!gamePaused) spawnZombie();
}, 1000);

setInterval(() => {
    if (!gamePaused) updateTimer();
}, 1000);

gameLoop();
