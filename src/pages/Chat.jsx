import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot,
         addDoc, serverTimestamp, doc, setDoc, getDoc,
         updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const C = {
  ch:'#1A2B4A', ch5:'#EEF1F6', pg:'#F7F2E9', pgd:'#EDE5D2',
  gd:'#C9A961', sl:'#6B7280', sll:'#9CA3AF',
  hl:'#D9D2C2', hls:'#E8E2D2', pp:'#FFFFFF', ink:'#1F1F1F',
};

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now() - d) / 1000;
  if (s < 60)    return 'Сая';
  if (s < 3600)  return `${Math.floor(s/60)} мин`;
  if (s < 86400) return `${Math.floor(s/3600)} цаг`;
  return d.toLocaleDateString('mn-MN');
}

/* ── Single chat message ── */
function Bubble({ msg, isMe }) {
  return (
    <div style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom:6 }}>
      <div style={{
        maxWidth:'78%', padding:'9px 12px',
        borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isMe ? C.ch : C.pp,
        border: isMe ? 'none' : `1px solid ${C.hls}`,
        color: isMe ? C.pg : C.ink,
        fontSize:13, lineHeight:1.4,
      }}>
        {msg.text}
        <div style={{ fontSize:9, opacity:0.6, marginTop:4, textAlign: isMe ? 'right' : 'left' }}>
          {timeAgo(msg.createdAt)}
        </div>
      </div>
    </div>
  );
}

/* ── Chat room ── */
function ChatRoom({ chatId, otherUser, jobTitle, onBack }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      setMsgs(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
    // Mark as read
    if (chatId && user) {
      updateDoc(doc(db,'chats',chatId), {
        [`unread.${user.uid}`]: 0,
      }).catch(()=>{});
    }
  }, [msgs.length]);

  const send = async () => {
    if (!text.trim()) return;
    const t = text.trim();
    setText('');
    await addDoc(collection(db,'chats',chatId,'messages'), {
      text: t, uid: user.uid, createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db,'chats',chatId), {
      lastMsg: t,
      lastMsgAt: serverTimestamp(),
      [`unread.${otherUser.id}`]: (msgs.filter(m=>m.uid!==user.uid).length + 1),
    }).catch(()=>{});
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:C.pg }}>
      {/* Appbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex', padding:0 }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ width:36, height:36, borderRadius:'50%', background:C.gd, color:C.ch, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, flexShrink:0 }}>
          {(otherUser?.ner||'?')[0].toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {otherUser?.ner ? `${otherUser.ovog||''} ${otherUser.ner}`.trim() : '—'}
          </div>
          {jobTitle && <div style={{ fontSize:11, color:C.sl, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{jobTitle}</div>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', WebkitOverflowScrolling:'touch' }}>
        {msgs.length === 0 && (
          <div style={{ textAlign:'center', padding:'32px 0', color:C.sl }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:13 }}>Энд анхны зурвасаа илгээгээрэй</div>
          </div>
        )}
        {msgs.map(m => <Bubble key={m.id} msg={m} isMe={m.uid === user.uid}/>)}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:8, borderTop:`1px solid ${C.hls}`, background:C.pp, display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
        <input value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(); } }}
          placeholder="Зурвас бичих..."
          style={{ flex:1, padding:'10px 14px', background:C.pg, border:`1px solid ${C.hl}`, borderRadius:20, fontSize:13, color:C.ink, outline:'none' }}/>
        <button onClick={send} disabled={!text.trim()}
          style={{ width:38, height:38, background:C.ch, color:C.pp, border:'none', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:text.trim()?1:0.5, flexShrink:0 }}>
          <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ── Chat list ── */
export default function Chat() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null); // { chatId, otherUser, jobTitle }
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db,'chats'),
      where('members','array-contains', user.uid),
      orderBy('lastMsgAt','desc')
    );
    return onSnapshot(q, async snap => {
      const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      // Load other user profiles
      const needed = [...new Set(list.flatMap(c => c.members).filter(id => id !== user.uid))];
      const cache = {...userCache};
      await Promise.all(needed.filter(id=>!cache[id]).map(async id => {
        try {
          const s = await getDoc(doc(db,'users',id));
          if (s.exists()) cache[id] = { id, ...s.data() };
        } catch(e) {}
      }));
      setUserCache(cache);
      setChats(list);
    }, ()=>{});
  }, [user]);

  if (active) {
    return (
      <ChatRoom
        chatId={active.chatId}
        otherUser={active.otherUser}
        jobTitle={active.jobTitle}
        onBack={()=>setActive(null)}
      />
    );
  }

  return (
    <div style={{ background:C.pg, minHeight:'100%' }}>
      {/* Header */}
      <div style={{ padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>Чат</div>
      </div>

      {chats.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, padding:'48px 32px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch, marginBottom:8 }}>Чат байхгүй</div>
          <div style={{ fontSize:13, color:C.sl, lineHeight:1.5 }}>
            Ажилтан сонгон авахад чат автоматаар үүснэ
          </div>
        </div>
      ) : (
        <div>
          {chats.map(chat => {
            const otherId = chat.members?.find(id => id !== user.uid);
            const other = userCache[otherId] || {};
            const unread = chat.unread?.[user.uid] || 0;
            return (
              <button key={chat.id}
                onClick={()=>setActive({ chatId:chat.id, otherUser:{id:otherId,...other}, jobTitle:chat.jobTitle })}
                style={{ display:'flex', gap:12, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, cursor:'pointer', width:'100%', textAlign:'left', alignItems:'center', border:'none' }}>
                <div style={{ width:46, height:46, borderRadius:'50%', background:C.gd, color:C.ch, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Source Serif 4',serif", fontSize:18, fontWeight:500, flexShrink:0, overflow:'hidden' }}>
                  {other.photoURL ? <img src={other.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (other.ner||'?')[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:14, fontWeight: unread>0 ? 600 : 500, color:C.ch, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {other.ner ? `${other.ovog||''} ${other.ner}`.trim() : otherId?.slice(0,8)||'—'}
                    </div>
                    <div style={{ fontSize:10, color:C.sll, flexShrink:0 }}>{timeAgo(chat.lastMsgAt)}</div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:12, color:C.sl, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                      {chat.lastMsg || chat.jobTitle || '...'}
                    </div>
                    {unread > 0 && (
                      <div style={{ minWidth:18, height:18, background:C.ch, color:C.pp, borderRadius:99, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', marginLeft:8, flexShrink:0 }}>
                        {unread}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Helper: create or open chat ── */
export async function startChat(currentUid, otherUid, jobTitle = '') {
  // Check if chat already exists
  const q = query(
    collection(db,'chats'),
    where('members','array-contains', currentUid)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => {
    const m = d.data().members || [];
    return m.includes(otherUid) && d.data().jobTitle === jobTitle;
  });
  if (existing) return existing.id;

  // Create new chat
  const ref = await addDoc(collection(db,'chats'), {
    members: [currentUid, otherUid],
    jobTitle,
    lastMsg: '',
    lastMsgAt: serverTimestamp(),
    unread: { [currentUid]:0, [otherUid]:1 },
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
