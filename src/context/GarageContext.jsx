import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { vehiclesCol } from '../firebase/paths';

const GarageContext = createContext(null);

export function GarageProvider({ children }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(vehiclesCol(user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [user]);

  const getVehicle = (id) => vehicles.find((v) => v.id === id);

  const value = useMemo(
    () => ({ vehicles, loading, getVehicle }),
    [vehicles, loading]
  );

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
}

export function useGarage() {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useGarage must be used within a GarageProvider');
  return ctx;
}
