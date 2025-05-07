function getOnfulfilled(currentLetter, ajaxHandlerScript, password, data, typeKey) {
    let updatedData = {};

    if (!data || Object.keys(data).length === 0) {
        'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.toUpperCase().split('').forEach(letter => {
            updatedData[letter] = (letter === currentLetter) ? {[typeKey]: true} : {};
        });
        console.log("Инициализированные данные:", JSON.stringify(updatedData));
    } else {
        updatedData = data;
        const letterState = updatedData[currentLetter] || {};

        if (!letterState[typeKey]) {
            updatedData[currentLetter] = {...letterState, [typeKey]: true};
            console.log(`Обновлено: ${currentLetter} -> ${typeKey}: true`);
        } else {
            console.log(`Уже установлено: ${currentLetter} -> ${typeKey}`);
        }
    }

    return fetch(ajaxHandlerScript, {
        method: 'post',
        body: new URLSearchParams({
            f: 'UPDATE',
            n: 'MLECHKA_ABC_TABLEOFRESULTS',
            p: password,
            v: JSON.stringify(updatedData)
        })
    });
}

function scoreForLetter(currentLetter, typeKey) {
    const password = 123;
    const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";

    fetch(ajaxHandlerScript, {
        method: 'post',
        body: new URLSearchParams({
            f: 'LOCKGET',
            n: 'MLECHKA_ABC_TABLEOFRESULTS',
            p: password
        })
    })
        .then(res => res.json())
        .then(data => {
            let parsed;
            try {
                parsed = data.result ? JSON.parse(data.result) : {};
            } catch (e) {
                console.error("Ошибка парсинга JSON:", e);
                parsed = {};
            }
            return getOnfulfilled(currentLetter, ajaxHandlerScript, password, parsed, typeKey);
        })
        .catch(error => {
            console.error("Ошибка при LOCKGET или UPDATE:", error);
        });
}
