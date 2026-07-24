import { useState } from 'react';
import {
  PiPlusBold,
  PiGasPumpFill,
  PiReceiptFill,
  PiWrenchFill,
  PiTireFill,
  PiFileTextFill,
  PiImageFill,
  PiBellFill,
  PiNoteFill,
} from 'react-icons/pi';
import './FabMenu.css';

const ACTIONS = [
  { key: 'fuel', label: 'Fuel', icon: PiGasPumpFill, ready: false },
  { key: 'expense', label: 'Expense', icon: PiReceiptFill, ready: false },
  { key: 'service', label: 'Service', icon: PiWrenchFill, ready: false },
  { key: 'part', label: 'Part changed', icon: PiTireFill, ready: false },
  { key: 'document', label: 'Document', icon: PiFileTextFill, ready: false },
  { key: 'photo', label: 'Photo', icon: PiImageFill, ready: false },
  { key: 'reminder', label: 'Reminder', icon: PiBellFill, ready: false },
  { key: 'note', label: 'Note', icon: PiNoteFill, ready: true },
];

export default function FabMenu({ onSelect }) {
  const [open, setOpen] = useState(false);

  const handlePick = (action) => {
    setOpen(false);
    onSelect(action.key);
  };

  return (
    <div className="fab-wrap">
      {open && (
        <div className="fab-menu glass-panel">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              className="fab-menu__item"
              onClick={() => handlePick(action)}
              disabled={!action.ready}
            >
              <action.icon />
              <span>{action.label}</span>
              {!action.ready && <span className="fab-menu__soon">soon</span>}
            </button>
          ))}
        </div>
      )}
      <button
        className={`fab-btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Quick add"
      >
        <PiPlusBold />
      </button>
    </div>
  );
}
