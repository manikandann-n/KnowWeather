import axios from "axios";

const weatherCodeMap = {
  0: { condition: "Clear", description: "Sunny skies" },
  1: { condition: "Clouds", description: "Mainly clear" },
  2: { condition: "Clouds", description: "Partly cloudy" },
  3: { condition: "Clouds", description: "Overcast" },
  45: { condition: "Fog", description: "Foggy" },
  48: { condition: "Fog", description: "Depositing rime fog" },
  51: { condition: "Rain", description: "Light drizzle" },
  53: { condition: "Rain", description: "Moderate drizzle" },
  55: { condition: "Rain", description: "Dense drizzle" },
  56: { condition: "Rain", description: "Light freezing drizzle" },
  57: { condition: "Rain", description: "Dense freezing drizzle" },
  61: { condition: "Rain", description: "Light rain" },
  63: { condition: "Rain", description: "Moderate rain" },
  65: { condition: "Rain", description: "Heavy rain" },
  66: { condition: "Rain", description: "Light freezing rain" },
  67: { condition: "Rain", description: "Heavy freezing rain" },
  71: { condition: "Snow", description: "Light snow" },
  73: { condition: "Snow", description: "Moderate snow" },
  75: { condition: "Snow", description: "Heavy snow" },
  77: { condition: "Snow", description: "Snow grains" },
  80: { condition: "Rain", description: "Rain showers" },
  81: { condition: "Rain", description: "Moderate rain showers" },
  82: { condition: "Rain", description: "Violent rain showers" },
  85: { condition: "Snow", description: "Snow showers" },
  86: { condition: "Snow", description: "Heavy snow showers" },
  95: { condition: "Thunderstorm", description: "Thunderstorm" },
  96: { condition: "Thunderstorm", description: "Thunderstorm with hail" },
  99: { condition: "Thunderstorm", description: "Severe thunderstorm with hail" },
};

export const getWeather = async (city) => {
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );

  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    throw new Error("City not found");
  }

  const { latitude, longitude, name } = geoRes.data.results[0];
  const weatherRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,pressure_msl,visibility,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`
  );

  const { current_weather, hourly, daily } = weatherRes.data;
  const rawIndex = hourly.time?.findIndex((time) => time === current_weather.time);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;
  const weatherContext = weatherCodeMap[current_weather.weathercode] || { condition: "Clear", description: "Clear skies" };

  return {
    city: name,
    temp: current_weather.temperature,
    feels_like: current_weather.temperature,
    temp_min: daily.temperature_2m_min?.[0] ?? current_weather.temperature,
    temp_max: daily.temperature_2m_max?.[0] ?? current_weather.temperature,
    humidity: hourly.relativehumidity_2m?.[currentIndex] ?? 0,
    pressure: hourly.pressure_msl?.[currentIndex] ?? 0,
    visibility: Math.round((hourly.visibility?.[currentIndex] ?? 10000) / 1000),
    sunrise: daily.sunrise?.[0] ?? current_weather.time,
    sunset: daily.sunset?.[0] ?? current_weather.time,
    uv_index: daily.uv_index_max?.[0] ?? (hourly.uv_index?.[currentIndex] ?? 0),
    condition: weatherContext.condition,
    description: weatherContext.description,
    wind: current_weather.windspeed,
  };
};
