document.addEventListener('DOMContentLoaded', () => {
    // Este archivo se usa para funcionalidades compartidas de eventos
    // La mayoría de la lógica está en los archivos específicos (calendario.js, linea-tiempo.js, etc.)
});

// Función para formatear fechas de manera consistente en toda la app
function formatEventDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}