import { useEffect, useMemo, useRef, useState } from "react";
import { getWeather } from "./api";

const weatherIcons = {
  Clear: "sun",
  Clouds: "cloud",
  Rain: "rain",
  Drizzle: "rain",
  Thunderstorm: "thunder",
  Snow: "snow",
  Fog: "fog",
  Mist: "fog",
  Smoke: "fog",
  Haze: "fog",
  Dust: "fog",
  Sand: "fog",
  Ash: "fog",
  Squall: "wind",
  Tornado: "wind",
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [time, setTime] = useState(new Date());
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weatherType = useMemo(() => {
    if (!weather) return "Clear";
    return weather.condition || "Clear";
  }, [weather]);

  const backgroundClass = useMemo(() => {
    switch (weatherType) {
      case "Clear":
      case "Sunny":
        return "sky-sunny";
      case "Clouds":
      case "Cloudy":
        return "sky-cloudy";
      case "Rain":
      case "Drizzle":
        return "sky-rain";
      case "Thunderstorm":
        return "sky-thunder";
      case "Snow":
        return "sky-snow";
      case "Night":
      case "Fog":
      default:
        return "sky-night";
    }
  }, [weatherType]);

  const iconType = weatherIcons[weatherType] || "sun";

  const handleGetWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      inputRef.current?.focus();
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await getWeather(city);
      setWeather(data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message || "Unable to fetch weather.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleGetWeather();
    }
  };

  return (
    <section className={`weather-scene ${backgroundClass} ${theme}`}>
      <div className="scene-overlay" aria-hidden="true" />
      <div className="content-shell">
        <header className="weather-header">
          <div>
            <h1 className="eyebrow">Know your Weather</h1>
            <h3>Premium Weather Experience</h3>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label="Toggle light and dark theme"
            >
              <span className="theme-dot" aria-hidden="true" />
              {theme === "dark" ? "Dark" : "Light"}
            </button>
            <div className="clock-panel" aria-label="Current time and date">
              <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              <small>{time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</small>
            </div>
          </div>
        </header>

        <div className="weather-frame glass-card">
          <div className="weather-search-panel" role="search" aria-label="Search for city weather">
            <div className="search-group">
              <label htmlFor="city-input" className="visually-hidden">
                City name
              </label>
              <div className="search-input-shell">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  id="city-input"
                  ref={inputRef}
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search city, e.g. London"
                  aria-label="Enter city name"
                />
              </div>
              <button
                type="button"
                className="search-button"
                onClick={handleGetWeather}
                disabled={loading}
              >
                {loading ? <span className="spinner" aria-hidden="true" /> : "Search"}
              </button>
            </div>
            <p className="search-helper">Find premium forecasts fast with intelligent weather search.</p>
          </div>

          {error && (
            <div className="weather-alert" role="alert">
              <span className="alert-icon" aria-hidden="true">⚠️</span>
              {error}
            </div>
          )}

          {!weather && !error && !loading && (
            <div className="empty-state glass-panel">
              <div className="empty-illustration" aria-hidden="true">
                <div className="starburst" />
              </div>
              <div>
                <h2>Weather awaits.</h2>
                <p>Search a city to reveal the latest forecast, radar, and premium weather details.</p>
              </div>
            </div>
          )}

          {weather && (
            <article className="weather-card premium-card" aria-label={`Weather details for ${weather.city}`}>
              <div className="weather-card-top">
                <div>
                  <p className="weather-badge">{weather.condition || "Clear"}</p>
                  <h2>{weather.city}</h2>
                  <p className="weather-meta">{weather.description || "Beautiful skies"}</p>
                </div>

                <div className="weather-main-icon" aria-hidden="true">
                  <div className={`weather-icon icon-${iconType}`} />
                </div>
              </div>

              <div className="weather-temp-block">
                <p className="temp-value">{Math.round(weather.temp)}°</p>
                <div className="temp-details">
                  <p>Feels like <strong>{Math.round(weather.feels_like)}°</strong></p>
                  <p>{weather.temp_min}° / {weather.temp_max}°</p>
                </div>
              </div>

              <div className="weather-grid">
                <div className="weather-stat">
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
                <div className="weather-stat">
                  <span>Wind</span>
                  <strong>{weather.wind} km/hr</strong>
                </div>
                <div className="weather-stat">
                  <span>Pressure</span>
                  <strong>{weather.pressure} hPa</strong>
                </div>
                <div className="weather-stat">
                  <span>Visibility</span>
                  <strong>{weather.visibility} km</strong>
                </div>
                <div className="weather-stat">
                  <span>Sunrise</span>
                  <strong>{formatTime(weather.sunrise, weather.timezone_offset)}</strong>
                </div>
                <div className="weather-stat">
                  <span>Sunset</span>
                  <strong>{formatTime(weather.sunset, weather.timezone_offset)}</strong>
                </div>
                <div className="weather-stat">
                  <span>UV Index</span>
                  <strong>{weather.uv_index}</strong>
                </div>
                <div className="weather-stat">
                  <span>Last updated</span>
                  <strong>{updatedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "—"}</strong>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
