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
                
                // Crear celda visual de la granja
                const cell = this.scene.add.rectangle(
                    posX, posY, 
                    this.cellSize - 5, this.cellSize - 5, 
                    0x8B4513
                );
                cell.setStrokeStyle(2, 0x654321);
                
                // Guardar referencia
                this.gridGraphics.push(cell);
                this.gridCells.push({
                    x: x,
                    y: y,
                    worldX: posX,
                    worldY: posY,
                    occupied: false
                });
            }
        }
    }

    handleClick(x, y) {
        const gridPos = this.getGridPosition(x, y);
        
        if (!gridPos) {
            return null;
        }

        const index = this.getIndex(gridPos.x, gridPos.y);
        const crop = this.crops[index];
        
        if (crop === null) {
            // Celda vacía - intentar plantar
            return this.attemptPlant(gridPos.x, gridPos.y);
        } else {
            // Hay cultivo - intentar cosechar
            return this.attemptHarvest(gridPos.x, gridPos.y);
        }
    }

    getGridPosition(worldX, worldY) {
        // Convertir coordenadas del mundo a posición en grid
        const gridX = Math.floor((worldX - this.gridStartX + this.cellSize/2) / this.cellSize);
        const gridY = Math.floor((worldY - this.gridStartY + this.cellSize/2) / this.cellSize);
        
        // Verificar que esté dentro de los límites
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
        
        // Verificar que la celda esté vacía
        if (this.crops[index] !== null) {
            console.log('🚫 Ya hay un cultivo plantado aquí');
            return null;
        }

        // Usar el sistema del jugador para verificar recursos
        if (!game.player.plantCrop(cropType)) {
            return null;
        }

        // Plantar el cultivo
        const worldPos = this.getWorldPosition(gridX, gridY);
        this.crops[index] = new Crop(this.scene, cropType, worldPos.x, worldPos.y);
        
        // Actualizar celda
        this.gridCells[index].occupied = true;
        
        console.log(`🌱 ${cropType} plantado en (${gridX}, ${gridY})`);
        
        return {
            action: 'plant',
            cropType: cropType,
            gridX: gridX,
            gridY: gridY,
            success: true
        };
    }

    attemptHarvest(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        
        if (!crop) {
            console.log('🚫 No hay cultivo para cosechar');
            return null;
        }

        if (!crop.canHarvest()) {
            console.log('🌿 El cultivo aún no está listo');
            return { action: 'harvest', success: false, reason: 'not_ready' };
        }

        // Intentar cosechar
        const harvestData = crop.harvest();
        if (!harvestData) {
            return { action: 'harvest', success: false, reason: 'failed' };
        }

        // Verificar si el jugador tiene energía
        if (!game.player.harvestCrop(harvestData.value)) {
            return { action: 'harvest', success: false, reason: 'no_energy' };
        }

        // Remover cultivo de la granja
        this.crops[index] = null;
        this.gridCells[index].occupied = false;
        crop.destroy();

        console.log(`🌾 Cosechado ${harvestData.type} por ${harvestData.value} monedas`);

        return {
            action: 'harvest',
            success: true,
            harvest: harvestData,
            gridX: gridX,
            gridY: gridY
        };
    }

    waterCrop(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        
        if (!crop) {
            return false;
        }

        return crop.water();
    }

    waterAllCrops() {
        if (!game.player.waterCrops()) {
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
        this.crops.forEach((crop, index) => {
            if (crop) {
                crop.grow(weatherData);
            }
        });
    }

    // Métodos de información
    getCropCount() {
        return this.crops.filter(crop => crop !== null).length;
    }

    getEmptySpaces() {
        return this.crops.filter(crop => crop === null).length;
    }

    getReadyToHarvest() {
        return this.crops.filter(crop => crop && crop.canHarvest()).length;
    }

    getCropsNeedingWater() {
        return this.crops.filter(crop => crop && crop.waterLevel < 30).length;
    }

    getFarmStatus() {
        const total = this.width * this.height;
        const occupied = this.getCropCount();
        const readyToHarvest = this.getReadyToHarvest();
        const needWater = this.getCropsNeedingWater();

        return {
            totalSpaces: total,
            occupiedSpaces: occupied,
            emptySpaces: total - occupied,
            readyToHarvest: readyToHarvest,
            needingWater: needWater
        };
    }

    // Métodos de utilidad
    isValidPosition(gridX, gridY) {
        return gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height;
    }

    isEmpty(gridX, gridY) {
        if (!this.isValidPosition(gridX, gridY)) {
            return false;
        }
        const index = this.getIndex(gridX, gridY);
        return this.crops[index] === null;
    }

    getCropAt(gridX, gridY) {
        if (!this.isValidPosition(gridX, gridY)) {
            return null;
        }
        const index = this.getIndex(gridX, gridY);
        return this.crops[index];
    }

    // Cleanup
    destroy() {
        // Destruir todos los cultivos
        this.crops.forEach(crop => {
            if (crop) {
                crop.destroy();
            }
        });

        // Destruir elementos gráficos del grid
        this.gridGraphics.forEach(graphic => {
            if (graphic) {
                graphic.destroy();
            }
        });

        this.crops = [];
        this.gridGraphics = [];
        this.gridCells = [];
    }
}