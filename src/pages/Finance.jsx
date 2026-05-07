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
    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTxns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
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
    const u1 = onSnapshot(query(collection(db, 'escrows'), where('fromUid', '==', user.uid)), merge);
    const u2 = onSnapshot(query(collection(db, 'escrows'), where('toUid',   '==', user.uid)), merge);
    return () => { u1(); u2(); };
  }, [user]);

  const income   = txns.filter(t => t.type === 'orlogo').reduce((s, t) => s + t.amount, 0);
  const expense  = txns.filter(t => t.type === 'zarlaga').reduce((s, t) => s + t.amount, 0);
  const escrowed = escrows.filter(e => e.status === 'pending' && e.fromUid === user?.uid).reduce((s, e) => s + e.amount, 0);

  const cards = [
    { label: 'Үлдэгдэл',       value: fmt(profile?.balance), icon: '💰', accent: 'border-l-amber-400 bg-amber-50' },
    { label: 'Орлого',          value: fmt(income),           icon: '📈', accent: 'border-l-sage-400 bg-sage-50'  },
    { label: 'Зарлага',         value: fmt(expense),          icon: '📉', accent: 'border-l-rose-400 bg-rose-50'  },
    { label: 'Барилттай мөнгө', value: fmt(escrowed),         icon: '🔒', accent: 'border-l-blue-300 bg-blue-50'  },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-ink-400 text-xs uppercase tracking-wider font-semibold mb-1">Санхүү</p>
          <h1 className="text-2xl font-display font-bold text-ink-900">Миний данс</h1>
        </div>
        <button onClick={() => navigate('/sanhuu/shiljuuleg')}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Шилжүүлэг
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-up-d1">
        {cards.map(c => (
          <div key={c.label} className={`card p-5 border-l-4 ${c.accent}`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-ink-400 text-xs font-semibold uppercase tracking-wider mb-1">{c.label}</div>
            <div className="text-ink-900 text-xl font-display font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Escrows */}
      {escrows.length > 0 && (
        <div className="mb-8 animate-fade-up-d2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-300 mb-3">Барилттай шилжүүлэгүүд</h2>
          <div className="space-y-2">
            {escrows.map(e => (
              <button key={e.id} onClick={() => navigate(`/sanhuu/escrow/${e.id}`)}
                className="card card-hover w-full p-4 flex items-center gap-4 text-left">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                  e.status === 'pending' ? 'bg-amber-100' :
                  e.status === 'completed' ? 'bg-sage-100' : 'bg-rose-100'
                }`}>
                  {e.status === 'pending' ? '🔒' : e.status === 'completed' ? '✅' : '❌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-ink-900 text-sm font-semibold truncate">
                    {e.fromUid === user?.uid ? `→ ${e.toEmail}` : `← ${e.fromEmail}`}
                  </div>
                  <div className="text-ink-400 text-xs mt-0.5">{e.note || 'Барилттай шилжүүлэг'}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-ink-900 font-bold text-sm">{fmt(e.amount)}</div>
                  <div className={`text-xs mt-0.5 ${
                    e.status === 'pending' ? 'text-amber-600' :
                    e.status === 'completed' ? 'text-sage-600' : 'text-rose-500'
                  }`}>
                    {e.status === 'pending' ? 'Хүлээгдэж буй' : e.status === 'completed' ? 'Дууссан' : 'Цуцлагдсан'}
                  </div>
                </div>
                <svg className="w-4 h-4 text-ink-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="animate-fade-up-d2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-300 mb-3">Гүйлгээний түүх</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : txns.length === 0 ? (
          <div className="card p-10 text-center text-ink-300">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">Гүйлгээний түүх хоосон байна</p>
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map(t => (
              <div key={t.id} className="card px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  t.type === 'orlogo' ? 'bg-sage-100 text-sage-600' : 'bg-rose-50 text-rose-500'
                }`}>
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
          </div>
        )}
      </div>
    </div>
  );
}
