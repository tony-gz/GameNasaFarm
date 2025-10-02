/**
 * GameScene.js - Escena principal del juego
 */

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.player = null;
    this.farm = null;
  }

  preload() {
    console.log("🎮 Cargando GameScene...");

    this.load.spritesheet("player", "assets/sheet2.png", {
      frameWidth: 444, // Ancho de cada frame
      frameHeight: 562, // Alto de cada frame
    });

    // Aquí podrían cargarse más assets en el futuro
  }

  create() {
    // 🔥 NUEVO: Estados del jugador
    this.playerState = {
      tool: 'none', // 'none', 'bucket', 'shovel'
      mode: 'harvest' // 'harvest', 'plant', 'water'
    };

    // Crear animaciones
    this.createAnimations();

    console.log("🎮 GameScene creada");

    // Crear fondo
    this.createBackground();

    // Crear granja
    this.farm = new Farm(this, 5, 3);

    // Crear jugador
    this.player = new Player(this, 100, 250);
    
    // 🔥 NUEVO: Iniciar con animación de parado mirando a la derecha
    this.player.sprite.play('parado', true);
    this.player.sprite.setFlipX(false);

    // 🔥 NUEVO: Configurar eventos de animación
    this.setupAnimationEvents();

    // Configurar interacciones
    this.setupInteractions();

    // Configurar controles
    this.setupControls();

    // Almacenar referencias globalmente para fácil acceso
    window.gameScene = this;
  }

  // 🔥 NUEVO: Configurar eventos para todas las animaciones de caminar
  setupAnimationEvents() {
    const sprite = this.player.sprite;
    
    // Escuchar cuando terminen las animaciones de caminar
    sprite.on('animationcomplete', (animation) => {
      if (animation.key === 'caminar' || 
          animation.key === 'caminar-balde' || 
          animation.key === 'caminar-pala') {
        console.log(`🚶 Animación de caminar terminada: ${animation.key}`);
        this.player.stay(this.playerState.tool);
      }
    });
  }

  // 🔥 NUEVO: Método separado para crear animaciones
  createAnimations() {
    this.anims.create({
      key: "caminar",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [1, 2, 3],
      }),
      frameRate: 5,
      repeat: 0, // Se repite 0 veces (solo una secuencia)
    });
    
    this.anims.create({
      key: "agarrar-balde",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [4, 5, 6, 7],
      }),
      frameRate: 5,
      repeat: 0,
    });
    
    this.anims.create({
      key: "caminar-balde",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [8, 9, 10],
      }),
      frameRate: 5,
      repeat: 0, // Se repite 0 veces (solo una secuencia)
    });
    
    this.anims.create({
      key: "agarrar-pala",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [11, 12, 13, 14],
      }),
      frameRate: 5,
      repeat: 0,
    });
    
    this.anims.create({
      key: "caminar-pala",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [15, 16, 17],
      }),
      frameRate: 5,
      repeat: 0, // Se repite 0 veces (solo una secuencia)
    });
    
    this.anims.create({
      key: "parado",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [0],
      }),
      frameRate: 5,
      repeat: 0,
    });

    this.anims.create({
      key: "parado-balde",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [4],
      }),
      frameRate: 5,
      repeat: 0,
    });

    this.anims.create({
      key: "parado-pala",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [14],
      }),
      frameRate: 5,
      repeat: 0,
    });
  }

  createBackground() {
    // Crear un fondo simple con gradiente de cielo
    const graphics = this.add.graphics();

    // Cielo
    graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xe0f6ff, 0xe0f6ff, 1);
    graphics.fillRect(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height * 0.7
    );

    // Tierra
    graphics.fillStyle(0x8b4513);
    graphics.fillRect(
      0,
      this.cameras.main.height * 0.7,
      this.cameras.main.width,
      this.cameras.main.height * 0.3
    );
  }

  setupInteractions() {
    // Clic en la escena
    this.input.on("pointerdown", (pointer) => {
      this.handleSceneClick(pointer);
    });

    // Hover sobre elementos
    this.input.on("pointermove", (pointer) => {
      this.handleSceneHover(pointer);
    });
  }

  setupControls() {
    // Teclas de acceso rápido
    this.cursors = this.input.keyboard.createCursorKeys();

    // Teclas adicionales
    this.keys = this.input.keyboard.addKeys({
      P: Phaser.Input.Keyboard.KeyCodes.P, // Plantar
      W: Phaser.Input.Keyboard.KeyCodes.W, // Regar
      H: Phaser.Input.Keyboard.KeyCodes.H, // Cosechar
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE, // Siguiente día
    });

    // 🔥 MODIFICADO: Configurar teclas para herramientas
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    
    // 🔥 NUEVO: Eventos para agarrar y soltar herramientas
    this.upKey.on('down', () => {
      this.grabTool('bucket');
    });
    
    this.downKey.on('down', () => {
      this.grabTool('shovel');
    });
    
    // 🔥 NUEVO: Evento para soltar herramienta (tecla X por ejemplo)
    this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.xKey.on('down', () => {
      this.dropTool();
    });
  }

  // 🔥 NUEVO: Método para agarrar herramienta
  grabTool(toolType) {
    // Si ya tiene una herramienta, no hacer nada
    if (this.playerState.tool !== 'none') {
      console.log(`ℹ️ Ya tienes una herramienta: ${this.playerState.tool}`);
      hud.showNotification(`ℹ️ Ya tienes una herramienta`, "info");
      return;
    }
    
    console.log(`🪣 Animación de agarrar ${toolType} activada`);
    
    // Determinar qué animación usar
    const grabAnimation = toolType === 'bucket' ? 'agarrar-balde' : 'agarrar-pala';
    const walkAnimation = toolType === 'bucket' ? 'caminar-balde' : 'caminar-pala';
    
    // Reproducir animación de agarrar
    this.player.sprite.play(grabAnimation, true);
    
    // 🔥 NUEVO: Escuchar cuando termine la animación
    this.player.sprite.once('animationcomplete', (animation) => {
      if (animation.key === grabAnimation) {
        console.log(`✅ Animación de agarrar ${toolType} completada`);
        
        // Actualizar estado del jugador
        this.playerState.tool = toolType;
        
        // Cambiar a animación de caminar con herramienta
        this.player.sprite.play(walkAnimation, true);
        
        // Cambiar modo automáticamente según la herramienta
        if (toolType === 'bucket') {
          this.playerState.mode = 'water';
          hud.showNotification("💧 Modo regar activado", "success");
        } else if (toolType === 'shovel') {
          this.playerState.mode = 'plant';
          hud.showNotification("🌱 Modo plantar activado", "success");
        }
        
        console.log(`🎮 Estado actual: herramienta=${this.playerState.tool}, modo=${this.playerState.mode}`);
      }
    });
  }

  // 🔥 NUEVO: Método para soltar herramienta
  dropTool() {
    if (this.playerState.tool === 'none') {
      console.log("ℹ️ No tienes ninguna herramienta para soltar");
      hud.showNotification("ℹ️ No tienes herramienta", "info");
      return;
    }
    
    console.log(`🗑️ Soltando herramienta: ${this.playerState.tool}`);
    
    // Volver a modo cosecha y sin herramienta
    this.playerState.tool = 'none';
    this.playerState.mode = 'harvest';
    
    // Cambiar a animación normal
    this.player.sprite.play('parado', true);
    
    hud.showNotification("🌾 Modo cosecha activado", "info");
    console.log("🎮 Estado actual: herramienta=none, modo=harvest");
  }

  // 🔥 NUEVO: Método para cambiar modo manualmente
  changeMode(newMode) {
    // Si tiene herramienta, no permitir cambiar modo manualmente
    if (this.playerState.tool !== 'none') {
      console.log(`⚠️ No puedes cambiar modo mientras tienes una herramienta`);
      return;
    }
    
    this.playerState.mode = newMode;
    
    let message = "";
    switch(newMode) {
      case 'harvest':
        message = "🌾 Modo cosecha";
        break;
      case 'plant':
        message = "🌱 Modo plantar";
        break;
      case 'water':
        message = "💧 Modo regar";
        break;
    }
    
    hud.showNotification(message + " activado", "success");
    console.log(`🎮 Modo cambiado a: ${newMode}`);
  }

  handleSceneClick(pointer) {
    const result = this.farm.handleClick(pointer.x, pointer.y);

    if (result) {
      this.handleFarmAction(result);
    } else {
      // Mover jugador hacia el clic si no es en la granja
      //this.movePlayerTowards(pointer.x, pointer.y);
    }
  }

  handleSceneHover(pointer) {
    // Cambiar cursor basado en lo que está debajo
    const gridPos = this.farm.getGridPosition(pointer.x, pointer.y);

    if (gridPos) {
      const crop = this.farm.getCropAt(gridPos.x, gridPos.y);

      if (crop) {
        if (crop.canHarvest()) {
          this.input.setDefaultCursor("pointer");
        } else {
          this.input.setDefaultCursor("help");
        }
      } else {
        this.input.setDefaultCursor("crosshair");
      }
    } else {
      this.input.setDefaultCursor("default");
    }
  }

  handleFarmAction(result) {
    if (result.action === "plant" && result.success) {
      hud.showPlantSuccess(result.cropType, 50);
    } else if (result.action === "harvest") {
      if (result.success) {
        hud.showHarvestSuccess(result.harvest.type, result.harvest.value);
      } else {
        switch (result.reason) {
          case "not_ready":
            hud.showCropNotReady();
            break;
          case "no_energy":
            hud.showInsufficientEnergy();
            break;
          default:
            hud.showNotification("❌ No se pudo cosechar", "error");
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
        duration: distance * 2, // Velocidad proporcional a distancia
        ease: "Power2",
        onComplete: () => {
          this.player.x = x;
          this.player.y = y;
        },
      });
    }
  }

  update() {
    this.handleKeyboardInput();
  }

  handleKeyboardInput() {
    // Teclas de acceso rápido - MODIFICADO para usar el sistema de modos
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
      console.log("🌱 Modo plantar activado (teclado)");
      this.changeMode('plant');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      console.log("💧 Modo regar activado (teclado)");
      this.changeMode('water');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
      console.log("🌾 Modo cosechar activado (teclado)");
      this.changeMode('harvest');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.nextDay();
    }

    // 🔥 MODIFICADO: Sistema de movimiento con herramientas
    if (this.cursors.left.isDown) {
      this.player.moveLeft(this.playerState.tool);
    } else if (this.cursors.right.isDown) {
      this.player.moveRight(this.playerState.tool);
    } else {
      // No hacer nada - el evento animationcomplete se encargará del stay
    }
  }

  // Acciones del juego
  waterAllCrops() {
    const result = this.farm.waterAllCrops();
    if (result) {
      hud.showNotification("💧 Todos los cultivos regados", "success");
    } else {
      hud.showInsufficientEnergy();
    }
  }

  nextDay() {
    gameState.nextDay();

    // Actualizar cultivos con el nuevo clima
    this.farm.updateCrops(gameState.getWeather());

    // Mostrar estado de la granja
    const farmStatus = this.farm.getFarmStatus();
    if (farmStatus.readyToHarvest > 0) {
      hud.showNotification(
        `🌾 ${farmStatus.readyToHarvest} cultivos listos para cosechar`,
        "info",
        4000
      );
    }

    console.log("🌅 Nuevo día:", gameState.getDay());
  }

  // Métodos de utilidad
  getFarmStatus() {
    return this.farm ? this.farm.getFarmStatus() : null;
  }

  getPlayerStatus() {
    return {
      money: gameState.getMoney(),
      energy: gameState.getEnergy(),
      position: this.player ? this.player.getPosition() : null,
      tool: this.playerState.tool,
      mode: this.playerState.mode
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

    // Limpiar event listeners
    if (this.upKey) {
      this.upKey.removeAllListeners();
    }
    if (this.downKey) {
      this.downKey.removeAllListeners();
    }
    if (this.xKey) {
      this.xKey.removeAllListeners();
    }

    // Limpiar referencia global
    if (window.gameScene === this) {
      delete window.gameScene;
    }

    super.destroy();
  }
}
