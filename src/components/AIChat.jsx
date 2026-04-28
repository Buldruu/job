import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const SYSTEM_PROMPT = `Та HaGA платформын AI туслах юм. HaGA бол Монголын ажлын зах зээлийн дижитал платформ.

## HaGA платформын бүрэн мэдлэг:

### Платформын тухай
- HaGA = "Haaga" буюу монголоор "Халтура" (хөлсний ажил) гэсэн үгнээс гаралтай
- Зорилго: Монгол хүн бүрт ажлын боломж олгох, ажилгүйдлийг бууруулах
- Вэб: https://buldruu.github.io/job/

### Үндсэн цэснүүд:
1. **Нүүр** — Нүүр хуудас, онцлох зарууд
2. **Ажил хайх** — Ажил хайж буй хүмүүсийн зарууд
3. **Ажилтан хайх** — Компаниудын ажлын байрны зарууд
4. **Мэргэшсэн ажилтан** — Баталгаажсан мэргэжлийн үнэмлэхтэй мэргэжилтнүүд
5. **Санхүү** — Дотоод данс, шилжүүлэг, escrow гүйлгээ
6. **Premium** — Давуу эрхийн тариф
7. **Сургалт** — Мэргэжил дээшлүүлэх сургалт
8. **Профайл** — Хэрэглэгчийн мэдээлэл

### Бүртгэл ба нэвтрэлт:
- Имэйл/нууц үгээр бүртгэх
- Google, Facebook-аар нэг дарах нэвтрэлт
- Утасны дугаараар OTP кодоор нэвтрэх

### Зар нэмэх:
- Профайл бөглөсний дараа зар нэмэх боломжтой
- Мэргэжлийн чиглэл (Excel-ийн дагуу): Боловсрол, Урлаг хүмүүнлэг, Нийгмийн шинжлэх ухаан мэдээлэл сэтгүүл зүй, Бизнес удирдлага эрхзүй, Байгалийн шинжлэх ухаан математик статистик, Мэдээлэл харилцаа холбооны технологиуд, Инженерчлэл үйлдвэрлэл барилга байгууламж, Хөдөө аж ахуй ой загасны аж ахуй мал эмнэлзүй, Эрүүл мэнд нийгмийн хамгаалал, Үйлчилгээ
- CV файл (.docx) upload хийхэд автоматаар уншина
- Байршил оруулахад хаягийн автокомплет ажиллана

### Үнэлгээний систем:
- Зар бүрт 1-5 одоор үнэлгээ өгч болно
- Үнэлгээ сонгоод "✓ Үнэлэх" товч дарж баталгаажуулна
- Мэргэшсэн ажилтан хэсэгт нэгтгэсэн дундаж үнэлгээ харагдана

### Онцлох зар:
- 5,000₮ төлж зараа онцлох болгоно
- Онцлох зарууд хайлтанд дээр гарна
- Нүүр хуудсанд тусгай хэсэгт харагдана

### Мэргэшсэн ажилтан болох:
- Профайл дотор Мэргэжлийн баталгаажуулалт хэсэгт мэдээлэл оруулна
- Зэрэг сонгоно: Мастер, Доктор, Мэргэжлийн үнэмлэх
- Диплом/үнэмлэхийн зурагтай хүсэлт илгээнэ
- Админ хянаж баталгаажуулна — баталгаажсаны дараа "Мэргэшсэн ажилтан" хэсэгт харагдана

### Санхүүгийн систем:
- Дотоод данс ₮ тэнгэрээр
- Шууд шилжүүлэг — тэр даруй хүрнэ
- Барилттай шилжүүлэг (Escrow): захиалагч мөнгө хадгалуулна → гүйцэтгэгч ажил хийнэ → захиалагч зөвшөөрнө → мөнгө гарна

### Premium тариф (₮/сар):
- **Үнэгүй**: 3 зар
- **Basic** 9,900₮: 10 зар, 5 онцлох, 💎 badge
- **Pro** 24,900₮: 30 зар, 20 онцлох, хайлтанд дээр гарах
- **Business** 59,900₮: хязгааргүй зар, платформд сурталчилгаа

### Хайлтын систем:
- Текст хайлт — нэр, байршил, компани, чадвар зэрэг бүх талбараас
- Ерөнхий чиглэлээр шүүх → дэд чиглэлээр нарийвчлах
- Premium хэрэглэгчид нэмэлт шүүлтүүр: үнэлэгдсэн, онцлох, premium зарууд, доод цалингаар шүүх

Та хэрэглэгчийн асуултанд монгол хэлээр, найрсаг, товч тодорхой хариул. Хэрэгтэй бол цэс, алхамуудаар жагсаан тайлбарла.`;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export default function AIChat() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'ai', text: `Сайн байна уу${profile?.ner ? `, ${profile.ner}` : ''}! 👋\n\nБи HaGA платформын AI туслах. Ажил хайх, зар нэмэх, санхүүгийн гүйлгээ болон бусад аливаа асуулт байвал асуугаарай.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [ready, setReady] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load API key from Firestore settings (admin-set)
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
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, msgs]);

  const sendMsg = async () => {
    if (!input.trim() || loading || !ready) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = msgs.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: userMsg }] },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API алдаа');
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Хариу авч чадсангүй.';
      setMsgs(m => [...m, { role: 'ai', text: reply }]);
    } catch (err) {
      setMsgs(m => [...m, { role: 'ai', text: `⚠️ Алдаа гарлаа. Дараа дахин оролдоно уу.` }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const QUICK = ['Яаж зар нэмэх вэ?', 'Premium яаж авах вэ?', 'Барилттай шилжүүлэг юу вэ?', 'Мэргэшсэн болох'];

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
          style={{ animation:'slideUp .2s ease-out' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5
            bg-gradient-to-r from-brand-500 to-brand-700">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">HaGA AI Туслах</div>
              <div className="text-white/60 text-xs flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-emerald-300' : 'bg-red-300'}`}/>
                {ready ? 'Бэлэн' : 'Идэвхгүй'}
              </div>
            </div>
          </div>

          {/* Not ready message */}
          {!ready && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
              ⚠️ AI туслах одоогоор идэвхгүй байна. Удахгүй идэвхжинэ.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                <div className="w-7 h-7 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
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
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {QUICK.map(q => (
                <button key={q}
                  onClick={() => { setInput(q); setTimeout(() => { sendMsg(); }, 10); }}
                  className="text-xs bg-brand-50 border border-brand-100 text-brand-600 px-2.5 py-1 rounded-full hover:bg-brand-100 transition">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-surf-100">
            <div className="flex gap-2 items-end">
              <textarea ref={inputRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={ready ? "Асуулт бичнэ үү..." : "Одоогоор идэвхгүй..."}
                disabled={!ready || loading} rows={1}
                className="flex-1 resize-none bg-surf-50 border border-surf-200 rounded-2xl
                  px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-300 transition
                  max-h-24 disabled:opacity-50"
                style={{ minHeight:40 }}/>
              <button onClick={sendMsg}
                disabled={!input.trim() || loading || !ready}
                className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-40
                  rounded-2xl flex items-center justify-center transition-all flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-xs text-gray-300">HaGA AI · Google Gemini</span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
