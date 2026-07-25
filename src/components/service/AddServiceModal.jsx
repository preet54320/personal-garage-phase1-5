import { useRef, useState } from 'react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { PiPaperclipFill, PiXBold } from 'react-icons/pi';
import Modal from '../Modal.jsx';
import { useAuth } from '../../context/AuthContext';
import { subCol, SUBCOLLECTIONS } from '../../firebase/paths';
import { storage } from '../../firebase/config';
import { applyVehicleRollup } from '../../lib/vehicleAggregates';
import { SERVICE_ITEMS } from './serviceItems';
import '../../styles/forms.css';
import './ServiceForm.css';

export default function AddServiceModal({ vehicleId, vehicle, onClose }) {
  const { user } = useAuth();
  const invoiceInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: vehicle.currentOdometer || '',
    garageName: '',
    mechanic: '',
    cost: '',
    notes: '',
    nextDueDate: '',
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItem, setCustomItem] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleItem = (item) => {
    setSelectedItems((items) =>
      items.includes(item) ? items.filter((i) => i !== item) : [...items, item]
    );
  };

  const addCustomItem = () => {
    const val = customItem.trim();
    if (val && !selectedItems.includes(val)) {
      setSelectedItems((items) => [...items, val]);
    }
    setCustomItem('');
  };

  const handlePhotosPick = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removePhoto = (idx) => setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));

  const uploadFile = async (file, category) => {
    const path = `users/${user.uid}/vehicles/${vehicleId}/${category}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const odometer = Number(form.odometer);
    const cost = Number(form.cost);
    if (!odometer || !form.garageName.trim()) {
      setError('Odometer and garage name are required.');
      return;
    }

    setSaving(true);
    try {
      let invoiceURL = '';
      if (invoiceFile) invoiceURL = await uploadFile(invoiceFile, 'documents');

      const photoURLs = [];
      for (const file of photoFiles) {
        photoURLs.push(await uploadFile(file, 'photos'));
      }

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.SERVICE), {
        date: form.date,
        odometer,
        garageName: form.garageName.trim(),
        mechanic: form.mechanic.trim(),
        cost: cost || 0,
        notes: form.notes.trim(),
        itemsChanged: selectedItems,
        invoiceURL,
        photoURLs,
        nextDueDate: form.nextDueDate || null,
        createdAt: serverTimestamp(),
      });

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'service',
        title: selectedItems.length
          ? `Service — ${selectedItems.slice(0, 3).join(', ')}${selectedItems.length > 3 ? '…' : ''}`
          : 'Service',
        date: form.date,
        cost: cost || 0,
        odometer,
        notes: form.notes.trim(),
        photoURLs,
        createdAt: serverTimestamp(),
      });

      await applyVehicleRollup(user.uid, vehicleId, vehicle, {
        increments: { totalExpenses: cost || 0, maintenanceCost: cost || 0 },
        odometer,
        lastServiceDate: form.date,
        nextDueService: form.nextDueDate || undefined,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the service log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Log a service" onClose={onClose} wide>
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
            <label>Garage name</label>
            <input value={form.garageName} onChange={update('garageName')} placeholder="Prestige Auto Care" required />
          </div>
          <div className="field">
            <label>Mechanic</label>
            <input value={form.mechanic} onChange={update('mechanic')} placeholder="Optional" />
          </div>

          <div className="field">
            <label>Cost</label>
            <input type="number" value={form.cost} onChange={update('cost')} />
          </div>
          <div className="field">
            <label>Next service due date</label>
            <input type="date" value={form.nextDueDate} onChange={update('nextDueDate')} />
          </div>

          <div className="field field--full">
            <label>Items changed</label>
            <div className="chip-grid">
              {SERVICE_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`chip${selectedItems.includes(item) ? ' is-active' : ''}`}
                  onClick={() => toggleItem(item)}
                >
                  {item}
                </button>
              ))}
              {selectedItems.filter((i) => !SERVICE_ITEMS.includes(i)).map((item) => (
                <button
                  type="button"
                  key={item}
                  className="chip is-active"
                  onClick={() => toggleItem(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="chip-add-row">
              <input
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                placeholder="Add a custom item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomItem();
                  }
                }}
              />
              <button type="button" onClick={addCustomItem}>Add</button>
            </div>
          </div>

          <div className="field field--full">
            <label>Invoice</label>
            <div className="file-row">
              <button type="button" className="file-pick-btn" onClick={() => invoiceInputRef.current?.click()}>
                <PiPaperclipFill /> {invoiceFile ? 'Change invoice' : 'Attach invoice'}
              </button>
              {invoiceFile && <span className="file-pill">{invoiceFile.name}</span>}
              <input
                ref={invoiceInputRef}
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="field field--full">
            <label>Photos</label>
            <div className="file-row">
              <button type="button" className="file-pick-btn" onClick={() => photosInputRef.current?.click()}>
                <PiPaperclipFill /> Add photos
              </button>
              {photoFiles.map((f, idx) => (
                <span className="file-pill" key={idx}>
                  {f.name}
                  <PiXBold style={{ cursor: 'pointer' }} onClick={() => removePhoto(idx)} />
                </span>
              ))}
              <input
                ref={photosInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePhotosPick}
              />
            </div>
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
            {saving ? 'Saving…' : 'Save service log'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
