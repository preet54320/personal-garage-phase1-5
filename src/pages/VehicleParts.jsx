import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PiPlusBold } from 'react-icons/pi';
import { useSubcollection } from '../hooks/useSubcollection';
import PartsList from '../components/parts/PartsList.jsx';
import AddPartModal from '../components/parts/AddPartModal.jsx';
import TyreCard from '../components/tyres/TyreCard.jsx';
import ReplaceTyreModal from '../components/tyres/ReplaceTyreModal.jsx';
import LogRotationAlignmentModal from '../components/tyres/LogRotationAlignmentModal.jsx';
import { TYRE_POSITIONS } from '../components/tyres/tyrePositions';

export default function VehicleParts() {
  const { vehicle, vehicleId } = useOutletContext();
  const [showAddPart, setShowAddPart] = useState(false);
  const [replacingPosition, setReplacingPosition] = useState(null);
  const [showTyreLog, setShowTyreLog] = useState(false);

  const { items: partLogs, loading: partsLoading } = useSubcollection(vehicleId, 'partLogs', {
    orderByField: 'odometer',
    direction: 'desc',
  });
  const { items: tyres, loading: tyresLoading } = useSubcollection(vehicleId, 'tyres', {
    orderByField: null,
  });

  const tyreByPosition = (id) => tyres.find((t) => t.id === id);

  return (
    <>
      <section className="vd-panel glass-panel" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Tyre manager</h2>
          <button className="btn btn-ghost" onClick={() => setShowTyreLog(true)}>
            Log rotation / alignment
          </button>
        </div>
        {tyresLoading ? (
          <p className="timeline-empty">Loading tyres…</p>
        ) : (
          <div className="tyre-grid">
            {TYRE_POSITIONS.map((pos) => (
              <TyreCard
                key={pos.id}
                position={pos}
                data={tyreByPosition(pos.id)}
                currentOdometer={vehicle.currentOdometer}
                onReplace={() => setReplacingPosition(pos)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="vd-panel glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Parts log</h2>
          <button className="btn btn-primary" onClick={() => setShowAddPart(true)}>
            <PiPlusBold /> Log a part
          </button>
        </div>
        {partsLoading ? (
          <p className="timeline-empty">Loading parts…</p>
        ) : (
          <PartsList logs={partLogs} currentOdometer={vehicle.currentOdometer} />
        )}
      </section>

      {showAddPart && (
        <AddPartModal vehicleId={vehicleId} vehicle={vehicle} onClose={() => setShowAddPart(false)} />
      )}
      {replacingPosition && (
        <ReplaceTyreModal
          vehicleId={vehicleId}
          vehicle={vehicle}
          position={replacingPosition}
          existing={Boolean(tyreByPosition(replacingPosition.id)?.brand)}
          onClose={() => setReplacingPosition(null)}
        />
      )}
      {showTyreLog && (
        <LogRotationAlignmentModal vehicleId={vehicleId} onClose={() => setShowTyreLog(false)} />
      )}
    </>
  );
}
