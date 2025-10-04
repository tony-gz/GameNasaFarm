
class Game {
    constructor() {
        this.phaserGame = null;
        this.player = null;
        this.farm = null;
        this.hud = null;
        this.currentScene = null;
        this.backgroundScene = null; // Referencia a la escena de fondo separada
        
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 500,
            backgroundColor: '#87CEEB',
            parent: 'phaser-game',
            // Múltiples escenas: BackgroundScene para el fondo, GameScene para la lógica
            scene: [BackgroundScene, GameScene], // BackgroundScene primero
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };
        
        this.init();
    }

    init() {
        console.log('🎮 Inicializando Game...');
        
        // Crear HUD
        this.hud = new HUD();
        
        // Inicializar Phaser
        this.initPhaser();
        
        // Almacenar referencia global
        window.game = this;
    }

    initPhaser() {
        this.phaserGame = new Phaser.Game(this.config);
        
        // Event listeners de Phaser
        this.phaserGame.events.on('ready', () => {
            console.log('✅ Phaser listo');
            this.onPhaserReady();
        });
    }

    onPhaserReady() {
        this.currentScene = this.phaserGame.scene.getScene('GameScene');
        this.backgroundScene = this.phaserGame.scene.getScene('BackgroundScene'); // Nueva referencia
        
        if (this.currentScene && this.backgroundScene) {
            // Obtener referencias a las entidades creadas en la escena principal
            this.player = this.currentScene.player;
            this.farm = this.currentScene.farm;
            
            // Iniciar ambas escenas
            this.phaserGame.scene.start('BackgroundScene');
            this.phaserGame.scene.start('GameScene');
            
            // Configurar la escena principal para que esté por encima del fondo
            this.phaserGame.scene.bringToTop('GameScene');
            
            console.log('🎮 Juego completamente inicializado con fondo');
        }
    }

    // Métodos de acceso a entidades
    getPlayer() {
        return this.player;
    }

    getFarm() {
        return this.farm;
    }

    getHUD() {
        return this.hud;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    getBackgroundScene() {
        return this.backgroundScene;
    }

    // Nuevos métodos para controlar el fondo
    setParallaxSpeed(multiplier) {
        if (this.backgroundScene) {
            this.backgroundScene.setParallaxSpeed(multiplier);
        }
    }

    addFogEffect() {
        if (this.backgroundScene) {
            this.backgroundScene.addFogEffect();
        }
    }

    addParticleEffects() {
        if (this.backgroundScene) {
            this.backgroundScene.addParticleEffects();
        }
    }

    // Métodos de control del juego
    plantCrop(cropType = 'tomato') {
        if (!this.farm) {
            console.log('❌ Granja no disponible');
            return false;
        }

        console.log(`🌱 Modo plantar ${cropType} activado`);
        return true;
    }

    waterCrops() {
        if (!this.farm) {
            console.log('❌ Granja no disponible');
            return false;
        }

        return this.farm.waterAllCrops();
    }

    nextDay() {
        if (!this.currentScene) {
            console.log('❌ Escena no disponible');
            return false;
        }

        this.currentScene.nextDay();
        return true;
    }

    // Métodos de información
    getGameStatus() {
        return {
            gameState: gameState.getGameData(),
            farmStatus: this.farm ? this.farm.getFarmStatus() : null,
            playerStatus: this.player ? {
                position: this.player.getPosition()
            } : null
        };
    }

    // Métodos de utilidad
    pause() {
        if (this.phaserGame) {
            this.phaserGame.scene.pause('GameScene');
            this.phaserGame.scene.pause('BackgroundScene'); // Pausar también el fondo
            console.log('⏸️ Juego pausado');
        }
    }

    resume() {
        if (this.phaserGame) {
            this.phaserGame.scene.resume('GameScene');
            this.phaserGame.scene.resume('BackgroundScene'); // Reanudar también el fondo
            console.log('▶️ Juego reanudado');
        }
    }

    restart() {
        console.log('🔄 Reiniciando juego...');
        
        // Resetear estado
        gameState.reset();
        
        // Reiniciar ambas escenas
        if (this.phaserGame) {
            this.phaserGame.scene.restart('BackgroundScene');
            this.phaserGame.scene.restart('GameScene');
        }
    }

    // Cleanup
    destroy() {
        console.log('🧹 Destruyendo Game...');
        
        // Destruir HUD
        if (this.hud) {
            this.hud.destroy();
            this.hud = null;
        }

        // Destruir Phaser
        if (this.phaserGame) {
            this.phaserGame.destroy(true);
            this.phaserGame = null;
        }

        // Limpiar referencias
        this.player = null;
        this.farm = null;
        this.currentScene = null;
        this.backgroundScene = null; // Limpiar nueva referencia
        
        // Limpiar referencia global
        if (window.game === this) {
            delete window.game;
        }
    }
}
