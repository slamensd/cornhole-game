// Select elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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
let isDraggingPower = false;
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

// Power indicator (thermometer-style) setup
const powerIndicator = document.createElement('div');
powerIndicator.style.position = 'fixed';
powerIndicator.style.left = '10px';
powerIndicator.style.top = '10%';
powerIndicator.style.width = '20px';
powerIndicator.style.height = '80%';
powerIndicator.style.backgroundColor = 'gray';
powerIndicator.style.borderRadius = '10px';
document.body.appendChild(powerIndicator);

const powerLevel = document.createElement('div');
powerLevel.style.position = 'absolute';
powerLevel.style.bottom = '0';
powerLevel.style.left = '0';
powerLevel.style.width = '100%';
powerLevel.style.height = '0';
powerLevel.style.backgroundColor = 'red';
powerLevel.style.borderRadius = '10px';
powerIndicator.appendChild(powerLevel);

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

// Initial scroll to show the top of the canvas (board)
function scrollToTop() {
    viewportOffset = 0;
    ctx.setTransform(1, 0, 0, 1, 0, viewportOffset);
    drawBoard();
    drawBag();
}

// Scroll to the bottom to show the starting position of the bag
function scrollToBottom() {
    viewportOffset = canvasHeight - window.innerHeight;
    ctx.setTransform(1, 0, 0, 1, 0, -viewportOffset);
    drawBoard();
    drawBag();
}

// Draw the game board and target hole at the top of the canvas
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

// Draw the bag at the starting position
function drawBag() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(bag.x, bag.y - viewportOffset, bag.radius, 0, Math.PI * 2); // Adjust for viewport offset
    ctx.fill();
}

// Handle power selection by dragging on the power indicator
powerIndicator.addEventListener('mousedown', (e) => {
    isDraggingPower = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingPower) {
        const rect = powerIndicator.getBoundingClientRect();
        let mouseY = e.clientY - rect.top;

        // Keep the power level within bounds
        if (mouseY < 0) mouseY = 0;
        if (mouseY > rect.height) mouseY = rect.height;

        power = (rect.height - mouseY) / rect.height * 100; // Calculate power as a percentage
        powerLevel.style.height = `${power}%`; // Update power level visually
    }
});

document.addEventListener('mouseup', () => {
    if (isDraggingPower) {
        isDraggingPower = false;
        scrollToBottom(); // Scroll to the bottom for the throw setup
        setTimeout(throwBag, 500); // Throw the bag after a brief delay
    }
});

// Throw the bag with power based on the selected value and scroll the viewport
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
        if (bag.y < canvasHeight - window.innerHeight && bag.y > window.innerHeight) {
            viewportOffset = canvasHeight - bag.y - window.innerHeight;
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
    ctx.setTransform(1, 0, 0, 1, 0, -viewportOffset); // Adjust the canvas to simulate scrolling
}

// Reset bag position to origin for the next throw
function resetBag() {
    viewportOffset = canvasHeight - window.innerHeight; // Reset the viewport to the bottom of the canvas
    bag.x = canvas.width / 2;
    bag.y = canvas.height - 60;
    bag.radius = bag.originalRadius;
    drawBoard();
    drawBag();
}

// Initial setup
scrollToTop(); // Start with the board in view
drawSlider(); // Draw the power indicator
drawBag(); // Draw the bag at the bottom for the initial view
