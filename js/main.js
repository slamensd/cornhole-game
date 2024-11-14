// Select canvas and set up context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const board = { x: 50, y: 600, width: 300, height: 200 };  // Check if the board height should be reduced
const holes = [
    { type: 'circle', x: 200, y: 650, radius: 30 },
    { type: 'square', x: 200, y: 700, size: 50 },
    { type: 'triangle', x: 200, y: 750, size: 60 }
];
let bag = { x: 200, y: 750, radius: 15, type: null };
let throwsLeft = 10;
let timeLeft = 60;
let isThrowing = false;
let isDragging = false;
let score = 0;

// UI elements
const timerEl = document.getElementById('timer');
const throwsEl = document.getElementById('throws');
const scoreEl = document.getElementById('score');
const scoreOverlay = document.getElementById('score-overlay');

// Timer setup
let timerInterval = setInterval(() => {
    if (timeLeft > 0 && throwsLeft > 0) {
        timeLeft--;
        timerEl.innerText = `Time Left: ${timeLeft}s`;
    } else {
        clearInterval(timerInterval);
        alert("Game Over! Time's up or no throws left.");
    }
}, 1000);

// Draw board and holes
function drawBoard() {
    ctx.fillStyle = 'tan';
    ctx.fillRect(board.x, board.y, board.width, board.height);
    ctx.fillStyle = 'black';

    // Draw circle hole
    ctx.beginPath();
    ctx.arc(holes[0].x, holes[0].y, holes[0].radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw square hole
    ctx.fillRect(holes[1].x - holes[1].size / 2, holes[1].y - holes[1].size / 2, holes[1].size, holes[1].size);

    // Draw triangle hole
    ctx.beginPath();
    ctx.moveTo(holes[2].x, holes[2].y - holes[2].size / 2);
    ctx.lineTo(holes[2].x - holes[2].size / 2, holes[2].y + holes[2].size / 2);
    ctx.lineTo(holes[2].x + holes[2].size / 2, holes[2].y + holes[2].size / 2);
    ctx.closePath();
    ctx.fill();
}

// Draw the bag and animate scale during throw
function drawBag() {
    if (!bag.type) return;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(bag.x, bag.y, bag.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Slingshot mechanic for drawing angle and power line
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Animation for scaling up and down (representing an arc) should be checked during the throw logic.

// Next Steps: Review and adjust the rest of the event handling, bag scaling, and game interactions as needed.
