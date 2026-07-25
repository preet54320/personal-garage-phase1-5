import { useRef, useState } from 'react';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { PiPaperclipFill } from 'react-icons/pi';
import Modal from '../Modal.jsx';
import { useAuth } from '../../context/AuthContext';
import { subCol, SUBCOLLECTIONS } from '../../firebase/paths';
import { storage } from '../../firebase/config';
import { applyVehicleRollup } from '../../lib/vehicleAggregates';
import { EXPENSE_CATEGORIES, CATEGORY_ROLLUP_FIELD } from './expenseCategories';
import '../../styles/forms.css';
import '../service/ServiceForm.css';

export default function AddExpenseModal({ vehicleId, vehicle, onClose }) {
  const { user } = useAuth();
  const invoiceInputRef = useRef(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    description: '',
  });
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = Number(form.amount);
    if (!amount) {
      setError('Enter an amount.');
      return;
    }

    setSaving(true);
    try {
      let invoiceURL = '';
      if (invoiceFile) {
        const path = `users/${user.uid}/vehicles/${vehicleId}/documents/${Date.now()}-${invoiceFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, invoiceFile);
        invoiceURL = await getDownloadURL(storageRef);
      }

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.EXPENSE), {
        date: form.date,
        category: form.category,
        amount,
        description: form.description.trim(),
        invoiceURL,
        createdAt: serverTimestamp(),
      });

      await addDoc(subCol(user.uid, vehicleId, SUBCOLLECTIONS.TIMELINE), {
        type: 'note',
        title: `${form.category} expense`,
        date: form.date,
        cost: amount,
        notes: form.description.trim(),
        createdAt: serverTimestamp(),
      });

      const increments = { totalExpenses: amount };
      const rollupField = CATEGORY_ROLLUP_FIELD[form.category];
      if (rollupField) increments[rollupField] = amount;

      await applyVehicleRollup(user.uid, vehicleId, vehicle, { increments });

      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Log an expense" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={update('date')} required />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={update('category')}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="field field--full">
            <label>Amount</label>
            <input type="number" value={form.amount} onChange={update('amount')} required />
          </div>

          <div className="field field--full">
            <label>Description</label>
            <input value={form.description} onChange={update('description')} placeholder="What was this for?" />
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
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
