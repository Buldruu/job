import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/RatingStars';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => Number(n).toLocaleString('mn-MN') + '₮';
const DEGREES = ['Мастер', 'Доктор', 'Мэргэжлийн үнэмлэх'];

const isPremiumActive = (profile) => {
  if (!profile?.premiumPlan || profile.premiumPlan === 'free') return false;
  const until = profile.premiumUntil?.toDate?.() || profile.premiumUntil;
  if (!until) return false;
  return new Date(until) > new Date();
};

const PLANS = [
  {
    key: 'basic', name: 'Basic', price: 9900, icon: '⭐',
    features: ['Сард 10 зар','5 онцлох зар','💎 Premium badge','Дэвшилтэт хайлт'],
    notFeatures: ['Хайлтанд хамгийн дээр','Платформд зар'],
  },
  {
    key: 'pro', name: 'Pro', price: 24900, icon: '💎', popular: true,
    features: ['Сард 30 зар','20 онцлох зар','💎 Premium badge','Дэвшилтэт хайлт','Хайлтанд хамгийн дээр'],
    notFeatures: ['Платформд зар'],
  },
  {
    key: 'business', name: 'Business', price: 59900, icon: '🏆',
    features: ['Хязгааргүй зар','Хязгааргүй онцлох','💎 Premium badge','Дэвшилтэт хайлт','Хайлтанд хамгийн дээр','Платформд сурталчилгаа'],
    notFeatures: [],
  },
];

export default function ProSection() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('premium');
  const [workers, setWorkers] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterDegree, setFilterDegree] = useState('Бүгд');
  const [search, setSearch] = useState('');
  const [paying, setPaying] = useState(null);
  const [success, setSuccess] = useState(null);

  const isActive = isPremiumActive(profile);
  const currentPlan = isActive ? profile?.premiumPlan : null;
  const until = isActive ? (profile?.premiumUntil?.toDate?.() || profile?.premiumUntil) : null;

  // Load verified workers
  useEffect(() => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWorkers(all.filter(u => u.zovshoorol === true));
      setLoading(false);
    });
  }, []);

  // Load ratings
  useEffect(() => {
    if (!workers.length) return;
    const allRatings = {};
    const unsubs = ['jobs','workers','internships','courses'].map(col =>
      onSnapshot(query(collection(db, col)), snap => {
        snap.docs.forEach(d => {
          const data = d.data();
          if (!data.uid || !data.ratings?.length) return;
          if (!allRatings[data.uid]) allRatings[data.uid] = [];
          allRatings[data.uid] = allRatings[data.uid].filter(r => r._postId !== d.id);
          data.ratings.forEach(r => allRatings[data.uid].push({ ...r, _postId: d.id }));
        });
        const map = {};
        Object.entries(allRatings).forEach(([uid, ratings]) => {
          const avg = ratings.reduce((s,r)=>s+r.stars,0)/ratings.length;
          map[uid] = { avg: parseFloat(avg.toFixed(1)), count: ratings.length };
        });
        setRatingsMap(m => ({...m,...map}));
      })
    );
    return () => unsubs.forEach(u => u());
  }, [workers.length]);

  const handleBuy = async (plan) => {
    if (paying) return;
    const bal = profile?.balance || 0;
    if (bal < plan.price) {
      alert(`Үлдэгдэл хүрэлцэхгүй.\nШаардлагатай: ${fmt(plan.price)}\nТаны үлдэгдэл: ${fmt(bal)}`);
      return;
    }
    if (!window.confirm(`${plan.name} багцыг ${fmt(plan.price)}/сар идэвхжүүлэх үү?`)) return;
    setPaying(plan.key);
    try {
      const { runTransaction, doc: fd, increment } = await import('firebase/firestore');
      const premiumUntil = new Date(Date.now() + 30*24*60*60*1000);
      await runTransaction(db, async tx => {
        const uRef = fd(db,'users',user.uid);
        const snap = await tx.get(uRef);
        if ((snap.data().balance||0) < plan.price) throw new Error('Үлдэгдэл хүрэлцэхгүй');
        tx.update(uRef,{ balance: increment(-plan.price), premiumPlan: plan.key, premiumUntil });
      });
      await addDoc(collection(db,'transactions'),{
        uid:user.uid, type:'zarlaga', amount:plan.price,
        note:`Premium ${plan.name} багц`, createdAt:serverTimestamp(),
      });
      await refreshProfile();
      setSuccess(plan.key);
    } catch(err){ alert(err.message||'Алдаа гарлаа'); }
    setPaying(null);
  };

  const filtered = workers.filter(w => {
    const s = search.toLowerCase();
    const degMatch = filterDegree==='Бүгд' || w.zэрэг===filterDegree;
    const txtMatch = !s || [w.ner,w.ovog,w.chiglel,w.chadvar].some(v=>(v||'').toLowerCase().includes(s));
    return degMatch && txtMatch;
  }).sort((a,b)=>(ratingsMap[b.id]?.avg||0)-(ratingsMap[a.id]?.avg||0));

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">HaGA</p>
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">Мэргэжилтэн & Premium</h1>
        <p className="text-gray-400">Баталгаажсан мэргэжилтнүүд болон давуу эрхийн тариф</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surf-100 rounded-xl p-1 mb-8 animate-fade-up-delay w-fit">
        {[
          { key:'premium', label:'💎 Premium' },
          { key:'mergejilten', label:'🏅 Мэргэшсэн ажилтан' },
        ].map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              tab===t.key ? 'bg-white text-brand-600 shadow-sm border border-surf-200' : 'text-gray-400 hover:text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PREMIUM TAB ── */}
      {tab==='premium' && (
        <div className="animate-fade-up">
          {/* Active plan */}
          {isActive && (
            <div className="mb-8 card rounded-2xl px-6 py-4 border border-brand-200 bg-brand-50 flex items-center gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {PLANS.map(plan => {
              const isCurrent = currentPlan===plan.key;
              return (
                <div key={plan.key}
                  className={`card rounded-2xl flex flex-col relative overflow-hidden transition-all hover:shadow-lg ${
                    plan.popular && !isCurrent ? 'ring-2 ring-brand-400 ring-offset-2' : ''
                  }`}
                  style={{ border:`2px solid ${isCurrent?'#2563EB':plan.popular?'#2563EB':'#E2ECF5'}` }}>
                  {plan.popular && <div className="text-center text-xs font-bold py-2 bg-brand-500 text-white">⚡ Хамгийн алдартай</div>}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-3xl mb-2">{plan.icon}</div>
                    <div className="font-display font-bold text-xl text-gray-800 mb-1">{plan.name}</div>
                    <div className="flex items-end gap-1 mb-5">
                      <span className="text-3xl font-display font-bold text-gray-800">{fmt(plan.price)}</span>
                      <span className="text-gray-400 text-sm mb-1">/сар</span>
                    </div>
                    <div className="space-y-2 flex-1 mb-5">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                          {f}
                        </div>
                      ))}
                      {plan.notFeatures.map(f => (
                        <div key={f} className="flex items-start gap-2 text-sm text-gray-300">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                          {f}
                        </div>
                      ))}
                    </div>
                    {isCurrent ? (
                      <div className="w-full text-center py-3 rounded-xl text-sm font-bold bg-brand-100 text-brand-600">✅ Одоогийн багц</div>
                    ) : success===plan.key ? (
                      <div className="w-full text-center py-3 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-600">🎉 Амжилттай!</div>
                    ) : (
                      <button onClick={()=>handleBuy(plan)} disabled={!!paying}
                        className={`w-full font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center ${
                          plan.popular ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}>
                        {paying===plan.key ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"/> : `${plan.name} идэвхжүүлэх`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Balance + link */}
          <div className="bg-surf-50 border border-surf-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-xl">💳</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-700">Таны үлдэгдэл: {fmt(profile?.balance||0)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Данс цэнэглэхийн тулд Санхүү хэсэгт очно уу</div>
            </div>
            <button onClick={()=>navigate('/sanhuu')}
              className="text-xs text-brand-500 font-bold border border-brand-200 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition">
              Санхүү →
            </button>
          </div>
        </div>
      )}

      {/* ── МЭРГЭШСЭН TAB ── */}
      {tab==='mergejilten' && (
        <div className="animate-fade-up">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Нэр, чиглэл, чадвараар хайх..." className="input-base pl-9"/>
            </div>
            <select value={filterDegree} onChange={e=>setFilterDegree(e.target.value)} className="input-base sm:w-56">
              <option value="Бүгд">Бүх зэрэг</option>
              {DEGREES.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/></div>
          ) : filtered.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center text-gray-300">
              <div className="text-4xl mb-3">🔍</div>
              <p>Мэргэшсэн ажилтан олдсонгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map(w => {
                const r = ratingsMap[w.id];
                return (
                  <button key={w.id} onClick={()=>setSelected(w)}
                    className="card card-hover rounded-2xl p-5 text-left border border-surf-200 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0">
                        {w.photoURL
                          ? <img src={w.photoURL} alt="" className="w-full h-full object-cover"/>
                          : <span className="font-bold text-brand-600 text-base">{(w.ner||'?')[0].toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-gray-800 text-sm">
                          {w.ner ? `${w.ovog||''} ${w.ner}`.trim() : '—'}
                        </div>
                        {r && r.count > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <StarDisplay rating={r.avg} size="sm"/>
                            <span className="text-xs text-gray-400">{r.avg} ({r.count})</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {w.zэрэг && <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full">🏅 {w.zэрэг}</span>}
                          {w.chiglel && <span className="text-xs bg-brand-50 border border-brand-100 text-brand-600 px-2 py-0.5 rounded-full">{w.chiglel}</span>}
                        </div>
                      </div>
                    </div>
                    {w.chadvar && <p className="text-xs text-gray-500 line-clamp-2">{w.chadvar}</p>}
                    {(w.tsalin || w.tsagiin_huls) && (
                      <div className="flex gap-3">
                        {w.tsalin && <span className="text-xs text-emerald-700 font-semibold">💰 {w.tsalin}₮/сар</span>}
                        {w.tsagiin_huls && <span className="text-xs text-emerald-700 font-semibold">⏱ {w.tsagiin_huls}₮/цаг</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md z-10 animate-fade-up border border-surf-200 max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-200 rounded-full"/></div>
            <div className="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-surf-100 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0">
                {selected.photoURL
                  ? <img src={selected.photoURL} alt="" className="w-full h-full object-cover"/>
                  : <span className="font-bold text-brand-600 text-xl">{(selected.ner||'?')[0].toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-gray-800 text-lg">
                  {selected.ner ? `${selected.ovog||''} ${selected.ner}`.trim() : '—'}
                </h2>
                {ratingsMap[selected.id]?.count > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarDisplay rating={ratingsMap[selected.id].avg} size="md"/>
                    <span className="text-xs text-gray-400">{ratingsMap[selected.id].avg} ({ratingsMap[selected.id].count} үнэлгээ)</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selected.zэрэг && <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full">🏅 {selected.zэрэг}</span>}
                  {selected.chiglel && <span className="text-xs bg-brand-50 border border-brand-100 text-brand-600 px-2 py-0.5 rounded-full">{selected.chiglel}</span>}
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="text-gray-300 hover:text-gray-500 transition p-1 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
              {[
                {label:'Чадвар',        value:selected.chadvar},
                {label:'Туршлага',      value:selected.turshlaga},
                {label:'Сарын цалин',   value:selected.tsalin   ? `${selected.tsalin}₮/сар`  : null},
                {label:'Цагийн хөлс',   value:selected.tsagiin_huls ? `${selected.tsagiin_huls}₮/цаг` : null},
                {label:'Хаяг',          value:selected.hayg},
                {label:'Утас',          value:selected.utas},
                {label:'Нэмэлт',        value:selected.nemelt},
                {label:'Диплом дугаар', value:selected.surgaltin_gazar},
              ].filter(r=>r.value).map(row=>(
                <div key={row.label} className="bg-surf-50 rounded-xl px-4 py-3">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{row.label}</div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{row.value}</div>
                </div>
              ))}
              {selected.cert_url && (
                <a href={selected.cert_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl px-4 py-3 text-sm font-medium hover:bg-teal-100 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                  Мэргэжлийн үнэмлэх харах
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
