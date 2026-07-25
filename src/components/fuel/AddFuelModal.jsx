import { useEffect, useState } from 'react';
import { addDoc, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import Modal from '../Modal.jsx';
import { useAuth } from '../../context/AuthContext';
import { subCol, SUBCOLLECTIONS } from '../../firebase/paths';
import { applyVehicleRollup } from '../../lib/vehicleAggregates';
import '../../styles/forms.css';

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];

export default function AddFuelModal({ vehicleId, vehicle, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: vehicle.currentOdometer || '',
    quantity: '',
    pricePerLiter: '',
    totalAmount: '',
    petrolPump: '',
    fuelType: vehicle.fuelType || 'Petrol',
    notes: '',
  });
  const [autoTotal, setAutoTotal] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Keep total amount in sync with quantity x price unless the user edits it directly
  useEffect(() => {
    if (!autoTotal) return;
    const qty = Number(form.quantity);
    const price = Number(form.pricePerLiter);
    if (qty && price) {
      setForm((f) => ({ ...f, totalAmount: String(Math.round(qty * price * 100) / 100) }));
    }
  }, [form.quantity, form.pricePerLiter, autoTotal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const odometer = Number(form.odometer);
    const quantity = Number(form.quantity);
    const totalAmount = Number(form.totalAmount);

    if (!odometer || !quantity || !totalAmount) {
      setError('Odometer, quantity, and total amount are required.');
      return;
    }

    setSaving(true);
    try {
      // Find the previous fill (by odometer) to compute mileage for this tank
      const prevQuery = query(
        subCol(user.uid, vehicleId, SUBCOLLECTIONS.FUEL),
        where('odometer', '<', odometer),
        orderBy('odometer', 'desc'),
        limit(1)
      );
      const prevSnap = await getDocs(prevQuery);
      let mileage = null;
      if (!prevSnap.empty) {
        const prev = prevSnap.docs[0].data();
        const distance = odometer - prev.odometer;
        if (distance > 0 && quantity > 0) {
          mileage = Math.round((distance / quantity) * 100) / 100;
        }
      }

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.FUEL), {
        date: form.date,
        odometer,
        quantity,
        pricePerLiter: Number(form.pricePerLiter) || 0,
        totalAmount,
        petrolPump: form.petrolPump.trim(),
        fuelType: form.fuelType,
        notes: form.notes.trim(),
        mileage,
        createdAt: serverTimestamp(),
      });

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'fuel',
        title: `Fuel filled — ${quantity} L`,
        date: form.date,
        cost: totalAmount,
        odometer,
        notes: mileage ? `${mileage} km/L since last fill` : form.notes.trim(),
        createdAt: serverTimestamp(),
      });

      await applyVehicleRollup(user.uid, vehicleId, vehicle, {
        increments: { totalExpenses: totalAmount, fuelCost: totalAmount },
        odometer,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the fuel log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Log fuel" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={update('date')} required />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input type="number" value={form.odometer} onChange={update('odometer')} required />
          </div>

          <div className="field">
            <label>Fuel quantity (L)</label>
            <input type="number" step="0.01" value={form.quantity} onChange={update('quantity')} required />
          </div>
          <div className="field">
            <label>Price per liter</label>
            <input type="number" step="0.01" value={form.pricePerLiter} onChange={update('pricePerLiter')} />
          </div>

          <div className="field">
            <label>Total amount</label>
            <input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(e) => {
                setAutoTotal(false);
                update('totalAmount')(e);
              }}
              required
            />
          </div>
          <div className="field">
            <label>Fuel type</label>
            <select value={form.fuelType} onChange={update('fuelType')}>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="field field--full">
            <label>Petrol pump</label>
            <input value={form.petrolPump} onChange={update('petrolPump')} placeholder="Shell, Ring Road" />
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
            {saving ? 'Saving…' : 'Save fuel log'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
