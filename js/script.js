document.addEventListener('DOMContentLoaded', () => {
    const paper = document.getElementById('paper');
    const basket = document.getElementById('basket');
    const scoreElement = document.getElementById('score');
    let score = 0;

    paper.addEventListener('mousedown', (e) => {
        const initialX = e.clientX;
        const initialY = e.clientY;

        function onMouseMove(e) {
            const offsetX = e.clientX - initialX;
            const offsetY = e.clientY - initialY;

            paper.style.transform = `translate(${offsetX}px, ${-offsetY}px)`;

            if (detectCollision(paper, basket)) {
                score++;
                scoreElement.textContent = score;
                resetPaper();
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            resetPaper();
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function resetPaper() {
        paper.style.transform = 'translate(0, 0)';
    }

    function detectCollision(paper, basket) {
        const paperRect = paper.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();

        return !(
            paperRect.top > basketRect.bottom ||
            paperRect.bottom < basketRect.top ||
            paperRect.left > basketRect.right ||
            paperRect.right < basketRect.left
        );
    }
});
