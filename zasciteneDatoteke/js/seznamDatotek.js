let files = [];

document.addEventListener('DOMContentLoaded', function() {
    pridobiDatoteke();
});

function pridobiDatoteke() {
    fetch('/datoteke')
        .then(response => response.json())
        .then(data => {
            files = data; 
            prikaziDatoteke(files); 
        })
        .catch(error => console.error('Napaka pri pridobivanju datotek:', error));
}

function formatirajVelikost(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

async function pridobiVelikostMape(imeMape) {
    try {
        const response = await fetch(`/velikostMape/${encodeURIComponent(imeMape)}`);
        const data = await response.json();
        return data.velikost || 0;
    } catch (error) {
        console.error('Napaka pri pridobivanju velikosti mape:', error);
        return 0;
    }
}

async function prikaziDatoteke(files) {
    const fileList = document.getElementById('seznamDatotek');
    if (!fileList) {
        console.error('Element z ID "file-list" ni bil najden');
        return;
    }
    fileList.innerHTML = '';

    if (files.length === 0) {
        fileList.innerHTML = '<li>Ni datotek za prikaz</li>';
        return;
    }

    for (const file of files) {
        const li = document.createElement('li');
        li.setAttribute('data-name', file.name);
        li.setAttribute('data-size', file.size);
        li.setAttribute('data-date', file.createdAt);

        const span = document.createElement('span');
        if (file.isDirectory) {
            const velikostMape = await pridobiVelikostMape(file.name);
            span.innerHTML = `<i class="fas fa-folder"></i> ${file.name} (${formatirajVelikost(velikostMape)})`;
        } else {
            span.innerHTML = `<i class="fas fa-file"></i> ${file.name} (${formatirajVelikost(file.size)})`;
        }

        const actions = document.createElement('div');
        actions.className = 'actions';
        if (file.isDirectory) {
            actions.innerHTML = `<a href="/prenesiMapo/${encodeURIComponent(file.name)}"><i class="fa-solid fa-download"></i></a>`;
        } else {
            actions.innerHTML = `<a href="/nalozeneDatoteke/${encodeURIComponent(file.name)}" download><i class="fa-solid fa-download"></i></a>`;
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-filename', file.name);
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        deleteBtn.addEventListener('click', () => izbrisiDatoteko(file.name));
        actions.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(actions);
        fileList.appendChild(li);
    }
}


function osveziSeznamDatotek() {
    pridobiDatoteke();
}