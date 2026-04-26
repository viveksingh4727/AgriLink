import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const weatherIcons = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const weatherDesc = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Moderate showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Hailstorm", 99: "Severe hailstorm",
};

const getCropAdvice = (code, temp) => {
  if (code >= 61 && code <= 82) return "Heavy rain expected. Secure harvests and avoid spraying pesticides. Cover seedlings if possible.";
  if (code >= 95) return "⚠️ Storms ahead! Move livestock indoors and protect young crops. Avoid field work.";
  if (code >= 45 && code <= 55) return "Fog and drizzle expected. Good time for light irrigation. Watch for fungal diseases.";
  if (temp > 38) return "Extreme heat! Irrigate in the early morning and evening. Mulch to retain soil moisture.";
  if (temp < 10) return "Cold conditions. Protect frost-sensitive crops. Consider covering with plastic sheets.";
  if (code <= 3 && temp >= 20 && temp <= 35) return "Perfect farming weather! Great conditions for planting, harvesting, and field work.";
  return "Moderate conditions. Regular crop maintenance advised. Monitor soil moisture levels.";
};

const stateCoordinates = {
  "Maharashtra": { lat: 19.07, lon: 72.87 },
  "Punjab": { lat: 30.73, lon: 76.78 },
  "Karnataka": { lat: 12.97, lon: 77.59 },
  "Tamil Nadu": { lat: 13.08, lon: 80.27 },
  "Uttar Pradesh": { lat: 26.85, lon: 80.91 },
  "Rajasthan": { lat: 26.92, lon: 75.78 },
  "Gujarat": { lat: 23.02, lon: 72.57 },
  "Madhya Pradesh": { lat: 23.26, lon: 77.41 },
  "default": { lat: 20.59, lon: 78.96 },
};

const WeatherDashboard = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(user?.location?.state || "Maharashtra");

  const fetchWeather = async (state) => {
    setLoading(true);
    const coords = stateCoordinates[state] || stateCoordinates.default;
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&current_weather=true&timezone=Asia%2FKolkata`
      );
      const data = await res.json();
      setWeather(data);
    } catch (_e) {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const current = weather?.current_weather;
  const daily = weather?.daily;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 px-8 py-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200 font-bold">🌤️ Weather & Crop Advisory</p>
          <h1 className="mt-2 text-3xl font-bold">Farm Weather Dashboard</h1>
          <p className="mt-2 text-blue-100 max-w-2xl text-sm">
            Real-time weather data and crop advisories to help you plan your farming activities.
          </p>
        </div>

        {/* Location Selector */}
        <div className="relative z-10 mt-6">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2.5 text-sm font-medium outline-none"
          >
            {Object.keys(stateCoordinates).filter(s => s !== "default").map((state) => (
              <option key={state} value={state} className="text-surface-900">{state}</option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="spinner h-10 w-10" />
            <p className="text-sm text-surface-400">Fetching weather data...</p>
          </div>
        </div>
      ) : !weather ? (
        <div className="card-shell text-center py-12">
          <div className="text-5xl mb-4">🌧️</div>
          <h3 className="text-xl font-bold text-surface-900">Unable to load weather</h3>
          <p className="mt-2 text-surface-500">Please check your connection and try again.</p>
        </div>
      ) : (
        <>
          {/* Current Weather */}
          {current && (
            <section className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr] stagger-children">
              <div className="card-shell md:col-span-2 flex items-center gap-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <div className="text-7xl">{weatherIcons[current.weathercode] || "🌡️"}</div>
                <div>
                  <p className="text-4xl font-bold text-surface-900">{current.temperature}°C</p>
                  <p className="text-sm text-surface-500 font-medium">{weatherDesc[current.weathercode] || "Unknown"}</p>
                  <p className="text-xs text-surface-400 mt-1">📍 {location}</p>
                </div>
              </div>
              <div className="stat-card bg-amber-50">
                <div className="stat-icon bg-amber-100">💨</div>
                <div>
                  <p className="text-xs font-medium text-surface-500">Wind Speed</p>
                  <p className="text-xl font-bold text-surface-900">{current.windspeed} km/h</p>
                </div>
              </div>
              <div className="stat-card bg-purple-50">
                <div className="stat-icon bg-purple-100">🧭</div>
                <div>
                  <p className="text-xs font-medium text-surface-500">Wind Direction</p>
                  <p className="text-xl font-bold text-surface-900">{current.winddirection}°</p>
                </div>
              </div>
            </section>
          )}

          {/* Crop Advisory */}
          {current && (
            <section className="card-shell border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-brand-100/30">
              <h3 className="section-title text-lg mb-2">🌾 Crop Advisory</h3>
              <p className="text-sm text-surface-700 leading-relaxed">
                {getCropAdvice(current.weathercode, current.temperature)}
              </p>
            </section>
          )}

          {/* 7-Day Forecast */}
          {daily && (
            <section className="card-shell">
              <h3 className="section-title text-lg mb-4">📅 7-Day Forecast</h3>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-7 stagger-children">
                {daily.time.map((date, i) => {
                  const d = new Date(date);
                  const isToday = i === 0;
                  return (
                    <div
                      key={date}
                      className={`rounded-xl p-4 text-center transition-all hover:shadow-md ${
                        isToday
                          ? "bg-gradient-to-b from-blue-100 to-blue-50 border-2 border-blue-300"
                          : "bg-surface-50 border border-surface-200 hover:border-surface-300"
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-blue-600" : "text-surface-400"}`}>
                        {isToday ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}
                      </p>
                      <div className="text-3xl my-2">{weatherIcons[daily.weathercode[i]] || "🌡️"}</div>
                      <p className="text-sm font-bold text-surface-900">{Math.round(daily.temperature_2m_max[i])}°</p>
                      <p className="text-xs text-surface-400">{Math.round(daily.temperature_2m_min[i])}°</p>
                      {daily.precipitation_sum[i] > 0 && (
                        <p className="text-[10px] text-blue-500 font-semibold mt-1">
                          💧 {daily.precipitation_sum[i]}mm
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;
