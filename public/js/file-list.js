let files = [];

document.addEventListener('DOMContentLoaded', function() {
    pridobiDatoteke();
});

function pridobiDatoteke() {
    fetch('/api/files')
        .then(response => response.json())
        .then(data => {
            files = data; 
            prikaziDatoteke(files); 
        })
        .catch(error => console.error('Napaka pri pridobivanju datotek:', error));
}

function prikaziDatoteke(files) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; 

    files.forEach(file => {
        const li = document.createElement('li');
        li.setAttribute('data-name', file.name);
        li.setAttribute('data-size', file.size);
        li.setAttribute('data-date', file.createdAt);

        const span = document.createElement('span');
        if (file.isDirectory) {
            span.innerHTML = `<i class="fas fa-folder"></i> ${file.name} (Mapa)`;
        } else {
            span.innerHTML = `<i class="fas fa-file"></i> ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
        }

        const actions = document.createElement('div');
        actions.className = 'actions';
        if (file.isDirectory) {
            actions.innerHTML = `<a href="/downloadFolder/${file.name}"><i class="fa-solid fa-download"></i></a>`;
        } else {
            actions.innerHTML = `<a href="/nalozeneDatoteke/${file.name}" download><i class="fa-solid fa-download"></i></a>`;
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-filename', file.name);
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        actions.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(actions);
        fileList.appendChild(li);
    });
}

// Globalna funkcija za osvežitev seznama
function osveziSeznamDatotek() {
    pridobiDatoteke();
}