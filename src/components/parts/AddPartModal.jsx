import { useState } from 'react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import Modal from '../Modal.jsx';
import { useAuth } from '../../context/AuthContext';
import { subCol, SUBCOLLECTIONS } from '../../firebase/paths';
import { applyVehicleRollup } from '../../lib/vehicleAggregates';
import { PART_TYPES } from './partTypes';
import '../../styles/forms.css';

export default function AddPartModal({ vehicleId, vehicle, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    partType: PART_TYPES[0].name,
    customType: '',
    installDate: new Date().toISOString().slice(0, 10),
    odometer: vehicle.currentOdometer || '',
    brand: '',
    price: '',
    warrantyMonths: '',
    expectedLifeKm: PART_TYPES[0].defaultLifeKm || '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (e) => {
    const value = e.target.value;
    const preset = PART_TYPES.find((p) => p.name === value);
    setForm((f) => ({
      ...f,
      partType: value,
      expectedLifeKm: preset?.defaultLifeKm || f.expectedLifeKm,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const partType = form.partType === '__custom' ? form.customType.trim() : form.partType;
    const odometer = Number(form.odometer);

    if (!partType || !odometer) {
      setError('Part type and odometer are required.');
      return;
    }

    setSaving(true);
    try {
      const price = Number(form.price) || 0;
      const expectedLifeKm = Number(form.expectedLifeKm) || null;
      const replacementOdometer = expectedLifeKm ? odometer + expectedLifeKm : null;

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.PARTS), {
        partType,
        installDate: form.installDate,
        odometer,
        brand: form.brand.trim(),
        price,
        warrantyMonths: Number(form.warrantyMonths) || 0,
        expectedLifeKm,
        replacementOdometer,
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
      });

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'part',
        title: `${partType} replaced`,
        date: form.installDate,
        cost: price,
        odometer,
        notes: form.brand ? `${form.brand}${form.notes ? ' — ' + form.notes : ''}` : form.notes,
        createdAt: serverTimestamp(),
      });

      await applyVehicleRollup(user.uid, vehicleId, vehicle, {
        increments: { totalExpenses: price, maintenanceCost: price },
        odometer,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the part record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Log a part change" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field field--full">
            <label>Part</label>
            <select value={form.partType} onChange={handleTypeChange}>
              {PART_TYPES.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
              <option value="__custom">Custom…</option>
            </select>
          </div>

          {form.partType === '__custom' && (
            <div className="field field--full">
              <label>Custom part name</label>
              <input value={form.customType} onChange={update('customType')} placeholder="e.g. Timing Belt" required />
            </div>
          )}

          <div className="field">
            <label>Install date</label>
            <input type="date" value={form.installDate} onChange={update('installDate')} required />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input type="number" value={form.odometer} onChange={update('odometer')} required />
          </div>

          <div className="field">
            <label>Brand</label>
            <input value={form.brand} onChange={update('brand')} placeholder="Bosch, Exide…" />
          </div>
          <div className="field">
            <label>Price</label>
            <input type="number" value={form.price} onChange={update('price')} />
          </div>

          <div className="field">
            <label>Warranty (months)</label>
            <input type="number" value={form.warrantyMonths} onChange={update('warrantyMonths')} />
          </div>
          <div className="field">
            <label>Expected life (km)</label>
            <input type="number" value={form.expectedLifeKm} onChange={update('expectedLifeKm')} />
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
            {saving ? 'Saving…' : 'Save part record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
