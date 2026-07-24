import { Routes, Route } from 'react-router-dom';
import { GarageProvider } from './context/GarageContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Garage from './pages/Garage.jsx';
import VehicleDashboard from './pages/VehicleDashboard.jsx';
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
        <Route path="vehicle/:vehicleId" element={<VehicleDashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="search" element={<Search />} />
      </Route>
    </Routes>
  );
}
