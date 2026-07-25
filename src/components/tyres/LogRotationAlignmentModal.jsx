import { useState } from 'react';
import { addDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import Modal from '../Modal.jsx';
import { useAuth } from '../../context/AuthContext';
import { subDoc, subCol, SUBCOLLECTIONS } from '../../firebase/paths';
import { ROTATABLE_POSITIONS } from './tyrePositions';
import '../../styles/forms.css';
import '../service/ServiceForm.css';

export default function LogRotationAlignmentModal({ vehicleId, onClose }) {
  const { user } = useAuth();
  const [type, setType] = useState('rotation');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const historyField = type === 'rotation' ? 'rotationHistory' : 'alignmentHistory';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const odometer = Number(form.odometer);
    if (!odometer) {
      setError('Odometer is required.');
      return;
    }

    setSaving(true);
    try {
      const entry = { date: form.date, odometer, notes: form.notes.trim() };

      await Promise.all(
        ROTATABLE_POSITIONS.map(async (posId) => {
          const ref = subDoc(user.uid, vehicleId, SUBCOLLECTIONS.TYRES, posId);
          const snap = await getDoc(ref);
          if (!snap.exists()) return; // skip positions with no tyre installed yet
          const current = snap.data()[historyField] || [];
          await updateDoc(ref, { [historyField]: [...current, entry] });
        })
      );

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'part',
        title: type === 'rotation' ? 'Tyres rotated' : 'Wheel alignment done',
        date: form.date,
        odometer,
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Log rotation / alignment" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="chip-grid" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className={`chip${type === 'rotation' ? ' is-active' : ''}`}
            onClick={() => setType('rotation')}
          >
            Tyre rotation
          </button>
          <button
            type="button"
            className={`chip${type === 'alignment' ? ' is-active' : ''}`}
            onClick={() => setType('alignment')}
          >
            Wheel alignment
          </button>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={update('date')} required />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input type="number" value={form.odometer} onChange={update('odometer')} required />
          </div>
          <div className="field field--full">
            <label>Notes</label>
            <textarea value={form.notes} onChange={update('notes')} placeholder="Optional" />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
