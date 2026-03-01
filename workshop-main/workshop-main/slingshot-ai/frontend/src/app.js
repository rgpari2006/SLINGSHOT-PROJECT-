import { fetchData, fetchHealthScore, predictSales } from '../services/api.js';
import { createBotReply, renderCards } from '../pages/dashboard.js';

const DEMO_USER = 'demo@slingshot.ai';
const DEMO_PASS = 'slingshot123';
const AUTH_KEY = 'slingshot_auth';

let revenueChart;
let healthScoreValue = 0;
let uploadedCsvText = null;

function drawChart(history, forecast = []) {
  const ctx = document.getElementById('revenueChart');
  const labels = [...history.map((d) => d.month), ...forecast.map((d) => d.month)];

  const revenueValues = history.map((d) => d.revenue);
  const forecastValues = [
    ...Array(history.length - 1).fill(null),
    history[history.length - 1]?.revenue || null,
    ...forecast.map((d) => d.predicted_revenue),
  ];

  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: [...revenueValues, ...Array(forecast.length).fill(null)],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.2)',
          fill: true,
          tension: 0.25,
        },
        {
          label: 'Forecast',
          data: forecastValues,
          borderColor: '#22c55e',
          borderDash: [6, 6],
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        y: { ticks: { color: '#e2e8f0' } },
        x: { ticks: { color: '#e2e8f0' } },
      },
    },
  });
}

function addChatMessage(text, role = 'bot') {
  const chatWindow = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = `${role === 'user' ? 'You' : 'AI'}: ${text}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showDashboard(isAuthenticated) {
  document.getElementById('auth-view').classList.toggle('hidden', isAuthenticated);
  document.getElementById('dashboard-view').classList.toggle('hidden', !isAuthenticated);
}

async function bootstrapDashboard() {
  try {
    const [history, health] = await Promise.all([fetchData(), fetchHealthScore()]);
    healthScoreValue = health.score;

    const firstRevenue = history[0]?.revenue || 0;
    const lastRevenue = history[history.length - 1]?.revenue || 0;
    const growthPct = firstRevenue ? ((lastRevenue - firstRevenue) / firstRevenue) * 100 : 0;

    renderCards({ healthScore: health.score, lastRevenue, growthPct });
    drawChart(history);

    addChatMessage('Welcome back! Ask me about your startup growth strategy.');
  } catch (error) {
    addChatMessage(`Error loading dashboard: ${error.message}`);
  }
}

async function handlePredict() {
  try {
    const history = await fetchData();
    const result = await predictSales(3, uploadedCsvText);
    drawChart(history, result.predictions);
    addChatMessage('Forecast generated. I projected the next 3 months of revenue.');
  } catch (error) {
    addChatMessage(`Prediction failed: ${error.message}`);
  }
}

function setupDashboardEvents() {
  document.getElementById('predict-btn').addEventListener('click', handlePredict);

  document.getElementById('csv-upload').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadedCsvText = await file.text();
    addChatMessage(`Uploaded ${file.name}. Click Predict to use this dataset.`);
  });

  document.getElementById('chat-send').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    addChatMessage(createBotReply(message, healthScoreValue));
    input.value = '';
  });

  document.getElementById('signout-btn').addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  });
}

function setupAuth() {
  const form = document.getElementById('signin-form');
  const errorEl = document.getElementById('signin-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    if (email === DEMO_USER && password === DEMO_PASS) {
      localStorage.setItem(AUTH_KEY, 'true');
      showDashboard(true);
      bootstrapDashboard();
      return;
    }

    errorEl.textContent = 'Invalid credentials. Use the demo login shown below.';
  });
}

function init() {
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
  showDashboard(isAuthenticated);
  setupAuth();
  setupDashboardEvents();

  if (isAuthenticated) {
    bootstrapDashboard();
  }
}

init();
