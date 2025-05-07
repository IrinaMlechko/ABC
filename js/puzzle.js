const NUM_PIECES = 6;
const originalPositions = [];
let snappedCount = 0;
let draggedImage = null;
let shiftX = 0;
let shiftY = 0;
let isComplete = false;

window.addEventListener('DOMContentLoaded', () => {
    const letter = localStorage.getItem('currentLetter');
    document.querySelector('.copy-piece').textContent = letter.toUpperCase();
    setupPuzzleBackButton();
    requestAnimationFrame(() => {
        const fadedText = document.querySelector('.copy-piece');
        const bbox = fadedText.getBBox();
        const pieceWidth = bbox.width / NUM_PIECES;
        const defs = document.querySelector('svg defs');
        defs.innerHTML = '';

        for (let i = 0; i < NUM_PIECES; i++) {
            const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clip.setAttribute('id', `clip${i + 1}`);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', `${bbox.x + i * pieceWidth}`);
            rect.setAttribute('y', `${bbox.y}`);
            rect.setAttribute('width', `${pieceWidth}`);
            rect.setAttribute('height', `${bbox.height}`);

            clip.appendChild(rect);
            defs.appendChild(clip);
        }

        createPieces(letter.toUpperCase(), bbox);
        setTimeout(movePieces, 500);
    });
});

function setupPuzzleBackButton() {
    const backBtn = document.getElementById('puzzleBackBtn');
    const letter = localStorage.getItem('currentLetter');

    if (letter && backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `letter.html?char=${encodeURIComponent(letter)}`;
        });
    }
}

function createPieces(letter, bbox) {
    const mainSvg = document.getElementById('letter');
    const bounding = mainSvg.getBoundingClientRect();

    for (let i = 0; i < NUM_PIECES; i++) {
        const pieceSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        pieceSvg.setAttribute('viewBox', '0 0 100 100');
        pieceSvg.classList.add('puzzle-piece');
        pieceSvg.style.left = `${bounding.left}px`;
        pieceSvg.style.top = `${bounding.top}px`;
        pieceSvg.style.width = `${bounding.width}px`;
        pieceSvg.style.height = `${bounding.height}px`;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '50%');
        text.setAttribute('clip-path', `url(#clip${i + 1})`);
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('draggable');
        text.textContent = letter;

        text.addEventListener('mousedown', dragStart, false);
        text.addEventListener('touchstart', dragStart, { passive: false });
        pieceSvg.appendChild(text);
        document.body.appendChild(pieceSvg);

        originalPositions[i] = {
            x: bounding.left,
            y: bounding.top,
            element: pieceSvg,
            snapped: false
        };
    }
}

function movePieces() {
    originalPositions.forEach(({element}) => {
        const offsetX = (Math.random() - 0.5) * 200;
        const offsetY = (Math.random() - 0.5) * 200;
        const left = parseFloat(element.style.left);
        const top = parseFloat(element.style.top);
        element.style.left = `${left + offsetX}px`;
        element.style.top = `${top + offsetY}px`;
    });
}

function getEventCoords(e) {
    if (e.touches) {
        return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    } else {
        return {x: e.clientX, y: e.clientY};
    }
}

function getElementPosition(el) {
    const rect = el.getBoundingClientRect();
    return {left: rect.left + window.scrollX, top: rect.top + window.scrollY};
}

function dragStart(e) {
    if (isComplete) return;
    e.preventDefault();
    const {x, y} = getEventCoords(e);
    draggedImage = e.currentTarget.parentNode;
    const pos = getElementPosition(draggedImage);
    shiftX = x - pos.left;
    shiftY = y - pos.top;
    draggedImage.style.zIndex = '1000';
    draggedImage.style.transition = 'none';

    document.body.addEventListener('mousemove', dragMove, false);
    document.body.addEventListener('mouseup', dragEnd, false);
    document.body.addEventListener('touchend', dragEnd, { passive: false });
    document.body.addEventListener('touchmove', dragMove, { passive: false });
}

function dragMove(e) {
    if (!draggedImage || isComplete) return;
    const {x, y} = getEventCoords(e);
    draggedImage.style.left = `${x - shiftX}px`;
    draggedImage.style.top = `${y - shiftY}px`;
}

function dragEnd(e) {
    if (!draggedImage || isComplete) return;
    e.preventDefault();
    const index = originalPositions.findIndex(pos => pos.element === draggedImage);
    const {x, y} = originalPositions[index];
    const rect = draggedImage.getBoundingClientRect();
    const dx = rect.left - x;
    const dy = rect.top - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20 && !originalPositions[index].snapped) {
        draggedImage.style.transition = 'left 0.4s ease, top 0.4s ease';
        draggedImage.style.left = `${x}px`;
        draggedImage.style.top = `${y}px`;
        originalPositions[index].snapped = true;
        snappedCount++;

        const text = draggedImage.querySelector('text');
        text.removeEventListener('mousedown', dragStart);
        text.removeEventListener('touchstart', dragStart);
        text.style.pointerEvents = 'none';
        draggedImage.style.pointerEvents = 'none';

        draggedImage.classList.add('piece-snapped');

        const pop = document.getElementById('pop-sound');
        if (pop) {
            pop.currentTime = 0;
            pop.play();
        }

        const thisPiece = draggedImage;

        setTimeout(() => {
            thisPiece.classList.remove('piece-snapped');
            if (snappedCount === NUM_PIECES) {
                glueAnimation();
                const letter = localStorage.getItem('currentLetter');
                scoreForLetter(letter, 'puzzle');
            }
        }, 300);
    }

    if (draggedImage) {
        draggedImage.style.zIndex = '1';
    }
    document.body.style.cursor = 'default';
    draggedImage = null;
}

function glueAnimation() {
    originalPositions.forEach(({element}) => {
        const text = element.querySelector('text');
        if (text) {
            text.classList.add('glue-animation');
            text.style.pointerEvents = 'none';
        }
        element.style.pointerEvents = 'none';
    });
    const glue = document.getElementById('glue-sound');
    if (glue) {
        glue.currentTime = 0;
        glue.play();
    }
    isComplete = true;
}

window.addEventListener('resize', () => {
    const mainSvg = document.getElementById('letter');
    const bounding = mainSvg.getBoundingClientRect();

    originalPositions.forEach((pos, index) => {
        const element = pos.element;
        const offsetLeft = parseFloat(element.style.left) - pos.x;
        const offsetTop = parseFloat(element.style.top) - pos.y;

        pos.x = bounding.left;
        pos.y = bounding.top;

        element.style.left = `${bounding.left + offsetLeft}px`;
        element.style.top = `${bounding.top + offsetTop}px`;

        element.style.width = `${bounding.width}px`;
        element.style.height = `${bounding.height}px`;
    });
});
