import { useState } from 'react';
import { addDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import Modal from '../Modal.jsx';
import { useAuth } from '../../context/AuthContext';
import { subDoc, subCol, SUBCOLLECTIONS } from '../../firebase/paths';
import { applyVehicleRollup } from '../../lib/vehicleAggregates';
import '../../styles/forms.css';

export default function ReplaceTyreModal({ vehicleId, vehicle, position, existing, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    brand: '',
    model: '',
    installDate: new Date().toISOString().slice(0, 10),
    odometer: vehicle.currentOdometer || '',
    price: '',
    expectedLifeKm: 45000,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const odometer = Number(form.odometer);
    if (!form.brand.trim() || !odometer) {
      setError('Brand and odometer are required.');
      return;
    }

    setSaving(true);
    try {
      const price = Number(form.price) || 0;
      const docRef = subDoc(user.uid, vehicleId, SUBCOLLECTIONS.TYRES, position.id);
      const existingSnap = await getDoc(docRef);

      const newData = {
        position: position.id,
        positionLabel: position.label,
        positionOrder: position.order,
        brand: form.brand.trim(),
        model: form.model.trim(),
        installDate: form.installDate,
        odometer,
        price,
        expectedLifeKm: Number(form.expectedLifeKm) || null,
        rotationHistory: existingSnap.exists() ? existingSnap.data().rotationHistory || [] : [],
        alignmentHistory: existingSnap.exists() ? existingSnap.data().alignmentHistory || [] : [],
        replacementHistory: existingSnap.exists() ? existingSnap.data().replacementHistory || [] : [],
        updatedAt: serverTimestamp(),
      };

      if (existingSnap.exists() && existingSnap.data().brand) {
        const prev = existingSnap.data();
        newData.replacementHistory = [
          ...newData.replacementHistory,
          {
            brand: prev.brand,
            model: prev.model,
            installDate: prev.installDate,
            odometer: prev.odometer,
            price: prev.price,
            removedDate: form.installDate,
            removedOdometer: odometer,
          },
        ];
      }

      await setDoc(docRef, newData);

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'part',
        title: `Tyre replaced — ${position.label}`,
        date: form.installDate,
        cost: price,
        odometer,
        notes: `${form.brand}${form.model ? ' ' + form.model : ''}`,
        createdAt: serverTimestamp(),
      });

      await applyVehicleRollup(user.uid, vehicleId, vehicle, {
        increments: { totalExpenses: price, maintenanceCost: price },
        odometer,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the tyre record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`${existing ? 'Replace' : 'Install'} tyre — ${position.label}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Brand</label>
            <input value={form.brand} onChange={update('brand')} placeholder="Michelin" required />
          </div>
          <div className="field">
            <label>Model</label>
            <input value={form.model} onChange={update('model')} placeholder="Pilot Sport 4" />
          </div>

          <div className="field">
            <label>Install date</label>
            <input type="date" value={form.installDate} onChange={update('installDate')} required />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input type="number" value={form.odometer} onChange={update('odometer')} required />
          </div>

          <div className="field">
            <label>Price</label>
            <input type="number" value={form.price} onChange={update('price')} />
          </div>
          <div className="field">
            <label>Expected life (km)</label>
            <input type="number" value={form.expectedLifeKm} onChange={update('expectedLifeKm')} />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : existing ? 'Save replacement' : 'Install tyre'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
