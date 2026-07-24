import { useState } from 'react';
import {
  PiCarProfileFill,
  PiWrenchFill,
  PiGasPumpFill,
  PiTireFill,
  PiFileTextFill,
  PiNoteFill,
  PiBellFill,
  PiImageFill,
  PiCaretDownBold,
} from 'react-icons/pi';
import { formatDate } from '../../utils/format';
import './Timeline.css';

const ICONS = {
  purchase: PiCarProfileFill,
  service: PiWrenchFill,
  fuel: PiGasPumpFill,
  part: PiTireFill,
  document: PiFileTextFill,
  note: PiNoteFill,
  reminder: PiBellFill,
  photo: PiImageFill,
};

export default function TimelineList({ items, emptyLabel = 'Nothing logged yet.' }) {
  const [openId, setOpenId] = useState(null);

  if (!items.length) {
    return <p className="timeline-empty">{emptyLabel}</p>;
  }

  return (
    <ol className="timeline">
      {items.map((item) => {
        const Icon = ICONS[item.type] || PiNoteFill;
        const isOpen = openId === item.id;
        return (
          <li key={item.id} className="timeline-item">
            <div className="timeline-item__rail">
              <span className="timeline-item__icon">
                <Icon />
              </span>
              <span className="timeline-item__line" />
            </div>

            <button
              className="timeline-item__body"
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <div className="timeline-item__head">
                <div>
                  <p className="timeline-item__title">{item.title}</p>
                  <p className="timeline-item__date">{formatDate(item.date)}</p>
                </div>
                <PiCaretDownBold className={`timeline-item__chevron${isOpen ? ' is-open' : ''}`} />
              </div>

              {isOpen && (
                <div className="timeline-item__detail">
                  {item.notes && <p>{item.notes}</p>}
                  {item.cost != null && <p>Cost: ₹{item.cost}</p>}
                  {item.odometer != null && <p>Odometer: {item.odometer} km</p>}
                  {item.photoURLs?.length > 0 && (
                    <div className="timeline-item__photos">
                      {item.photoURLs.map((url) => (
                        <img key={url} src={url} alt="Timeline attachment" />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
