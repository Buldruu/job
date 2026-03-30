import { useEffect, useState } from 'react';
import {
  collection, addDoc, query, onSnapshot,
  orderBy, serverTimestamp, doc, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const chiglels = ['Бүгд','IT / Технологи','Санхүү','Маркетинг','Инженер','Эрүүл мэнд','Боловсрол','Дизайн','Бусад'];

const CARD_COLORS = [
  { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', dot: 'bg-violet-400' },
  { bg: 'bg-emerald-50',border: 'border-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-400'},
  { bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  { bg: 'bg-pink-50',   border: 'border-pink-100',   text: 'text-pink-700',   dot: 'bg-pink-400'   },
  { bg: 'bg-teal-50',   border: 'border-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-400'   },
];

const configs = {
  ajil: {
    title: 'Ажил хайх', addLabel: 'Зар нэмэх', addTitle: 'Өөрийн мэдээлэл оруулах',
    collection: 'jobs',
    fields: [
      { key: 'ovog',      label: 'Овог',             required: true  },
      { key: 'ner',       label: 'Нэр',              required: true  },
      { key: 'chadvar',   label: 'Чадвар',           required: false },
      { key: 'turshlaga', label: 'Туршлага',         required: false },
      { key: 'tsalin',    label: 'Хүссэн цалин (₮)', required: false },
      { key: 'chiglel',   label: 'Чиглэл',           required: false },
      { key: 'hayg',      label: 'Хаяг',             required: false },
      { key: 'cv',        label: 'CV / Намтар',      required: false, textarea: true },
      { key: 'nemelt',    label: 'Нэмэлт',           required: false, textarea: true },
    ],
    cardTitle: (d) => d.ner ? `${d.ovog || ''} ${d.ner}`.trim() : 'Ажил хайгч',
    cardSub: (d) => d.chiglel, salaryKey: 'tsalin',
  },
  ajiltan: {
    title: 'Ажилтан хайх', addLabel: 'Зар нэмэх', addTitle: 'Ажлын зар оруулах',
    collection: 'workers',
    fields: [
      { key: 'baiguulgiin_ner',   label: 'Байгууллагын нэр',  required: true  },
      { key: 'alban_tushaal',     label: 'Албан тушаал',      required: true  },
      { key: 'chadvar',           label: 'Чадвар / Мэдлэг',   required: false },
      { key: 'turshlaga',         label: 'Туршлага',          required: false },
      { key: 'tsalin',            label: 'Цалин (₮)',         required: false },
      { key: 'chiglel',           label: 'Чиглэл',            required: false },
      { key: 'hayg',              label: 'Хаяг',              required: false },
      { key: 'ajilchinaas_huseh', label: 'Ажилтнаас хүсэх',  required: false, textarea: true },
      { key: 'nemelt',            label: 'Нэмэлт',            required: false, textarea: true },
    ],
    cardTitle: (d) => d.alban_tushaal || 'Ажлын зар',
    cardSub: (d) => d.baiguulgiin_ner, salaryKey: 'tsalin',
  },
  dadlaga: {
    title: 'Дадлага', addLabel: 'Зар нэмэх', addTitle: 'Дадлагын зар оруулах',
    collection: 'internships',
    fields: [
      { key: 'baiguulgiin_ner',   label: 'Байгууллагын нэр', required: true  },
      { key: 'alban_tushaal',     label: 'Дадлагын чиглэл',  required: true  },
      { key: 'chadvar',           label: 'Чадвар',           required: false },
      { key: 'turshlaga',         label: 'Туршлага',         required: false },
      { key: 'tsalin',            label: 'Цалин (₮)',        required: false },
      { key: 'chiglel',           label: 'Чиглэл',           required: false },
      { key: 'hayg',              label: 'Хаяг',             required: false },
      { key: 'ajilchinaas_huseh', label: 'Шаардлага',        required: false, textarea: true },
      { key: 'nemelt',            label: 'Нэмэлт',           required: false, textarea: true },
    ],
    cardTitle: (d) => d.alban_tushaal || 'Дадлага',
    cardSub: (d) => d.baiguulgiin_ner, salaryKey: 'tsalin',
  },
  surgalt: {
    title: 'Сургалт', addLabel: 'Зар нэмэх', addTitle: 'Сургалтын зар оруулах',
    collection: 'courses',
    fields: [
      { key: 'baiguulga_ner', label: 'Байгууллага',   required: true  },
      { key: 'ner',           label: 'Сургалтын нэр', required: true  },
      { key: 'une_hansh',     label: 'Үнэ ханш (₮)',  required: false },
      { key: 'hugatsaa',      label: 'Хугацаа',       required: false },
      { key: 'hayg',          label: 'Хаяг / Линк',   required: false },
      { key: 'nemelt',        label: 'Дэлгэрэнгүй',   required: false, textarea: true },
    ],
    cardTitle: (d) => d.ner || 'Сургалт',
    cardSub: (d) => d.baiguulga_ner, salaryKey: 'une_hansh',
  },
};

export default function JobList({ type }) {
  const cfg = configs[type];
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [filterChiglel, setFilterChiglel] = useState('Бүгд');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems([]); setLoading(true);
    const q = query(collection(db, cfg.collection), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [type]);

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    await addDoc(collection(db, cfg.collection), { ...form, uid: user.uid, email: user.email, createdAt: serverTimestamp() });
    setForm({}); setShowForm(false); setSaving(false);
  };

  const openDetail = async (item) => {
    setSelected(item); setSelectedOwner(null);
    if (item.uid) {
      const snap = await getDoc(doc(db, 'users', item.uid));
      if (snap.exists()) setSelectedOwner(snap.data());
    }
  };

  const filtered = items.filter(i => {
    const mc = filterChiglel === 'Бүгд' || i.chiglel === filterChiglel;
    const s  = search.toLowerCase();
    const ms = !s || Object.values(i).some(v => String(v).toLowerCase().includes(s));
    return mc && ms;
  });

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Haga</p>
          <h1 className="text-2xl font-display font-bold text-gray-800">{cfg.title}</h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-btn transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {cfg.addLabel}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6 animate-fade-up-delay">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Хайх..."
            className="input-base pl-9" />
        </div>
        {cfg.fields.some(f => f.key === 'chiglel') && (
          <select value={filterChiglel} onChange={e => setFilterChiglel(e.target.value)}
            className="input-base w-auto">
            {chiglels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center text-gray-300 animate-fade-up-delay">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">Зар байхгүй байна</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-delay">
          {filtered.map((item, idx) => {
            const c = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <button key={item.id} onClick={() => openDetail(item)}
                className={`card card-hover rounded-2xl p-5 text-left border ${c.border} ${c.bg}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${c.text} bg-white border ${c.border} flex-shrink-0`}>
                    {(cfg.cardTitle(item)[0] || '?').toUpperCase()}
                  </div>
                  {item[cfg.salaryKey] && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg whitespace-nowrap">
                      {item[cfg.salaryKey]}₮
                    </span>
                  )}
                </div>
                <div className={`font-display font-bold text-base mb-1 ${c.text}`}>{cfg.cardTitle(item)}</div>
                {cfg.cardSub(item) && <div className="text-gray-500 text-sm">{cfg.cardSub(item)}</div>}
                {item.chiglel && (
                  <span className="inline-block mt-3 text-xs font-medium text-gray-500 bg-white border border-surf-200 px-2.5 py-1 rounded-full">
                    {item.chiglel}
                  </span>
                )}
                {item.hayg && <div className="text-gray-400 text-xs mt-2">📍 {item.hayg}</div>}
                <div className="text-gray-300 text-xs mt-3">
                  {item.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || ''}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <Modal onClose={() => { setSelected(null); setSelectedOwner(null); }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-800">{cfg.cardTitle(selected)}</h2>
              {cfg.cardSub(selected) && <p className="text-gray-400 text-sm mt-1">{cfg.cardSub(selected)}</p>}
            </div>
            <button onClick={() => { setSelected(null); setSelectedOwner(null); }}
              className="text-gray-300 hover:text-gray-500 transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {cfg.fields.map(f => {
              const val = selected[f.key];
              if (!val) return null;
              return (
                <div key={f.key} className="bg-surf-50 rounded-xl px-4 py-3">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{val}</div>
                </div>
              );
            })}
          </div>
          {selectedOwner && (
            <div className="mt-5 pt-4 border-t border-surf-100">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Зар оруулагч</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600">
                  {(selectedOwner.ner || selected.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-gray-700 text-sm font-medium">
                    {selectedOwner.ner ? `${selectedOwner.ovog || ''} ${selectedOwner.ner}`.trim() : selected.email}
                  </div>
                  {selectedOwner.email && <div className="text-gray-400 text-xs">{selectedOwner.email}</div>}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Add form modal */}
      {showForm && (
        <Modal onClose={() => { setShowForm(false); setForm({}); }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-bold text-gray-800">{cfg.addTitle}</h2>
            <button onClick={() => { setShowForm(false); setForm({}); }} className="text-gray-300 hover:text-gray-500 transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {cfg.fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {f.label}{f.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {f.textarea ? (
                  <textarea value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.required} rows={3} className="input-base resize-none" />
                ) : f.key === 'chiglel' ? (
                  <select value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="input-base">
                    <option value="">Сонгоно уу</option>
                    {chiglels.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.required} className="input-base" />
                )}
              </div>
            ))}
            <button type="submit" disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-btn flex items-center justify-center gap-2">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Хадгалах'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-hover p-6 w-full max-w-lg z-10 animate-fade-up border border-surf-200">
        {children}
      </div>
    </div>
  );
}
