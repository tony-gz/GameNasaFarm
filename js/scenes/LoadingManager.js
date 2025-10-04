/**
 * LoadingManager.js - Maneja la secuencia de carga con efectos visuales
 */

class LoadingManager {
    static currentProgress = 0;
    static loadingMessages = [
        '🌍 Calibrando sensores satelitales...',
        '🛰️ Sincronizando órbita con NASA...',
        '🌱 Preparando semillas experimentales...',
        '🌦️ Descargando datos meteorológicos...',
        '🚜 Inicializando sistemas de la granja...',
        '📡 Estableciendo comunicación terrestre...',
        '🌾 Optimizando algoritmos de cultivo...',
        '☀️ Analizando patrones solares...'
    ];
    
    static async start() {
        // Crear efectos visuales
        this.createLoadingEffects();
        
        const loadingSteps = [
            { name: '🔧 Inicializando sistema...', duration: 50, action: 0 },
            { name: '📦 Cargando recursos...', duration: 40, action: 1 },
            { name: '🛰️ Conectando con NASA...', duration: 10, action: 2 },
            { name: '🌱 Preparando granja...', duration: 60, action: 3 },
            { name: '✨ Finalizando...', duration: 30, action: 4 }
        ];
        
        for (let i = 0; i < loadingSteps.length; i++) {
            const step = loadingSteps[i];
            
            // Actualizar texto de carga
            this.updateLoadingText(step.name);
            
            // Actualizar barra de progreso
            this.updateProgress((i + 1) / loadingSteps.length * 100);
            
            // Mostrar mensaje aleatorio
            if (i % 2 === 0) {
                this.showRandomMessage();
            }
            
            // Esperar
            await TimeUtils.delay(step.duration);
            
            // Ejecutar acciones específicas
            await this.executeStep(step.action);
        }
        
        // Completar carga
        this.complete();
    }
    
    static createLoadingEffects() {
        const loadingScreen = document.getElementById('loading');
        if (!loadingScreen) return;
        
        // Crear contenedor de efectos
        const effectsContainer = document.createElement('div');
        effectsContainer.id = 'loading-effects';
        effectsContainer.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 0;
        `;
        
        loadingScreen.insertBefore(effectsContainer, loadingScreen.firstChild);
        
        // Crear órbitas
        this.createOrbits(effectsContainer);
        
        // Crear partículas flotantes
        this.createFloatingParticles(effectsContainer);
        
        // Crear mensaje adicional
        const extraMessage = document.createElement('p');
        extraMessage.id = 'loading-extra-message';
        extraMessage.style.cssText = `
            position: relative;
            z-index: 1;
            font-size: 0.9rem;
            color: #66BB6A;
            margin-top: 20px;
            opacity: 0;
            transition: opacity 0.5s ease;
            min-height: 20px;
        `;
        loadingScreen.appendChild(extraMessage);
    }
    
    static createOrbits(container) {
        for (let i = 0; i < 3; i++) {
            const orbit = document.createElement('div');
            const size = 300 + (i * 150);
            const duration = 20 + (i * 10);
            
            orbit.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: ${size}px;
                height: ${size}px;
                margin-left: -${size/2}px;
                margin-top: -${size/2}px;
                border: 2px solid rgba(76, 175, 80, ${0.15 - i * 0.03});
                border-radius: 50%;
                animation: orbit-spin ${duration}s linear infinite;
            `;
            
            // Agregar punto en la órbita
            const dot = document.createElement('div');
            dot.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                width: 8px;
                height: 8px;
                margin-left: -4px;
                margin-top: -4px;
                background: radial-gradient(circle, #8BC34A, transparent);
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(139, 195, 74, 0.8);
            `;
            
            orbit.appendChild(dot);
            container.appendChild(orbit);
        }
    }
    
    static createFloatingParticles(container) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;
            
            particle.style.cssText = `
                position: absolute;
                left: ${left}%;
                bottom: -10px;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(139, 195, 74, 0.8), transparent);
                border-radius: 50%;
                animation: float-up ${duration}s ease-in ${delay}s infinite;
            `;
            
            container.appendChild(particle);
        }
        
        // Agregar animación CSS si no existe
        if (!document.getElementById('loading-animations')) {
            const style = document.createElement('style');
            style.id = 'loading-animations';
            style.textContent = `
                @keyframes orbit-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes float-up {
                    0% { 
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { 
                        transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    static updateLoadingText(text) {
        const loadingText = document.querySelector('#loading > p');
        if (loadingText) {
            loadingText.style.opacity = '0';
            setTimeout(() => {
                loadingText.textContent = text;
                loadingText.style.opacity = '1';
            }, 200);
        }
    }
    
    static showRandomMessage() {
        const extraMessage = document.getElementById('loading-extra-message');
        if (!extraMessage) return;
        
        const randomMsg = this.loadingMessages[Math.floor(Math.random() * this.loadingMessages.length)];
        
        extraMessage.style.opacity = '0';
        setTimeout(() => {
            extraMessage.textContent = randomMsg;
            extraMessage.style.opacity = '1';
        }, 300);
    }
    
    static updateProgress(progress) {
        this.currentProgress = progress;
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }
    }
    
    static async executeStep(stepIndex) {
        switch (stepIndex) {
            case 0: // Inicializar sistema
                BrowserUtils.checkCompatibility();
                break;
                
            case 1: // Cargar recursos
                // Precargar assets si fuera necesario
                break;
                
            case 2: // Conectar con NASA
                try {
                    const isAPIAvailable = await nasaAPI.checkAPIStatus();
                    if (!isAPIAvailable) {
                        console.log('⚠️ NASA API no disponible, usando datos simulados');
                    }
                } catch (error) {
                    console.log('⚠️ Error verificando NASA API:', error);
                }
                break;
                
            case 3: // Preparar granja
                // Inicializar gameState
                break;
                
            case 4: // Finalizar
                // Configurar event listeners
                EventManager.setupAll();
                break;
        }
    }
    
    static complete() {
        // Efecto de transición suave
        const loadingScreen = document.getElementById('loading');
        const progressBar = document.querySelector('.loading-progress');
        
        // Completar barra al 100%
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        // Mensaje final
        this.updateLoadingText('✅ ¡Sistema listo!');
        
        setTimeout(() => {
            // Fade out con efecto
            if (loadingScreen) {
                loadingScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transform = 'scale(1.1)';
            }
            
            setTimeout(() => {
                ScreenManager.show('menu');
                
                
                // Limpiar efectos de carga
                const effects = document.getElementById('loading-effects');
                if (effects) effects.remove();
                
                const extraMsg = document.getElementById('loading-extra-message');
                if (extraMsg) extraMsg.remove();
            }, 800);
        }, 500);
    }
}