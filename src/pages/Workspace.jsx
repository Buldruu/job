import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

/* ── Status configurations ── */
const STATUSES = {
  attention:  { label:'Анхаарал шаардлагатай', bg:'#FEF2F2', text:'#DC2626', dot:'#EF4444' },
  in_progress:{ label:'Явц дунд',              bg:'#FEF3C7', text:'#D97706', dot:'#F59E0B' },
  completed:  { label:'Дууссан',               bg:'#DCFCE7', text:'#16A34A', dot:'#22C55E' },
  offer:      { label:'Санал ирсэн',           bg:'#EDE9FE', text:'#5B3BFF', dot:'#7C3AED' },
  contract:   { label:'Гэрээ батлагдсан',      bg:'#DCFCE7', text:'#16A34A', dot:'#22C55E' },
};

function StatusPill({ status, count }) {
  const s = STATUSES[status] || STATUSES.in_progress;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:s.bg, borderRadius:99 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:s.dot }}/>
      <span style={{ fontSize:11, fontWeight:500, color:s.text }}>{s.label}</span>
      {count !== undefined && <span style={{ fontSize:11, fontWeight:600, color:s.text, background:'rgba(255,255,255,0.6)', padding:'1px 7px', borderRadius:99 }}>{count}</span>}
    </div>
  );
}

function JobRow({ job, role, status, onClick }) {
  const s = STATUSES[status] || STATUSES.in_progress;
  return (
    <div onClick={onClick}
      style={{ display:'flex', gap:12, padding:14, background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:14, cursor:'pointer', alignItems:'center' }}>
      <div style={{ width:48, height:48, borderRadius:12, background: job.photo_url ? `url(${job.photo_url}) center/cover` : 'var(--primary-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--primary)' }}>
        {!job.photo_url && <span style={{fontSize:20}}>🔧</span>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {job.hiilgeh_ajil || job.alban_tushaal || 'Ажил'}
        </div>
        <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:6 }}>
          {role === 'client' ? 'Та захиалагч' : 'Та гүйцэтгэгч'} · {job.hayg || 'УБ'}
        </div>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', background:s.bg, borderRadius:99, fontSize:10, fontWeight:500, color:s.text }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:s.dot }}/>
          {s.label}
        </span>
      </div>
      <svg style={{width:16,height:16,color:'var(--slate-400)',flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
    </div>
  );
}

export default function Workspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myJobs,  setMyJobs]  = useState([]); // my posted jobs (as client)
  const [myBids,  setMyBids]  = useState([]); // jobs I bid on (as worker)
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    if (!user) return;
    // My posted jobs (I'm the client)
    const u1 = onSnapshot(
      query(collection(db,'workers'), where('uid','==',user.uid)),
      snap => setMyJobs(snap.docs.map(d=>({id:d.id,...d.data()}))),
      ()=>{}
    );
    // TODO: query bids/offers I've made
    return () => u1();
  }, [user]);

  const totals = {
    attention: 0,
    in_progress: myJobs.filter(j => j.status === 'in_progress').length,
    completed: myJobs.filter(j => j.status === 'completed').length,
    all: myJobs.length,
  };

  return (
    <div style={{ padding:16, background:'var(--bg-secondary)', minHeight:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }} className="animate-fade-up">
        <div>
          <h1 style={{ fontFamily:"'Poppins',sans-serif", fontSize:24, fontWeight:700, color:'var(--ink)', margin:0 }}>Workspace</h1>
          <div style={{ fontSize:12, color:'var(--slate-500)', marginTop:2 }}>Миний бүх ажлууд</div>
        </div>
      </div>

      {/* Status summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:18 }} className="animate-fade-up-delay">
        <div style={{ background:'var(--bg-primary)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid var(--border-light)' }}>
          <div style={{ fontSize:10, color:'var(--slate-500)', marginBottom:2 }}>Анхаарал</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'var(--error)' }}>{totals.attention}</div>
        </div>
        <div style={{ background:'var(--bg-primary)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid var(--border-light)' }}>
          <div style={{ fontSize:10, color:'var(--slate-500)', marginBottom:2 }}>Явц дунд</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'var(--warning)' }}>{totals.in_progress}</div>
        </div>
        <div style={{ background:'var(--bg-primary)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid var(--border-light)' }}>
          <div style={{ fontSize:10, color:'var(--slate-500)', marginBottom:2 }}>Дууссан</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'var(--success)' }}>{totals.completed}</div>
        </div>
        <div style={{ background:'var(--primary)', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.8)', marginBottom:2 }}>Бүгд</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'#fff' }}>{totals.all}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:4 }}>
        {[
          { k:'all',         l:'Бүгд' },
          { k:'client',      l:'Захиалсан' },
          { k:'worker',      l:'Гүйцэтгэж буй' },
          { k:'offered',     l:'Санал өгсөн' },
        ].map(t => (
          <button key={t.k} onClick={()=>setFilter(t.k)}
            style={{ flexShrink:0, padding:'8px 14px', background: filter===t.k ? 'var(--primary)' : 'var(--bg-primary)', color: filter===t.k ? '#fff' : 'var(--slate-500)', border: filter===t.k ? 'none' : '1px solid var(--border-light)', borderRadius:99, fontSize:12, fontWeight:filter===t.k?600:500, cursor:'pointer', whiteSpace:'nowrap' }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Section: Миний ажлууд */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:600, color:'var(--ink)', margin:0 }}>Миний ажлууд</h2>
        </div>

        {myJobs.length === 0 ? (
          <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:16, padding:'32px 24px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>💼</div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Идэвхтэй ажил алга</div>
            <div style={{ fontSize:12, color:'var(--slate-500)', lineHeight:1.5, marginBottom:14 }}>
              Ажил нийтэлж гүйцэтгэгчдээс санал авах эсвэл Jobs хэсгээс ажил хайж эхлээрэй.
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={()=>navigate('/post')} className="btn-primary" style={{ fontSize:13, padding:'10px 18px' }}>
                + Ажил нийтлэх
              </button>
              <button onClick={()=>navigate('/ajil')} className="btn-secondary" style={{ fontSize:13, padding:'10px 18px' }}>
                Ажил хайх
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {myJobs.map(j => (
              <JobRow key={j.id} job={j} role="client" status={j.status||'in_progress'}
                onClick={()=>navigate(`/ajiltan?id=${j.id}`)}/>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
