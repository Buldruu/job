import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => Number(n).toLocaleString('mn-MN') + '₮';

const isPremiumActive = (profile) => {
  if (!profile?.premiumPlan || profile.premiumPlan === 'free') return false;
  const until = profile.premiumUntil?.toDate?.() || profile.premiumUntil;
  if (!until) return false;
  return new Date(until) > new Date();
};

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    price: 9900,
    icon: '⭐',
    color: { border: '#E5E9F2', bg: '#fff', btn: '#374151', btnTxt: '#fff', btnBg: '#374151' },
    badge: null,
    features: [
      { ok: true,  text: 'Сард 10 зар нэмэх' },
      { ok: true,  text: 'Сард 5 онцлох зар (⭐)' },
      { ok: true,  text: '💎 Premium badge харагдана' },
      { ok: true,  text: 'Хайлтанд дэвшилтэт шүүлтүүр' },
      { ok: false, text: 'Хайлтанд хамгийн дээр гарах' },
      { ok: false, text: 'Платформд сурталчилгаа нэмэх' },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 24900,
    icon: '💎',
    color: { border: '#1536C8', bg: '#F0F6FF', btn: '#1536C8', btnTxt: '#fff', btnBg: '#1536C8' },
    badge: '⚡ Хамгийн алдартай',
    features: [
      { ok: true, text: 'Сард 30 зар нэмэх' },
      { ok: true, text: 'Сард 20 онцлох зар (⭐)' },
      { ok: true, text: '💎 Premium badge харагдана' },
      { ok: true, text: 'Хайлтанд дэвшилтэт шүүлтүүр' },
      { ok: true, text: 'Хайлтанд хамгийн дээр гарах' },
      { ok: false, text: 'Платформд сурталчилгаа нэмэх' },
    ],
  },
  {
    key: 'business',
    name: 'Business',
    price: 59900,
    icon: '🏆',
    color: { border: '#F59E0B', bg: '#FFFBEB', btn: '#F59E0B', btnTxt: '#78350F', btnBg: '#F59E0B' },
    badge: '👑 Бизнест зориулсан',
    features: [
      { ok: true, text: 'Хязгааргүй зар нэмэх' },
      { ok: true, text: 'Хязгааргүй онцлох зар (⭐)' },
      { ok: true, text: '💎 Premium badge харагдана' },
      { ok: true, text: 'Хайлтанд дэвшилтэт шүүлтүүр' },
      { ok: true, text: 'Хайлтанд хамгийн дээр гарах' },
      { ok: true, text: 'Платформд сурталчилгаа нэмэх' },
    ],
  },
];

const BENEFITS = [
  { icon: '📋', title: 'Илүү олон зар', desc: 'Үнэгүй: 3 зар. Premium-аар 10–хязгааргүй зар нэмэх боломжтой.' },
  { icon: '🔝', title: 'Хайлтанд дээр гарах', desc: 'Таны зарууд хайлтын үр дүнд хамгийн дээр харагдана.' },
  { icon: '💎', title: 'Premium badge', desc: 'Зар дээр Premium тэмдэглэгээ гарч итгэлцэл нэмэгдэнэ.' },
  { icon: '📢', title: 'Сурталчилгаа', desc: 'Business багцтай бол платформд брэндийнхээ зарыг байршуулна.' },
];

export default function Premium() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(null);
  const [success, setSuccess] = useState(null);

  const isActive = isPremiumActive(profile);
  const currentPlan = isActive ? profile?.premiumPlan : null;
  const until = isActive ? (profile?.premiumUntil?.toDate?.() || profile?.premiumUntil) : null;

  const handleBuy = async (plan) => {
    if (paying) return;
    const bal = profile?.balance || 0;
    if (bal < plan.price) {
      alert(`Үлдэгдэл хүрэлцэхгүй байна.\nШаардлагатай: ${fmt(plan.price)}\nТаны үлдэгдэл: ${fmt(bal)}\n\nСанхүү хэсэгт орж дансаа цэнэглэнэ үү.`);
      return;
    }
    if (!window.confirm(`${plan.name} багцыг ${fmt(plan.price)}/сар-аар идэвхжүүлэх үү?`)) return;
    setPaying(plan.key);
    try {
      const { runTransaction, doc: fd, increment } = await import('firebase/firestore');
      const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await runTransaction(db, async tx => {
        const uRef = fd(db, 'users', user.uid);
        const snap = await tx.get(uRef);
        if ((snap.data().balance || 0) < plan.price) throw new Error('Үлдэгдэл хүрэлцэхгүй');
        tx.update(uRef, {
          balance: increment(-plan.price),
          premiumPlan: plan.key,
          premiumUntil,
        });
      });
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid, type: 'zarlaga', amount: plan.price,
        note: `Premium ${plan.name} багц`, createdAt: serverTimestamp(),
      });
      await refreshProfile();
      setSuccess(plan.key);
    } catch (err) { alert(err.message || 'Алдаа гарлаа'); }
    setPaying(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">HaGA</p>
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">Premium</h1>
        <p className="text-gray-400">Ажил олох, ажилтан олох боломжоо өргөтгө</p>
      </div>

      {/* Active plan banner */}
      {isActive && (
        <div className="mb-8 card rounded-2xl px-6 py-4 border border-brand-200 bg-brand-50 flex items-center gap-4 animate-fade-up">
          <div className="text-2xl">{PLANS.find(p=>p.key===currentPlan)?.icon}</div>
          <div className="flex-1">
            <div className="font-display font-bold text-brand-700 text-lg">
              {PLANS.find(p=>p.key===currentPlan)?.name} Premium идэвхтэй 💎
            </div>
            {until && <div className="text-brand-500 text-sm">{new Date(until).toLocaleDateString('mn-MN')} хүртэл хүчинтэй</div>}
          </div>
          <span className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-full font-bold">✅ Идэвхтэй</span>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 animate-fade-up-delay">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.key;
          const isSuccess = success === plan.key;
          return (
            <div key={plan.key}
              className="rounded-2xl flex flex-col relative overflow-hidden transition-all hover:shadow-lg"
              style={{ background: plan.color.bg, border: `2px solid ${plan.color.border}`, padding: 0 }}>

              {/* Top badge */}
              {plan.badge && (
                <div className="text-center text-xs font-bold py-2"
                  style={{ background: plan.key==='pro' ? '#1536C8' : '#F59E0B', color: plan.key==='pro' ? 'white' : '#78350F' }}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <div className="text-3xl mb-2">{plan.icon}</div>
                <div className="font-display font-bold text-xl text-gray-800 mb-1">{plan.name}</div>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-3xl font-display font-bold text-gray-800">{fmt(plan.price)}</span>
                  <span className="text-gray-400 text-sm mb-1">/сар</span>
                </div>

                <div className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <div key={f.text} className="flex items-start gap-2 text-sm" style={{ color: f.ok ? '#374151' : '#D1D5DB' }}>
                      {f.ok
                        ? <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color:'#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      }
                      {f.text}
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div className="w-full text-center py-3 rounded-xl text-sm font-bold bg-brand-100 text-brand-600">✅ Одоогийн багц</div>
                ) : isSuccess ? (
                  <div className="w-full text-center py-3 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-600">🎉 Амжилттай идэвхжлээ!</div>
                ) : (
                  <button onClick={() => handleBuy(plan)} disabled={!!paying}
                    className="w-full font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: plan.color.btn, color: plan.color.btnTxt }}>
                    {paying === plan.key
                      ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"/>
                      : `${plan.name} идэвхжүүлэх`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="mb-10 animate-fade-up-delay">
        <h2 className="font-display font-bold text-xl text-gray-800 mb-5">Premium-ийн давуу талууд</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map(b => (
            <div key={b.title} className="card rounded-2xl p-5 border border-surf-200">
              <div className="text-2xl mb-3">{b.icon}</div>
              <div className="font-semibold text-gray-800 text-sm mb-1">{b.title}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Business: Ad section preview */}
      {currentPlan === 'business' && isActive && (
        <div className="animate-fade-up-delay">
          <h2 className="font-display font-bold text-xl text-gray-800 mb-5">
            📢 Сурталчилгаа — Business
          </h2>
          <AdSection uid={user?.uid} profile={profile} refreshProfile={refreshProfile}/>
        </div>
      )}

      {/* Balance */}
      <div className="mt-8 bg-surf-50 border border-surf-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <span className="text-xl">💳</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-700">Таны үлдэгдэл: {fmt(profile?.balance || 0)}</div>
          <div className="text-xs text-gray-400 mt-0.5">Данс цэнэглэхийн тулд Санхүү → Шилжүүлэг хэсэгт очно уу</div>
        </div>
        <button onClick={() => navigate('/sanhuu')}
          className="text-xs text-brand-500 font-bold border border-brand-200 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition">
          Санхүү →
        </button>
      </div>
    </div>
  );
}

/* ── Ad Section for Business users ── */
function AdSection({ uid, profile, refreshProfile }) {
  const [form, setForm] = useState({ title:'', description:'', link:'', contact:'' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.description) { alert('Гарчиг болон тайлбар заавал бичнэ үү'); return; }
    setSaving(true);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await updateDoc(doc(db, 'users', uid), { ad: form });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) { alert('Алдаа гарлаа'); }
    setSaving(false);
  };

  const existing = profile?.ad;

  return (
    <div className="card rounded-2xl p-6 border border-amber-100 bg-amber-50">
      <p className="text-sm text-amber-700 mb-5 font-medium">
        Доорх мэдээллийг бөглөснөөр таны сурталчилгаа платформд харагдах болно
      </p>
      {existing && (
        <div className="mb-5 card rounded-xl px-4 py-3 border border-amber-200 bg-white">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Одоогийн сурталчилгаа</div>
          <div className="font-bold text-gray-800">{existing.title}</div>
          <div className="text-sm text-gray-500 mt-1">{existing.description}</div>
          {existing.link && <a href={existing.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 underline mt-1 block">{existing.link}</a>}
        </div>
      )}
      <div className="space-y-3">
        {[
          { label: 'Гарчиг', key: 'title', placeholder: 'Компани / Бренд нэр', textarea: false },
          { label: 'Тайлбар', key: 'description', placeholder: 'Богино танилцуулга...', textarea: true },
          { label: 'Холбоос (URL)', key: 'link', placeholder: 'https://...', textarea: false },
          { label: 'Холбоо барих', key: 'contact', placeholder: '+976 ...', textarea: false },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
            {f.textarea
              ? <textarea rows={3} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder} className="input-base resize-none"/>
              : <input type="text" value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder} className="input-base"/>}
          </div>
        ))}
        {saved && <div className="text-emerald-600 text-sm">✅ Хадгалагдлаа</div>}
        <button onClick={handleSave} disabled={saving}
          className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-amber-900 font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center gap-2 shadow-btn">
          {saving ? <div className="w-4 h-4 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin"/> : '💾 Хадгалах'}
        </button>
      </div>
    </div>
  );
}
