export function createMetricCard(title, value, suffix = '') {
  const wrapper = document.createElement('article');
  wrapper.className = 'card';

  const h3 = document.createElement('h3');
  h3.textContent = title;

  const p = document.createElement('p');
  p.textContent = `${value}${suffix}`;

  wrapper.append(h3, p);
  return wrapper;
}
