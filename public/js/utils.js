// Funciones de utilidad compartidas
function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatDateTime(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

async function fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });
    
    if (response.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    
    return response;
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function createElement(tag, classes = '', content = '') {
    const element = document.createElement(tag);
    if (classes) element.className = classes;
    if (content) element.textContent = content;
    return element;
}

export {
    showMessage,
    formatDate,
    formatDateTime,
    fetchWithAuth,
    debounce,
    createElement
};