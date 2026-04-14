import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import BrandModal from './BrandModal';
import HaGaLogo from './HaGaLogo';

const navItems = [
  { to: '/', label: 'Нүүр', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>)},
  { to: '/ajil', label: 'Ажил хайх', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2"/>
    </svg>)},
  { to: '/ajiltan', label: 'Ажилтан хайх', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>)},
  { to: '/premium', label: 'Premium', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3l3.057-3 3.943 4 3.943-4L19 3l-2 7H7L5 3zm2 8h10l1 10H6L8 11zm4 4h0m0-4v4"/>
    </svg>)},
  { to: '/surgalt', label: 'Сургалт', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
    </svg>)},
  { to: '/mergejilten', label: 'Мэргэшсэн', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
    </svg>)},
  { to: '/sanhuu', label: 'Санхүү', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
    </svg>)},
];

const adminNav = { to: '/admin', label: 'Админ', icon: (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>)};

const linkClass = (isActive) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? 'bg-brand-50 text-brand-600 border border-brand-100'
      : 'text-gray-500 hover:text-gray-700 hover:bg-surf-100'
  }`;

export default function Layout() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [showBrand, setShowBrand] = useState(false);

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  const displayName = profile?.ner || profile?.ovog || user?.email?.split('@')[0] || 'Хэрэглэгч';
  const photoURL    = profile?.photoURL || null;
  const initial     = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-surf-50">
      <aside className="w-60 flex-shrink-0 sidebar flex flex-col">
        {/* Brand — click to open brand book */}
        <div className="px-5 py-5 border-b border-surf-200">
          <button
            type="button"
            onClick={() => setShowBrand(true)}
            className="flex items-center gap-2.5 hover:opacity-75 active:scale-95 transition-all group w-full"
          >
            <HaGaLogo width={32} variant="grad"/>
            <span className="text-lg font-display font-bold text-gray-800 tracking-tight">HaGA</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => linkClass(isActive)}>
              {item.icon}{item.label}
            </NavLink>
          ))}
          {/* Admin link only for admins */}
          {profile?.isAdmin && (
            <NavLink to={adminNav.to} className={({ isActive }) => linkClass(isActive)}>
              {adminNav.icon}
              <span>{adminNav.label}</span>
              <span className="ml-auto text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">A</span>
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-surf-200 space-y-0.5">
          <NavLink to="/profile" className={({ isActive }) => linkClass(isActive)}>
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-brand-100 flex items-center justify-center">
              {photoURL
                ? <img src={photoURL} alt="avatar" className="w-full h-full object-cover"/>
                : <span className="text-xs font-bold text-brand-600">{initial}</span>}
            </div>
            <span className="truncate">{displayName}</span>
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Гарах
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-surf-50">
        <Outlet />
      </main>

      {showBrand && <BrandModal onClose={() => setShowBrand(false)}/>}
    </div>
  );
}
