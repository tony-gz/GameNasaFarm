/**
 * HUD.js - Interfaz de usuario (Heads Up Display)
 */

class HUD {
    constructor() {
        this.elements = {
            money: document.getElementById('money'),
            energy: document.getElementById('energy'),
            day: document.getElementById('day'),
            temperature: document.getElementById('temperature'),
            precipitation: document.getElementById('precipitation'),
            solar: document.getElementById('solar')
        };
        
        this.init();
        this.setupButtons();
    }

    init() {
        // Suscribirse a cambios en el GameState
        gameState.subscribe(this.handleStateChange.bind(this));
        
        // Actualizar HUD inicial
        this.updateAll();
        
        console.log('📊 HUD inicializado');
    }

    setupButtons() {
        // Conectar botones con el sistema de herramientas
        const btnPlant = document.getElementById('btn-plant');
        const btnWater = document.getElementById('btn-water');
        const btnHarvest = document.getElementById('btn-harvest');
        const btnNextDay = document.getElementById('btn-next-day');
        
        if (btnPlant) {
            btnPlant.addEventListener('click', () => {
                console.log('🌱 Botón plantar presionado');
                if (window.gameScene) {
                    window.gameScene.pickUpTool('shovel');
                }
            });
        }
        
        if (btnWater) {
            btnWater.addEventListener('click', () => {
                console.log('💧 Botón regar presionado');
                if (window.gameScene) {
                    window.gameScene.pickUpTool('bucket');
                }
            });
        }
        
        if (btnHarvest) {
            btnHarvest.addEventListener('click', () => {
                console.log('🌾 Modo cosechar activado');
                this.showNotification('🌾 Modo cosechar activado. Haz clic en un cultivo maduro', 'info');
            });
        }
        
        if (btnNextDay) {
            btnNextDay.addEventListener('click', () => {
                if (window.game) {
                    window.game.nextDay();
                }
            });
        }
    }

    handleStateChange(change) {
        switch (change.type) {
            case 'money':
                this.updateMoney();
                this.animateChange('money', change.newValue - change.oldValue);
                break;
            case 'energy':
                this.updateEnergy();
                break;
            case 'day':
                this.updateDay();
                this.animateNewDay();
                break;
            case 'weather':
                this.updateWeather();
                break;
        }
    }

    updateMoney() {
        const money = gameState.getMoney();
        if (this.elements.money) {
            this.elements.money.textContent = money;
            
            // Cambiar color basado en dinero disponible
            if (money < 100) {
                this.elements.money.style.color = '#ff4444';
            } else if (money < 500) {
                this.elements.money.style.color = '#ffaa00';
            } else {
                this.elements.money.style.color = '#ffffff';
            }
        }
    }

    updateEnergy() {
        const energy = gameState.getEnergy();
        if (this.elements.energy) {
            this.elements.energy.textContent = energy;
            
            // Cambiar color basado en energía
            if (energy < 20) {
                this.elements.energy.style.color = '#ff4444';
            } else if (energy < 50) {
                this.elements.energy.style.color = '#ffaa00';
            } else {
                this.elements.energy.style.color = '#ffffff';
            }
        }
    }

    updateDay() {
        const day = gameState.getDay();
        if (this.elements.day) {
            this.elements.day.textContent = day;
        }
    }

    updateWeather() {
        const weather = gameState.getWeather();
        
        if (this.elements.temperature) {
            this.elements.temperature.textContent = Math.round(weather.temperature) + '°C';
        }
        
        if (this.elements.precipitation) {
            this.elements.precipitation.textContent = Math.round(weather.precipitation * 10) / 10 + 'mm';
        }
        
        if (this.elements.solar) {
            this.elements.solar.textContent = Math.round(weather.solar * 10) / 10 + 'kW';
        }
        
        // Aplicar colores según condiciones
        this.updateWeatherColors(weather);
    }

    updateWeatherColors(weather) {
        // Temperatura
        if (this.elements.temperature) {
            if (weather.temperature < 10) {
                this.elements.temperature.style.color = '#87ceeb'; // Azul frío
            } else if (weather.temperature > 30) {
                this.elements.temperature.style.color = '#ff6b47'; // Rojo caliente
            } else {
                this.elements.temperature.style.color = '#ffffff';
            }
        }

        // Precipitación
        if (this.elements.precipitation) {
            if (weather.precipitation > 5) {
                this.elements.precipitation.style.color = '#87ceeb'; // Azul lluvia
            } else {
                this.elements.precipitation.style.color = '#ffffff';
            }
        }

        // Energía solar
        if (this.elements.solar) {
            if (weather.solar > 20) {
                this.elements.solar.style.color = '#ffd700'; // Amarillo sol fuerte
            } else if (weather.solar < 10) {
                this.elements.solar.style.color = '#999999'; // Gris sol débil
            } else {
                this.elements.solar.style.color = '#ffffff';
            }
        }
    }

    updateAll() {
        this.updateMoney();
        this.updateEnergy();
        this.updateDay();
        this.updateWeather();
    }

    // Animaciones
    animateChange(elementName, change) {
        const element = this.elements[elementName];
        if (!element) return;

        // Crear elemento de cambio flotante
        const changeElement = document.createElement('span');
        changeElement.className = 'hud-change';
        changeElement.textContent = (change > 0 ? '+' : '') + change;
        changeElement.style.cssText = `
            position: absolute;
            color: ${change > 0 ? '#4CAF50' : '#f44336'};
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
        `;

        // Posicionar cerca del elemento
        const rect = element.getBoundingClientRect();
        changeElement.style.left = (rect.right + 10) + 'px';
        changeElement.style.top = rect.top + 'px';

        document.body.appendChild(changeElement);

        // Animar
        changeElement.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: 'translateY(-30px)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => {
            changeElement.remove();
        };
    }

    animateNewDay() {
        const dayElement = this.elements.day;
        if (!dayElement) return;

        // Efecto de brillo para nuevo día
        dayElement.animate([
            { transform: 'scale(1)', color: '#ffffff' },
            { transform: 'scale(1.2)', color: '#ffd700' },
            { transform: 'scale(1)', color: '#ffffff' }
        ], {
            duration: 800,
            easing: 'ease-in-out'
        });
    }

    // Sistema de notificaciones mejorado
    showNotification(message, type = 'info', duration = 3000) {
        let notification = document.getElementById('notification');
        
        // Si no existe, crear elemento de notificación
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }
        
        // Configurar notificación
        notification.textContent = message;
        notification.className = `show ${type}`;
        
        // Remover clases después de la duración
        setTimeout(() => {
            notification.className = '';
        }, duration);
    }

    // Métodos de utilidad para el juego
    showPlantSuccess(cropType, cost) {
        this.showNotification(`🌱 ${cropType} plantado por ${cost} monedas`, 'success');
    }

    showHarvestSuccess(cropType, value) {
        this.showNotification(`🌾 ${cropType} cosechado: +${value} monedas`, 'success');
    }

    showInsufficientFunds() {
        this.showNotification('💰 No tienes suficiente dinero', 'error');
    }

    showInsufficientEnergy() {
        this.showNotification('⚡ No tienes suficiente energía', 'error');
    }

    showCropNotReady() {
        this.showNotification('🌿 El cultivo aún no está listo', 'info');
    }

    // Cleanup
    destroy() {
        // Desuscribirse del GameState
        gameState.unsubscribe(this.handleStateChange.bind(this));
        
        // Limpiar referencias
        this.elements = {};
    }
}