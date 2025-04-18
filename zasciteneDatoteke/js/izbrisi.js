document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('seznamDatotek').addEventListener('click', function(event) {
        if (event.target.closest('.delete-btn')) {
            const filename = event.target.closest('.delete-btn').dataset.filename;
            izbrisiDatoteko(filename);
        }
    });
});

function izbrisiDatoteko(filename) {
    fetch(`/izbrisi/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 204) {
            if (typeof osveziSeznamDatotek === 'function') {
                osveziSeznamDatotek();
            }
        } 
    })
    .catch(error => {
        alert(`Napaka pri brisanju datoteke: ${error.message}`);
    });
}