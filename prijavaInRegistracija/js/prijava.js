document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorMessage = document.getElementById('errorMessage');

    if (error === '1') {
        errorMessage.textContent = 'Napačno uporabniško ime ali geslo';

        setTimeout(function () {
            errorMessage.textContent = '';
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    } else if (error === '2') {
        errorMessage.textContent = 'Napaka na strežniku, prosimo poskusite znova';

        setTimeout(function () {
            errorMessage.textContent = '';
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }
});
