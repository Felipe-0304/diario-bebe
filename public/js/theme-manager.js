class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                '--color-primario': '#ff9bb3',
                '--color-secundario': '#a5d8ff',
                '--color-fondo': '#fff9fa'
            },
            pastel: {
                '--color-primario': '#a5d8ff',
                '--color-secundario': '#c3aed6',
                '--color-fondo': '#f9f7f7'
            },
            jungla: {
                '--color-primario': '#7cbc5f',
                '--color-secundario': '#f7d560',
                '--color-fondo': '#f0f7e6'
            },
            oceano: {
                '--color-primario': '#4aa8d0',
                '--color-secundario': '#a5d8ff',
                '--color-fondo': '#e6f7ff'
            }
        };
        
        this.init();
    }
    
    init() {
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('babyDiaryTheme');
        const savedColor = localStorage.getItem('babyDiaryCustomColor');
        
        if (savedTheme) {
            this.setTheme(savedTheme, false);
            document.getElementById('temaSelect').value = savedTheme;
        }
        
        if (savedColor) {
            this.setCustomColor(savedColor, false);
            document.getElementById('colorPicker').value = savedColor;
        }
        
        // Configurar event listeners
        document.getElementById('temaSelect')?.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
        
        document.getElementById('colorPicker')?.addEventListener('change', (e) => {
            this.setCustomColor(e.target.value);
        });
        
        document.getElementById('guardarTemaBtn')?.addEventListener('click', () => {
            this.saveToServer();
        });
    }
    
    setTheme(themeName, saveToLocal = true) {
        const theme = this.themes[themeName] || this.themes.default;
        
        for (const [property, value] of Object.entries(theme)) {
            document.documentElement.style.setProperty(property, value);
        }
        
        if (saveToLocal) {
            localStorage.setItem('babyDiaryTheme', themeName);
        }
    }
    
    setCustomColor(color, saveToLocal = true) {
        document.documentElement.style.setProperty('--color-primario', color);
        
        if (saveToLocal) {
            localStorage.setItem('babyDiaryCustomColor', color);
        }
    }
    
    async saveToServer() {
        try {
            const response = await fetch('/api/diarios/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theme: localStorage.getItem('babyDiaryTheme'),
                    customColor: localStorage.getItem('babyDiaryCustomColor')
                })
            });
            
            if (!response.ok) throw new Error('Error al guardar la configuración');
            
            alert('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la configuración');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});