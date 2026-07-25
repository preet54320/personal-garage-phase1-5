import { useState } from 'react';
import { useParams, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { PiArrowLeftBold, PiPencilSimpleFill, PiCarProfileFill } from 'react-icons/pi';
import { useGarage } from '../context/GarageContext';
import VehicleTabs from '../components/VehicleTabs.jsx';
import FabMenu from '../components/FabMenu.jsx';
import QuickNoteModal from '../components/QuickNoteModal.jsx';
import AddVehicleModal from '../components/AddVehicleModal.jsx';
import AddFuelModal from '../components/fuel/AddFuelModal.jsx';
import AddServiceModal from '../components/service/AddServiceModal.jsx';
import AddPartModal from '../components/parts/AddPartModal.jsx';
import AddExpenseModal from '../components/expenses/AddExpenseModal.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import './VehicleDashboard.css';

export default function VehicleLayout() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { vehicles, loading } = useGarage();
  const [activeAction, setActiveAction] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  if (loading) return <LoadingScreen label="Pulling up the service book…" />;
  if (!vehicle) return <Navigate to="/" replace />;

  return (
    <div className="vd-page">
      <button className="vd-back" onClick={() => navigate('/')}>
        <PiArrowLeftBold /> Garage
      </button>

      <div className="vd-hero glass-panel">
        <div className="vd-hero__photo">
          {vehicle.photoURL ? (
            <img src={vehicle.photoURL} alt={vehicle.nickname} />
          ) : (
            <PiCarProfileFill />
          )}
        </div>
        <div className="vd-hero__info">
          <div className="vd-hero__title-row">
            <h1>{vehicle.nickname}</h1>
            <button className="vd-edit-btn" onClick={() => setShowEdit(true)}>
              <PiPencilSimpleFill /> Edit
            </button>
          </div>
          <p className="vd-hero__sub">
            {[vehicle.year, vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(' · ')}
          </p>
          <div className="vd-hero__chips">
            <span>{vehicle.registrationNumber || 'No reg. number'}</span>
            <span>{vehicle.fuelType}</span>
            <span>{vehicle.color || 'Color not set'}</span>
          </div>
        </div>
      </div>

      <VehicleTabs />

      <Outlet context={{ vehicle, vehicleId }} />

      <FabMenu onSelect={setActiveAction} />

      {activeAction === 'note' && (
        <QuickNoteModal vehicleId={vehicleId} onClose={() => setActiveAction(null)} />
      )}
      {activeAction === 'fuel' && (
        <AddFuelModal vehicleId={vehicleId} vehicle={vehicle} onClose={() => setActiveAction(null)} />
      )}
      {activeAction === 'service' && (
        <AddServiceModal vehicleId={vehicleId} vehicle={vehicle} onClose={() => setActiveAction(null)} />
      )}
      {activeAction === 'part' && (
        <AddPartModal vehicleId={vehicleId} vehicle={vehicle} onClose={() => setActiveAction(null)} />
      )}
      {activeAction === 'expense' && (
        <AddExpenseModal vehicleId={vehicleId} vehicle={vehicle} onClose={() => setActiveAction(null)} />
      )}
      {showEdit && (
        <AddVehicleModal existingVehicle={vehicle} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
