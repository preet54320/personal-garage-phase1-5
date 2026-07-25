import { formatCurrency, formatDate, formatOdometer } from '../../utils/format';
import './FuelList.css';

export default function FuelList({ logs }) {
  if (!logs.length) {
    return <p className="timeline-empty">No fuel fills logged yet.</p>;
  }

  return (
    <div className="fuel-list">
      <div className="fuel-list__head">
        <span>Date</span>
        <span>Odometer</span>
        <span>Qty</span>
        <span>Mileage</span>
        <span>Amount</span>
        <span>Pump</span>
      </div>
      {logs.map((log) => (
        <div className="fuel-list__row" key={log.id}>
          <span>{formatDate(log.date)}</span>
          <span>{formatOdometer(log.odometer)}</span>
          <span>{log.quantity} L</span>
          <span>{log.mileage != null ? `${log.mileage} km/L` : '—'}</span>
          <span>{formatCurrency(log.totalAmount)}</span>
          <span className="fuel-list__pump">{log.petrolPump || '—'}</span>
        </div>
      ))}
    </div>
  );
}
