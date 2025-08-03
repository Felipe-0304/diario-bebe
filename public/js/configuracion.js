document.addEventListener('DOMContentLoaded', async () => {
    const themeManager = new ThemeManager();
    await loadDiarios();
    
    document.getElementById('nuevoDiarioBtn').addEventListener('click', showCreateDiarioModal);
    document.getElementById('accountForm').addEventListener('submit', updateAccount);
});

async function loadDiarios() {
    try {
        const response = await fetch('/api/diarios');
        if (!response.ok) throw new Error('Error cargando diarios');
        
        const diarios = await response.json();
        renderDiarios(diarios);
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error cargando diarios', 'error');
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
        
        if (!response.ok) throw new Error('Error cambiando diario activo');
        
        showMessage('Diario activo actualizado', 'success');
        loadDiarios();
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error cambiando diario activo', 'error');
    }
}

function showCreateDiarioModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Crear Nuevo Diario</h3>
            <form id="createDiarioForm">
                <div class="form-group">
                    <label for="babyName">Nombre del bebé:</label>
                    <input type="text" id="babyName" class="form-control" required>
                </div>
                <button type="submit" class="btn">Crear</button>
                <button type="button" id="cancelCreate" class="btn btn-secondary">Cancelar</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createDiarioForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createDiario(document.getElementById('babyName').value);
        modal.remove();
    });
    
    document.getElementById('cancelCreate').addEventListener('click', () => {
        modal.remove();
    });
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
        
        if (!response.ok) throw new Error('Error creando diario');
        
        showMessage('Diario creado exitosamente', 'success');
        loadDiarios();
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error creando diario', 'error');
    }
}

async function updateAccount(e) {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('accountName').value,
        email: document.getElementById('accountEmail').value
    };
    
    const password = document.getElementById('accountPassword').value;
    if (password) {
        formData.password = password;
    }
    
    try {
        const response = await fetch('/api/auth/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Error actualizando cuenta');
        
        showMessage('Cuenta actualizada correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error actualizando cuenta', 'error');
    }
}

function showMessage(message, type) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.textContent = message;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 3000);
}