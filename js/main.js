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

// Draw the game board with only the circular target
function drawBoard() {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 5); // Move to higher position
    ctx.rotate(-Math.PI / 2); // Rotate the board to face portrait
    ctx.fillStyle = '#e6b800';
    ctx.fillRect(-canvas.width / 4, -canvas.height / 8, canvas.width / 2, canvas.height / 4);
    ctx.restore();

    // Draw circular target
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 3, 20, 0, Math.PI * 2);
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

    let maxDistance = canvas.height; // Maximum throw distance beyond the board
    let scaledPower = (power / 100) * maxDistance; // Convert power to actual distance
    let initialY = bag.y;
    let peakY = initialY - scaledPower; // Peak position

    let scalingFactor = 1 + (scaledPower / maxDistance) * 0.15; // 15% scaling

    let animationProgress = 0; // Track animation progress from 0 to 1

    let animationInterval = setInterval(() => {
        clearCanvas();
        drawBoard();

        // Update animation progress
        animationProgress += 0.02; // Adjust step for smooth animation

        // Calculate the new Y position using linear interpolation
        if (animationProgress <= 0.5) {
            // Scale up phase
            bag.radius = bag.originalRadius * (1 + scalingFactor * (animationProgress * 2));
            bag.y = initialY - (scaledPower * animationProgress * 2); // Moving up
        } else {
            // Scale down phase
            bag.radius = bag.originalRadius * (1 + scalingFactor * (2 - animationProgress * 2));
            bag.y = peakY + (scaledPower * (animationProgress - 0.5) * 2); // Moving down
        }

        drawBag();

        // Stop the animation at the end
        if (animationProgress >= 1) {
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
    bag.radius = bag.originalRadius;
}

// Initial draw
drawBoard();
drawSlider();
drawBag();
