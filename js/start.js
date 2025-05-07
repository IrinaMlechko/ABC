const progressPanel = document.getElementById('progressPanel');
const progressTable = document.getElementById('progressTable');
const showProgressBtn = document.getElementById('showProgress');
const closeProgressBtn = document.getElementById('closeProgress');
const startGameBtn = document.getElementById('startGame');

const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
const storageName = "MLECHKA_ABC_TABLEOFRESULTS";

function checkAndInitializeData() {
    return fetch(ajaxHandlerScript, {
        method: 'post',
        body: new URLSearchParams({
            f: 'READ',
            n: storageName
        })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.result) {
                console.log("Результат пустой");
                const initData = {};
                'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.toUpperCase().split('').forEach(letter => {
                    initData[letter] = {};
                });

                return fetch(ajaxHandlerScript, {
                    method: 'post',
                    body: new URLSearchParams({
                        f: 'INSERT',
                        n: storageName,
                        v: JSON.stringify(initData)
                    })
                })
                    .then(res => res.json())
                    .then(() => initData);
            } else {
                return JSON.parse(data.result);
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке/инициализации данных:', error);
            throw error;
        });
}

startGameBtn.addEventListener('click', (event) => {
    event.preventDefault();
    checkAndInitializeData()
        .then(() => {
            window.location.href = startGameBtn.href;
        })
        .catch((error) => {
            console.error("Ошибка при инициализации данных перед игрой:", error);
        });
});

showProgressBtn.addEventListener('click', (event) => {
    event.preventDefault();
    checkAndInitializeData()
        .then(data => {
            console.log('Показать прогресс:', data);
            showProgressPanel(data);
        });
});

closeProgressBtn.addEventListener('click', () => {
    progressPanel.classList.remove('visible');
});

const MAX_KEYS_PER_LETTER = 2;

function getProgressColor(percent) {
    if (percent <= 33) return '#f44336';
    if (percent <= 66) return '#ff9800';
    return '#4caf50';
}

function showProgressPanel(data) {
    progressTable.innerHTML = '';

    Object.entries(data).forEach(([letter, letterData]) => {
        const keysCount = typeof letterData === 'object' && letterData !== null
            ? Object.keys(letterData).length
            : 0;
        const percent = Math.round((keysCount / MAX_KEYS_PER_LETTER) * 100);
        const color = getProgressColor(percent);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 30px; font-weight: bold;">${letter.toUpperCase()}</td>
            <td style="width: 100%">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%; background-color: ${color};"></div>
                    <span class="progress-text">${percent}%</span>
                </div>
            </td>
        `;
        progressTable.appendChild(row);
    });

    progressPanel.classList.add('visible');
}

let startX = 0;
let currentX = 0;
let isSwiping = false;
const swipeThreshold = 50;

progressPanel.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        isSwiping = true;
    }
});

progressPanel.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    currentX = e.touches[0].clientX;
});

progressPanel.addEventListener('touchend', () => {
    if (!isSwiping) return;
    const deltaX = currentX - startX;
    if (deltaX > swipeThreshold) {
        progressPanel.classList.remove('visible');
    }
    isSwiping = false;
});

