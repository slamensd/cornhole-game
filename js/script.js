document.addEventListener('DOMContentLoaded', () => {
    const paper = document.getElementById('paper');
    const basket = document.getElementById('basket');
    const scoreElement = document.getElementById('score');
    let score = 0;

    let isDragging = false;
    let initialX = 0;
    let initialY = 0;
    let velocityX = 0;
    let velocityY = 0;

    paper.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX;
        initialY = e.clientY;
        paper.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        const offsetX = currentX - initialX;
        const offsetY = currentY - initialY;

        velocityX = offsetX / 15; // Adjust this for a better toss
        velocityY = offsetY / 15;

        paper.style.transform = `translate(${offsetX}px, ${-offsetY}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;

        isDragging = false;
        paper.style.cursor = 'grab';

        // Apply animation to simulate the paper toss
        animateToss(velocityX, -velocityY);
    });

    function animateToss(vx, vy) {
        let x = paper.offsetLeft;
        let y = paper.offsetTop;
        const interval = setInterval(() => {
            vy += 0.5; // Gravity effect

            x += vx;
            y += vy;

            paper.style.left = `${x}px`;
            paper.style.top = `${y}px`;

            if (y >= basket.offsetTop && x >= basket.offsetLeft && x <= basket.offsetLeft + basket.offsetWidth) {
                score++;
                scoreElement.textContent = score;
                clearInterval(interval);
                resetPaper();
            }

            if (y > document.querySelector('.game-container').clientHeight) {
                clearInterval(interval);
                resetPaper();
            }
        }, 16);
    }

    function resetPaper() {
        paper.style.left = '50%';
        paper.style.bottom = '10px';
        paper.style.transform = 'translateX(-50%)';
    }
});
