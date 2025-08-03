document.addEventListener('DOMContentLoaded', () => {
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    renderCalendar(currentMonth, currentYear);
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('today').addEventListener('click', () => {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('addEventBtn').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').value = today;
        document.getElementById('addEventModal').classList.add('active');
    });
    
    document.getElementById('cancelAddEvent').addEventListener('click', () => {
        document.getElementById('addEventModal').classList.remove('active');
    });
    
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('eventModal').classList.remove('active');
    });
    
    document.getElementById('eventForm').addEventListener('submit', addNewEvent);
});

async function renderCalendar(month, year) {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Encabezados de días
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarDays.appendChild(dayHeader);
    });
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Días del mes
    const today = new Date();
    const events = await loadEventsForMonth(month + 1, year);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Verificar si hay eventos para este día
        const dayEvents = events.filter(e => e.fecha.split('T')[0] === dateString);
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayEvents.slice(0, 2).map(event => `
                <div class="calendar-event" data-event-id="${event.id}">
                    ${event.titulo}
                </div>
            `).join('')}
            ${dayEvents.length > 2 ? `<div class="more-events">+${dayEvents.length - 2} más</div>` : ''}
        `;
        
        dayElement.addEventListener('click', () => showDayEvents(dateString, dayEvents));
        calendarDays.appendChild(dayElement);
    }
}

async function loadEventsForMonth(month, year) {
    try {
        const response = await fetch(`/api/eventos/mes/${year}/${month}`);
        if (!response.ok) throw new Error('Error cargando eventos');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function showDayEvents(dateString, events) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    
    document.getElementById('modalEventDate').textContent = formattedDate;
    
    const content = document.getElementById('modalEventContent');
    content.innerHTML = '';
    
    if (events.length === 0) {
        content.innerHTML = '<p>No hay eventos para este día.</p>';
    } else {
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-detail';
            
            let mediaHtml = '';
            if (event.media_path) {
                const extension = event.media_path.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                    mediaHtml = `<img src="/media/diarios/${event.diario_id}/${event.media_path}" alt="${event.titulo}" class="event-media">`;
                } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
                    mediaHtml = `<video controls class="event-media">
                        <source src="/media/diarios/${event.diario_id}/${event.media_path}" type="video/${extension}">
                    </video>`;
                }
            }
            
            eventElement.innerHTML = `
                <h4>${event.titulo}</h4>
                <p><strong>Tipo:</strong> ${event.tipo}</p>
                <p>${event.descripcion || ''}</p>
                ${mediaHtml}
                <button class="btn danger-btn" onclick="deleteEvent(${event.id})">Eliminar</button>
            `;
            
            content.appendChild(eventElement);
        });
    }
    
    document.getElementById('eventModal').classList.add('active');
}

async function addNewEvent(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('titulo', document.getElementById('eventTitle').value);
    formData.append('tipo', document.getElementById('eventType').value);
    formData.append('descripcion', document.getElementById('eventDescription').value);
    formData.append('fecha', document.getElementById('eventDate').value);
    
    const fileInput = document.getElementById('eventMedia');
    if (fileInput.files.length > 0) {
        formData.append('media', fileInput.files[0]);
    }
    
    try {
        const response = await fetch('/api/eventos', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Error creando evento');
        
        document.getElementById('addEventModal').classList.remove('active');
        document.getElementById('eventForm').reset();
        
        const today = new Date();
        renderCalendar(today.getMonth(), today.getFullYear());
    } catch (error) {
        console.error('Error:', error);
        alert('Error creando evento');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
        const response = await fetch(`/api/eventos/${eventId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error eliminando evento');
        
        document.getElementById('eventModal').classList.remove('active');
        const today = new Date();
        renderCalendar(today.getMonth(), today.getFullYear());
    } catch (error) {
        console.error('Error:', error);
        alert('Error eliminando evento');
    }
}

window.deleteEvent = deleteEvent;