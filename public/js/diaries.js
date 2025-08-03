document.addEventListener('DOMContentLoaded', () => {
    loadDiarios();
    
    document.getElementById('nuevoDiarioBtn').addEventListener('click', showCreateDiarioModal);
});

async function loadDiarios() {
    try {
        const response = await fetch('/api/diarios');
        if (!response.ok) throw new Error('Error al cargar diarios');
        
        const diarios = await response.json();
        renderDiarios(diarios);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los diarios');
    }
}

function renderDiarios(diarios) {
    const container = document.getElementById('diariosList');
    container.innerHTML = '';
    
    diarios.forEach(diario => {
        const diarioCard = document.createElement('div');
        diarioCard.className = `diario-card ${diario.active ? 'active' : ''}`;
        diarioCard.innerHTML = `
            <h3>${diario.baby_name}</h3>
            <p>Creador: ${diario.creator_name}</p>
            ${diario.active ? '<p><strong>Activo</strong></p>' : ''}
        `;
        
        diarioCard.addEventListener('click', () => setActiveDiario(diario.id));
        container.appendChild(diarioCard);
    });
}

async function setActiveDiario(diarioId) {
    try {
        const response = await fetch('/api/diarios/activo', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ diarioId })
        });
        
        if (!response.ok) throw new Error('Error al cambiar diario activo');
        
        loadDiarios(); // Recargar la lista
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar el diario activo');
    }
}

function showCreateDiarioModal() {
    const babyName = prompt('Ingresa el nombre del bebé para el nuevo diario:');
    if (!babyName) return;
    
    createDiario(babyName);
}

async function createDiario(babyName) {
    try {
        const response = await fetch('/api/diarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ baby_name: babyName })
        });
        
        if (!response.ok) throw new Error('Error al crear diario');
        
        alert('Diario creado exitosamente');
        loadDiarios(); // Recargar la lista
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear el diario');
    }
}