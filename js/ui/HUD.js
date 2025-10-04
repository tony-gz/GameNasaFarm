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
        
        this.notificationTimeout = null;
        this.currentAPI = 'NASA POWER';
        this.realTimeWeather = null;
        this.weatherUpdateInterval = null;
        this.init();
        this.setupButtons();
    }

    init() {
        // Suscribirse a cambios en el GameState
        gameState.subscribe(this.handleStateChange.bind(this));
        
        // Actualizar HUD inicial
        this.updateAll();

        // Crear indicador de fuente de datos
        this.createDataSourceIndicator();

        // Crear panel de clima en tiempo real
        this.createRealTimePanel();
        
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

    showCurrentAPI() {
        const api = weatherAPIManager.availableAPIs.get(weatherAPIManager.currentAPI);
        if (api) {
            this.updateDataSource(api.name);
            this.showNotification(`📡 API activa: ${api.name}`, 'info', 2000);
        }
    }

    createAPIIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'current-api-indicator';
        indicator.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.9);
        padding: 8px 15px;
        border-radius: 20px;
        color: white;
        font-size: 12px;
        z-index: 999;
        pointer-events: none;
    `;
        document.body.appendChild(indicator);
        return indicator;
    }

    updateDataSource(source) {
        this.currentAPI = source;
        const apiElement = document.getElementById('current-api');
        if (apiElement) {
            apiElement.textContent = source;
        }
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



    createDataSourceIndicator() {
    const hudStats = document.getElementById('hud-stats');
    
    const indicator = document.createElement('div');
    indicator.id = 'data-source-indicator';
    indicator.className = 'stat-item';
    indicator.style.cssText = `
        background: rgba(76, 175, 80, 0.2);
        padding: 5px 10px;
        border-radius: 8px;
        border: 1px solid rgba(76, 175, 80, 0.5);
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    indicator.innerHTML = '<span>🛰️</span><span id="current-api">NASA POWER</span>';
    
    indicator.addEventListener('click', () => {
        if (window.weatherAPIMenu) {
            weatherAPIMenu.show();
        }
    });
    
    indicator.addEventListener('mouseenter', () => {
        indicator.style.background = 'rgba(76, 175, 80, 0.3)';
        indicator.style.transform = 'scale(1.05)';
    });
    
    indicator.addEventListener('mouseleave', () => {
        indicator.style.background = 'rgba(76, 175, 80, 0.2)';
        indicator.style.transform = 'scale(1)';
    });
    
    hudStats.appendChild(indicator);
}

    createRealTimePanel() {
        const hud = document.getElementById('hud');

        const panel = document.createElement('div');
        panel.id = 'realtime-weather-panel';
        panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, rgba(15, 31, 46, 0.95), rgba(32, 58, 67, 0.95));
        padding: 15px 20px;
        border-radius: 12px;
        backdrop-filter: blur(15px);
        border: 1px solid rgba(76, 175, 80, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        min-width: 200px;
        opacity: 0;
        transform: translateX(300px);
        transition: all 0.5s ease;
    `;

        panel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <span style="font-size: 20px;">🌐</span>
            <span style="font-weight: 600; color: #81C784;">Clima Actual</span>
        </div>
        <div id="realtime-content" style="font-size: 14px; color: white;">
            <div style="margin: 5px 0;">🌡️ <span id="rt-temp">--°C</span></div>
            <div style="margin: 5px 0;">💧 <span id="rt-precip">-- mm</span></div>
            <div style="margin: 5px 0;">📍 <span id="rt-location">--</span></div>
            <div style="margin: 5px 0; font-size: 12px; color: #81C784;">
                <span id="rt-source">--</span>
            </div>
        </div>
        <button id="refresh-realtime" style="
            width: 100%;
            margin-top: 10px;
            padding: 8px;
            background: linear-gradient(135deg, #4CAF50, #66BB6A);
            border: none;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        ">🔄 Actualizar</button>
    `;

        hud.appendChild(panel);

        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateX(0)';
        }, 500);

        document.getElementById('refresh-realtime').addEventListener('click', () => {
            this.refreshRealTimeWeather();
        });

        const refreshBtn = document.getElementById('refresh-realtime');
        refreshBtn.addEventListener('mouseenter', () => {
            refreshBtn.style.transform = 'scale(1.05)';
            refreshBtn.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
        });
        refreshBtn.addEventListener('mouseleave', () => {
            refreshBtn.style.transform = 'scale(1)';
            refreshBtn.style.boxShadow = 'none';
        });
        /*
        setInterval(() => {
            this.refreshRealTimeWeather();
        }, 5 * 60 * 1000);

        this.refreshRealTimeWeather();
        */
       // Actualizar solo una vez al inicio, con delay
        setTimeout(() => {
            this.refreshRealTimeWeather();
        }, 1000);

        // Actualizar cada 5 minutos (solo si no existe ya el intervalo)
        if (!this.weatherUpdateInterval) {
            this.weatherUpdateInterval = setInterval(() => {
                this.refreshRealTimeWeather();
            }, 5 * 60 * 1000);
        }
    }

    async refreshRealTimeWeather() {
        try {
            const btn = document.getElementById('refresh-realtime');
            btn.textContent = '⏳ Actualizando...';
            btn.disabled = true;

            const weather = await weatherAPIManager.getCurrentWeather();
            this.updateRealTimeWeather(weather);

            btn.textContent = '✅ Actualizado';
            setTimeout(() => {
                btn.textContent = '🔄 Actualizar';
                btn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Error actualizando clima en tiempo real:', error);

            const btn = document.getElementById('refresh-realtime');
            btn.textContent = '❌ Error';
            setTimeout(() => {
                btn.textContent = '🔄 Actualizar';
                btn.disabled = false;
            }, 2000);
        }
    }

    updateRealTimeWeather(weatherData) {
        this.realTimeWeather = weatherData;

        const tempEl = document.getElementById('rt-temp');
        const precipEl = document.getElementById('rt-precip');
        const locationEl = document.getElementById('rt-location');
        const sourceEl = document.getElementById('rt-source');

        if (tempEl) tempEl.textContent = `${weatherData.temperature.toFixed(1)}°C`;
        if (precipEl) precipEl.textContent = `${weatherData.precipitation.toFixed(1)} mm`;
        if (locationEl) locationEl.textContent = weatherData.location || 'Chilpancingo, GRO';
        if (sourceEl) sourceEl.textContent = `Fuente: ${weatherData.source}`;

        if (precipEl) {
            if (weatherData.isRaining) {
                precipEl.style.color = '#64B5F6';
                precipEl.style.fontWeight = 'bold';
            } else {
                precipEl.style.color = 'white';
                precipEl.style.fontWeight = 'normal';
            }
        }

        console.log('Clima en tiempo real actualizado:', weatherData);
    }

    // Cleanup
    destroy() {
        // Limpiar intervalo
        if (this.weatherUpdateInterval) {
            clearInterval(this.weatherUpdateInterval);
            this.weatherUpdateInterval = null;
        }

        // Desuscribirse del GameState
        gameState.unsubscribe(this.handleStateChange.bind(this));

        // Limpiar referencias
        this.elements = {};
    }
}