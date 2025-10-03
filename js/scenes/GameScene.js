/**
 * GameScene.js - Escena principal del juego con sistema de herramientas
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.farm = null;
        this.currentTool = 'none'; // Estado de herramienta actual
        this.isPickingUpTool = false; // Flag para evitar interrupciones
    }

    preload() {
        console.log('🎮 Cargando GameScene...');
        this.load.image('corn_semilla', 'assets/data/images/crops/corn_semilla.png');
        this.load.image('corn_germinacion', 'assets/data/images/crops/corn_germinacion.png');
        this.load.image('corn_floracion', 'assets/data/images/crops/corn_floracion.png');
        this.load.image('corn_maduracion', 'assets/data/images/crops/corn_maduracion.png');
        this.load.image('corn_marchitacion', 'assets/data/images/crops/corn_marchitacion.png'); 

        this.load.image('tomato_semilla', 'assets/data/images/crops/tomato_semilla.png');
        this.load.image('tomato_germinacion', 'assets/data/images/crops/tomato_germinacion.png');
        this.load.image('tomato_floracion', 'assets/data/images/crops/tomato_floracion.png');  
        this.load.image('tomato_maduracion', 'assets/data/images/crops/tomato_maduracion.png');
        this.load.image('tomato_marchitacion', 'assets/data/images/crops/tomato_marchitacion.png');
        
        this.load.image('wheat_semilla', 'assets/data/images/crops/wheat_semilla.png');
        this.load.image('wheat_germinacion', 'assets/data/images/crops/wheat_germinacion.png');
        this.load.image('wheat_floracion', 'assets/data/images/crops/wheat_floracion.png');  
        this.load.image('wheat_maduracion', 'assets/data/images/crops/wheat_maduracion.png');
        this.load.image('wheat_marchitacion', 'assets/data/images/crops/wheat_marchitacion.png');   

        // Cargar spritesheet del jugador
        this.load.spritesheet('player', 'assets/sheet2.png', {
            frameWidth: 444,
            frameHeight: 562
        });
    }

    create() {
        console.log('🎮 GameScene creada');
        
        // Crear animaciones del jugador
        this.createAnimations();
        
        // Fondo transparente para ver BackgroundScene
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
        
        // Crear jugador
        this.player = new Player(this, 40, 437);
        
        // Crear granja (ejemplo: 5x3 celdas)
        this.farm = new Farm(this, 5, 3);
        
        // Configurar interacciones
        this.setupInteractions();
        
        // Configurar controles
        this.setupControls();
        
        // Almacenar referencias globalmente
        window.gameScene = this;
    }

    createAnimations() {
        // Animación de caminar sin herramientas
        this.anims.create({
            key: 'caminar',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });
        // Animaciones de herramientas
        this.anims.create({
            key: 'agarrar-balde',
            frames: this.anims.generateFrameNumbers('player', { frames: [4, 5, 6, 7] }),
            frameRate: 6,
            repeat: 0
        });
        this.anims.create({
            key: 'caminar-balde',
            frames: this.anims.generateFrameNumbers('player', { frames: [8, 9, 10] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'agarrar-pala',
            frames: this.anims.generateFrameNumbers('player', { frames: [11, 12, 13, 14] }),
            frameRate: 6,
            repeat: 0
        });
        this.anims.create({
            key: 'caminar-pala',
            frames: this.anims.generateFrameNumbers('player', { frames: [15, 16, 17] }),
            frameRate: 5,
            repeat: -1
        });
        // Parados
        this.anims.create({
            key: 'parado',
            frames: this.anims.generateFrameNumbers('player', { frames: [0] }),
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: 'parado-balde',
            frames: this.anims.generateFrameNumbers('player', { frames: [7] }),
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: 'parado-pala',
            frames: this.anims.generateFrameNumbers('player', { frames: [14] }),
            frameRate: 1,
            repeat: 0
        });
    }

    setupInteractions() {
        this.input.on('pointerdown', (pointer) => this.handleSceneClick(pointer));
        this.input.on('pointermove', (pointer) => this.handleSceneHover(pointer));
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            'P': Phaser.Input.Keyboard.KeyCodes.P, // Pala
            'W': Phaser.Input.Keyboard.KeyCodes.W, // Cubeta
            'H': Phaser.Input.Keyboard.KeyCodes.H, // Cosecha
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE, // Nuevo día
            'Q': Phaser.Input.Keyboard.KeyCodes.Q // Soltar herramienta
        });
    }

    handleSceneClick(pointer) {
        if (!this.farm) {
            this.movePlayerTowards(pointer.x, pointer.y);
            return;
        }

        const gridPos = this.farm.getGridPosition(pointer.x, pointer.y);
        if (!gridPos) {
            this.movePlayerTowards(pointer.x, pointer.y);
            return;
        }

        const crop = this.farm.getCropAt(gridPos.x, gridPos.y);

        // Si tiene pala → plantar
        if (this.currentTool === 'shovel') {
            const result = this.farm.attemptPlant(gridPos.x, gridPos.y, 'tomato'); 
            if (result) this.handleFarmAction(result);
            return;
        }

        // Si tiene cubeta → regar
        if (this.currentTool === 'bucket') {
            const watered = this.farm.waterCrop(gridPos.x, gridPos.y);
            if (watered) {
                hud.showNotification('💧 Cultivo regado', 'success');
            } else {
                hud.showNotification('⚠️ No hay cultivo para regar', 'error');
            }
            return;
        }

        // Si no tiene herramienta → cosechar
        if (crop) {
            const result = this.farm.attemptHarvest(gridPos.x, gridPos.y);
            if (result) this.handleFarmAction(result);
        } else {
            this.movePlayerTowards(pointer.x, pointer.y);
        }
    }

    handleSceneHover(pointer) {
        if (!this.farm) {
            this.input.setDefaultCursor('default');
            return;
        }
        const gridPos = this.farm.getGridPosition(pointer.x, pointer.y);
        if (gridPos) {
            const crop = this.farm.getCropAt(gridPos.x, gridPos.y);
            if (crop) {
                if (crop.canHarvest()) this.input.setDefaultCursor('pointer');
                else this.input.setDefaultCursor('help');
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
                    case 'not_ready': hud.showCropNotReady(); break;
                    case 'no_energy': hud.showInsufficientEnergy(); break;
                    default: hud.showNotification('❌ No se pudo cosechar', 'error');
                }
            }
        }
    }

    movePlayerTowards(x, y) {
        const currentPos = this.player.getPosition();
        const distance = this.player.distanceTo(x, y);
        if (distance < 200) {
            this.tweens.add({
                targets: this.player.sprite,
                x: x, y: y,
                duration: distance * 2,
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
        if (this.isPickingUpTool) return;

        if (this.cursors.left.isDown) {
            this.player.moveLeft(this.currentTool);
        } else if (this.cursors.right.isDown) {
            this.player.moveRight(this.currentTool);
        } else {
            this.player.stay(this.currentTool);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) this.pickUpTool('shovel');
        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) this.pickUpTool('bucket');
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.dropTool();
        if (Phaser.Input.Keyboard.JustDown(this.keys.H)) console.log('🌾 Intento de cosechar con tecla H');
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.nextDay();
    }

    pickUpTool(tool) {
        if (this.currentTool === tool) return;
        if (this.currentTool !== 'none') {
            this.dropTool();
            this.time.delayedCall(400, () => this.executePickUpTool(tool));
        } else {
            this.executePickUpTool(tool);
        }
    }

    executePickUpTool(tool) {
        this.isPickingUpTool = true;
        const pickupAnimation = tool === 'bucket' ? 'agarrar-balde' : 'agarrar-pala';
        this.player.sprite.play(pickupAnimation);
        this.player.sprite.once('animationcomplete', () => {
            this.currentTool = tool;
            this.isPickingUpTool = false;
            this.player.stay(tool);
            const toolName = tool === 'bucket' ? 'Cubeta' : 'Pala';
            if (window.hud) {
                const emoji = tool === 'bucket' ? '💧' : '🌱';
                const action = tool === 'bucket' ? 'regar' : 'plantar';
                hud.showNotification(`${emoji} ${toolName} equipada - Listo para ${action}`, 'info', 2000);
            }
        });
    }

    dropTool() {
        if (this.currentTool === 'none') return;
        this.currentTool = 'none';
        this.player.stay('none');
        if (window.hud) hud.showNotification('📦 Herramienta guardada', 'info', 1500);
    }

    waterAllCrops() {
        if (!this.farm) return;
        if (this.currentTool !== 'bucket') {
            if (window.hud) hud.showNotification('⚠️ Necesitas equipar la cubeta (W)', 'error', 2500);
            return;
        }
        const result = this.farm.waterAllCrops();
        if (result) hud.showNotification('💧 Todos los cultivos regados', 'success');
        else hud.showInsufficientEnergy();
    }

    nextDay() {
        gameState.nextDay();
        if (this.farm) {
            this.farm.updateCrops(gameState.getWeather());
            const farmStatus = this.farm.getFarmStatus();
            if (farmStatus.readyToHarvest > 0) {
                hud.showNotification(`🌾 ${farmStatus.readyToHarvest} cultivos listos para cosechar`, 'info', 4000);
            }
        }
        console.log('🌅 Nuevo día:', gameState.getDay());
    }

    getFarmStatus() { return this.farm ? this.farm.getFarmStatus() : null; }
    getPlayerStatus() {
        return {
            money: gameState.getMoney(),
            energy: gameState.getEnergy(),
            position: this.player ? this.player.getPosition() : null,
            currentTool: this.currentTool
        };
    }
    getCurrentTool() { return this.currentTool; }

    destroy() {
        if (this.player) this.player.destroy();
        if (this.farm) this.farm.destroy();
        if (window.gameScene === this) delete window.gameScene;
        super.destroy();
    }
}
