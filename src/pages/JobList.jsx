import { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import {
  collection, addDoc, query, onSnapshot, orderBy,
  serverTimestamp, doc, getDoc, deleteDoc,
  updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import AddressInput from '../components/AddressInput';
import { StarDisplay, StarPicker } from '../components/RatingStars';

const chiglels = ['Бүгд', 'Боловсрол', 'Урлаг, хүмүүнлэг', 'Нийгмийн шинжлэх ухаан, мэдээлэл сэтгүүл зүй', 'Бизнес, удирдлага, эрхзүй', 'Байгалийн шинжлэх ухаан, математик, статистик', 'Мэдээлэл, харилцаа холбооны технологиуд', 'Инженерчлэл, үйлдвэрлэл, барилга байгууламж', 'Хөдөө аж ахуй, ой, загасны аж ахуй, мал эмнэлзүй', 'Эрүүл мэнд, нийгмийн хамгаалал', 'Үйлчилгээ'];

const COLORS = [
  {bg:'bg-blue-50',   border:'border-blue-100',   text:'text-blue-700',   avatar:'bg-blue-100 text-blue-600'},
  {bg:'bg-violet-50', border:'border-violet-100', text:'text-violet-700', avatar:'bg-violet-100 text-violet-600'},
  {bg:'bg-emerald-50',border:'border-emerald-100',text:'text-emerald-700',avatar:'bg-emerald-100 text-emerald-600'},
  {bg:'bg-amber-50',  border:'border-amber-100',  text:'text-amber-700',  avatar:'bg-amber-100 text-amber-600'},
  {bg:'bg-pink-50',   border:'border-pink-100',   text:'text-pink-700',   avatar:'bg-pink-100 text-pink-600'},
  {bg:'bg-teal-50',   border:'border-teal-100',   text:'text-teal-700',   avatar:'bg-teal-100 text-teal-600'},
];

const configs = {
  ajil: {
    title:'Ажил хайх', addLabel:'Зар нэмэх', addTitle:'Өөрийн мэдээлэл оруулах',
    collection:'jobs', cvUpload:true,
    fields:[
      {key:'ovog',      label:'Овог',              required:true},
      {key:'ner',       label:'Нэр',               required:true},
      {key:'chadvar',   label:'Чадвар',            required:false},
      {key:'turshlaga', label:'Туршлага',          required:false},
      {key:'tsalin',    label:'Хүссэн цалин (₮)',  required:false},
      {key:'chiglel',   label:'Чиглэл',            required:false},
      {key:'hayg',      label:'Хаяг',              required:false, isAddress:true},
      {key:'cv_text',   label:'CV / Намтар',       required:false, textarea:true},
      {key:'utas',      label:'Холбоо барих утас',  required:false},
      {key:'nemelt',    label:'Нэмэлт',            required:false, textarea:true},
    ],
    cardTitle:(d)=>d.ner?`${d.ovog||''} ${d.ner}`.trim():'Ажил хайгч',
    cardSub:(d)=>d.chiglel, salaryKey:'tsalin',
  },
  ajiltan: {
    title:'Ажилтан хайх', addLabel:'Зар нэмэх', addTitle:'Ажлын зар оруулах',
    collection:'workers',
    fields:[
      {key:'baiguulgiin_ner',   label:'Байгууллагын нэр',  required:true},
      {key:'alban_tushaal',     label:'Албан тушаал',      required:true},
      {key:'chadvar',           label:'Чадвар / Мэдлэг',   required:false},
      {key:'turshlaga',         label:'Туршлага',          required:false},
      {key:'tsalin',            label:'Цалин (₮)',         required:false},
      {key:'chiglel',           label:'Чиглэл',            required:false},
      {key:'hayg',              label:'Хаяг',              required:false, isAddress:true},
      {key:'ajilchinaas_huseh', label:'Ажилтнаас хүсэх',  required:false, textarea:true},
      {key:'utas',              label:'Холбоо барих утас',  required:false},
      {key:'nemelt',            label:'Нэмэлт',            required:false, textarea:true},
    ],
    cardTitle:(d)=>d.alban_tushaal||'Ажлын зар',
    cardSub:(d)=>d.baiguulgiin_ner, salaryKey:'tsalin',
  },
  dadlaga: {
    title:'Дадлага', addLabel:'Зар нэмэх', addTitle:'Дадлагын зар оруулах',
    collection:'internships',
    fields:[
      {key:'baiguulgiin_ner',   label:'Байгууллагын нэр', required:true},
      {key:'alban_tushaal',     label:'Дадлагын чиглэл',  required:true},
      {key:'chadvar',           label:'Чадвар',           required:false},
      {key:'turshlaga',         label:'Туршлага',         required:false},
      {key:'tsalin',            label:'Цалин (₮)',        required:false},
      {key:'chiglel',           label:'Чиглэл',           required:false},
      {key:'hayg',              label:'Хаяг',             required:false, isAddress:true},
      {key:'ajilchinaas_huseh', label:'Шаардлага',        required:false, textarea:true},
      {key:'utas',              label:'Холбоо барих утас', required:false},
      {key:'nemelt',            label:'Нэмэлт',           required:false, textarea:true},
    ],
    cardTitle:(d)=>d.alban_tushaal||'Дадлага',
    cardSub:(d)=>d.baiguulgiin_ner, salaryKey:'tsalin',
  },
  surgalt: {
    title:'Сургалт', addLabel:'Зар нэмэх', addTitle:'Сургалтын зар оруулах',
    collection:'courses',
    fields:[
      {key:'baiguulga_ner', label:'Байгууллага',   required:true},
      {key:'ner',           label:'Сургалтын нэр', required:true},
      {key:'une_hansh',     label:'Үнэ ханш (₮)',  required:false},
      {key:'hugatsaa',      label:'Хугацаа',       required:false},
      {key:'hayg',          label:'Хаяг / Линк',   required:false, isAddress:true},
      {key:'utas',          label:'Холбоо барих утас', required:false},
      {key:'nemelt',        label:'Дэлгэрэнгүй',   required:false, textarea:true},
    ],
    cardTitle:(d)=>d.ner||'Сургалт',
    cardSub:(d)=>d.baiguulga_ner, salaryKey:'une_hansh',
  },
};

// Compute average rating
const avgRating = (ratings=[]) => {
  if (!ratings.length) return 0;
  return ratings.reduce((s,r)=>s+r.stars, 0) / ratings.length;
};

// Premium limits per plan
const PREMIUM_LIMITS = {
  free:     { posts: 3,  featured: 0  },
  basic:    { posts: 10, featured: 5  },
  pro:      { posts: 30, featured: 20 },
  business: { posts: 999,featured: 999},
};

const isPremiumActive = (profile) => {
  if (!profile?.premiumPlan || profile.premiumPlan === 'free') return false;
  const until = profile.premiumUntil?.toDate?.() || profile.premiumUntil;
  if (!until) return false;
  return new Date(until) > new Date();
};

const getPlan = (profile) => {
  if (!isPremiumActive(profile)) return 'free';
  return profile.premiumPlan || 'free';
};

export default function JobList({ type }) {
  const cfg = configs[type];
  const { user, profile, refreshProfile } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [filterChiglel, setFilterChiglel] = useState('Бүгд');
  const [search, setSearch] = useState('');       // typed value
  const [activeSearch, setActiveSearch] = useState(''); // confirmed search
  const [form, setForm] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const [cvParsing, setCvParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [featuring, setFeaturing] = useState(false);
  const [myRating, setMyRating] = useState(0);       // confirmed rating
  const [pendingRating, setPendingRating] = useState(0); // hover/pick before confirm
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratedItemId, setRatedItemId] = useState(null); // track which item we rated
  const [editingRating, setEditingRating] = useState(false); // unlock to change
  const [premiumAds, setPremiumAds] = useState([]);
  const [premiumFilter, setPremiumFilter] = useState(null); // 'rated'|'featured'|'premium'
  const [filterSalaryMin, setFilterSalaryMin] = useState('');

  // Load business ads
  useEffect(() => {
    const { query: aq, collection: ac, where: aw, onSnapshot: ao } = {
      query, collection: collection, where: null, onSnapshot
    };
    // Simple: watch all users, filter client-side
    const unsubAds = onSnapshot(query(collection(db,'users')), snap => {
      const now = new Date();
      const ads = snap.docs
        .map(d => ({id:d.id,...d.data()}))
        .filter(u => {
          if (u.premiumPlan !== 'business') return false;
          const until = u.premiumUntil?.toDate?.() || (u.premiumUntil && new Date(u.premiumUntil));
          return until && until > now && u.ad?.title;
        });
      setPremiumAds(ads);
    });
    return unsubAds;
  }, []);

  useEffect(() => {
    setItems([]); setLoading(true);
    const q = query(collection(db, cfg.collection), orderBy('createdAt','desc'));
    return onSnapshot(q, async snap => {
      // Load all items, then mark premium posters
      const rawItems = snap.docs.map(d=>({id:d.id,...d.data()}));
      // Get unique poster UIDs
      const uids = [...new Set(rawItems.map(i=>i.uid).filter(Boolean))];
      // Fetch poster profiles to check premium
      const profileMap = {};
      await Promise.all(uids.map(async uid => {
        try {
          const s = await getDoc(doc(db,'users',uid));
          if (s.exists()) profileMap[uid] = s.data();
        } catch(e) {}
      }));
      setItems(rawItems.map(item => ({
        ...item,
        _isPremiumPoster: profileMap[item.uid] ? isPremiumActive(profileMap[item.uid]) : false,
      })));
      setLoading(false);
    });
  }, [type]);

  // Load my existing rating only when opening a NEW item
  useEffect(() => {
    if (!selected || !user) return;
    const existing = (selected.ratings||[]).find(r=>r.uid===user.uid);
    setMyRating(existing?.stars || 0);
    setPendingRating(existing?.stars || 0);
    setEditingRating(false);
  }, [selected?.id, user]);

  // CV file → extract text via mammoth
  const handleCvFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      // PDF: just store filename, no text extraction
      return;
    }
    setCvParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (text) setForm(p => ({ ...p, cv_text: text }));
    } catch(err) {
      console.error('mammoth error', err);
    }
    setCvParsing(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    // Check post limit
    const myPosts = items.filter(i => i.uid === user?.uid);
    const plan = getPlan(profile);
    const limit = PREMIUM_LIMITS[plan].posts;
    if (myPosts.length >= limit) {
      alert(plan === 'free'
        ? `Үнэгүй багцад ${PREMIUM_LIMITS.free.posts} зар нэмэх боломжтой.\nИлүү зар нэмэхийн тулд Premium авна уу.`
        : `${plan} багцад ${limit} зар нэмэх боломжтой.`);
      return;
    }
    setSaving(true);
    try {
      // 1. Firestore-d shuud hagalna
      const docRef = await addDoc(collection(db, cfg.collection), {
        ...form,
        ratings: [],
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      // 2. Modal haaj, form tsevrlelne - heregleged huleekhgui
      setForm({}); setCvFile(null); setShowForm(false); setSaving(false);
      // 3. CV bail ard ni upload hiine (background)
      if (cvFile) {
        const { updateDoc } = await import('firebase/firestore');
        const storageRef = ref(storage, `cvs/${user.uid}/${Date.now()}_${cvFile.name}`);
        await uploadBytes(storageRef, cvFile);
        const cv_url = await getDownloadURL(storageRef);
        await updateDoc(docRef, { cv_url, cv_name: cvFile.name });
      }
    } catch(err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleFeature = async () => {
    if (!selected || featuring) return;
    const FEATURE_COST = 5000;
    if ((profile?.balance || 0) < FEATURE_COST) {
      alert('Үлдэгдэл хүрэлцэхгүй байна. 5,000₮ шаардлагатай.');
      return;
    }
    if (!window.confirm('Зарыг онцлоход 5,000₮ зарцуулагдана. Үргэлжлүүлэх үү?')) return;
    setFeaturing(true);
    try {
      const { runTransaction, doc: firestoreDoc, increment, addDoc: firestoreAdd, collection: firestoreCol, serverTimestamp: sts } = await import('firebase/firestore');
      await runTransaction(db, async (tx) => {
        const userRef = firestoreDoc(db, 'users', user.uid);
        const snap = await tx.get(userRef);
        if ((snap.data().balance || 0) < FEATURE_COST) throw new Error('Үлдэгдэл хүрэлцэхгүй');
        tx.update(userRef, { balance: increment(-FEATURE_COST) });
        tx.update(firestoreDoc(db, cfg.collection, selected.id), {
          featured: true,
          featuredAt: sts(),
        });
      });
      await firestoreAdd(firestoreCol(db, 'transactions'), {
        uid: user.uid, type: 'zarlaga', amount: FEATURE_COST,
        note: 'Онцлох зар', createdAt: sts(),
      });
      await refreshProfile();
      setSelected(s => ({ ...s, featured: true }));
      alert('Зар онцлогдлоо! ⭐');
    } catch(err) {
      alert(err.message || 'Алдаа гарлаа');
    }
    setFeaturing(false);
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm('Энэ зарыг устгах уу?')) return;
    setDeleting(true);
    await deleteDoc(doc(db, cfg.collection, selected.id));
    setSelected(null); setSelectedOwner(null);
    setDeleting(false);
  };

  const submitRating = async (stars) => {
    if (!selected || !user || ratingSubmitting) return;
    setRatingSubmitting(true);
    const itemRef = doc(db, cfg.collection, selected.id);
    // Remove old rating then add new
    const oldRating = (selected.ratings||[]).find(r=>r.uid===user.uid);
    if (oldRating) await updateDoc(itemRef, { ratings: arrayRemove(oldRating) });
    const newRating = { uid: user.uid, stars, at: Date.now() };
    await updateDoc(itemRef, { ratings: arrayUnion(newRating) });
    setSelected(s => {
      const filtered = (s.ratings||[]).filter(r=>r.uid!==user.uid);
      return { ...s, ratings: [...filtered, newRating] };
    });
    setMyRating(stars);
    setEditingRating(false);
    setPendingRating(stars);
    setRatedItemId(selected.id);
    setRatingSubmitting(false);
  };

  const openDetail = async (item) => {
    setSelected(item); setSelectedOwner(null);
    if (item.uid) {
      const snap = await getDoc(doc(db, 'users', item.uid));
      if (snap.exists()) setSelectedOwner({id:item.uid,...snap.data()});
    }
  };

  const doSearch = () => setActiveSearch(search.trim());

  const userPlan = getPlan(profile);
  const planLimits = PREMIUM_LIMITS[userPlan];

  const filtered = items
    .filter(i => {
      const mc = filterChiglel === 'Бүгд' || i.chiglel === filterChiglel;
      const s  = activeSearch.toLowerCase();
      const textMatch = mc && (!s || Object.values(i).some(v => String(v).toLowerCase().includes(s)));
      if (!textMatch) return false;
      // Premium filters
      if (premiumFilter === 'rated' && !(i.ratings?.length > 0)) return false;
      if (premiumFilter === 'featured' && !i.featured) return false;
      if (premiumFilter === 'premium' && !i._isPremiumPoster) return false;
      if (filterSalaryMin) {
        const salNum = parseFloat(String(i[cfg.salaryKey]||'').replace(/[^0-9.]/g,''));
        if (!salNum || salNum < parseFloat(filterSalaryMin)) return false;
      }
      return true;
    })
    // Sort: premium poster's posts → featured → newest
    .sort((a, b) => {
      const aP = a._isPremiumPoster ? 1 : 0;
      const bP = b._isPremiumPoster ? 1 : 0;
      if (bP !== aP) return bP - aP;
      const aF = a.featured ? 1 : 0;
      const bF = b.featured ? 1 : 0;
      if (bF !== aF) return bF - aF;
      return (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0);
    });

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">HaGA</p>
          <h1 className="text-2xl font-display font-bold text-gray-800">{cfg.title}</h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-btn transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          {cfg.addLabel}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-3 animate-fade-up-delay">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Хайх... (Enter дарна уу)"
            className="input-base pl-9 pr-4"
          />
        </div>
        <button
          onClick={doSearch}
          className="flex-shrink-0 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-btn transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Хайх
        </button>
        {cfg.fields.some(f=>f.key==='chiglel') && (
          <select value={filterChiglel} onChange={e => { setFilterChiglel(e.target.value); setActiveSearch(''); setSearch(''); }} className="input-base w-auto">
            {chiglels.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Premium advanced filters */}
      {isPremiumActive(profile) && (
        <div className="flex gap-2 mb-4 flex-wrap animate-fade-up-delay">
          <span className="text-xs text-violet-500 font-bold flex items-center gap-1 mr-1">
            💎 Premium хайлт:
          </span>
          {[
            { key:'rated',    label:'⭐ Үнэлэгдсэн' },
            { key:'featured', label:'🔥 Онцлох' },
            { key:'premium',  label:'💎 Premium' },
          ].map(f => (
            <button key={f.key}
              onClick={() => setPremiumFilter(p => p===f.key ? null : f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                premiumFilter===f.key
                  ? 'bg-violet-500 border-violet-500 text-white'
                  : 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100'
              }`}>
              {f.label}
            </button>
          ))}
          {(premiumFilter || filterSalaryMin) && (
            <button onClick={() => { setPremiumFilter(null); setFilterSalaryMin(''); }}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition">
              ✕ Арилгах
            </button>
          )}
          {cfg.salaryKey && (
            <input type="number" value={filterSalaryMin}
              onChange={e=>setFilterSalaryMin(e.target.value)}
              placeholder="Доод цалин ₮"
              className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 w-36 focus:outline-none focus:border-violet-400"/>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center text-gray-300 animate-fade-up-delay">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">
            {activeSearch ? `"${activeSearch}" хайлтад тохирох зар байхгүй` : 'Зар байхгүй байна'}
          </p>
          {activeSearch && (
            <button onClick={() => { setSearch(''); setActiveSearch(''); }}
              className="mt-3 text-xs text-brand-500 hover:underline">
              Хайлтыг арилгах
            </button>
          )}
        </div>
      ) : (
        <>
        {/* Premium Business ads */}
        {premiumAds.length > 0 && (
          <div className="mb-4 space-y-2">
            {premiumAds.slice(0,2).map(ad => (
              <div key={ad.id} className="card rounded-xl px-5 py-3 border border-amber-100 bg-amber-50 flex items-center gap-3">
                <span className="text-xs text-amber-600 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">📢 Сурталчилгаа</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-amber-800 text-sm truncate">{ad.ad.title}</div>
                  {ad.ad.description && <div className="text-amber-600 text-xs truncate">{ad.ad.description}</div>}
                </div>
                {ad.ad.contact && <div className="text-xs text-amber-700 font-medium flex-shrink-0">{ad.ad.contact}</div>}
                {ad.ad.link && <a href={ad.ad.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="text-xs text-brand-500 font-bold hover:text-brand-700 flex-shrink-0 ml-2">→ Харах</a>}
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-delay">
          {filtered.map((item, idx) => {
            const c = COLORS[idx % COLORS.length];
            const avg = avgRating(item.ratings);
            const cnt = (item.ratings||[]).length;
            return (
              <button key={item.id} onClick={()=>openDetail(item)}
                className={`card card-hover rounded-2xl p-5 text-left border ${c.border} ${c.bg}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${c.avatar} flex-shrink-0`}>
                    {(cfg.cardTitle(item)[0]||'?').toUpperCase()}
                  </div>
                  {item[cfg.salaryKey] && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg whitespace-nowrap">
                      {item[cfg.salaryKey]}₮
                    </span>
                  )}
                </div>
                <div className={`font-display font-bold text-base mb-1 ${c.text}`}>{cfg.cardTitle(item)}</div>
                {cfg.cardSub(item) && <div className="text-gray-500 text-sm">{cfg.cardSub(item)}</div>}
                <div className="mt-2">
                  <StarDisplay rating={avg} count={cnt}/>
                </div>
                {item.chiglel && (
                  <span className="inline-block mt-2 text-xs font-medium text-gray-500 bg-white border border-surf-200 px-2.5 py-1 rounded-full">
                    {item.chiglel}
                  </span>
                )}
                {item.hayg && <div className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  <span className="truncate">{item.hayg}</span>
                </div>}
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {item.featured && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">⭐ Онцлох</span>}
                  {item._isPremiumPoster && <span className="text-xs text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-medium">💎 Premium</span>}
                  {item.uid===user?.uid && <span className="text-xs text-brand-500 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full font-medium">● Миний зар</span>}
                </div>
                <div className="text-gray-300 text-xs mt-2">{item.createdAt?.toDate?.()?.toLocaleDateString('mn-MN')||''}</div>
              </button>
            );
          })}
        </div>
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <Modal onClose={()=>{setSelected(null);setSelectedOwner(null);}}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-800">{cfg.cardTitle(selected)}</h2>
              {cfg.cardSub(selected) && <p className="text-gray-400 text-sm mt-0.5">{cfg.cardSub(selected)}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {selected.uid===user?.uid && !selected.featured && (
                <button onClick={handleFeature} disabled={featuring}
                  className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                  {featuring
                    ? <div className="w-3 h-3 border border-amber-300 border-t-transparent rounded-full animate-spin"/>
                    : '⭐'}
                  Онцлох (5,000₮)
                </button>
              )}
              {selected.uid===user?.uid && (
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                  {deleting
                    ? <div className="w-3 h-3 border border-red-300 border-t-transparent rounded-full animate-spin"/>
                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>}
                  Устгах
                </button>
              )}
              <button onClick={()=>{setSelected(null);setSelectedOwner(null);}} className="text-gray-300 hover:text-gray-500 p-1 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Нийт үнэлгээ</div>
                <StarDisplay rating={avgRating(selected.ratings)} count={(selected.ratings||[]).length} size="lg"/>
              </div>
              {selected.uid !== user?.uid && (
                <div>
                  {myRating > 0 && !editingRating ? (
                    // LOCKED — showing confirmed rating
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Таны үнэлгээ</div>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={myRating} size="lg"/>
                        <button
                          onClick={e => { e.stopPropagation(); setEditingRating(true); setPendingRating(myRating); }}
                          className="text-xs text-gray-400 hover:text-brand-500 transition underline ml-1"
                        >
                          өөрчлөх
                        </button>
                      </div>
                    </div>
                  ) : (
                    // PICKER — choose stars then confirm
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                        {editingRating ? 'Үнэлгээ өөрчлөх' : 'Та үнэлэх'}
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <StarPicker value={pendingRating} onChange={v => setPendingRating(v)}/>
                        {pendingRating > 0 && (
                          <button
                            disabled={ratingSubmitting}
                            onClick={e => { e.stopPropagation(); submitRating(pendingRating); }}
                            className="ml-1 text-xs bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg transition flex items-center gap-1"
                          >
                            {ratingSubmitting
                              ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"/>
                              : '✓ Үнэлэх'}
                          </button>
                        )}
                        {editingRating && (
                          <button
                            onClick={e => { e.stopPropagation(); setEditingRating(false); setPendingRating(myRating); }}
                            className="text-xs text-gray-400 hover:text-gray-600 transition underline"
                          >
                            болих
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
            {cfg.fields.map(f=>{
              const val = selected[f.key];
              if (!val) return null;
              return (
                <div key={f.key} className="bg-surf-50 rounded-xl px-4 py-3">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{val}</div>
                </div>
              );
            })}
          </div>

          {/* Poster profile */}
          {selectedOwner && (
            <div className="mt-4 pt-4 border-t border-surf-100">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Зар оруулагч</p>
              <div className="bg-surf-50 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {selectedOwner.photoURL
                    ? <img src={selectedOwner.photoURL} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-sm font-bold text-brand-600">
                        {(selectedOwner.ner||'?')[0].toUpperCase()}
                      </span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800 font-semibold text-sm">
                    {selectedOwner.ner?`${selectedOwner.ovog||''} ${selectedOwner.ner}`.trim():'—'}
                  </div>
                  {/* email hidden for privacy */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedOwner.chiglel && <span className="text-xs bg-brand-50 border border-brand-100 text-brand-600 px-2 py-0.5 rounded-full">{selectedOwner.chiglel}</span>}
                    {selectedOwner.turshlaga && <span className="text-xs bg-surf-100 border border-surf-200 text-gray-500 px-2 py-0.5 rounded-full">{selectedOwner.turshlaga}</span>}
                    {selectedOwner.tsalin && <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">{selectedOwner.tsalin}₮</span>}
                  </div>
                  {selectedOwner.chadvar && <div className="mt-1.5 text-xs text-gray-500">{selectedOwner.chadvar}</div>}
                  {selected._isPremiumPoster && (
                    <span className="inline-block mt-1.5 text-xs text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-medium">💎 Premium гишүүн</span>
                  )}
                  {selected.utas && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-brand-600 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {selected.utas}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Add form modal */}
      {showForm && (
        <Modal onClose={()=>{setShowForm(false);setForm({});setCvFile(null);}}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-bold text-gray-800">{cfg.addTitle}</h2>
            <button onClick={()=>{setShowForm(false);setForm({});setCvFile(null);}} className="text-gray-300 hover:text-gray-500 p-1 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {cfg.fields.map(f=>(
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {f.label}{f.required&&<span className="text-red-400 ml-1">*</span>}
                </label>
                {f.isAddress ? (
                  <AddressInput value={form[f.key]||''} onChange={v=>setForm(p=>({...p,[f.key]:v}))}/>
                ) : f.textarea ? (
                  <textarea value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    required={f.required} rows={3} className="input-base resize-none"/>
                ) : f.key==='chiglel' ? (
                  <select value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="input-base">
                    <option value="">Сонгоно уу</option>
                    {chiglels.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    required={f.required} className="input-base"/>
                )}
              </div>
            ))}

            {/* CV upload — auto-extracts text */}
            {cfg.cvUpload && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  CV файл (.docx — текст автоматаар орно)
                </label>
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  cvFile ? 'border-brand-300 bg-brand-50' : 'border-surf-200 hover:border-brand-300 bg-surf-50'
                }`}>
                  {cvParsing ? (
                    <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                  ) : (
                    <svg className="w-5 h-5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  )}
                  <span className="text-sm text-gray-500 truncate">
                    {cvParsing ? 'Уншиж байна...' : cvFile ? cvFile.name : 'Файл сонгох...'}
                  </span>
                  <input type="file" accept=".docx,.doc" className="hidden" onChange={handleCvFile}/>
                </label>
                {cvFile && form.cv_text && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    Текст автоматаар CV талбарт орлоо
                  </p>
                )}
              </div>
            )}

            <button type="submit" disabled={saving||cvParsing}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-btn flex items-center justify-center gap-2">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Хадгалах'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={onClose}/>
      <div
        className="relative bg-white rounded-2xl shadow-card-hover p-6 w-full max-w-lg z-10 animate-fade-up border border-surf-200"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
