import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, doc, updateDoc,
  increment, serverTimestamp, runTransaction,
  getDocs, query, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Transfer() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('shuud'); // shuud | barilttai
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
    e.preventDefault();
    setError('');
    setSuccess('');
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError('Зөв дүн оруулна уу');
    if (amt > (profile?.balance || 0)) return setError('Үлдэгдэл хүрэлцэхгүй байна');
    setLoading(true);

    try {
      const toUser = await findUserByEmail(toEmail.trim());
      if (!toUser) { setError('Тухайн имэйлтэй хэрэглэгч олдсонгүй'); setLoading(false); return; }
      if (toUser.id === user.uid) { setError('Өөрөө өөртөө шилжүүлэх боломжгүй'); setLoading(false); return; }

      if (mode === 'shuud') {
        // Direct transfer
        await runTransaction(db, async (tx) => {
          const fromRef = doc(db, 'users', user.uid);
          const toRef = doc(db, 'users', toUser.id);
          const fromSnap = await tx.get(fromRef);
          if ((fromSnap.data().balance || 0) < amt) throw new Error('Үлдэгдэл хүрэлцэхгүй');
          tx.update(fromRef, { balance: increment(-amt) });
          tx.update(toRef, { balance: increment(amt) });
        });
        // Log transactions
        await addDoc(collection(db, 'transactions'), {
          uid: user.uid, type: 'zarlaga', amount: amt,
          note: note || `Шилжүүлэг → ${toEmail}`, toUid: toUser.id,
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, 'transactions'), {
          uid: toUser.id, type: 'orlogo', amount: amt,
          note: note || `Шилжүүлэг ← ${user.email}`, fromUid: user.uid,
          createdAt: serverTimestamp(),
        });
        await refreshProfile();
        setSuccess(`${amt.toLocaleString()}₮ амжилттай шилжүүллээ!`);
        setToEmail(''); setAmount(''); setNote('');

      } else {
        // Escrow transfer - hold funds
        await runTransaction(db, async (tx) => {
          const fromRef = doc(db, 'users', user.uid);
          const fromSnap = await tx.get(fromRef);
          if ((fromSnap.data().balance || 0) < amt) throw new Error('Үлдэгдэл хүрэлцэхгүй');
          tx.update(fromRef, { balance: increment(-amt) });
        });
        const escrowRef = await addDoc(collection(db, 'escrows'), {
          fromUid: user.uid, fromEmail: user.email,
          toUid: toUser.id, toEmail: toEmail.trim(),
          amount: amt, note: note || 'Барилттай шилжүүлэг',
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, 'transactions'), {
          uid: user.uid, type: 'zarlaga', amount: amt,
          note: `[Барилттай] ${note || toEmail}`, toUid: toUser.id,
          escrowId: escrowRef.id,
          createdAt: serverTimestamp(),
        });
        await refreshProfile();
        setSuccess('Барилттай шилжүүлэг амжилттай үүслээ! Хүлээн авагч ажлаа дуусгасны дараа мөнгө шилжинэ.');
        setToEmail(''); setAmount(''); setNote('');
      }
    } catch (err) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <button
          onClick={() => navigate('/sanhuu')}
          className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">Санхүү</p>
          <h1 className="text-xl font-display font-bold text-white">Мөнгө шилжүүлэх</h1>
        </div>
      </div>

      {/* Balance badge */}
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 mb-8 animate-fade-up-delay">
        <div className="text-xl">💰</div>
        <div>
          <div className="text-white/40 text-xs">Одоогийн үлдэгдэл</div>
          <div className="text-white font-display font-bold">{Number(profile?.balance || 0).toLocaleString()}₮</div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3 mb-8 animate-fade-up-delay">
        {[
          { key: 'shuud', label: 'Шууд шилжүүлэг', icon: '⚡', desc: 'Мөнгө тэр даруй хүрнэ' },
          { key: 'barilttai', label: 'Барилттай шилжүүлэг', icon: '🔒', desc: 'Ажил дуусаад шилжинэ' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 glass rounded-2xl p-4 text-left transition-all ${
              mode === m.key
                ? 'border border-brand-500/50 bg-brand-500/10'
                : 'border border-white/5 hover:border-white/10'
            }`}
          >
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className={`text-sm font-bold mb-1 ${mode === m.key ? 'text-brand-300' : 'text-white'}`}>{m.label}</div>
            <div className="text-white/40 text-xs">{m.desc}</div>
            {mode === m.key && (
              <div className="mt-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Escrow info banner */}
      {mode === 'barilttai' && (
        <div className="mb-6 glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/5 animate-fade-up">
          <div className="flex gap-3">
            <div className="text-amber-400 flex-shrink-0">ℹ️</div>
            <div className="text-amber-200/80 text-xs leading-relaxed">
              Барилттай шилжүүлэгийн үед мөнгийг таны дансаас хасч хадгална. Хүлээн авагч <strong>"Ажил дуусгалаа"</strong> дарсны дараа та зөвшөөрвөл мөнгө шилжинэ.
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up-delay2">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Хүлээн авагчийн имэйл
          </label>
          <input
            type="email"
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            placeholder="example@mail.com"
            required
            className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Дүн (₮)
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="50,000"
            min="1"
            required
            className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Тайлбар (заавал биш)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Гүйлгээний зориулалт..."
            rows={2}
            className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {mode === 'shuud' ? '⚡' : '🔒'}
              {mode === 'shuud' ? 'Шууд шилжүүлэх' : 'Барилттай шилжүүлэх'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
