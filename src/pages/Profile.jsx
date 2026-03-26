import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const chiglels = ['IT / Технологи', 'Санхүү', 'Маркетинг', 'Инженер', 'Эрүүл мэнд', 'Боловсрол', 'Хуулийн', 'Дизайн', 'Бусад'];

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    ovog: '', ner: '', chadvar: '', turshlaga: '',
    hayg: '', chiglel: '', tsalin: '', cv: '', nemelt: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      ovog: profile.ovog || '',
      ner: profile.ner || '',
      chadvar: profile.chadvar || '',
      turshlaga: profile.turshlaga || '',
      hayg: profile.hayg || '',
      chiglel: profile.chiglel || '',
      tsalin: profile.tsalin || '',
      cv: profile.cv || '',
      nemelt: profile.nemelt || '',
    });
  }, [profile]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), form);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const displayName = form.ner ? `${form.ovog} ${form.ner}`.trim() : user?.email?.split('@')[0] || '';

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Тохиргоо</p>
        <h1 className="text-2xl font-display font-bold text-white">Профайл</h1>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 animate-fade-up-delay">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-2xl font-display font-bold text-white shadow-lg shadow-brand-600/30 flex-shrink-0">
          {displayName[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="text-white font-display font-bold text-lg">{displayName || '—'}</div>
          <div className="text-white/40 text-sm">{user?.email}</div>
          {form.chiglel && <div className="text-brand-400 text-xs mt-1 font-medium">{form.chiglel}</div>}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 animate-fade-up-delay2">
        {/* Name row */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Үндсэн мэдээлэл</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Овог" value={form.ovog} onChange={v => set('ovog', v)} placeholder="Батбаяр" />
            <Field label="Нэр" value={form.ner} onChange={v => set('ner', v)} placeholder="Болд" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Чадвар" value={form.chadvar} onChange={v => set('chadvar', v)} placeholder="React, Python..." />
            <Field label="Туршлага" value={form.turshlaga} onChange={v => set('turshlaga', v)} placeholder="3 жил" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Чиглэл</label>
              <select
                value={form.chiglel}
                onChange={e => set('chiglel', e.target.value)}
                className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="">Сонгоно уу</option>
                {chiglels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Хүссэн цалин (₮)" value={form.tsalin} onChange={v => set('tsalin', v)} placeholder="1,500,000" />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Дэлгэрэнгүй</h3>
          <TextArea label="Хаяг" value={form.hayg} onChange={v => set('hayg', v)} placeholder="Улаанбаатар, ..." rows={2} />
          <TextArea label="CV / Намтар" value={form.cv} onChange={v => set('cv', v)} placeholder="Товч намтар, туршлага..." rows={4} />
          <TextArea label="Нэмэлт" value={form.nemelt} onChange={v => set('nemelt', v)} placeholder="Бусад мэдээлэл..." rows={3} />
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
            ✅ Мэдээлэл хадгалагдлаа
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Хадгалах'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition resize-none"
      />
    </div>
  );
}
