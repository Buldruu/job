import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc,
         runTransaction, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { createNotification } from '../components/Notifications';

const C = {
  ch:'#1A2B4A', ch5:'#EEF1F6', pg:'#F7F2E9', pgd:'#EDE5D2',
  gd:'#C9A961', gdd:'#A8893F', gd5:'#FAF1DC',
  sl:'#6B7280', sll:'#9CA3AF', hl:'#D9D2C2', hls:'#E8E2D2',
  pp:'#FFFFFF', ink:'#1F1F1F',
  vg:'#2D7A4F', vg5:'#EDF7F2',
  red:'#A63D40', red5:'#FEF2F2',
};

const fmt = (n) => '₮ ' + Number(n||0).toLocaleString();

function timeAgo(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now() - d) / 1000;
  if (s < 3600)  return `${Math.floor(s/60)} мин`;
  if (s < 86400) return `${Math.floor(s/3600)} цаг`;
  return `${Math.floor(s/86400)} өдөр`;
}

/* ── Stat card ── */
function StatCard({ icon, label, value, sub, color = C.ch5 }) {
  return (
    <div style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:'14px 16px', display:'flex', gap:12, alignItems:'center' }}>
      <div style={{ width:44, height:44, background:color, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:C.sl, fontWeight:500 }}>{label}</div>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, lineHeight:1.2 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:C.sl, marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Monthly chart bar ── */
function MonthBar({ label, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
      <div style={{ width:28, fontSize:11, color:C.sl, textAlign:'right', flexShrink:0 }}>{label}</div>
      <div style={{ flex:1, height:20, background:C.ch5, borderRadius:4, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:C.ch, borderRadius:4, transition:'width .4s', minWidth: count>0?4:0 }}/>
      </div>
      <div style={{ width:24, fontSize:12, fontWeight:600, color:C.ch, textAlign:'right', flexShrink:0 }}>{count}</div>
    </div>
  );
}

export default function Admin() {
  const { profile, user } = useAuth();
  const [users,  setUsers]  = useState([]);
  const [txns,   setTxns]   = useState([]);
  const [tab,    setTab]    = useState('stats');

  // Transfer form
  const [targetUid, setTargetUid]   = useState('');
  const [amount,    setAmount]      = useState('');
  const [note,      setNote]        = useState('');
  const [sending,   setSending]     = useState(false);
  const [txMsg,     setTxMsg]       = useState('');

  // User search
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(
      query(collection(db,'transactions'), orderBy('createdAt','desc')),
      snap => setTxns(snap.docs.map(d => ({ id:d.id, ...d.data() }))),
      () => {}
    );
    return () => { unsub1(); unsub2(); };
  }, []);

  if (!profile?.isAdmin) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:12 }}>
        <div style={{ fontSize:40 }}>🔒</div>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:18, color:C.ch }}>Хандах эрх байхгүй</div>
      </div>
    );
  }

  /* ── Stats calculations ── */
  const now   = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1);

  const newThisMonth = users.filter(u => {
    const d = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
    return d && d >= thisMonthStart;
  }).length;

  const newLastMonth = users.filter(u => {
    const d = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
    return d && d >= lastMonthStart && d < thisMonthStart;
  }).length;

  const premiumUsers = users.filter(u => {
    if (!u.premiumPlan || u.premiumPlan === 'free') return false;
    const until = u.premiumUntil?.toDate?.() || (u.premiumUntil ? new Date(u.premiumUntil) : null);
    return until && until > now;
  }).length;

  // Monthly registration chart — last 6 months
  const months = Array.from({length:6}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const end = new Date(now.getFullYear(), now.getMonth()-i+1, 1);
    const mn = d.toLocaleString('mn-MN', {month:'short'});
    const count = users.filter(u => {
      const cd = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
      return cd && cd >= d && cd < end;
    }).length;
    return { label: mn, count };
  }).reverse();
  const maxCount = Math.max(...months.map(m=>m.count), 1);

  /* ── Transfer money ── */
  const handleTransfer = async () => {
    if (!targetUid.trim() || !amount) { setTxMsg('Хэрэглэгч болон дүнг оруулна уу'); return; }
    const amt = parseInt(amount);
    if (isNaN(amt) || amt <= 0) { setTxMsg('Дүн буруу'); return; }
    setSending(true); setTxMsg('');
    try {
      await runTransaction(db, async tx => {
        const uRef = doc(db, 'users', targetUid.trim());
        const snap = await tx.get(uRef);
        if (!snap.exists()) throw new Error('Хэрэглэгч олдсонгүй');
        const cur = snap.data().balance || 0;
        tx.update(uRef, { balance: cur + amt });
      });
      await addDoc(collection(db,'transactions'), {
        uid: targetUid.trim(), type:'orlogo', amount: amt,
        note: note || 'Админаас шилжүүлсэн',
        fromAdmin: true, adminUid: user.uid,
        createdAt: serverTimestamp(),
      });
      await createNotification(targetUid.trim(), {
        type:'payment',
        title:'Дансанд мөнгө орлоо 💳',
        body:`${fmt(amt)} таны дансанд орлоо. ${note || 'Админаас шилжүүлсэн'}.`,
      });
      setTxMsg(`✅ ${fmt(amt)} амжилттай шилжлээ`);
      setAmount(''); setNote(''); setTargetUid('');
    } catch(e) {
      setTxMsg('❌ ' + (e.message || 'Алдаа гарлаа'));
    }
    setSending(false);
  };

  /* ── User search ── */
  const filteredUsers = userSearch
    ? users.filter(u =>
        [u.ner, u.ovog, u.email, u.id].some(v => (v||'').toLowerCase().includes(userSearch.toLowerCase()))
      )
    : users.slice(0,30);

  const TABS = [
    { key:'stats',   label:'📊 Статистик' },
    { key:'users',   label:'👥 Хэрэглэгчид' },
    { key:'transfer',label:'💸 Шилжүүлэг' },
    { key:'txns',    label:'📋 Гүйлгээ' },
  ];

  return (
    <div style={{ background:C.pg, minHeight:'100%' }}>
      {/* Header */}
      <div style={{ padding:'13px 16px', background:C.ch, color:C.pg, display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ fontSize:20 }}>⚙️</div>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500 }}>Админ хэнэгэл</div>
        <div style={{ marginLeft:'auto', fontSize:11, background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:20 }}>
          {users.length} нийт хэрэглэгч
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:C.pp, borderBottom:`1px solid ${C.hls}`, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ flexShrink:0, padding:'11px 14px', fontSize:12, fontWeight:tab===t.key?600:500, color:tab===t.key?C.ch:C.sl, background:'none', border:'none', cursor:'pointer', borderBottom:tab===t.key?`2.5px solid ${C.gd}`:'2.5px solid transparent', whiteSpace:'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:16 }}>

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Key stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <StatCard icon="👥" label="Нийт хэрэглэгч" value={users.length} color={C.ch5}/>
              <StatCard icon="🆕" label="Энэ сар" value={newThisMonth}
                sub={newLastMonth > 0 ? `Өнгөрсөн сар: ${newLastMonth}` : undefined}
                color="#EDF7F2"/>
              <StatCard icon="💎" label="Premium" value={premiumUsers} color={C.gd5}/>
              <StatCard icon="📋" label="Гүйлгээ" value={txns.length} color={C.ch5}/>
            </div>

            {/* Monthly chart */}
            <div style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:'16px' }}>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, color:C.ch, marginBottom:14 }}>
                📈 Сарын бүртгэл
              </div>
              {months.map(m => (
                <MonthBar key={m.label} label={m.label} count={m.count} max={maxCount}/>
              ))}
            </div>

            {/* This month highlight */}
            <div style={{ background:C.ch, color:C.pg, borderRadius:12, padding:'16px' }}>
              <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:C.gd, marginBottom:6 }}>
                {now.toLocaleString('mn-MN',{month:'long', year:'numeric'})}
              </div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:36, fontWeight:500, color:C.pp, lineHeight:1 }}>
                {newThisMonth}
              </div>
              <div style={{ fontSize:13, color:'rgba(247,242,233,0.7)', marginTop:4 }}>
                шинэ хэрэглэгч бүртгүүлсэн
              </div>
              {newLastMonth > 0 && (
                <div style={{ marginTop:8, fontSize:12, color: newThisMonth >= newLastMonth ? '#6EE7B7' : '#FCA5A5' }}>
                  {newThisMonth >= newLastMonth ? '▲' : '▼'} Өмнөх сартай харьцуулахад {Math.abs(newThisMonth - newLastMonth)} {newThisMonth >= newLastMonth ? 'илүү' : 'бага'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:C.pp, border:`1px solid ${C.hl}`, borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
              <svg style={{width:16,height:16,color:C.sl}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)}
                placeholder="Нэр, и-мэйл, UID хайх..."
                style={{ flex:1, border:'none', outline:'none', fontSize:14, color:C.ink, background:'transparent' }}/>
            </div>
            <div style={{ fontSize:11, color:C.sl, marginBottom:8 }}>{filteredUsers.length} хэрэглэгч</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {filteredUsers.map(u => {
                const joined = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
                const isPrem = u.premiumPlan && u.premiumPlan !== 'free' && u.premiumUntil &&
                  ((u.premiumUntil?.toDate?.() || new Date(u.premiumUntil)) > now);
                return (
                  <div key={u.id} style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:isPrem?C.gd:C.ch5, color:isPrem?C.ch:C.ch, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, flexShrink:0, overflow:'hidden' }}>
                        {u.photoURL ? <img src={u.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (u.ner||u.email||'?')[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:13, fontWeight:500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {u.ner ? `${u.ovog||''} ${u.ner}`.trim() : (u.email||u.id.slice(0,12))}
                          </div>
                          {isPrem && <span style={{ fontSize:9, background:C.gd, color:C.ch, padding:'1px 6px', borderRadius:99, fontWeight:700, flexShrink:0 }}>PRO</span>}
                          {u.isAdmin && <span style={{ fontSize:9, background:C.ch, color:C.pg, padding:'1px 6px', borderRadius:99, fontWeight:700, flexShrink:0 }}>ADMIN</span>}
                        </div>
                        <div style={{ display:'flex', gap:8, marginTop:2 }}>
                          <span style={{ fontSize:11, color:C.sl }}>{fmt(u.balance||0)}</span>
                          {joined && <span style={{ fontSize:11, color:C.sll }}>{joined.toLocaleDateString('mn-MN')}</span>}
                        </div>
                      </div>
                      {/* Quick transfer */}
                      <button onClick={()=>{ setTargetUid(u.id); setTab('transfer'); }}
                        style={{ fontSize:11, color:C.ch, background:C.ch5, border:'none', borderRadius:8, padding:'5px 10px', cursor:'pointer', flexShrink:0, fontWeight:500 }}>
                        💸
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TRANSFER TAB ── */}
        {tab === 'transfer' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:16 }}>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch, marginBottom:16 }}>
                💸 Хэрэглэгч рүү мөнгө шилжүүлэх
              </div>

              {/* User selector */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:6 }}>ХЭРЭГЛЭГЧ СОНГОХ</div>
                <select value={targetUid} onChange={e=>setTargetUid(e.target.value)}
                  style={{ width:'100%', padding:'11px 12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:13, color:C.ink, background:C.pp, outline:'none' }}>
                  <option value="">— Хэрэглэгч сонгоно уу —</option>
                  {users.filter(u=>!u.isAdmin).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.ner ? `${u.ovog||''} ${u.ner}`.trim() : (u.email||u.id.slice(0,16))} — {fmt(u.balance||0)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:6 }}>ДҮНГИЙН ХЭМЖЭЭ (₮)</div>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  {[10000,50000,100000,500000].map(v => (
                    <button key={v} type="button" onClick={()=>setAmount(String(v))}
                      style={{ flex:1, padding:'8px 4px', background:amount===String(v)?C.ch:C.ch5, color:amount===String(v)?C.pg:C.ch, border:'none', borderRadius:8, fontSize:11, fontWeight:500, cursor:'pointer' }}>
                      {v>=1000?`${v/1000}K`:v}
                    </button>
                  ))}
                </div>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                  placeholder="Дүн оруулах..."
                  style={{ width:'100%', padding:'11px 12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:14, color:C.ink, background:C.pp, outline:'none' }}/>
              </div>

              {/* Note */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:6 }}>ТАЙЛБАР (сонголт)</div>
                <input value={note} onChange={e=>setNote(e.target.value)}
                  placeholder="Шилжүүлгийн шалтгаан..."
                  style={{ width:'100%', padding:'11px 12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:13, color:C.ink, background:C.pp, outline:'none' }}/>
              </div>

              {/* Selected user balance preview */}
              {targetUid && (() => {
                const u = users.find(x=>x.id===targetUid);
                return u ? (
                  <div style={{ background:C.ch5, borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                    <div style={{ fontSize:12, color:C.ch }}>
                      <strong>{u.ner ? `${u.ovog||''} ${u.ner}`.trim() : u.email}</strong> —
                      Одоогийн үлдэгдэл: <strong>{fmt(u.balance||0)}</strong>
                      {amount && parseInt(amount) > 0 && (
                        <span style={{ color:C.vg }}> → {fmt((u.balance||0) + parseInt(amount))}</span>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {txMsg && (
                <div style={{ padding:'10px 14px', borderRadius:8, background: txMsg.startsWith('✅') ? C.vg5 : C.red5, color: txMsg.startsWith('✅') ? C.vg : C.red, fontSize:13, marginBottom:12, fontWeight:500 }}>
                  {txMsg}
                </div>
              )}

              <button onClick={handleTransfer} disabled={sending || !targetUid || !amount}
                style={{ display:'block', width:'100%', padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: (sending||!targetUid||!amount) ? 0.5 : 1 }}>
                {sending ? 'Шилжүүлж байна...' : `💸 ${amount ? fmt(parseInt(amount)||0) : '₮ 0'} шилжүүлэх`}
              </button>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {tab === 'txns' && (
          <div>
            <div style={{ fontSize:11, color:C.sl, marginBottom:8 }}>Сүүлийн {Math.min(txns.length,50)} гүйлгээ</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {txns.slice(0,50).map(tx => {
                const u = users.find(x=>x.id===tx.uid);
                const name = u?.ner ? `${u.ovog||''} ${u.ner}`.trim() : (u?.email || tx.uid?.slice(0,12));
                const isIn = tx.type === 'orlogo';
                return (
                  <div key={tx.id} style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:10, padding:'11px 14px', display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background: isIn?C.vg5:C.red5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                      {isIn ? '⬇️' : '⬆️'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                      <div style={{ fontSize:11, color:C.sl, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.note || tx.type}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color: isIn ? C.vg : C.red }}>
                        {isIn?'+':'-'}{fmt(tx.amount)}
                      </div>
                      <div style={{ fontSize:10, color:C.sll }}>{timeAgo(tx.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              {txns.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 0', color:C.sl }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                  <div>Гүйлгээ байхгүй</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
