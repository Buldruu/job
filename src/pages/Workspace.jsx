import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { MAIN_CATS } from '../data/chiglel';
import { startChat } from './Chat';

/* ── Status configurations ── */
const STATUSES = {
  draft:        { label:'Ноорог',                bg:'#F1F5F9', text:'#64748B', dot:'#94A3B8' },
  published:    { label:'Нийтлэгдсэн',           bg:'#EDE9FE', text:'#5B3BFF', dot:'#7C3AED' },
  in_progress:  { label:'Явц дунд',              bg:'#FEF3C7', text:'#D97706', dot:'#F59E0B' },
  completed:    { label:'Дууссан',               bg:'#DCFCE7', text:'#16A34A', dot:'#22C55E' },
  cancelled:    { label:'Цуцлагдсан',            bg:'#FEE2E2', text:'#DC2626', dot:'#EF4444' },
  expired:      { label:'Хугацаа дууссан',       bg:'#F1F5F9', text:'#64748B', dot:'#94A3B8' },
};

/* ── Job card for my jobs ── */
function JobRow({ job, role='client', onClick }) {
  const s = STATUSES[job.status||'published'] || STATUSES.published;
  return (
    <div onClick={onClick}
      style={{ display:'flex', gap:12, padding:14, background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:14, cursor:'pointer', alignItems:'center' }}>
      <div style={{ width:48, height:48, borderRadius:12, background: (job.photo_urls?.[0]||job.photo_url) ? `url(${job.photo_urls?.[0]||job.photo_url}) center/cover` : 'var(--primary-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--primary)' }}>
        {!(job.photo_urls?.[0]||job.photo_url) && <span style={{fontSize:20}}>🔧</span>}
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

/* ── Worker card for search ── */
function WorkerCard({ worker, onChat }) {
  return (
    <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:14, padding:14, marginBottom:10 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--primary-100)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:600, flexShrink:0, overflow:'hidden', position:'relative' }}>
          {worker.photoURL ? <img src={worker.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (worker.ner||'?')[0]?.toUpperCase()}
          {worker.zovshoorol && (
            <div style={{ position:'absolute', bottom:-2, right:-2, width:18, height:18, background:'var(--success)', borderRadius:'50%', border:'2px solid var(--bg-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10 }}>✓</div>
          )}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:600, color:'var(--ink)' }}>
              {`${worker.ovog||''} ${worker.ner||''}`.trim() || 'Гүйцэтгэгч'}
            </span>
          </div>
          {worker.chiglel && (
            <div style={{ fontSize:12, color:'var(--primary)', fontWeight:500, marginBottom:4 }}>
              {worker.chiglel}
            </div>
          )}
          {worker.turshlaga && (
            <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>
              📅 {worker.turshlaga} жилийн туршлагатай
            </div>
          )}
          {worker.tsalin && (
            <div style={{ fontSize:11, color:'var(--ink)', fontWeight:500, marginBottom:6 }}>
              💰 ₮{worker.tsalin}
            </div>
          )}
          {worker.chadvar && (
            <div style={{ fontSize:11, color:'var(--slate-500)', lineHeight:1.4, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {worker.chadvar}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio thumbnails */}
      {(worker.portfolio||[]).length > 0 && (
        <div style={{ display:'flex', gap:5, marginTop:10, overflowX:'auto' }}>
          {worker.portfolio.slice(0,4).map((url, i) => (
            <div key={i} style={{ width:54, height:54, borderRadius:8, overflow:'hidden', flexShrink:0, border:'1px solid var(--border-light)' }}>
              <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          ))}
          {worker.portfolio.length > 4 && (
            <div style={{ width:54, height:54, borderRadius:8, background:'var(--slate-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'var(--slate-500)', flexShrink:0 }}>
              +{worker.portfolio.length-4}
            </div>
          )}
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <button onClick={onChat}
          style={{ flex:1, padding:'10px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          💬 Чатлах
        </button>
      </div>
    </div>
  );
}

export default function Workspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'jobs';

  /* ── My jobs state ── */
  const [myJobs, setMyJobs] = useState([]);

  /* ── Worker search state ── */
  const [workers, setWorkers]       = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMain, setFilterMain] = useState('');

  /* ── Load my jobs ── */
  useEffect(() => {
    if (!user || activeTab !== 'jobs') return;
    const u = onSnapshot(
      query(collection(db,'workers'), where('uid','==',user.uid)),
      snap => setMyJobs(snap.docs.map(d=>({id:d.id,...d.data()}))),
      () => {}
    );
    return () => u();
  }, [user, activeTab]);

  /* ── Load workers for search ── */
  useEffect(() => {
    if (activeTab !== 'workers') return;
    const u = onSnapshot(
      query(collection(db,'users')),
      snap => {
        const all = snap.docs.map(d => ({ id:d.id, ...d.data() }));
        // Only show users with profile data (chiglel)
        setWorkers(all.filter(u => u.chiglel && u.id !== user?.uid));
      },
      () => {}
    );
    return () => u();
  }, [activeTab, user]);

  /* ── Worker filtered list ── */
  const filteredWorkers = workers.filter(w => {
    if (filterMain && w.chiglel_main !== filterMain) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const blob = `${w.ner||''} ${w.ovog||''} ${w.chiglel||''} ${w.chadvar||''} ${w.hayg||''}`.toLowerCase();
      if (!blob.includes(s)) return false;
    }
    return true;
  });

  /* ── Stats ── */
  const totals = {
    attention:   myJobs.filter(j => j.status === 'published').length,
    in_progress: myJobs.filter(j => j.status === 'in_progress').length,
    completed:   myJobs.filter(j => j.status === 'completed').length,
    all:         myJobs.length,
  };

  /* ── Chat handler ── */
  const handleChat = async (worker) => {
    if (!user) { navigate('/login'); return; }
    try {
      const chatId = await startChat(user.uid, worker.id, '');
      navigate('/chat', { state:{ openChatId: chatId, otherUid: worker.id } });
    } catch(e) {
      alert('Чат эхлүүлэхэд алдаа гарлаа: '+e.message);
    }
  };

  const setTab = (t) => setSearchParams({ tab:t }, { replace:true });

  return (
    <div style={{ padding:16, background:'var(--bg-secondary)', minHeight:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:14 }} className="animate-fade-up">
        <h1 style={{ fontFamily:"'Poppins',sans-serif", fontSize:24, fontWeight:700, color:'var(--ink)', margin:0 }}>Workspace</h1>
        <div style={{ fontSize:12, color:'var(--slate-500)', marginTop:2 }}>Ажил, гүйцэтгэгчдийг нэг дороос</div>
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:6, marginBottom:16, background:'var(--bg-primary)', padding:4, borderRadius:12, border:'1px solid var(--border-light)' }}>
        <button onClick={()=>setTab('jobs')}
          style={{ flex:1, padding:'10px', background: activeTab==='jobs' ? 'var(--primary)' : 'transparent', color: activeTab==='jobs' ? '#fff' : 'var(--slate-500)', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          💼 Миний ажлууд
        </button>
        <button onClick={()=>setTab('workers')}
          style={{ flex:1, padding:'10px', background: activeTab==='workers' ? 'var(--primary)' : 'transparent', color: activeTab==='workers' ? '#fff' : 'var(--slate-500)', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          👷 Ажилтан хайх
        </button>
      </div>

      {/* ═══════════ TAB 1: MY JOBS ═══════════ */}
      {activeTab === 'jobs' && (
        <>
          {/* Status summary */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:18 }} className="animate-fade-up-delay">
            <div style={{ background:'var(--bg-primary)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid var(--border-light)' }}>
              <div style={{ fontSize:10, color:'var(--slate-500)', marginBottom:2 }}>Анхаарал</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'var(--primary)' }}>{totals.attention}</div>
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

          {/* My jobs list */}
          {myJobs.length === 0 ? (
            <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:16, padding:'32px 24px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>💼</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Захиалга алга байна</div>
              <div style={{ fontSize:12, color:'var(--slate-500)', lineHeight:1.5, marginBottom:14 }}>
                Шинэ ажлын захиалга үүсгээд<br/>гүйцэтгэгчдээс санал авна уу.
              </div>
              <button onClick={()=>navigate('/post')} className="btn-primary" style={{ fontSize:13, padding:'10px 20px' }}>
                + Захиалга үүсгэх
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {myJobs.map(j => (
                <JobRow key={j.id} job={j} role="client" onClick={()=>navigate(`/ajiltan?id=${j.id}`)}/>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════ TAB 2: WORKER SEARCH ═══════════ */}
      {activeTab === 'workers' && (
        <>
          {/* Search input */}
          <div style={{ position:'relative', marginBottom:12 }}>
            <svg style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:16,height:16,color:'var(--slate-400)'}}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
              placeholder="Нэр, чадвар, байршил хайх..."
              className="input-base" style={{ paddingLeft:38 }}/>
          </div>

          {/* Category chips */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:14, paddingBottom:4 }}>
            <button onClick={()=>setFilterMain('')}
              style={{ flexShrink:0, padding:'7px 14px', background: !filterMain ? 'var(--primary)' : 'var(--bg-primary)', color: !filterMain ? '#fff' : 'var(--slate-500)', border: !filterMain ? 'none' : '1px solid var(--border-light)', borderRadius:99, fontSize:12, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>
              Бүгд
            </button>
            {MAIN_CATS.map(c => (
              <button key={c} onClick={()=>setFilterMain(filterMain===c?'':c)}
                style={{ flexShrink:0, padding:'7px 14px', background: filterMain===c ? 'var(--primary)' : 'var(--bg-primary)', color: filterMain===c ? '#fff' : 'var(--slate-500)', border: filterMain===c ? 'none' : '1px solid var(--border-light)', borderRadius:99, fontSize:12, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Workers count */}
          <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:10 }}>
            {filteredWorkers.length} гүйцэтгэгч олдлоо
          </div>

          {/* Workers list */}
          {filteredWorkers.length === 0 ? (
            <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:16, padding:'32px 24px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Гүйцэтгэгч олдсонгүй</div>
              <div style={{ fontSize:12, color:'var(--slate-500)', lineHeight:1.5 }}>
                Хайлтын утгаа өөрчилж дахин үзнэ үү.
              </div>
            </div>
          ) : (
            <div>
              {filteredWorkers.map(w => (
                <WorkerCard key={w.id} worker={w} onChat={()=>handleChat(w)}/>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
