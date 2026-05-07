import { useEffect, useState } from 'react';
import {
  collection, query, onSnapshot, orderBy,
  where, doc, updateDoc, serverTimestamp, setDoc, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbLoading(false);
    });
  }, []);

  useEffect(() => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(collection(db, 'presence'), where('lastSeen', '>', fiveMinAgo));
    return onSnapshot(q, snap => {
      setOnline(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!profile?.isAdmin) return (
    <div className="p-4 sm:p-8 max-w-lg">
      <div className="card rounded-2xl p-8 text-center border border-red-100 bg-red-50">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-display font-bold text-red-600 mb-2">Хандах эрхгүй</h2>
        <p className="text-gray-500 text-sm mb-4">Танд Админ эрх байхгүй байна.</p>
        <div className="bg-white border border-red-100 rounded-xl px-4 py-3 text-left text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600 mb-2">Шалгах зүйлс:</p>
          <p>1. Firebase → Firestore → <strong>users</strong></p>
          <p>2. Таны UID-тай document нээнэ</p>
          <p>3. <code className="bg-red-50 px-1 rounded">isAdmin: true</code> нэмнэ</p>
          <p className="mt-2 text-brand-500 break-all">UID: <strong>{user?.uid}</strong></p>
        </div>
      </div>
    </div>
  );

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return !s
      || (u.email || '').toLowerCase().includes(s)
      || (u.ner || '').toLowerCase().includes(s)
      || (u.ovog || '').toLowerCase().includes(s);
  });

  const pendingVerify = users.filter(u => u.zovshoorol === 'pending');

  const stats = [
    { label: 'Нийт',      value: users.length,                                                                icon: '👥', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Онлайн',    value: online.length,                                                               icon: '🟢', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { label: 'Энэ сар',   value: users.filter(u => { const d = u.createdAt?.toDate?.(); if (!d) return false; const n = new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length, icon: '📅', color: 'bg-violet-50 border-violet-100 text-violet-700' },
    { label: 'Профайл',   value: users.filter(u => u.ner).length,                                             icon: '✅', color: 'bg-amber-50 border-amber-100 text-amber-700' },
    { label: 'Хүлээгдэж', value: pendingVerify.length,                                                        icon: '⏳', color: 'bg-teal-50 border-teal-100 text-teal-700' },
  ];

  const TABS = [
    { key: 'users',  label: 'Хэрэглэгч', count: users.length },
    { key: 'online', label: 'Онлайн',    count: online.length },
    { key: 'verify', label: 'Баталгаажуулалт', count: pendingVerify.length, badge: pendingVerify.length > 0 },
    { key: 'ai',     label: '🤖 AI', count: null },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">HaGA</p>
        <h1 className="text-2xl font-display font-bold text-gray-800">Админ панел</h1>
      </div>

      {/* Stats — 2 col mobile, 5 col desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 animate-fade-up-delay">
        {stats.map(s => (
          <div key={s.label} className={`card rounded-2xl p-3 sm:p-4 border ${s.color}`}>
            <div className="text-xl sm:text-2xl mb-1.5">{s.icon}</div>
            <div className="text-xl sm:text-2xl font-display font-bold mb-0.5">{s.value}</div>
            <div className="text-xs font-medium opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 bg-surf-100 rounded-xl p-1 mb-4 animate-fade-up-delay overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              tab === t.key
                ? 'bg-white text-brand-600 shadow-sm border border-surf-200'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === t.key ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-500'
            } ${t.badge ? '!bg-red-100 !text-red-500' : ''}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 animate-fade-up-delay">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Нэр эсвэл имэйлээр хайх..."
          className="input-base pl-9"/>
      </div>

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div className="animate-fade-up-delay">
          {dbLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="sm:hidden space-y-2">
                {filtered.map(u => (
                  <button key={u.id} onClick={() => setSelected(u)}
                    className="w-full card rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left hover:shadow-md transition-all active:scale-[0.98]">
                    <Avatar u={u} size="md"/>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">
                        {u.ner ? `${u.ovog||''} ${u.ner}`.trim() : u.email || '—'}
                      </div>
                      <div className="text-gray-400 text-xs truncate">{u.email}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {u.chiglel && <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full">{u.chiglel}</span>}
                        {u.isAdmin && <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-bold">A</span>}
                        {u.premiumPlan && u.premiumPlan !== 'free' && <span className="text-xs bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">💎</span>}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="card rounded-2xl p-10 text-center text-gray-300">
                    <p className="text-sm">Хэрэглэгч олдсонгүй</p>
                  </div>
                )}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surf-100">
                      {['Хэрэглэгч', 'Чиглэл', 'Бүртгүүлсэн', 'Профайл', ''].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className="border-b border-surf-50 hover:bg-surf-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar u={u} size="sm"/>
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
                            u.ner ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-gray-50 border border-gray-100 text-gray-400'
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
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ONLINE TAB ── */}
      {tab === 'online' && (
        <div className="space-y-2 animate-fade-up-delay">
          {online.length === 0 ? (
            <div className="card rounded-2xl p-10 text-center text-gray-300">
              <div className="text-3xl mb-2">🟡</div>
              <p className="text-sm">Одоогоор онлайн хэрэглэгч байхгүй</p>
            </div>
          ) : online.map(o => {
            const u = users.find(u => u.id === o.id);
            return (
              <div key={o.id} className="card rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 animate-pulse"/>
                <Avatar u={u || { email: o.id }} size="sm"/>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800 text-sm font-semibold truncate">
                    {u?.ner ? `${u.ovog||''} ${u.ner}`.trim() : u?.email || o.id}
                  </div>
                  {u?.chiglel && <div className="text-gray-400 text-xs truncate">{u.chiglel}</div>}
                </div>
                {u && (
                  <button onClick={() => setSelected(u)}
                    className="text-xs text-brand-500 font-semibold flex-shrink-0">
                    Харах →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── VERIFY TAB ── */}
      {tab === 'verify' && (
        <div className="space-y-4 animate-fade-up-delay">
          {pendingVerify.length === 0 ? (
            <div className="card rounded-2xl p-10 text-center text-gray-300">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm">Хүлээгдэж буй хүсэлт байхгүй байна</p>
            </div>
          ) : pendingVerify.map(u => (
            <div key={u.id} className="card rounded-2xl p-4 sm:p-5 border border-amber-100 bg-amber-50">
              <div className="flex items-start gap-3">
                <Avatar u={u} size="lg"/>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-gray-800 text-sm">
                    {u.ner ? `${u.ovog||''} ${u.ner}`.trim() : u.email}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5 truncate">{u.email}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {u.zэрэг && <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full">🏅 {u.zэрэг}</span>}
                    {u.surgaltin_gazar && <span className="text-xs bg-surf-100 border border-surf-200 text-gray-600 px-2 py-0.5 rounded-full">📄 {u.surgaltin_gazar}</span>}
                    {u.chiglel && <span className="text-xs bg-brand-50 border border-brand-100 text-brand-600 px-2 py-0.5 rounded-full">{u.chiglel}</span>}
                  </div>
                  {u.cert_url && (
                    <a href={u.cert_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-brand-500 hover:text-brand-700 font-semibold border border-brand-200 bg-white px-3 py-1.5 rounded-xl transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Үнэмлэх харах
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-amber-200">
                <button
                  onClick={async () => await updateDoc(doc(db,'users',u.id), { zovshoorol: true, verifiedAt: serverTimestamp() })}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                  ✅ Зөвшөөрөх
                </button>
                <button
                  onClick={async () => await updateDoc(doc(db,'users',u.id), { zovshoorol: false, verifiedAt: null })}
                  className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2.5 rounded-xl text-sm transition-all">
                  ❌ Татгалзах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── AI SETTINGS TAB ── */}
      {tab === 'ai' && <AISettingsTab/>}

      {/* ── USER DETAIL MODAL (full screen on mobile) ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}/>
          <div className="relative bg-white w-full sm:max-w-md z-10 animate-fade-up border border-surf-200
            rounded-t-3xl sm:rounded-2xl shadow-2xl
            max-h-[92vh] sm:max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full"/>
            </div>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surf-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar u={selected} size="lg"/>
                <div>
                  <h2 className="text-base font-display font-bold text-gray-800">
                    {selected.ner ? `${selected.ovog||''} ${selected.ner}`.trim() : '—'}
                  </h2>
                  <p className="text-gray-400 text-xs truncate max-w-[180px]">{selected.email}</p>
                  {selected.isAdmin && (
                    <span className="text-xs bg-red-50 border border-red-100 text-red-500 px-2 py-0.5 rounded-full font-medium">Admin</span>
                  )}
                  {selected.premiumPlan && selected.premiumPlan !== 'free' && (
                    <span className="text-xs bg-violet-50 border border-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium ml-1">💎 {selected.premiumPlan}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 transition p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {[
                { label: 'Имэйл',       value: selected.email },
                { label: 'Чиглэл',      value: selected.chiglel },
                { label: 'Чадвар',      value: selected.chadvar },
                { label: 'Туршлага',    value: selected.turshlaga },
                { label: 'Хаяг',        value: selected.hayg },
                { label: 'Зэрэг',       value: selected.zэрэг },
                { label: 'Диплом №',    value: selected.surgaltin_gazar },
                { label: 'Хүссэн цалин',value: selected.tsalin ? selected.tsalin + '₮' : null },
                { label: 'Утас',        value: selected.utas },
                { label: 'CV / Намтар', value: selected.cv },
                { label: 'Нэмэлт',      value: selected.nemelt },
                { label: 'Бүртгүүлсэн', value: selected.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="bg-surf-50 rounded-xl px-4 py-3">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{row.label}</div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap break-words">{row.value}</div>
                </div>
              ))}
            </div>

            {/* Admin toggle */}
            {selected.id !== user?.uid && (
              <div className="px-5 py-4 border-t border-surf-100 flex items-center justify-between flex-shrink-0">
                <span className="text-sm text-gray-500 font-medium">Админ эрх</span>
                <button
                  onClick={async () => {
                    const newVal = !selected.isAdmin;
                    await updateDoc(doc(db, 'users', selected.id), { isAdmin: newVal });
                    setSelected(s => ({ ...s, isAdmin: newVal }));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selected.isAdmin
                      ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                      : 'bg-brand-50 border-brand-200 text-brand-600 hover:bg-brand-100'
                  }`}>
                  {selected.isAdmin ? '● Эрх авах' : '○ Эрх өгөх'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ u, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-11 h-11 text-base' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs';
  const initial = (u?.ner || u?.email || '?')[0].toUpperCase();
  return (
    <div className={`${sz} rounded-full overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0`}>
      {u?.photoURL
        ? <img src={u.photoURL} alt="" className="w-full h-full object-cover"/>
        : <span className={`font-bold text-brand-600`}>{initial}</span>}
    </div>
  );
}

/* ── AI Settings Tab ── */
function AISettingsTab() {
  const [key, setKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    import('firebase/firestore').then(({ doc, getDoc }) => {
      getDoc(doc(db, 'settings', 'ai')).then(snap => {
        if (snap.exists() && snap.data().geminiKey) {
          const k = snap.data().geminiKey;
          setHasKey(true);
          setMaskedKey(k.slice(0,8) + '••••••••••••••' + k.slice(-4));
        }
      });
    });
  }, []);

  const handleSave = async () => {
    if (!key.trim()) return;
    setSaving(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'ai'), {
        geminiKey: key.trim(),
        updatedAt: new Date(),
      });
      setHasKey(true);
      setMaskedKey(key.slice(0,8) + '••••••••••••••' + key.slice(-4));
      setKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) { alert('Алдаа: ' + e.message); }
    setSaving(false);
  };

  const handleRemove = async () => {
    if (!window.confirm('API түлхүүрийг устгах уу? AI туслах идэвхгүй болно.')) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'settings', 'ai'));
      setHasKey(false);
      setMaskedKey('');
    } catch(e) { alert('Алдаа'); }
  };

  return (
    <div className="space-y-4 animate-fade-up-delay">
      <div className="card rounded-2xl p-6 border border-brand-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-brand-100 rounded-2xl flex items-center justify-center text-xl">🤖</div>
          <div>
            <h2 className="font-display font-bold text-gray-800">AI Туслахын тохиргоо</h2>
            <p className="text-xs text-gray-400">Google Gemini API — бүх хэрэглэгч нэг түлхүүр ашиглана</p>
          </div>
        </div>

        {/* Current status */}
        <div className={`rounded-xl px-4 py-3 mb-5 flex items-center gap-3 ${
          hasKey ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${hasKey ? 'bg-emerald-400' : 'bg-amber-400'} flex-shrink-0`}/>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${hasKey ? 'text-emerald-700' : 'text-amber-700'}`}>
              {hasKey ? '✅ AI туслах идэвхтэй' : '⚠️ API түлхүүр тохируулаагүй'}
            </div>
            {hasKey && maskedKey && (
              <div className="text-xs text-emerald-600 font-mono mt-0.5">{maskedKey}</div>
            )}
          </div>
          {hasKey && (
            <button onClick={handleRemove}
              className="text-xs text-red-400 hover:text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition font-medium">
              Устгах
            </button>
          )}
        </div>

        {/* Key input */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {hasKey ? 'API түлхүүр солих' : 'Google Gemini API түлхүүр'}
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="input-base flex-1 font-mono text-sm"
            />
            <button onClick={handleSave} disabled={saving || !key.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 flex-shrink-0">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : '💾 Хадгалах'}
            </button>
          </div>
          {saved && (
            <div className="text-sm text-emerald-600 flex items-center gap-2">
              ✅ API түлхүүр амжилттай хадгалагдлаа. Бүх хэрэглэгч ашиглах боломжтой боллоо.
            </div>
          )}
        </div>

        {/* How to get key */}
        <div className="mt-5 bg-surf-50 border border-surf-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">🔑 API түлхүүр хэрхэн авах:</div>
          <ol className="space-y-1 text-xs text-gray-500">
            <li>1. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
              className="text-brand-500 hover:underline font-medium">aistudio.google.com/app/apikey</a> руу орно</li>
            <li>2. Google account-аараа нэвтэрнэ</li>
            <li>3. <strong className="text-gray-700">"Create API key"</strong> дарна</li>
            <li>4. <code className="bg-white border border-surf-200 px-1 rounded">AIzaSy...</code> эхэлсэн түлхүүрийг хуулна</li>
            <li>5. Дээрх талбарт буулгаж "Хадгалах" дарна</li>
          </ol>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            💡 Gemini 1.5 Flash: минутанд 15 хүсэлт, өдөрт 1,500 хүсэлт <strong>үнэгүй</strong>
          </div>
        </div>
      </div>

      {/* Usage info */}
      <div className="card rounded-2xl p-5 border border-surf-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">AI туслахын мэдлэгийн сан</h3>
        <div className="space-y-2 text-xs text-gray-500">
          {[
            'Платформын бүх хэсэг — ажил хайх, зар нэмэх, санхүү, premium',
            'Мэргэшсэн ажилтан болох процесс',
            'Барилттай шилжүүлэг (escrow) систем',
            'Хайлт болон шүүлтүүрийн заавар',
            'Бүртгэл, нэвтрэлтийн тайлбар',
          ].map(t => (
            <div key={t} className="flex items-start gap-2">
              <span className="text-emerald-500 flex-shrink-0">✓</span>{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
