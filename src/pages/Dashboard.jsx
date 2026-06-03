import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CHIGLEL_MAP, MAIN_CATS } from '../data/chiglel';

/* ── Category icons with color mapping ── */
const CATS = [
  { name:'Засвар үйлчилгээ',  icon:'🔧', color:'cat-icon-purple', main:'Барилга, засвар' },
  { name:'Сантехник',         icon:'💧', color:'cat-icon-blue',   main:'Барилга, засвар' },
  { name:'Цахилгаан',         icon:'⚡', color:'cat-icon-yellow', main:'Барилга, засвар' },
  { name:'Барилга, интерьер', icon:'🏠', color:'cat-icon-green',  main:'Барилга, засвар' },
  { name:'Цэвэрлэгээ',        icon:'🧹', color:'cat-icon-indigo', main:'Гэр ахуй, цэвэрлэгээ' },
  { name:'Тээвэр, зөөвөр',    icon:'🚚', color:'cat-icon-orange', main:'Тээвэр, логистик' },
  { name:'IT & Digital',      icon:'💻', color:'cat-icon-purple', main:'Компьютер, IT' },
  { name:'Дизайн',            icon:'🎨', color:'cat-icon-pink',   main:'Дизайн, урлаг' },
  { name:'Гэр ахуй',          icon:'🛒', color:'cat-icon-orange', main:'Гэр ахуй, цэвэрлэгээ' },
  { name:'Бусад',             icon:'⋯',  color:'cat-icon-gray',   main:null },
];

/* ── Featured jobs card ── */
function FeaturedCard({ job, onClick }) {
  return (
    <div onClick={onClick}
      style={{ flexShrink:0, width:200, background:'var(--bg-primary)', borderRadius:14, overflow:'hidden', border:'1px solid var(--border-light)', cursor:'pointer' }}>
      <div style={{ height:120, background: job.photo_url ? `url(${job.photo_url}) center/cover` : 'linear-gradient(135deg, var(--primary-100), var(--primary-200))', position:'relative' }}>
        <button style={{ position:'absolute', top:8, right:8, width:28, height:28, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg style={{width:14,height:14,color:'var(--slate-500)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div style={{ padding:12 }}>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:4, lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {job.hiilgeh_ajil || job.alban_tushaal || 'Ажил'}
        </div>
        {job.hayg && <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:6, display:'flex', alignItems:'center', gap:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          📍 {job.hayg}
        </div>}
        {job.tsalin && <div style={{ fontSize:12, fontWeight:600, color:'var(--primary)' }}>₮ {job.tsalin}</div>}
      </div>
    </div>
  );
}

/* ── Worker card (Шилдэг гүйцэтгэгчид) ── */
function WorkerMiniCard({ worker, onClick }) {
  return (
    <div onClick={onClick}
      style={{ flexShrink:0, width:120, background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:14, padding:12, textAlign:'center', cursor:'pointer' }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--primary-100)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:600, margin:'0 auto 8px', overflow:'hidden', position:'relative' }}>
        {worker.photoURL ? <img src={worker.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (worker.ner||'?')[0]?.toUpperCase()}
        {worker.online && (
          <div style={{ position:'absolute', bottom:2, right:2, width:12, height:12, background:'var(--success)', borderRadius:'50%', border:'2px solid var(--bg-primary)' }}/>
        )}
      </div>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, color:'var(--ink)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {worker.ner ? `${worker.ner}` : '—'}
      </div>
      <div style={{ fontSize:10, color:'var(--slate-500)', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {worker.chiglel || 'Мэргэжилтэн'}
      </div>
      {worker.rating && (
        <div style={{ fontSize:10, color:'var(--ink)', fontWeight:500 }}>
          ⭐ {worker.rating} ({worker.ratingCount||0})
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topWorkers,   setTopWorkers]   = useState([]);

  useEffect(() => {
    // Load featured jobs (workers collection — where employers post)
    const q1 = query(collection(db,'workers'), orderBy('createdAt','desc'), limit(6));
    const u1 = onSnapshot(q1, snap => setFeaturedJobs(snap.docs.map(d=>({id:d.id,...d.data()}))), ()=>{});

    // Load top workers
    const q2 = query(collection(db,'users'), limit(8));
    const u2 = onSnapshot(q2, snap => {
      const workers = snap.docs.map(d=>({id:d.id,...d.data()})).filter(u => u.chiglel);
      setTopWorkers(workers.slice(0,8));
    }, ()=>{});

    return () => { u1(); u2(); };
  }, []);

  const goCategory = (cat) => {
    if (cat.main) {
      navigate(`/ajiltan?main=${encodeURIComponent(cat.main)}`);
    } else {
      navigate('/ajiltan');
    }
  };

  return (
    <div style={{ padding:16, background:'var(--bg-secondary)' }}>

      {/* Hero banner */}
      <div style={{ background:'linear-gradient(135deg, var(--primary-100), var(--primary-50))', borderRadius:20, padding:'20px 18px', marginBottom:18, position:'relative', overflow:'hidden' }} className="animate-fade-up">
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'var(--ink)', lineHeight:1.2, marginBottom:6 }}>
            Зөв хүнээр<br/>
            <span style={{color:'var(--primary)'}}>зөв ажлаа</span> хийлгэрэй.
          </div>
          <div style={{ fontSize:12, color:'var(--slate-500)', lineHeight:1.5, marginBottom:14, maxWidth:'80%' }}>
            Мянга мянган гүйцэтгэгчээс<br/>сонгон, итгэлтэй хамтрагат.
          </div>
          {/* Search input */}
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg-primary)', borderRadius:12, padding:'10px 14px', cursor:'pointer' }}
            onClick={()=>navigate('/ajil')}>
            <svg style={{width:18,height:18,color:'var(--slate-400)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span style={{fontSize:13, color:'var(--slate-400)', flex:1}}>Ажил хайх...</span>
            <button style={{ width:30, height:30, background:'var(--primary)', border:'none', borderRadius:8, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 12h16M4 6h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
        {/* Verified badge in top right */}
        <div style={{ position:'absolute', top:14, right:14, background:'var(--bg-primary)', borderRadius:10, padding:'4px 10px', display:'flex', alignItems:'center', gap:4, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <span style={{fontSize:11}}>⭐</span>
          <span style={{fontSize:11, fontWeight:600, color:'var(--ink)'}}>4.9</span>
        </div>
      </div>

      {/* Категори grid */}
      <div className="animate-fade-up-delay">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', margin:0 }}>Түгээмэл ангилал</h2>
          <button onClick={()=>navigate('/ajiltan')} style={{ background:'none', border:'none', color:'var(--primary)', fontSize:12, fontWeight:500, cursor:'pointer' }}>
            Бүгдийг харах →
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginBottom:20 }}>
          {CATS.slice(0,10).map((cat,i) => (
            <div key={i} className="haga-cat-card" onClick={()=>goCategory(cat)} style={{ padding:'10px 6px' }}>
              <div className={`icon-wrap ${cat.color}`} style={{ width:42, height:42, fontSize:18 }}>{cat.icon}</div>
              <div style={{ fontSize:10, fontWeight:500, color:'var(--ink)', lineHeight:1.2 }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Онцлох ажил */}
      <div className="animate-fade-up-delay">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', margin:0 }}>Онцлох ажил</h2>
          <button onClick={()=>navigate('/ajiltan')} style={{ background:'none', border:'none', color:'var(--primary)', fontSize:12, fontWeight:500, cursor:'pointer' }}>Бүгдийг харах →</button>
        </div>
        {featuredJobs.length === 0 ? (
          <div style={{ background:'var(--bg-primary)', borderRadius:14, padding:24, textAlign:'center', color:'var(--slate-500)', fontSize:13, marginBottom:20 }}>
            Онцлох ажил байхгүй
          </div>
        ) : (
          <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8, marginBottom:20, scrollbarWidth:'thin' }}>
            {featuredJobs.map(job => (
              <FeaturedCard key={job.id} job={job} onClick={()=>navigate(`/ajiltan?id=${job.id}`)}/>
            ))}
          </div>
        )}
      </div>

      {/* Шилдэг гүйцэтгэгчид */}
      <div className="animate-fade-up-delay">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', margin:0 }}>Шилдэг гүйцэтгэгчид</h2>
          <button onClick={()=>navigate('/ajil')} style={{ background:'none', border:'none', color:'var(--primary)', fontSize:12, fontWeight:500, cursor:'pointer' }}>Бүгдийг харах →</button>
        </div>
        {topWorkers.length === 0 ? (
          <div style={{ background:'var(--bg-primary)', borderRadius:14, padding:24, textAlign:'center', color:'var(--slate-500)', fontSize:13, marginBottom:20 }}>
            Гүйцэтгэгч байхгүй
          </div>
        ) : (
          <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8, marginBottom:20 }}>
            {topWorkers.map(w => (
              <WorkerMiniCard key={w.id} worker={w} onClick={()=>navigate(`/ajil?id=${w.id}`)}/>
            ))}
          </div>
        )}
      </div>

      {/* Trust banner */}
      <div style={{ background:'var(--primary-50)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{ width:40, height:40, background:'var(--primary-100)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg style={{width:22,height:22,color:'var(--primary)'}} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v6c0 5.55 3.84 9.95 8 11 4.16-1.05 8-5.45 8-11V7l-8-5zm-1 14l-4-4 1.41-1.41L11 13.17l5.59-5.59L18 9l-7 7z"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, color:'var(--ink)' }}>Аюулгүй, найдвартай платформ</div>
          <div style={{ fontSize:11, color:'var(--slate-500)', lineHeight:1.4 }}>Баталгаажсан гүйцэтгэгч, эскроу хамгаалалт</div>
        </div>
        <svg style={{width:18,height:18,color:'var(--slate-400)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
      </div>

    </div>
  );
}
