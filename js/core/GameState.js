/**
 * GameState.js - Manejo del estado global del juego
 */

class GameState {
    constructor() {
        this.state = {
            money: 1000,
            energy: 100,
            day: 1,
            weather: {
                temperature: 25,
                precipitation: 2,
                solar: 18
            },
            currentScreen: 'loading',
            gameStarted: false
        };
        
        this.observers = [];
    }

    // Patrón Observer para notificar cambios
    subscribe(callback) {
        this.observers.push(callback);
    }

    unsubscribe(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    notify(change) {
        this.observers.forEach(callback => callback(change));
    }

    // Getters
    getMoney() {
        return this.state.money;
    }

    getEnergy() {
        return this.state.energy;
    }

    getDay() {
        return this.state.day;
    }

    getWeather() {
        return { ...this.state.weather };
    }

    getCurrentScreen() {
        return this.state.currentScreen;
    }

    isGameStarted() {
        return this.state.gameStarted;
    }

    // Setters con notificación
    setMoney(amount) {
        const oldAmount = this.state.money;
        this.state.money = Math.max(0, amount);
        this.notify({ type: 'money', oldValue: oldAmount, newValue: this.state.money });
    }

    addMoney(amount) {
        this.setMoney(this.state.money + amount);
    }

    spendMoney(amount) {
        if (this.canAfford(amount)) {
            this.setMoney(this.state.money - amount);
            return true;
        }
        return false;
    }

    canAfford(amount) {
        return this.state.money >= amount;
    }

    setEnergy(amount) {
        const oldAmount = this.state.energy;
        this.state.energy = Math.max(0, Math.min(100, amount));
        this.notify({ type: 'energy', oldValue: oldAmount, newValue: this.state.energy });
    }

    useEnergy(amount) {
        if (this.state.energy >= amount) {
            this.setEnergy(this.state.energy - amount);
            return true;
        }
        return false;
    }

    setDay(day) {
        const oldDay = this.state.day;
        this.state.day = day;
        this.notify({ type: 'day', oldValue: oldDay, newValue: this.state.day });
    }

    nextDay() {
        this.setDay(this.state.day + 1);
        this.setEnergy(100); // Restaurar energía al siguiente día
        this.updateWeather();
    }

    updateWeather(weatherData = null) {
        const oldWeather = { ...this.state.weather };
        
        if (weatherData) {
            this.state.weather = { ...weatherData };
        } else {
            // Generar clima aleatorio temporal
            this.state.weather = {
                temperature: 15 + Math.random() * 20,
                precipitation: Math.random() * 10,
                solar: 10 + Math.random() * 15
            };
        }
        
        this.notify({ type: 'weather', oldValue: oldWeather, newValue: this.state.weather });
    }

    setCurrentScreen(screenName) {
        const oldScreen = this.state.currentScreen;
        this.state.currentScreen = screenName;
        this.notify({ type: 'screen', oldValue: oldScreen, newValue: this.state.currentScreen });
    }

    startGame() {
        this.state.gameStarted = true;
        this.setCurrentScreen('game');
    }

    // Métodos de utilidad
    getGameData() {
        return { ...this.state };
    }

    loadGameData(data) {
        this.state = { ...this.state, ...data };
        this.notify({ type: 'loaded', newValue: this.state });
    }

    reset() {
        this.state = {
            money: 1000,
            energy: 100,
            day: 1,
            weather: {
                temperature: 25,
                precipitation: 2,
                solar: 18
            },
            currentScreen: 'menu',
            gameStarted: false
        };
        this.notify({ type: 'reset', newValue: this.state });
    }
}

// Crear instancia global
const gameState = new GameState();