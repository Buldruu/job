import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { createNotification } from '../components/Notifications';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const C = {
  ch:'#5B3BFF', ch5:'#F5F3FF', pg:'#F5F7FF',
  gd:'#FFB020', gdd:'#D97706', gd5:'#FEF3C7',
  sl:'#64748B', sll:'#94A3B8', hl:'#E2E8F0', hls:'#F1F5F9',
  pp:'#FFFFFF', ink:'#1E293B',
  vg:'#22C55E', vg5:'#DCFCE7',
};

const fmt = (n) => '₮ ' + Number(n).toLocaleString();

const isPremiumActive = (profile) => {
  if (!profile?.premiumPlan || profile.premiumPlan === 'free') return false;
  const until = profile.premiumUntil?.toDate?.() || profile.premiumUntil;
  if (!until) return false;
  return new Date(until) > new Date();
};

/* ── DAN Verification screen ── */
function DANScreen({ onVerified, onBack }) {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleDAN = async () => {
    setLoading(true);
    // Simulate DAN verification (90 sec redirect)
    // In production: redirect to https://dan.gov.mn
    await new Promise(r => setTimeout(r, 2000));
    setVerified(true);
    setLoading(false);
  };

  if (verified) {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.pg }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
            <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>DAN баталгаажуулалт</div>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px', textAlign:'center' }}>
          <div style={{ width:64, height:64, background:C.vg, color:C.pp, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
            <svg style={{width:36,height:36}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, marginBottom:8 }}>Баталгаажлаа!</div>
          <div style={{ fontSize:13, color:C.sl, lineHeight:1.5, marginBottom:28 }}>Таны DAN баталгаажуулалт амжилттай дууслаа. Одоо Premium идэвхжүүлж болно.</div>
          <button onClick={onVerified}
            style={{ width:'100%', maxWidth:280, padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' }}>
            Premium руу үргэлжлүүлэх →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.pg }}>
      {/* Appbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>DAN баталгаажуулалт</div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {/* Icon */}
        <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
          <div style={{ width:72, height:72, background:C.ch5, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:C.ch }}>
            <svg style={{width:36,height:36}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
          </div>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:20, fontWeight:500, color:C.ch, marginBottom:10 }}>Үндэсний цахим танилт</div>
          <div style={{ fontSize:13, color:C.sl, lineHeight:1.5, maxWidth:300, margin:'0 auto' }}>
            Банкинд ашигладагтай ижил <strong style={{color:C.ch}}>DAN</strong> системээр өөрийгөө баталгаажуул.
          </div>
        </div>

        {/* Why needed */}
        <div style={{ background:C.gd5, border:`1px solid rgba(201,169,97,0.3)`, borderRadius:12, padding:16, marginBottom:14 }}>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:C.gdd, fontWeight:600, marginBottom:12 }}>ЭНЭ ЮУНД ХЭРЭГТЭЙ ВЭ?</div>
          {[
            'Захиалагч итгэлтэйгээр ажил өгөх',
            'Эскроу системээр төлбөр хамгаалах',
            'Verified үнэлгээ авч итгэлээ нэмэх',
          ].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:22, height:22, background:C.vg, color:C.pp, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg style={{width:12,height:12}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div style={{ fontSize:13, color:C.ink }}>{item}</div>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div style={{ background:C.ch5, borderRadius:10, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <svg style={{width:16,height:16,color:C.ch,flexShrink:0,marginTop:1}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div style={{ fontSize:12, color:C.ch, lineHeight:1.5 }}>
            Таны хувийн мэдээллийг HaGa хадгалахгүй. DAN зөвхөн нэрс таних зорилгоор ашиглана.
          </div>
        </div>
      </div>

      {/* Action button */}
      <div style={{ padding:'12px 16px 24px', borderTop:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button onClick={handleDAN} disabled={loading}
          style={{ display:'block', width:'100%', padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Холбогдож байна...' : 'DAN руу шилжих (90 секунд)'}
        </button>
      </div>
    </div>
  );
}

/* ── Premium screen — Image left ── */
function PremiumScreen({ onBack, onBuy }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isActive = isPremiumActive(profile);
  const [paying, setPaying] = useState(false);
  const [showDAN, setShowDAN] = useState(false);
  const [danDone, setDANDone] = useState(false);

  const features = [
    { label:'Ажилд санал илгээх', starred:true },
    { label:'Шууд урилга илгээх, хүлээн авах', starred:true },
    { label:'Ирсэн саналуудыг харах', starred:true },
    { label:'DAN-аар баталгаажих', starred:false },
    { label:'Эскроу хамгаалалт', starred:false },
    { label:'Verified үнэлгээ', starred:false },
    { label:'Premium тэмдэг, дээгүүр харагдах', starred:false },
    { label:'Эксперт болох боломж', starred:false },
  ];

  const handleBuyClick = () => {
    if (!danDone) {
      setShowDAN(true);
    } else {
      onBuy();
    }
  };

  if (showDAN) {
    return <DANScreen onBack={()=>setShowDAN(false)} onVerified={()=>{ setDANDone(true); setShowDAN(false); }}/>;
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.ch, minHeight:'100%' }}>
      {/* Dark appbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:'rgba(0,0,0,0.2)', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.pg, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.pg }}>Premium</div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 20px 0' }}>
        {/* Eyebrow */}
        <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:C.gd, fontWeight:600, marginBottom:8 }}>
          PREMIUM ҮЙЛЧИЛГЭЭ
        </div>
        {/* Title */}
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:26, fontWeight:500, color:C.pg, letterSpacing:'-0.01em', lineHeight:1.15, marginBottom:10 }}>
          Ажил, хэлцэл, итгэл
        </div>
        {/* Tagline */}
        <div style={{ fontFamily:"'Source Serif 4',serif", fontStyle:'italic', fontSize:14, color:'rgba(247,242,233,0.8)', lineHeight:1.45, marginBottom:22 }}>
          HaGa дээр бизнес хийхэд хэрэгтэй бүх зүйл нэг дор.
        </div>

        {/* Active badge */}
        {isActive && (
          <div style={{ background:'rgba(201,169,97,0.2)', border:`1px solid ${C.gd}`, borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:18 }}>💎</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.gd }}>Premium идэвхтэй</div>
              <div style={{ fontSize:11, color:'rgba(247,242,233,0.7)', marginTop:2 }}>
                {profile.premiumUntil?.toDate ? new Date(profile.premiumUntil.toDate()).toLocaleDateString('mn-MN') : ''} хүртэл хүчинтэй
              </div>
            </div>
          </div>
        )}

        {/* DAN required notice */}
        {!danDone && !isActive && (
          <div style={{ background:'rgba(201,169,97,0.15)', border:`1px solid rgba(201,169,97,0.4)`, borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', gap:10, alignItems:'flex-start' }}>
            <svg style={{width:16,height:16,color:C.gd,flexShrink:0,marginTop:1}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            <div style={{ fontSize:12, color:'rgba(247,242,233,0.85)', lineHeight:1.5 }}>
              Premium авахын тулд эхлээд <strong style={{color:C.gd}}>DAN</strong> баталгаажуулалт хийх шаардлагатай.
            </div>
          </div>
        )}

        {danDone && !isActive && (
          <div style={{ background:'rgba(45,122,79,0.3)', border:'1px solid rgba(45,122,79,0.5)', borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', gap:10, alignItems:'center' }}>
            <svg style={{width:16,height:16,color:'#6EE7B7',flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <div style={{ fontSize:12, color:'rgba(247,242,233,0.9)' }}>DAN баталгаажуулалт амжилттай ✓</div>
          </div>
        )}

        {/* Features */}
        <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px' }}>
          {features.map((f, i) => (
            <li key={i} style={{ fontSize:13, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:10, fontWeight: f.starred ? 500 : 400, color: f.starred ? C.pg : 'rgba(247,242,233,0.8)' }}>
              <div style={{ width: f.starred ? 8 : 6, height: f.starred ? 8 : 6, borderRadius:'50%', background:C.gd, flexShrink:0 }}/>
              {f.label}
            </li>
          ))}
        </ul>

        {/* Price box */}
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 16px', marginBottom:6 }}>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(247,242,233,0.7)', marginBottom:6 }}>САНАЛ БОЛГОЖ БУЙ</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontFamily:"'Source Serif 4',serif", fontSize:26, fontWeight:500, color:C.pg }}>₮ 39,000</span>
            <span style={{ fontSize:13, color:'rgba(247,242,233,0.6)' }}>/ сар</span>
          </div>
          <div style={{ fontSize:12, color:'rgba(247,242,233,0.55)', marginTop:4 }}>Жилийн төлбөрөөр сард ₮ 29,000</div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'14px 20px 30px', flexShrink:0 }}>
        {isActive ? (
          <div style={{ textAlign:'center', padding:'13px', color:C.gd, fontSize:14, fontWeight:500 }}>💎 Premium идэвхтэй байна</div>
        ) : (
          <>
            <button onClick={handleBuyClick} disabled={paying}
              style={{ display:'block', width:'100%', padding:13, background:C.gd, color:C.ch, border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', opacity: paying ? 0.7 : 1, marginBottom:10 }}>
              {paying ? 'Боловсруулж байна...' : danDone ? 'Premium ашиглах' : 'DAN баталгаажуулж, Premium авах'}
            </button>
            <div style={{ textAlign:'center', fontSize:12, color:'rgba(247,242,233,0.5)' }}>Хэдийд ч цуцалж болно</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Мэргэшсэн worker cards ── */
function MergejiltenTab() {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    return onSnapshot(query(collection(db,'users')), snap => {
      setWorkers(snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.zovshoorol===true));
    });
  }, []);

  const filtered = workers.filter(w => {
    if (!search) return true;
    return [w.ner,w.ovog,w.chiglel,w.chadvar].some(v=>(v||'').toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div style={{ padding:16 }}>
      <div style={{ background:C.pp, border:`1px solid ${C.hl}`, borderRadius:10, padding:'11px 14px', display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <svg style={{width:18,height:18,color:C.sl,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Нэр, чиглэл..."
          style={{ flex:1, border:'none', outline:'none', fontSize:14, color:C.ink, background:'transparent' }}/>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:C.sl }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
          <div style={{ fontSize:14 }}>Мэргэшсэн ажилтан олдсонгүй</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(w => (
            <div key={w.id} style={{ background:C.pp, border:`1px solid ${C.hls}`, borderRadius:12, padding:14, display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:C.gd, color:C.ch, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:18, fontWeight:500, flexShrink:0, overflow:'hidden' }}>
                {w.photoURL ? <img src={w.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (w.ner||'?')[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight:500, color:C.ch, marginBottom:2 }}>
                  {w.ner ? `${w.ovog||''} ${w.ner}`.trim() : '—'}
                </div>
                {w.chiglel && <div style={{ fontSize:12, color:C.sl, marginBottom:4 }}>{w.chiglel}</div>}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, background:C.vg, color:C.pp, padding:'2px 8px', borderRadius:99, fontWeight:500 }}>✓ Баталгаажсан</span>
                  {w.zэрэг && <span style={{ fontSize:10, background:C.gd, color:C.ch, padding:'2px 8px', borderRadius:99, fontWeight:500 }}>🏅 {w.zэрэг}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main export ── */
export default function ProSection() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('premium');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBuy = async () => {
    const bal = profile?.balance || 0;
    if (bal < 39000) {
      alert(`Үлдэгдэл хүрэлцэхгүй.\nШаардлагатай: ₮39,000\nТаны үлдэгдэл: ₮${bal.toLocaleString()}`);
      return;
    }
    if (!window.confirm('Premium багцыг ₮39,000/сар идэвхжүүлэх үү?')) return;
    setPaying(true);
    try {
      const { runTransaction, doc: fd, increment } = await import('firebase/firestore');
      const premiumUntil = new Date(Date.now() + 30*24*60*60*1000);
      await runTransaction(db, async tx => {
        const uRef = fd(db,'users',user.uid);
        const snap = await tx.get(uRef);
        if ((snap.data().balance||0) < 39000) throw new Error('Үлдэгдэл хүрэлцэхгүй');
        tx.update(uRef, { balance: increment(-39000), premiumPlan:'pro', premiumUntil });
      });
      await addDoc(collection(db,'transactions'),{
        uid:user.uid, type:'zarlaga', amount:39000,
        note:'Premium багц', createdAt:serverTimestamp(),
      });
      setSuccess(true);
      try {
        await createNotification(user.uid, {
          type:'premium',
          title:'Premium идэвхжлээ! 💎',
          body:'Таны Premium багц амжилттай идэвхжлээ. Бүх боломжийг ашиглаарай.',
        });
      } catch(e) {}
    } catch(e) { alert(e.message||'Алдаа гарлаа'); }
    setPaying(false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:C.pg }}>
      {/* Tabs */}
      <div style={{ display:'flex', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        {[
          { key:'premium',     label:'💎 Premium' },
          { key:'mergejilten', label:'🏅 Мэргэшсэн' },
        ].map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ flex:1, padding:'13px 8px', fontSize:13, fontWeight: tab===t.key ? 600 : 500,
              color: tab===t.key ? C.ch : C.sl, background:'none', border:'none', cursor:'pointer',
              borderBottom: tab===t.key ? `2.5px solid ${C.gd}` : '2.5px solid transparent',
              transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
        {tab === 'premium' && (
          success ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, marginBottom:8 }}>Амжилттай!</div>
              <div style={{ fontSize:13, color:C.sl, marginBottom:24 }}>Premium багц идэвхжлээ. Бүх боломжийг ашиглаарай.</div>
              <button onClick={()=>setSuccess(false)} style={{ padding:'12px 28px', background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, cursor:'pointer' }}>Буцах</button>
            </div>
          ) : (
            <PremiumScreen onBack={()=>navigate(-1)} onBuy={handleBuy}/>
          )
        )}
        {tab === 'mergejilten' && <MergejiltenTab/>}
      </div>
    </div>
  );
}
