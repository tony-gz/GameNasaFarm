/**
 * VisualEffects.js - Efectos visuales adicionales para pantallas
 */

class VisualEffects {
    static init() {
        this.addGlobalEffects();
    }
    
    static addGlobalEffects() {
        // Agregar cursor personalizado para el juego
        this.setupCustomCursor();
        
        // Agregar efecto de partículas al hacer clic
        this.setupClickEffects();
    }
    
    static setupCustomCursor() {
        document.addEventListener('mousemove', (e) => {
            // Solo en pantallas de menú y carga
            const currentScreen = ScreenManager.getCurrent();
            if (currentScreen === 'menu' || currentScreen === 'loading') {
                this.createCursorTrail(e.clientX, e.clientY);
            }
        });
    }
    
    static createCursorTrail(x, y) {
        // Solo crear trail ocasionalmente para no saturar
        if (Math.random() > 0.3) return;
        
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(139, 195, 74, 0.6), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: trail-fade 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => trail.remove(), 800);
        
        // Agregar animación si no existe
        if (!document.getElementById('cursor-animations')) {
            const style = document.createElement('style');
            style.id = 'cursor-animations';
            style.textContent = `
                @keyframes trail-fade {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                }
                
                @keyframes click-burst {
                    0% {
                        opacity: 1;
                        transform: scale(0) rotate(0deg);
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.5) rotate(180deg);
                    }
                }
                
                @keyframes ripple {
                    0% {
                        width: 0;
                        height: 0;
                        opacity: 0.5;
                    }
                    100% {
                        width: 100px;
                        height: 100px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    static setupClickEffects() {
        document.addEventListener('click', (e) => {
            this.createClickBurst(e.clientX, e.clientY);
            this.createRipple(e.clientX, e.clientY);
        });
    }
    
    static createClickBurst(x, y) {
        const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#66BB6A'];
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / 8;
            const velocity = 50;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                box-shadow: 0 0 10px ${color};
            `;
            
            document.body.appendChild(particle);
            
            // Animar partícula
            const animation = particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0.3)`,
                    opacity: 0
                }
            ], {
                duration: 600,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => particle.remove();
        }
    }
    
    static createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border: 2px solid rgba(76, 175, 80, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9997;
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    static createScreenTransition(fromScreen, toScreen) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, 
                rgba(76, 175, 80, 0.3) 0%, 
                rgba(15, 32, 39, 0.9) 100%);
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Cambiar pantalla
        setTimeout(() => {
            ScreenManager.show(toScreen);
        }, 300);
        
        // Fade out
        setTimeout(() => {
            overlay.style.opacity = '0';
        }, 400);
        
        // Limpiar
        setTimeout(() => {
            overlay.remove();
        }, 700);
    }
}


    
   


/**
 * TimeUtils - Utilidades de tiempo
 */
class TimeUtils {
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * DebugUtils - Utilidades de depuración
 */
class DebugUtils {
    static enabled = false;
    
    static enable() {
        this.enabled = true;
        console.log('🐛 Modo debug activado');
        this.showDebugPanel();
    }
    
    static disable() {
        this.enabled = false;
        console.log('🐛 Modo debug desactivado');
        this.hideDebugPanel();
    }
    
    static toggle() {
        this.enabled ? this.disable() : this.enable();
    }
    
    static showDebugPanel() {
        let panel = document.getElementById('debug-panel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'debug-panel';
            panel.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #0f0;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                border-radius: 5px;
                z-index: 99999;
                max-width: 300px;
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(panel);
        }
        
        panel.style.display = 'block';
        this.updateDebugInfo();
        
        // Actualizar cada segundo
        this.debugInterval = setInterval(() => {
            this.updateDebugInfo();
        }, 1000);
    }
    
    static hideDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.style.display = 'none';
        }
        
        if (this.debugInterval) {
            clearInterval(this.debugInterval);
        }
    }
    
    static updateDebugInfo() {
        const panel = document.getElementById('debug-panel');
        if (!panel) return;
        
        const info = {
            'Screen': ScreenManager.getCurrent(),
            'Game Active': window.game ? 'Yes' : 'No',
            'FPS': window.game?.phaserGame?.loop?.actualFps?.toFixed(0) || 'N/A',
            'Memory': `${(performance.memory?.usedJSHeapSize / 1048576).toFixed(2) || 'N/A'} MB`
        };
        
        panel.innerHTML = Object.entries(info)
            .map(([key, value]) => `<div>${key}: ${value}</div>`)
            .join('');
    }
}

// Inicializar efectos visuales cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VisualEffects.init();
    });
} else {
    VisualEffects.init();
}