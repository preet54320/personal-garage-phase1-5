import { Routes, Route } from 'react-router-dom';
import { GarageProvider } from './context/GarageContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Garage from './pages/Garage.jsx';
import VehicleLayout from './pages/VehicleLayout.jsx';
import VehicleOverview from './pages/VehicleOverview.jsx';
import VehicleFuel from './pages/VehicleFuel.jsx';
import VehicleService from './pages/VehicleService.jsx';
import VehicleParts from './pages/VehicleParts.jsx';
import VehicleExpenses from './pages/VehicleExpenses.jsx';
import ComingSoonTab from './pages/ComingSoonTab.jsx';
import Reports from './pages/Reports.jsx';
import Search from './pages/Search.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <GarageProvider>
              <AppLayout />
            </GarageProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Garage />} />

        <Route path="vehicle/:vehicleId" element={<VehicleLayout />}>
          <Route index element={<VehicleOverview />} />
          <Route path="fuel" element={<VehicleFuel />} />
          <Route path="service" element={<VehicleService />} />
          <Route path="parts" element={<VehicleParts />} />
          <Route path="expenses" element={<VehicleExpenses />} />
          <Route path="documents" element={<ComingSoonTab label="Documents" />} />
          <Route path="photos" element={<ComingSoonTab label="Photos" />} />
          <Route path="reminders" element={<ComingSoonTab label="Reminders" />} />
        </Route>

        <Route path="reports" element={<Reports />} />
        <Route path="search" element={<Search />} />
      </Route>
    </Routes>
  );
}
