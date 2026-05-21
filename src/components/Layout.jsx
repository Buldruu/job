import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import BrandModal from './BrandModal';
import HaGaLogo from './HaGaLogo';
import AIChat from './AIChat';
import { NotificationBell, NotificationsPanel } from './Notifications';

/* ── 5 bottom tabs — HAGA spec ── */
const TABS = [
  { to:'/',        end:true,  label:'Нүүр',    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { to:'/ajil',   end:false, label:'Ажлын зар', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { to:'/ajiltan',end:false, label:'Ажилтан', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { to:'/chat',   end:false, label:'Чат',     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { to:'/profile',end:false, label:'Профайл', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const [brand, setBrand] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const name    = profile?.ner || profile?.ovog || user?.email?.split('@')[0] || 'Хэрэглэгч';
  const photo   = profile?.photoURL;
  const initial = (name[0] || 'H').toUpperCase();
  const isActive = (t) => t.end ? location.pathname === t.to : location.pathname.startsWith(t.to);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', overflow:'hidden', background:'var(--parchment-deep)', maxWidth:480, margin:'0 auto', position:'relative' }}>

      {/* ── HAGA App bar ── */}
      <header style={{ flexShrink:0, padding:'12px 16px', background:'var(--paper)', borderBottom:'1px solid var(--hairline-soft)', display:'flex', alignItems:'center', gap:10, minHeight:52, zIndex:10 }}>
        <button onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <HaGaLogo width={24} variant="grad"/>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:'var(--charter-blue)', lineHeight:1 }}>HAGA</div>
        </button>
        <div style={{ flex:1 }}/>
        {/* Notification bell */}
        <button style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:'var(--steel)' }}>
          <svg style={{ width:22, height:22 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </button>
        {/* Drawer menu */}
        <button onClick={()=>setDrawer(true)} style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:'var(--steel)' }}>
          <svg style={{ width:22, height:22 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </button>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex:1, overflowY:'auto', overflowX:'hidden', background:'var(--parchment)', WebkitOverflowScrolling:'touch' }}>
        <Outlet/>
      </main>

      {/* ── HAGA Bottom tab bar ── */}
      <nav style={{ flexShrink:0, display:'flex', height:56, background:'var(--paper)', borderTop:'1px solid var(--hairline-soft)', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        {TABS.map(t => {
          const active = isActive(t);
          return (
            <NavLink key={t.to} to={t.to}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, color: active ? 'var(--charter-blue)' : 'var(--steel)', textDecoration:'none', fontSize:10, fontWeight: active ? 600 : 500, position:'relative', WebkitTapHighlightColor:'transparent' }}>
              <span style={{ width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {t.icon}
              </span>
              <span>{t.label}</span>
              {active && <span style={{ position:'absolute', bottom:0, width:24, height:2.5, background:'var(--seal-gold)', borderRadius:'2px 2px 0 0' }}/>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Side drawer (full nav) ── */}
      {drawer && (
        <div style={{ position:'absolute', inset:0, zIndex:50, display:'flex' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(2px)' }} onClick={()=>setDrawer(false)}/>
          <div style={{ position:'relative', width:260, height:'100%', display:'flex', flexDirection:'column', background:'var(--paper)', animation:'slideIn .2s ease-out', zIndex:1 }}>

            {/* Drawer header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--hairline-soft)' }}>
              <button onClick={()=>{setBrand(true);setDrawer(false);}} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0, width:'100%' }}>
                <HaGaLogo width={22} variant="grad"/>
                <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:16, fontWeight:500, color:'var(--charter-blue)' }}>HAGA</div>
              </button>
              <button onClick={()=>setDrawer(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--steel)', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg style={{ width:18, height:18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Nav items */}
            <nav style={{ flex:1, padding:'8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
              {[
                { to:'/',         end:true,  label:'Нүүр хуудас' },
                { to:'/ajil',     end:false, label:'Ажил хайх' },
                { to:'/ajiltan',  end:false, label:'Ажилтан хайх' },
                { to:'/premium',  end:false, label:'Premium' },
                { to:'/sanhuu',   end:false, label:'Санхүү' },
                ...(profile?.isAdmin ? [{ to:'/admin', end:false, label:'⚙️ Админ' }] : []),
              ].map(item => {
                const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <NavLink key={item.to} to={item.to} onClick={()=>setDrawer(false)}
                    style={{ display:'block', padding:'11px 14px', borderRadius:10, color: active ? 'var(--charter-blue)' : 'var(--steel)', background: active ? 'rgba(26,43,74,0.07)' : 'transparent', fontWeight: active ? 600 : 500, fontSize:15, textDecoration:'none' }}>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Profile + logout */}
            <div style={{ padding:'8px', borderTop:'1px solid var(--hairline-soft)' }}>
              <NavLink to="/profile" onClick={()=>setDrawer(false)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, color:'var(--ink)', textDecoration:'none', fontSize:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--seal-gold)', color:'var(--charter-blue)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight:500, flexShrink:0, overflow:'hidden' }}>
                  {photo ? <img src={photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initial}
                </div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight:500, color:'var(--charter-blue)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                  <div style={{ fontSize:11, color:'var(--steel)' }}>Профайл харах</div>
                </div>
              </NavLink>
              <button onClick={()=>{ signOut(auth).then(()=>navigate('/login')); setDrawer(false); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, color:'var(--heritage-red)', background:'none', border:'none', cursor:'pointer', width:'100%', fontSize:14, fontWeight:500 }}>
                <svg style={{ width:18, height:18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Гарах
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotif && (
        <NotificationsPanel onClose={()=>setShowNotif(false)}/>
      )}
      {brand && <BrandModal onClose={()=>setBrand(false)}/>}
      <AIChat/>
    </div>
  );
}
