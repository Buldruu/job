import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit,
         onSnapshot, doc, updateDoc, writeBatch,
         serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const C = {
  ch:'#5B3BFF', ch5:'#F5F3FF', pg:'#F5F7FF', pgd:'#EDE9FE',
  gd:'#FFB020', gdd:'#D97706', gd5:'#FEF3C7',
  sl:'#64748B', sll:'#94A3B8', hl:'#E2E8F0', hls:'#F1F5F9',
  pp:'#FFFFFF', ink:'#1E293B',
  vg:'#22C55E', vg5:'#DCFCE7', rd:'#EF4444', rd5:'#FEE2E2',
};

const TYPES = {
  sanal:    { icon:'📋', bg:'#EEF1F6' },
  urilt:    { icon:'✉️',  bg:'#FAF1DC' },
  payment:  { icon:'💳', bg:'#EDF7F2' },
  rating:   { icon:'⭐', bg:'#FAF1DC' },
  premium:  { icon:'💎', bg:'#FAF1DC' },
  verified: { icon:'✅', bg:'#EDF7F2' },
  system:   { icon:'🔔', bg:'#EEF1F6' },
};

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now() - d) / 1000;
  if (s < 60)    return 'Сая';
  if (s < 3600)  return `${Math.floor(s/60)} мин`;
  if (s < 86400) return `${Math.floor(s/3600)} цаг`;
  if (s < 604800)return `${Math.floor(s/86400)} өдөр`;
  return d.toLocaleDateString('mn-MN');
}

/* ── Single notification row ── */
function NRow({ n, onRead }) {
  const t = TYPES[n.type] || TYPES.system;
  return (
    <div onClick={()=>!n.read && onRead(n.id)}
      style={{
        display:'flex', gap:12, padding:'14px 16px',
        background: n.read ? C.pp : '#F5F7FF',
        borderBottom:`1px solid ${C.hls}`,
        cursor: n.read ? 'default' : 'pointer',
        position:'relative',
        transition:'background .2s',
      }}>
      {/* Unread indicator */}
      {!n.read && (
        <div style={{ position:'absolute', left:5, top:'50%', transform:'translateY(-50%)', width:5, height:5, borderRadius:'50%', background:C.ch }}/>
      )}
      {/* Icon */}
      <div style={{ width:42, height:42, borderRadius:'50%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
        {t.icon}
      </div>
      {/* Text */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:8, marginBottom:3 }}>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:13, fontWeight: n.read ? 400 : 600, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {n.title}
          </div>
          <div style={{ fontSize:10, color:C.sll, flexShrink:0 }}>{timeAgo(n.createdAt)}</div>
        </div>
        <div style={{ fontSize:12, color:C.sl, lineHeight:1.45 }}>{n.body}</div>
      </div>
    </div>
  );
}

/* ── Notifications panel ── */
export function NotificationsPanel({ onClose }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Simple query - no composite index needed
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      limit(80)
    );
    return onSnapshot(q,
      snap => {
        const list = snap.docs
          .map(d => ({ id:d.id, ...d.data() }))
          .sort((a,b) => {
            const ta = a.createdAt?.toDate?.()?.getTime() || 0;
            const tb = b.createdAt?.toDate?.()?.getTime() || 0;
            return tb - ta; // newest first
          });
        setNotifs(list);
        setLoading(false);
      },
      err => {
        console.error('Notifications error:', err);
        setLoading(false);
      }
    );
  }, [user]);

  const markRead = async (id) => {
    try { await updateDoc(doc(db,'notifications',id), { read:true }); } catch(e) {}
  };

  const markAllRead = async () => {
    const batch = writeBatch(db);
    notifs.filter(n=>!n.read).forEach(n => {
      batch.update(doc(db,'notifications',n.id), { read:true });
    });
    try { await batch.commit(); } catch(e) {}
  };

  const unread = notifs.filter(n=>!n.read).length;
  const shown  = filter === 'unread' ? notifs.filter(n=>!n.read) : notifs;

  return (
    <div style={{ position:'absolute', inset:0, zIndex:50 }}>
      {/* Backdrop */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(2px)' }} onClick={onClose}/>

      {/* Slide-in panel */}
      <div style={{
        position:'absolute', top:0, right:0, bottom:0, width:'100%', maxWidth:480,
        background:C.pp, display:'flex', flexDirection:'column',
        boxShadow:'-4px 0 32px rgba(0,0,0,0.15)',
        animation:'slideInRight .2s ease-out',
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex', padding:0 }}>
              <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch, display:'flex', alignItems:'center', gap:8 }}>
              Мэдэгдэл
              {unread > 0 && (
                <span style={{ fontSize:11, background:C.ch, color:C.pp, padding:'1px 7px', borderRadius:99, fontFamily:"'Manrope',sans-serif", fontWeight:700 }}>
                  {unread}
                </span>
              )}
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:C.ch, fontWeight:500 }}>
              Бүгдийг уншсан
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${C.hls}`, flexShrink:0, background:C.pp }}>
          {[
            { k:'all',    l:`Бүгд${notifs.length>0?` (${notifs.length})`:''}` },
            { k:'unread', l:`Уншаагүй${unread>0?` (${unread})`:''}` },
          ].map(({k,l}) => (
            <button key={k} onClick={()=>setFilter(k)}
              style={{ flex:1, padding:'11px 8px', fontSize:13, fontWeight:filter===k?600:500, color:filter===k?C.ch:C.sl, background:'none', border:'none', cursor:'pointer', borderBottom:filter===k?`2.5px solid ${C.gd}`:'2.5px solid transparent' }}>
              {l}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:'auto', background:C.pg }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}>
              <div style={{ width:24, height:24, border:`2px solid ${C.ch}`, borderTopColor:'transparent', borderRadius:'50%' }} className="animate-spin"/>
            </div>
          ) : shown.length === 0 ? (
            /* ── Empty state ── */
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, padding:'48px 32px', textAlign:'center' }}>
              <div style={{ width:64, height:64, background:C.ch5, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, fontSize:28 }}>
                🔔
              </div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch, marginBottom:8 }}>
                {filter === 'unread' ? 'Уншаагүй мэдэгдэл байхгүй' : 'Мэдэгдэл байхгүй'}
              </div>
              <div style={{ fontSize:13, color:C.sl, lineHeight:1.5, maxWidth:260 }}>
                {filter === 'unread'
                  ? 'Бүх мэдэгдлийг уншсан байна'
                  : 'Зар нийтлэх, Premium авах, үнэлгээ ирэх зэрэг үйлдлийн дараа мэдэгдэл энд харагдана'}
              </div>
              {filter === 'unread' && notifs.length > 0 && (
                <button onClick={()=>setFilter('all')}
                  style={{ marginTop:16, padding:'9px 20px', background:C.ch, color:C.pp, border:'none', borderRadius:8, fontSize:13, cursor:'pointer' }}>
                  Бүгдийг харах
                </button>
              )}
            </div>
          ) : (
            shown.map(n => <NRow key={n.id} n={n} onRead={markRead}/>)
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform:translateX(100%); opacity:0; }
          to   { transform:translateX(0);   opacity:1; }
        }
      `}</style>
    </div>
  );
}

/* ── Bell with unread badge ── */
export function NotificationBell({ onClick }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db,'notifications'),
      where('uid','==',user.uid),
      where('read','==',false),
      limit(99)
    );
    return onSnapshot(q, snap => setCount(snap.size), ()=>{});
  }, [user]);

  return (
    <button onClick={onClick}
      style={{ position:'relative', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:C.sl }}>
      <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      {count > 0 && (
        <div style={{ position:'absolute', top:3, right:3, minWidth:16, height:16, background:'#DC2626', color:'#fff', borderRadius:99, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:`2px solid ${C.pp}` }}>
          {count > 9 ? '9+' : count}
        </div>
      )}
    </button>
  );
}

/* ── Helper to create a notification ── */
export async function createNotification(uid, { type='system', title, body }) {
  try {
    await addDoc(collection(db,'notifications'), {
      uid, type, title, body, read:false, createdAt:serverTimestamp(),
    });
  } catch(e) {
    console.error('createNotification error:', e);
  }
}

export default NotificationsPanel;
