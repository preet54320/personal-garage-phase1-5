import './LoadingScreen.css';

export default function LoadingScreen({ label = 'Warming up the engine…' }) {
  return (
    <div className="loading-screen">
      <div className="loading-ring" aria-hidden="true">
        <svg viewBox="0 0 60 60">
          <circle className="loading-ring__track" cx="30" cy="30" r="26" />
          <circle className="loading-ring__sweep" cx="30" cy="30" r="26" />
        </svg>
      </div>
      <p>{label}</p>
    </div>
  );
}
