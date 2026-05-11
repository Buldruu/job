import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const C = {
  ch:'#1A2B4A', ch5:'#EEF1F6', pg:'#F7F2E9',
  gd:'#C9A961', gdd:'#A8893F',
  sl:'#6B7280', sll:'#9CA3AF', hl:'#D9D2C2', hls:'#E8E2D2',
  pp:'#FFFFFF', ink:'#1F1F1F',
  vg:'#2D7A4F', vg5:'#EDF7F2',
  red:'#DC2626', red5:'#FEF2F2',
};

/* ── Notification type icons + colors ── */
const N_TYPES = {
  sanal:     { icon:'📋', label:'Санал', color:'#EEF1F6' },
  urilt:     { icon:'✉️', label:'Урилга', color:'#FAF1DC' },
  payment:   { icon:'💳', label:'Төлбөр', color:'#EDF7F2' },
  rating:    { icon:'⭐', label:'Үнэлгээ', color:'#FAF1DC' },
  system:    { icon:'🔔', label:'Систем', color:'#EEF1F6' },
  premium:   { icon:'💎', label:'Premium', color:'#FAF1DC' },
  verified:  { icon:'✅', label:'Баталгаа', color:'#EDF7F2' },
};

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)   return 'Сая';
  if (diff < 3600) return `${Math.floor(diff/60)} мин`;
  if (diff < 86400)return `${Math.floor(diff/3600)} цаг`;
  if (diff < 604800)return `${Math.floor(diff/86400)} өдөр`;
  return d.toLocaleDateString('mn-MN');
}

/* ── Notification item ── */
function NItem({ notif, onRead }) {
  const t = N_TYPES[notif.type] || N_TYPES.system;
  return (
    <div onClick={()=>!notif.read && onRead(notif.id)}
      style={{ display:'flex', gap:12, padding:'13px 16px', background: notif.read ? C.pp : '#FAFBFF', borderBottom:`1px solid ${C.hls}`, cursor: notif.read ? 'default' : 'pointer', position:'relative' }}>
      {/* Unread dot */}
      {!notif.read && (
        <div style={{ position:'absolute', left:6, top:'50%', transform:'translateY(-50%)', width:6, height:6, borderRadius:'50%', background:C.ch }}/>
      )}
      {/* Icon */}
      <div style={{ width:40, height:40, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
        {t.icon}
      </div>
      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8, marginBottom:3 }}>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:13, fontWeight:500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {notif.title}
          </div>
          <div style={{ fontSize:10, color:C.sll, flexShrink:0 }}>{timeAgo(notif.createdAt)}</div>
        </div>
        <div style={{ fontSize:12, color:C.sl, lineHeight:1.4 }}>{notif.body}</div>
      </div>
    </div>
  );
}

/* ── Notifications Panel ── */
export function NotificationsPanel({ onClose }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [filter, setFilter] = useState('all'); // all | unread

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
  }, [user]);

  const markRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read:true });
  };

  const markAllRead = async () => {
    const batch = writeBatch(db);
    notifs.filter(n=>!n.read).forEach(n => {
      batch.update(doc(db,'notifications',n.id), { read:true });
    });
    await batch.commit();
  };

  const unreadCount = notifs.filter(n=>!n.read).length;
  const shown = filter === 'unread' ? notifs.filter(n=>!n.read) : notifs;

  return (
    <div style={{ position:'absolute', inset:0, zIndex:50, display:'flex', flexDirection:'column' }}>
      {/* Backdrop */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }} onClick={onClose}/>

      {/* Panel slides from right */}
      <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'100%', maxWidth:480, background:C.pp, display:'flex', flexDirection:'column', boxShadow:'-4px 0 24px rgba(0,0,0,0.12)', animation:'slideInRight .22s ease-out' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex', padding:0 }}>
              <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>
              Мэдэгдэл
              {unreadCount > 0 && (
                <span style={{ marginLeft:8, fontSize:12, background:C.ch, color:C.pp, padding:'1px 7px', borderRadius:99, fontFamily:"'Manrope',sans-serif", fontWeight:600 }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:C.ch, fontWeight:500 }}>
              Бүгдийг уншсан
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
          {[['all','Бүгд'],['unread','Уншаагүй']].map(([k,l]) => (
            <button key={k} onClick={()=>setFilter(k)}
              style={{ flex:1, padding:'10px', fontSize:13, fontWeight: filter===k ? 600 : 500, color: filter===k ? C.ch : C.sl, background:'none', border:'none', cursor:'pointer', borderBottom: filter===k ? `2.5px solid ${C.gd}` : '2.5px solid transparent' }}>
              {l} {k==='unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:'auto', background:C.pg }}>
          {shown.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'40px 0', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:16, color:C.ch, marginBottom:6 }}>Мэдэгдэл байхгүй</div>
              <div style={{ fontSize:13, color:C.sl }}>Шинэ мэдэгдэл ирэхэд энд харагдана</div>
            </div>
          ) : (
            shown.map(n => <NItem key={n.id} notif={n} onRead={markRead}/>)
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Bell icon with badge (for appbar) ── */
export function NotificationBell({ onClick }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      where('read', '==', false),
      limit(99)
    );
    return onSnapshot(q, snap => setCount(snap.size));
  }, [user]);

  return (
    <button onClick={onClick}
      style={{ position:'relative', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:C.sl }}>
      <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      {count > 0 && (
        <div style={{ position:'absolute', top:4, right:4, minWidth:16, height:16, background:'#DC2626', color:'#fff', borderRadius:99, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:`1.5px solid ${C.pp}` }}>
          {count > 9 ? '9+' : count}
        </div>
      )}
    </button>
  );
}

/* ── Helper: create notification from code ── */
export async function createNotification(uid, { type='system', title, body }) {
  await addDoc(collection(db, 'notifications'), {
    uid, type, title, body, read:false, createdAt:serverTimestamp(),
  });
}

export default NotificationsPanel;
