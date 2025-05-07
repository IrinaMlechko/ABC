const createStar = (left, top, delay, scale) => {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = left + '%';
    star.style.top = top + '%';
    star.style.animationDelay = delay + 's';
    star.style.transform = `scale(${scale})`;
    star.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2L14.8 8.6L22 9.3L17 14.2L18.5 21.4L12 17.8L5.5 21.4L7 14.2L2 9.3L9.2 8.6L12 2Z"/>
        </svg>`;
    document.body.appendChild(star);
};

const amountOfStarts = 30;
for (let i = 0; i < amountOfStarts; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 3;
    const scale = 0.6 + Math.random() * 0.8;
    createStar(left, top, delay, scale);
}