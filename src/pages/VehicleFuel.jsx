import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSubcollection } from '../hooks/useSubcollection';
import StatTile from '../components/StatTile.jsx';
import FuelList from '../components/fuel/FuelList.jsx';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx';
import { computeFuelStats } from '../components/fuel/fuelStats';
import { formatCurrency } from '../utils/format';
import '../components/fuel/FuelList.css';

export default function VehicleFuel() {
  const { vehicleId } = useOutletContext();
  const { items: logs, loading } = useSubcollection(vehicleId, 'fuelLogs', {
    orderByField: 'odometer',
    direction: 'desc',
  });

  const stats = useMemo(() => computeFuelStats(logs), [logs]);

  if (loading) return <p className="timeline-empty">Loading fuel logs…</p>;

  return (
    <>
      <div className="vd-stats">
        <StatTile label="Lifetime fuel cost" value={formatCurrency(stats.lifetimeCost)} />
        <StatTile label="This month" value={formatCurrency(stats.monthlyCost)} />
        <StatTile label="Average mileage" value={stats.avgMileage ? `${stats.avgMileage} km/L` : '—'} />
        <StatTile label="Fuel cost per km" value={stats.costPerKm ? formatCurrency(stats.costPerKm) : '—'} />
      </div>

      <section className="vd-panel glass-panel">
        <h2>Monthly fuel cost</h2>
        <MonthlyBarChart data={stats.monthlyBreakdown} color="#c77b3d" />
      </section>

      <section className="vd-panel glass-panel">
        <h2>Fuel log</h2>
        <FuelList logs={logs} />
      </section>
    </>
  );
}
