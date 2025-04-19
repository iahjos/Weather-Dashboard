// 🔸 Background color based on weather
function getCardColor(weatherType) {
  switch (weatherType) {
    case "Clear": return "#ffeeba"; // sunny
    case "Clouds": return "#d3d3d3"; // cloudy
    case "Rain":
    case "Drizzle": return "#a0c4ff"; // rainy
    case "Thunderstorm": return "#adb5bd"; // stormy
    case "Snow": return "#f8f9fa"; // snowy
    case "Mist":
    case "Fog": return "#e0e0e0"; // hazy
    default: return "#f0f8ff"; // default
  }
}

// 🔸 Vanta background update
let vantaEffect;

function updateVantaBackground(weatherType) {
  if (vantaEffect) vantaEffect.destroy();

  // Constant: Soft white-ish cloud color
  const cloudColor = 0xadc1de;
  const cloudShadowColor = 0x183550;
  const sunColor = 0xffd700;
  const sunlightColor = 0xffe066;

  // Sky tones for different conditions
  let skyColor = 0xb0d4f1; // default: sunny sky blue

  switch (weatherType.toLowerCase()) {
    case "clear":
      skyColor = 0xaee2ff; // pastel sky blue
      break;
    case "clouds":
      skyColor = 0x9db1c6; // muted blue-gray
      break;
    case "rain":
    case "drizzle":
    case "thunderstorm":
      skyColor = 0x6a7a89; // slate blue-gray
      break;
    case "snow":
      skyColor = 0xd8f3f9; // icy blue-white
      break;
    case "mist":
    case "fog":
      skyColor = 0xcbd5e1; // soft grayish-blue
      break;
  }

  vantaEffect = VANTA.CLOUDS({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    skyColor,
    cloudColor,
    cloudShadowColor,
    sunColor,
    sunlightColor
  });
}


async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  const apiKey = 'bfa724aacba196ccab08c8ee74e3a4a8';

  if (!city) {
    alert('Please enter a city name.');
    return;
  }

  const weatherContainer = document.getElementById("weatherContainer");
  const weatherResult = document.getElementById("weatherResult");
  weatherResult.innerHTML = `<p>Loading weather...</p>`;

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") {
      weatherResult.innerHTML = `<p>City not found.</p>`;
      return;
    }

    const cityName = data.city.name;
    const country = data.city.country;
    const today = new Date();
    const formattedDate = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;

    const forecastsByDay = {};
    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      const day = date.toDateString();
      if (!forecastsByDay[day]) {
        forecastsByDay[day] = [];
      }
      forecastsByDay[day].push(entry);
    });

    const days = Object.keys(forecastsByDay);

    let output = `
      <h2>${cityName}, ${country}</h2>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <hr />
      <h3>5-Day Forecast</h3>
      <div class="forecast-grid">
    `;

    for (let i = 0; i < Math.min(5, days.length); i++) {
      const entries = forecastsByDay[days[i]];
      const midday = entries.find(e => e.dt_txt.includes("12:00:00")) || entries[0];

      const date = new Date(midday.dt * 1000);
      const dayName = date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
      const temp = Math.round(midday.main.temp);
      const weather = midday.weather[0].main;
      updateVantaBackground(weather);
      const icon = midday.weather[0].icon;
      const wind = Math.round(midday.wind.speed);
      const humidity = midday.main.humidity;
      const bgColor = getCardColor(weather);

      output += `
        <div class="forecast-card" style="background-color: ${bgColor}">
          <p><strong>${dayName}</strong></p>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weather}" />
          <p>${temp}°F</p>
          <p>${weather}</p>
          <p><strong>Wind:</strong> ${wind} mph</p>
          <p><strong>Humidity:</strong> ${humidity}%</p>
        </div>
      `;
    }

    output += `</div>`;
    weatherResult.innerHTML = output;
    weatherContainer.classList.add("visible");

  } catch (error) {
    console.error('Error:', error);
    weatherResult.innerHTML = `<p>Error fetching weather.</p>`;
  }

  
}

// 🔁 Allow pressing Enter to trigger search
document.getElementById('cityInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    getWeather();
  }
});
