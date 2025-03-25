document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sortOrder').addEventListener('change', sortirajDatoteke);
});

function sortirajDatoteke() {
    const sortOrder = document.getElementById('sortOrder').value;
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
