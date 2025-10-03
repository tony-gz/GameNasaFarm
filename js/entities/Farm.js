// js/Farm.js - Clase para manejar la granja (grid de cultivos) (MODIFICADO PARA PRUEBAS)

class Farm {
    constructor(scene, width = 5, height = 3) {
        this.scene = scene; // Referencia a GameScene
        this.width = width;
        this.height = height;
        this.crops = new Array(width * height).fill(null); // Array para almacenar los objetos Crop
        
        // Configuración del grid
        this.gridStartX = 250; // Posición de inicio del grid en el mundo
        this.gridStartY = 150;
        this.cellSize = 60; // Tamaño de cada celda/parcela
        
        this.plotSprites = []; // NUEVO: Para almacenar los sprites de las parcelas de tierra (vacías)
        this.gridCells = []; // Datos de cada celda del grid
        
        this.init();
    }

    init() {
        this.createGrid();
        console.log(`🚜 Granja creada: ${this.width}x${this.height} celdas`);
    }

    createGrid() {
        this.plotSprites = [];
        this.gridCells = [];
        
        for (let y = 0; y < this.height; y++) { // Cambiado a iterar por Y primero para un orden más natural
            for (let x = 0; x < this.width; x++) {
                const posX = this.gridStartX + x * this.cellSize;
                const posY = this.gridStartY + y * this.cellSize;
                
                // Crear el sprite visual para la parcela vacía
                const plotSprite = this.scene.add.sprite(posX, posY, 'empty_plot');
                plotSprite.setInteractive(); // Hacerla interactiva para detectar clics
                plotSprite.setOrigin(0.5);
                plotSprite.setScale(0.9); // Un poco más pequeña que el cellSize
                plotSprite.setDepth(0); // Estará debajo de los cultivos
                
                this.plotSprites.push(plotSprite); // Guardar referencia al sprite
                
                const cellData = {
                    x: x,
                    y: y,
                    worldX: posX,
                    worldY: posY,
                    occupied: false,
                    plotSprite: plotSprite // Referencia al sprite de la parcela en la data de la celda
                };
                this.gridCells.push(cellData);

                // Asignar los datos de la celda al sprite para fácil acceso en el evento click
                plotSprite.setData('gridX', x);
                plotSprite.setData('gridY', y);
            }
        }

        // Añadir el listener de clic a la escena para todos los sprites interactivos
        this.scene.input.on('gameobjectdown', this.handlePlotClick, this);
    }

    // NUEVO: Manejador de clics para los sprites de las parcelas y cultivos
    handlePlotClick(pointer, gameObject) {
        // Obtenemos las coordenadas de la cuadrícula del objeto clicado
        const gridX = gameObject.getData('gridX');
        const gridY = gameObject.getData('gridY');

        // Si el objeto clicado es un sprite de parcela (vacía)
        if (gameObject.texture.key === 'empty_plot' && gridX !== undefined && gridY !== undefined) { 
            this.handleClick(gridX, gridY);
        } 
        // Si el objeto clicado es un sprite de cultivo (cuando el plotSprite está oculto)
        else if (gameObject instanceof Crop.prototype.constructor && gridX !== undefined && gridY !== undefined) {
            // Aquí asumimos que el sprite del cultivo tiene los datos de la cuadrícula si es necesario,
            // o que podemos obtener la posición de la cuadrícula a partir de sus coordenadas del mundo.
            // Para simplificar, si se ha hecho clic directamente en un cultivo, usamos sus datos de celda.
            this.handleClick(gridX, gridY);
        }
    }


    // CAMBIADO: Ahora recibe gridX, gridY directamente
    handleClick(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        
        // Obtenemos el tipo de cultivo seleccionado de GameScene (para esta prueba)
        const selectedCropType = this.scene.selectedCropType; 

        if (crop === null) {
            // Celda vacía - intentar plantar si hay una semilla seleccionada
            if (selectedCropType) {
                this.attemptPlant(gridX, gridY, selectedCropType);
            } else {
                this.scene.showMessage('Selecciona una semilla primero para plantar.', 'red');
            }
        } else {
            // Hay cultivo - decidir acción
            if (crop.isWithered) {
                this.removeWitheredCrop(gridX, gridY);
            } else if (crop.canHarvest()) {
                this.attemptHarvest(gridX, gridY);
            } else { // Por defecto, si no está marchito ni listo para cosechar, regar
                this.waterCrop(gridX, gridY);
            }
        }
    }

    getGridPosition(worldX, worldY) {
        // Convertir coordenadas del mundo a posición en grid
        const gridX = Math.floor((worldX - this.gridStartX + this.cellSize / 2) / this.cellSize);
        const gridY = Math.floor((worldY - this.gridStartY + this.cellSize / 2) / this.cellSize);
        
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

    // CAMBIADO: No depende de game.player
    attemptPlant(gridX, gridY, cropType) {
        const index = this.getIndex(gridX, gridY);
        
        // Verificar que la celda esté vacía
        if (this.crops[index] !== null) {
            this.scene.showMessage('¡Esta parcela ya está ocupada!', 'red');
            return null;
        }

        // Plantar el cultivo
        const worldPos = this.getWorldPosition(gridX, gridY);
        const newCrop = new Crop(this.scene, cropType, worldPos.x, worldPos.y);
        this.crops[index] = newCrop;
        
        // Asignar datos de la celda al sprite del cultivo para facilitar clics
        newCrop.sprite.setData('gridX', gridX);
        newCrop.sprite.setData('gridY', gridY);
        newCrop.sprite.setInteractive(); // Hacer el cultivo interactivo también

        // Ocultar el sprite de la parcela vacía cuando se planta un cultivo
        if (this.gridCells[index].plotSprite) {
             this.gridCells[index].plotSprite.setVisible(false);
        }
        this.gridCells[index].occupied = true;
        
        console.log(`🌱 ${cropType} plantado en (${gridX}, ${gridY})`);
        this.scene.showMessage(`Plantado: ${cropType}!`, 'green');
        
        return {
            action: 'plant',
            cropType: cropType,
            gridX: gridX,
            gridY: gridY,
            success: true
        };
    }

    // CAMBIADO: No depende de game.player
    attemptHarvest(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        
        if (!crop) {
            this.scene.showMessage('🚫 No hay cultivo para cosechar', 'orange');
            return null;
        }

        if (!crop.canHarvest()) {
            this.scene.showMessage('🌿 El cultivo aún no está listo', 'orange');
            return { action: 'harvest', success: false, reason: 'not_ready' };
        }

        // Intentar cosechar
        const harvestData = crop.harvest(); // Simplificado en Crop.js
        if (!harvestData) {
            this.scene.showMessage('Fallo al cosechar.', 'red');
            return { action: 'harvest', success: false, reason: 'failed' };
        }

        // Mostrar el sprite de la parcela vacía nuevamente
        if (this.gridCells[index].plotSprite) {
             this.gridCells[index].plotSprite.setVisible(true);
        }
        
        // Remover cultivo de la granja
        this.crops[index] = null;
        this.gridCells[index].occupied = false;
        crop.destroy(); // Destruye el objeto sprite de Crop
        
        console.log(`🌾 Cosechado ${harvestData.type}`);
        this.scene.showMessage(`Cosechado: ${harvestData.type}!`, 'green');

        return {
            action: 'harvest',
            success: true,
            harvest: harvestData,
            gridX: gridX,
            gridY: gridY
        };
    }

    // CAMBIADO: No depende de game.player, añade control de marchito
    waterCrop(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];
        
        if (!crop || crop.isWithered) {
            this.scene.showMessage('No hay cultivo o está marchito para regar.', 'orange');
            return false;
        }

        if (crop.waterLevel >= 90) { 
            this.scene.showMessage('El cultivo ya está bien regado.', 'blue');
            return false;
        }

        crop.water(); // Llama al método water del cultivo
        this.scene.showMessage(`Regado: ${crop.type}.`, 'blue');
        return true;
    }

    // CAMBIADO: Simplificado y no depende de game.player
    waterAllCrops() {
        let wateredCount = 0;
        this.crops.forEach(crop => {
            if (crop && !crop.isWithered) { // Solo riega cultivos que existen y no están marchitos
                crop.water();
                wateredCount++;
            }
        });

        console.log(`💧 Regados ${wateredCount} cultivos`);
        if (wateredCount > 0) {
            this.scene.showMessage(`Regados ${wateredCount} cultivos.`, 'blue');
        } else {
            this.scene.showMessage('No hay cultivos para regar.', 'gray');
        }
        return wateredCount > 0;
    }

    // NUEVO: Remover un cultivo marchito
    removeWitheredCrop(gridX, gridY) {
        const index = this.getIndex(gridX, gridY);
        const crop = this.crops[index];

        if (!crop || !crop.isWithered) {
            this.scene.showMessage('No hay cultivo marchito aquí para remover.', 'orange');
            return null;
        }

        // Mostrar el sprite de la parcela vacía
        if (this.gridCells[index].plotSprite) {
             this.gridCells[index].plotSprite.setVisible(true);
        }

        crop.destroy(); // Destruye el objeto sprite del cultivo marchito
        this.crops[index] = null;
        this.gridCells[index].occupied = false;
        this.scene.showMessage('Parcela limpiada.', 'brown');

        return { action: 'remove_withered', success: true, gridX: gridX, gridY: gridY };
    }


    // CAMBIADO: `weatherData` no se usa en `Crop.grow()` en la versión simplificada
    updateCrops(weatherData) { // `weatherData` todavía se pasa desde GameScene, pero Crop.grow lo ignora
        this.crops.forEach((crop, index) => {
            if (crop) {
                crop.grow(); // Llama a la versión simplificada de grow()
                // Si el cultivo se marchita, ocultar su sprite y mostrar el de la parcela vacía
                if (crop.isWithered && crop.sprite) {
                    crop.sprite.setVisible(false);
                    if (this.gridCells[index].plotSprite) { // Usamos 'index' directamente
                        this.gridCells[index].plotSprite.setVisible(true);
                    }
                }
            }
        });
    }

    // Métodos de información (se mantienen, aunque no se usan directamente en esta prueba)
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

    // Métodos de utilidad (se mantienen)
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

        // Destruir elementos gráficos de las parcelas
        this.plotSprites.forEach(sprite => { // Ahora destruye los sprites
            if (sprite) {
                sprite.destroy();
            }
        });

        this.scene.input.off('gameobjectdown', this.handlePlotClick, this); // Remover el listener
        
        this.crops = [];
        this.plotSprites = [];
        this.gridCells = [];
    }
}