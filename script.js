/**
 * script.js - Archivo principal que inicializa todo
 */

// Variables globales
let game = null;
let hud = null;
let currentLoadingProgress = 0;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NASA Farm Navigator iniciando...');
    
    // Iniciar pantalla de carga
    startLoadingSequence();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar debug si está habilitado
    if (window.location.search.includes('debug=true')) {
        DebugUtils.enable();
    }
});

// Secuencia de carga
async function startLoadingSequence() {
    const loadingSteps = [
        { name: 'Inicializando sistema...', duration: 500 },
        { name: 'Cargando recursos...', duration: 800 },
        { name: 'Conectando con NASA...', duration: 1000 },
        { name: 'Preparando granja...', duration: 600 },
        { name: 'Finalizando...', duration: 300 }
    ];
    
    for (let i = 0; i < loadingSteps.length; i++) {
        const step = loadingSteps[i];
        
        // Actualizar texto de carga
        const loadingText = document.querySelector('#loading p');
        if (loadingText) {
            loadingText.textContent = step.name;
        }
        
        // Actualizar barra de progreso
        updateLoadingProgress((i + 1) / loadingSteps.length * 100);
        
        // Esperar
        await TimeUtils.delay(step.duration);
        
        // Ejecutar acciones específicas de cada paso
        await executeLoadingStep(i);
    }
    
    // Completar carga
    completeLoading();
}

// Actualizar progreso de carga
function updateLoadingProgress(progress) {
    currentLoadingProgress = progress;
    const progressBar = document.querySelector('.loading-progress');
    if (progressBar) {
        progressBar.style.width = Math.min(progress, 100) + '%';
    }
}

// Ejecutar acciones específicas de carga
async function executeLoadingStep(stepIndex) {
    switch (stepIndex) {
        case 0: // Inicializar sistema
            // Verificar compatibilidad del navegador
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
            // Inicializar datos base del juego
            break;
            
        case 4: // Finalizar
            // Últimos ajustes
            break;
    }
}

// Completar secuencia de carga
function completeLoading() {
    setTimeout(() => {
        ScreenManager.show('menu');
        showWelcomeMessage();
    }, 500);
}

// Configurar event listeners
function setupEventListeners() {
    // Botones del menú principal
    document.getElementById('play-btn')?.addEventListener('click', startGame);
    document.getElementById('tutorial-btn')?.addEventListener('click', showTutorial);
    document.getElementById('about-btn')?.addEventListener('click', showAbout);
    document.getElementById('back-to-menu')?.addEventListener('click', backToMenu);
    
    // Controles del juego
    document.getElementById('plant-btn')?.addEventListener('click', activatePlantMode);
    document.getElementById('water-btn')?.addEventListener('click', waterAllCrops);
    document.getElementById('harvest-btn')?.addEventListener('click', activateHarvestMode);
    document.getElementById('next-day-btn')?.addEventListener('click', nextDay);
    
    // Eventos de teclado global
    document.addEventListener('keydown', handleGlobalKeyboard);
    
    // Eventos de ventana
    window.addEventListener('beforeunload', saveGameState);
    window.addEventListener('resize', handleWindowResize);
}

// Funciones de navegación
function startGame() {
    console.log('🎮 Iniciando juego...');
    
    ScreenManager.show('game');
    
    // Inicializar juego con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        initializeGame();
    }, 100);
}

function showTutorial() {
    ScreenManager.show('tutorial');
}

function showAbout() {
    // Placeholder para pantalla "Acerca de"
    alert('🌱 NASA Farm Navigator\n\nSimulador agrícola que utiliza datos reales de la NASA para crear una experiencia educativa sobre agricultura y clima.\n\nDesarrollado con Phaser.js y NASA POWER API.');
}

function backToMenu() {
    ScreenManager.show('menu');
    
    // Limpiar juego si existe
    if (game) {
        game.destroy();
        game = null;
    }
}

// Inicializar el juego principal
function initializeGame() {
    try {
        // Crear nueva instancia del juego
        game = new Game();
        
        // El HUD se crea automáticamente en la clase Game
        hud = game.getHUD();
        
        // Mostrar tip inicial
        setTimeout(() => {
            TutorialUtils.showTip();
        }, 2000);
        
        console.log('✅ Juego inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando juego:', error);
        
        // Mostrar mensaje de error al usuario
        alert('Error al inicializar el juego. Por favor, recarga la página.');
        backToMenu();
    }
}

// Funciones de control del juego
function activatePlantMode() {
    console.log('🌱 Modo plantar activado');
    SoundUtils.playPlant();
    
    if (hud) {
        hud.showNotification('🌱 Haz clic en una celda vacía para plantar', 'info', 3000);
    }
}

function waterAllCrops() {
    console.log('💧 Regando todos los cultivos...');
    
    if (game) {
        const success = game.waterCrops();
        SoundUtils.playWater();
        
        if (!success && hud) {
            hud.showInsufficientEnergy();
        }
    }
}

function activateHarvestMode() {
    console.log('🌾 Modo cosechar activado');
    
    if (hud) {
        hud.showNotification('🌾 Haz clic en cultivos maduros (naranjas) para cosechar', 'info', 3000);
    }
}

async function nextDay() {
    console.log('🌅 Avanzando al siguiente día...');
    
    if (!game) {
        console.error('❌ Juego no inicializado');
        return;
    }
    
    try {
        // Obtener nuevo clima de la NASA API
        const newWeather = await nasaAPI.getNextDayWeather();
        
        // Actualizar estado del juego
        gameState.updateWeather(newWeather);
        gameState.nextDay();
        
        // Actualizar juego
        if (game.getCurrentScene()) {
            game.getCurrentScene().farm.updateCrops(newWeather);
        }
        
        SoundUtils.playNextDay();
        
        // Mostrar información del nuevo día
        const weatherDesc = WeatherUtils.getWeatherDescription(newWeather);
        if (hud) {
            hud.showNotification(`🌅 Día ${gameState.getDay()}: ${weatherDesc}`, 'info', 4000);
        }
        
        // Mostrar tip ocasionalmente
        if (Math.random() < 0.3) {
            setTimeout(() => TutorialUtils.showTip(), 1500);
        }
        
    } catch (error) {
        console.error('❌ Error avanzando día:', error);
        
        // Fallback: usar clima simulado
        gameState.nextDay();
        if (game.getCurrentScene()) {
            game.getCurrentScene().farm.updateCrops(gameState.getWeather());
        }
    }
}

// Manejo de eventos globales
function handleGlobalKeyboard(event) {
    // Teclas globales que funcionan en cualquier pantalla
    switch (event.code) {
        case 'F1':
            event.preventDefault();
            showTutorial();
            break;
            
        case 'Escape':
            if (ScreenManager.getCurrent() === 'game') {
                backToMenu();
            }
            break;
            
        case 'KeyD':
            if (event.ctrlKey) {
                event.preventDefault();
                DebugUtils.enabled ? DebugUtils.disable() : DebugUtils.enable();
            }
            break;
    }
    
    // Teclas específicas del juego
    if (ScreenManager.getCurrent() === 'game' && game) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                nextDay();
                break;
                
            case 'KeyW':
                event.preventDefault();
                waterAllCrops();
                break;
                
            case 'KeyR':
                if (event.ctrlKey) {
                    event.preventDefault();
                    restartGame();
                }
                break;
        }
    }
}

// Funciones auxiliares
function showWelcomeMessage() {
    console.log('👋 Bienvenido a NASA Farm Navigator');
    
    // Mostrar mensaje de bienvenida si es la primera vez
    const isFirstTime = !StorageUtils.exists('nasa_farm_played');
    
    if (isFirstTime) {
        setTimeout(() => {
            if (confirm('👋 ¡Bienvenido a NASA Farm Navigator!\n\n¿Te gustaría ver el tutorial antes de empezar?')) {
                showTutorial();
            }
            StorageUtils.save('nasa_farm_played', true);
        }, 1000);
    }
}

function saveGameState() {
    if (gameState && gameState.isGameStarted()) {
        const saveData = gameState.getGameData();
        StorageUtils.save('nasa_farm_save', saveData);
        console.log('💾 Progreso guardado');
    }
}

function loadGameState() {
    const saveData = StorageUtils.load('nasa_farm_save');
    if (saveData) {
        gameState.loadGameData(saveData);
        console.log('📂 Progreso cargado');
        return true;
    }
    return false;
}

function restartGame() {
    if (confirm('🔄 ¿Estás seguro de que quieres reiniciar el juego?')) {
        if (game) {
            game.restart();
        }
        StorageUtils.remove('nasa_farm_save');
        console.log('🔄 Juego reiniciado');
    }
}

function handleWindowResize() {
    // Ajustar interfaz si es necesario
    if (game && game.phaserGame) {
        // Phaser maneja el resize automáticamente con la configuración actual
        console.log('📐 Ventana redimensionada');
    }
}

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('💥 Error global:', event.error);
    
    // Intentar recuperación graceful
    if (ScreenManager.getCurrent() === 'game') {
        if (confirm('❌ Ha ocurrido un error. ¿Quieres volver al menú principal?')) {
            backToMenu();
        }
    }
});

// Función de limpieza al cerrar
window.addEventListener('beforeunload', () => {
    saveGameState();
    
    if (game) {
        game.destroy();
    }
});

console.log('✅ Script principal cargado y listo');