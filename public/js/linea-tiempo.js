document.addEventListener('DOMContentLoaded', async () => {
    await loadYears();
    await loadTimelineEvents();
    
    document.getElementById('timelineFilterType').addEventListener('change', loadTimelineEvents);
    document.getElementById('timelineFilterYear').addEventListener('change', loadTimelineEvents);
});

async function loadYears() {
    try {
        const response = await fetch('/api/eventos/years');
        if (!response.ok) throw new Error('Error cargando años');
        
        const years = await response.json();
        const select = document.getElementById('timelineFilterYear');
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadTimelineEvents() {
    const filterType = document.getElementById('timelineFilterType').value;
    const filterYear = document.getElementById('timelineFilterYear').value;
    
    try {
        const response = await fetch(`/api/eventos/timeline?type=${filterType}&year=${filterYear}`);
        if (!response.ok) throw new Error('Error cargando eventos');
        
        const events = await response.json();
        renderTimeline(events);
    } catch (error) {
        console.error('Error:', error);
        alert('Error cargando línea de tiempo');
    }
}

function renderTimeline(events) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    events.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    events.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
        
        let mediaHtml = '';
        if (event.media_path) {
            const extension = event.media_path.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                mediaHtml = `<img src="/media/diarios/${event.diario_id}/${event.media_path}" alt="${event.titulo}" class="timeline-media">`;
            }
        }
        
        eventElement.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-date">${formatEventDate(event.fecha)}</div>
                <h3 class="timeline-title">${event.titulo}</h3>
                <p>${event.descripcion || ''}</p>
                ${mediaHtml}
            </div>
        `;
        
        timeline.appendChild(eventElement);
    });
}