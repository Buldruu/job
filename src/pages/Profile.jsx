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
  const fileRef  = useRef();

  const [tab, setTab]   = useState('medeelel');
  const [form, setForm] = useState({ ovog:'', ner:'', chadvar:'', turshlaga:'', hayg:'', chiglel:'', tsalin:'', cv:'', nemelt:'' });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [txns,   setTxns]   = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);

  useEffect(() => {
    if (profile) setForm({ ovog: profile.ovog||'', ner: profile.ner||'', chadvar: profile.chadvar||'', turshlaga: profile.turshlaga||'', hayg: profile.hayg||'', chiglel: profile.chiglel||'', tsalin: profile.tsalin||'', cv: profile.cv||'', nemelt: profile.nemelt||'' });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => { setTxns(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setTxnLoading(false); });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const list = {};
    const merge = (snap) => { snap.docs.forEach(d => list[d.id] = { id: d.id, ...d.data() }); setEscrows(Object.values(list)); };
    const u1 = onSnapshot(query(collection(db, 'escrows'), where('fromUid', '==', user.uid)), merge);
    const u2 = onSnapshot(query(collection(db, 'escrows'), where('toUid',   '==', user.uid)), merge);
    return () => { u1(); u2(); };
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoUploading(true);
    try {
      const r = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      await refreshProfile();
    } catch (err) { console.error(err); }
    setPhotoUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    try { await updateDoc(doc(db, 'users', user.uid), form); await refreshProfile(); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (err) { console.error(err); }
    setSaving(false);
  };

  const displayName = form.ner ? `${form.ovog} ${form.ner}`.trim() : user?.email?.split('@')[0] || '';
  const photoURL    = profile?.photoURL || null;
  const income      = txns.filter(t => t.type === 'orlogo').reduce((s, t) => s + t.amount, 0);
  const expense     = txns.filter(t => t.type === 'zarlaga').reduce((s, t) => s + t.amount, 0);
  const escrowed    = escrows.filter(e => e.status === 'pending' && e.fromUid === user?.uid).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-8 max-w-2xl">
      {/* Avatar section */}
      <div className="flex items-center gap-5 mb-8 animate-fade-up">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-100 flex items-center justify-center shadow-soft border border-cream-300">
            {photoURL
              ? <img src={photoURL} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-3xl font-display font-bold text-amber-600">{displayName[0]?.toUpperCase() || '?'}</span>
            }
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={photoUploading}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center shadow-amber transition-all disabled:opacity-50"
            title="Зураг солих">
            {photoUploading
              ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            }
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-ink-900 truncate">{displayName || '—'}</h1>
          <p className="text-ink-400 text-sm">{user?.email}</p>
          {form.chiglel && <span className="inline-block mt-1.5 badge bg-amber-100 text-amber-700">{form.chiglel}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 mb-7 border border-cream-300 animate-fade-up-d1">
        {[{ key: 'medeelel', label: '👤  Миний мэдээлэл' }, { key: 'sanhuu', label: '💳  Санхүү' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white text-ink-900 shadow-soft border border-cream-300' : 'text-ink-400 hover:text-ink-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: МЭДЭЭЛЭЛ */}
      {tab === 'medeelel' && (
        <form onSubmit={handleSave} className="space-y-5 animate-fade-up">
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-300">Үндсэн мэдээлэл</h3>
            <div className="grid grid-cols-2 gap-4">
              <F label="Овог"  value={form.ovog}  onChange={v => set('ovog',  v)} ph="Батбаяр" />
              <F label="Нэр"   value={form.ner}   onChange={v => set('ner',   v)} ph="Болд" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Чадвар"   value={form.chadvar}   onChange={v => set('chadvar',   v)} ph="React, Python..." />
              <F label="Туршлага" value={form.turshlaga} onChange={v => set('turshlaga', v)} ph="3 жил" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Чиглэл</label>
                <select value={form.chiglel} onChange={e => set('chiglel', e.target.value)} className="input-field">
                  <option value="">Сонгоно уу</option>
                  {chiglels.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <F label="Хүссэн цалин (₮)" value={form.tsalin} onChange={v => set('tsalin', v)} ph="1,500,000" />
            </div>
          </div>
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-300">Дэлгэрэнгүй</h3>
            <TA label="Хаяг"        value={form.hayg}   onChange={v => set('hayg',   v)} ph="Улаанбаатар..." rows={2} />
            <TA label="CV / Намтар" value={form.cv}     onChange={v => set('cv',     v)} ph="Товч намтар..." rows={4} />
            <TA label="Нэмэлт"      value={form.nemelt} onChange={v => set('nemelt', v)} ph="Бусад мэдээлэл..." rows={2} />
          </div>
          {saved && <div className="bg-sage-50 border border-sage-100 rounded-xl px-4 py-3 text-sage-700 text-sm">✅ Мэдээлэл хадгалагдлаа</div>}
          <button type="submit" disabled={saving}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Хадгалах'}
          </button>
        </form>
      )}

      {/* TAB: САНХҮҮ */}
      {tab === 'sanhuu' && (
        <div className="space-y-5 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            {[
              { l:'Үлдэгдэл',       v: fmt(profile?.balance), icon:'💰', accent:'border-l-amber-400 bg-amber-50' },
              { l:'Орлого',         v: fmt(income),           icon:'📈', accent:'border-l-sage-400 bg-sage-50'  },
              { l:'Зарлага',        v: fmt(expense),          icon:'📉', accent:'border-l-rose-400 bg-rose-50'  },
              { l:'Барилттай мөнгө',v: fmt(escrowed),         icon:'🔒', accent:'border-l-blue-300 bg-blue-50'  },
            ].map(c => (
              <div key={c.l} className={`card p-4 border-l-4 ${c.accent}`}>
                <div className="text-xl mb-1.5">{c.icon}</div>
                <div className="text-ink-400 text-xs font-semibold uppercase tracking-wider mb-1">{c.l}</div>
                <div className="text-ink-900 font-display font-bold">{c.v}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/sanhuu/shiljuuleg')} className="btn-primary flex-1 py-2.5 text-sm">💸 Шилжүүлэг</button>
            <button onClick={() => navigate('/sanhuu')} className="btn-ghost flex-1 py-2.5 text-sm">📋 Дэлгэрэнгүй</button>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-300 mb-3">Сүүлийн гүйлгээ</h3>
            {txnLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : txns.length === 0 ? (
              <div className="card p-8 text-center text-ink-300"><div className="text-3xl mb-2">📭</div><p className="text-sm">Гүйлгээ байхгүй</p></div>
            ) : (
              <div className="space-y-2">
                {txns.slice(0, 8).map(t => (
                  <div key={t.id} className="card px-4 py-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${t.type === 'orlogo' ? 'bg-sage-100 text-sage-600' : 'bg-rose-50 text-rose-500'}`}>
                      {t.type === 'orlogo' ? '↓' : '↑'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-ink-800 text-sm font-medium truncate">{t.note || (t.type === 'orlogo' ? 'Орлого' : 'Зарлага')}</div>
                      <div className="text-ink-300 text-xs">{t.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || '—'}</div>
                    </div>
                    <div className={`font-bold text-sm flex-shrink-0 ${t.type === 'orlogo' ? 'text-sage-600' : 'text-rose-500'}`}>
                      {t.type === 'orlogo' ? '+' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
                {txns.length > 8 && (
                  <button onClick={() => navigate('/sanhuu')} className="w-full text-center text-ink-300 hover:text-ink-600 text-xs py-2 transition">
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

function F({ label, value, onChange, ph }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={ph} className="input-field" />
    </div>
  );
}

function TA({ label, value, onChange, ph, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={ph} rows={rows} className="input-field resize-none" />
    </div>
  );
}
