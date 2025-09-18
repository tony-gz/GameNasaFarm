/**
 * helpers.js - Funciones auxiliares y utilidades
 */

// Gestión de pantallas
const ScreenManager = {
    current: 'loading',
    
    show(screenName) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Mostrar la pantalla solicitada
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.current = screenName;
            if (typeof gameState !== 'undefined') {
                gameState.setCurrentScreen(screenName);
            }
            console.log(`📺 Mostrando pantalla: ${screenName}`);
        } else {
            console.error(`❌ Pantalla '${screenName}' no encontrada`);
        }
    },
    
    getCurrent() {
        return this.current;
    }
};

// Utilidades matemáticas
const MathUtils = {
    // Interpolar entre dos valores
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    // Limitar valor entre min y max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // Distancia entre dos puntos
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Número aleatorio entre min y max
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Número entero aleatorio entre min y max
    randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Redondear a decimales específicos
    roundTo(value, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
};

// Utilidades de tiempo
const TimeUtils = {
    // Formatear tiempo en formato legible
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },
    
    // Crear delay/timeout promisificado
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Utilidades de animación
const AnimationUtils = {
    // Crear efecto de shake en un elemento
    shake(element, duration = 500, intensity = 5) {
        if (!element) return;
        
        const keyframes = [];
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
            keyframes.push({
                transform: `translateX(${Math.sin(i / steps * Math.PI * 4) * intensity}px)`,
                offset: i / steps
            });
        }
        
        return element.animate(keyframes, {
            duration: duration,
            easing: 'ease-out'
        });
    },
    
    // Efecto de bounce
    bounce(element, scale = 1.1, duration = 300) {
        if (!element) return;
        
        return element.animate([
            { transform: 'scale(1)' },
            { transform: `scale(${scale})` },
            { transform: 'scale(1)' }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        });
    },
    
    // Fade in/out
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        return element.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: duration,
            fill: 'forwards'
        });
    },
    
    fadeOut(element, duration = 300) {
        if (!element) return;
        
        return element.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: duration,
            fill: 'forwards'
        });
    }
};

// Utilidades de localStorage (para futuro uso)
const StorageUtils = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
            return false;
        }
    },
    
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error cargando de localStorage:', e);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removiendo de localStorage:', e);
            return false;
        }
    },
    
    exists(key) {
        return localStorage.getItem(key) !== null;
    }
};

// Utilidades de validación
const ValidationUtils = {
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    },
    
    isPositiveNumber(value) {
        return this.isNumber(value) && value > 0;
    },
    
    isString(value) {
        return typeof value === 'string';
    },
    
    isValidGridPosition(x, y, width, height) {
        return this.isNumber(x) && this.isNumber(y) && 
               x >= 0 && x < width && y >= 0 && y < height;
    }
};

// Utilidades de formato
const FormatUtils = {
    // Formatear números con separadores
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },
    
    // Formatear dinero
    formatMoney(amount, currency = '$') {
        return `${currency}${this.formatNumber(amount)}`;
    },
    
    // Formatear porcentaje
    formatPercent(value, decimals = 1) {
        return `${MathUtils.roundTo(value, decimals)}%`;
    },
    
    // Capitalizar primera letra
    capitalize(str) {
        if (!ValidationUtils.isString(str) || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Utilidades de debugging
const DebugUtils = {
    enabled: false,
    
    enable() {
        this.enabled = true;
        console.log('🐛 Debug mode enabled');
    },
    
    disable() {
        this.enabled = false;
        console.log('🐛 Debug mode disabled');
    },
    
    log(...args) {
        if (this.enabled) {
            console.log('[DEBUG]', ...args);
        }
    },
    
    logGameState() {
        if (this.enabled && typeof gameState !== 'undefined') {
            console.log('🎮 Game State:', gameState.getGameData());
        }
    },
    
    logFarmStatus() {
        if (this.enabled && window.game && window.game.getFarm()) {
            console.log('🚜 Farm Status:', window.game.getFarm().getFarmStatus());
        }
    }
};

// Utilidades de clima (para simulación)
const WeatherUtils = {
    // Generar clima aleatorio realista
    generateRandomWeather() {
        return {
            temperature: MathUtils.randomBetween(10, 35),
            precipitation: MathUtils.randomBetween(0, 15),
            solar: MathUtils.randomBetween(8, 25)
        };
    },
    
    // Aplicar variación gradual al clima
    varyWeather(currentWeather, intensity = 0.3) {
        return {
            temperature: MathUtils.clamp(
                currentWeather.temperature + MathUtils.randomBetween(-5 * intensity, 5 * intensity),
                -5, 45
            ),
            precipitation: MathUtils.clamp(
                currentWeather.precipitation + MathUtils.randomBetween(-3 * intensity, 3 * intensity),
                0, 20
            ),
            solar: MathUtils.clamp(
                currentWeather.solar + MathUtils.randomBetween(-3 * intensity, 3 * intensity),
                5, 30
            )
        };
    },
    
    // Determinar descripción del clima
    getWeatherDescription(weather) {
        let description = '';
        
        // Temperatura
        if (weather.temperature < 10) {
            description += 'Frío ';
        } else if (weather.temperature > 30) {
            description += 'Caluroso ';
        } else {
            description += 'Templado ';
        }
        
        // Precipitación
        if (weather.precipitation > 10) {
            description += 'y lluvioso';
        } else if (weather.precipitation > 5) {
            description += 'con lluvia ligera';
        } else {
            description += 'y seco';
        }
        
        return description;
    }
};

// Utilidades de efectos sonoros (para futuro)
const SoundUtils = {
    // Simular sonido con console (placeholder)
    play(soundName) {
        DebugUtils.log(`🔊 Playing sound: ${soundName}`);
    },
    
    playPlant() {
        this.play('plant');
    },
    
    playWater() {
        this.play('water');
    },
    
    playHarvest() {
        this.play('harvest');
    },
    
    playNextDay() {
        this.play('next-day');
    },
    
    playError() {
        this.play('error');
    }
};

// Utilidades de tutorial/ayuda
const TutorialUtils = {
    tips: [
        "💡 Los cultivos necesitan agua para crecer",
        "💡 El clima afecta el crecimiento de tus plantas",
        "💡 Cosecha cuando los cultivos estén maduros (color naranja)",
        "💡 Algunos cultivos crecen mejor en ciertas temperaturas",
        "💡 La lluvia añade agua automáticamente a tus cultivos",
        "💡 Administra tu energía cuidadosamente"
    ],
    
    getRandomTip() {
        return this.tips[Math.floor(Math.random() * this.tips.length)];
    },
    
    showTip() {
        if (window.game && window.game.getHUD()) {
            const tip = this.getRandomTip();
            window.game.getHUD().showNotification(tip, 'info', 4000);
        }
    }
};

// Exportar utilidades globalmente
window.ScreenManager = ScreenManager;
window.MathUtils = MathUtils;
window.TimeUtils = TimeUtils;
window.AnimationUtils = AnimationUtils;
window.StorageUtils = StorageUtils;
window.ValidationUtils = ValidationUtils;
window.FormatUtils = FormatUtils;
window.DebugUtils = DebugUtils;
window.WeatherUtils = WeatherUtils;
window.SoundUtils = SoundUtils;
window.TutorialUtils = TutorialUtils;

console.log('🛠️ Helpers cargados');