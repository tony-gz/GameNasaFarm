// ===== CONFIGURACIÓN GLOBAL =====
const GAME_CONFIG = {
    width: 800,
    height: 500,
    backgroundColor: '#87CEEB',
    parent: 'phaser-game'
};

// ===== VARIABLES GLOBALES =====
let currentScreen = 'loading';
let game = null;
let gameState = {
    money: 1000,
    energy: 100,
    day: 1,
    weather: {
        temperature: 25,
        precipitation: 2,
        solar: 18
    }
};

// ===== CLASE PRINCIPAL DEL JUEGO =====
class Game {
    constructor() {
        this.phaserGame = null;
        this.player = null;
        this.farm = null;
        this.initPhaser();
    }

    initPhaser() {
        const config = {
            type: Phaser.AUTO,
            width: GAME_CONFIG.width,
            height: GAME_CONFIG.height,
            backgroundColor: GAME_CONFIG.backgroundColor,
            parent: GAME_CONFIG.parent,
            scene: {
                preload: this.preload.bind(this),
                create: this.create.bind(this),
                update: this.update.bind(this)
            }
        };
        
        this.phaserGame = new Phaser.Game(config);
    }

    preload() {
        // Por ahora, creamos gráficos simples con código
        this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    create() {
        console.log('🎮 Juego iniciado');
        
        // Crear el jugador
        this.player = new Player(this.phaserGame.scene.scenes[0], 100, 250);
        
        // Crear la granja
        this.farm = new Farm(this.phaserGame.scene.scenes[0], 5, 3);
        
        // Configurar interacciones
        this.setupInteractions();
    }

    update() {
        // Lógica de actualización del juego
    }

    setupInteractions() {
        const scene = this.phaserGame.scene.scenes[0];
        
        // Hacer clic en la granja para plantar
        scene.input.on('pointerdown', (pointer) => {
            const farmClick = this.farm.handleClick(pointer.x, pointer.y);
            if (farmClick) {
                console.log('🌱 Plantando en posición:', farmClick);
            }
        });
    }
}

// ===== CLASE PLAYER =====
class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.money = gameState.money;
        this.energy = gameState.energy;
        
        // Crear sprite simple del jugador
        this.sprite = scene.add.rectangle(x, y, 20, 30, 0x4CAF50);
        this.sprite.setStrokeStyle(2, 0x2E7D32);
    }

    move(x, y) {
        this.sprite.setPosition(x, y);
    }

    canAfford(cost) {
        return this.money >= cost;
    }

    spendMoney(amount) {
        if (this.canAfford(amount)) {
            this.money -= amount;
            gameState.money = this.money;
            updateHUD();
            return true;
        }
        return false;
    }

    gainMoney(amount) {
        this.money += amount;
        gameState.money = this.money;
        updateHUD();
    }
}

// ===== CLASE FARM =====
class Farm {
    constructor(scene, width = 5, height = 3) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.crops = new Array(width * height).fill(null);
        this.gridStartX = 250;
        this.gridStartY = 150;
        this.cellSize = 60;
        
        this.createGrid();
    }

    createGrid() {
        this.gridGraphics = [];
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const posX = this.gridStartX + x * this.cellSize;
                const posY = this.gridStartY + y * this.cellSize;
                
                // Crear celda de la granja
                const cell = this.scene.add.rectangle(
                    posX, posY, 
                    this.cellSize - 5, this.cellSize - 5, 
                    0x8B4513
                );
                cell.setStrokeStyle(2, 0x654321);
                
                this.gridGraphics.push(cell);
            }
        }
    }

    handleClick(x, y) {
        // Verificar si el clic está dentro de la granja
        const gridX = Math.floor((x - this.gridStartX + this.cellSize/2) / this.cellSize);
        const gridY = Math.floor((y - this.gridStartY + this.cellSize/2) / this.cellSize);
        
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            const index = gridX + gridY * this.width;
            
            if (this.crops[index] === null) {
                // Plantar cultivo
                if (game.player.spendMoney(50)) {
                    this.plantCrop(gridX, gridY, 'tomato');
                    return { x: gridX, y: gridY, action: 'plant' };
                }
            } else {
                // Interactuar con cultivo existente
                const crop = this.crops[index];
                if (crop.canHarvest()) {
                    const harvest = crop.harvest();
                    game.player.gainMoney(harvest.value);
                    this.crops[index] = null;
                    crop.destroy();
                    return { x: gridX, y: gridY, action: 'harvest', value: harvest.value };
                }
            }
        }
        
        return null;
    }

    plantCrop(gridX, gridY, cropType) {
        const posX = this.gridStartX + gridX * this.cellSize;
        const posY = this.gridStartY + gridY * this.cellSize;
        const index = gridX + gridY * this.width;
        
        this.crops[index] = new Crop(this.scene, cropType, posX, posY);
    }

    updateCrops() {
        this.crops.forEach(crop => {
            if (crop) {
                crop.grow(gameState.weather);
            }
        });
    }
}

// ===== CLASE CROP =====
class Crop {
    constructor(scene, type, x, y) {
        this.scene = scene;
        this.type = type;
        this.growth = 0; // 0 = semilla, 100 = maduro
        this.waterLevel = 50;
        this.health = 100;
        
        // Crear sprite visual del cultivo
        this.sprite = scene.add.circle(x, y, 8, 0x4CAF50);
        this.updateVisual();
    }

    grow(weatherData) {
        // Lógica simple de crecimiento
        if (this.waterLevel > 20 && weatherData.temperature > 10) {
            this.growth += 2;
            this.waterLevel -= 1;
            
            // Aplicar efectos del clima
            if (weatherData.temperature > 30) {
                this.waterLevel -= 2; // Más calor = más agua necesaria
            }
            
            if (weatherData.precipitation > 5) {
                this.waterLevel += 5; // Lluvia añade agua
            }
            
            this.growth = Math.min(100, this.growth);
            this.waterLevel = Math.max(0, Math.min(100, this.waterLevel));
            
            this.updateVisual();
        }
    }

    water() {
        this.waterLevel = Math.min(100, this.waterLevel + 30);
        this.updateVisual();
    }

    updateVisual() {
        // Cambiar color basado en crecimiento
        if (this.growth < 25) {
            this.sprite.setFillStyle(0x8BC34A); // Verde claro (semilla)
        } else if (this.growth < 50) {
            this.sprite.setFillStyle(0x4CAF50); // Verde (creciendo)
        } else if (this.growth < 75) {
            this.sprite.setFillStyle(0x2E7D32); // Verde oscuro (casi maduro)
        } else {
            this.sprite.setFillStyle(0xFF6B35); // Naranja (maduro)
        }
        
        // Cambiar tamaño basado en crecimiento
        const size = 8 + (this.growth / 100) * 12;
        this.sprite.setRadius(size);
    }

    canHarvest() {
        return this.growth >= 75;
    }

    harvest() {
        if (this.canHarvest()) {
            const value = Math.floor(this.growth * 0.8); // 60-80 monedas
            return { yield: this.growth, value: value };
        }
        return null;
    }

    destroy() {
        this.sprite.destroy();
    }
}

// ===== GESTIÓN DE PANTALLAS =====
function showScreen(screenName) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Mostrar la pantalla solicitada
    document.getElementById(screenName).classList.remove('hidden');
    currentScreen = screenName;
    
    console.log(`📺 Mostrando pantalla: ${screenName}`);
}

function updateHUD() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('energy').textContent = gameState.energy;
    document.getElementById('day').textContent = gameState.day;
    document.getElementById('temperature').textContent = gameState.weather.temperature + '°C';
    document.getElementById('precipitation').textContent = gameState.weather.precipitation + 'mm';
    document.getElementById('solar').textContent = gameState.weather.solar + 'kW';
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NASA Farm Navigator iniciando...');
    
    // Simular carga
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 30;
        document.querySelector('.loading-progress').style.width = Math.min(progress, 100) + '%';
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                showScreen('menu');
            }, 500);
        }
    }, 200);
    
    // Event listeners para botones del menú
    document.getElementById('play-btn').addEventListener('click', () => {
        showScreen('game');
        updateHUD();
        
        // Inicializar el juego de Phaser
        setTimeout(() => {
            game = new Game();
        }, 100);
    });
    
    document.getElementById('tutorial-btn').addEventListener('click', () => {
        showScreen('tutorial');
    });
    
    document.getElementById('back-to-menu').addEventListener('click', () => {
        showScreen('menu');
    });
    
    // Event listeners para controles del juego
    document.getElementById('plant-btn').addEventListener('click', () => {
        console.log('🌱 Modo plantar activado');
        // La lógica de plantado se maneja en el clic del canvas
    });
    
    document.getElementById('water-btn').addEventListener('click', () => {
        console.log('💧 Regando cultivos...');
        if (game && game.farm) {
            game.farm.crops.forEach(crop => {
                if (crop) crop.water();
            });
        }
    });
    
    document.getElementById('harvest-btn').addEventListener('click', () => {
        console.log('🌾 Cosechando...');
        // La lógica de cosecha se maneja en el clic individual de cada cultivo
    });
    
    document.getElementById('next-day-btn').addEventListener('click', () => {
        nextDay();
    });
});

// ===== LÓGICA DEL JUEGO =====
function nextDay() {
    gameState.day++;
    gameState.energy = 100;
    
    // Simular cambio de clima (más tarde conectaremos con NASA API)
    gameState.weather.temperature = 15 + Math.random() * 20;
    gameState.weather.precipitation = Math.random() * 10;
    gameState.weather.solar = 10 + Math.random() * 15;
    
    // Actualizar cultivos
    if (game && game.farm) {
        game.farm.updateCrops();
    }
    
    updateHUD();
    console.log(`🌅 Nuevo día: ${gameState.day}`);
}

console.log('✅ Script principal cargado');