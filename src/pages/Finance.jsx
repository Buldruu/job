import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => Number(n || 0).toLocaleString('mn-MN') + '₮';

export default function Finance() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setTxns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Escrow as sender or receiver
    const q1 = query(collection(db, 'escrows'), where('fromUid', '==', user.uid));
    const q2 = query(collection(db, 'escrows'), where('toUid', '==', user.uid));
    const list = {};
    const merge = (snap) => {
      snap.docs.forEach(d => list[d.id] = { id: d.id, ...d.data() });
      setEscrows(Object.values(list));
    };
    const u1 = onSnapshot(q1, merge);
    const u2 = onSnapshot(q2, merge);
    return () => { u1(); u2(); };
  }, [user]);

  const balance = profile?.balance || 0;
  const income = txns.filter(t => t.type === 'orlogo').reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter(t => t.type === 'zarlaga').reduce((s, t) => s + t.amount, 0);
  const escrowed = escrows.filter(e => e.status === 'pending' && e.fromUid === user?.uid)
    .reduce((s, e) => s + e.amount, 0);

  const cards = [
    { label: 'Үлдэгдэл', value: fmt(balance), color: 'from-brand-500/30 to-brand-700/30', border: 'border-brand-500/30', icon: '💰' },
    { label: 'Орлого', value: fmt(income), color: 'from-green-500/20 to-green-700/20', border: 'border-green-500/20', icon: '📈' },
    { label: 'Зарлага', value: fmt(expense), color: 'from-red-500/20 to-red-700/20', border: 'border-red-500/20', icon: '📉' },
    { label: 'Барилттай мөнгө', value: fmt(escrowed), color: 'from-amber-500/20 to-amber-700/20', border: 'border-amber-500/20', icon: '🔒' },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Санхүү</p>
          <h1 className="text-2xl font-display font-bold text-white">Миний данс</h1>
        </div>
        <button
          onClick={() => navigate('/sanhuu/shiljuuleg')}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Шилжүүлэг
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-up-delay">
        {cards.map(c => (
          <div key={c.label} className={`glass rounded-2xl p-5 bg-gradient-to-br ${c.color} border ${c.border}`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{c.label}</div>
            <div className="text-white text-xl font-display font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Escrow list */}
      {escrows.length > 0 && (
        <div className="mb-8 animate-fade-up-delay2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Барилттай шилжүүлэгүүд</h2>
          <div className="space-y-3">
            {escrows.map(e => (
              <button
                key={e.id}
                onClick={() => navigate(`/sanhuu/escrow/${e.id}`)}
                className="glass glass-hover rounded-xl p-4 w-full text-left flex items-center gap-4 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  e.status === 'pending' ? 'bg-amber-500/20' :
                  e.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {e.status === 'pending' ? '🔒' : e.status === 'completed' ? '✅' : '❌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">
                    {e.fromUid === user?.uid ? `→ ${e.toEmail || e.toUid}` : `← ${e.fromEmail || e.fromUid}`}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">{e.note || 'Барилттай шилжүүлэг'}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold">{fmt(e.amount)}</div>
                  <div className={`text-xs mt-0.5 ${
                    e.status === 'pending' ? 'text-amber-400' :
                    e.status === 'completed' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {e.status === 'pending' ? 'Хүлээгдэж буй' :
                     e.status === 'completed' ? 'Дууссан' : 'Цуцлагдсан'}
                  </div>
                </div>
                <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="animate-fade-up-delay2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Гүйлгээний түүх</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : txns.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-white/30">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">Гүйлгээний түүх хоосон байна</p>
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map(t => (
              <div key={t.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  t.type === 'orlogo' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {t.type === 'orlogo' ? '↓' : '↑'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{t.note || (t.type === 'orlogo' ? 'Орлого' : 'Зарлага')}</div>
                  <div className="text-white/30 text-xs">
                    {t.createdAt?.toDate?.()?.toLocaleDateString('mn-MN') || '—'}
                  </div>
                </div>
                <div className={`font-bold text-sm ${t.type === 'orlogo' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.type === 'orlogo' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
