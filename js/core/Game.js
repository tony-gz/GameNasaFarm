/**
 * Game.js - Clase principal que maneja Phaser y las escenas
 */

class Game {
    constructor() {
        this.phaserGame = null;
        this.player = null;
        this.farm = null;
        this.hud = null;
        this.currentScene = null;
        
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 500,
            backgroundColor: '#87CEEB',
            parent: 'phaser-game',
            scene: GameScene,
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
        
        if (this.currentScene) {
            // Obtener referencias a las entidades creadas en la escena
            this.player = this.currentScene.player;
            this.farm = this.currentScene.farm;
            
            console.log('🎮 Juego completamente inicializado');
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

    // Métodos de control del juego
    plantCrop(cropType = 'tomato') {
        if (!this.farm) {
            console.log('❌ Granja no disponible');
            return false;
        }

        // Esta función se usaría para plantar en una posición específica
        // Por ahora, la lógica de plantado se maneja en los clicks
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
            console.log('⏸️ Juego pausado');
        }
    }

    resume() {
        if (this.phaserGame) {
            this.phaserGame.scene.resume('GameScene');
            console.log('▶️ Juego reanudado');
        }
    }

    restart() {
        console.log('🔄 Reiniciando juego...');
        
        // Resetear estado
        gameState.reset();
        
        // Reiniciar escena
        if (this.phaserGame) {
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
        
        // Limpiar referencia global
        if (window.game === this) {
            delete window.game;
        }
    }
}