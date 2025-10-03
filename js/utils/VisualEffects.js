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


// Inicializar efectos visuales cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VisualEffects.init();
    });
} else {
    VisualEffects.init();
}