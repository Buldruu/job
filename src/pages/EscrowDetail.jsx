import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, runTransaction, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => Number(n || 0).toLocaleString('mn-MN') + '₮';

export default function EscrowDetail() {
  const { id } = useParams();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'escrows', id), snap => {
      setEscrow(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) return <div className="p-8 flex justify-center py-24"><div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!escrow) return <div className="p-8 text-center text-ink-300 py-24">Олдсонгүй</div>;

  const isFrom = escrow.fromUid === user?.uid;
  const isTo   = escrow.toUid   === user?.uid;
  const isPending      = escrow.status === 'pending';
  const isDoneRequested = escrow.status === 'done_requested';

  const markDone = async () => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'escrows', id), { status: 'done_requested', doneRequestedAt: serverTimestamp() });
      setMsg('Ажил дуусгасан гэж илгээлээ. Илгээгчийн зөвшөөрлийг хүлээнэ үү.');
    } catch { setMsg('Алдаа гарлаа'); }
    setActionLoading(false);
  };

  const approveRelease = async () => {
    setActionLoading(true);
    try {
      await runTransaction(db, async (tx) => {
        tx.update(doc(db, 'users', escrow.toUid), { balance: increment(escrow.amount) });
        tx.update(doc(db, 'escrows', id), { status: 'completed', completedAt: serverTimestamp() });
      });
      await addDoc(collection(db, 'transactions'), { uid: escrow.toUid, type: 'orlogo', amount: escrow.amount, note: `[Барилттай дууссан] ${escrow.note || ''}`, fromUid: escrow.fromUid, escrowId: id, createdAt: serverTimestamp() });
      await refreshProfile();
      setMsg('Мөнгийг амжилттай шилжүүлэлээ!');
    } catch (e) { setMsg('Алдаа: ' + e.message); }
    setActionLoading(false);
  };

  const cancelEscrow = async () => {
    if (!window.confirm('Цуцлахдаа итгэлтэй байна уу?')) return;
    setActionLoading(true);
    try {
      await runTransaction(db, async (tx) => {
        tx.update(doc(db, 'users', escrow.fromUid), { balance: increment(escrow.amount) });
        tx.update(doc(db, 'escrows', id), { status: 'cancelled', cancelledAt: serverTimestamp() });
      });
      await addDoc(collection(db, 'transactions'), { uid: escrow.fromUid, type: 'orlogo', amount: escrow.amount, note: `[Барилттай цуцлагдсан] ${escrow.note || ''}`, escrowId: id, createdAt: serverTimestamp() });
      await refreshProfile();
      setMsg('Цуцлагдлаа. Мөнгийг таны данс руу буцааллаа.');
    } catch { setMsg('Алдаа гарлаа'); }
    setActionLoading(false);
  };

  const st = {
    pending:       { label: 'Хүлээгдэж буй',   icon: '🔒', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    done_requested:{ label: 'Зөвшөөрөл хүлээж буй', icon: '⏳', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    completed:     { label: 'Амжилттай дууссан', icon: '✅', bg: 'bg-sage-50 border-sage-100',   text: 'text-sage-700'  },
    cancelled:     { label: 'Цуцлагдсан',        icon: '❌', bg: 'bg-rose-50 border-rose-200',   text: 'text-rose-600'  },
  }[escrow.status] || { label: '—', icon: '?', bg: 'bg-cream-100', text: 'text-ink-400' };

  const Spinner = () => <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />;

  return (
    <div className="p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <button onClick={() => navigate('/sanhuu')} className="w-9 h-9 btn-ghost rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <p className="text-ink-400 text-xs uppercase tracking-wider font-semibold">Санхүү</p>
          <h1 className="text-xl font-display font-bold text-ink-900">Барилттай шилжүүлэг</h1>
        </div>
      </div>

      <div className={`card p-5 border ${st.bg} mb-5 animate-fade-up-d1`}>
        <div className="text-3xl mb-3">{st.icon}</div>
        <div className={`font-bold text-lg mb-1 ${st.text}`}>{st.label}</div>
        <div className="text-ink-900 text-2xl font-display font-bold">{fmt(escrow.amount)}</div>
      </div>

      <div className="card p-5 space-y-3 mb-5 animate-fade-up-d1">
        {[
          { l: 'Илгээгч', v: escrow.fromEmail },
          { l: 'Хүлээн авагч', v: escrow.toEmail },
          { l: 'Тайлбар', v: escrow.note || '—' },
          { l: 'Огноо', v: escrow.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || '—' },
        ].map(r => (
          <div key={r.l} className="flex justify-between items-center">
            <span className="text-ink-400 text-sm">{r.l}</span>
            <span className="text-ink-900 text-sm font-medium">{r.v}</span>
          </div>
        ))}
      </div>

      <div className="card px-4 py-3 flex items-center gap-3 mb-5 animate-fade-up-d2">
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
          {isFrom ? 'И' : 'Х'}
        </div>
        <span className="text-ink-500 text-sm">
          Та энэ гүйлгээний <strong className="text-ink-900">{isFrom ? 'илгээгч' : 'хүлээн авагч'}</strong>
        </span>
      </div>

      {msg && <div className="card px-4 py-3 text-sm text-amber-700 border-amber-200 bg-amber-50 mb-4 animate-fade-in">{msg}</div>}

      <div className="space-y-3 animate-fade-up-d2">
        {isTo && isPending && (
          <button onClick={markDone} disabled={actionLoading}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {actionLoading ? <Spinner /> : <>✅ Ажлаа дуусгалаа</>}
          </button>
        )}
        {isFrom && isDoneRequested && (
          <>
            <div className="card p-4 border-blue-200 bg-blue-50 text-blue-700 text-sm">
              🔔 Хүлээн авагч ажлаа дуусгасан гэж мэдэгдлээ. Та шалган зөвшөөрнө үү.
            </div>
            <button onClick={approveRelease} disabled={actionLoading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {actionLoading ? <Spinner /> : <>💸 Зөвшөөрч мөнгө шилжүүлэх</>}
            </button>
          </>
        )}
        {isFrom && (isPending || isDoneRequested) && (
          <button onClick={cancelEscrow} disabled={actionLoading}
            className="w-full btn-ghost py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
            Цуцлах
          </button>
        )}
        {(escrow.status === 'completed' || escrow.status === 'cancelled') && (
          <button onClick={() => navigate('/sanhuu')} className="w-full btn-ghost py-3 rounded-xl text-sm">Буцах</button>
        )}
      </div>
    </div>
  );
}
