document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('naloziDatoteko').addEventListener('submit', naloziDatoteko);
    document.getElementById('uploadFormFolder').addEventListener('submit', naloziMapo);
});

function naloziDatoteko(e) {
    
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('/naloziDatoteko', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            setTimeout(() => location.reload(), 1000);
        }
    })
    .catch(error => console.error('Napaka pri nalaganju datoteke:', error));
}

function naloziMapo(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('/naloziMapo', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            setTimeout(() => location.reload(), 500);
        }
    })
    .catch(error => console.error('Napaka pri nalaganju mape:', error));
}
