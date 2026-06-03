import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import HaGaLogo from './HaGaLogo';
import { NotificationBell, NotificationsPanel } from './Notifications';

const TABS = [
  {
    to:'/', end:true, label:'Home',
    icon:(active)=>(
      <svg viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    to:'/ajil', end:false, label:'Jobs',
    icon:(active)=>(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    )
  },
  {
    to:'/post', end:false, label:'Post', isCenter:true,
    icon:(active)=>(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    )
  },
  {
    to:'/workspace', end:false, label:'Workspace',
    icon:(active)=>(
      <svg viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    )
  },
  {
    to:'/profile', end:false, label:'Profile',
    icon:(active)=>(
      <svg viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
];

export default function Layout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer,    setDrawer]    = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  return (
    <div style={{ maxWidth:480, margin:'0 auto', height:'100dvh', display:'flex', flexDirection:'column', background:'var(--bg-secondary)', position:'relative', overflow:'hidden' }}>

      {/* ─── Top App Bar ─── */}
      <header className="haga-appbar">
        {/* Logo + brand name */}
        <button onClick={()=>navigate('/')}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <HaGaLogo width={32}/>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:20, color:'var(--primary)', letterSpacing:'-0.02em' }}>HAGA</span>
        </button>

        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {/* Location indicator */}
          <button style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', background:'var(--primary-50)', border:'none', borderRadius:99, fontSize:12, color:'var(--primary)', fontWeight:500, cursor:'pointer' }}>
            <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>УБ</span>
          </button>
          <NotificationBell onClick={()=>setShowNotif(true)}/>
          <button onClick={()=>setDrawer(true)}
            style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:'var(--slate-500)' }}>
            <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <main style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
        <Outlet/>
      </main>

      {/* ─── Bottom Tab Bar ─── */}
      <nav className="haga-tabbar">
        {TABS.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({isActive}) => `haga-tab ${isActive ? 'active' : ''}`}>
            {({isActive}) => (
              <>
                {t.isCenter ? (
                  <div style={{ width:44, height:44, borderRadius:14, background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 16px rgba(91,59,255,0.35)', marginTop:-6 }}>
                    <span style={{ width:20, height:20 }}>{t.icon(true)}</span>
                  </div>
                ) : (
                  <div className="icon-bg">
                    <span style={{ width:20, height:20 }}>{t.icon(isActive)}</span>
                  </div>
                )}
                <span>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ─── Drawer ─── */}
      {drawer && (
        <>
          <div onClick={()=>setDrawer(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', zIndex:40 }}/>
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'80%', maxWidth:300, background:'var(--bg-primary)', zIndex:50, display:'flex', flexDirection:'column', boxShadow:'4px 0 24px rgba(0,0,0,0.1)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--border-light)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <HaGaLogo width={28}/>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:18, color:'var(--primary)' }}>HAGA</span>
              </div>
              <button onClick={()=>setDrawer(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--slate-500)', fontSize:24, lineHeight:1, padding:0 }}>×</button>
            </div>

            <div style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
              {[
                { to:'/', label:'Нүүр хуудас', icon:'🏠' },
                { to:'/ajil', label:'Ажил хайх', icon:'🔍' },
                { to:'/ajiltan', label:'Ажилтан хайх', icon:'👷' },
                { to:'/post', label:'Захиалга үүсгэх', icon:'➕' },
                { to:'/workspace', label:'Workspace', icon:'💼' },
                { to:'/premium', label:'Premium', icon:'💎' },
                { to:'/sanhuu', label:'Санхүү', icon:'💳' },
              ].map(item => (
                <button key={item.to}
                  onClick={()=>{ navigate(item.to); setDrawer(false); }}
                  style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 14px', background: location.pathname===item.to ? 'var(--primary-50)' : 'transparent', border:'none', borderRadius:10, cursor:'pointer', fontSize:14, color: location.pathname===item.to ? 'var(--primary)' : 'var(--ink)', fontWeight: location.pathname===item.to ? 600 : 500, textAlign:'left' }}>
                  <span style={{fontSize:18}}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Footer with user */}
            <div style={{ borderTop:'1px solid var(--border-light)', padding:12 }}>
              {user && (
                <button onClick={()=>{ navigate('/profile'); setDrawer(false); }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:10, background:'var(--bg-secondary)', border:'none', borderRadius:10, cursor:'pointer', marginBottom:6 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Poppins',sans-serif", fontWeight:600, flexShrink:0, overflow:'hidden' }}>
                    {profile?.photoURL ? <img src={profile.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (profile?.ner||user.email||'?')[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1, textAlign:'left', minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {profile?.ner || user.email}
                    </div>
                    <div style={{ fontSize:11, color:'var(--slate-500)' }}>Профайл харах</div>
                  </div>
                </button>
              )}
              <button onClick={()=>signOut(auth)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px', background:'transparent', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, color:'var(--error)', fontWeight:500 }}>
                <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Гарах
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notifications panel */}
      {showNotif && <NotificationsPanel onClose={()=>setShowNotif(false)}/>}
    </div>
  );
}
