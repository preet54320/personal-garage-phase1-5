import { NavLink } from 'react-router-dom';
import { PiEngineFill, PiGaugeFill, PiFileTextFill, PiMagnifyingGlassFill } from 'react-icons/pi';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Garage', icon: PiGaugeFill, end: true },
  { to: '/reports', label: 'Reports', icon: PiFileTextFill },
  { to: '/search', label: 'Search', icon: PiMagnifyingGlassFill },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <PiEngineFill />
        <span>Garage</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footnote">Every car, its own story.</div>
    </aside>
  );
}
