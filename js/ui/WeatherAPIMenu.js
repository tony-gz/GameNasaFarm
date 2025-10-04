/**
 * WeatherAPIMenu.js - Menú de selección de API de clima
 */

class WeatherAPIMenu {
     constructor() {
        this.menuElement = document.getElementById('weather-api-menu');
        this.optionsContainer = document.getElementById('api-options');
        
        if (!this.menuElement || !this.optionsContainer) {
            console.error('❌ Elementos del menú no encontrados');
            return;
        }
        
        this.init();
    }

    init() {
        this.renderOptions();
        this.setupEventListeners();
        
    }

   

    renderOptions() {
        const apis = weatherAPIManager.getAvailableAPIs();
        this.optionsContainer.innerHTML = '';

        apis.forEach(api => {
            const option = document.createElement('div');
            option.className = 'seed-option';
            option.dataset.apiId = api.id;

            if (weatherAPIManager.currentAPI === api.id) {
                option.classList.add('api-selected');
            }

            let statusText = '';
            if (api.requiresAuth) {
                statusText = api.hasKey 
                    ? '<span style="color:#4CAF50">Configurada</span>'
                    : '<span style="color:#FF6B6B">Requiere API Key</span>';
            } else {
                statusText = '<span style="color:#4CAF50">Lista para usar</span>';
            }

            option.innerHTML = `
                <div class="api-name">${api.name}</div>
                <div class="api-description">${api.description}</div>
                <div class="api-status">${statusText}</div>
                ${api.requiresAuth && !api.hasKey ? 
                    `<input type="text" 
                            class="api-input" 
                            placeholder="Ingresa tu API key"
                            data-api-id="${api.id}">` 
                    : ''}
            `;

            option.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    this.selectAPI(api.id);
                }
            });

            this.optionsContainer.appendChild(option);
        });
    }

    selectAPI(apiId) {
        const api = weatherAPIManager.availableAPIs.get(apiId);

        if (api.requiresAuth && !api.apiKey) {
            const input = document.querySelector(`input[data-api-id="${apiId}"]`);
            const apiKey = input ? input.value.trim() : null;

            if (!apiKey) {
                if (window.hud) {
                    window.hud.showNotification('Ingresa tu API key primero', 'error');
                }
                return;
            }

            weatherAPIManager.setCurrentAPI(apiId, apiKey);
        } else {
            weatherAPIManager.setCurrentAPI(apiId);
        }

        this.renderOptions();

        if (window.hud) {
            window.hud.showNotification(`API cambiada a: ${api.name}`, 'success', 3000);
            window.hud.showCurrentAPI();
        }

        // Actualizar clima inmediatamente con la nueva API
        if (window.gameScene && window.gameScene.updateRealTimeWeather) {
            window.gameScene.updateRealTimeWeather();
        }

        // Cerrar menú automáticamente después de seleccionar
        setTimeout(() => {
            this.hide();
        }, 500);
    }

    show() {
        this.menuElement.classList.remove('hidden');
        this.renderOptions();
    }

    hide() {
        this.menuElement.classList.add('hidden');
    }

    setupEventListeners() {
        document.getElementById('close-api-menu')?.addEventListener('click', () => {
            this.hide();
        });
    }
}

/*
// Instancia global
let weatherAPIMenu;
document.addEventListener('DOMContentLoaded', () => {
    weatherAPIMenu = new WeatherAPIMenu();
});
*/

window.weatherAPIMenu = null; // Declarar global pero no inicializar aún