import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Transfer from './pages/Transfer';
import Profile from './pages/Profile';
import JobList from './pages/JobList';
import EscrowDetail from './pages/EscrowDetail';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="ajil" element={<JobList type="ajil" />} />
        <Route path="ajiltan" element={<JobList type="ajiltan" />} />
        <Route path="dadlaga" element={<JobList type="dadlaga" />} />
        <Route path="surgalt" element={<JobList type="surgalt" />} />
        <Route path="sanhuu" element={<Finance />} />
        <Route path="sanhuu/shiljuuleg" element={<Transfer />} />
        <Route path="sanhuu/escrow/:id" element={<EscrowDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
