import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const chiglels = ['IT / Технологи', 'Санхүү', 'Маркетинг', 'Инженер', 'Эрүүл мэнд', 'Боловсрол', 'Хуулийн', 'Дизайн', 'Бусад'];
const fmt = (n) => Number(n || 0).toLocaleString('mn-MN') + '₮';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [tab, setTab] = useState('medeelel'); // medeelel | sanhuu
  const [form, setForm] = useState({
    ovog: '', ner: '', chadvar: '', turshlaga: '',
    hayg: '', chiglel: '', tsalin: '', cv: '', nemelt: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Finance
  const [txns, setTxns] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);

  useEffect(() => {
    if (profile) setForm({
      ovog:      profile.ovog      || '',
      ner:       profile.ner       || '',
      chadvar:   profile.chadvar   || '',
      turshlaga: profile.turshlaga || '',
      hayg:      profile.hayg      || '',
      chiglel:   profile.chiglel   || '',
      tsalin:    profile.tsalin    || '',
      cv:        profile.cv        || '',
      nemelt:    profile.nemelt    || '',
    });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTxns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTxnLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const list = {};
    const merge = (snap) => {
      snap.docs.forEach(d => list[d.id] = { id: d.id, ...d.data() });
      setEscrows(Object.values(list));
    };
    const { query: q, collection: col, where: wh } = { query, collection, where };
    const u1 = onSnapshot(query(collection(db, 'escrows'), where('fromUid', '==', user.uid)), merge);
    const u2 = onSnapshot(query(collection(db, 'escrows'), where('toUid',   '==', user.uid)), merge);
    return () => { u1(); u2(); };
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), form);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const displayName = form.ner ? `${form.ovog} ${form.ner}`.trim() : user?.email?.split('@')[0] || '';
  const photoURL    = profile?.photoURL || null;

  const income   = txns.filter(t => t.type === 'orlogo').reduce((s, t) => s + t.amount, 0);
  const expense  = txns.filter(t => t.type === 'zarlaga').reduce((s, t) => s + t.amount, 0);
  const escrowed = escrows.filter(e => e.status === 'pending' && e.fromUid === user?.uid).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-8 max-w-2xl">
      {/* ── Avatar + name ── */}
      <div className="flex items-center gap-6 mb-8 animate-fade-up">
        <div className="relative flex-shrink-0">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            {photoURL ? (
              <img src={photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-display font-bold text-white">
                {displayName[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          {/* Upload button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={photoUploading}
            className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
            title="Зураг солих"
          >
            {photoUploading ? (
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-white truncate">{displayName || '—'}</h1>
          <p className="text-white/40 text-sm">{user?.email}</p>
          {form.chiglel && <span className="inline-block mt-1.5 text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full">{form.chiglel}</span>}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-dark-700 rounded-xl p-1 mb-8 animate-fade-up-delay">
        {[
          { key: 'medeelel', label: 'Миний мэдээлэл', icon: '👤' },
          { key: 'sanhuu',   label: 'Санхүү',          icon: '💳' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              tab === t.key
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'text-white/40 hover:text-white/70'
            }`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: МЭДЭЭЛЭЛ ══ */}
      {tab === 'medeelel' && (
        <form onSubmit={handleSave} className="space-y-5 animate-fade-up">
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Үндсэн мэдээлэл</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Овог"  value={form.ovog}  onChange={v => set('ovog',  v)} placeholder="Батбаяр" />
              <Field label="Нэр"   value={form.ner}   onChange={v => set('ner',   v)} placeholder="Болд" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Чадвар"    value={form.chadvar}   onChange={v => set('chadvar',   v)} placeholder="React, Python..." />
              <Field label="Туршлага"  value={form.turshlaga} onChange={v => set('turshlaga', v)} placeholder="3 жил" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Чиглэл</label>
                <select value={form.chiglel} onChange={e => set('chiglel', e.target.value)}
                  className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition">
                  <option value="">Сонгоно уу</option>
                  {chiglels.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Хүссэн цалин (₮)" value={form.tsalin} onChange={v => set('tsalin', v)} placeholder="1,500,000" />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Дэлгэрэнгүй</h3>
            <TextArea label="Хаяг"         value={form.hayg}   onChange={v => set('hayg',   v)} placeholder="Улаанбаатар, ..." rows={2} />
            <TextArea label="CV / Намтар"  value={form.cv}     onChange={v => set('cv',     v)} placeholder="Товч намтар, туршлага..." rows={4} />
            <TextArea label="Нэмэлт"       value={form.nemelt} onChange={v => set('nemelt', v)} placeholder="Бусад мэдээлэл..." rows={3} />
          </div>

          {saved && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">✅ Мэдээлэл хадгалагдлаа</div>
          )}
          <button type="submit" disabled={saving}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Хадгалах'}
          </button>
        </form>
      )}

      {/* ══ TAB: САНХҮҮ ══ */}
      {tab === 'sanhuu' && (
        <div className="space-y-6 animate-fade-up">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Үлдэгдэл',       value: fmt(profile?.balance), color: 'from-brand-500/30 to-brand-700/30', border: 'border-brand-500/30', icon: '💰' },
              { label: 'Орлого',          value: fmt(income),           color: 'from-green-500/20 to-green-700/20', border: 'border-green-500/20', icon: '📈' },
              { label: 'Зарлага',         value: fmt(expense),          color: 'from-red-500/20 to-red-700/20',     border: 'border-red-500/20',   icon: '📉' },
              { label: 'Барилттай мөнгө', value: fmt(escrowed),         color: 'from-amber-500/20 to-amber-700/20', border: 'border-amber-500/20', icon: '🔒' },
            ].map(c => (
              <div key={c.label} className={`glass rounded-2xl p-4 bg-gradient-to-br ${c.color} border ${c.border}`}>
                <div className="text-xl mb-2">{c.icon}</div>
                <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{c.label}</div>
                <div className="text-white text-lg font-display font-bold">{c.value}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <button onClick={() => navigate('/sanhuu/shiljuuleg')}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/30">
              💸 Шилжүүлэг
            </button>
            <button onClick={() => navigate('/sanhuu')}
              className="flex-1 glass glass-hover text-white/70 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all">
              📋 Дэлгэрэнгүй
            </button>
          </div>

          {/* Recent transactions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Сүүлийн гүйлгээ</h3>
            {txnLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : txns.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-white/30">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">Гүйлгээ байхгүй</p>
              </div>
            ) : (
              <div className="space-y-2">
                {txns.slice(0, 8).map(t => (
                  <div key={t.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                      t.type === 'orlogo' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {t.type === 'orlogo' ? '↓' : '↑'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{t.note || (t.type === 'orlogo' ? 'Орлого' : 'Зарлага')}</div>
                      <div className="text-white/30 text-xs">{t.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || '—'}</div>
                    </div>
                    <div className={`font-bold text-sm flex-shrink-0 ${t.type === 'orlogo' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'orlogo' ? '+' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
                {txns.length > 8 && (
                  <button onClick={() => navigate('/sanhuu')}
                    className="w-full text-center text-white/30 hover:text-white/60 text-xs py-2 transition">
                    Бүгдийг харах ({txns.length}) →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition resize-none" />
    </div>
  );
}
