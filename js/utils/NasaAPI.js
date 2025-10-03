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



    async getClimateData(lat, lon, start, end) {
        try {
            const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

            console.log('Consultando NASA POWER API...');
            const resPower = await fetch(powerUrl);

            if (!resPower.ok) {
                throw new Error(`HTTP ${resPower.status}`);
            }

            const dataPower = await resPower.json();

            // Verificar ambas ubicaciones posibles de datos
            const hasPropertiesParam = dataPower.properties && dataPower.properties.parameter;
            const hasDirectParam = dataPower.parameters;

            if (hasPropertiesParam || hasDirectParam) {
                console.log("✅ Datos obtenidos desde NASA POWER API");

                // Normalizar estructura si viene en 'parameters' directo
                if (!hasPropertiesParam && hasDirectParam) {
                    dataPower.properties = {
                        parameter: dataPower.parameters
                    };
                }

                return {
                    source: "POWER",
                    data: dataPower
                };
            }

            throw new Error("Respuesta sin datos válidos");

        } catch (err1) {
            console.warn("POWER API falló:", err1.message);
            return {
                source: "offline",
                data: null
            };
        }
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
            // Usar el nuevo sistema de fallback
            const result = await this.getClimateData(latitude, longitude, startDate, endDate);

            // Verificar fuente de datos
            if (result.source === "offline") {
                console.log("📦 API no disponible, usando datos de respaldo");
                return this.getFallbackWeatherData();
            }

            // Si tenemos datos de POWER API
            if (result.source === "POWER" && result.data) {
                // Guardar en caché
                this.cache.set(cacheKey, {
                    data: result.data,
                    timestamp: Date.now()
                });

                console.log('✅ Datos climáticos obtenidos y cacheados');
                return result.data;
            }

            // Si llegamos aquí, algo salió mal
            throw new Error("Respuesta inesperada de getClimateData");

        } catch (error) {
            console.error('❌ Error en getWeatherData:', error);
            return this.getFallbackWeatherData();
        }
    }

    // Procesar datos de NASA al formato del juego
    processWeatherData(nasaData, day = 0) {
        // Verificar que tenemos datos
        if (!nasaData || !nasaData.properties || !nasaData.properties.parameter) {
            console.warn('Datos NASA inválidos o incompletos');
            return this.getFallbackWeatherData();
        }

        const params = nasaData.properties.parameter;

        // Verificar que existan los parámetros
        if (!params.T2M || !params.PRECTOTCORR || !params.ALLSKY_SFC_SW_DWN) {
            console.warn('Faltan parámetros en datos NASA');
            return this.getFallbackWeatherData();
        }

        const dates = Object.keys(params.T2M);

        if (dates.length === 0) {
            console.warn('No hay fechas en datos NASA');
            return this.getFallbackWeatherData();
        }

        const targetDate = dates[Math.min(day, dates.length - 1)];

        console.log(`Procesando fecha: ${targetDate}`);

        const temp = params.T2M[targetDate];
        const precip = params.PRECTOTCORR[targetDate];
        const solar = params.ALLSKY_SFC_SW_DWN[targetDate];

        // Validar valores
        if (temp === -999 || temp === undefined ||
            precip === -999 || precip === undefined ||
            solar === -999 || solar === undefined) {
            console.warn('Valores inválidos (-999 o undefined)');
            return this.getFallbackWeatherData();
        }

        const result = {
            temperature: Math.round(temp * 10) / 10,
            precipitation: Math.round(precip * 100) / 100,
            solar: Math.round(solar * 100) / 100
        };

        console.log('Datos procesados:', result);
        return result;
    }

    // Obtener datos climáticos para el siguiente día del juego
    async getNextDayWeather(latitude = 16.8634, longitude = -99.8901) {
        console.log('=== PRUEBA: getNextDayWeather ===');
        console.log('Coordenadas:', latitude, longitude);
        console.log('Día del juego:', gameState.getDay());

        try {
            const today = new Date();
            const startDate = this.formatDate(today);
            const endDate = this.formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));

            console.log('Rango de fechas:', startDate, '-', endDate);

            const nasaData = await this.getWeatherData(latitude, longitude, startDate, endDate);

            console.log('Datos recibidos:', nasaData);

            const processedData = this.processWeatherData(nasaData, gameState.getDay() % 7);

            console.log('Datos procesados:', processedData);

            // Validación
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
        // Intentar cargar desde JSON local
        try {
            // En un navegador, necesitamos hacer fetch del JSON
            // pero como es sincrónico, usamos datos hardcodeados como antes
            const day = gameState.getDay() % 7;

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

        } catch (error) {
            console.error('Error cargando datos de respaldo:', error);
            // Último recurso: datos mínimos
            return { temperature: 25, precipitation: 2, solar: 18 };
        }
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

    async loadBackupWeatherData() {
        try {
            const response = await fetch('assets/data/weather-backup.json');
            if (!response.ok) throw new Error('No se pudo cargar weather-backup.json');

            const backupData = await response.json();
            console.log('📦 Datos de respaldo cargados desde JSON');
            return backupData;

        } catch (error) {
            console.error('Error cargando JSON de respaldo:', error);
            return null;
        }
    }
}

// Crear instancia global
const nasaAPI = new NasaAPI();

// Funciones de utilidad globales
window.NasaAPI = NasaAPI;
window.nasaAPI = nasaAPI;

console.log('🛰️ NASA API inicializada');