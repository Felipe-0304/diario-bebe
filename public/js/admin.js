document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadGlobalConfig();
    await loadUsers();
    
    document.getElementById('globalConfigForm').addEventListener('submit', saveGlobalConfig);
});

async function loadStats() {
    try {
        const response = await fetch('/api/admin/metrics');
        if (!response.ok) throw new Error('Error cargando estadísticas');
        
        const stats = await response.json();
        
        document.getElementById('totalUsuarios').textContent = stats.totalUsuarios;
        document.getElementById('totalDiarios').textContent = stats.totalDiarios;
        document.getElementById('totalEventosAdmin').textContent = stats.totalEventos;
        document.getElementById('totalFotosAdmin').textContent = stats.totalFotos;
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error cargando estadísticas', 'error');
    }
}

async function loadGlobalConfig() {
    try {
        const response = await fetch('/api/admin/config');
        if (!response.ok) throw new Error('Error cargando configuración');
        
        const config = await response.json();
        
        document.getElementById('siteName').value = config.site_global_name;
        document.getElementById('allowRegistrations').checked = config.allow_new_registrations === 1;
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error cargando configuración', 'error');
    }
}

async function saveGlobalConfig(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/admin/config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                site_global_name: document.getElementById('siteName').value,
                allow_new_registrations: document.getElementById('allowRegistrations').checked ? 1 : 0
            })
        });
        
        if (!response.ok) throw new Error('Error guardando configuración');
        
        showMessage('Configuración guardada correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error guardando configuración', 'error');
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Error cargando usuarios');
        
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.rol}</td>
                <td>
                    ${user.id !== 1 ? `<button class="btn danger-btn" onclick="deleteUser(${user.id})">Eliminar</button>` : ''}
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error cargando usuarios', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error eliminando usuario');
        
        showMessage('Usuario eliminado correctamente', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error eliminando usuario', 'error');
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

window.deleteUser = deleteUser;