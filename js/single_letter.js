function buildPageWithPictures() {
    const letter = localStorage.getItem('currentLetter');

    if (!letter) return;

    const heading = document.getElementById('letterTitle');
    heading.textContent = `${letter.toUpperCase()} ${letter.toLowerCase()}`;
    document.title = `Буква ${letter.toUpperCase()}`;

    fetch('data/letters.json')
        .then(response => response.json())
        .then(data => {
            createElements(data, letter);
        })
        .catch(err => {
            console.error('Ошибка загрузки JSON:', err);
        })
        .finally(() => {
            initializeSpeech(letter);
        });
}

function initializeSpeech(currentLetter) {
    const cards = document.querySelectorAll('.image-card');
    let used = {};
    let allClicked = false;

    cards.forEach(card => {
        const caption = card.querySelector('.caption');
        const word = caption.textContent.trim();

        card.addEventListener('click', () => {
            const msg = new SpeechSynthesisUtterance(word);
            msg.lang = 'ru-RU';
            msg.rate = 0.4;
            speechSynthesis.speak(msg);

            if (!(word in used)) {
                used[word] = true;
            }

            if (!allClicked && Object.keys(used).length === cards.length) {
                allClicked = true;
                scoreForLetter(currentLetter, 'words');
            }
        });
    });
}

function createElements(data, letter) {
    const allWords = data[letter.toLowerCase()];
    const container = document.querySelector('.image-grid');

    if (!allWords || allWords.length === 0) {
        container.innerHTML = `<p style="font-size: 2rem; padding: 20px;">Пока нет картинок для буквы "${letter.toUpperCase()}"</p>`;
        return;
    }

    const selectedWords = allWords.length > 8
        ? allWords.sort(() => 0.5 - Math.random()).slice(0, 8)
        : allWords;

    selectedWords.forEach(word => {
        const card = document.createElement('div');
        card.className = 'image-card';

        const img = document.createElement('img');
        img.src = `img/${letter.toLowerCase()}/${word}.svg`;
        img.alt = word;
        img.onerror = () => card.remove();

        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.innerHTML = word.toUpperCase().replace(new RegExp(letter, 'g'), `<span class="highlight">${letter}</span>`);

        card.appendChild(img);
        card.appendChild(caption);
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', buildPageWithPictures);




