/**
 * script.js - Archivo principal (versión minimalista)
 * Solo inicializa y delega a las clases correspondientes
 */

// Variables globales mínimas
let game = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NASA Farm Navigator iniciando...');
    
    // Inicializar el gestor de carga
    LoadingManager.start();

    // Esperar a que todo esté cargado
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (typeof WeatherAPIMenu !== 'undefined') {
                window.weatherAPIMenu = new WeatherAPIMenu();
                console.log('✅ WeatherAPIMenu inicializado correctamente');
            } else {
                console.error('❌ WeatherAPIMenu no está definido');
            }
        }, 500);
    });
    
    // Configurar debug si está habilitado
    if (window.location.search.includes('debug=true')) {
        DebugUtils.enable();
    }
});

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('💥 Error global:', event.error);
    ErrorHandler.handle(event.error);
});

// Limpieza al cerrar
window.addEventListener('beforeunload', () => {
    if (game) {
        game.saveAndDestroy();
    }
});

console.log('✅ Script principal cargado y listo');