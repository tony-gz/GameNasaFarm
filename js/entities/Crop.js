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
        const spriteKey = `${this.type}_seed`;
        this.sprite = this.scene.add.image(this.x, this.y, spriteKey);
        this.sprite.setOrigin(0.5, 1); // Origen en la base para que crezca desde el suelo
        this.sprite.setScale(0.3); // Ajusta según el tamaño de tus imágenes
        this.sprite.setDepth(50); // Por encima del suelo

        this.updateVisual();

        console.log(`🌱 ${this.type} plantado en posición:`, this.x, this.y);
    }

    getCropData(type) {
        const cropTypes = {
            tomato: {
                growthRate: 2,
                waterConsumption: 1,
                harvestValue: 80,
                maturityDays: 5,
                optimalTemp: { min: 20, max: 30 },
<<<<<<< HEAD
                waterNeed: { min: 40, max: 80 },  // ⭐ min debe ser <= 50 (nivel inicial)
                optimalSolar: { min: 18, max: 24 }
=======
                waterNeed: { min: 30, max: 80 },
                stages: {
                    seed: 'tomato_semilla',
                    germination: 'tomato_germinacion',
                    flowering: 'tomato_floracion',
                    maturation: 'tomato_maduracion',
                    withered: 'tomato_marchitacion'
                }
>>>>>>> 0232d72b6562aa3bab971a8bc84d895dc3ef2f1a
            },
            corn: {
                growthRate: 1.5,
                waterConsumption: 1.5,
                harvestValue: 60,
                maturityDays: 7,
                optimalTemp: { min: 15, max: 35 },
<<<<<<< HEAD
                waterNeed: { min: 40, max: 90 },  // ⭐ min debe ser <= 50
                optimalSolar: { min: 18, max: 24 }
=======
                waterNeed: { min: 40, max: 90 },
                 stages: {
                    seed: 'corn_semilla',
                    germination: 'corn_germinacion',
                    flowering: 'corn_floracion',
                    maturation: 'corn_maduracion',
                    withered: 'corn_marchitacion'
                }
>>>>>>> 0232d72b6562aa3bab971a8bc84d895dc3ef2f1a
            },
            wheat: {
                growthRate: 1,
                waterConsumption: 0.8,
                harvestValue: 40,
                maturityDays: 10,
                optimalTemp: { min: 10, max: 25 },
<<<<<<< HEAD
                waterNeed: { min: 30, max: 70 },  // ⭐ min debe ser <= 50
                optimalSolar: { min: 18, max: 24 }
=======
                waterNeed: { min: 20, max: 70 },
                 stages: {
                    seed: 'wheat_semilla',
                    germination: 'wheat_germinacion',
                    flowering: 'wheat_floracion',
                    maturation: 'wheat_maduracion',
                    withered: 'wheat_marchitacion'
                }
>>>>>>> 0232d72b6562aa3bab971a8bc84d895dc3ef2f1a
            }
        };

        return cropTypes[type] || cropTypes.tomato;
    }

    grow(weatherData) {
        this.daysAlive++;
        this.lastSolarRadiation = weatherData.solar;
        // Verificar condiciones para crecimiento
        if (!this.canGrow(weatherData)) {
            return;
        }

        // Aplicar crecimiento base
        let growthAmount = this.cropData.growthRate;

        // Modificadores por clima
        const tempModifier = this.getTemperatureModifier(weatherData.temperature);
        const waterModifier = this.getWaterModifier();

        const solarModifier = this.getSolarModifier(weatherData.solar);

        growthAmount *= tempModifier * waterModifier * solarModifier;

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
        // ⭐ CAMBIAR: Hacer la validación de agua MÁS ESTRICTA
        if (this.waterLevel < this.cropData.waterNeed.min) {
            console.log(`💧 ${this.type} necesita agua para crecer (nivel: ${this.waterLevel})`);
            return false;  // ⭐ NO permitir crecimiento sin agua mínima
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

    getSolarModifier(solar) {
        // Rango óptimo de radiación solar: 15-25 kW/m²/día
        // Usar valores específicos del cultivo si existen
        const optimalMin = this.cropData.optimalSolar?.min || 15;
        const optimalMax = this.cropData.optimalSolar?.max || 25;


        // Si está en rango óptimo
        if (solar >= optimalMin && solar <= optimalMax) {
            return 1.0; // Crecimiento normal
        }

        // Muy poca luz solar (menos de 10 kW)
        if (solar < 10) {
            return 0.5; // Crecimiento muy lento por falta de luz
        }

        // Poca luz (entre 10 y 15 kW)
        if (solar < optimalMin) {
            return 0.7 + (solar - 10) * 0.06; // Crecimiento reducido
        }

        // Mucha luz (más de 25 kW)
        if (solar > optimalMax) {
            // Exceso de sol puede estresar la planta
            const excess = solar - optimalMax;
            return Math.max(0.6, 1.0 - (excess * 0.02)); // Penalización por exceso
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

        // Exceso de agua daña la planta
        if (this.waterLevel > 95) {
            this.health -= 5; // Pierde salud por encharcamiento
            console.log(`💧 ${this.type} dañado por exceso de agua`);
        }

        // Radiación excesiva daña la planta
        if (weatherData.solar > 30) {
            this.health -= 3;
            console.log(`☀️ ${this.type} dañado por exceso de radiación solar`);
        }

        // Mantener nivel de agua en rango válido
        this.waterLevel = Math.max(0, Math.min(100, this.waterLevel));

        // Mantener salud en rango válido
        this.health = Math.max(0, Math.min(100, this.health));
    }

    water(amount = 30) {
        const oldLevel = this.waterLevel;
        this.waterLevel = Math.min(100, this.waterLevel + amount);
        this.updateVisual();

        console.log(`💧 ${this.type} regado: ${oldLevel} → ${this.waterLevel}`);
        return this.waterLevel - oldLevel;
    }


<<<<<<< HEAD
        // Determinar el sprite según crecimiento, salud y agua
        let spriteKey = `${this.type}_`;

        // Si está muerto (sin agua o muy dañado)
        if (this.waterLevel <= 0 || this.health <= 0) {
            spriteKey += 'dead';
            this.sprite.setTexture(spriteKey);
            this.sprite.setTint(0x8B4513); // Tinte marrón
            return;
        }

        // Si está marchitándose (poca agua)
        if (this.waterLevel < 20) {
            // Mantener el sprite actual pero con tinte marrón
            this.sprite.setTint(0xA0826D);
        } else {
            this.sprite.clearTint();
        }

        // Cambiar sprite según crecimiento
        if (this.growth < 25) {
            spriteKey += 'seed'; // 0-24%: Semilla
        } else if (this.growth < 50) {
            spriteKey += 'stage1'; // 25-49%: Plántula
        } else if (this.growth < 75) {
            spriteKey += 'stage2'; // 50-74%: Planta joven
        } else {
            spriteKey += 'mature'; // 75-100%: Planta madura
        }

        // Actualizar textura
        this.sprite.setTexture(spriteKey);

        // Efecto de marchitez por exceso de agua
        if (this.waterLevel > 90) {
            this.sprite.setTint(0x6B9BD1); // Tinte azulado
        }

        // Efecto de daño por radiación excesiva
        if (this.lastSolarRadiation && this.lastSolarRadiation > 30) {
            this.sprite.setTint(0xFFD700); // Tinte amarillento
        }
    }

    updateCircleVisual() {
        let color;
        if (this.growth < 25) {
            color = 0x8BC34A;
        } else if (this.growth < 50) {
            color = 0x4CAF50;
        } else if (this.growth < 75) {
            color = 0x2E7D32;
        } else {
            color = 0xFF6B35;
        }

        if (this.waterLevel < 20) {
            color = 0x8D6E63;
        }

        this.sprite.setFillStyle(color);
        const size = 8 + (this.growth / 100) * 12;
        this.sprite.setRadius(size);
=======
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
>>>>>>> 0232d72b6562aa3bab971a8bc84d895dc3ef2f1a
    }

    updateSpriteVisual() {
        // Determinar qué frame mostrar según el crecimiento
        let frame;
        if (this.growth < 25) {
            frame = 0; // Semilla
        } else if (this.growth < 50) {
            frame = 1; // Planta pequeña
        } else if (this.growth < 75) {
            frame = 2; // Planta mediana
        } else if (this.growth < 100) {
            frame = 3; // Planta madura
        } else {
            frame = 4; // Marchita (si tienes)
        }

        // Cambiar el frame del sprite
        this.sprite.setFrame(frame);

        // Aplicar efectos visuales según condición
        if (this.waterLevel < 20) {
            this.sprite.setTint(0x8D6E63); // Tinte café por falta de agua
        } else {
            this.sprite.clearTint();
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