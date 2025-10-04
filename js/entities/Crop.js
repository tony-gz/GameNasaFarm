/**
 * Crop.js - Clase para los cultivos con escalas diferentes por etapa
 */

class Crop {
    constructor(scene, type, x, y) {
        this.scene = scene;
        this.type = type;
        this.x = x;
        this.y = y;

        this.growth = 0;
        this.waterLevel = 50;
        this.health = 100;
        this.daysAlive = 0;
        this.lastWaterWarning = 0;

        this.cropData = this.getCropData(type);
        this.sprite = null;

        this.init();
    }

    init() {
        const spriteKey = `${this.type}_seed`;
        this.sprite = this.scene.add.image(this.x, this.y, spriteKey);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(0.05);  // Comienza pequeña (semilla)
        this.sprite.setDepth(50);

        this.updateVisual();
        console.log(`Plantado ${this.type} en:`, this.x, this.y);
    }

    getCropData(type) {
        const cropTypes = {
            tomato: {
                growthRate: 2,
                waterConsumption: 1.2,
                harvestValue: 80,
                maturityDays: 5,
                optimalTemp: { min: 20, max: 30 },
                waterNeed: { min: 25, max: 80 },
                optimalSolar: { min: 18, max: 24 }
            },
            corn: {
                growthRate: 1.5,
                waterConsumption: 1.5,
                harvestValue: 60,
                maturityDays: 7,
                optimalTemp: { min: 15, max: 35 },
                waterNeed: { min: 25, max: 90 },
                optimalSolar: { min: 18, max: 24 }
            },
            wheat: {
                growthRate: 1,
                waterConsumption: 0.9,
                harvestValue: 40,
                maturityDays: 10,
                optimalTemp: { min: 10, max: 25 },
                waterNeed: { min: 20, max: 70 },
                optimalSolar: { min: 18, max: 24 }
            }
        };

        return cropTypes[type] || cropTypes.tomato;
    }

    grow(weatherData) {
        this.daysAlive++;
        this.lastSolarRadiation = weatherData.solar;
        
        const warnings = this.checkConditions(weatherData);
        
        if (!this.canGrow(weatherData)) {
            return warnings;
        }

        let growthAmount = this.cropData.growthRate;

        const tempModifier = this.getTemperatureModifier(weatherData.temperature);
        const waterModifier = this.getWaterModifier();
        const solarModifier = this.getSolarModifier(weatherData.solar);

        growthAmount *= tempModifier * waterModifier * solarModifier;

        this.growth += growthAmount;
        this.growth = Math.min(100, this.growth);

        this.waterLevel -= this.cropData.waterConsumption;

        this.applyWeatherEffects(weatherData);
        this.updateVisual();

        console.log(`${this.type} crecio: ${this.growth.toFixed(1)}%, agua: ${this.waterLevel.toFixed(1)}%`);
        
        return warnings;
    }

    checkConditions(weatherData) {
        const warnings = [];
        const cropNames = { corn: 'Maiz', tomato: 'Tomate', wheat: 'Trigo' };
        const cropName = cropNames[this.type] || this.type;

        if (this.waterLevel < this.cropData.waterNeed.min) {
            warnings.push({
                type: 'critical',
                message: `${cropName} necesita agua urgentemente (${Math.floor(this.waterLevel)}%)`
            });
        }
        else if (this.waterLevel < 40 && this.daysAlive - this.lastWaterWarning > 1) {
            warnings.push({
                type: 'warning',
                message: `${cropName} tiene poca agua (${Math.floor(this.waterLevel)}%)`
            });
            this.lastWaterWarning = this.daysAlive;
        }

        if (weatherData.temperature > 35) {
            warnings.push({
                type: 'info',
                message: `Calor extremo (${weatherData.temperature}°C) - Tus cultivos consumiran mas agua`
            });
        } else if (weatherData.temperature < 10) {
            warnings.push({
                type: 'info',
                message: `Frio extremo (${weatherData.temperature}°C) - Crecimiento lento`
            });
        }

        if (this.waterLevel > 90) {
            warnings.push({
                type: 'warning',
                message: `${cropName} tiene demasiada agua - No regar por ahora`
            });
        }

        if (this.waterLevel >= 40 && this.waterLevel <= 70) {
            warnings.push({
                type: 'success',
                message: `${cropName} tiene buen nivel de agua (${Math.floor(this.waterLevel)}%)`
            });
        }

        if (weatherData.solar > 30) {
            warnings.push({
                type: 'warning',
                message: `Radiacion solar alta (${weatherData.solar} kW) - Revisa tus cultivos`
            });
        }

        return warnings;
    }

    canGrow(weatherData) {
        if (this.waterLevel < this.cropData.waterNeed.min) {
            console.log(`${this.type} necesita agua (nivel: ${this.waterLevel})`);
            return false;
        }

        if (weatherData.temperature < this.cropData.optimalTemp.min - 10 ||
            weatherData.temperature > this.cropData.optimalTemp.max + 10) {
            console.log(`Temperatura extrema para ${this.type}`);
            return false;
        }

        return true;
    }

    getTemperatureModifier(temperature) {
        const optimal = this.cropData.optimalTemp;

        if (temperature >= optimal.min && temperature <= optimal.max) {
            return 1.0;
        }

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

        if (this.waterLevel > waterNeed.max) {
            return Math.max(0.5, 1 - (this.waterLevel - waterNeed.max) / 50);
        }

        return 1.0;
    }

    getSolarModifier(solar) {
        const optimalMin = this.cropData.optimalSolar?.min || 15;
        const optimalMax = this.cropData.optimalSolar?.max || 25;

        if (solar >= optimalMin && solar <= optimalMax) {
            return 1.0;
        }

        if (solar < 10) {
            return 0.5;
        }

        if (solar < optimalMin) {
            return 0.7 + (solar - 10) * 0.06;
        }

        if (solar > optimalMax) {
            const excess = solar - optimalMax;
            return Math.max(0.6, 1.0 - (excess * 0.02));
        }

        return 1.0;
    }

    applyWeatherEffects(weatherData) {
        if (weatherData.temperature > 32) {
            this.waterLevel -= 2;
        }

        if (weatherData.precipitation > 8) {
            const rainAmount = (weatherData.precipitation - 8) * 1.5;
            this.waterLevel += rainAmount;
            console.log(`${this.type} recibio ${rainAmount.toFixed(1)}% agua de lluvia`);
        }

        if (this.waterLevel > 95) {
            this.health -= 3;
            console.log(`${this.type} danado por exceso de agua`);
        }

        if (weatherData.solar > 28) {
            this.waterLevel -= 1;
            this.health -= 1;
            console.log(`${this.type} afectado por radiacion solar alta`);
        }

        this.waterLevel = Math.max(0, Math.min(100, this.waterLevel));
        this.health = Math.max(0, Math.min(100, this.health));
    }

    water(amount = 30) {
        const oldLevel = this.waterLevel;
        this.waterLevel = Math.min(100, this.waterLevel + amount);
        this.updateVisual();

        console.log(`${this.type} regado: ${oldLevel.toFixed(1)} → ${this.waterLevel.toFixed(1)}`);
        return this.waterLevel - oldLevel;
    }

    updateVisual() {
        if (!this.sprite) return;

        let spriteKey = `${this.type}_`;

        // Plantas muertas
        if (this.waterLevel <= 0 || this.health <= 0) {
            spriteKey += 'dead';
            this.sprite.setTexture(spriteKey);
            this.sprite.setTint(0x8B4513);
            this.sprite.setScale(0.15);  // Tamaño normal para plantas muertas
            return;
        }

        // Limpiar tint antes de aplicar nuevos efectos
        if (this.waterLevel < 25) {
            this.sprite.setTint(0xA0826D);
        } else {
            this.sprite.clearTint();
        }

        // Determinar etapa de crecimiento y ajustar escala
        if (this.growth < 25) {
            spriteKey += 'seed';
            this.sprite.setScale(0.05);  // SEMILLA MUY PEQUEÑA
        } else if (this.growth < 50) {
            spriteKey += 'stage1';
            this.sprite.setScale(0.15);  // TAMAÑO NORMAL
        } else if (this.growth < 75) {
            spriteKey += 'stage2';
            this.sprite.setScale(0.15);  // TAMAÑO NORMAL
        } else {
            spriteKey += 'mature';
            this.sprite.setScale(0.15);  // TAMAÑO NORMAL
        }

        this.sprite.setTexture(spriteKey);

        // Efectos visuales por condiciones
        if (this.waterLevel > 90) {
            this.sprite.setTint(0x6B9BD1);
        }

        if (this.lastSolarRadiation && this.lastSolarRadiation > 30) {
            this.sprite.setTint(0xFFD700);
        }
    }

    canHarvest() {
        return this.growth >= 75;
    }

    harvest() {
        if (!this.canHarvest()) {
            console.log(`${this.type} no esta listo para cosechar`);
            return null;
        }

        let value = this.cropData.harvestValue;

        if (this.growth >= 95) {
            value *= 1.2;
        }

        if (this.health >= 90) {
            value *= 1.1;
        }

        value = Math.floor(value);

        console.log(`${this.type} cosechado por ${value} monedas`);

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