import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const SYSTEM_PROMPT = `Та HaGA платформын AI туслах юм. HaGA бол Монголын ажлын зах зээлийн дижитал платформ.

## HaGa платформын бүрэн мэдлэг:

### Платформын тухай
- HaGA = "Haaga" буюу монголоор "Халтура" (хөлсний ажил) гэсэн үгнээс гаралтай
- Зорилго: Монгол хүн бүрт ажлын боломж олгох, ажилгүйдлийг бууруулах

### Үндсэн цэснүүд:
1. Нүүр — Нүүр хуудас, онцлох зарууд
2. Ажил хайх — Ажил хайж буй хүмүүсийн зарууд
3. Ажилтан хайх — Компаниудын ажлын байрны зарууд
4. Мэргэшсэн ажилтан — Баталгаажсан мэргэжилтнүүд
5. Санхүү — Дотоод данс, шилжүүлэг, escrow гүйлгээ
6. Premium — Давуу эрхийн тариф (Basic 9,900₮, Pro 24,900₮, Business 59,900₮)
7. Сургалт — Мэргэжил дээшлүүлэх сургалт

### Зар нэмэх:
- Нэвтэрч профайл бөглөсний дараа зар нэмэх боломжтой
- Үнэгүй хэрэглэгч: 3 хүртэл зар
- CV (.docx) upload хийхэд автоматаар уншина

### Үнэлгээ:
- 1-5 одоор үнэлгээ өгч "✓ Үнэлэх" товч дарж баталгаажуулна

### Онцлох зар:
- 5,000₮ төлж зараа онцлох болгоно, хайлтанд дээр гарна

### Мэргэшсэн ажилтан болох:
- Профайл дотор мэргэжлийн үнэмлэх, диплом зургийг upload хийж хүсэлт илгээнэ
- Зэрэг: Мастер, Доктор, Мэргэжлийн үнэмлэх
- Админ баталгаажуулсны дараа "Мэргэшсэн ажилтан" хэсэгт харагдана

### Санхүү:
- Дотоод данс ₮ тэнгэрээр
- Шууд шилжүүлэг — тэр даруй хүрнэ
- Барилттай шилжүүлэг (Escrow): захиалагч мөнгө хадгалуулна → ажил хийнэ → зөвшөөрвөл мөнгө гарна

### Хайлт:
- Текст хайлт — бүх талбараас
- Ерөнхий болон дэд чиглэлээр шүүх

Та хэрэглэгчийн асуултанд монгол хэлээр, найрсаг, товч тодорхой хариул.`;

// Gemini API endpoints - try in order
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest', 
  'gemini-pro',
];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export default function AIChat() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [ready, setReady] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const msgsRef = useRef([]);

  // Keep ref in sync
  useEffect(() => { msgsRef.current = msgs; }, [msgs]);

  // Initial greeting
  useEffect(() => {
    const greeting = {
      role: 'ai',
      text: `Сайн байна уу${profile?.ner ? `, ${profile.ner}` : ''}! 👋\n\nБи HaGA платформын AI туслах. Ажил хайх, зар нэмэх, санхүүгийн гүйлгээ болон бусад аливаа асуулт байвал асуугаарай.`,
    };
    setMsgs([greeting]);
  }, []);

  // Load API key from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'ai'), snap => {
      if (snap.exists() && snap.data().geminiKey) {
        setApiKey(snap.data().geminiKey);
        setReady(true);
      } else {
        setReady(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, msgs.length]);

  // Core send function — accepts text directly (fixes quick-button race condition)
  const send = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading || !ready || !apiKey) return;

    const currentMsgs = msgsRef.current;
    const newUserMsg = { role: 'user', text: trimmed };
    const updated = [...currentMsgs, newUserMsg];
    setMsgs(updated);
    setInput('');
    setLoading(true);

    // Build history for Gemini (exclude initial greeting, only user+model turns)
    const history = currentMsgs
      .filter(m => m.role === 'user' || m.role === 'ai')
      .slice(1) // skip greeting
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    // Ensure history alternates correctly — Gemini requires user first
    const validHistory = [];
    for (let i = 0; i < history.length; i++) {
      if (i === 0 && history[i].role !== 'user') continue;
      validHistory.push(history[i]);
    }

    try {
      // Include system context in contents (works with all Gemini models)
      const systemTurn = [
        { role: 'user', parts: [{ text: `Дараах зааврыг дагана уу:\n\n${SYSTEM_PROMPT}\n\nОй тойм хийж, бэлэн гэж хэлнэ үү.` }] },
        { role: 'model', parts: [{ text: 'Ойлголоо. Би HaGA платформын AI туслах болж бэлэн байна.' }] },
      ];

      const body = {
        contents: [
          ...systemTurn,
          ...validHistory,
          { role: 'user', parts: [{ text: trimmed }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          stopSequences: [],
        },
      };

      const GEMINI_URL = `${GEMINI_BASE}/${GEMINI_MODELS[0]}:generateContent`;
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('Gemini response:', JSON.stringify(data).slice(0, 500));

      if (!res.ok) {
        const errMsg = data?.error?.message || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      // Handle different response structures
      const candidate = data?.candidates?.[0];
      
      // Check if blocked by safety
      if (candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'RECITATION') {
        setMsgs(m => [...m, { role: 'ai', text: 'Уучлаарай, энэ асуулт дээр хариулах боломжгүй байна.' }]);
        setLoading(false);
        return;
      }

      // Extract text from various possible structures
      const reply =
        candidate?.content?.parts?.[0]?.text ||
        candidate?.content?.parts?.[0]?.inlineData?.data ||
        candidate?.output ||
        data?.text ||
        null;

      if (!reply) {
        console.error('Could not find text in response:', data);
        throw new Error('Хоосон хариу ирлээ');
      }

      setMsgs(m => [...m, { role: 'ai', text: reply }]);
    } catch (err) {
      console.error('Gemini error:', err);
      let errText = '⚠️ Хариу авч чадсангүй.';
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
        errText = '🔑 API түлхүүр буруу байна. Админтай холбогдоно уу.';
      } else if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        errText = '⏳ Өдрийн хязгаарт хүрлээ. Маргааш дахин оролдоно уу.';
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        errText = '🌐 Интернет холболт шалгана уу.';
      }
      setMsgs(m => [...m, { role: 'ai', text: errText }]);
    }

    setLoading(false);
  }, [loading, ready, apiKey]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const QUICK = [
    'Яаж зар нэмэх вэ?',
    'Premium яаж авах вэ?',
    'Барилттай шилжүүлэг юу вэ?',
    'Мэргэшсэн ажилтан болох',
  ];

  return createPortal(
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40
          w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center
          transition-all active:scale-95 bg-gradient-to-br from-brand-500 to-brand-700"
        title="AI Туслах"
      >
        {open
          ? <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          : <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>}
        {!open && <span className="absolute inset-0 rounded-2xl animate-ping bg-brand-400 opacity-25"/>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-40
          w-[calc(100vw-32px)] sm:w-96 max-h-[70vh] flex flex-col
          bg-white rounded-3xl shadow-2xl border border-surf-200 overflow-hidden"
          style={{ animation: 'slideUp .2s ease-out' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5
            bg-gradient-to-r from-brand-500 to-brand-700 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">HaGA AI Туслах</div>
              <div className="text-white/60 text-xs flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-emerald-300 animate-pulse' : 'bg-red-300'}`}/>
                {ready ? 'Бэлэн' : 'Тохируулагаагүй'}
              </div>
            </div>
            <button onClick={() => setMsgs(m => m.slice(0, 1))}
              title="Чат цэвэрлэх"
              className="text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/10 text-xs">
              ↺
            </button>
          </div>

          {!ready && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex-shrink-0">
              ⚠️ AI туслах одоогоор идэвхгүй байна.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                    🤖
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : 'bg-surf-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                <div className="bg-surf-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay:`${i*0.15}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick questions */}
          {msgs.length <= 1 && ready && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
              {QUICK.map(q => (
                <button key={q}
                  onClick={() => send(q)}
                  className="text-xs bg-brand-50 border border-brand-100 text-brand-600
                    px-2.5 py-1 rounded-full hover:bg-brand-100 transition active:scale-95">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-surf-100 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={ready ? 'Асуулт бичнэ үү... (Enter)' : 'Одоогоор идэвхгүй...'}
                disabled={!ready || loading}
                rows={1}
                className="flex-1 resize-none bg-surf-50 border border-surf-200 rounded-2xl
                  px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-300 transition
                  max-h-24 disabled:opacity-50"
                style={{ minHeight:40 }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading || !ready}
                className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-40
                  rounded-2xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
            <p className="text-center mt-1.5 text-xs text-gray-300">HaGA AI · Google Gemini</p>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
