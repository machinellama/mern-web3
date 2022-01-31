export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '';

  const output = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

  if (!output) return '';

  return output;
};

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '-';

  const output = new Intl.NumberFormat('en', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);

  if (!output) return '';

  return output;
};

export function formatNumber(value) {
  if (value == null || isNaN(value)) return '-';

  const output = new Intl.NumberFormat('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  if (!output) return '';

  return output;
};
