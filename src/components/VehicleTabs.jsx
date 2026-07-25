import { NavLink } from 'react-router-dom';
import './VehicleTabs.css';

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'fuel', label: 'Fuel' },
  { to: 'service', label: 'Service' },
  { to: 'parts', label: 'Parts' },
  { to: 'expenses', label: 'Expenses' },
  { to: 'documents', label: 'Documents' },
  { to: 'photos', label: 'Photos' },
  { to: 'reminders', label: 'Reminders' },
];

export default function VehicleTabs() {
  return (
    <nav className="vehicle-tabs">
      {TABS.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `vehicle-tab${isActive ? ' active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
