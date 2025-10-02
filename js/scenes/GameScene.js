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
        
        // Cargar spritesheet del jugador
        this.load.spritesheet('player', 'assets/sheet2.png', {
            frameWidth: 444,
            frameHeight: 562
        });
        
        // Aquí podrían cargarse más assets en el futuro
    }

    create() {
        console.log('🎮 GameScene creada');
        
        // Crear animaciones del jugador
        this.createAnimations();
        
        // IMPORTANTE: Hacer el fondo de la cámara transparente para ver BackgroundScene
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
        
        // NO crear fondo aquí - se maneja en BackgroundScene
        
        // Crear jugador
        this.player = new Player(this, 100, 250);
        
        // Crear granja (COMENTADO TEMPORALMENTE)
        // this.farm = new Farm(this, 5, 3);
        this.farm = null; // Para evitar errores en otros métodos
        
        // Configurar interacciones
        this.setupInteractions();
        
        // Configurar controles
        this.setupControls();
        
        // Almacenar referencias globalmente para fácil acceso
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
            repeat: 0
        });
        
        // Animación de agarrar balde
        this.anims.create({
            key: 'agarrar-balde',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 5,
            repeat: 0
        });
        
        // Animación de caminar con balde
        this.anims.create({
            key: 'caminar-balde',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [8, 9, 10]
            }),
            frameRate: 5,
            repeat: 0
        });
        
        // Animación de agarrar pala
        this.anims.create({
            key: 'agarrar-pala',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [11, 12, 13, 14]
            }),
            frameRate: 5,
            repeat: 0
        });
        
        // Animación de caminar con pala
        this.anims.create({
            key: 'caminar-pala',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [15, 16, 17]
            }),
            frameRate: 5,
            repeat: 0
        });
        
        // Animación de parado sin herramientas
        this.anims.create({
            key: 'parado',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0]
            }),
            frameRate: 5,
            repeat: 0
        });

        // Animación de parado con balde
        this.anims.create({
            key: 'parado-balde',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [4]
            }),
            frameRate: 5,
            repeat: 0
        });

        // Animación de parado con pala
        this.anims.create({
            key: 'parado-pala',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [14]
            }),
            frameRate: 5,
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
            'P': Phaser.Input.Keyboard.KeyCodes.P,
            'W': Phaser.Input.Keyboard.KeyCodes.W,
            'H': Phaser.Input.Keyboard.KeyCodes.H,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE
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
            // Mover jugador hacia el clic si no es en la granja
            this.movePlayerTowards(pointer.x, pointer.y);
        }
    }

    handleSceneHover(pointer) {
        // Si no hay granja, mantener cursor default
        if (!this.farm) {
            this.input.setDefaultCursor('default');
            return;
        }
        
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
        // Movimiento con flechas (continuo)
        if (this.cursors.left.isDown) {
            this.player.moveLeft('none');
        } else if (this.cursors.right.isDown) {
            this.player.moveRight('none');
        } else {
            // Si no se presiona ninguna flecha, quedarse quieto
            this.player.stay('none');
        }
        
        // Teclas de acción (una sola vez)
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
        if (!this.farm) {
            console.log('⚠️ No hay granja para regar');
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
            // Actualizar cultivos con el nuevo clima
            this.farm.updateCrops(gameState.getWeather());
            
            // Mostrar estado de la granja
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