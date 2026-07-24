import { useState } from 'react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import Modal from './Modal.jsx';
import { useAuth } from '../context/AuthContext';
import { subCol, SUBCOLLECTIONS } from '../firebase/paths';
import '../styles/forms.css';

export default function QuickNoteModal({ vehicleId, onClose }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError('');
    try {
      const date = new Date().toISOString().slice(0, 10);
      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.NOTES), {
        text: text.trim(),
        date,
        createdAt: serverTimestamp(),
      });
      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'note',
        title: 'Note added',
        notes: text.trim(),
        date,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Quick note" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field field--full">
          <label>What do you want to remember?</label>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Rattling noise from the front left near speed bumps"
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !text.trim()}>
            {saving ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
