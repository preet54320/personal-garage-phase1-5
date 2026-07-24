import { useState, useRef, useEffect } from 'react';
import { PiSignOutBold } from 'react-icons/pi';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div />
      <div className="topbar-user" ref={menuRef}>
        <button className="topbar-avatar-btn" onClick={() => setOpen((o) => !o)}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Account'} />
          ) : (
            <span className="topbar-avatar-fallback">
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </span>
          )}
        </button>

        {open && (
          <div className="topbar-menu glass-panel">
            <p className="topbar-menu-name">{user?.displayName}</p>
            <p className="topbar-menu-email">{user?.email}</p>
            <button className="topbar-menu-signout" onClick={logout}>
              <PiSignOutBold /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
