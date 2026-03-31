import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users'); // users | online

  // Guard: only admin
  useEffect(() => {
    if (!profile) return;
    if (!profile.isAdmin) navigate('/', { replace: true });
  }, [profile]);

  // All users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  // Online users (presence)
  useEffect(() => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(collection(db, 'presence'), where('lastSeen', '>', fiveMinAgo));
    return onSnapshot(q, snap => {
      setOnline(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return !s || (u.email||'').toLowerCase().includes(s)
      || (u.ner||'').toLowerCase().includes(s)
      || (u.ovog||'').toLowerCase().includes(s);
  });

  const stats = [
    { label: 'Нийт хэрэглэгч', value: users.length, icon: '👥', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Онлайн (5мин)', value: online.length, icon: '🟢', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { label: 'Энэ сар', value: users.filter(u => {
        const d = u.createdAt?.toDate?.();
        if (!d) return false;
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length, icon: '📅', color: 'bg-violet-50 border-violet-100 text-violet-700' },
    { label: 'Профайл бөглөсөн', value: users.filter(u => u.ner).length, icon: '✅', color: 'bg-amber-50 border-amber-100 text-amber-700' },
  ];

  if (!profile?.isAdmin) return null;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 animate-fade-up">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">HaGA</p>
        <h1 className="text-2xl font-display font-bold text-gray-800">Админ панел</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-up-delay">
        {stats.map(s => (
          <div key={s.label} className={`card rounded-2xl p-4 border ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-display font-bold mb-0.5">{s.value}</div>
            <div className="text-xs font-medium opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surf-100 rounded-xl p-1 mb-6 animate-fade-up-delay w-fit">
        {[
          { key: 'users',  label: `Бүх хэрэглэгч (${users.length})` },
          { key: 'online', label: `Онлайн (${online.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white text-brand-600 shadow-sm border border-surf-200'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-fade-up-delay">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Нэр эсвэл имэйлээр хайх..."
          className="input-base pl-9 max-w-sm"/>
      </div>

      {/* Users table */}
      {tab === 'users' && (
        <div className="card rounded-2xl overflow-hidden animate-fade-up-delay">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-surf-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Хэрэглэгч</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Чиглэл</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Бүртгүүлсэн</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Профайл</th>
                  <th className="px-5 py-3.5"/>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-surf-50 hover:bg-surf-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0">
                          {u.photoURL
                            ? <img src={u.photoURL} alt="" className="w-full h-full object-cover"/>
                            : <span className="text-xs font-bold text-brand-600">
                                {(u.ner || u.email || '?')[0].toUpperCase()}
                              </span>}
                        </div>
                        <div>
                          <div className="text-gray-800 text-sm font-semibold">
                            {u.ner ? `${u.ovog||''} ${u.ner}`.trim() : '—'}
                          </div>
                          <div className="text-gray-400 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.chiglel
                        ? <span className="text-xs bg-brand-50 border border-brand-100 text-brand-600 px-2 py-0.5 rounded-full">{u.chiglel}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {u.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.ner
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                          : 'bg-gray-50 border border-gray-100 text-gray-400'
                      }`}>
                        {u.ner ? 'Бөглөсөн' : 'Хоосон'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(u)}
                        className="text-xs text-brand-500 hover:text-brand-700 font-semibold transition">
                        Харах →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Online users */}
      {tab === 'online' && (
        <div className="space-y-3 animate-fade-up-delay">
          {online.length === 0 ? (
            <div className="card rounded-2xl p-10 text-center text-gray-300">
              <div className="text-3xl mb-2">🟡</div>
              <p className="text-sm">Одоогоор онлайн хэрэглэгч байхгүй байна</p>
            </div>
          ) : online.map(o => {
            const u = users.find(u => u.id === o.id);
            return (
              <div key={o.id} className="card rounded-xl px-5 py-3.5 flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 animate-pulse"/>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {u?.photoURL
                    ? <img src={u.photoURL} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-xs font-bold text-brand-600">
                        {(u?.ner || u?.email || '?')[0].toUpperCase()}
                      </span>}
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 text-sm font-semibold">
                    {u?.ner ? `${u.ovog||''} ${u.ner}`.trim() : u?.email || o.id}
                  </div>
                  {u?.chiglel && <div className="text-gray-400 text-xs">{u.chiglel}</div>}
                </div>
                {u && <button onClick={() => setSelected(u)}
                  className="text-xs text-brand-500 hover:text-brand-700 font-semibold transition">
                  Харах →
                </button>}
              </div>
            );
          })}
        </div>
      )}

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setSelected(null)}/>
          <div className="relative bg-white rounded-2xl shadow-card-hover p-6 w-full max-w-md z-10 animate-fade-up border border-surf-200">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center">
                  {selected.photoURL
                    ? <img src={selected.photoURL} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-lg font-bold text-brand-600">
                        {(selected.ner || selected.email || '?')[0].toUpperCase()}
                      </span>}
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-800">
                    {selected.ner ? `${selected.ovog||''} ${selected.ner}`.trim() : '—'}
                  </h2>
                  <p className="text-gray-400 text-sm">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {[
                {label:'Чиглэл', value: selected.chiglel},
                {label:'Чадвар', value: selected.chadvar},
                {label:'Туршлага', value: selected.turshlaga},
                {label:'Хаяг', value: selected.hayg},
                {label:'CV / Намтар', value: selected.cv},
                {label:'Нэмэлт', value: selected.nemelt},
                {label:'Бүртгүүлсэн', value: selected.createdAt?.toDate?.()?.toLocaleDateString('mn-MN')},
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="bg-surf-50 rounded-xl px-4 py-3">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{row.label}</div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{row.value}</div>
                </div>
              ))}
            </div>

            {/* Admin badge toggle */}
            <div className="mt-5 pt-4 border-t border-surf-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Админ эрх</span>
              <button
                onClick={async () => {
                  await updateDoc(doc(db, 'users', selected.id), { isAdmin: !selected.isAdmin });
                  setSelected(s => ({...s, isAdmin: !s.isAdmin}));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selected.isAdmin
                    ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100'
                    : 'bg-brand-50 border border-brand-200 text-brand-600 hover:bg-brand-100'
                }`}>
                {selected.isAdmin ? '● Авах' : '○ Өгөх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
