import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { PiEngineFill } from 'react-icons/pi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, loading, loginWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) return <Navigate to="/" replace />;

  const handleLogin = async () => {
    setError('');
    setSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Sign-in did not go through. Try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-panel">
        <div className="login-mark">
          <PiEngineFill />
        </div>
        <h1>Garage</h1>
        <p className="login-sub">Your cars. Their whole story. One private log.</p>

        <button className="google-btn" onClick={handleLogin} disabled={signingIn}>
          <FcGoogle size={20} />
          {signingIn ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && <p className="login-error">{error}</p>}

        <p className="login-footnote">
          Only you can see your garage. Every vehicle, log, and document stays tied to your account.
        </p>
      </div>
    </div>
  );
}
