/**
 * Player.js - Clase del jugador CORREGIDA
 */

class Player {
  constructor(scene, x = 100, y = 250) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.init();
  }

  init() {
    this.sprite = this.scene.add.sprite(this.x, this.y, "player", 0);
    this.sprite.setOrigin(0.5, 1); // Origen en la base para mejor posicionamiento
    this.sprite.setScale(0.2);
    
    // Iniciar con animación de parado
    if (this.scene.anims.exists('parado')) {
      this.sprite.play('parado', true);
    }
    
    console.log("🧑‍🌾 Jugador creado en:", this.x, this.y);
  }

  move(x, y) {
    this.x = x;
    this.y = y;

    if (this.sprite) {
      this.sprite.setPosition(x, y);
    }
  }

  toRight() {
    const position = this.getPosition();
    let newX;
    if (position.x >= 775) {
      newX = 775;
    } else {
      newX = position.x + 2;
    }
    this.move(newX, position.y);
  }

  toLeft() {
    const position = this.getPosition();
    let newX;
    if (position.x <= 25) {
      newX = 25;
    } else {
      newX = position.x - 2;
    }
    this.move(newX, position.y);
  }

  // Métodos de movimiento con herramientas
  moveRight(tool) {
    let animation;
    
    // Determinar animación según la herramienta
    switch(tool) {
      case 'bucket':
        animation = 'caminar-balde';
        break;
      case 'shovel':
        animation = 'caminar-pala';
        break;
      default:
        animation = 'caminar';
    }
    
    // Solo reproducir la animación si no está ya reproduciéndose
    if (this.sprite.anims.currentAnim?.key !== animation || !this.sprite.anims.isPlaying) {
      this.sprite.play(animation, true);
    }
    
    this.toRight();
    this.sprite.setFlipX(false);
  }

  moveLeft(tool) {
    let animation;
    
    // Determinar animación según la herramienta
    switch(tool) {
      case 'bucket':
        animation = 'caminar-balde';
        break;
      case 'shovel':
        animation = 'caminar-pala';
        break;
      default:
        animation = 'caminar';
    }
    
    // Solo reproducir la animación si no está ya reproduciéndose
    if (this.sprite.anims.currentAnim?.key !== animation || !this.sprite.anims.isPlaying) {
      this.sprite.play(animation, true);
    }
    
    this.toLeft();
    this.sprite.setFlipX(true);
  }

  stay(tool) {
    // CRÍTICO: NO interrumpir animaciones que no se repiten (como agarrar herramientas)
    const currentAnim = this.sprite.anims.currentAnim;
    
    // Si hay una animación reproduciéndose y NO se repite (repeat === 0), NO la interrumpas
    if (currentAnim && currentAnim.repeat === 0 && this.sprite.anims.isPlaying) {
      console.log(`⏸️ No interrumpir animación: ${currentAnim.key}`);
      return;
    }
    
    let animation = 'parado';
    
    // Si tiene herramienta, usar animación de parado con herramienta
    if (tool === 'bucket') {
      animation = 'parado-balde';
    } else if (tool === 'shovel') {
      animation = 'parado-pala';
    }
    
    if (this.scene.anims.exists(animation)) {
      this.sprite.play(animation, true);
    }
    
    console.log(`🛑 Jugador parado con herramienta: ${tool}`);
  }

  // Métodos de economía que ahora usan GameState
  canAfford(cost) {
    return gameState.canAfford(cost);
  }

  spendMoney(amount) {
    return gameState.spendMoney(amount);
  }

  gainMoney(amount) {
    gameState.addMoney(amount);
  }

  // Métodos de energía
  canPerformAction(energyCost = 10) {
    return gameState.getEnergy() >= energyCost;
  }

  performAction(energyCost = 10) {
    return gameState.useEnergy(energyCost);
  }

  // Acciones específicas del jugador
  plantCrop(cropType, cost = 50, energyCost = 10) {
    if (!this.canAfford(cost)) {
      console.log("💸 No tienes suficiente dinero para plantar");
      return false;
    }

    if (!this.canPerformAction(energyCost)) {
      console.log("⚡ No tienes suficiente energía");
      return false;
    }

    if (this.spendMoney(cost) && this.performAction(energyCost)) {
      console.log(`🌱 Plantaste ${cropType} por ${cost} monedas`);
      return true;
    }

    return false;
  }

  waterCrops(energyCost = 5) {
    if (!this.canPerformAction(energyCost)) {
      console.log("⚡ No tienes suficiente energía para regar");
      return false;
    }

    if (this.performAction(energyCost)) {
      console.log("💧 Regaste los cultivos");
      return true;
    }

    return false;
  }

  harvestCrop(value, energyCost = 15) {
    if (!this.canPerformAction(energyCost)) {
      console.log("⚡ No tienes suficiente energía para cosechar");
      return false;
    }

    if (this.performAction(energyCost)) {
      this.gainMoney(value);
      console.log(`🌾 Cosechaste y ganaste ${value} monedas`);
      return true;
    }

    return false;
  }

  // Métodos de renderizado
  update() {
    // Lógica de actualización del jugador si es necesaria
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  // Métodos de utilidad
  getPosition() {
    return { x: this.x, y: this.y };
  }

  distanceTo(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}