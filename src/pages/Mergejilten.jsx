import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { StarDisplay } from '../components/RatingStars';

const DEGREES = ['Мастер', 'Доктор', 'Мэргэжлийн үнэмлэх'];

const calcAvg = (ratings = []) => {
  if (!ratings.length) return { avg: 0, count: 0 };
  const avg = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length;
  return { avg: parseFloat(avg.toFixed(1)), count: ratings.length };
};

export default function Mergejilten() {
  const [workers, setWorkers] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({}); // uid → {avg, count}
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterDegree, setFilterDegree] = useState('Бүгд');
  const [search, setSearch] = useState('');

  // Load approved workers
  useEffect(() => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWorkers(all.filter(u => u.zovshoorol === true));
      setLoading(false);
    });
  }, []);

  // Load all ratings from all job collections and aggregate by uid
  useEffect(() => {
    if (!workers.length) return;
    const colls = ['jobs', 'workers', 'internships', 'courses'];
    const allRatings = {}; // uid → [{stars}]
    const unsubs = [];

    colls.forEach(col => {
      const unsub = onSnapshot(query(collection(db, col)), snap => {
        snap.docs.forEach(d => {
          const data = d.data();
          if (!data.uid || !data.ratings?.length) return;
          if (!allRatings[data.uid]) allRatings[data.uid] = [];
          // Merge ratings (deduplicate by post id)
          allRatings[data.uid] = allRatings[data.uid].filter(r => r._postId !== d.id);
          data.ratings.forEach(r => allRatings[data.uid].push({ ...r, _postId: d.id }));
        });
        // Compute averages
        const map = {};
        Object.entries(allRatings).forEach(([uid, ratings]) => {
          map[uid] = calcAvg(ratings);
        });
        setRatingsMap({ ...map });
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [workers.length]);

  const filtered = workers.filter(w => {
    const md = filterDegree === 'Бүгд' || w.zэрэг === filterDegree;
    const s = search.toLowerCase();
    const ms = !s
      || (w.ner || '').toLowerCase().includes(s)
      || (w.ovog || '').toLowerCase().includes(s)
      || (w.chiglel || '').toLowerCase().includes(s)
      || (w.chadvar || '').toLowerCase().includes(s);
    return md && ms;
  });

  // Sort by average rating descending
  const sorted = [...filtered].sort((a, b) => {
    const ra = ratingsMap[a.id]?.avg || 0;
    const rb = ratingsMap[b.id]?.avg || 0;
    return rb - ra;
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">HaGA</p>
          <h1 className="text-2xl font-display font-bold text-gray-800">Мэргэшсэн ажилтан</h1>
          <p className="text-gray-400 text-sm mt-1">Баталгаажсан мэргэжлийн үнэмлэхтэй мэргэжилтнүүд</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6 animate-fade-up-delay">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Нэр, чиглэлээр хайх..." className="input-base pl-9"/>
        </div>
        <select value={filterDegree} onChange={e => setFilterDegree(e.target.value)} className="input-base w-auto">
          <option value="Бүгд">Бүгд</option>
          {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center text-gray-300">
          <div className="text-4xl mb-3">🏅</div>
          <p className="text-sm">Мэргэшсэн ажилтан байхгүй байна</p>
          <p className="text-xs mt-2 text-gray-400">Профайл дотроо мэргэжлийн үнэмлэхийн мэдээлэл оруулна уу</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-up-delay">
          {sorted.map(w => {
            const { avg, count } = ratingsMap[w.id] || { avg: 0, count: 0 };
            return (
              <button key={w.id} onClick={() => setSelected(w)}
                className="card card-hover rounded-2xl p-5 text-left border border-teal-100 bg-teal-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-teal-100 flex items-center justify-center flex-shrink-0">
                    {w.photoURL
                      ? <img src={w.photoURL} alt="" className="w-full h-full object-cover"/>
                      : <span className="text-lg font-bold text-teal-700">{(w.ner || '?')[0].toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-teal-800 truncate">
                      {w.ner ? `${w.ovog || ''} ${w.ner}`.trim() : '—'}
                    </div>
                    {w.chiglel && <div className="text-teal-600 text-sm">{w.chiglel}</div>}
                    {w.zэрэг && (
                      <span className="inline-block mt-1 text-xs bg-white border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                        🏅 {w.zэрэг}
                      </span>
                    )}
                  </div>
                </div>

                {/* Aggregated rating */}
                <div className="flex items-center gap-2">
                  <StarDisplay rating={avg} count={count}/>
                  {count === 0 && <span className="text-xs text-gray-400">Үнэлгээ байхгүй</span>}
                </div>

                {w.chadvar && <div className="text-gray-500 text-xs mt-2 line-clamp-2">{w.chadvar}</div>}
                {w.tsalin && (
                  <div className="mt-2">
                    <span className="text-xs text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded-full">
                      {w.tsalin}₮
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setSelected(null)}/>
          <div className="relative bg-white rounded-2xl shadow-card-hover p-6 w-full max-w-md z-10 animate-fade-up border border-surf-200"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-teal-100 flex items-center justify-center">
                  {selected.photoURL
                    ? <img src={selected.photoURL} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-xl font-bold text-teal-700">{(selected.ner || '?')[0].toUpperCase()}</span>}
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-800">
                    {selected.ner ? `${selected.ovog || ''} ${selected.ner}`.trim() : '—'}
                  </h2>
                  {selected.zэрэг && (
                    <span className="text-xs bg-teal-50 border border-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                      🏅 {selected.zэрэг}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 p-1 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Aggregated rating display */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Нийт үнэлгээ</div>
              <StarDisplay
                rating={ratingsMap[selected.id]?.avg || 0}
                count={ratingsMap[selected.id]?.count || 0}
                size="lg"
              />
              {(ratingsMap[selected.id]?.count || 0) === 0 && (
                <p className="text-xs text-gray-400 mt-1">Одоогоор үнэлгээ байхгүй байна</p>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {[
                { label: 'Чиглэл',           value: selected.chiglel },
                { label: 'Чадвар',            value: selected.chadvar },
                { label: 'Туршлага',          value: selected.turshlaga },
                { label: 'Зэрэг / Үнэмлэх',  value: selected.zэрэг },
                { label: 'Диплом дугаар',     value: selected.surgaltin_gazar },
                { label: 'Хүссэн цалин',      value: selected.tsalin ? selected.tsalin + '₮' : null },
                { label: 'Хаяг',              value: selected.hayg },
                { label: 'CV / Намтар',       value: selected.cv },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="bg-surf-50 rounded-xl px-4 py-3">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{row.label}</div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
