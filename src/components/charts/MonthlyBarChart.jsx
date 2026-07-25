import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// data: array of [ 'YYYY-MM', totalValue ]
export default function MonthlyBarChart({ data, color = '#c77b3d', height = 200 }) {
  const { labels, values } = useMemo(() => {
    return {
      labels: data.map(([key]) => {
        const [year, month] = key.split('-');
        return `${MONTH_LABELS[Number(month) - 1]} '${year.slice(2)}`;
      }),
      values: data.map(([, v]) => Math.round(v)),
    };
  }, [data]);

  if (!data.length) {
    return <p className="chart-empty">Not enough data yet to chart.</p>;
  }

  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: color,
              borderRadius: 6,
              maxBarThickness: 34,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8a8f98', font: { family: 'Inter', size: 11 } },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#8a8f98', font: { family: 'Inter', size: 11 } },
            },
          },
        }}
      />
    </div>
  );
}
