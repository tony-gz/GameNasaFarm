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
            // Intentar NASA POWER
            const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

            const resPower = await fetch(powerUrl);

            if (resPower.ok) {
                const dataPower = await resPower.json();

                if (dataPower.properties?.parameter || dataPower.parameters) {
                    if (!dataPower.properties?.parameter) {
                        dataPower.properties = { parameter: dataPower.parameters };
                    }

                    // Verificar que al menos una fecha tenga datos válidos
                    const hasValidData = Object.values(dataPower.properties.parameter.T2M || {})
                        .some(val => val !== -999 && val !== undefined);

                    if (hasValidData) {
                        console.log("Datos desde NASA POWER");
                        return { source: "POWER", data: dataPower };
                    }
                }
            }

            throw new Error("NASA sin datos válidos");

        } catch (err1) {
            console.warn("NASA POWER falló, usando Open-Meteo...");

            try {
                return await this.getOpenMeteoData(lat, lon, start, end);
            } catch (err2) {
                console.warn("Open-Meteo también falló");
                return { source: "offline", data: null };
            }
        }
    }




    async getOpenMeteoData(lat, lon, start, end) {
        const startFormatted = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`;
        const endFormatted = `${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}`;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean,precipitation_sum,shortwave_radiation_sum&start_date=${startFormatted}&end_date=${endFormatted}&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo HTTP ${response.status}`);
        }

        const data = await response.json();

        const converted = {
            properties: {
                parameter: {
                    T2M: {},
                    PRECTOTCORR: {},
                    ALLSKY_SFC_SW_DWN: {}
                }
            }
        };

        data.daily.time.forEach((date, i) => {
            const dateKey = date.replace(/-/g, '');
            converted.properties.parameter.T2M[dateKey] = data.daily.temperature_2m_mean[i];
            converted.properties.parameter.PRECTOTCORR[dateKey] = data.daily.precipitation_sum[i] || 0;
            converted.properties.parameter.ALLSKY_SFC_SW_DWN[dateKey] = (data.daily.shortwave_radiation_sum[i] || 0) / 1000;
        });

        console.log("Datos desde Open-Meteo (respaldo)");
        return { source: "OpenMeteo", data: converted };
    }




    // Obtener datos climáticos para una ubicación específica
    async getWeatherData(latitude, longitude, startDate, endDate) {
        const cacheKey = `weather_${latitude}_${longitude}_${startDate}_${endDate}`;

        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);

            // Verificar que el caché no sea del futuro
            const cacheStart = parseInt(startDate);
            const today = parseInt(this.formatDate(new Date()));

            if (cacheStart > today) {
                console.warn('Caché inválido (fechas futuras), eliminando...');
                this.cache.delete(cacheKey);
            } else if (Date.now() - cached.timestamp < this.cacheTimeout) {
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


    async getWeatherAPIData(lat, lon, start, end) {
        // API key gratuita de https://www.weatherapi.com/
        const apiKey = 'TU_API_KEY_AQUI'; // Obtener gratis en weatherapi.com

        const startDate = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`;
        const endDate = `${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}`;

        const url = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${lat},${lon}&dt=${startDate}&end_dt=${endDate}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`WeatherAPI HTTP ${response.status}`);
        }

        const data = await response.json();

        // Convertir formato
        const converted = {
            properties: {
                parameter: { T2M: {}, PRECTOTCORR: {}, ALLSKY_SFC_SW_DWN: {} }
            }
        };

        data.forecast.forecastday.forEach(day => {
            const dateKey = day.date.replace(/-/g, '');
            converted.properties.parameter.T2M[dateKey] = day.day.avgtemp_c;
            converted.properties.parameter.PRECTOTCORR[dateKey] = day.day.totalprecip_mm;
            converted.properties.parameter.ALLSKY_SFC_SW_DWN[dateKey] = day.day.uv * 2.5; // Aproximación
        });

        console.log("Datos desde WeatherAPI");
        return { source: "WeatherAPI", data: converted };
    }

    // Procesar datos de NASA al formato del juego
    processWeatherData(nasaData, day = 0) {
        if (!nasaData || !nasaData.properties || !nasaData.properties.parameter) {
            console.warn('Datos NASA incompletos');
            return this.getFallbackWeatherData();
        }

        const params = nasaData.properties.parameter;

        if (!params.T2M || !params.PRECTOTCORR || !params.ALLSKY_SFC_SW_DWN) {
            console.warn('Faltan parámetros');
            return this.getFallbackWeatherData();
        }

        const dates = Object.keys(params.T2M);

        if (dates.length === 0) {
            return this.getFallbackWeatherData();
        }

        // Buscar la primera fecha válida empezando desde el índice solicitado
        let validDate = null;
        let attempts = 0;

        while (!validDate && attempts < dates.length) {
            const targetDate = dates[(day + attempts) % dates.length];

            const temp = params.T2M[targetDate];
            const precip = params.PRECTOTCORR[targetDate];
            const solar = params.ALLSKY_SFC_SW_DWN[targetDate];

            // Verificar si todos los valores son válidos
            if (temp !== -999 && temp !== undefined &&
                precip !== -999 && precip !== undefined &&
                solar !== -999 && solar !== undefined) {

                validDate = targetDate;

                console.log(`Usando fecha válida: ${targetDate}`);

                return {
                    temperature: Math.round(temp * 10) / 10,
                    precipitation: Math.round(precip * 100) / 100,
                    solar: Math.round(solar * 100) / 100
                };
            }

            attempts++;
            console.warn(`Fecha ${targetDate} tiene datos inválidos, intentando siguiente...`);
        }

        // Si ninguna fecha tiene datos válidos
        console.warn('Ninguna fecha histórica tiene datos válidos, usando fallback');
        return this.getFallbackWeatherData();
    }

    // Obtener datos climáticos para el siguiente día del juego
    async getNextDayWeather(latitude = 16.8634, longitude = -99.8901) {
        try {
            const today = new Date();

            // CRÍTICO: Usar datos de hace 2 meses para evitar el futuro
            const endDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
            const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

            const start = this.formatDate(startDate);
            const end = this.formatDate(endDate);

            console.log(`Consultando datos históricos: ${start} a ${end}`);

            const nasaData = await this.getWeatherData(latitude, longitude, start, end);

            // Rotar entre los 30 días disponibles
            const dayIndex = gameState.getDay() % 30;
            const processedData = this.processWeatherData(nasaData, dayIndex);

            if (processedData.temperature === -999) {
                throw new Error('Datos inválidos en rango histórico');
            }

            return processedData;

        } catch (error) {
            console.warn('Error NASA, usando fallback:', error.message);
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