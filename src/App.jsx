import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Transfer from './pages/Transfer';
import Profile from './pages/Profile';
import JobList from './pages/JobList';
import EscrowDetail from './pages/EscrowDetail';
import Admin from './pages/Admin';
import Mergejilten from './pages/Mergejilten';
import Premium from './pages/Premium';

function Spinner() {
  return (
    <div className="min-h-screen bg-surf-50 flex items-center justify-center">
      <div className="w-9 h-9 rounded-full border-2 border-brand-400 border-t-transparent animate-spin"/>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner/>;
  return user ? children : <Navigate to="/login" replace/>;
}

function PresenceTracker() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const update = () => setDoc(doc(db,'presence',user.uid), { uid:user.uid, lastSeen:serverTimestamp() }, {merge:true});
    update();
    const id = setInterval(update, 2*60*1000);
    return () => clearInterval(id);
  }, [user]);
  return null;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner/>;

  return (
    <>
      <PresenceTracker/>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace/> : <Login/>}/>
        <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
          <Route index element={<Dashboard/>}/>
          <Route path="ajil"           element={<JobList type="ajil"/>}/>
          <Route path="ajiltan"        element={<JobList type="ajiltan"/>}/>
          <Route path="premium"         element={<Premium/>}/>
          <Route path="surgalt"        element={<JobList type="surgalt"/>}/>
          <Route path="mergejilten"    element={<Mergejilten/>}/>
          <Route path="sanhuu"         element={<Finance/>}/>
          <Route path="sanhuu/shiljuuleg" element={<Transfer/>}/>
          <Route path="sanhuu/escrow/:id" element={<EscrowDetail/>}/>
          <Route path="profile"        element={<Profile/>}/>
          <Route path="admin"          element={<Admin/>}/>
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </>
  );
}
