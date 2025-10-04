/**
 * GameScene.js - Escena principal con sistema de riego individual
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.farm = null;
        this.currentTool = 'none';
        this.isPickingUpTool = false;
        this.seedListenersConfigured = false;
        this.lastWarnings = [];
    }

    preload() {
        console.log('Cargando GameScene...');

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

        // Cargar musica
        this.load.audio('musicaFondo', 'assets/carga.mp3');
    }

    create() {
        console.log('GameScene creada');

        this.audio = this.sound.add('musicaFondo', {loop: true, volume: 5});
        this.audio.play();

        this.createAnimations();
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

        this.player = new Player(this, 40, 437);

        // Campos de cultivo
        this.cropFields = {
            corn: {
                x: 190,
                y: 450,
                width: 120,
                height: 80,
                proximityRange: 150  
            },
            tomato: {
                x: 330,
                y: 450,
                width: 120,
                height: 80,
                proximityRange: 150  
            },
            wheat: {
                x: 460,
                y: 450,
                width: 120,
                height: 80,
                proximityRange: 150  
            }
        };

        this.crops = [];
        this.farm = null;

        this.setupInteractions();
        this.setupControls();
        this.setupCropInteractions();
        this.hideCropSelectionMenu();

        window.gameScene = this;
    }

    createAnimations() {
        this.anims.create({
            key: 'caminar',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

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
        this.input.on('pointermove', (pointer) => {
            this.handleSceneHover(pointer);
        });
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            'P': Phaser.Input.Keyboard.KeyCodes.P,
            'W': Phaser.Input.Keyboard.KeyCodes.W,
            'H': Phaser.Input.Keyboard.KeyCodes.H,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'Q': Phaser.Input.Keyboard.KeyCodes.Q
        });
    }

    // NUEVO: Sistema de interacción con cultivos individuales
    setupCropInteractions() {
        this.input.on('pointerdown', (pointer) => {
            const clickedCrop = this.findCropAtPosition(pointer.x, pointer.y);
            
            if (clickedCrop) {
                this.handleCropInteraction(clickedCrop);
            }
        });
    }

    findCropAtPosition(x, y) {
        const clickRadius = 30;
        
        for (let crop of this.crops) {
            if (!crop || !crop.sprite || !crop.sprite.active) continue;
            
            const dx = crop.x - x;
            const dy = crop.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= clickRadius) {
                return crop;
            }
        }
        
        return null;
    }

    handleCropInteraction(crop) {
        const cropNames = { corn: 'Maiz', tomato: 'Tomate', wheat: 'Trigo' };
        const cropName = cropNames[crop.type] || crop.type;
        
        // Si está listo para cosechar
        if (crop.canHarvest()) {
            this.harvestSingleCrop(crop);
            return;
        }
        
        // Si necesita agua, regarlo
        if (crop.waterLevel < 80) {
            this.waterSingleCrop(crop);
        } else {
            // Mostrar información del cultivo
            if (window.hud) {
                window.hud.showNotification(
                    `${cropName}: Agua ${Math.floor(crop.waterLevel)}% | Crecimiento ${Math.floor(crop.growth)}%`,
                    'info',
                    3000
                );
            }
        }
    }

    waterSingleCrop(crop) {
        if (!crop || !crop.sprite || !crop.sprite.active) {
            return false;
        }
        
        // Verificar energía (menos que regar todos)
        if (!gameState.useEnergy(2)) {
            if (window.hud) {
                window.hud.showNotification('Sin energia para regar', 'error');
            }
            return false;
        }
        
        const oldLevel = crop.waterLevel;
        crop.water(25);
        const newLevel = crop.waterLevel;
        
        const cropNames = { corn: 'Maiz', tomato: 'Tomate', wheat: 'Trigo' };
        const cropName = cropNames[crop.type] || crop.type;
        
        if (window.hud) {
            window.hud.showNotification(
                `${cropName} regado: ${Math.floor(oldLevel)}% → ${Math.floor(newLevel)}%`,
                'success',
                2000
            );
        }
        
        console.log(`${cropName} regado individualmente`);
        return true;
    }

    harvestSingleCrop(crop) {
        if (!crop || !crop.canHarvest()) {
            return false;
        }
        
        // Verificar energía
        if (!gameState.useEnergy(15)) {
            if (window.hud) {
                window.hud.showNotification('Sin energia para cosechar', 'error');
            }
            return false;
        }
        
        const harvestData = crop.harvest();
        if (!harvestData) return false;
        
        // Añadir dinero
        gameState.addMoney(harvestData.value);
        
        // Remover cultivo del array
        const index = this.crops.indexOf(crop);
        if (index > -1) {
            this.crops.splice(index, 1);
        }
        
        // Destruir sprite
        crop.destroy();
        
        const cropNames = { corn: 'Maiz', tomato: 'Tomate', wheat: 'Trigo' };
        const cropName = cropNames[harvestData.type] || harvestData.type;
        
        if (window.hud) {
            window.hud.showNotification(
                `${cropName} cosechado! +${harvestData.value} monedas`,
                'success',
                3000
            );
        }
        
        console.log(`Cosechado ${cropName} por ${harvestData.value} monedas`);
        return true;
    }

    findFreePlantingPosition(cropType) {
        const field = this.cropFields[cropType];
        const spacing = 30;
        const cols = Math.floor(field.width / spacing);
        const rows = Math.floor(field.height / spacing);
        
        const startX = field.x - (cols * spacing) / 2 + spacing / 2;
        const startY = field.y - (rows * spacing) / 2 + spacing / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const testX = startX + col * spacing;
                const testY = startY + row * spacing;
                
                const occupied = this.crops.some(crop => {
                    if (!crop || crop.type !== cropType) return false;
                    const distance = Math.sqrt(
                        Math.pow(crop.x - testX, 2) + 
                        Math.pow(crop.y - testY, 2)
                    );
                    return distance < spacing * 0.8;
                });
                
                if (!occupied) {
                    return { x: testX, y: testY };
                }
            }
        }
        
        return null;
    }

    getFreeSlotsInField(cropType) {
        const field = this.cropFields[cropType];
        const spacing = 35;
        const cols = Math.floor(field.width / spacing);
        const rows = Math.floor(field.height / spacing);
        const totalSlots = cols * rows;
        
        const occupiedSlots = this.crops.filter(c => c && c.type === cropType).length;
        
        return totalSlots - occupiedSlots;
    }

    isPlayerNearAnyField() {
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
                return true;
            }
        }

        return false;
    }

    showCropSelectionMenu() {
        const menu = document.getElementById('crop-selection-menu');
        if (!menu) {
            console.error('Menu de seleccion no encontrado');
            return;
        }

        menu.classList.remove('hidden');

        if (!this.seedListenersConfigured) {
            const seedButtons = menu.querySelectorAll('.seed-option');

            seedButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const cropType = button.getAttribute('data-crop');
                    const cost = parseInt(button.getAttribute('data-cost'));
                    this.handleSeedSelection(cropType, cost);
                });
            });

            document.getElementById('cancel-seed-selection')?.addEventListener('click', () => {
                this.hideCropSelectionMenu();
            });

            this.seedListenersConfigured = true;
        }
    }

    hideCropSelectionMenu() {
        const menu = document.getElementById('crop-selection-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }

    handleSeedSelection(cropType, cost) {
        this.hideCropSelectionMenu();
        
        const freeSlots = this.getFreeSlotsInField(cropType);
        if (freeSlots === 0) {
            if (window.hud) {
                window.hud.showNotification(`Campo de ${cropType} lleno`, 'error');
            }
            return;
        }

        if (!gameState.canAfford(cost)) {
            if (window.hud) {
                window.hud.showNotification(`No tienes suficiente dinero (${cost} monedas)`, 'error');
            }
            return;
        }

        if (!gameState.useEnergy(10)) {
            if (window.hud) {
                window.hud.showNotification('No tienes suficiente energia', 'error');
            }
            return;
        }

        gameState.spendMoney(cost);

        const planted = this.plantCropInArea(cropType);
        
        if (planted) {
            const seedNames = { corn: 'Maiz', tomato: 'Tomate', wheat: 'Trigo' };
            const remaining = freeSlots - 1;
            if (window.hud) {
                window.hud.showNotification(
                    `${seedNames[cropType]} plantado (-${cost}, -10) | Espacios: ${remaining}`,
                    'success'
                );
            }
        }
    }

    plantCropInArea(cropType = 'corn') {
        const position = this.findFreePlantingPosition(cropType);
        
        if (!position) {
            if (window.hud) {
                window.hud.showNotification(`Campo de ${cropType} lleno`, 'error');
            }
            return false;
        }
        
        const crop = new Crop(this, cropType, position.x, position.y);
        this.crops.push(crop);
        
        console.log(`${cropType} plantado en (${position.x}, ${position.y})`);
        return true;
    }

    waterAllCrops() {
        console.log('Intentando regar cultivos...');

        if (!this.crops || this.crops.length === 0) {
            if (window.hud) {
                window.hud.showNotification('No hay cultivos para regar', 'info');
            }
            return false;
        }

        const playerPos = {
            x: this.player.sprite.x,
            y: this.player.sprite.y
        };

        let wateredCount = 0;
        const proximityRange = 150;

        this.crops.forEach(crop => {
            if (!crop || !crop.sprite || !crop.sprite.active) return;

            const dx = playerPos.x - crop.x;
            const dy = playerPos.y - crop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= proximityRange) {
                crop.water(30);
                wateredCount++;
            }
        });

        if (wateredCount > 0) {
            if (!gameState.useEnergy(5)) {
                if (window.hud) {
                    window.hud.showNotification('Sin energia para regar', 'error');
                }
                return false;
            }

            if (window.hud) {
                window.hud.showNotification(`${wateredCount} cultivo(s) regado(s)`, 'success');
            }
            return true;
        } else {
            if (window.hud) {
                window.hud.showNotification('Acercate a los cultivos para regarlos', 'error');
            }
            return false;
        }
    }

    updateAllCrops(weatherData) {
        if (!this.crops) return;

        const allWarnings = [];

        this.crops.forEach(crop => {
            if (crop && crop.sprite) {
                const warnings = crop.grow(weatherData);
                if (warnings && warnings.length > 0) {
                    allWarnings.push(...warnings);
                }
            }
        });

        this.showUniqueWarnings(allWarnings);
    }

    showUniqueWarnings(warnings) {
        if (!window.hud || !warnings || warnings.length === 0) return;

        const uniqueWarnings = {};
        
        warnings.forEach(warning => {
            const key = `${warning.type}-${warning.message}`;
            if (!uniqueWarnings[key]) {
                uniqueWarnings[key] = warning;
            }
        });

        const priority = { critical: 3, warning: 2, info: 1, success: 0 };
        const sortedWarnings = Object.values(uniqueWarnings)
            .sort((a, b) => priority[b.type] - priority[a.type]);

        sortedWarnings.slice(0, 3).forEach((warning, index) => {
            setTimeout(() => {
                window.hud.showNotification(warning.message, warning.type, 4000);
            }, index * 1500);
        });
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

    update() {
        this.handleKeyboardInput();
    }

    handleKeyboardInput() {
        if (this.isPickingUpTool) {
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.moveLeft(this.currentTool);
        } else if (this.cursors.right.isDown) {
            this.player.moveRight(this.currentTool);
        } else {
            this.player.stay(this.currentTool);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.waterAllCrops();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            this.dropTool();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.nextDay();
        }
    }

    pickUpTool(tool) {
        if (this.currentTool === tool) {
            console.log(`Ya tienes ${tool}`);
            return;
        }

        if (this.currentTool !== 'none') {
            this.dropTool();
            this.time.delayedCall(400, () => {
                this.executePickUpTool(tool);
            });
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
            console.log(`${toolName} equipada`);

            if (window.hud) {
                hud.showNotification(`${toolName} equipada - Listo para ${tool === 'bucket' ? 'regar' : 'plantar'}`, 'info', 2000);
            }
        });
    }

    dropTool() {
        if (this.currentTool === 'none') {
            return;
        }

        console.log(`Soltando ${this.currentTool}`);

        this.currentTool = 'none';
        this.player.stay('none');

        if (window.hud) {
            hud.showNotification('Herramienta guardada', 'info', 1500);
        }
    }

    async nextDay() {
        gameState.nextDay();

        try {
            const newWeather = await nasaAPI.getNextDayWeather();
            gameState.updateWeather(newWeather);
            console.log('Clima actualizado desde NASA:', newWeather);
        } catch (error) {
            console.warn('Error obteniendo clima de NASA, usando datos por defecto');
        }

        this.updateAllCrops(gameState.getWeather());

        const readyToHarvest = this.crops.filter(c => c && c.canHarvest()).length;

        if (window.hud && readyToHarvest > 0) {
            window.hud.showNotification(
                `${readyToHarvest} cultivo(s) listo(s) para cosechar`,
                'success',
                3000
            );
        }

        console.log('Nuevo dia:', gameState.getDay());
    }

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