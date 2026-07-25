import { useState } from 'react';
import { PiCaretDownBold, PiTireFill } from 'react-icons/pi';
import GaugeRing from '../GaugeRing.jsx';
import { formatCurrency, formatDate, formatOdometer } from '../../utils/format';
import './TyreCard.css';

export default function TyreCard({ position, data, currentOdometer, onReplace }) {
  const [open, setOpen] = useState(false);
  const installed = Boolean(data?.brand);

  let percentRemaining = null;
  if (installed && data.expectedLifeKm && currentOdometer) {
    const used = currentOdometer - data.odometer;
    percentRemaining = Math.max(0, Math.min(100, 100 - (used / data.expectedLifeKm) * 100));
  }

  return (
    <div className="tyre-card glass-panel">
      <div className="tyre-card__top">
        <span className="tyre-card__position">{position.label}</span>
        <button className="tyre-card__replace" onClick={onReplace}>
          {installed ? 'Replace' : 'Install'}
        </button>
      </div>

      <div className="tyre-card__body">
        <GaugeRing
          percent={percentRemaining ?? (installed ? 100 : 0)}
          size={72}
          stroke={6}
          color={
            percentRemaining != null && percentRemaining < 15
              ? 'var(--danger)'
              : percentRemaining != null && percentRemaining < 35
              ? 'var(--warning)'
              : 'var(--accent)'
          }
        >
          {installed ? (
            <span className="tyre-card__gauge-text">
              {percentRemaining != null ? `${Math.round(percentRemaining)}%` : '—'}
            </span>
          ) : (
            <PiTireFill className="tyre-card__empty-icon" />
          )}
        </GaugeRing>

        <div className="tyre-card__info">
          {installed ? (
            <>
              <p className="tyre-card__brand">{data.brand} {data.model}</p>
              <p className="tyre-card__meta">
                Installed {formatDate(data.installDate)} · {formatOdometer(data.odometer)}
              </p>
            </>
          ) : (
            <p className="tyre-card__meta">No tyre logged for this position yet.</p>
          )}
        </div>
      </div>

      {installed && (data.rotationHistory?.length > 0 || data.alignmentHistory?.length > 0 || data.replacementHistory?.length > 0) && (
        <>
          <button className="tyre-card__toggle" onClick={() => setOpen((o) => !o)}>
            History <PiCaretDownBold className={open ? 'is-open' : ''} />
          </button>
          {open && (
            <div className="tyre-card__history">
              {data.replacementHistory?.length > 0 && (
                <div>
                  <p className="tyre-card__history-label">Previous tyres</p>
                  {data.replacementHistory.map((r, i) => (
                    <p key={i} className="tyre-card__history-row">
                      {r.brand} {r.model} — {formatDate(r.installDate)} to {formatDate(r.removedDate)}
                      {r.price ? ` · ${formatCurrency(r.price)}` : ''}
                    </p>
                  ))}
                </div>
              )}
              {data.rotationHistory?.length > 0 && (
                <div>
                  <p className="tyre-card__history-label">Rotations</p>
                  {data.rotationHistory.map((r, i) => (
                    <p key={i} className="tyre-card__history-row">
                      {formatDate(r.date)} · {formatOdometer(r.odometer)}
                    </p>
                  ))}
                </div>
              )}
              {data.alignmentHistory?.length > 0 && (
                <div>
                  <p className="tyre-card__history-label">Alignments</p>
                  {data.alignmentHistory.map((r, i) => (
                    <p key={i} className="tyre-card__history-row">
                      {formatDate(r.date)} · {formatOdometer(r.odometer)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
