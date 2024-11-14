// Select elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sliderCanvas = document.getElementById('sliderCanvas');
const sliderCtx = sliderCanvas.getContext('2d');
const scoreOverlay = document.createElement('div'); // Create score overlay

document.body.appendChild(scoreOverlay);
scoreOverlay.style.position = 'fixed';
scoreOverlay.style.top = '40%';
scoreOverlay.style.left = '50%';
scoreOverlay.style.transform = 'translate(-50%, -50%)';
scoreOverlay.style.fontSize = '48px';
scoreOverlay.style.fontWeight = 'bold';
scoreOverlay.style.color = 'black';
scoreOverlay.style.display = 'none';
scoreOverlay.style.zIndex = '1000';

let throwsLeft = 10;
let score = 0;
let timeLeft = 60;
let isDraggingBall = false;
let power = 0;
let viewportOffset = 0; // Track the current scroll offset
const canvasHeight = window.innerHeight * 3; // Set the canvas height to 3x the viewport height
canvas.height = canvasHeight; // Adjust the canvas size
canvas.style.backgroundColor = 'lightgreen'; // Add a background color for visual feedback

const bag = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    radius: 15,
    originalRadius: 15,
    weight: 1.5, // Weight property to affect drag
    isMoving: false
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

// Draw the game board and target hole at the top of the board
function drawBoard() {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 5); // Move to higher position
    ctx.rotate(-Math.PI / 2); // Rotate the board to face portrait
    ctx.fillStyle = '#e6b800';
    ctx.fillRect(-canvas.width / 4, -canvas.height / 8, canvas.width / 2, canvas.height / 4);
    ctx.restore();

    // Draw circular target (bullseye) at the top of the board
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 5 - 40, 20, 0, Math.PI * 2); // Adjusted position for top of the board
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
    ctx.arc(bag.x, bag.y - viewportOffset, bag.radius, 0, Math.PI * 2); // Adjust for viewport offset
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

// Throw the bag with power based on slider value and scroll the viewport
function throwBag() {
    if (throwsLeft <= 0) return;
    throwsLeft--;
    throwsLeftEl.textContent = `Throws Left: ${throwsLeft}`;

    let maxDistance = canvas.height; // Maximum throw distance
    let scaledPower = (power / 100) * maxDistance; // Convert power to actual distance
    let initialY = bag.y;
    let finalY = initialY - scaledPower; // End position at peak

    let midpointY = initialY - (scaledPower / 2); // Midpoint for peak size
    let scalingFactor = 1 + 0.15; // Max scaling of 15%

    bag.isMoving = true;
    let animationProgress = 0; // Track animation progress from 0 to 1

    let animationInterval = setInterval(() => {
        clearCanvas();
        drawBoard();

        // Update animation progress
        animationProgress += 0.02; // Adjust step for smooth animation

        // Calculate the new Y position using linear interpolation
        bag.y = initialY - (scaledPower * animationProgress);

        // Adjust viewport to follow the bag's movement
        if (bag.y < canvas.height - window.innerHeight && bag.y > window.innerHeight) {
            viewportOffset = canvas.height - bag.y - window.innerHeight;
        }

        // Scale the bag: enlarge up to the midpoint, then shrink
        if (animationProgress <= 0.5) {
            // Scale up phase until midpoint
            bag.radius = bag.originalRadius * (1 + scalingFactor * (animationProgress * 2));
        } else {
            // Scale down phase after midpoint
            bag.radius = bag.originalRadius * (1 + scalingFactor * (2 - animationProgress * 2));
        }

        drawBag();

        // Stop the animation at the end of the throw
        if (animationProgress >= 1) {
            clearInterval(animationInterval);
            bag.isMoving = false;
            applyLandingDrag();
        }
    }, 30);
}

// Apply drag effect and handle scoring when the bag lands
function applyLandingDrag() {
    let dragSpeed = 2; // Initial drag speed for the bag
    let randomDragFactor = Math.random() * 1.5 + 0.5; // Randomize drag between 0.5 and 2x
    let dragInterval = setInterval(() => {
        clearCanvas();
        drawBoard();

        // Simulate drag by gradually slowing down the bag's movement
        if (bag.y > canvas.height / 5 && bag.y <= canvas.height / 4 + canvas.height / 8) {
            bag.y -= dragSpeed * randomDragFactor;
            dragSpeed *= 0.9; // Slow down the drag effect gradually

            if (dragSpeed < 0.1) { // Stop when drag becomes negligible
                clearInterval(dragInterval);
                handleLanding();
            }
        } else {
            clearInterval(dragInterval);
            handleLanding();
        }

        drawBag(); // Redraw the bag at its new position
    }, 30);
}

// Handle landing logic for scoring
function handleLanding() {
    let holeCenterX = canvas.width / 2;
    let holeCenterY = canvas.height / 5 - 40;
    let holeRadius = 20;
    let distanceToHole = Math.sqrt(Math.pow(bag.x - holeCenterX, 2) + Math.pow(bag.y - holeCenterY, 2));

    let inHole = distanceToHole <= holeRadius * 0.75; // 3/4 coverage requirement
    let onBoard = bag.y >= canvas.height / 5 && bag.y <= canvas.height / 4 + canvas.height / 8 &&
                  bag.x >= canvas.width / 4 && bag.x <= (canvas.width / 4) + (canvas.width / 2);

    if (inHole) {
        score += 3;
        showScoreOverlay('+3 Points!');
    } else if (onBoard) {
        score += 1;
        showScoreOverlay('+1 Point!');
    }

    scoreEl.textContent = `Score: ${score}`;
    setTimeout(() => {
        resetBag(); // Reset the bag to the origin for the next throw
    }, 1000); // Wait before resetting for the next throw
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
    ctx.translate(0, viewportOffset); // Adjust the canvas to simulate scrolling
}

// Reset bag position to origin for the next throw
function resetBag() {
    viewportOffset = 0; // Reset the viewport to the bottom of the canvas
    bag.x = canvas.width / 2;
    bag.y = canvas.height - 60;
    bag.radius = bag.originalRadius;
    drawBoard();
    drawBag();
}

// Initial draw to ensure a bag is present at the start
drawBoard();
drawSlider();
drawBag();
