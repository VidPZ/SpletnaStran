document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('uploadFormFile').addEventListener('submit', uploadFile);
    document.getElementById('uploadFormFolder').addEventListener('submit', uploadFolder);
});

function uploadFile(e) {
    
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('/uploadFile', {
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

function uploadFolder(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('/uploadFolder', {
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
