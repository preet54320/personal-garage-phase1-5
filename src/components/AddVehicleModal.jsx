import { useRef, useState } from 'react';
import { addDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { PiCameraFill } from 'react-icons/pi';
import Modal from './Modal.jsx';
import { useAuth } from '../context/AuthContext';
import { vehiclesCol, vehicleDoc, subCol, SUBCOLLECTIONS } from '../firebase/paths';
import { storage } from '../firebase/config';
import '../styles/forms.css';

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

const emptyForm = {
  nickname: '',
  brand: '',
  model: '',
  variant: '',
  year: '',
  registrationNumber: '',
  purchaseDate: '',
  purchasePrice: '',
  currentOdometer: '',
  fuelType: 'Petrol',
  color: '',
  notes: '',
};

export default function AddVehicleModal({ onClose, existingVehicle }) {
  const { user } = useAuth();
  const isEdit = Boolean(existingVehicle);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          ...emptyForm,
          ...existingVehicle,
          purchaseDate: existingVehicle.purchaseDate?.toDate
            ? existingVehicle.purchaseDate.toDate().toISOString().slice(0, 10)
            : existingVehicle.purchaseDate || '',
        }
      : emptyForm
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(existingVehicle?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nickname.trim()) {
      setError('Give the car a nickname so you can find it fast.');
      return;
    }

    setSaving(true);
    try {
      let vehicleRef;
      if (isEdit) {
        vehicleRef = vehicleDoc(user.uid, existingVehicle.id);
      }

      const payload = {
        nickname: form.nickname.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        variant: form.variant.trim(),
        year: form.year ? Number(form.year) : null,
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        purchaseDate: form.purchaseDate || null,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : 0,
        currentOdometer: form.currentOdometer ? Number(form.currentOdometer) : 0,
        fuelType: form.fuelType,
        color: form.color.trim(),
        notes: form.notes.trim(),
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(vehicleRef, payload);
      } else {
        payload.createdAt = serverTimestamp();
        payload.totalExpenses = 0;
        payload.lastServiceDate = null;
        payload.nextDueService = null;
        vehicleRef = await addDoc(vehiclesCol(user.uid), payload);

        // Auto-create the first timeline entry
        await addDoc(subCol(user.uid, vehicleRef.id, SUBCOLLECTIONS.TIMELINE), {
          type: 'purchase',
          title: 'Car purchased',
          date: form.purchaseDate || new Date().toISOString().slice(0, 10),
          notes: `Bought for ${form.purchasePrice || 'an unrecorded amount'}`,
          createdAt: serverTimestamp(),
        });
      }

      if (photoFile) {
        const path = `users/${user.uid}/vehicles/${vehicleRef.id}/vehiclePhoto/${Date.now()}-${photoFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, photoFile);
        const url = await getDownloadURL(storageRef);
        await setDoc(vehicleRef, { photoURL: url }, { merge: true });
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the vehicle. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit vehicle' : 'Add a vehicle'} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div
          className="photo-drop"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Vehicle preview" />
          ) : (
            <span className="photo-drop__placeholder">
              <PiCameraFill />
            </span>
          )}
          <span className="photo-drop__text">
            {photoPreview ? 'Change display photo' : 'Add a display photo'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoPick}
          />
        </div>

        <div className="form-grid" style={{ marginTop: 20 }}>
          <div className="field field--full">
            <label>Nickname</label>
            <input value={form.nickname} onChange={update('nickname')} placeholder="My Mercedes" required />
          </div>

          <div className="field">
            <label>Brand</label>
            <input value={form.brand} onChange={update('brand')} placeholder="Mercedes-Benz" />
          </div>
          <div className="field">
            <label>Model</label>
            <input value={form.model} onChange={update('model')} placeholder="C-Class" />
          </div>

          <div className="field">
            <label>Variant</label>
            <input value={form.variant} onChange={update('variant')} placeholder="C300 AMG Line" />
          </div>
          <div className="field">
            <label>Year</label>
            <input type="number" value={form.year} onChange={update('year')} placeholder="2022" />
          </div>

          <div className="field">
            <label>Registration number</label>
            <input value={form.registrationNumber} onChange={update('registrationNumber')} placeholder="KA 01 AB 1234" />
          </div>
          <div className="field">
            <label>Color</label>
            <input value={form.color} onChange={update('color')} placeholder="Obsidian Black" />
          </div>

          <div className="field">
            <label>Purchase date</label>
            <input type="date" value={form.purchaseDate} onChange={update('purchaseDate')} />
          </div>
          <div className="field">
            <label>Purchase price</label>
            <input type="number" value={form.purchasePrice} onChange={update('purchasePrice')} placeholder="4500000" />
          </div>

          <div className="field">
            <label>Current odometer (km)</label>
            <input type="number" value={form.currentOdometer} onChange={update('currentOdometer')} placeholder="18500" />
          </div>
          <div className="field">
            <label>Fuel type</label>
            <select value={form.fuelType} onChange={update('fuelType')}>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="field field--full">
            <label>Notes</label>
            <textarea value={form.notes} onChange={update('notes')} placeholder="Anything worth remembering about this car" />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to garage'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
