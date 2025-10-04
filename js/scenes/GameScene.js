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
        this.seedListenersConfigured = false; //Inicializa el flag
    }

    preload() {
        console.log('🎮 Cargando GameScene...');

        // Cargar spritesheet del jugador
        this.load.spritesheet('player', 'assets/sheet2.png', {
            frameWidth: 444,
            frameHeight: 562
        });

        // Cargar sprites de cultivos de maíz
        this.load.image('corn_seed', 'assets/images/crops/corn_seed.png');
        this.load.image('corn_stage1', 'assets/images/crops/corn_stage1.png');
        this.load.image('corn_stage2', 'assets/images/crops/corn_stage2.png');
        this.load.image('corn_mature', 'assets/images/crops/corn_mature.png');
        this.load.image('corn_dead', 'assets/images/crops/corn_dead.png');

        // Cargar sprites de cultivos de tomate
        this.load.image('tomato_seed', 'assets/images/crops/tomato_seed.png');
        this.load.image('tomato_stage1', 'assets/images/crops/tomato_stage1.png');
        this.load.image('tomato_stage2', 'assets/images/crops/tomato_stage2.png');
        this.load.image('tomato_mature', 'assets/images/crops/tomato_mature.png');
        this.load.image('tomato_dead', 'assets/images/crops/tomato_dead.png');

        // Cargar sprites de cultivos de trigo
        this.load.image('wheat_seed', 'assets/images/crops/wheat_seed.png');
        this.load.image('wheat_stage1', 'assets/images/crops/wheat_stage1.png');
        this.load.image('wheat_stage2', 'assets/images/crops/wheat_stage2.png');
        this.load.image('wheat_stage3', 'assets/images/crops/wheat_stage3.png');
        this.load.image('wheat_mature', 'assets/images/crops/wheat_mature.png');
        this.load.image('wheat_dead', 'assets/images/crops/wheat_dead.png');
    }

    create() {
        console.log('🎮 GameScene creada');

        // Crear animaciones del jugador
        this.createAnimations();

        // IMPORTANTE: Hacer el fondo de la cámara transparente para ver BackgroundScene
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

        // Crear jugador
        this.player = new Player(this, 40, 437);

        // Definir el área del campo de cultivo
        // Reemplaza tu cropField actual por:
        this.cropFields = {
            corn: {
                x: 300,
                y: 450,
                width: 100,
                height: 60,  // Agrega esto si no lo tienes
                proximityRange: 150  
            },
            tomato: {
                x: 400,
                y: 450,
                width: 100,
                height: 60,
                proximityRange: 150  
            },
            wheat: {
                x: 500,
                y: 450,
                width: 100,
                height: 60,
                proximityRange: 150  
            }
        };

        // Array para almacenar todos los cultivos plantados
        this.crops = [];

        // TEMPORAL: Visualizar el campo de cultivo (eliminar en producción)
        this.debugCropField = this.add.rectangle(
            this.cropFields.x,
            this.cropFields.y,
            this.cropFields.width,
            this.cropFields.height,
            0x00ff00,  // Verde
            0.2        // Transparencia
        );
        this.debugCropField.setStrokeStyle(2, 0x00ff00);




        // Granja desactivada temporalmente
        this.farm = null;
        //this.farm = new Farm(this, 5, 3); // Granja de 5x3 celdas
        // Configurar interacciones
        this.setupInteractions();

        // Configurar controles
        this.setupControls();

        // Asegurar que el menú esté oculto al inicio
        this.hideCropSelectionMenu();

        // Almacenar referencias globalmente
        window.gameScene = this;
    }

    /**
 * Verifica si el jugador está cerca del campo de cultivo
 * @returns {boolean} true si está dentro del rango de proximidad
 */



    /*
    isPlayerNearCropField() {
        const playerPos = this.player.getPosition();

        const dx = playerPos.x - this.cropField.x;
        const dy = playerPos.y - this.cropField.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const isNear = distance <= this.cropField.proximityRange;

        // Opcional: Cambiar color del campo según proximidad
        if (this.debugCropField) {
            if (isNear) {
                this.debugCropField.setStrokeStyle(2, 0x00ff00); // Verde si está cerca
            } else {
                this.debugCropField.setStrokeStyle(2, 0xff0000); // Rojo si está lejos
            }
        }

        return isNear;
    }
        */

    isPlayerNearAnyField() {
        // ⭐ USAR sprite.x y sprite.y, no solo x e y
        const playerPos = {
            x: this.player.sprite.x,
            y: this.player.sprite.y
        };

        for (let cropType in this.cropFields) {
            const field = this.cropFields[cropType];

            const dx = playerPos.x - field.x;
            const dy = playerPos.y - field.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= field.proximityRange) {
                console.log(`✅ Jugador cerca del campo ${cropType}`);
                return true;
            }
        }

        console.log('❌ Jugador lejos de todos los campos');
        return false;
    }



    /**
 * Muestra el menú de selección de semillas
 */
    showCropSelectionMenu() {
        const menu = document.getElementById('crop-selection-menu');
        if (!menu) {
            console.error('Menú de selección no encontrado');
            return;
        }

        // Mostrar menú
        menu.classList.remove('hidden');

        // Configurar listeners para cada opción (solo una vez)
        if (!this.seedListenersConfigured) {
            const seedButtons = menu.querySelectorAll('.seed-option');

            seedButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const cropType = button.getAttribute('data-crop');
                    const cost = parseInt(button.getAttribute('data-cost'));
                    this.handleSeedSelection(cropType, cost);
                });
            });

            // Botón cancelar
            document.getElementById('cancel-seed-selection')?.addEventListener('click', () => {
                this.hideCropSelectionMenu();
            });

            this.seedListenersConfigured = true;
        }
    }

    /**
     * Oculta el menú de selección de semillas
     */
    hideCropSelectionMenu() {
        const menu = document.getElementById('crop-selection-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }

    /**
     * Maneja la selección de una semilla
     */
    handleSeedSelection(cropType, cost) {
        // Ocultar menú
        this.hideCropSelectionMenu();

        // Verificar dinero
        if (!gameState.canAfford(cost)) {
            if (window.hud) {
                window.hud.showNotification(`No tienes suficiente dinero (${cost} monedas)`, 'error');
            }
            return;
        }

        // Verificar energía
        if (!gameState.useEnergy(10)) {
            if (window.hud) {
                window.hud.showNotification('No tienes suficiente energía', 'error');
            }
            return;
        }

        // Gastar dinero
        gameState.spendMoney(cost);

        // Plantar
        this.plantCropInArea(cropType);  // En lugar de plantCropInCenter

        // Mostrar notificación de éxito
        const seedNames = { corn: 'Maíz', tomato: 'Tomate', wheat: 'Trigo' };
        if (window.hud) {
            window.hud.showNotification(
                `${seedNames[cropType]} plantado (-${cost} 💰, -10 ⚡)`,
                'success'
            );
        }
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

    plantCropInArea(cropType = 'corn') {
        const field = this.cropFields[cropType];

        // Verificar si ya existe un cultivo de ese tipo
        const existingCrop = this.crops.find(c => c.type === cropType);
        if (existingCrop) {
            if (window.hud) {
                window.hud.showNotification(`Ya hay ${cropType} plantado`, 'error');
            }
            return false;
        }

        // ⭐ Plantar en el centro del campo específico
        const crop = new Crop(this, cropType, field.x, field.y);
        this.crops.push(crop);

        console.log(`✅ ${cropType} plantado en (${field.x}, ${field.y})`);
        return true;
    }

    waterAllCrops() {
        console.log('🚿 Intentando regar cultivos...');

        // Verificar que hay cultivos
        if (!this.crops || this.crops.length === 0) {
            if (window.hud) {
                window.hud.showNotification('No hay cultivos para regar', 'info');
            }
            return false;
        }

        // ⭐ NUEVO: Verificar proximidad a CADA cultivo individual
        const playerPos = {
            x: this.player.sprite.x,
            y: this.player.sprite.y
        };

        let wateredCount = 0;
        const proximityRange = 100; // Distancia máxima para regar

        this.crops.forEach(crop => {
            if (!crop || !crop.sprite || !crop.sprite.active) return;

            // ⭐ Calcular distancia al cultivo
            const dx = playerPos.x - crop.x;
            const dy = playerPos.y - crop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // ⭐ Solo regar si está cerca
            if (distance <= proximityRange) {
                crop.water(30);
                wateredCount++;
                console.log(`💧 Regado ${crop.type} a distancia ${distance.toFixed(0)}`);
            } else {
                console.log(`❌ ${crop.type} muy lejos (${distance.toFixed(0)} > ${proximityRange})`);
            }
        });

        // Verificar energía SOLO si regó al menos uno
        if (wateredCount > 0) {
            if (!gameState.useEnergy(5)) {
                if (window.hud) {
                    window.hud.showNotification('Sin energía para regar', 'error');
                }
                return false;
            }

            if (window.hud) {
                window.hud.showNotification(`${wateredCount} cultivo(s) regado(s) 💧`, 'success');
            }
            return true;
        } else {
            if (window.hud) {
                window.hud.showNotification('Acércate a los cultivos para regarlos', 'error');
            }
            return false;
        }
    }

    updateAllCrops(weatherData) {
        if (!this.crops) return;

        this.crops.forEach(crop => {
            if (crop && crop.sprite) {
                crop.grow(weatherData);
            }
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
        /*
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            this.pickUpTool('shovel'); // Pala para plantar
        }
            */
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            this.plantCropInCenter('corn'); // Plantar maíz directamente
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.waterAllCrops(); // Regar cultivos
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

    async nextDay() {
        gameState.nextDay();

        try {
            const newWeather = await nasaAPI.getNextDayWeather();
            gameState.updateWeather(newWeather);
            console.log('🌡️ Clima actualizado desde NASA:', newWeather);
        } catch (error) {
            console.warn('⚠️ Error obteniendo clima de NASA, usando datos por defecto');
        }

        // Actualizar cultivos con el nuevo clima
        this.updateAllCrops(gameState.getWeather());

        console.log('🌅 Nuevo día:', gameState.getDay());
    }

    async updateRealTimeWeather() {
        try {
            const realWeather = await weatherAPIManager.getCurrentWeather();

            console.log(`Clima desde ${realWeather.source}:`, realWeather);

            if (realWeather.isRaining) {
                this.startRainEffect();
            } else {
                this.stopRainEffect();
            }

            if (window.hud) {
                window.hud.updateRealTimeWeather(realWeather);
                window.hud.showCurrentAPI(); // Mostrar API activa
            }

            this.applyCropWeatherEffects(realWeather);

        } catch (error) {
            console.error('Error actualizando clima real:', error);
        }
    }

    /*
    async nextDay() {
        gameState.nextDay();

        // Obtener clima real de NASA
        try {
            const newWeather = await nasaAPI.getNextDayWeather();
            gameState.updateWeather(newWeather);
            console.log('🌡️ Clima actualizado desde NASA:', newWeather);
        } catch (error) {
            console.warn('⚠️ Error obteniendo clima de NASA, usando datos por defecto');
        }
        
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
        */

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