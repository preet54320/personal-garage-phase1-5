export function computeFuelStats(logs = []) {
  if (!logs.length) {
    return {
      lifetimeCost: 0,
      avgMileage: null,
      monthlyCost: 0,
      costPerKm: null,
      monthlyBreakdown: [],
    };
  }

  const lifetimeCost = logs.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);

  const mileageEntries = logs.filter((l) => l.mileage != null);
  const avgMileage = mileageEntries.length
    ? Math.round(
        (mileageEntries.reduce((sum, l) => sum + l.mileage, 0) / mileageEntries.length) * 100
      ) / 100
    : null;

  const now = new Date();
  const thisMonthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyCost = thisMonthLogs.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);

  const totalQuantity = logs.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const costPerKm = avgMileage && avgMileage > 0
    ? Math.round((lifetimeCost / (avgMileage * totalQuantity)) * 100) / 100
    : null;

  // Group by YYYY-MM for the chart, oldest to newest, last 6 months
  const buckets = {};
  logs.forEach((l) => {
    const d = new Date(l.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = (buckets[key] || 0) + (Number(l.totalAmount) || 0);
  });
  const monthlyBreakdown = Object.entries(buckets)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-6);

  return { lifetimeCost, avgMileage, monthlyCost, costPerKm, monthlyBreakdown };
}
