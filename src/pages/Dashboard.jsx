import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CHIGLEL_MAP, MAIN_CATS, getSubs } from '../data/chiglel';

const C = {
  ch:'#1A2B4A', ch5:'#EEF1F6', pg:'#F7F2E9', pgd:'#EDE5D2',
  gd:'#C9A961', gdd:'#A8893F',
  sl:'#6B7280', sll:'#9CA3AF', hl:'#D9D2C2', hls:'#E8E2D2',
  pp:'#FFFFFF', ink:'#1F1F1F',
};

const CAT_COUNTS = Object.fromEntries(
  Object.entries(CHIGLEL_MAP).map(([k,v]) => [k, Object.values(v).flat().length])
);

const CAT_ICONS = {
  'Барилга, засвар':      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>,
  'Тээвэр, логистик':     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-4h14v4M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M17 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M3 13l3-7h11l4 7"/></svg>,
  'Гэр ахуй, цэвэрлэгээ': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  'Гоо сайхан, үсчин':    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  'Дизайн, урлаг':        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  'Хоол, үйлчилгээ':      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h18M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M5 11l1 9h12l1-9"/></svg>,
  'Компьютер, IT':         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  'Хөдөө аж ахуй':        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 22c1.25-.75 2.5-2 3.5-3.5C7 17 8 14.5 8 12c0-2.5-.5-4-1-5"/><path d="M9 8c1.5 1 3 1.5 5 1.5 2 0 3-.5 4-1.5M22 22c-1.25-.75-2.5-2-3.5-3.5C17 17 16 14.5 16 12c0-2.5.5-4 1-5"/><path d="M12 6V2M9 4l3-2 3 2"/></svg>,
  'Эрүүл мэнд, асрамж':   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>,
  'Боловсрол, сургалт':   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  'Бизнес, мэргэжлийн үйлчилгээ': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  'Үйлдвэрлэл, инженерчлэл': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20V8l5 4V8l5 4V8l5 4v8"/></svg>,
  'Аялал, спорт':          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>,
};

/* ── Sub-category drill-down screen ── */
function SubCatScreen({ mainCat, onBack, onSelectSub }) {
  const subs = getSubs(mainCat);
  return (
    <div style={{ background:C.pg, minHeight:'100%' }}>
      {/* Appbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>{mainCat}</div>
      </div>
      {/* Breadcrumb */}
      <div style={{ padding:'8px 16px 0', display:'flex', gap:6, fontSize:11, color:C.sl }}>
        <span style={{ cursor:'pointer', color:C.sl }} onClick={onBack}>Бүх ангилал</span>
        <span style={{ color:C.sll }}>›</span>
        <strong style={{ color:C.ink }}>{mainCat}</strong>
      </div>
      {/* Main cat card */}
      <div style={{ margin:'12px 16px', background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <div style={{ color:C.ch, width:22, height:22 }}>{CAT_ICONS[mainCat]}</div>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:16, color:C.ch, fontWeight:500 }}>{mainCat}</div>
        </div>
        <div style={{ fontSize:12, color:C.sl }}>Доорх дэд ангилалаас сонгоно уу</div>
      </div>
      {/* Sub-category list with gold bar */}
      <div style={{ padding:'0 16px 8px' }}>
        <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:10 }}>ДЭД АНГИЛАЛ</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {subs.map(sub => (
            <button key={sub} onClick={()=>onSelectSub(sub)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px 13px 16px', background:C.pp, border:`1px solid ${C.hls}`, borderRadius:10, cursor:'pointer', textAlign:'left', position:'relative' }}>
              {/* Gold left bar */}
              <div style={{ position:'absolute', left:0, top:6, bottom:6, width:3, background:C.gd, borderRadius:'0 2px 2px 0' }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:C.ink, marginBottom:2 }}>{sub}</div>
                <div style={{ fontSize:12, color:C.sl }}>
                  {Object.values(CHIGLEL_MAP[mainCat]?.[sub] || {}).length || (CHIGLEL_MAP[mainCat]?.[sub]?.length || 0)} мэргэжил
                </div>
              </div>
              <svg style={{width:16,height:16,color:C.sll}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ))}
          {/* Show all in this category */}
          <button onClick={()=>onSelectSub(null)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', background:C.ch5, border:`1px solid ${C.ch}`, borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:500, color:C.ch, marginTop:4 }}>
            Бүх {mainCat} зарыг харах →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── All categories screen ── */
function AllCatsScreen({ onSelectMain, onBack }) {
  return (
    <div style={{ background:C.pg, minHeight:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch, flex:1 }}>Бүх ангилал</div>
        <svg style={{width:22,height:22,color:C.ch}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
      <div style={{ padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {MAIN_CATS.map(cat => (
          <button key={cat} onClick={()=>onSelectMain(cat)}
            style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:'13px 12px', display:'flex', flexDirection:'column', gap:6, minHeight:88, cursor:'pointer', textAlign:'left' }}>
            <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:C.ch }}>
              {CAT_ICONS[cat]}
            </div>
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight:500, color:C.ch, lineHeight:1.2 }}>{cat}</div>
            <div style={{ fontSize:11, color:C.sl }}>{CAT_COUNTS[cat]} мэргэжил</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  // screen: 'home' | 'allcats' | { mainCat } | { mainCat, sub }
  const [screen, setScreen] = useState('home');
  const name = profile?.ner || user?.email?.split('@')[0] || 'Та';
  const cats = MAIN_CATS.slice(0, 6);

  /* Navigate to ajiltan with URL search params */
  const goFilter = (mainCat, sub = null) => {
    const params = new URLSearchParams();
    if (mainCat) params.set('main', mainCat);
    if (sub)     params.set('sub', sub);
    navigate(`/ajiltan?${params.toString()}`);
  };

  /* Screen: Sub-category drill-down */
  if (screen?.mainCat) {
    return (
      <SubCatScreen
        mainCat={screen.mainCat}
        onBack={()=>setScreen('allcats')}
        onSelectSub={(sub)=>{
          if (sub) goFilter(screen.mainCat, sub);
          else     goFilter(screen.mainCat);
        }}
      />
    );
  }

  /* Screen: All categories */
  if (screen === 'allcats') {
    return (
      <AllCatsScreen
        onBack={()=>setScreen('home')}
        onSelectMain={(cat)=>setScreen({ mainCat: cat })}
      />
    );
  }

  /* Screen: Home */
  return (
    <div style={{ padding:16, background:C.pg, minHeight:'100%' }}>
      {/* Greeting */}
      <div style={{ marginBottom:14 }} className="animate-fade-up">
        <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:4 }}>САЙН БАЙНА УУ</div>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, letterSpacing:'-0.01em', lineHeight:1.15 }}>
          Ямар ажил<br/>хайж байна вэ?
        </div>
      </div>

      {/* Search */}
      <div style={{ background:C.pp, border:`1px solid ${C.hl}`, borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, marginBottom:18, cursor:'pointer' }}
        onClick={()=>navigate('/ajil')} className="animate-fade-up-delay">
        <svg style={{width:18,height:18,color:C.sl,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span style={{color:C.sll,fontSize:14}}>Мэргэжил, байршил...</span>
      </div>

      {/* Quick links */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:20, paddingBottom:2 }} className="animate-fade-up-delay">
        {[
          {to:'/ajil',    label:'Ажил хайх', icon:'🔍'},
          {to:'/ajiltan', label:'Ажилтан',   icon:'👷'},
          {to:'/premium', label:'Premium',   icon:'💎'},
          {to:'/sanhuu',  label:'Санхүү',    icon:'💳'},
        ].map(l=>(
          <button key={l.to} onClick={()=>navigate(l.to)}
            style={{ flexShrink:0, background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:'10px 14px', textAlign:'center', cursor:'pointer', minWidth:70 }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{l.icon}</div>
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:12, fontWeight:500, color:C.ch, whiteSpace:'nowrap' }}>{l.label}</div>
          </button>
        ))}
      </div>

      {/* Category grid — clicking opens sub-category drill-down */}
      <div className="animate-fade-up-delay">
        <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:10 }}>АНГИЛАЛ</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {cats.map(cat => (
            <button key={cat}
              onClick={()=>setScreen({ mainCat: cat })}
              style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:'13px 12px', display:'flex', flexDirection:'column', gap:6, minHeight:88, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:C.ch }}>
                {CAT_ICONS[cat]}
              </div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight:500, color:C.ch, lineHeight:1.2 }}>{cat}</div>
              <div style={{ fontSize:11, color:C.sl }}>{CAT_COUNTS[cat]} мэргэжил</div>
            </button>
          ))}
        </div>
        <div style={{ textAlign:'center', margin:'12px 0 8px' }}>
          <button onClick={()=>setScreen('allcats')} style={{ background:'none', border:'none', color:C.ch, fontSize:12, fontWeight:500, cursor:'pointer' }}>
            Бүх ангилал харах →
          </button>
        </div>
      </div>
    </div>
  );
}
