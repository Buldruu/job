import { useEffect, useState } from 'react';
import {
  collection, addDoc, query, onSnapshot,
  orderBy, serverTimestamp, doc, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const chiglels = ['Бүгд', 'IT / Технологи', 'Санхүү', 'Маркетинг', 'Инженер', 'Эрүүл мэнд', 'Боловсрол', 'Дизайн', 'Бусад'];

const configs = {
  // Ажил хайж байгаа хүн өөрийн мэдээллээ оруулна (CV, овог нэр...)
  ajil: {
    title: 'Ажил хайх',
    addLabel: 'Зар нэмэх',
    addTitle: 'Өөрийн мэдээлэл оруулах',
    collection: 'jobs',
    fields: [
      { key: 'ovog',      label: 'Овог',            required: true  },
      { key: 'ner',       label: 'Нэр',             required: true  },
      { key: 'chadvar',   label: 'Чадвар',          required: false },
      { key: 'turshlaga', label: 'Туршлага',        required: false },
      { key: 'tsalin',    label: 'Хүссэн цалин (₮)', required: false },
      { key: 'chiglel',   label: 'Чиглэл',          required: false },
      { key: 'hayg',      label: 'Хаяг',            required: false },
      { key: 'cv',        label: 'CV / Намтар',     required: false, textarea: true },
      { key: 'nemelt',    label: 'Нэмэлт',          required: false, textarea: true },
    ],
    cardTitle: (d) => d.ner ? `${d.ovog || ''} ${d.ner}`.trim() : 'Ажил хайгч',
    cardSub:   (d) => d.chiglel,
    salaryKey: 'tsalin',
  },

  // Ажилтан хайж байгаа байгууллага зар оруулна (байгууллага, албан тушаал...)
  ajiltan: {
    title: 'Ажилтан хайх',
    addLabel: 'Зар нэмэх',
    addTitle: 'Ажлын зар оруулах',
    collection: 'workers',
    fields: [
      { key: 'baiguulgiin_ner',    label: 'Байгууллагын нэр',      required: true  },
      { key: 'alban_tushaal',      label: 'Албан тушаал',          required: true  },
      { key: 'chadvar',            label: 'Чадвар / Мэдлэг',       required: false },
      { key: 'turshlaga',          label: 'Туршлага',              required: false },
      { key: 'tsalin',             label: 'Цалин (₮)',             required: false },
      { key: 'chiglel',            label: 'Чиглэл',                required: false },
      { key: 'hayg',               label: 'Хаяг',                  required: false },
      { key: 'ajilchinaas_huseh',  label: 'Ажилтнаас хүсэх',      required: false, textarea: true },
      { key: 'nemelt',             label: 'Нэмэлт',                required: false, textarea: true },
    ],
    cardTitle: (d) => d.alban_tushaal || 'Ажлын зар',
    cardSub:   (d) => d.baiguulgiin_ner,
    salaryKey: 'tsalin',
  },

  dadlaga: {
    title: 'Дадлага',
    addLabel: 'Зар нэмэх',
    addTitle: 'Дадлагын зар оруулах',
    collection: 'internships',
    fields: [
      { key: 'baiguulgiin_ner',   label: 'Байгууллагын нэр',   required: true  },
      { key: 'alban_tushaal',     label: 'Дадлагын чиглэл',    required: true  },
      { key: 'chadvar',           label: 'Чадвар',             required: false },
      { key: 'turshlaga',         label: 'Туршлага',           required: false },
      { key: 'tsalin',            label: 'Цалин (₮)',          required: false },
      { key: 'chiglel',           label: 'Чиглэл',             required: false },
      { key: 'hayg',              label: 'Хаяг',               required: false },
      { key: 'ajilchinaas_huseh', label: 'Шаардлага',          required: false, textarea: true },
      { key: 'nemelt',            label: 'Нэмэлт',             required: false, textarea: true },
    ],
    cardTitle: (d) => d.alban_tushaal || 'Дадлага',
    cardSub:   (d) => d.baiguulgiin_ner,
    salaryKey: 'tsalin',
  },

  surgalt: {
    title: 'Сургалт',
    addLabel: 'Зар нэмэх',
    addTitle: 'Сургалтын зар оруулах',
    collection: 'courses',
    fields: [
      { key: 'baiguulga_ner', label: 'Байгууллага',     required: true  },
      { key: 'ner',           label: 'Сургалтын нэр',   required: true  },
      { key: 'une_hansh',     label: 'Үнэ ханш (₮)',    required: false },
      { key: 'hugatsaa',      label: 'Хугацаа',         required: false },
      { key: 'hayg',          label: 'Хаяг / Линк',     required: false },
      { key: 'nemelt',        label: 'Дэлгэрэнгүй',     required: false, textarea: true },
    ],
    cardTitle: (d) => d.ner || 'Сургалт',
    cardSub:   (d) => d.baiguulga_ner,
    salaryKey: 'une_hansh',
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
    setItems([]);
    setLoading(true);
    const q = query(collection(db, cfg.collection), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [type]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    await addDoc(collection(db, cfg.collection), {
      ...form,
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
    });
    setForm({});
    setShowForm(false);
    setSaving(false);
  };

  const openDetail = async (item) => {
    setSelected(item);
    setSelectedOwner(null);
    if (item.uid) {
      const snap = await getDoc(doc(db, 'users', item.uid));
      if (snap.exists()) setSelectedOwner(snap.data());
    }
  };

  const filtered = items.filter(i => {
    const matchChiglel = filterChiglel === 'Бүгд' || i.chiglel === filterChiglel;
    const s = search.toLowerCase();
    const matchSearch = !s || Object.values(i).some(v => String(v).toLowerCase().includes(s));
    return matchChiglel && matchSearch;
  });

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Haga</p>
          <h1 className="text-2xl font-display font-bold text-white">{cfg.title}</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {cfg.addLabel}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6 animate-fade-up-delay">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Хайх..."
          className="flex-1 bg-dark-700 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition"
        />
        {cfg.fields.some(f => f.key === 'chiglel') && (
          <select
            value={filterChiglel}
            onChange={e => setFilterChiglel(e.target.value)}
            className="bg-dark-700 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
          >
            {chiglels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-white/30 animate-fade-up-delay">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">Зар байхгүй байна</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-delay">
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => openDetail(item)}
              className="glass glass-hover rounded-2xl p-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-300 flex-shrink-0">
                  {(cfg.cardTitle(item)[0] || '?').toUpperCase()}
                </div>
                {item[cfg.salaryKey] && (
                  <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-lg whitespace-nowrap">
                    {item[cfg.salaryKey]}₮
                  </span>
                )}
              </div>
              <div className="font-display font-bold text-white text-base mb-1">{cfg.cardTitle(item)}</div>
              {cfg.cardSub(item) && <div className="text-white/50 text-sm">{cfg.cardSub(item)}</div>}
              {item.chiglel && (
                <div className="mt-3">
                  <span className="text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full">{item.chiglel}</span>
                </div>
              )}
              {item.hayg && <div className="text-white/30 text-xs mt-2">📍 {item.hayg}</div>}
              <div className="text-white/20 text-xs mt-3">
                {item.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || ''}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <Modal onClose={() => { setSelected(null); setSelectedOwner(null); }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">{cfg.cardTitle(selected)}</h2>
              {cfg.cardSub(selected) && <p className="text-white/50 text-sm mt-1">{cfg.cardSub(selected)}</p>}
            </div>
            <button onClick={() => { setSelected(null); setSelectedOwner(null); }} className="text-white/30 hover:text-white transition p-1">
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
                <div key={f.key}>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-white text-sm whitespace-pre-wrap">{val}</div>
                </div>
              );
            })}
          </div>
          {selectedOwner && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Зар оруулагч</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white">
                  {(selectedOwner.ner || selected.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {selectedOwner.ner ? `${selectedOwner.ovog || ''} ${selectedOwner.ner}`.trim() : selected.email}
                  </div>
                  {selectedOwner.email && <div className="text-white/40 text-xs">{selectedOwner.email}</div>}
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
            <h2 className="text-lg font-display font-bold text-white">{cfg.addTitle}</h2>
            <button onClick={() => { setShowForm(false); setForm({}); }} className="text-white/30 hover:text-white transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {cfg.fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  {f.label}{f.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {f.textarea ? (
                  <textarea
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.required}
                    rows={3}
                    className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition resize-none"
                  />
                ) : f.key === 'chiglel' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                  >
                    <option value="">Сонгоно уу</option>
                    {chiglels.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.required}
                    className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 transition"
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saving
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Хадгалах'}
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 w-full max-w-lg z-10 animate-fade-up">
        {children}
      </div>
    </div>
  );
}
