const usernameInput = document.getElementById('uporabniskoIme');
const usernameError = document.getElementById('napakaUporabniskoIme');

usernameInput.addEventListener('blur', async function () {
    const uporabniskoIme = this.value;

    try {
        const response = await fetch('/preveriIme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uporabniskoIme })
        });

        const data = await response.json();
        usernameError.textContent = data.available ? '' : 'To uporabniško ime je že zasedeno';
    } catch (error) {
        console.error('Napaka pri preverjanju imena:', error);
    }
});

document.getElementById('registracija').addEventListener('submit', function (e) {
    const password = document.getElementById('geslo').value;
    const confirmPassword = document.getElementById('potrdiGeslo').value;
    const passwordError = document.getElementById('napakaGeslo');

    let isValid = true;

    // Preveri dolžino gesla
    if (password.length < 6) {
        passwordError.textContent = 'Geslo mora imeti vsaj 6 znakov!';
        isValid = false;
    } else if (password !== confirmPassword) {
        passwordError.textContent = 'Gesli se ne ujemata!';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }

    if (usernameError.textContent !== '') {
        isValid = false;
    }

    if (!isValid) {
        e.preventDefault();
    }
});
