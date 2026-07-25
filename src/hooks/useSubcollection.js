import { useEffect, useState } from 'react';
import { onSnapshot, orderBy, query, limit as fbLimit } from 'firebase/firestore';
import { subCol } from '../firebase/paths';
import { useAuth } from '../context/AuthContext';

/**
 * Subscribes in real time to a vehicle's subcollection (fuelLogs, serviceLogs,
 * expenseLogs, timeline, notes, reminders, etc.)
 *
 * @param {string} vehicleId
 * @param {string} subcollection - one of SUBCOLLECTIONS values
 * @param {object} options - { orderByField, direction, limitTo }
 */
export function useSubcollection(vehicleId, subcollection, options = {}) {
  const { user } = useAuth();
  const { orderByField = 'date', direction = 'desc', limitTo } = options;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !vehicleId) return;
    setLoading(true);

    const constraints = [];
    if (orderByField) constraints.push(orderBy(orderByField, direction));
    if (limitTo) constraints.push(fbLimit(limitTo));

    const q = query(subCol(user.uid, vehicleId, subcollection), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [user, vehicleId, subcollection, orderByField, direction, limitTo]);

  return { items, loading };
}
