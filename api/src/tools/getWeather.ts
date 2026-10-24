const getWeatherDescription = (code: number) => {
  if (code === 0) return "Clear sky";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";

  return "Unknown";
};

export const getWeather = async (destination: string, date: string) => {
  //getting the longitude and lattitude
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`,
  );

  const geoData = await geoResponse.json();
  if (!geoData.results || geoData.results.length === 0) {
    return null;
  }
  const latitude = geoData.results[0].latitude;
  const longitude = geoData.results[0].longitude;
  //getting actual weather conditions using latitude and longitude
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&start_date=${date}&end_date=${date}`,
  );
  const weatherData = await weatherResponse.json();

  if (weatherData.error) {
    return {
      date,
      available: false,
      message: "Weather forecast is not available for this date.",
    };
  }
  return {
    date: weatherData.daily.time[0],
    maxTemperature: weatherData.daily.temperature_2m_max[0],
    minTemperature: weatherData.daily.temperature_2m_min[0],
    precipitationProbability:
      weatherData.daily.precipitation_probability_max[0],
    condition: getWeatherDescription(weatherData.daily.weather_code[0]),
  };
};
