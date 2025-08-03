document.addEventListener('DOMContentLoaded', async () => {
    await loadPhotos();
    
    document.getElementById('filterType').addEventListener('change', loadPhotos);
    document.getElementById('filterDate').addEventListener('change', loadPhotos);
    
    // Lightbox
    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('lightbox-close')) {
            document.getElementById('lightbox').classList.remove('active');
        }
    });
});

async function loadPhotos() {
    const filterType = document.getElementById('filterType').value;
    const filterDate = document.getElementById('filterDate').value;
    
    try {
        const response = await fetch(`/api/eventos/fotos?type=${filterType}&date=${filterDate}`);
        if (!response.ok) throw new Error('Error cargando fotos');
        
        const fotos = await response.json();
        renderPhotos(fotos);
    } catch (error) {
        console.error('Error:', error);
        alert('Error cargando fotos');
    }
}

function renderPhotos(fotos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    fotos.forEach(foto => {
        const photoElement = document.createElement('div');
        photoElement.className = 'gallery-item';
        photoElement.innerHTML = `
            <img src="/media/diarios/${foto.diario_id}/${foto.media_path}" alt="${foto.titulo}">
            <div class="photo-info">${foto.titulo}</div>
        `;
        
        photoElement.addEventListener('click', () => showLightbox(foto));
        gallery.appendChild(photoElement);
    });
}

function showLightbox(foto) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    const info = document.getElementById('lightboxInfo');
    
    image.src = `/media/diarios/${foto.diario_id}/${foto.media_path}`;
    info.innerHTML = `
        <h3>${foto.titulo}</h3>
        <p>${formatEventDate(foto.fecha)}</p>
        <p>${foto.descripcion || ''}</p>
    `;
    
    lightbox.classList.add('active');
}