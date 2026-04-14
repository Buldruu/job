import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/RatingStars';

const quickLinks = [
  { to:'/ajil',    label:'Ажил хайх',    desc:'Нийтлэгдсэн ажлын зарууд', icon:'💼', bg:'bg-blue-50',   border:'border-blue-100',   text:'text-blue-700'   },
  { to:'/ajiltan', label:'Ажилтан хайх', desc:'Мэргэжилтэн олох',          icon:'👥', bg:'bg-violet-50', border:'border-violet-100', text:'text-violet-700' },
  { to:'/premium', label:'Premium',        desc:'Апп-ын дэвшилтэт боломжууд', icon:'💎', bg:'bg-violet-50', border:'border-violet-100', text:'text-violet-700'},
  { to:'/surgalt', label:'Сургалт',       desc:'Мэргэжил дээшлүүлэх',      icon:'🎓', bg:'bg-amber-50',  border:'border-amber-100',  text:'text-amber-700'  },
  { to:'/mergejilten', label:'Мэргэшсэн ажилтан', desc:'Баталгаажсан мэргэжилтнүүд', icon:'🏅', bg:'bg-teal-50', border:'border-teal-100', text:'text-teal-700' },
];

const avgRating = (ratings=[]) => {
  if (!ratings.length) return 0;
  return ratings.reduce((s,r)=>s+r.stars,0)/ratings.length;
};

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  const displayName = profile?.ner
    ? `${profile.ovog||''} ${profile.ner}`.trim()
    : user?.email?.split('@')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Өглөөний мэнд' : hour < 17 ? 'Өдрийн мэнд' : 'Оройн мэнд';

  // Load featured posts from all collections
  useEffect(() => {
    const colls = ['jobs','workers','internships','courses'];
    const unsubs = [];
    const allFeatured = {};
    colls.forEach(col => {
      const q = query(
        collection(db, col),
        where('featured', '==', true),
        orderBy('featuredAt', 'desc'),
        limit(6)
      );
      const unsub = onSnapshot(q, snap => {
        allFeatured[col] = snap.docs.map(d=>({id:d.id, _col:col, ...d.data()}));
        const merged = Object.values(allFeatured).flat()
          .sort((a,b)=>(b.featuredAt?.seconds||0)-(a.featuredAt?.seconds||0))
          .slice(0,6);
        setFeatured(merged);
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach(u=>u());
  }, []);

  const getTitle = (item) => {
    if (item._col==='jobs') return item.ner?`${item.ovog||''} ${item.ner}`.trim():'Ажил хайгч';
    if (item._col==='workers') return item.alban_tushaal||'Ажлын зар';
    if (item._col==='internships') return item.alban_tushaal||'Дадлага';
    return item.ner||'Сургалт';
  };
  const getSub = (item) => item.baiguulgiin_ner||item.baiguulga_ner||item.chiglel||'';

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-gray-400 text-sm mb-1">{greeting},</p>
        <h1 className="text-3xl font-display font-bold text-gray-800">{displayName} 👋</h1>
      </div>

      {/* Menu cards */}
      <div className="animate-fade-up-delay mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Цэс</p>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map(link => (
            <button key={link.to} onClick={() => navigate(link.to)}
              className={`card card-hover rounded-2xl p-6 text-left border ${link.border} ${link.bg}`}>
              <div className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center text-2xl mb-4 border ${link.border}`}>
                {link.icon}
              </div>
              <div className={`font-display font-bold text-lg mb-1 ${link.text}`}>{link.label}</div>
              <div className="text-gray-400 text-sm">{link.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured posts */}
      {featured.length > 0 && (
        <div className="animate-fade-up-delay2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⭐</span>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Онцлох зарууд</p>
          </div>
          <div className="space-y-3">
            {featured.map(item => (
              <div key={`${item._col}-${item.id}`}
                className="card rounded-xl px-5 py-4 border border-amber-100 bg-amber-50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">
                  ⭐
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-amber-800 text-sm">{getTitle(item)}</div>
                  {getSub(item) && <div className="text-amber-600 text-xs mt-0.5">{getSub(item)}</div>}
                  <StarDisplay rating={avgRating(item.ratings)} count={(item.ratings||[]).length}/>
                </div>
                {item.tsalin && (
                  <span className="text-xs text-emerald-600 font-bold bg-white border border-emerald-100 px-2 py-1 rounded-lg flex-shrink-0">
                    {item.tsalin}₮
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
