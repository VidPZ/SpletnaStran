document.addEventListener('DOMContentLoaded', function() {
    // Event listener za gumbe za brisanje
    document.getElementById('file-list').addEventListener('click', function(event) {
        if (event.target.closest('.delete-btn')) {
            const filename = event.target.closest('.delete-btn').dataset.filename;
            izbrisiDatoteko(filename);
        }
    });
});

function izbrisiDatoteko(filename) {
    fetch(`/api/delete/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 204) {
            // Klic globalne funkcije za osvežitev seznama
            if (typeof osveziSeznamDatotek === 'function') {
                osveziSeznamDatotek();
            }
        } else if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Napaka pri brisanju datoteke');
            });
        }
    })
    .catch(error => {
        console.error('Napaka pri brisanju:', error);
        alert(`Napaka pri brisanju datoteke: ${error.message}`);
    });
}