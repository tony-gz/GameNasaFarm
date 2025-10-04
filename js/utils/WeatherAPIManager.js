/**
 * WeatherAPIManager.js - Gestor centralizado de APIs meteorológicas
 */

class WeatherAPIManager {
    constructor() {
        this.availableAPIs = new Map();
        this.currentAPI = null;
        this.initAPIs();
    }

    initAPIs() {

        // NASA POWER API (datos históricos)
    this.registerAPI('nasapower', {
        name: 'NASA POWER',
        description: 'Datos históricos de hace 2 meses (para mecánicas del juego)',
        requiresAuth: false,
        handler: this.getNASAPowerHistorical.bind(this)
    });

        // Registrar APIs disponibles
        this.registerAPI('openmeteo', {
            name: 'Open-Meteo',
            description: 'API gratuita sin autenticación',
            requiresAuth: false,
            handler: this.getOpenMeteoRealTime.bind(this)
        });

        this.registerAPI('openweather', {
            name: 'OpenWeatherMap',
            description: 'Requiere API key (1000 llamadas/día gratis)',
            requiresAuth: true,
            apiKey: null,
            handler: this.getOpenWeatherRealTime.bind(this)
        });

        this.registerAPI('weatherapi', {
            name: 'WeatherAPI.com',
            description: 'Requiere API key gratuita',
            requiresAuth: true,
            apiKey: null,
            handler: this.getWeatherAPIRealTime.bind(this)
        });

        // API por defecto
        this.currentAPI = 'openmeteo';
    }

    registerAPI(id, config) {
        this.availableAPIs.set(id, config);
        console.log(`API registrada: ${config.name}`);
    }

    setCurrentAPI(apiId, apiKey = null) {
        if (!this.availableAPIs.has(apiId)) {
            console.error(`API no encontrada: ${apiId}`);
            return false;
        }

        const api = this.availableAPIs.get(apiId);

        if (api.requiresAuth && !apiKey) {
            console.error(`${api.name} requiere API key`);
            return false;
        }

        if (apiKey) {
            api.apiKey = apiKey;
        }

        this.currentAPI = apiId;
        console.log(`API activa: ${api.name}`);
        return true;
    }

    show() {
        this.menuElement.classList.remove('hidden');
        this.renderOptions();

        // Mostrar cuál está activa
        const currentAPI = weatherAPIManager.availableAPIs.get(weatherAPIManager.currentAPI);
        console.log(`API actual: ${currentAPI.name}`);
    }

    async getCurrentWeather(lat = 17.5506, lon = -99.5009) {
        const api = this.availableAPIs.get(this.currentAPI);

        if (!api) {
            throw new Error('No hay API configurada');
        }

        try {
            return await api.handler(lat, lon, api.apiKey);
        } catch (error) {
            console.error(`Error en ${api.name}:`, error);
            throw error;
        }
    }

    // Implementaciones de cada API

    async getOpenMeteoRealTime(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain,showers,weather_code&timezone=America/Mexico_City`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const current = data.current;

        return {
            source: 'Open-Meteo',
            temperature: current.temperature_2m,
            precipitation: current.precipitation || 0,
            isRaining: current.rain > 0 || current.showers > 0,
            weatherCode: current.weather_code,
            timestamp: new Date(current.time),
            location: 'Chilpancingo, Guerrero'
        };
    }

    async getOpenWeatherRealTime(lat, lon, apiKey) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            source: 'OpenWeatherMap',
            temperature: data.main.temp,
            precipitation: data.rain ? data.rain['1h'] || 0 : 0,
            isRaining: data.weather[0].main === 'Rain',
            humidity: data.main.humidity,
            description: data.weather[0].description,
            timestamp: new Date(data.dt * 1000),
            location: data.name
        };
    }

    async getWeatherAPIRealTime(lat, lon, apiKey) {
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&lang=es`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            source: 'WeatherAPI.com',
            temperature: data.current.temp_c,
            precipitation: data.current.precip_mm,
            isRaining: data.current.precip_mm > 0,
            humidity: data.current.humidity,
            description: data.current.condition.text,
            timestamp: new Date(data.current.last_updated),
            location: data.location.name
        };
    }

    getAvailableAPIs() {
        const apis = [];
        this.availableAPIs.forEach((config, id) => {
            apis.push({
                id: id,
                name: config.name,
                description: config.description,
                requiresAuth: config.requiresAuth,
                hasKey: config.apiKey !== null
            });
        });
        return apis;
    }

    async getNASAPowerHistorical(lat, lon) {
        try {
            // Usar el método existente de nasaAPI
            const weather = await nasaAPI.getNextDayWeather(lat, lon);

            return {
                source: 'NASA POWER',
                temperature: weather.temperature,
                precipitation: weather.precipitation,
                isRaining: weather.precipitation > 5,
                solar: weather.solar,
                timestamp: new Date(),
                location: 'Chilpancingo, Guerrero',
                note: 'Datos históricos de hace ~2 meses'
            };
        } catch (error) {
            throw new Error(`NASA POWER falló: ${error.message}`);
        }
    }
}

// Instancia global
const weatherAPIManager = new WeatherAPIManager();