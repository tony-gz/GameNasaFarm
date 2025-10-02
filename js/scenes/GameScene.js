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
        
        // IMPORTANTE: Hacer el fondo de la cámara transparente para ver BackgroundScene
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
        
        // Crear jugador
        this.player = new Player(this, 100, 250);
        
        // Granja desactivada temporalmente
        this.farm = null;
        
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
            frames: this.anims.generateFrameNumbers('player', {
                frames: [1, 2, 3]
            }),
            frameRate: 5,
            repeat: -1
        });
        
        // Animación de agarrar balde
        this.anims.create({
            key: 'agarrar-balde',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 6,
            repeat: 0
        });
        
        // Animación de caminar con balde
        this.anims.create({
            key: 'caminar-balde',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [8, 9, 10]
            }),
            frameRate: 5,
            repeat: -1
        });
        
        // Animación de agarrar pala
        this.anims.create({
            key: 'agarrar-pala',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [11, 12, 13, 14]
            }),
            frameRate: 6,
            repeat: 0
        });
        
        // Animación de caminar con pala
        this.anims.create({
            key: 'caminar-pala',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [15, 16, 17]
            }),
            frameRate: 5,
            repeat: -1
        });
        
        // Animación de parado sin herramientas
        this.anims.create({
            key: 'parado',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0]
            }),
            frameRate: 1,
            repeat: 0
        });

        // Animación de parado con balde
        this.anims.create({
            key: 'parado-balde',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [7]
            }),
            frameRate: 1,
            repeat: 0
        });

        // Animación de parado con pala
        this.anims.create({
            key: 'parado-pala',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [14]
            }),
            frameRate: 1,
            repeat: 0
        });
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
            'P': Phaser.Input.Keyboard.KeyCodes.P, // Pala
            'W': Phaser.Input.Keyboard.KeyCodes.W, // Water/Balde
            'H': Phaser.Input.Keyboard.KeyCodes.H, // Harvest
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE, // Siguiente día
            'Q': Phaser.Input.Keyboard.KeyCodes.Q // Soltar herramienta
        });
    }

    handleSceneClick(pointer) {
        // Si no hay granja, solo mover al jugador
        if (!this.farm) {
            this.movePlayerTowards(pointer.x, pointer.y);
            return;
        }
        
        const result = this.farm.handleClick(pointer.x, pointer.y);
        
        if (result) {
            this.handleFarmAction(result);
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
        const currentPos = this.player.getPosition();
        const distance = this.player.distanceTo(x, y);
        
        if (distance < 200) {
            this.tweens.add({
                targets: this.player.sprite,
                x: x,
                y: y,
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
        // Si está recogiendo herramienta, no permitir movimiento
        if (this.isPickingUpTool) {
            return;
        }

        // Movimiento con flechas (continuo)
        if (this.cursors.left.isDown) {
            this.player.moveLeft(this.currentTool);
        } else if (this.cursors.right.isDown) {
            this.player.moveRight(this.currentTool);
        } else {
            // Si no se presiona ninguna flecha, quedarse quieto
            this.player.stay(this.currentTool);
        }
        
        // Teclas de herramientas (una sola vez)
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            this.pickUpTool('shovel'); // Pala para plantar
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.pickUpTool('bucket'); // Cubeta para regar
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            this.dropTool(); // Soltar herramienta
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
            console.log('🌾 Modo cosechar activado (teclado)');
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.nextDay();
        }
    }

    // Sistema de herramientas
    pickUpTool(tool) {
        // Si ya tiene esa herramienta, no hacer nada
        if (this.currentTool === tool) {
            console.log(`✋ Ya tienes ${tool}`);
            return;
        }

        // Si tiene otra herramienta, primero soltarla
        if (this.currentTool !== 'none') {
            this.dropTool();
            // Esperar un poco antes de agarrar la nueva
            this.time.delayedCall(400, () => {
                this.executePickUpTool(tool);
            });
        } else {
            this.executePickUpTool(tool);
        }
    }

    executePickUpTool(tool) {
        this.isPickingUpTool = true;
        
        // Reproducir animación de agarrar herramienta
        const pickupAnimation = tool === 'bucket' ? 'agarrar-balde' : 'agarrar-pala';
        
        this.player.sprite.play(pickupAnimation);
        
        // Cuando termine la animación, actualizar el estado
        this.player.sprite.once('animationcomplete', () => {
            this.currentTool = tool;
            this.isPickingUpTool = false;
            
            // Cambiar a animación de parado con herramienta
            this.player.stay(tool);
            
            // Mostrar notificación
            const toolName = tool === 'bucket' ? 'Cubeta' : 'Pala';
            console.log(`✅ ${toolName} equipada`);
            
            if (window.hud) {
                const emoji = tool === 'bucket' ? '💧' : '🌱';
                const action = tool === 'bucket' ? 'regar' : 'plantar';
                hud.showNotification(`${emoji} ${toolName} equipada - Listo para ${action}`, 'info', 2000);
            }
        });
    }

    dropTool() {
        if (this.currentTool === 'none') {
            return;
        }

        console.log(`📦 Soltando ${this.currentTool}`);
        
        const previousTool = this.currentTool;
        this.currentTool = 'none';
        
        // Volver a animación de parado sin herramienta
        this.player.stay('none');
        
        if (window.hud) {
            hud.showNotification('📦 Herramienta guardada', 'info', 1500);
        }
    }

    // Acciones del juego
    waterAllCrops() {
        if (!this.farm) {
            console.log('⚠️ No hay granja para regar');
            return;
        }
        
        // Verificar si tiene la cubeta
        if (this.currentTool !== 'bucket') {
            if (window.hud) {
                hud.showNotification('⚠️ Necesitas equipar la cubeta (tecla W)', 'error', 2500);
            }
            return;
        }
        
        const result = this.farm.waterAllCrops();
        if (result) {
            hud.showNotification('💧 Todos los cultivos regados', 'success');
        } else {
            hud.showInsufficientEnergy();
        }
    }

    nextDay() {
        gameState.nextDay();
        
        // Actualizar cultivos solo si existe la granja
        if (this.farm) {
            this.farm.updateCrops(gameState.getWeather());
            
            const farmStatus = this.farm.getFarmStatus();
            if (farmStatus.readyToHarvest > 0) {
                hud.showNotification(`🌾 ${farmStatus.readyToHarvest} cultivos listos para cosechar`, 'info', 4000);
            }
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
            position: this.player ? this.player.getPosition() : null,
            currentTool: this.currentTool
        };
    }

    getCurrentTool() {
        return this.currentTool;
    }

    // Cleanup
    destroy() {
        if (this.player) {
            this.player.destroy();
        }
        
        if (this.farm) {
            this.farm.destroy();
        }
        
        if (window.gameScene === this) {
            delete window.gameScene;
        }
        
        super.destroy();
    }
}