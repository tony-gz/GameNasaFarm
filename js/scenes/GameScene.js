/**
 * GameScene.js - Escena principal del juego
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.farm = null;
    }

    preload() {
        console.log('🎮 Cargando GameScene...');
        
        // Crear pixel básico para sprites simples
        this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        
        // Aquí podrían cargarse más assets en el futuro

        this.load.image('corn_seed', 'assets/images/crops/corn.png');
        this.load.image('corn_stage1', 'assets/images/crops/corn_stage1.png');
        this.load.image('corn_stage2', 'assets/images/crops/corn_stage2.png');
        this.load.image('corn_mature', 'assets/images/crops/corn_mature.png');
        this.load.image('corn_dead', 'assets/images/crops/corn_dead.png');
        this.load.image('tomato_seed', 'assets/images/crops/tomato_seed.png');
        this.load.image('tomato_stage1', 'assets/images/crops/tomato_stage1.png');
        this.load.image('tomato_stage2', 'assets/images/crops/tomato_stage2.png');
        this.load.image('tomato_mature', 'assets/images/crops/tomato_mature.png');
        this.load.image('tomato_dead', 'assets/images/crops/tomato_dead.png');
    

        console.log("Assets precargados para GameScene")
    }

    create() {
        console.log('🎮 GameScene creada');
        
        // Crear fondo
        this.createBackground();
        
        // Crear jugador
        this.player = new Player(this, 100, 250);
        
        // Crear granja
        this.farm = new Farm(this, 5, 3);
        
        // Configurar interacciones
        this.setupInteractions();
        
        // Configurar controles
        this.setupControls();
        
        // Almacenar referencias globalmente para fácil acceso
        window.gameScene = this;
    }

    createBackground() {
        // Crear un fondo simple con gradiente de cielo
        const graphics = this.add.graphics();
        
        // Cielo
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height * 0.7);
        
        // Tierra
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(0, this.cameras.main.height * 0.7, this.cameras.main.width, this.cameras.main.height * 0.3);
    }

    setupInteractions() {
        // Clic en la escena
        this.input.on('pointerdown', (pointer) => {
            this.handleSceneClick(pointer);
        });

        // Hover sobre elementos
        this.input.on('pointermove', (pointer) => {
            this.handleSceneHover(pointer);
        });
    }

    setupControls() {
        // Teclas de acceso rápido
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Teclas adicionales
        this.keys = this.input.keyboard.addKeys({
            'P': Phaser.Input.Keyboard.KeyCodes.P, // Plantar
            'W': Phaser.Input.Keyboard.KeyCodes.W, // Regar
            'H': Phaser.Input.Keyboard.KeyCodes.H, // Cosechar
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE // Siguiente día
        });
    }

    handleSceneClick(pointer) {
        const result = this.farm.handleClick(pointer.x, pointer.y);
        
        if (result) {
            this.handleFarmAction(result);
        } else {
            // Mover jugador hacia el clic si no es en la granja
            this.movePlayerTowards(pointer.x, pointer.y);
        }
    }

    handleSceneHover(pointer) {
        // Cambiar cursor basado en lo que está debajo
        const gridPos = this.farm.getGridPosition(pointer.x, pointer.y);
        
        if (gridPos) {
            const crop = this.farm.getCropAt(gridPos.x, gridPos.y);
            
            if (crop) {
                if (crop.canHarvest()) {
                    this.input.setDefaultCursor('pointer');
                } else {
                    this.input.setDefaultCursor('help');
                }
            } else {
                this.input.setDefaultCursor('crosshair');
            }
        } else {
            this.input.setDefaultCursor('default');
        }
    }

    handleFarmAction(result) {
        if (result.action === 'plant' && result.success) {
            hud.showPlantSuccess(result.cropType, 50);
        } else if (result.action === 'harvest') {
            if (result.success) {
                hud.showHarvestSuccess(result.harvest.type, result.harvest.value);
            } else {
                switch (result.reason) {
                    case 'not_ready':
                        hud.showCropNotReady();
                        break;
                    case 'no_energy':
                        hud.showInsufficientEnergy();
                        break;
                    default:
                        hud.showNotification('❌ No se pudo cosechar', 'error');
                }
            }
        }
    }

    movePlayerTowards(x, y) {
        // Animación simple para mover el jugador
        const currentPos = this.player.getPosition();
        const distance = this.player.distanceTo(x, y);
        
        // Solo mover si está cerca (evitar saltos largos)
        if (distance < 200) {
            this.tweens.add({
                targets: this.player.sprite,
                x: x,
                y: y,
                duration: distance * 2, // Velocidad proporcional a distancia
                ease: 'Power2',
                onComplete: () => {
                    this.player.x = x;
                    this.player.y = y;
                }
            });
        }
    }

    update() {
        this.handleKeyboardInput();
    }

    handleKeyboardInput() {
        // Teclas de acceso rápido
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            console.log('🌱 Modo plantar activado (teclado)');
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.waterAllCrops();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
            console.log('🌾 Modo cosechar activado (teclado)');
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.nextDay();
        }
    }

    // Acciones del juego
    waterAllCrops() {
        const result = this.farm.waterAllCrops();
        if (result) {
            hud.showNotification('💧 Todos los cultivos regados', 'success');
        } else {
            hud.showInsufficientEnergy();
        }
    }

    nextDay() {
        gameState.nextDay();
        
        // Actualizar cultivos con el nuevo clima
        this.farm.updateCrops(gameState.getWeather());
        
        // Mostrar estado de la granja
        const farmStatus = this.farm.getFarmStatus();
        if (farmStatus.readyToHarvest > 0) {
            hud.showNotification(`🌾 ${farmStatus.readyToHarvest} cultivos listos para cosechar`, 'info', 4000);
        }
        
        console.log('🌅 Nuevo día:', gameState.getDay());
    }

    // Métodos de utilidad
    getFarmStatus() {
        return this.farm ? this.farm.getFarmStatus() : null;
    }

    getPlayerStatus() {
        return {
            money: gameState.getMoney(),
            energy: gameState.getEnergy(),
            position: this.player ? this.player.getPosition() : null
        };
    }

    // Cleanup
    destroy() {
        if (this.player) {
            this.player.destroy();
        }
        
        if (this.farm) {
            this.farm.destroy();
        }
        
        // Limpiar referencia global
        if (window.gameScene === this) {
            delete window.gameScene;
        }
        
        super.destroy();
    }
}