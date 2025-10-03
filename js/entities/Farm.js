/**
 * Farm.js - Clase para manejar la granja (grid de cultivos)
 */

class Farm {
    constructor(scene, width = 5, height = 3) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.crops = new Array(width * height).fill(null);
        
        // Configuración del grid
        this.gridStartX = 250;
        this.gridStartY = 150;
        this.cellSize = 60;
        
        // Elementos visuales
        this.gridGraphics = [];
        this.gridCells = [];
        
        this.init();
    }

    init() {
        this.createGrid();
        console.log(`🚜 Granja creada: ${this.width}x${this.height} celdas`);
    }

    createGrid() {
        this.gridGraphics = [];
        this.gridCells = [];
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const posX = this.gridStartX + x * this.cellSize;
                const posY = this.gridStartY + y * this.cellSize;

                this.gridCells.push({
                    x, y,
                    worldX: posX,
                    worldY: posY,
                    occupied: false
                });
            }
        }
    }

    handleClick(x, y) {
        const gridPos = this.getGridPosition(x, y);
        if (!gridPos) return null;

        const index = this.getIndex(gridPos.x, gridPos.y);
        const crop = this.crops[index];
        
        if (crop === null) {
            return this.attemptPlant(gridPos.x, gridPos.y);
        } else {
            return this.attemptHarvest(gridPos.x, gridPos.y);
        }
    }

    getGridPosition(worldX, worldY) {
        const gridX = Math.floor((worldX - this.gridStartX + this.cellSize/2) / this.cellSize);
        const gridY = Math.floor((worldY - this.gridStartY + this.cellSize/2) / this.cellSize);
        
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            return { x: gridX, y: gridY };
        }
        return null;
    }

    getWorldPosition(gridX, gridY) {
        return {
            x: this.gridStartX + gridX * this.cellSize,
            y: this.gridStartY + gridY * this.cellSize
        };
    }

    getIndex(gridX, gridY) {
        return gridX + gridY * this.width;
    }

    attemptPlant(gridX, gridY, cropType = 'tomato') {
        const index = this.getIndex(gridX, gridY);
        if (this.crops[index] !== null) {
            console.log('🚫 Ya hay un cultivo plantado aquí');
            return null;
        }

        // Verificar energía/dinero del jugador
        if (!gameState.useEnergy(5)) {
            console.log("⚡ No tienes energía para plantar");
            return null;
        }
        if (!gameState.spendMoney(20)) {
            console.log("💰 No tienes dinero suficiente para plantar");
            return null;
        }

        const worldPos = this.getWorldPosition(gridX, gridY);
        this.crops[index] = new Crop(this.scene, cropType, worldPos.x, worldPos.y);
        this.gridCells[index].occupied = true;
        
        console.log(`🌱 ${cropType} plantado en (${gridX}, ${gridY})`);
        return { action: 'plant', cropType, gridX, gridY, success: true };
    }

    attemptHarvest(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        
        if (!crop) return null;
        if (!crop.canHarvest()) {
            console.log('🌿 El cultivo aún no está listo');
            return { action: 'harvest', success: false, reason: 'not_ready' };
        }

        if (!gameState.useEnergy(5)) {
            return { action: 'harvest', success: false, reason: 'no_energy' };
        }

        const harvestData = crop.harvest();
        if (!harvestData) return { action: 'harvest', success: false, reason: 'failed' };

        // Dar recompensa
        gameState.addMoney(harvestData.value);

        this.crops[index] = null;
        this.gridCells[index].occupied = false;
        crop.destroy();

        console.log(`🌾 Cosechado ${harvestData.type} → +${harvestData.value} monedas`);
        return { action: 'harvest', success: true, harvest: harvestData, gridX, gridY };
    }

    waterCrop(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        if (!crop) return false;

        if (!gameState.useEnergy(2)) {
            console.log("⚡ Sin energía para regar");
            return false;
        }

        crop.water();
        return true;
    }

    waterAllCrops() {
        if (!gameState.useEnergy(10)) {
            console.log("⚡ No hay energía suficiente para regar todo");
            return false;
        }

        let wateredCount = 0;
        this.crops.forEach(crop => {
            if (crop) {
                crop.water();
                wateredCount++;
            }
        });

        console.log(`💧 Regados ${wateredCount} cultivos`);
        return wateredCount > 0;
    }

    updateCrops(weatherData) {
        this.crops.forEach(crop => {
            if (crop) crop.grow(weatherData);
        });
    }

    // Información rápida
    getFarmStatus() {
        const total = this.width * this.height;
        const occupied = this.crops.filter(c => c !== null).length;
        const ready = this.crops.filter(c => c && c.canHarvest()).length;
        const needWater = this.crops.filter(c => c && c.waterLevel < 30).length;

        return {
            totalSpaces: total,
            occupiedSpaces: occupied,
            emptySpaces: total - occupied,
            readyToHarvest: ready,
            needingWater: needWater
        };
    }

    destroy() {
        this.crops.forEach(crop => crop?.destroy());
        this.gridGraphics.forEach(g => g?.destroy());
        this.crops = [];
        this.gridGraphics = [];
        this.gridCells = [];
    }
}
