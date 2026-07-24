import { useState } from 'react';
import { PiPlusBold, PiCarProfileFill } from 'react-icons/pi';
import { useGarage } from '../context/GarageContext';
import VehicleCard from '../components/VehicleCard.jsx';
import AddVehicleModal from '../components/AddVehicleModal.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import './Garage.css';

export default function Garage() {
  const { vehicles, loading } = useGarage();
  const [showAdd, setShowAdd] = useState(false);

  if (loading) return <LoadingScreen label="Opening the garage…" />;

  return (
    <div className="garage-page">
      <div className="garage-header">
        <div>
          <h1>Your garage</h1>
          <p>{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} logged</p>
        </div>
        <button className="btn btn-primary garage-add-btn" onClick={() => setShowAdd(true)}>
          <PiPlusBold /> Add vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="garage-empty glass-panel">
          <PiCarProfileFill />
          <h3>No cars yet</h3>
          <p>Add your first vehicle to start its service book.</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <PiPlusBold /> Add your first vehicle
          </button>
        </div>
      ) : (
        <div className="garage-grid">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
