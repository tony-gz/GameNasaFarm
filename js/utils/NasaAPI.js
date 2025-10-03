/**
 * NasaAPI.js - Conexión con APIs de la NASA
 */

class NasaAPI {
    constructor() {
        this.apiKey = 'DEMO_KEY'; // Usar tu propia API key de NASA
        this.baseUrl = 'https://api.nasa.gov';
        this.powerApiUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point';
        this.cache = new Map();
        this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas
    }

    // Obtener datos climáticos para una ubicación específica
    async getWeatherData(latitude, longitude, startDate, endDate) {
        const cacheKey = `weather_${latitude}_${longitude}_${startDate}_${endDate}`;

        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📦 Usando datos climáticos en cache');
                return cached.data;
            }
        }

        try {
            const parameters = [
                'T2M',      // Temperatura a 2m
                'PRECTOTCORR', // Precipitación
                'ALLSKY_SFC_SW_DWN' // Radiación solar
            ].join(',');

            const url = `${this.powerApiUrl}` +
                `?parameters=${parameters}` +
                `&community=AG` + // Agricultura
                `&longitude=${longitude}` +
                `&latitude=${latitude}` +
                `&start=${startDate}` +
                `&end=${endDate}` +
                `&format=JSON`;

            console.log('🌍 Obteniendo datos de NASA POWER API...');
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            console.log('✅ Datos climáticos obtenidos de NASA');
            return data;

        } catch (error) {
            console.error('❌ Error obteniendo datos de NASA:', error);
            return this.getFallbackWeatherData();
        }
    }

    // Procesar datos de NASA al formato del juego
    processWeatherData(nasaData, day = 0) {
        if (!nasaData.properties || !nasaData.properties.parameter) {
            return this.getFallbackWeatherData();
        }

        const params = nasaData.properties.parameter;
        const dates = Object.keys(params.T2M || {});

        if (dates.length === 0) {
            return this.getFallbackWeatherData();
        }

        const targetDate = dates[Math.min(day, dates.length - 1)];

        // Validar que los valores sean válidos (no -999)
        const temp = params.T2M[targetDate];
        const precip = params.PRECTOTCORR[targetDate];
        const solar = params.ALLSKY_SFC_SW_DWN[targetDate];

        if (temp === -999 || precip === -999 || solar === -999) {
            console.warn('Datos NASA contienen valores inválidos (-999), usando fallback');
            return this.getFallbackWeatherData();
        }

        return {
            temperature: MathUtils.roundTo(temp, 1),
            precipitation: MathUtils.roundTo(precip, 2),
            solar: MathUtils.roundTo(solar, 2)
        };
    }

    // Obtener datos climáticos para el siguiente día del juego
    async getNextDayWeather(latitude = 16.8634, longitude = -99.8901) {
        try {
            const today = new Date();
            const startDate = this.formatDate(today);
            const endDate = this.formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));

            const nasaData = await this.getWeatherData(latitude, longitude, startDate, endDate);
            const processedData = this.processWeatherData(nasaData, gameState.getDay() % 7);

            // Doble validación
            if (processedData.temperature === -999 || processedData.solar === -999) {
                throw new Error('Datos NASA inválidos');
            }

            return processedData;

        } catch (error) {
            console.warn('Error obteniendo datos NASA, usando fallback:', error.message);
            return this.getFallbackWeatherData();
        }
    }

    // Obtener datos históricos para análisis
    async getHistoricalWeather(latitude, longitude, daysBack = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

        const nasaData = await this.getWeatherData(
            latitude,
            longitude,
            this.formatDate(startDate),
            this.formatDate(endDate)
        );

        return this.processHistoricalData(nasaData);
    }

    // Procesar datos históricos
    processHistoricalData(nasaData) {
        if (!nasaData.properties || !nasaData.properties.parameter) {
            return [];
        }

        const params = nasaData.properties.parameter;
        const dates = Object.keys(params.T2M || {});

        return dates.map(date => ({
            date: date,
            temperature: params.T2M[date] || 20,
            precipitation: params.PRECTOTCORR[date] || 0,
            solar: params.ALLSKY_SFC_SW_DWN[date] || 15
        }));
    }

    // Datos de respaldo cuando la API no está disponible
    getFallbackWeatherData() {
        // Intentar cargar desde JSON local primero
        const day = gameState.getDay() % 7;

        // Datos hardcodeados como último recurso
        const fallbackData = [
            { temperature: 25, precipitation: 2, solar: 18 },
            { temperature: 28, precipitation: 0, solar: 22 },
            { temperature: 23, precipitation: 5, solar: 15 },
            { temperature: 26, precipitation: 1, solar: 20 },
            { temperature: 30, precipitation: 0, solar: 24 },
            { temperature: 22, precipitation: 8, solar: 12 },
            { temperature: 24, precipitation: 3, solar: 17 }
        ];

        console.log('📄 Usando datos climáticos simulados (día', day, ')');
        return fallbackData[day];
    }

    // Formatear fecha para la API de NASA
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    // Obtener información satelital (placeholder para futuras funciones)
    async getSatelliteImagery(latitude, longitude, date) {
        // Esta función podría expandirse para obtener imágenes satelitales
        console.log('🛰️ Función de imágenes satelitales - En desarrollo');
        return null;
    }

    // Obtener datos de NDVI (Índice de Vegetación)
    async getNDVIData(latitude, longitude, startDate, endDate) {
        // Placeholder para datos de vegetación
        console.log('🌿 Función NDVI - En desarrollo');
        return null;
    }

    // Limpiar cache
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache de NASA API limpiado');
    }

    // Verificar estado de la API
    async checkAPIStatus() {
        try {
            const testUrl = `${this.powerApiUrl}?parameters=T2M&community=AG&longitude=0&latitude=0&start=20230101&end=20230101&format=JSON`;
            const response = await fetch(testUrl);
            return response.ok;
        } catch (error) {
            console.error('❌ Error verificando API de NASA:', error);
            return false;
        }
    }
}

// Crear instancia global
const nasaAPI = new NasaAPI();

// Funciones de utilidad globales
window.NasaAPI = NasaAPI;
window.nasaAPI = nasaAPI;

console.log('🛰️ NASA API inicializada');