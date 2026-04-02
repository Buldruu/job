import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StarDisplay } from '../components/RatingStars';

const chiglels = ['IT / Технологи','Санхүү','Маркетинг','Инженер','Эрүүл мэнд','Боловсрол','Хуулийн','Дизайн','Бусад'];
const DEGREES  = ['Мастер','Доктор','Мэргэжлийн үнэмлэх'];
const fmt = (n) => Number(n||0).toLocaleString('mn-MN') + '₮';
const avgRating = (ratings=[]) => {
  if (!ratings.length) return 0;
  return ratings.reduce((s,r)=>s+r.stars,0)/ratings.length;
};

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [tab, setTab] = useState('medeelel');
  const [form, setForm] = useState({
    ovog:'', ner:'', chadvar:'', turshlaga:'',
    hayg:'', chiglel:'', tsalin:'', cv:'', nemelt:'',
    zэрэг:'', surgaltin_gazar:'',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Finance
  const [txns, setTxns] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);

  // My posts
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (profile) setForm({
      ovog:           profile.ovog           || '',
      ner:            profile.ner            || '',
      chadvar:        profile.chadvar        || '',
      turshlaga:      profile.turshlaga      || '',
      hayg:           profile.hayg           || '',
      chiglel:        profile.chiglel        || '',
      tsalin:         profile.tsalin         || '',
      cv:             profile.cv             || '',
      nemelt:         profile.nemelt         || '',
      zэрэг:          profile.zэрэг          || '',
      surgaltin_gazar:profile.surgaltin_gazar|| '',
    });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db,'transactions'), where('uid','==',user.uid), orderBy('createdAt','desc'));
    return onSnapshot(q, snap => {
      setTxns(snap.docs.map(d=>({id:d.id,...d.data()})));
      setTxnLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const list = {};
    const merge = (snap) => {
      snap.docs.forEach(d=>list[d.id]={id:d.id,...d.data()});
      setEscrows(Object.values(list));
    };
    const u1 = onSnapshot(query(collection(db,'escrows'),where('fromUid','==',user.uid)),merge);
    const u2 = onSnapshot(query(collection(db,'escrows'),where('toUid','==',user.uid)),merge);
    return ()=>{u1();u2();};
  }, [user]);

  // Load my posts - simple query without orderBy to avoid index requirement
  useEffect(() => {
    if (!user) return;
    const colls = ['jobs','workers','internships','courses'];
    const allPosts = {};
    const unsubs = [];
    let loaded = 0;
    colls.forEach(col => {
      // where only - no orderBy to avoid needing composite index
      const q = query(collection(db,col), where('uid','==',user.uid));
      const unsub = onSnapshot(q, snap => {
        allPosts[col] = snap.docs.map(d=>({id:d.id,_col:col,...d.data()}));
        loaded++;
        if (loaded >= colls.length) {
          const merged = Object.values(allPosts).flat()
            .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
          setMyPosts(merged);
          setPostsLoading(false);
        }
      });
      unsubs.push(unsub);
    });
    return ()=>unsubs.forEach(u=>u());
  }, [user]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db,'users',user.uid), { photoURL: url });
      await refreshProfile();
    } catch(err) { console.error(err); }
    setPhotoUploading(false);
    e.target.value='';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      const hasDegree = !!form.zэрэг;
      await updateDoc(doc(db,'users',user.uid), {
        ...form,
        zovshoorol: hasDegree,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch(err) { console.error(err); }
    setSaving(false);
  };

  const displayName = form.ner ? `${form.ovog} ${form.ner}`.trim() : user?.email?.split('@')[0]||'';
  const photoURL    = profile?.photoURL||null;
  const initial     = displayName[0]?.toUpperCase()||'?';

  const income   = txns.filter(t=>t.type==='orlogo').reduce((s,t)=>s+t.amount,0);
  const expense  = txns.filter(t=>t.type==='zarlaga').reduce((s,t)=>s+t.amount,0);
  const escrowed = escrows.filter(e=>e.status==='pending'&&e.fromUid===user?.uid).reduce((s,e)=>s+e.amount,0);

  const getPostTitle = (item) => {
    if (item._col==='jobs') return item.ner?`${item.ovog||''} ${item.ner}`.trim():'Ажил хайгч';
    if (item._col==='workers') return item.alban_tushaal||'Ажлын зар';
    if (item._col==='internships') return item.alban_tushaal||'Дадлага';
    return item.ner||'Сургалт';
  };
  const colLabel = {jobs:'Ажил хайх', workers:'Ажилтан хайх', internships:'Дадлага', courses:'Сургалт'};

  return (
    <div className="p-8 max-w-2xl">
      {/* Avatar + name */}
      <div className="flex items-center gap-5 mb-8 animate-fade-up">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center border-2 border-surf-200">
            {photoURL
              ? <img src={photoURL} alt="avatar" className="w-full h-full object-cover"/>
              : <span className="text-3xl font-display font-bold text-brand-600">{initial}</span>}
          </div>
          <button type="button" onClick={()=>fileRef.current?.click()} disabled={photoUploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center shadow-btn transition-all disabled:opacity-60"
            title="Зураг солих">
            {photoUploading
              ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-gray-800 truncate">{displayName||'—'}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {form.chiglel && (
              <span className="text-xs text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full font-medium">
                {form.chiglel}
              </span>
            )}
            {form.zэрэг && (
              <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full font-medium">
                🏅 {form.zэрэг}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surf-100 rounded-xl p-1 mb-7 animate-fade-up-delay overflow-x-auto">
        {[
          {key:'medeelel', label:'Мэдээлэл',   icon:'👤'},
          {key:'ajlууд',   label:'Миний зарууд',icon:'📋'},
          {key:'sanhuu',   label:'Санхүү',      icon:'💳'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              tab===t.key
                ? 'bg-white text-brand-600 shadow-sm border border-surf-200'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══ МЭДЭЭЛЭЛ ══ */}
      {tab==='medeelel' && (
        <form onSubmit={handleSave} className="space-y-5 animate-fade-up">
          <div className="card rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Үндсэн мэдээлэл</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Овог"  value={form.ovog}  onChange={v=>set('ovog',v)}  placeholder="Батбаяр"/>
              <Field label="Нэр"   value={form.ner}   onChange={v=>set('ner',v)}   placeholder="Болд"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Чадвар"   value={form.chadvar}   onChange={v=>set('chadvar',v)}   placeholder="React, Python..."/>
              <Field label="Туршлага" value={form.turshlaga} onChange={v=>set('turshlaga',v)} placeholder="3 жил"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Чиглэл</label>
                <select value={form.chiglel} onChange={e=>set('chiglel',e.target.value)} className="input-base">
                  <option value="">Сонгоно уу</option>
                  {chiglels.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Хүссэн цалин (₮)" value={form.tsalin} onChange={v=>set('tsalin',v)} placeholder="1,500,000"/>
            </div>
          </div>

          {/* Мэргэжлийн зэрэг */}
          <div className="card rounded-2xl p-5 space-y-4 border border-teal-100 bg-teal-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏅</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-teal-700">Мэргэжлийн зэрэг</h3>
            </div>
            <p className="text-xs text-teal-600">Зэрэг оруулсан тохиолдолд "Мэргэшсэн ажилтан" хэсэгт харагдах болно</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Зэрэг / Үнэмлэх</label>
                <select value={form.zэрэг} onChange={e=>set('zэрэг',e.target.value)} className="input-base">
                  <option value="">Сонгоно уу</option>
                  {DEGREES.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <Field label="Сургалтын газар" value={form.surgaltin_gazar} onChange={v=>set('surgaltin_gazar',v)} placeholder="МУИС, МС..."/>
            </div>
          </div>

          <div className="card rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Дэлгэрэнгүй</h3>
            <TextArea label="Хаяг"        value={form.hayg}   onChange={v=>set('hayg',v)}   placeholder="Улаанбаатар, ..." rows={2}/>
            <TextArea label="CV / Намтар" value={form.cv}     onChange={v=>set('cv',v)}     placeholder="Товч намтар, туршлага..." rows={4}/>
            <TextArea label="Нэмэлт"      value={form.nemelt} onChange={v=>set('nemelt',v)} placeholder="Бусад мэдээлэл..." rows={3}/>
          </div>

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-600 text-sm">
              ✅ Мэдээлэл хадгалагдлаа
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-btn flex items-center justify-center gap-2">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Хадгалах'}
          </button>
        </form>
      )}

      {/* ══ МИНИЙ ЗАРУУД ══ */}
      {tab==='ajlууд' && (
        <div className="space-y-3 animate-fade-up">
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : myPosts.length===0 ? (
            <div className="card rounded-2xl p-10 text-center text-gray-300">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">Зар байхгүй байна</p>
            </div>
          ) : myPosts.map(item => (
            <div key={`${item._col}-${item.id}`}
              className={`card rounded-xl px-5 py-4 flex items-start gap-4 ${item.featured ? 'border-amber-200 bg-amber-50' : ''}`}>
              {item.featured && <span className="text-lg flex-shrink-0">⭐</span>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-gray-800 font-semibold text-sm">{getPostTitle(item)}</span>
                  <span className="text-xs bg-surf-100 border border-surf-200 text-gray-500 px-2 py-0.5 rounded-full">
                    {colLabel[item._col]}
                  </span>
                  {item.featured && (
                    <span className="text-xs bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Онцлох
                    </span>
                  )}
                </div>
                <StarDisplay rating={avgRating(item.ratings)} count={(item.ratings||[]).length}/>
                <div className="text-gray-400 text-xs mt-1">
                  {item.createdAt?.toDate?.()?.toLocaleDateString('mn-MN')||''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ САНХҮҮ ══ */}
      {tab==='sanhuu' && (
        <div className="space-y-5 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'Үлдэгдэл',       value:fmt(profile?.balance), bg:'bg-brand-50',   border:'border-brand-100', text:'text-brand-700',   icon:'💰'},
              {label:'Орлого',          value:fmt(income),           bg:'bg-emerald-50', border:'border-emerald-100',text:'text-emerald-700', icon:'📈'},
              {label:'Зарлага',         value:fmt(expense),          bg:'bg-red-50',     border:'border-red-100',    text:'text-red-700',     icon:'📉'},
              {label:'Барилттай мөнгө', value:fmt(escrowed),         bg:'bg-amber-50',   border:'border-amber-100',  text:'text-amber-700',   icon:'🔒'},
            ].map(c=>(
              <div key={c.label} className={`card rounded-2xl p-4 border ${c.border} ${c.bg}`}>
                <div className="text-xl mb-2">{c.icon}</div>
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{c.label}</div>
                <div className={`font-display font-bold text-lg ${c.text}`}>{c.value}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={()=>navigate('/sanhuu/shiljuuleg')}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-btn">
              💸 Шилжүүлэг хийх
            </button>
            <button onClick={()=>navigate('/sanhuu')}
              className="flex-1 card hover:shadow-card-hover text-gray-600 font-semibold py-3 rounded-xl text-sm transition-all">
              📋 Бүгдийг харах
            </button>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Сүүлийн 10 гүйлгээ</h3>
            {txnLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : txns.length===0 ? (
              <div className="card rounded-2xl p-8 text-center text-gray-300">
                <div className="text-3xl mb-2">📭</div><p className="text-sm">Гүйлгээ байхгүй</p>
              </div>
            ) : (
              <div className="space-y-2">
                {txns.slice(0,10).map(t=>(
                  <div key={t.id} className="card rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      t.type==='orlogo'?'bg-emerald-100 text-emerald-600':'bg-red-100 text-red-500'
                    }`}>
                      {t.type==='orlogo'?'↓':'↑'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-700 text-sm font-medium truncate">
                        {t.note||(t.type==='orlogo'?'Орлого':'Зарлага')}
                      </div>
                      <div className="text-gray-400 text-xs">{t.createdAt?.toDate?.()?.toLocaleDateString('mn-MN')||'—'}</div>
                    </div>
                    <div className={`font-bold text-sm flex-shrink-0 ${t.type==='orlogo'?'text-emerald-600':'text-red-500'}`}>
                      {t.type==='orlogo'?'+':'-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
                {txns.length>10 && (
                  <button onClick={()=>navigate('/sanhuu')} className="w-full text-center text-gray-400 hover:text-gray-600 text-xs py-2 transition">
                    Дэлгэрэнгүй харах ({txns.length} нийт) →
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input-base"/>
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} className="input-base resize-none"/>
    </div>
  );
}
