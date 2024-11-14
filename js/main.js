// Select canvas and set up context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let throwsLeft = 10;
let score = 0;
let timeLeft = 60;
let isDragging = false;
let isThrowing = false;
let startPoint = null;
let endPoint = null;
const bag = {
    x: canvas.width / 2,
    y: canvas.height - 0.08 * window.innerHeight,
    radius: 15,
    originalRadius: 15,
    type: null
};

// UI elements
const throwsLeftEl = document.getElementById('throws-left');
const scoreEl = document.getElementById('score');
const timeLeftEl = document.getElementById('time-left');

// Timer setup
let timerInterval = setInterval(() => {
    if (timeLeft > 0 && throwsLeft > 0) {
        timeLeft--;
        timeLeftEl.textContent = `Time: ${timeLeft}s`;
    } else {
        clearInterval(timerInterval);
        alert("Game Over! Time's up or no throws left.");
    }
}, 1000);

// Draw board and targets
function drawBoard() {
    ctx.fillStyle = '#e6b800';
    ctx.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 4);

    // Draw shape targets
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 3, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(canvas.width / 2 - 20, canvas.height / 2.5, 40, 40);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 - 20, canvas.height / 2 + 40);
    ctx.lineTo(canvas.width / 2 + 20, canvas.height / 2 + 40);
    ctx.closePath();
    ctx.fill();
}

// Draw bag
function drawBag() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(bag.x, bag.y, bag.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Handle mouse/touch events for dragging and throwing
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (Math.sqrt((mouseX - bag.x) ** 2 + (mouseY - bag.y) ** 2) <= bag.radius) {
        isDragging = true;
        startPoint = { x: mouseX, y: mouseY };
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        clearCanvas();
        drawBoard();
        drawBag();
        drawLine(bag.x, bag.y, mouseX, mouseY);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isDragging) {
        isDragging = false;
        endPoint = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
        calculateThrow();
    }
});

// Draw line for slingshot power direction
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Calculate throw and animate
function calculateThrow() {
    if (!endPoint) return;

    let dx = endPoint.x - startPoint.x;
    let dy = endPoint.y - startPoint.y;

    // Adjust max power and limit scaling effect
    let maxPullDistance = Math.min(Math.sqrt(dx * dx + dy * dy), canvas.height / 4);
    let angle = Math.atan2(dy, dx);
    let power = maxPullDistance / 10;  // Adjust scaling to max throw just over the board

    animateThrow(angle, power);
}

function animateThrow(angle, power) {
    if (isThrowing) return;
    isThrowing = true;
    throwsLeft--;
    throwsLeftEl.textContent = `Throws Left: ${throwsLeft}`;

    let vx = power * Math.cos(angle);
    let vy = power * Math.sin(angle) * -1;  // Upward
    let gravity = 0.5;
    let scalingFactor = 1 + (power / 20) * 0.15;  // Max scale of 15%

    let animationInterval = setInterval(() => {
        clearCanvas();
        drawBoard();

        // Animate bag scaling based on distance
        if (bag.y < canvas.height / 2) {
            bag.radius = bag.originalRadius * scalingFactor;
        } else {
            bag.radius = bag.originalRadius * (2 - scalingFactor);
        }

        // Update bag position
        bag.x += vx;
        bag.y += vy;
        vy += gravity;

        drawBag();

        // Check collision with the board
        if (checkCollisionWithBoard()) {
            clearInterval(animationInterval);
            isThrowing = false;
            score += 3;  // Example score increment for hitting the board
            scoreEl.textContent = `Score: ${score}`;
            showScoreOverlay('+3 Points!');
            setTimeout(resetBag, 1000);  // Wait before spawning the next throw
        } else if (bag.y > canvas.height || bag.x < 0 || bag.x > canvas.width) {
            clearInterval(animationInterval);
            isThrowing = false;
            resetBag();  // Spawn next throw immediately if it misses
        }
    }, 30);
}

// Check if the bag hits the board
function checkCollisionWithBoard() {
    return (
        bag.y >= canvas.height / 4 &&
        bag.y <= canvas.height / 2 &&
        bag.x >= canvas.width / 4 &&
        bag.x <= (canvas.width / 4) + (canvas.width / 2)
    );
}

// Show score overlay animation
function showScoreOverlay(text) {
    scoreOverlay.textContent = text;
    scoreOverlay.style.display = 'block';
    scoreOverlay.style.opacity = '1';

    let opacity = 1;
    let fadeInterval = setInterval(() => {
        opacity -= 0.05;
        scoreOverlay.style.opacity = opacity.toString();
        if (opacity <= 0) {
            clearInterval(fadeInterval);
            scoreOverlay.style.display = 'none';
        }
    }, 50);
}

// Clear canvas function
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Reset bag position
function resetBag() {
    bag.x = canvas.width / 2;
    bag.y = canvas.height - 0.08 * window.innerHeight;
    bag.radius = bag.originalRadius;
}

// Initial draw
clearCanvas();
drawBoard();
drawBag();
