/**
 * GameScene.js - Escena principal del juego con sistema de herramientas
 */

class GameScene extends Phaser.Scene {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b72c422 (Update GameScene.js)
  constructor() {
    super({ key: "GameScene" });
    this.player = null;
    this.farm = null;
  }

  preload() {
    console.log("🎮 Cargando GameScene...");

<<<<<<< HEAD
    this.load.spritesheet("player", "assets/sheet2.png", {
      frameWidth: 444, // Ancho de cada frame
      frameHeight: 562, // Alto de cada frame
    });
=======
    this.load.spritesheet("player", "assets/sheet.png", {
      frameWidth: 444, // Ancho de cada frame
      frameHeight: 562, // Alto de cada frame
    });
    //this.load.image('player', 'assets/player.png');
    // Crear pixel básico para sprites simples
    //this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
>>>>>>> b72c422 (Update GameScene.js)

    // Aquí podrían cargarse más assets en el futuro
  }

  create() {
<<<<<<< HEAD
    // 🔥 NUEVO: Estados del jugador
    this.playerState = {
      tool: 'none', // 'none', 'bucket', 'shovel'
      mode: 'harvest' // 'harvest', 'plant', 'water'
    };

    // Crear animaciones
    this.createAnimations();
=======
    this.anims.create({
      key: "caminar",
      // Especifica manualmente el orden de los frames: Fila 1: 0, 1; Fila 2: 2, 3.
      frames: this.anims.generateFrameNumbers("player", {
        frames: [1,2,3],
      }),
      frameRate: 5,
      repeat: -1,
    });
>>>>>>> b72c422 (Update GameScene.js)

    console.log("🎮 GameScene creada");

    // Crear fondo
    this.createBackground();

<<<<<<< HEAD
    // Crear granja
    this.farm = new Farm(this, 5, 3);

    // Crear jugador
    this.player = new Player(this, 100, 250);
    
    // 🔥 NUEVO: Iniciar con animación de parado mirando a la derecha
    this.player.sprite.play('parado', true);
    this.player.sprite.setFlipX(false);

    // 🔥 NUEVO: Configurar eventos de animación
    this.setupAnimationEvents();
=======
    // Crear jugador
    this.player = new Player(this, 100, 250);
    this.player.sprite.play('caminar', true);

    // Crear granja
    this.farm = new Farm(this, 5, 3);
>>>>>>> b72c422 (Update GameScene.js)

    // Configurar interacciones
    this.setupInteractions();

    // Configurar controles
    this.setupControls();

    // Almacenar referencias globalmente para fácil acceso
    window.gameScene = this;
  }

<<<<<<< HEAD
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

=======
>>>>>>> b72c422 (Update GameScene.js)
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
<<<<<<< HEAD

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
=======
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.farm = null;
        this.currentTool = 'none'; // Estado de herramienta actual
        this.isPickingUpTool = false; // Flag para evitar interrupciones
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
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

<<<<<<< HEAD
  // 🔥 NUEVO: Método para soltar herramienta
  dropTool() {
    if (this.playerState.tool === 'none') {
      console.log("ℹ️ No tienes ninguna herramienta para soltar");
      hud.showNotification("ℹ️ No tienes herramienta", "info");
      return;
=======
    preload() {
        console.log('🎮 Cargando GameScene...');
        
        // Cargar spritesheet del jugador
        this.load.spritesheet('player', 'assets/sheet2.png', {
            frameWidth: 444,
            frameHeight: 562
        });
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
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

<<<<<<< HEAD
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
=======
    create() {
        console.log('🎮 GameScene creada');
        
        // Crear animaciones del jugador
        this.createAnimations();
        
        // IMPORTANTE: Hacer el fondo de la cámara transparente para ver BackgroundScene
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
        
        // Crear jugador
        this.player = new Player(this, 40, 437);
        
        // Granja desactivada temporalmente
        this.farm = null;
        
        // Configurar interacciones
        this.setupInteractions();
        
        // Configurar controles
        this.setupControls();
        
        // Almacenar referencias globalmente
        window.gameScene = this;
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
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
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

<<<<<<< HEAD
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
=======
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
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
=======
  }

  handleSceneClick(pointer) {
    const result = this.farm.handleClick(pointer.x, pointer.y);

    if (result) {
      this.handleFarmAction(result);
    } else {
      // Mover jugador hacia el clic si no es en la granja
      this.movePlayerTowards(pointer.x, pointer.y);
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
>>>>>>> b72c422 (Update GameScene.js)
        }
      } else {
        this.input.setDefaultCursor("crosshair");
      }
    } else {
      this.input.setDefaultCursor("default");
    }
  }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b72c422 (Update GameScene.js)
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
<<<<<<< HEAD
=======
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
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            this.pickUpTool('shovel'); // Pala para plantar
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
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
=======
>>>>>>> b72c422 (Update GameScene.js)
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
<<<<<<< HEAD
    // Teclas de acceso rápido - MODIFICADO para usar el sistema de modos
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
      console.log("🌱 Modo plantar activado (teclado)");
      this.changeMode('plant');
    }

<<<<<<< HEAD
    if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      console.log("💧 Modo regar activado (teclado)");
      this.changeMode('water');
=======
    nextDay() {
        gameState.nextDay();
        
        // Actualizar cultivos solo si existe la granja
        if (this.farm) {
            this.farm.updateCrops(gameState.getWeather());
            
            const farmStatus = this.farm.getFarmStatus();
            if (farmStatus.readyToHarvest > 0) {
                hud.showNotification(`🌾 ${farmStatus.readyToHarvest} cultivos listos para cosechar`, 'info', 4000);
            }
        }
        
        console.log('🌅 Nuevo día:', gameState.getDay());
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
=======
    // Teclas de acceso rápido
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
      console.log("🌱 Modo plantar activado (teclado)");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      this.waterAllCrops();
>>>>>>> b72c422 (Update GameScene.js)
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
      console.log("🌾 Modo cosechar activado (teclado)");
<<<<<<< HEAD
      this.changeMode('harvest');
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> a2fb64aea401ec5ee983b7bf5b5acf6244f18f68
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
=======
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.nextDay();
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
    };
  }

  // Cleanup
  destroy() {
    if (this.player) {
      this.player.destroy();
    }
>>>>>>> b72c422 (Update GameScene.js)

    if (this.farm) {
      this.farm.destroy();
    }

<<<<<<< HEAD
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

=======
>>>>>>> b72c422 (Update GameScene.js)
    // Limpiar referencia global
    if (window.gameScene === this) {
      delete window.gameScene;
    }

    super.destroy();
  }
}
