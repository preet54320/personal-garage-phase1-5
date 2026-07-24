import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PiArrowLeftBold, PiPencilSimpleFill, PiCarProfileFill } from 'react-icons/pi';
import { useGarage } from '../context/GarageContext';
import { useSubcollection } from '../hooks/useSubcollection';
import StatTile from '../components/StatTile.jsx';
import TimelineList from '../components/timeline/TimelineList.jsx';
import FabMenu from '../components/FabMenu.jsx';
import QuickNoteModal from '../components/QuickNoteModal.jsx';
import AddVehicleModal from '../components/AddVehicleModal.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { formatCurrency, formatOdometer, formatDate, daysUntil } from '../utils/format';
import './VehicleDashboard.css';

export default function VehicleDashboard() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { vehicles, loading } = useGarage();
  const [activeAction, setActiveAction] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const { items: timeline, loading: timelineLoading } = useSubcollection(
    vehicleId,
    'timeline',
    { limitTo: 8 }
  );

  if (loading) return <LoadingScreen label="Pulling up the service book…" />;
  if (!vehicle) return <Navigate to="/" replace />;

  const overdue = vehicle.nextDueService && daysUntil(vehicle.nextDueService) < 0;

  return (
    <div className="vd-page">
      <button className="vd-back" onClick={() => navigate('/')}>
        <PiArrowLeftBold /> Garage
      </button>

      <div className="vd-hero glass-panel">
        <div className="vd-hero__photo">
          {vehicle.photoURL ? (
            <img src={vehicle.photoURL} alt={vehicle.nickname} />
          ) : (
            <PiCarProfileFill />
          )}
        </div>
        <div className="vd-hero__info">
          <div className="vd-hero__title-row">
            <h1>{vehicle.nickname}</h1>
            <button className="vd-edit-btn" onClick={() => setShowEdit(true)}>
              <PiPencilSimpleFill /> Edit
            </button>
          </div>
          <p className="vd-hero__sub">
            {[vehicle.year, vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(' · ')}
          </p>
          <div className="vd-hero__chips">
            <span>{vehicle.registrationNumber || 'No reg. number'}</span>
            <span>{vehicle.fuelType}</span>
            <span>{vehicle.color || 'Color not set'}</span>
          </div>
        </div>
      </div>

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

      <div className="vd-columns">
        <section className="vd-panel glass-panel">
          <h2>Recent timeline</h2>
          {timelineLoading ? (
            <p className="timeline-empty">Loading…</p>
          ) : (
            <TimelineList items={timeline} />
          )}
        </section>

        <section className="vd-panel glass-panel">
          <h2>Expense chart</h2>
          <p className="vd-coming-soon">
            Fuel, service, and expense logging land in the next build phase —
            this chart will populate automatically once you start logging entries.
          </p>
        </section>
      </div>

      <FabMenu onSelect={setActiveAction} />

      {activeAction === 'note' && (
        <QuickNoteModal vehicleId={vehicleId} onClose={() => setActiveAction(null)} />
      )}
      {showEdit && (
        <AddVehicleModal existingVehicle={vehicle} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
