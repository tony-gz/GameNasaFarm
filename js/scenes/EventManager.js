/**
 * EventManager.js - Centraliza todos los event listeners del juego
 */

class EventManager {
    static setupAll() {
        this.setupMenuButtons();
        this.setupGameButtons();
        this.setupKeyboard();
        this.setupWindow();
    }

    static setupMenuButtons() {
        document.getElementById('play-btn')?.addEventListener('click', () => {
            NavigationManager.startGame();
        });

        document.getElementById('tutorial-btn')?.addEventListener('click', () => {
            NavigationManager.showTutorial();
        });

        document.getElementById('about-btn')?.addEventListener('click', () => {
            NavigationManager.showAbout();
        });

        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            NavigationManager.backToMenu();
        });
    }

    static setupGameButtons() {
        document.getElementById('btn-plant')?.addEventListener('click', () => {
            GameActions.activatePlantMode();
        });

        document.getElementById('btn-water')?.addEventListener('click', () => {
            GameActions.waterAllCrops();
        });

        document.getElementById('btn-harvest')?.addEventListener('click', () => {
            GameActions.activateHarvestMode();
        });

        document.getElementById('btn-next-day')?.addEventListener('click', () => {
            GameActions.nextDay();
        });
    }

    static setupKeyboard() {
        document.addEventListener('keydown', (event) => {
            KeyboardHandler.handle(event);
        });
    }

    static setupWindow() {
        window.addEventListener('beforeunload', () => {
            GameSaveManager.save();
        });

        window.addEventListener('resize', () => {
            WindowHandler.handleResize();
        });
    }
}

/**
 * NavigationManager.js - Maneja la navegación entre pantallas
 */
class NavigationManager {
    static startGame() {
        console.log('🎮 Iniciando juego...');
        music.pause();
        ScreenManager.show('game');

        setTimeout(() => {
            GameInitializer.init();
        }, 100);
    }

    static showTutorial() {
        ScreenManager.show('tutorial');
    }

    static showAbout() {
        alert('🌱 NASA Farm Navigator\n\nSimulador agrícola que utiliza datos reales de la NASA para crear una experiencia educativa sobre agricultura y clima.\n\nDesarrollado con Phaser.js y NASA POWER API.');
    }

    static backToMenu() {
        ScreenManager.show('menu');

        if (window.game) {
            window.game.destroy();
            window.game = null;
        }
    }
}

/**
 * GameActions.js - Acciones del juego
 */
class GameActions {
    static activatePlantMode() {
        console.log('🌱 Modo plantar activado');
        SoundUtils.playPlant();

        if (window.hud) {
            window.hud.showNotification('🌱 Haz clic en una celda vacía para plantar', 'info', 3000);
        }
    }

    static waterAllCrops() {
        console.log('💧 Regando todos los cultivos...');

        if (window.game) {
            const success = window.game.waterCrops();
            SoundUtils.playWater();

            if (!success && window.hud) {
                window.hud.showInsufficientEnergy();
            }
        }
    }

    static activateHarvestMode() {
        console.log('🌾 Modo cosechar activado');

        if (window.hud) {
            window.hud.showNotification('🌾 Haz clic en cultivos maduros (naranjas) para cosechar', 'info', 3000);
        }
    }

    static async nextDay() {
        console.log('🌅 Avanzando al siguiente día...');

        if (!window.game) {
            console.error('❌ Juego no inicializado');
            return;
        }

        try {
            const newWeather = await nasaAPI.getNextDayWeather();
            gameState.updateWeather(newWeather);
            gameState.nextDay();

            if (window.game.getCurrentScene()) {
                window.game.getCurrentScene().farm.updateCrops(newWeather);
            }

            SoundUtils.playNextDay();

            const weatherDesc = WeatherUtils.getWeatherDescription(newWeather);
            if (window.hud) {
                window.hud.showNotification(`🌅 Día ${gameState.getDay()}: ${weatherDesc}`, 'info', 4000);
            }

            if (Math.random() < 0.3) {
                setTimeout(() => TutorialUtils.showTip(), 1500);
            }

        } catch (error) {
            console.error('❌ Error avanzando día:', error);
            gameState.nextDay();
            if (window.game.getCurrentScene()) {
                window.game.getCurrentScene().farm.updateCrops(gameState.getWeather());
            }
        }
    }
}

/**
 * KeyboardHandler.js - Maneja eventos de teclado
 */
class KeyboardHandler {
    static handle(event) {
        // Teclas globales
        switch (event.code) {
            case 'F1':
                event.preventDefault();
                NavigationManager.showTutorial();
                break;

            case 'Escape':
                if (ScreenManager.getCurrent() === 'game') {
                    NavigationManager.backToMenu();
                }
                break;

            case 'KeyD':
                if (event.ctrlKey) {
                    event.preventDefault();
                    DebugUtils.toggle();
                }
                break;
        }

        // Teclas específicas del juego
        if (ScreenManager.getCurrent() === 'game') {
            this.handleGameKeys(event);
        }
    }

    static handleGameKeys(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                GameActions.nextDay();
                break;

            case 'KeyW':
                event.preventDefault();
                GameActions.waterAllCrops();
                break;

            case 'KeyP':
                event.preventDefault();
                GameActions.activatePlantMode();
                break;

            case 'KeyH':
                event.preventDefault();
                GameActions.activateHarvestMode();
                break;

            case 'KeyR':
                if (event.ctrlKey) {
                    event.preventDefault();
                    GameResetManager.restart();
                }
                break;
        }
    }
}

/**
 * WindowHandler.js - Maneja eventos de ventana
 */
class WindowHandler {
    static handleResize() {
        if (window.game && window.game.phaserGame) {
            console.log('🔧 Ventana redimensionada');
        }
    }
}

/**
 * GameSaveManager.js - Maneja guardado/carga
 */
class GameSaveManager {
    static save() {
        if (gameState && gameState.isGameStarted()) {
            const saveData = gameState.getGameData();
            StorageUtils.save('nasa_farm_save', saveData);
            console.log('💾 Progreso guardado');
        }
    }

    static load() {
        const saveData = StorageUtils.load('nasa_farm_save');
        if (saveData) {
            gameState.loadGameData(saveData);
            console.log('📂 Progreso cargado');
            return true;
        }
        return false;
    }
}

/**
 * GameResetManager.js - Maneja reinicio del juego
 */
class GameResetManager {
    static restart() {
        if (confirm('🔄 ¿Estás seguro de que quieres reiniciar el juego?')) {
            if (window.game) {
                window.game.restart();
            }
            StorageUtils.remove('nasa_farm_save');
            console.log('🔄 Juego reiniciado');
        }
    }
}

/**
 * GameInitializer.js - Inicializa el juego
 */
class GameInitializer {
    static init() {
        try {
            window.game = new Game();
            window.hud = window.game.getHUD();

            setTimeout(() => {
                TutorialUtils.showTip();
            }, 2000);

            console.log('✅ Juego inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando juego:', error);
            ErrorHandler.handleInitError();
        }
    }
}

/**
 * ErrorHandler.js - Maneja errores del juego
 */
class ErrorHandler {
    static handle(error) {
        if (ScreenManager.getCurrent() === 'game') {
            if (confirm('❌ Ha ocurrido un error. ¿Quieres volver al menú principal?')) {
                NavigationManager.backToMenu();
            }
        }
    }

    static handleInitError() {
        alert('Error al inicializar el juego. Por favor, recarga la página.');
        NavigationManager.backToMenu();
    }
}

/**
 * BrowserUtils.js - Utilidades del navegador
 */
class BrowserUtils {
    static checkCompatibility() {
        // Verificar soporte básico
        if (!window.localStorage) {
            console.warn('⚠️ LocalStorage no disponible');
        }

        if (!window.WebGLRenderingContext) {
            console.warn('⚠️ WebGL no disponible');
        }
    }
}
