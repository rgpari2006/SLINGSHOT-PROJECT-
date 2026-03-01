import { createMetricCard } from '../components/card.js';

export function renderCards({ healthScore, lastRevenue, growthPct }) {
  const container = document.getElementById('metric-cards');
  container.innerHTML = '';

  container.append(
    createMetricCard('Startup Health Score', healthScore, '/100'),
    createMetricCard('Current Revenue', `$${lastRevenue.toLocaleString()}`),
    createMetricCard('Revenue Growth', growthPct.toFixed(1), '%')
  );
}

export function createBotReply(userMessage, healthScore) {
  const normalized = userMessage.toLowerCase();

  if (normalized.includes('drop') || normalized.includes('risk')) {
    return 'Sales may drop next month if churn continues. Improve onboarding and retention campaigns.';
  }

  if (normalized.includes('marketing') || normalized.includes('growth')) {
    return 'Increase marketing budget in your best CAC channels and run weekly ROI reviews.';
  }

  if (healthScore < 60) {
    return 'Your health score is low. Prioritize burn-rate reduction and recurring revenue experiments.';
  }

  return 'Momentum is positive. Double down on customer success and upsell opportunities this quarter.';
}
