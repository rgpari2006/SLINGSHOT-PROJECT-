const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const projectTitle = document.getElementById("projectTitle");
const citySelect = document.getElementById("citySelect");
const citySummary = document.getElementById("citySummary");
const weatherTitle = document.getElementById("weatherTitle");

const metricCards = document.getElementById("metricCards");
const forecastCards = document.getElementById("forecastCards");
const cropAdvisoryList = document.getElementById("cropAdvisoryList");
const weatherAdvisory = document.getElementById("weatherAdvisory");
const mandiTableBody = document.getElementById("mandiTableBody");
const priceChart = document.getElementById("priceChart");
const schemeList = document.getElementById("schemeList");
const notificationList = document.getElementById("notificationList");

const languageLabels = {
  en: "Smart Farming Advisory System – Indian Version",
  hi: "स्मार्ट फार्मिंग सलाह प्रणाली – भारतीय संस्करण",
  ta: "ஸ்மார்ட் பண்ணை ஆலோசனை அமைப்பு – இந்திய பதிப்பு"
};

const cityProfiles = {
  Chennai: {
    climate: "Coastal tropical",
    season: "Northeast monsoon sensitive",
    baseTemp: [30, 37],
    rainfall: [2, 30],
    humidity: [68, 90],
    rainProbability: [20, 75],
    keyCrops: "Paddy, Groundnut, Sugarcane"
  },
  Mumbai: {
    climate: "Coastal humid",
    season: "High monsoon rainfall",
    baseTemp: [28, 34],
    rainfall: [5, 80],
    humidity: [70, 92],
    rainProbability: [25, 85],
    keyCrops: "Rice, Pulses, Vegetables"
  },
  Delhi: {
    climate: "Semi-arid continental",
    season: "Hot summer / cool winter",
    baseTemp: [24, 42],
    rainfall: [0, 25],
    humidity: [35, 70],
    rainProbability: [8, 55],
    keyCrops: "Wheat, Mustard, Bajra"
  },
  Bengaluru: {
    climate: "Moderate plateau",
    season: "Bimodal rainfall",
    baseTemp: [21, 31],
    rainfall: [4, 35],
    humidity: [50, 80],
    rainProbability: [15, 65],
    keyCrops: "Ragi, Vegetables, Flowers"
  },
  Hyderabad: {
    climate: "Semi-arid tropical",
    season: "Monsoon dependent",
    baseTemp: [26, 38],
    rainfall: [2, 40],
    humidity: [42, 78],
    rainProbability: [10, 70],
    keyCrops: "Cotton, Maize, Red gram"
  },
  Kolkata: {
    climate: "Humid subtropical",
    season: "Rain-intensive kharif",
    baseTemp: [27, 36],
    rainfall: [8, 55],
    humidity: [64, 90],
    rainProbability: [18, 82],
    keyCrops: "Paddy, Jute, Vegetables"
  },
  Pune: {
    climate: "Tropical wet and dry",
    season: "Moderate monsoon",
    baseTemp: [23, 34],
    rainfall: [2, 35],
    humidity: [42, 80],
    rainProbability: [12, 70],
    keyCrops: "Sugarcane, Soybean, Onion"
  }
};

const schemes = [
  "PM-Kisan Samman Nidhi",
  "Pradhan Mantri Fasal Bima Yojana (Crop Insurance)",
  "Soil Health Card Scheme",
  "Micro-Irrigation Subsidy Programs"
];

const mandiPrices = [
  { crop: "Rice", price: 2850, trend: "⬆️ +1.9%" },
  { crop: "Wheat", price: 2430, trend: "⬆️ +0.7%" },
  { crop: "Tomato", price: 1980, trend: "⬇️ -2.4%" },
  { crop: "Onion", price: 2260, trend: "⬆️ +1.3%" }
];

function randomInRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function cityBasedFarmData(cityName) {
  const profile = cityProfiles[cityName];
  return {
    city: cityName,
    climate: profile.climate,
    season: profile.season,
    keyCrops: profile.keyCrops,
    temperature: randomInRange(profile.baseTemp[0], profile.baseTemp[1]),
    rainfall: randomInRange(profile.rainfall[0], profile.rainfall[1]),
    humidity: randomInRange(profile.humidity[0], profile.humidity[1]),
    rainProbability: randomInRange(profile.rainProbability[0], profile.rainProbability[1]),
    soilMoisture: randomInRange(28, 82),
    cropHealth: randomInRange(58, 98)
  };
}

function getCropSuggestion(data) {
  if (data.city === "Chennai" && data.rainProbability > 55) return "Paddy (short-duration variety)";
  if (data.temperature > 35 && data.rainfall < 12) return "Millets / Pulses";
  if (data.rainfall > 40) return "Paddy (Rice)";
  return "Vegetables + pulses mix";
}

function generateForecast(data) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return labels.map((day, idx) => ({
    day,
    temp: data.temperature + (idx % 2 === 0 ? 1 : -1),
    rain: Math.max(5, Math.min(95, data.rainProbability + (idx - 2) * 4))
  }));
}

function updateDashboard(data) {
  citySummary.textContent = `${data.city}: ${data.climate} climate • ${data.season} • Major crops: ${data.keyCrops}`;
  weatherTitle.textContent = `Weather Advisory (${data.city})`;

  const metrics = [
    { title: "🌡️ Temperature", value: `${data.temperature}°C` },
    { title: "🌧️ Rainfall", value: `${data.rainfall} mm` },
    { title: "💧 Soil Moisture", value: `${data.soilMoisture}%` },
    { title: "🌿 Crop Health", value: `${data.cropHealth}%` }
  ];

  metricCards.innerHTML = metrics
    .map(
      (item) => `
      <article class="metric-card">
        <div class="metric-title">${item.title}</div>
        <div class="metric-value">${item.value}</div>
      </article>
    `
    )
    .join("");

  const bestCrop = getCropSuggestion(data);
  const irrigation = data.soilMoisture < 40 ? "Irrigate field in next 8-12 hours" : "Irrigation can be delayed by 1 day";
  const fertilizer = data.cropHealth < 70 ? "Apply balanced NPK + micronutrients as per soil test" : "Maintain current fertilizer schedule";
  const pestAlert = data.humidity > 78 ? "High humidity: monitor fungal disease and stem borer" : "Low-to-moderate pest pressure";

  cropAdvisoryList.innerHTML = `
    <li><strong>Best crop for current season:</strong> ${bestCrop}</li>
    <li><strong>Irrigation schedule:</strong> ${irrigation}</li>
    <li><strong>Fertilizer recommendation:</strong> ${fertilizer}</li>
    <li><strong>Pest alert:</strong> ${pestAlert}</li>
  `;

  weatherAdvisory.innerHTML = `
    <div class="weather-item"><strong>Temperature</strong><br />${data.temperature}°C</div>
    <div class="weather-item"><strong>Rain Probability</strong><br />${data.rainProbability}%</div>
    <div class="weather-item"><strong>Humidity</strong><br />${data.humidity}%</div>
    <div class="weather-item"><strong>Rainfall</strong><br />${data.rainfall} mm</div>
  `;

  const alerts = [];
  if (data.rainProbability > 72) alerts.push(`⚠️ ${data.city}: Heavy rainfall warning. Keep drainage channels clear.`);
  if (data.humidity > 82) alerts.push("🪲 Pest outbreak risk is high. Inspect crop leaves today.");
  if (data.soilMoisture < 35) alerts.push("🚰 Irrigation reminder: soil moisture is low.");
  if (data.temperature > 36) alerts.push("🌡️ Heat stress risk: prefer early morning irrigation.");
  if (!alerts.length) alerts.push("✅ No critical alerts. Continue regular monitoring.");

  notificationList.innerHTML = alerts.map((alert) => `<li>${alert}</li>`).join("");

  forecastCards.innerHTML = generateForecast(data)
    .map(
      (item) => `
      <article class="forecast-card">
        <div class="day">${item.day}</div>
        <div><strong>${item.temp}°C</strong></div>
        <div>🌧️ ${item.rain}%</div>
      </article>
    `
    )
    .join("");
}

function renderMandiData() {
  mandiTableBody.innerHTML = mandiPrices
    .map(
      (item) => `
      <tr>
        <td>${item.crop}</td>
        <td>₹${item.price}</td>
        <td>${item.trend}</td>
      </tr>
    `
    )
    .join("");

  const max = Math.max(...mandiPrices.map((item) => item.price));
  priceChart.innerHTML = mandiPrices
    .map((item) => {
      const widthPercent = Math.round((item.price / max) * 100);
      return `
        <div class="chart-row">
          <strong>${item.crop}</strong>
          <div class="chart-bar"><div class="bar-fill" style="width:${widthPercent}%"></div></div>
          <span>₹${item.price}</span>
        </div>
      `;
    })
    .join("");
}

function renderSchemes() {
  schemeList.innerHTML = schemes.map((scheme) => `<li>${scheme}</li>`).join("");
}

function populateCities() {
  citySelect.innerHTML = Object.keys(cityProfiles)
    .map((city) => `<option value="${city}">${city}</option>`)
    .join("");
  citySelect.value = "Chennai";
}

function refreshForSelectedCity() {
  const city = citySelect.value || "Chennai";
  updateDashboard(cityBasedFarmData(city));
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const language = document.getElementById("languageSelect").value;
  projectTitle.textContent = languageLabels[language];

  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  populateCities();
  renderMandiData();
  renderSchemes();
  refreshForSelectedCity();
});

citySelect.addEventListener("change", refreshForSelectedCity);

setInterval(() => {
  if (!dashboardSection.classList.contains("hidden")) refreshForSelectedCity();
}, 12000);
