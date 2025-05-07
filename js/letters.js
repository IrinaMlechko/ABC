const letters = [
    'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К',
    'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц',
    'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
];

const container = document.getElementById('lettersContainer');

letters.forEach(letter => {
    const div = document.createElement('div');
    div.className = 'letter';
    div.textContent = `${letter} ${letter.toLowerCase()}`;
    div.onclick = () => {
        localStorage.setItem('currentLetter', letter);
        const msg = new SpeechSynthesisUtterance(`Изучаем, букву, ${letter}`);
        msg.rate = 0.4;
        speechSynthesis.speak(msg);

        setTimeout(() => {
            window.location.href = `letter.html?char=${encodeURIComponent(letter)}`;
        }, 2000);
    };
    container.appendChild(div);
});