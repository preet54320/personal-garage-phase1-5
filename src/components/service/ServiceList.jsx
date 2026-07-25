import { useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import { formatCurrency, formatDate, formatOdometer } from '../../utils/format';
import './ServiceList.css';

export default function ServiceList({ logs }) {
  const [openId, setOpenId] = useState(null);

  if (!logs.length) {
    return <p className="timeline-empty">No service records yet.</p>;
  }

  return (
    <div className="service-list">
      {logs.map((log) => {
        const isOpen = openId === log.id;
        return (
          <div className="service-card" key={log.id}>
            <button className="service-card__head" onClick={() => setOpenId(isOpen ? null : log.id)}>
              <div>
                <p className="service-card__garage">{log.garageName}</p>
                <p className="service-card__meta">
                  {formatDate(log.date)} · {formatOdometer(log.odometer)}
                </p>
              </div>
              <div className="service-card__right">
                <strong>{formatCurrency(log.cost)}</strong>
                <PiCaretDownBold className={isOpen ? 'is-open' : ''} />
              </div>
            </button>

            {isOpen && (
              <div className="service-card__detail">
                {log.mechanic && <p><strong>Mechanic:</strong> {log.mechanic}</p>}
                {log.itemsChanged?.length > 0 && (
                  <div className="service-card__items">
                    {log.itemsChanged.map((item) => (
                      <span key={item} className="service-card__item-chip">{item}</span>
                    ))}
                  </div>
                )}
                {log.notes && <p>{log.notes}</p>}
                {log.invoiceURL && (
                  <a href={log.invoiceURL} target="_blank" rel="noreferrer" className="service-card__link">
                    View invoice
                  </a>
                )}
                {log.photoURLs?.length > 0 && (
                  <div className="service-card__photos">
                    {log.photoURLs.map((url) => (
                      <img key={url} src={url} alt="Service" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
