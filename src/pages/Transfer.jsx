import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, increment, serverTimestamp, runTransaction, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Transfer() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('shuud');
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const findUserByEmail = async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError('Зөв дүн оруулна уу');
    if (amt > (profile?.balance || 0)) return setError('Үлдэгдэл хүрэлцэхгүй байна');
    setLoading(true);
    try {
      const toUser = await findUserByEmail(toEmail.trim());
      if (!toUser) { setError('Тухайн имэйлтэй хэрэглэгч олдсонгүй'); setLoading(false); return; }
      if (toUser.id === user.uid) { setError('Өөрөө өөртөө шилжүүлэх боломжгүй'); setLoading(false); return; }

      if (mode === 'shuud') {
        await runTransaction(db, async (tx) => {
          const fromRef = doc(db, 'users', user.uid);
          const fromSnap = await tx.get(fromRef);
          if ((fromSnap.data().balance || 0) < amt) throw new Error('Үлдэгдэл хүрэлцэхгүй');
          tx.update(fromRef, { balance: increment(-amt) });
          tx.update(doc(db, 'users', toUser.id), { balance: increment(amt) });
        });
        await addDoc(collection(db, 'transactions'), { uid: user.uid, type: 'zarlaga', amount: amt, note: note || `Шилжүүлэг → ${toEmail}`, toUid: toUser.id, createdAt: serverTimestamp() });
        await addDoc(collection(db, 'transactions'), { uid: toUser.id, type: 'orlogo', amount: amt, note: note || `Шилжүүлэг ← ${user.email}`, fromUid: user.uid, createdAt: serverTimestamp() });
        await refreshProfile();
        setSuccess(`${amt.toLocaleString()}₮ амжилттай шилжүүллээ!`);
        setToEmail(''); setAmount(''); setNote('');
      } else {
        await runTransaction(db, async (tx) => {
          const fromRef = doc(db, 'users', user.uid);
          const fromSnap = await tx.get(fromRef);
          if ((fromSnap.data().balance || 0) < amt) throw new Error('Үлдэгдэл хүрэлцэхгүй');
          tx.update(fromRef, { balance: increment(-amt) });
        });
        const er = await addDoc(collection(db, 'escrows'), { fromUid: user.uid, fromEmail: user.email, toUid: toUser.id, toEmail: toEmail.trim(), amount: amt, note: note || 'Барилттай шилжүүлэг', status: 'pending', createdAt: serverTimestamp() });
        await addDoc(collection(db, 'transactions'), { uid: user.uid, type: 'zarlaga', amount: amt, note: `[Барилттай] ${note || toEmail}`, toUid: toUser.id, escrowId: er.id, createdAt: serverTimestamp() });
        await refreshProfile();
        setSuccess('Барилттай шилжүүлэг амжилттай үүслээ!');
        setToEmail(''); setAmount(''); setNote('');
      }
    } catch (err) { setError(err.message || 'Алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <button onClick={() => navigate('/sanhuu')} className="w-9 h-9 btn-ghost rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <p className="text-ink-400 text-xs uppercase tracking-wider font-semibold">Санхүү</p>
          <h1 className="text-xl font-display font-bold text-ink-900">Мөнгө шилжүүлэх</h1>
        </div>
      </div>

      {/* Balance */}
      <div className="card p-4 flex items-center gap-3 mb-6 border-l-4 border-l-amber-400 animate-fade-up-d1">
        <span className="text-2xl">💰</span>
        <div>
          <div className="text-ink-400 text-xs">Одоогийн үлдэгдэл</div>
          <div className="text-ink-900 font-display font-bold">{Number(profile?.balance || 0).toLocaleString()}₮</div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up-d1">
        {[
          { key: 'shuud',     icon: '⚡', label: 'Шууд шилжүүлэг',    desc: 'Мөнгө тэр даруй хүрнэ' },
          { key: 'barilttai', icon: '🔒', label: 'Барилттай шилжүүлэг', desc: 'Ажил дуусаад шилжинэ' },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`card p-4 text-left transition-all ${mode === m.key ? 'border-amber-400 bg-amber-50' : 'card-hover'}`}>
            <div className="text-xl mb-2">{m.icon}</div>
            <div className={`text-sm font-bold mb-1 ${mode === m.key ? 'text-amber-700' : 'text-ink-800'}`}>{m.label}</div>
            <div className="text-ink-400 text-xs">{m.desc}</div>
            {mode === m.key && (
              <div className="mt-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {mode === 'barilttai' && (
        <div className="mb-5 card p-4 border-l-4 border-l-amber-400 bg-amber-50 animate-fade-in">
          <p className="text-amber-800 text-xs leading-relaxed">
            ℹ️ Мөнгийг таны дансаас хасч хадгална. Хүлээн авагч <strong>"Ажил дуусгалаа"</strong> дарсны дараа та зөвшөөрвөл шилжинэ.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up-d2">
        <div>
          <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Хүлээн авагчийн имэйл</label>
          <input type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="example@mail.com" required className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Дүн (₮)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50,000" min="1" required className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Тайлбар (заавал биш)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Гүйлгээний зориулалт..." rows={2} className="input-field resize-none" />
        </div>
        {error   && <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm">{error}</div>}
        {success && <div className="bg-sage-50 border border-sage-100 rounded-xl px-4 py-3 text-sage-700 text-sm">✅ {success}</div>}
        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : (
            <>{mode === 'shuud' ? '⚡' : '🔒'} {mode === 'shuud' ? 'Шууд шилжүүлэх' : 'Барилттай шилжүүлэх'}</>
          )}
        </button>
      </form>
    </div>
  );
}
