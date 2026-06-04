import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot,
         addDoc, serverTimestamp, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const C = {
  ch:'#5B3BFF', ch5:'#F5F3FF', pg:'#F5F7FF',
  gd:'#FFB020', gdd:'#D97706', gd5:'#FEF3C7',
  sl:'#64748B', sll:'#94A3B8', hl:'#E2E8F0', hls:'#F1F5F9',
  pp:'#FFFFFF', ink:'#1E293B',
  vg:'#22C55E', vg5:'#DCFCE7',
};

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now()-d)/1000;
  if (s < 60)    return 'Сая';
  if (s < 3600)  return `${Math.floor(s/60)} мин`;
  if (s < 86400) return `${Math.floor(s/3600)} цаг`;
  return d.toLocaleDateString('mn-MN');
}

/* ── Offer bubble ── */
function OfferBubble({ msg, isMe, onAccept, onDecline }) {
  const accepted = msg.offerStatus === 'accepted';
  const declined = msg.offerStatus === 'declined';
  return (
    <div style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', marginBottom:10 }}>
      <div style={{ maxWidth:'85%', background:isMe?C.ch:C.pp, border:`1px solid ${isMe?C.ch:C.hls}`, borderRadius:14, padding:14, borderBottomRightRadius:isMe?4:14, borderBottomLeftRadius:isMe?14:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <span style={{ fontSize:18 }}>🤝</span>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:isMe?C.gd:C.gdd }}>ҮНИЙН САНАЛ</span>
        </div>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:24, fontWeight:500, color:isMe?C.pg:C.ch, marginBottom:4 }}>
          ₮ {Number(msg.offerAmount).toLocaleString()}
        </div>
        {msg.offerNote && <div style={{ fontSize:12, color:isMe?'rgba(247,242,233,0.75)':C.sl, marginBottom:10, lineHeight:1.4 }}>{msg.offerNote}</div>}
        {accepted && <div style={{ fontSize:13, color:C.vg, fontWeight:600 }}>✅ Зөвшөөрсөн</div>}
        {declined && <div style={{ fontSize:13, color:'#A63D40', fontWeight:600 }}>❌ Татгалзсан</div>}
        {!accepted && !declined && !isMe && (
          <div style={{ display:'flex', gap:6, marginTop:10 }}>
            <button onMouseDown={e=>{e.preventDefault();onDecline();}}
              style={{ flex:1, padding:'8px', background:'transparent', border:`1px solid #A63D40`, color:'#A63D40', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer' }}>
              Татгалзах
            </button>
            <button onMouseDown={e=>{e.preventDefault();onAccept();}}
              style={{ flex:2, padding:'8px', background:C.vg, border:'none', color:C.pp, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
              ✅ Зөвшөөрөх
            </button>
          </div>
        )}
        {!accepted && !declined && isMe && (
          <div style={{ fontSize:11, color:'rgba(247,242,233,0.45)', marginTop:8 }}>Хариу хүлээж байна...</div>
        )}
        <div style={{ fontSize:9, color:isMe?'rgba(247,242,233,0.35)':C.sll, marginTop:6, textAlign:'right' }}>{timeAgo(msg.createdAt)}</div>
      </div>
    </div>
  );
}

/* ── Chat room ── */
function ChatRoom({ chatId, otherUser, jobTitle, onBack }) {
  const { user } = useAuth();
  const [msgs,       setMsgs]       = useState([]);
  const [text,       setText]       = useState('');
  const [showOffer,  setShowOffer]  = useState(false);
  const [offerAmt,   setOfferAmt]   = useState('');
  const [offerNote,  setOfferNote]  = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db,'chats',chatId,'messages'), orderBy('createdAt','asc'));
    return onSnapshot(q, snap => setMsgs(snap.docs.map(d=>({id:d.id,...d.data()}))));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:'smooth'});
    if (chatId && user) updateDoc(doc(db,'chats',chatId),{[`unread.${user.uid}`]:0}).catch(()=>{});
  }, [msgs.length]);

  const send = async () => {
    if (!text.trim()) return;
    const t = text.trim(); setText('');
    await addDoc(collection(db,'chats',chatId,'messages'), { text:t, uid:user.uid, type:'text', createdAt:serverTimestamp() });
    await updateDoc(doc(db,'chats',chatId), { lastMsg:t, lastMsgAt:serverTimestamp(), [`unread.${otherUser.id}`]:1 }).catch(()=>{});
  };

  const sendOffer = async () => {
    if (!offerAmt || isNaN(parseInt(offerAmt))) return;
    const amt = parseInt(offerAmt);
    await addDoc(collection(db,'chats',chatId,'messages'), { type:'offer', uid:user.uid, offerAmount:amt, offerNote:offerNote.trim(), offerStatus:'pending', createdAt:serverTimestamp() });
    await updateDoc(doc(db,'chats',chatId), { lastMsg:`🤝 ₮${amt.toLocaleString()} санал`, lastMsgAt:serverTimestamp(), [`unread.${otherUser.id}`]:1 }).catch(()=>{});
    setOfferAmt(''); setOfferNote(''); setShowOffer(false);
  };

  const respondOffer = async (msgId, status) => {
    await updateDoc(doc(db,'chats',chatId,'messages',msgId), { offerStatus:status });
    const txt = status==='accepted' ? '✅ Санал зөвшөөрөгдлөө!' : '❌ Санал татгалзагдлаа';
    await addDoc(collection(db,'chats',chatId,'messages'), { type:'text', uid:user.uid, text:txt, createdAt:serverTimestamp() });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:C.pg }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex', padding:0 }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ width:38, height:38, borderRadius:'50%', background:C.gd, color:C.ch, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:16, fontWeight:500, flexShrink:0 }}>
          {(otherUser?.ner||'?')[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {otherUser?.ner ? `${otherUser.ovog||''} ${otherUser.ner}`.trim() : '—'}
          </div>
          {jobTitle && <div style={{ fontSize:11, color:C.sl }}>{jobTitle}</div>}
        </div>
        <button onClick={()=>setShowOffer(v=>!v)}
          style={{ background:C.gd5, border:`1.5px solid ${C.gd}`, borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600, color:C.gdd, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:4 }}>
          🤝 Санал
        </button>
      </div>

      {/* Offer panel */}
      {showOffer && (
        <div style={{ background:C.gd5, borderBottom:`1px solid ${C.gd}`, padding:'14px 16px', flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.gdd, marginBottom:10 }}>🤝 Үнийн санал илгээх</div>
          {/* Quick amounts */}
          <div style={{ display:'flex', gap:6, marginBottom:8 }}>
            {[50000,100000,200000,500000].map(v=>(
              <button key={v} onClick={()=>setOfferAmt(String(v))} type="button"
                style={{ flex:1, padding:'7px 0', background:offerAmt===String(v)?C.ch:C.pp, color:offerAmt===String(v)?C.pg:C.ch, border:`1px solid ${C.gd}`, borderRadius:8, fontSize:11, fontWeight:500, cursor:'pointer' }}>
                {v/1000}K
              </button>
            ))}
          </div>
          <input type="number" value={offerAmt} onChange={e=>setOfferAmt(e.target.value)} placeholder="₮ Дүн оруулах..."
            style={{ width:'100%', padding:'10px 12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:14, marginBottom:8, outline:'none', background:C.pp, boxSizing:'border-box' }}/>
          <input value={offerNote} onChange={e=>setOfferNote(e.target.value)} placeholder="Тайлбар (сонголт)..."
            style={{ width:'100%', padding:'10px 12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:13, marginBottom:10, outline:'none', background:C.pp, boxSizing:'border-box' }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>{setShowOffer(false);setOfferAmt('');setOfferNote('');}}
              style={{ flex:1, padding:'10px', background:C.pp, border:`1px solid ${C.hl}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.sl }}>
              Болих
            </button>
            <button onClick={sendOffer} disabled={!offerAmt}
              style={{ flex:2, padding:'10px', background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', opacity:offerAmt?1:0.5 }}>
              Санал илгээх →
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', WebkitOverflowScrolling:'touch' }}>
        {msgs.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
            <div style={{ fontSize:14, color:C.sl, marginBottom:6 }}>Анхны зурвасаа илгээгээрэй</div>
            <div style={{ fontSize:12, color:C.sll }}>🤝 Санал товч дарж үнийн санал явуулж болно</div>
          </div>
        )}
        {msgs.map(m => {
          const isMe = m.uid === user.uid;
          if (m.type === 'offer') {
            return (
              <OfferBubble key={m.id} msg={m} isMe={isMe}
                onAccept={!isMe ? ()=>respondOffer(m.id,'accepted') : null}
                onDecline={!isMe ? ()=>respondOffer(m.id,'declined') : null}
              />
            );
          }
          return (
            <div key={m.id} style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', marginBottom:6 }}>
              <div style={{ maxWidth:'78%', padding:'9px 12px', borderRadius:14, background:isMe?C.ch:C.pp, border:isMe?'none':`1px solid ${C.hls}`, color:isMe?C.pg:C.ink, fontSize:13, lineHeight:1.4, borderBottomRightRadius:isMe?4:14, borderBottomLeftRadius:isMe?14:4 }}>
                {m.text}
                <div style={{ fontSize:9, opacity:0.4, marginTop:4, textAlign:'right' }}>{timeAgo(m.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:8, borderTop:`1px solid ${C.hls}`, background:C.pp, display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
        <input value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
          placeholder="Зурвас бичих..."
          style={{ flex:1, padding:'10px 14px', background:C.pg, border:`1px solid ${C.hl}`, borderRadius:20, fontSize:13, color:C.ink, outline:'none' }}/>
        <button onClick={send} disabled={!text.trim()}
          style={{ width:38, height:38, background:C.ch, color:C.pp, border:'none', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:text.trim()?1:0.4, flexShrink:0 }}>
          <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ── Main Chat list ── */
export default function Chat() {
  const { user }   = useAuth();
  const location   = useLocation();
  const [chats,     setChats]     = useState([]);
  const [active,    setActive]    = useState(null);
  const [userCache, setUserCache] = useState({});

  // Read navigation state once on mount — open specific chat
  const navState = useRef(location.state || {});

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db,'chats'),
      where('members','array-contains',user.uid),
      orderBy('lastMsgAt','desc')
    );
    return onSnapshot(q, async snap => {
      const list = snap.docs.map(d=>({id:d.id,...d.data()}));

      // Load user profiles
      const needed = [...new Set(list.flatMap(c=>c.members||[]).filter(id=>id!==user.uid))];
      const cache  = {...userCache};
      await Promise.all(needed.filter(id=>!cache[id]).map(async id=>{
        try {
          const s = await getDoc(doc(db,'users',id));
          if (s.exists()) cache[id] = {id,...s.data()};
        } catch(e) {}
      }));
      setUserCache(cache);
      setChats(list);

      // Auto-open from navigation state (after "Ажилд авах" click)
      const {openChatId, otherUid} = navState.current;
      if (openChatId) {
        const chat = list.find(c=>c.id===openChatId);
        if (chat) {
          const other = cache[otherUid] || {id:otherUid};
          setActive({chatId:openChatId, otherUser:other, jobTitle:chat.jobTitle});
          navState.current = {}; // clear so it doesn't re-trigger
        }
      }
    }, ()=>{});
  }, [user]);

  if (active) {
    return <ChatRoom chatId={active.chatId} otherUser={active.otherUser} jobTitle={active.jobTitle} onBack={()=>setActive(null)}/>;
  }

  return (
    <div style={{ background:C.pg, minHeight:'100%' }}>
      <div style={{ padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>Чат</div>
      </div>

      {chats.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, padding:'48px 24px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch, marginBottom:8 }}>Чат байхгүй</div>
          <div style={{ fontSize:13, color:C.sl, lineHeight:1.5 }}>Зарын дэлгэрэнгүй дотор "Ажилд авах" дарахад чат автоматаар үүснэ</div>
        </div>
      ) : (
        chats.map(chat => {
          const otherId = chat.members?.find(id=>id!==user.uid);
          const other   = userCache[otherId] || {};
          const unread  = chat.unread?.[user.uid] || 0;
          return (
            <button key={chat.id}
              onClick={()=>setActive({chatId:chat.id, otherUser:{id:otherId,...other}, jobTitle:chat.jobTitle})}
              style={{ display:'flex', gap:12, padding:'13px 16px', background: unread>0?'#F5F7FF':C.pp, borderBottom:`1px solid ${C.hls}`, cursor:'pointer', width:'100%', textAlign:'left', alignItems:'center', border:'none' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:46, height:46, borderRadius:'50%', background:C.gd, color:C.ch, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:18, fontWeight:500, overflow:'hidden' }}>
                  {other.photoURL ? <img src={other.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (other.ner||'?')[0]?.toUpperCase()}
                </div>
                {unread > 0 && (
                  <div style={{ position:'absolute', top:-2, right:-2, width:16, height:16, background:C.ch, color:C.pp, borderRadius:'50%', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${C.pp}` }}>
                    {unread>9?'9+':unread}
                  </div>
                )}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight:unread>0?600:500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {other.ner ? `${other.ovog||''} ${other.ner}`.trim() : otherId?.slice(0,8)||'—'}
                  </div>
                  <div style={{ fontSize:10, color:C.sll, flexShrink:0 }}>{timeAgo(chat.lastMsgAt)}</div>
                </div>
                <div style={{ fontSize:12, color:unread>0?C.ch:C.sl, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:unread>0?500:400 }}>
                  {chat.lastMsg||chat.jobTitle||'...'}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}

/* ── startChat helper ── */
export async function startChat(currentUid, otherUid, jobTitle='') {
  if (!currentUid || !otherUid) {
    throw new Error('Missing user IDs');
  }
  if (currentUid === otherUid) {
    throw new Error('Cannot chat with yourself');
  }
  try {
    // Find existing chat
    const q    = query(collection(db,'chats'), where('members','array-contains',currentUid));
    const snap = await getDocs(q);
    const existing = snap.docs.find(d => {
      const data = d.data();
      const m = data.members || [];
      return m.includes(otherUid) && (data.jobTitle||'') === (jobTitle||'');
    });
    if (existing) return existing.id;
  } catch(e) {
    console.warn('Existing chat check failed:', e);
    // Continue to create anyway
  }

  // Create new chat with members ordered consistently
  const members = [currentUid, otherUid].sort();
  const ref = await addDoc(collection(db,'chats'), {
    members,
    jobTitle: jobTitle || '',
    lastMsg:     '',
    lastMsgAt:   serverTimestamp(),
    unread:      {[currentUid]:0, [otherUid]:1},
    createdAt:   serverTimestamp(),
  });
  return ref.id;
}
