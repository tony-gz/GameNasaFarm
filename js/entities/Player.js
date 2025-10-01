/**
 * Player.js - Clase del jugador
 */

class Player {
  constructor(scene, x = 100, y = 250) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.init();
  }

  init() {
    this.sprite = this.scene.add.sprite(this.x, this.y, "player", 3);
    this.sprite.setOrigin(0.5, 0.5); // Mantén el origen centrado
    this.sprite.setScale(0.2);
    console.log("🧑‍🌾 Jugador creado con imagen PNG en:", this.x, this.y);
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
    if ((position.x >= 775)) {
      newX = 775;
    } else {
      newX = position.x + 2;
    }
    this.move(newX, position.y);
  }

  toLeft() {
    const position = this.getPosition();
    let newX;
    if ((position.x <= 25)) {
      newX = 20;
    } else {
      newX = position.x - 2;
    }
    this.move(newX, position.y);
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
