// Select elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sliderCanvas = document.getElementById('sliderCanvas');
const sliderCtx = sliderCanvas.getContext('2d');
const sliderBall = document.getElementById('slider-ball');

let throwsLeft = 10;
let score = 0;
let timeLeft = 60;
let isDraggingBall = false;
let power = 0;
const bag = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    radius: 15,
    originalRadius: 15
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

// Draw the game board and targets
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

// Draw the slider (right triangle)
function drawSlider() {
    sliderCtx.clearRect(0, 0, sliderCanvas.width, sliderCanvas.height);
    sliderCtx.fillStyle = 'green';
    sliderCtx.beginPath();
    sliderCtx.moveTo(0, 50);
    sliderCtx.lineTo(sliderCanvas.width, 50);
    sliderCtx.lineTo(sliderCanvas.width, 0);
    sliderCtx.closePath();
    sliderCtx.fill();
}

// Draw bag
function drawBag() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(bag.x, bag.y, bag.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Move the slider ball based on mouse/touch input
sliderBall.addEventListener('mousedown', (e) => {
    isDraggingBall = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingBall) {
        const rect = sliderCanvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;

        // Keep the ball within the bounds of the slider
        if (mouseX < 0) mouseX = 0;
        if (mouseX > rect.width) mouseX = rect.width;

        // Update the position of the slider ball and calculate power
        sliderBall.style.left = `${mouseX - 7}px`;
        power = (mouseX / rect.width) * 100; // Calculate power as a percentage
    }
});

document.addEventListener('mouseup', () => {
    if (isDraggingBall) {
        isDraggingBall = false;
        throwBag();
    }
});

// Throw the bag with power based on slider value
function throwBag() {
    if (throwsLeft <= 0) return;
    throwsLeft--;
    throwsLeftEl.textContent = `Throws Left: ${throwsLeft}`;
    
    let angle = -Math.PI / 4; // Fixed angle for simplicity
    let maxDistance = canvas.height / 2; // Maximum throw distance
    let scaledPower = (power / 100) * maxDistance; // Convert power to actual distance
    let vy = -scaledPower; // Vertical velocity

    let gravity = 0.5; // Simulate gravity

    let animationInterval = setInterval(() => {
        clearCanvas();
        drawBoard();

        // Update bag position and check if it hits the board
        bag.y += vy;
        vy += gravity; // Gravity effect

        drawBag();

        if (bag.y > canvas.height || bag.x < 0 || bag.x > canvas.width) {
            clearInterval(animationInterval);
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
    bag.y = canvas.height - 60;
}

// Initial draw
drawBoard();
drawSlider();
drawBag();
