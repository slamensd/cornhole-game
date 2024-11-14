// Select elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const throwsLeftEl = document.getElementById('throws-left');
const scoreEl = document.getElementById('score');
const timeLeftEl = document.getElementById('time-left');

// Game variables
let throwsLeft = 10;
let score = 0;
let timeLeft = 60;
let isDragging = false;
let isThrowing = false;
let startPoint = null;
let endPoint = null;
let currentBag = null;
const bag = { x: canvas.width / 2, y: canvas.height - 0.08 * window.innerHeight, radius: 15, type: null };

// Timer
let timerInterval = setInterval(() => {
    if (timeLeft > 0 && throwsLeft > 0) {
        timeLeft--;
        timeLeftEl.textContent = `Time: ${timeLeft}s`;
    } else {
        clearInterval(timerInterval);
        alert('Game Over! Time\'s up or no throws left.');
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

    let angle = Math.atan2(dy, dx);
    let power = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, 20);

    animateThrow(angle, power);
}

function animateThrow(angle, power) {
    if (isThrowing) return;
    isThrowing = true;
    throwsLeft--;
    throwsLeftEl.textContent = `Throws Left: ${throwsLeft}`;

    let vx = power * Math.cos(angle);
    let vy = power * Math.sin(angle) * -1;
    let gravity = 0.5;
    let scaleFactor = 1.15;

    let animationInterval = setInterval(() => {
        clearCanvas();
        drawBoard();

        // Update bag position and scale
        bag.x += vx;
        bag.y += vy;
        bag.radius *= scaleFactor;

        vy += gravity;

        drawBag();

        // End animation condition
        if (bag.y > canvas.height || bag.x < 0 || bag.x > canvas.width) {
            clearInterval(animationInterval);
            isThrowing = false;
            resetBag();
        }
    }, 30);
}

// Clear canvas function
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Reset bag position
function resetBag() {
    bag.x = canvas.width / 2;
    bag.y = canvas.height - 0.08 * window.innerHeight;
    bag.radius = 15;
}

// Initial draw
clearCanvas();
drawBoard();
drawBag();
