import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

// HaGA платформын бүрэн мэдлэгтэй AI assistant
const SYSTEM_PROMPT = `Та HaGA платформын AI туслах юм. HaGA бол Монголын ажлын зах зээлийн дижитал платформ.

## HaGA платформын талаарх бүрэн мэдээлэл:

### Платформын мөн чанар
- HaGA = "Haaga" буюу монголоор "Халтура" (хөлсний ажил, gig work) гэсэн үгнээс гаралтай
- Зорилго: Монгол хүн бүрт ажлын боломж олгох, ажилгүйдлийг бууруулах
- Вэб хаяг: https://buldruu.github.io/job/

### Үндсэн хэсгүүд:
1. **Ажил хайх** — Ажил хайж буй хүмүүсийн зарууд
2. **Ажилтан хайх** — Компаниудын ажлын байрны зарууд
3. **Мэргэшсэн ажилтан** — Баталгаажсан мэргэжлийн үнэмлэхтэй мэргэжилтнүүд
4. **Сургалт** — Мэргэжил дээшлүүлэх сургалтын зарууд
5. **Санхүү** — Дотоод данс, шилжүүлэг, барилттай гүйлгээ
6. **Premium** — Давуу эрхийн тариф

### Бүртгэл, нэвтрэлт:
- Имэйл/нууц үгээр бүртгүүлж болно
- Google, Facebook-аар нэг дарах нэвтрэлт
- Утасны дугаараар OTP кодоор нэвтрэх

### Зар нэмэх:
- Профайл бөглөсний дараа зар нэмэх боломжтой
- Ажлын чиглэл сонгохдоо: Боловсрол, Урлаг хүмүүнлэг, Нийгмийн шинжлэх ухаан, Бизнес удирдлага, Байгалийн шинжлэх ухаан, Мэдээлэл технологи, Инженерчлэл, Хөдөө аж ахуй, Эрүүл мэнд, Үйлчилгээ
- CV файл (.docx) upload хийхэд автоматаар уншина
- Байршил оруулахад OpenStreetMap ашиглана

### Үнэлгээний систем:
- Зар бүрт ⭐ үнэлгээ өгч болно (1-5 одоор)
- Үнэлгээ өгсний дараа "✓ Үнэлэх" товч дарж баталгаажуулна
- Мэргэшсэн ажилтан хэсэгт нэгтгэсэн үнэлгээ харагдана

### Онцлох зар:
- 5,000₮ төлж зараа онцлох болгоно
- Онцлох зарууд хайлтанд хамгийн дээр гарна
- Нүүр хуудсанд тусгай хэсэгт харагдана

### Мэргэшсэн ажилтан:
- Мэргэжлийн үнэмлэх, диплом, зэрэгтэй хүмүүс
- Диплом/үнэмлэхийн зурагтай хүсэлт илгээнэ
- Админ хянаж баталгаажуулна
- Мастер, Доктор, Мэргэжлийн үнэмлэх гэсэн 3 зэрэг байна

### Санхүүгийн систем:
- Дотоод данс (₮ тэнгэр)
- Шууд шилжүүлэг — тэр даруй хүрнэ
- Барилттай шилжүүлэг (Escrow) — ажил дуусахад л мөнгө гарна
  * Захиалагч → мөнгө хадгалагдана → гүйцэтгэгч ажил хийнэ → захиалагч зөвшөөрнө → мөнгө гарна

### Premium тариф:
- **Basic** 9,900₮/сар — 10 зар, 5 онцлох зар, 💎 badge
- **Pro** 24,900₮/сар — 30 зар, 20 онцлох зар, хайлтанд дээр гарах
- **Business** 59,900₮/сар — хязгааргүй зар, платформд сурталчилгаа байршуулах эрх
- Үнэгүй хэрэглэгч: 3 зар нэмэх боломжтой

### Хайлтын систем:
- Текст хайлт — нэр, байршил, компани, чадвар гэх мэтийн аль ч талбараас хайна
- Ерөнхий чиглэлээр шүүх (10 ерөнхий чиглэл)
- Дэд чиглэлээр нарийвчлах
- Premium хэрэглэгчид нэмэлт шүүлтүүр: үнэлэгдсэн, онцлох, premium зарууд

### Профайл:
- Зураг upload — автоматаар 200x200px болж багасна (үнэгүй хадгалалт)
- CV текст + Word файл upload
- CV харах, татах товч
- Мэдээлэл, Миний зарууд, Санхүү гэсэн 3 таб

### Нийтлэг асуултын хариулт:
- Бүртгэл үнэгүй
- Зар нэмэх үнэгүй (хязгааргүй биш, 3 хүртэл)
- Firebase ашигладаг (Google-ийн серверт)
- Монгол хэлэнд бүрэн тохирсон

Та хэрэглэгчийн асуултанд монгол хэлээр, найрсаг, товч тодорхой хариул. Хэрэв мэдэхгүй бол "Энэ талаар дэлгэрэнгүй мэдээлэл алга" гэж хэлж болно.`;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export default function AIChat() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: 'ai',
      text: `Сайн байна уу${profile?.ner ? `, ${profile.ner}` : ''}! 👋\n\nБи HaGA платформын AI туслах. Ажил хайх, зар нэмэх, санхүүгийн гүйлгээ болон бусад асуулт байвал асуугаарай.`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('haga_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const apiKeySet = apiKey.length > 10;

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, msgs]);

  const saveKey = (k) => {
    setApiKey(k);
    localStorage.setItem('haga_gemini_key', k);
  };

  const sendMsg = async () => {
    if (!input.trim() || loading || !apiKeySet) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Build conversation history for Gemini
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
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API алдаа');
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Хариу авч чадсангүй.';
      setMsgs(m => [...m, { role: 'ai', text: reply }]);
    } catch (err) {
      setMsgs(m => [...m, {
        role: 'ai',
        text: `⚠️ Алдаа гарлаа: ${err.message}\n\nAPI түлхүүрийг шалгана уу.`,
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const QUICK = [
    'Яаж зар нэмэх вэ?',
    'Premium яаж авах вэ?',
    'Барилттай шилжүүлэг гэж юу вэ?',
    'Мэргэшсэн ажилтан болох',
  ];

  return createPortal(
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40
          w-14 h-14 rounded-2xl shadow-lg
          flex items-center justify-center transition-all active:scale-95
          bg-gradient-to-br from-brand-500 to-brand-700"
        title="AI Туслах"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-brand-400 opacity-30"/>
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-40
          w-[calc(100vw-32px)] sm:w-96 max-h-[70vh] flex flex-col
          bg-white rounded-3xl shadow-2xl border border-surf-200 overflow-hidden"
          style={{ animation:'slideUp .2s ease-out' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surf-100
            bg-gradient-to-r from-brand-500 to-brand-700">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">HaGA AI Туслах</div>
              <div className="text-white/60 text-xs">
                {apiKeySet ? '● Идэвхтэй' : '● API түлхүүр хэрэгтэй'}
              </div>
            </div>
            <button onClick={() => setShowKeyInput(s => !s)}
              className="text-white/60 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              title="API тохиргоо">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>

          {/* API Key setup */}
          {(showKeyInput || !apiKeySet) && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
              <div className="text-xs font-semibold text-amber-700 mb-1.5">
                🔑 Google Gemini API түлхүүр
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1 text-xs bg-white border border-amber-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                />
                <button onClick={() => { saveKey(apiKey); setShowKeyInput(false); }}
                  className="text-xs bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-3 py-2 rounded-xl transition">
                  Хадгалах
                </button>
              </div>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                className="text-xs text-amber-600 hover:underline mt-1 block">
                → aistudio.google.com-оос үнэгүй авах
              </a>
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

            {/* Loading dots */}
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
          {msgs.length <= 1 && apiKeySet && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {QUICK.map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(() => sendMsg(), 50); }}
                  className="text-xs bg-brand-50 border border-brand-100 text-brand-600
                    px-2.5 py-1 rounded-full hover:bg-brand-100 transition">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-surf-100">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={apiKeySet ? "Асуулт бичнэ үү..." : "API түлхүүр оруулна уу"}
                disabled={!apiKeySet || loading}
                rows={1}
                className="flex-1 resize-none bg-surf-50 border border-surf-200 rounded-2xl px-3.5 py-2.5
                  text-sm focus:outline-none focus:border-brand-300 transition max-h-24 disabled:opacity-50"
                style={{ minHeight:40 }}
              />
              <button onClick={sendMsg}
                disabled={!input.trim() || loading || !apiKeySet}
                className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-40
                  rounded-2xl flex items-center justify-center transition-all flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-xs text-gray-300">Powered by Google Gemini · Үнэгүй</span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
