import { useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import GaugeRing from '../GaugeRing.jsx';
import { formatCurrency, formatDate, formatOdometer } from '../../utils/format';
import './PartsList.css';

function groupByType(logs) {
  const groups = {};
  logs.forEach((log) => {
    if (!groups[log.partType]) groups[log.partType] = [];
    groups[log.partType].push(log);
  });
  Object.values(groups).forEach((arr) => arr.sort((a, b) => b.odometer - a.odometer));
  return groups;
}

export default function PartsList({ logs, currentOdometer }) {
  const [openType, setOpenType] = useState(null);

  if (!logs.length) {
    return <p className="timeline-empty">No part replacements logged yet.</p>;
  }

  const groups = groupByType(logs);

  return (
    <div className="parts-list">
      {Object.entries(groups).map(([type, entries]) => {
        const latest = entries[0];
        const isOpen = openType === type;

        let percentRemaining = null;
        if (latest.expectedLifeKm && currentOdometer) {
          const used = currentOdometer - latest.odometer;
          percentRemaining = Math.max(
            0,
            Math.min(100, 100 - (used / latest.expectedLifeKm) * 100)
          );
        }

        return (
          <div className="part-card" key={type}>
            <button className="part-card__head" onClick={() => setOpenType(isOpen ? null : type)}>
              <GaugeRing
                percent={percentRemaining ?? 100}
                size={48}
                stroke={5}
                color={
                  percentRemaining != null && percentRemaining < 15
                    ? 'var(--danger)'
                    : percentRemaining != null && percentRemaining < 35
                    ? 'var(--warning)'
                    : 'var(--accent)'
                }
              >
                <span className="part-card__gauge-text">
                  {percentRemaining != null ? `${Math.round(percentRemaining)}%` : '—'}
                </span>
              </GaugeRing>

              <div className="part-card__info">
                <p className="part-card__type">{type}</p>
                <p className="part-card__meta">
                  {latest.brand || 'Brand not set'} · installed {formatDate(latest.installDate)} at{' '}
                  {formatOdometer(latest.odometer)}
                </p>
              </div>

              <PiCaretDownBold className={isOpen ? 'is-open' : ''} />
            </button>

            {isOpen && (
              <div className="part-card__history">
                {entries.map((e) => (
                  <div className="part-card__history-row" key={e.id}>
                    <span>{formatDate(e.installDate)}</span>
                    <span>{formatOdometer(e.odometer)}</span>
                    <span>{e.brand || '—'}</span>
                    <span>{formatCurrency(e.price)}</span>
                    <span>{e.warrantyMonths ? `${e.warrantyMonths} mo warranty` : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
