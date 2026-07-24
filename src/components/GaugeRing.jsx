import './GaugeRing.css';

// A circular gauge, echoing an odometer/instrument-cluster dial.
// `percent` (0-100) fills the sweep; `size` in px.
export default function GaugeRing({ percent = 0, size = 84, stroke = 8, color = 'var(--accent)', children }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="gauge-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="gauge-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="gauge-ring__sweep"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-ring__content">{children}</div>
    </div>
  );
}
