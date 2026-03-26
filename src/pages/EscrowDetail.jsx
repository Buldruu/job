import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, onSnapshot, updateDoc, runTransaction,
  increment, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
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

  if (loading) return (
    <div className="p-8 flex justify-center py-24">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!escrow) return (
    <div className="p-8 text-center text-white/40 py-24">Олдсонгүй</div>
  );

  const isFrom = escrow.fromUid === user?.uid;
  const isTo = escrow.toUid === user?.uid;
  const isPending = escrow.status === 'pending';
  const isDoneRequested = escrow.status === 'done_requested';

  // Receiver: mark job done
  const markDone = async () => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'escrows', id), {
        status: 'done_requested',
        doneRequestedAt: serverTimestamp(),
      });
      setMsg('Ажил дуусгасан гэж илгээлээ. Илгээгчийн зөвшөөрлийг хүлээнэ үү.');
    } catch (e) { setMsg('Алдаа гарлаа'); }
    setActionLoading(false);
  };

  // Sender: approve release
  const approveRelease = async () => {
    setActionLoading(true);
    try {
      await runTransaction(db, async (tx) => {
        const toRef = doc(db, 'users', escrow.toUid);
        tx.update(toRef, { balance: increment(escrow.amount) });
        tx.update(doc(db, 'escrows', id), {
          status: 'completed',
          completedAt: serverTimestamp(),
        });
      });
      await addDoc(collection(db, 'transactions'), {
        uid: escrow.toUid, type: 'orlogo', amount: escrow.amount,
        note: `[Барилттай дууссан] ${escrow.note || ''}`,
        fromUid: escrow.fromUid, escrowId: id,
        createdAt: serverTimestamp(),
      });
      await refreshProfile();
      setMsg('Мөнгийг амжилттай шилжүүлэлээ!');
    } catch (e) { setMsg('Алдаа гарлаа: ' + e.message); }
    setActionLoading(false);
  };

  // Sender: cancel and refund
  const cancelEscrow = async () => {
    if (!window.confirm('Цуцлахдаа итгэлтэй байна уу? Мөнгийг таны данс руу буцаана.')) return;
    setActionLoading(true);
    try {
      await runTransaction(db, async (tx) => {
        const fromRef = doc(db, 'users', escrow.fromUid);
        tx.update(fromRef, { balance: increment(escrow.amount) });
        tx.update(doc(db, 'escrows', id), {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
        });
      });
      await addDoc(collection(db, 'transactions'), {
        uid: escrow.fromUid, type: 'orlogo', amount: escrow.amount,
        note: `[Барилттай цуцлагдсан] ${escrow.note || ''}`,
        escrowId: id,
        createdAt: serverTimestamp(),
      });
      await refreshProfile();
      setMsg('Цуцлагдлаа. Мөнгийг таны данс руу буцааллаа.');
    } catch (e) { setMsg('Алдаа гарлаа'); }
    setActionLoading(false);
  };

  const statusInfo = {
    pending: { label: 'Хүлээгдэж буй', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '🔒' },
    done_requested: { label: 'Ажил дуусгасан (зөвшөөрөл хүлээгдэж буй)', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: '⏳' },
    completed: { label: 'Амжилттай дууссан', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: '✅' },
    cancelled: { label: 'Цуцлагдсан', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: '❌' },
  };
  const st = statusInfo[escrow.status] || statusInfo.pending;

  return (
    <div className="p-8 max-w-lg">
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
          <h1 className="text-xl font-display font-bold text-white">Барилттай шилжүүлэг</h1>
        </div>
      </div>

      {/* Status */}
      <div className={`glass rounded-2xl p-5 border mb-6 ${st.bg} animate-fade-up-delay`}>
        <div className="text-3xl mb-3">{st.icon}</div>
        <div className={`font-bold text-lg mb-1 ${st.color}`}>{st.label}</div>
        <div className="text-white text-2xl font-display font-bold">{fmt(escrow.amount)}</div>
      </div>

      {/* Details */}
      <div className="glass rounded-2xl p-5 space-y-4 mb-6 animate-fade-up-delay">
        {[
          { label: 'Илгээгч', value: escrow.fromEmail },
          { label: 'Хүлээн авагч', value: escrow.toEmail },
          { label: 'Тайлбар', value: escrow.note || '—' },
          { label: 'Огноо', value: escrow.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || '—' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-white/40 text-sm">{row.label}</span>
            <span className="text-white text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Role indicator */}
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 mb-6 animate-fade-up-delay2">
        <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300">
          {isFrom ? 'И' : 'Х'}
        </div>
        <span className="text-white/60 text-sm">
          Та энэ гүйлгээний <strong className="text-white">{isFrom ? 'илгээгч' : 'хүлээн авагч'}</strong>
        </span>
      </div>

      {/* Messages */}
      {msg && (
        <div className="glass rounded-xl px-4 py-3 text-sm text-brand-300 border border-brand-500/20 mb-4 animate-fade-up">
          {msg}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 animate-fade-up-delay2">
        {/* Receiver: mark done (only when pending) */}
        {isTo && isPending && (
          <button
            onClick={markDone}
            disabled={actionLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <>✅ Ажлаа дуусгалаа</>
            )}
          </button>
        )}

        {/* Sender: approve (when done_requested) */}
        {isFrom && isDoneRequested && (
          <>
            <div className="glass rounded-xl px-4 py-3 border border-blue-500/20 bg-blue-500/5 text-blue-300 text-sm mb-2">
              🔔 Хүлээн авагч ажлаа дуусгасан гэж мэдэгдлээ. Та шалган зөвшөөрнө үү.
            </div>
            <button
              onClick={approveRelease}
              disabled={actionLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30"
            >
              {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>💸 Зөвшөөрч мөнгө шилжүүлэх</>
              )}
            </button>
          </>
        )}

        {/* Sender: cancel (when pending or done_requested) */}
        {isFrom && (isPending || isDoneRequested) && (
          <button
            onClick={cancelEscrow}
            disabled={actionLoading}
            className="w-full glass hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold py-3 rounded-xl transition-all border border-red-500/10 hover:border-red-500/30 text-sm"
          >
            Цуцлах
          </button>
        )}

        {(escrow.status === 'completed' || escrow.status === 'cancelled') && (
          <button
            onClick={() => navigate('/sanhuu')}
            className="w-full glass glass-hover font-semibold py-3 rounded-xl transition-all text-white/60 text-sm"
          >
            Буцах
          </button>
        )}
      </div>
    </div>
  );
}
