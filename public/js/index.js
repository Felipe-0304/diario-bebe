document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    loadUserInfo();
    loadActiveDiary();
    loadRecentEvents();
    loadRecentPhotos();
});

async function checkSession() {
    try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        window.location.href = '/login.html';
    }
}

function loadUserInfo() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (userData) {
        document.getElementById('nombreUsuario').textContent = userData.nombre;
    }
}

async function loadActiveDiary() {
    try {
        const response = await fetch('/api/diarios');
        if (!response.ok) throw new Error('Error cargando diarios');
        
        const diarios = await response.json();
        const activeDiary = diarios.find(d => d.active);
        
        if (activeDiary) {
            document.getElementById('nombreBebe').textContent = activeDiary.baby_name;
        }
    } catch (error) {
        console.error('Error cargando diario activo:', error);
    }
}

async function loadRecentEvents() {
    try {
        const response = await fetch('/api/eventos/recientes');
        if (!response.ok) throw new Error('Error cargando eventos');
        
        const eventos = await response.json();
        const container = document.getElementById('ultimosEventos');
        container.innerHTML = '';
        
        eventos.forEach(evento => {
            const eventoEl = document.createElement('div');
            eventoEl.className = 'evento';
            eventoEl.innerHTML = `
                <h3>${evento.titulo}</h3>
                <p class="evento-fecha">${formatDate(evento.fecha)}</p>
                <p>${evento.descripcion || ''}</p>
            `;
            container.appendChild(eventoEl);
        });
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }
}

async function loadRecentPhotos() {
    try {
        const response = await fetch('/api/eventos/fotos');
        if (!response.ok) throw new Error('Error cargando fotos');
        
        const fotos = await response.json();
        const container = document.getElementById('fotosRecientes');
        container.innerHTML = '';
        
        fotos.forEach(foto => {
            const fotoEl = document.createElement('div');
            fotoEl.className = 'gallery-item';
            fotoEl.innerHTML = `
                <img src="/media/diarios/${foto.diario_id}/${foto.media_path}" alt="${foto.titulo}">
                <div class="photo-info">${foto.titulo}</div>
            `;
            container.appendChild(fotoEl);
        });
    } catch (error) {
        console.error('Error cargando fotos:', error);
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}