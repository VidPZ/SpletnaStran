document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('vrstniRed').addEventListener('change', sortirajDatoteke);
});

function sortirajDatoteke() {
    const sortOrder = document.getElementById('vrstniRed').value;
    let sortedFiles = [...files];

    switch (sortOrder) {
        case 'abecedno':
            sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'velikost':
            sortedFiles.sort((a, b) => b.size - a.size);
            break;
        case 'datum':
            sortedFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    prikaziDatoteke(sortedFiles);
}
