import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { MAIN_CATS } from '../data/chiglel';
import { startChat } from './Chat';

/* ── Job-seeker card ── */
function SeekerCard({ seeker, onChat, onView }) {
  return (
    <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:14, padding:14, marginBottom:10 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--primary-100)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:600, flexShrink:0, overflow:'hidden', position:'relative' }}>
          {seeker.photoURL ? <img src={seeker.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (seeker.ner||'?')[0]?.toUpperCase()}
          {seeker.zovshoorol && (
            <div style={{ position:'absolute', bottom:-2, right:-2, width:18, height:18, background:'var(--success)', borderRadius:'50%', border:'2px solid var(--bg-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10 }}>✓</div>
          )}
        </div>
        <div style={{ flex:1, minWidth:0 }} onClick={onView}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:2 }}>
            {`${seeker.ovog||''} ${seeker.ner||''}`.trim() || 'Ажил хайгч'}
          </div>
          {seeker.chiglel && (
            <div style={{ fontSize:12, color:'var(--primary)', fontWeight:500, marginBottom:4 }}>
              {seeker.chiglel}
            </div>
          )}
          {seeker.turshlaga && (
            <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>
              📅 {seeker.turshlaga} жилийн туршлагатай
            </div>
          )}
          {seeker.tsalin && (
            <div style={{ fontSize:11, color:'var(--ink)', fontWeight:500, marginBottom:6 }}>
              💰 Үйлчилгээний төлбөр: ₮{seeker.tsalin}
            </div>
          )}
          {seeker.chadvar && (
            <div style={{ fontSize:11, color:'var(--slate-500)', lineHeight:1.4, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {seeker.chadvar}
            </div>
          )}
          {seeker.hayg && (
            <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>
              📍 {seeker.hayg}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio thumbnails */}
      {(seeker.portfolio||[]).length > 0 && (
        <div style={{ display:'flex', gap:5, marginTop:10, overflowX:'auto' }}>
          {seeker.portfolio.slice(0,4).map((url, i) => (
            <div key={i} style={{ width:54, height:54, borderRadius:8, overflow:'hidden', flexShrink:0, border:'1px solid var(--border-light)' }}>
              <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          ))}
          {seeker.portfolio.length > 4 && (
            <div style={{ width:54, height:54, borderRadius:8, background:'var(--slate-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'var(--slate-500)', flexShrink:0 }}>
              +{seeker.portfolio.length-4}
            </div>
          )}
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <button onClick={onChat}
          style={{ flex:1, padding:'10px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          📋 Ажил эхлүүлэх
        </button>
      </div>
    </div>
  );
}

export default function Workspace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [seekers, setSeekers]       = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMain, setFilterMain] = useState('');

  /* ── Load job-seekers from 'jobs' collection (where ажил хайгчид өөрсдийн профайлаа оруулсан) ── */
  useEffect(() => {
    const u = onSnapshot(
      query(collection(db,'jobs')),
      snap => {
        const all = snap.docs.map(d => ({ id:d.id, ...d.data() }));
        setSeekers(all.filter(s => s.uid !== user?.uid));
      },
      () => {}
    );
    return () => u();
  }, [user]);

  /* ── Filter ── */
  const filtered = seekers.filter(s => {
    if (filterMain && s.chiglel_main !== filterMain) return false;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      const blob = `${s.ner||''} ${s.ovog||''} ${s.chiglel||''} ${s.chadvar||''} ${s.hayg||''} ${s.cv_text||''}`.toLowerCase();
      if (!blob.includes(t)) return false;
    }
    return true;
  });

  /* ── Chat handler ── */
  const handleChat = async (seeker) => {
    if (!user) { navigate('/login'); return; }
    try {
      const jobTitle = seeker.chiglel || 'Ажил';
      const chatId = await startChat(user.uid, seeker.uid, jobTitle, seeker.id);
      // Auto-send initial offer
      try {
        const { addDoc, collection, serverTimestamp, doc, updateDoc } = await import('firebase/firestore');
        const greetMsg = `📋 Сайн байна уу! Та "${jobTitle}" чиглэлээр мэргэшсэн гэж танилцлаа. Танд ажил санал болгож байна. Сонирхож байна уу?`;
        await addDoc(collection(db,'chats',chatId,'messages'), {
          uid: user.uid,
          type: 'text',
          text: greetMsg,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db,'chats',chatId), {
          lastMsg: greetMsg,
          lastMsgAt: serverTimestamp(),
          [`unread.${seeker.uid}`]: 1,
        });
      } catch(e) { console.warn('Initial msg failed:', e); }
      const otherUserHint = {
        id: seeker.uid,
        ner: seeker.ner || 'Ажил хайгч',
        ovog: seeker.ovog || '',
        photoURL: seeker.photoURL || '',
        chiglel: seeker.chiglel || '',
      };
      navigate('/chat', { state:{ openChatId: chatId, otherUid: seeker.uid, otherUserHint, jobTitle } });
    } catch(e) {
      alert('Ажил эхлүүлэхэд алдаа: '+e.message);
    }
  };

  return (
    <div style={{ padding:16, background:'var(--bg-secondary)', minHeight:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:14 }} className="animate-fade-up">
        <h1 style={{ fontFamily:"'Poppins',sans-serif", fontSize:24, fontWeight:700, color:'var(--ink)', margin:0 }}>Ажилтан хайх</h1>
        <div style={{ fontSize:12, color:'var(--slate-500)', marginTop:2 }}>Ажил хайж буй хүмүүсийн зар</div>
      </div>

      {/* Search input */}
      <div style={{ position:'relative', marginBottom:12 }}>
        <svg style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:16,height:16,color:'var(--slate-400)'}}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
          placeholder="Нэр, чадвар, чиглэл хайх..."
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

      {/* Count */}
      <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:10 }}>
        {filtered.length} ажил хайгч олдлоо
      </div>

      {/* Job seeker list */}
      {filtered.length === 0 ? (
        <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:16, padding:'32px 24px', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Ажил хайгч олдсонгүй</div>
          <div style={{ fontSize:12, color:'var(--slate-500)', lineHeight:1.5 }}>
            Хайлтын нөхцлөө өөрчилж дахин үзнэ үү.
          </div>
        </div>
      ) : (
        <div>
          {filtered.map(s => (
            <SeekerCard key={s.id} seeker={s}
              onChat={()=>handleChat(s)}
              onView={()=>navigate(`/ajil?id=${s.id}`)}/>
          ))}
        </div>
      )}
    </div>
  );
}
