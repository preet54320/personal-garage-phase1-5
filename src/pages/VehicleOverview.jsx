import { useOutletContext } from 'react-router-dom';
import { useSubcollection } from '../hooks/useSubcollection';
import StatTile from '../components/StatTile.jsx';
import TimelineList from '../components/timeline/TimelineList.jsx';
import { formatCurrency, formatOdometer, formatDate, daysUntil } from '../utils/format';

export default function VehicleOverview() {
  const { vehicle, vehicleId } = useOutletContext();
  const { items: timeline, loading: timelineLoading } = useSubcollection(vehicleId, 'timeline', {
    limitTo: 8,
  });

  const overdue = vehicle.nextDueService && daysUntil(vehicle.nextDueService) < 0;

  return (
    <>
      <div className="vd-stats">
        <StatTile label="Current odometer" value={formatOdometer(vehicle.currentOdometer)} />
        <StatTile label="Total money spent" value={formatCurrency(vehicle.totalExpenses)} />
        <StatTile label="Fuel cost" value={formatCurrency(vehicle.fuelCost || 0)} />
        <StatTile label="Maintenance cost" value={formatCurrency(vehicle.maintenanceCost || 0)} />
        <StatTile label="Insurance cost" value={formatCurrency(vehicle.insuranceCost || 0)} />
        <StatTile
          label="Cost per km"
          value={
            vehicle.currentOdometer
              ? formatCurrency((vehicle.totalExpenses || 0) / vehicle.currentOdometer)
              : '—'
          }
        />
        <StatTile label="Last service" value={formatDate(vehicle.lastServiceDate)} />
        <StatTile
          label="Next due service"
          value={vehicle.nextDueService ? formatDate(vehicle.nextDueService) : 'Not set'}
          tone={overdue ? 'danger' : 'default'}
          sub={overdue ? 'Overdue' : undefined}
        />
      </div>

      <section className="vd-panel glass-panel">
        <h2>Recent timeline</h2>
        {timelineLoading ? (
          <p className="timeline-empty">Loading…</p>
        ) : (
          <TimelineList items={timeline} />
        )}
      </section>
    </>
  );
}
