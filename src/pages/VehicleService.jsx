import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSubcollection } from '../hooks/useSubcollection';
import StatTile from '../components/StatTile.jsx';
import ServiceList from '../components/service/ServiceList.jsx';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx';
import { formatCurrency, formatDate } from '../utils/format';

export default function VehicleService() {
  const { vehicleId } = useOutletContext();
  const { items: logs, loading } = useSubcollection(vehicleId, 'serviceLogs', {
    orderByField: 'date',
    direction: 'desc',
  });

  const { lifetimeCost, monthlyBreakdown } = useMemo(() => {
    const lifetime = logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);
    const buckets = {};
    logs.forEach((l) => {
      const d = new Date(l.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + (Number(l.cost) || 0);
    });
    const breakdown = Object.entries(buckets).sort(([a], [b]) => (a > b ? 1 : -1)).slice(-6);
    return { lifetimeCost: lifetime, monthlyBreakdown: breakdown };
  }, [logs]);

  if (loading) return <p className="timeline-empty">Loading service history…</p>;

  return (
    <>
      <div className="vd-stats">
        <StatTile label="Lifetime maintenance cost" value={formatCurrency(lifetimeCost)} />
        <StatTile label="Total services" value={logs.length} />
        <StatTile
          label="Last service"
          value={logs[0] ? formatDate(logs[0].date) : '—'}
        />
      </div>

      <section className="vd-panel glass-panel">
        <h2>Monthly maintenance cost</h2>
        <MonthlyBarChart data={monthlyBreakdown} color="#7fa8ff" />
      </section>

      <section className="vd-panel glass-panel">
        <h2>Service history</h2>
        <ServiceList logs={logs} />
      </section>
    </>
  );
}
