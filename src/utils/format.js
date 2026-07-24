export function formatCurrency(value = 0) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatOdometer(value = 0) {
  const num = Number(value) || 0;
  return `${new Intl.NumberFormat('en-IN').format(num)} km`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function daysUntil(value) {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  const diffMs = date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
