/**
 * Crop.js - Clase para los cultivos
 */

class Crop {
    constructor(scene, type, x, y) {
        this.scene = scene;
        this.type = type;
        this.x = x;
        this.y = y;
        
        // Estados del cultivo
        this.growth = 0; // 0 = semilla, 100 = maduro
        this.waterLevel = 50;
        this.health = 100;
        this.daysAlive = 0;
        
        // Propiedades del tipo de cultivo
        this.cropData = this.getCropData(type);
        
        // Sprite visual
        this.sprite = null;
        
        this.init();
    }

    init() {
        // Crear sprite visual del cultivo
        this.sprite = this.scene.add.circle(this.x, this.y, 8, 0x4CAF50);
        this.updateVisual();
        
        console.log(`🌱 ${this.type} plantado en posición:`, this.x, this.y);
    }

    getCropData(type) {
        // Datos base de diferentes tipos de cultivos
        const cropTypes = {
            tomato: {
                growthRate: 2,
                waterConsumption: 1,
                harvestValue: 80,
                maturityDays: 5,
                optimalTemp: { min: 20, max: 30 },
                waterNeed: { min: 30, max: 80 },
                stages: {
                    seed: 'tomato_semilla',
                    germination: 'tomato_germinacion',
                    flowering: 'tomato_floracion',
                    maturation: 'tomato_maduracion',
                    withered: 'tomato_marchitacion'
                }
            },
            corn: {
                growthRate: 1.5,
                waterConsumption: 1.5,
                harvestValue: 60,
                maturityDays: 7,
                optimalTemp: { min: 15, max: 35 },
                waterNeed: { min: 40, max: 90 },
                 stages: {
                    seed: 'corn_semilla',
                    germination: 'corn_germinacion',
                    flowering: 'corn_floracion',
                    maturation: 'corn_maduracion',
                    withered: 'corn_marchitacion'
                }
            },
            wheat: {
                growthRate: 1,
                waterConsumption: 0.8,
                harvestValue: 40,
                maturityDays: 10,
                optimalTemp: { min: 10, max: 25 },
                waterNeed: { min: 20, max: 70 },
                 stages: {
                    seed: 'wheat_semilla',
                    germination: 'wheat_germinacion',
                    flowering: 'wheat_floracion',
                    maturation: 'wheat_maduracion',
                    withered: 'wheat_marchitacion'
                }
            }
        };

        return cropTypes[type] || cropTypes.tomato;
    }

    grow(weatherData) {
        this.daysAlive++;
        
        // Verificar condiciones para crecimiento
        if (!this.canGrow(weatherData)) {
            return;
        }

        // Aplicar crecimiento base
        let growthAmount = this.cropData.growthRate;
        
        // Modificadores por clima
        const tempModifier = this.getTemperatureModifier(weatherData.temperature);
        const waterModifier = this.getWaterModifier();
        
        growthAmount *= tempModifier * waterModifier;
        
        // Aplicar crecimiento
        this.growth += growthAmount;
        this.growth = Math.min(100, this.growth);
        
        // Consumir agua
        this.waterLevel -= this.cropData.waterConsumption;
        
        // Efectos del clima en el agua
        this.applyWeatherEffects(weatherData);
        
        // Actualizar visual
        this.updateVisual();
        
        console.log(`🌿 ${this.type} creció: ${this.growth.toFixed(1)}%`);
    }

    canGrow(weatherData) {
        // Necesita agua mínima para crecer
        if (this.waterLevel < this.cropData.waterNeed.min) {
            console.log(`💧 ${this.type} necesita agua para crecer`);
            return false;
        }
        
        // Temperatura muy extrema impide crecimiento
        if (weatherData.temperature < this.cropData.optimalTemp.min - 10 || 
            weatherData.temperature > this.cropData.optimalTemp.max + 10) {
            console.log(`🌡️ Temperatura extrema para ${this.type}`);
            return false;
        }

        return true;
    }

    getTemperatureModifier(temperature) {
        const optimal = this.cropData.optimalTemp;
        
        if (temperature >= optimal.min && temperature <= optimal.max) {
            return 1.0; // Crecimiento óptimo
        }
        
        // Calcular penalización por temperatura subóptima
        let penalty = 0;
        if (temperature < optimal.min) {
            penalty = (optimal.min - temperature) / 10;
        } else {
            penalty = (temperature - optimal.max) / 10;
        }
        
        return Math.max(0.2, 1 - penalty * 0.2);
    }

    getWaterModifier() {
        const waterNeed = this.cropData.waterNeed;
        
        if (this.waterLevel >= waterNeed.min && this.waterLevel <= waterNeed.max) {
            return 1.0;
        }
        
        if (this.waterLevel < waterNeed.min) {
            return this.waterLevel / waterNeed.min;
        }
        
        // Exceso de agua también es malo
        if (this.waterLevel > waterNeed.max) {
            return Math.max(0.5, 1 - (this.waterLevel - waterNeed.max) / 50);
        }
        
        return 1.0;
    }

    applyWeatherEffects(weatherData) {
        // Temperatura alta consume más agua
        if (weatherData.temperature > 30) {
            this.waterLevel -= 2;
        }
        
        // La lluvia añade agua
        if (weatherData.precipitation > 5) {
            this.waterLevel += weatherData.precipitation * 2;
        }
        
        // Mantener nivel de agua en rango válido
        this.waterLevel = Math.max(0, Math.min(100, this.waterLevel));
    }

    water(amount = 30) {
        const oldLevel = this.waterLevel;
        this.waterLevel = Math.min(100, this.waterLevel + amount);
        this.updateVisual();
        
        console.log(`💧 ${this.type} regado: ${oldLevel} → ${this.waterLevel}`);
        return this.waterLevel - oldLevel;
    }


    getCurrentStage() {
        if (this.isWithered) { // Prioridad: si está marchito, mostrar imagen de marchito
            return 'withered';
        } else if (this.growth < 20) { // Menos del 20% de crecimiento
            return 'seed'; // Semilla
        } else if (this.growth < 40) { // 20% a 39%
            return 'germination'; // Germinación
        } else if (this.growth < 65) { // 40% a 64%
            return 'flowering'; // Floración
        } else { // 65% o más
            return 'maturation'; // Maduración
        }
    }

    // En Crop.js, reemplaza tu updateVisual() existente con esto:

    updateVisual() {
        if (!this.sprite) return; // Asegurarse de que el sprite exista

        // 1. Determinar la clave de la textura según la etapa actual
        let textureKey = this.cropData.stages[this.getCurrentStage()];
        
        // 2. Establecer la textura del sprite
        // Phaser cambiará automáticamente la imagen del sprite
        this.sprite.setTexture(textureKey);

        // 3. Opcional: Ajustar la escala del sprite para simular crecimiento
        // Esto le da un efecto visual de "crecer" incluso con imágenes
        if (!this.isWithered) {
            // Escala el sprite de 0.8 a 1.2, por ejemplo, a medida que crece
            const scale = 0.8 + (this.growth / 100) * 0.4;
            this.sprite.setScale(scale);
        } else {
            // Si está marchito, puedes mantener una escala fija o más pequeña
            this.sprite.setScale(0.8);
        }

        // 4. Opcional: Aplicar un tinte (tint) al sprite basado en el estado (ej. falta de agua, baja salud)
        // Esto añade una capa visual sobre la imagen para indicar problemas.
        if (this.isWithered) {
            this.sprite.setTint(0x604030); // Tono marrón oscuro para marchito
        } else if (this.waterLevel < 20) {
            this.sprite.setTint(0x8D6E63); // Tono marrón claro para falta severa de agua
        } else if (this.health < 50) {
            this.sprite.setTint(0xAAAAAA); // Tono grisáceo para salud baja
        } else {
            this.sprite.setTint(0xFFFFFF); // Color normal (sin tinte)
        }
    }

    canHarvest() {
        return this.growth >= 75;
    }

    harvest() {
        if (!this.canHarvest()) {
            console.log(`🌾 ${this.type} no está listo para cosechar`);
            return null;
        }

        // Calcular valor de cosecha basado en calidad
        let value = this.cropData.harvestValue;
        
        // Bonificación por crecimiento completo
        if (this.growth >= 95) {
            value *= 1.2;
        }
        
        // Bonificación por buena salud
        if (this.health >= 90) {
            value *= 1.1;
        }
        
        value = Math.floor(value);
        
        console.log(`🌾 ${this.type} cosechado por ${value} monedas`);
        
        return {
            type: this.type,
            quality: this.growth,
            health: this.health,
            value: value,
            days: this.daysAlive
        };
    }

    getStatus() {
        return {
            type: this.type,
            growth: this.growth,
            waterLevel: this.waterLevel,
            health: this.health,
            daysAlive: this.daysAlive,
            canHarvest: this.canHarvest()
        };
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}