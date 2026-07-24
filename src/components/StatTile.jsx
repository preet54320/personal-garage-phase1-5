import './StatTile.css';

export default function StatTile({ label, value, sub, tone = 'default' }) {
  return (
    <div className={`stat-tile glass-panel tone-${tone}`}>
      <span className="stat-tile__label">{label}</span>
      <strong className="stat-tile__value mono-num">{value}</strong>
      {sub && <span className="stat-tile__sub">{sub}</span>}
    </div>
  );
}
