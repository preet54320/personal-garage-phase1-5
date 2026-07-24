import { useNavigate } from 'react-router-dom';
import { PiCarProfileFill } from 'react-icons/pi';
import GaugeRing from './GaugeRing.jsx';
import { formatCurrency, formatOdometer, formatDate, daysUntil } from '../utils/format';
import './VehicleCard.css';

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  const overdue = vehicle.nextDueService && daysUntil(vehicle.nextDueService) < 0;
  const dueSoon =
    vehicle.nextDueService &&
    !overdue &&
    daysUntil(vehicle.nextDueService) <= 14;

  return (
    <button className="vehicle-card glass-panel" onClick={() => navigate(`/vehicle/${vehicle.id}`)}>
      <div className="vehicle-card__photo">
        {vehicle.photoURL ? (
          <img src={vehicle.photoURL} alt={vehicle.nickname} />
        ) : (
          <PiCarProfileFill className="vehicle-card__photo-fallback" />
        )}
        {(overdue || dueSoon) && (
          <span className={`vehicle-card__badge ${overdue ? 'is-overdue' : 'is-soon'}`}>
            {overdue ? 'Service overdue' : 'Service due soon'}
          </span>
        )}
      </div>

      <div className="vehicle-card__body">
        <div className="vehicle-card__heading">
          <h3>{vehicle.nickname}</h3>
          <p>{[vehicle.year, vehicle.brand, vehicle.model].filter(Boolean).join(' · ')}</p>
        </div>

        <div className="vehicle-card__stats">
          <GaugeRing percent={vehicle._odometerPercent ?? 60} size={64} stroke={6}>
            <span className="vehicle-card__gauge-label">
              <strong className="mono-num">{formatOdometer(vehicle.currentOdometer)}</strong>
            </span>
          </GaugeRing>

          <div className="vehicle-card__facts">
            <div className="fact">
              <span>Reg. No.</span>
              <strong>{vehicle.registrationNumber || '—'}</strong>
            </div>
            <div className="fact">
              <span>Last service</span>
              <strong>{formatDate(vehicle.lastServiceDate)}</strong>
            </div>
            <div className="fact">
              <span>Total spent</span>
              <strong>{formatCurrency(vehicle.totalExpenses)}</strong>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
