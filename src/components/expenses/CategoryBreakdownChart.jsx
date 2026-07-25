import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORY_COLORS } from './expenseCategories';
import { formatCurrency } from '../../utils/format';

ChartJS.register(ArcElement, Tooltip);

export default function CategoryBreakdownChart({ expenses, height = 220 }) {
  const { labels, values, colors, total } = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + (Number(e.amount) || 0);
    });
    const entries = Object.entries(totals).sort(([, a], [, b]) => b - a);
    return {
      labels: entries.map(([cat]) => cat),
      values: entries.map(([, v]) => v),
      colors: entries.map(([cat]) => CATEGORY_COLORS[cat] || '#8a8f98'),
      total: entries.reduce((sum, [, v]) => sum + v, 0),
    };
  }, [expenses]);

  if (!labels.length) {
    return <p className="chart-empty">No expenses logged yet.</p>;
  }

  return (
    <div className="category-breakdown">
      <div style={{ height, width: height }}>
        <Doughnut
          data={{
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: { legend: { display: false } },
          }}
        />
      </div>
      <div className="category-breakdown__legend">
        {labels.map((label, i) => (
          <div className="category-breakdown__legend-row" key={label}>
            <span className="category-breakdown__dot" style={{ background: colors[i] }} />
            <span className="category-breakdown__label">{label}</span>
            <span className="category-breakdown__value">{formatCurrency(values[i])}</span>
            <span className="category-breakdown__pct">
              {total ? Math.round((values[i] / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
