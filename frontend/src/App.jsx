import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ExpertDashboard from './pages/expert/Dashboard';
import SlotManagement from './pages/expert/SlotManagement';
import ExpertProfile from './pages/expert/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminExperts from './pages/admin/Experts';
import AdminUsers from './pages/admin/Users';
import AdminBookings from './pages/admin/Bookings';
import Notifications from './pages/Notifications';

function App() {
  return (
    <div className="min-h-screen fade-in">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<ExpertListing />} />
          <Route path="/experts/:id" element={<ExpertDetail />} />
          <Route path="/book/:expertId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><RoleRoute roles={['user']}><MyBookings /></RoleRoute></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/expert/dashboard" element={<ProtectedRoute><RoleRoute roles={['expert']}><ExpertDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/expert/slots" element={<ProtectedRoute><RoleRoute roles={['expert']}><SlotManagement /></RoleRoute></ProtectedRoute>} />
          <Route path="/expert/profile" element={<ProtectedRoute><RoleRoute roles={['expert']}><ExpertProfile /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/experts" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminExperts /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminUsers /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminBookings /></RoleRoute></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
