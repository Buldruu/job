import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { MAIN_CATS } from '../data/chiglel';
import AddressPicker from '../components/AddressPicker';
import { createNotification } from '../components/Notifications';

const CATS = [
  { name:'Засвар үйлчилгээ', icon:'🔧', color:'cat-icon-purple', value:'Барилга, засвар' },
  { name:'Сантехник',        icon:'💧', color:'cat-icon-blue',   value:'Барилга, засвар' },
  { name:'Цахилгаан',        icon:'⚡', color:'cat-icon-yellow', value:'Барилга, засвар' },
  { name:'Цэвэрлэгээ',       icon:'🧹', color:'cat-icon-indigo', value:'Гэр ахуй, цэвэрлэгээ' },
  { name:'Дизайн',           icon:'🎨', color:'cat-icon-pink',   value:'Дизайн, урлаг' },
  { name:'Барилга',          icon:'🏠', color:'cat-icon-green',  value:'Барилга, засвар' },
  { name:'Тээвэр',           icon:'🚚', color:'cat-icon-orange', value:'Тээвэр, логистик' },
  { name:'Бусад',            icon:'⋯',  color:'cat-icon-gray',   value:'' },
];

const BUDGETS = [
  { label:'50,000 хүртэл',         value:'<50000' },
  { label:'50,000 - 100,000',      value:'50000-100000' },
  { label:'100,000 - 200,000',     value:'100000-200000' },
  { label:'200,000 - 500,000',     value:'200000-500000' },
  { label:'500,000-аас дээш',      value:'>500000' },
  { label:'Би тодорхойгүй байна',  value:'negotiable' },
];

const STEPS_TOTAL = 6;

function StepIndicator({ step }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px 0', flexShrink:0 }}>
      {[...Array(STEPS_TOTAL)].map((_,i) => (
        <div key={i} style={{
          width: i < step ? 20 : 6,
          height: 6,
          borderRadius: 99,
          background: i < step ? 'var(--primary)' : 'var(--slate-200)',
          transition: 'all .25s',
        }}/>
      ))}
      <div style={{ marginLeft:8, fontSize:11, color:'var(--slate-500)' }}>{step}/{STEPS_TOTAL}</div>
    </div>
  );
}

export default function Post() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({});
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const update = (k,v) => setForm(p => ({...p, [k]:v}));

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (!user) { alert('Эхлээд нэвтэрнэ үү'); navigate('/login'); return; }
    setSaving(true);
    try {
      // Save to Firestore FIRST
      const docRef = await addDoc(collection(db,'workers'), {
        ...form,
        zarlagch_turul: 'Хувь хүн',
        status: 'published',
        photo_urls: [],
        uid: user.uid,
        email: user.email,
        ratings: [],
        createdAt: serverTimestamp(),
      });

      // Upload files in background
      if (files.length > 0) {
        (async () => {
          try {
            const urls = await Promise.all(files.map(async (file) => {
              const r = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
              await uploadBytes(r, file);
              return getDownloadURL(r);
            }));
            const { updateDoc } = await import('firebase/firestore');
            const { doc } = await import('firebase/firestore');
            await updateDoc(doc(db,'workers',docRef.id), { photo_urls: urls });
          } catch(e) { console.warn('Upload error:', e); }
        })();
      }

      // Notify
      try {
        await createNotification(user.uid, {
          type:'system',
          title:'Зар амжилттай нийтлэгдлээ ✅',
          body:`Таны зар нийтлэгдэж гүйцэтгэгчид санал өгөх боломжтой боллоо.`,
        });
      } catch(e) {}

      setStep(7); // Success screen
    } catch(e) {
      alert('Алдаа: ' + e.message);
    }
    setSaving(false);
  };

  /* ─── Step renderers ─── */
  const StepContent = () => {
    switch(step) {

      case 1: return (
        <>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>
            Ямар төрлийн ажил вэ?
          </h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 20px' }}>
            Ажилдаа тохирох ангилал сонгоно уу.
          </p>
          <input className="input-base" placeholder="🔍 Ангилал хайх..." style={{ marginBottom:14 }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {CATS.map((c, i) => (
              <button key={i} onClick={()=>{ update('chiglel_main', c.value); update('chiglel', c.name); setStep(2); }}
                style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:'var(--bg-primary)', border: form.chiglel===c.name ? '2px solid var(--primary)' : '1px solid var(--border-light)', borderRadius:14, cursor:'pointer', textAlign:'left' }}>
                <div className={`icon-wrap ${c.color}`} style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {c.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:600, color:'var(--ink)' }}>{c.name}</div>
                </div>
                <svg style={{width:16,height:16,color:'var(--slate-400)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </>
      );

      case 2: return (
        <>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>
            Юу хийлгэх вэ?
          </h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 20px' }}>
            Ажлын нэр, дэлгэрэнгүй тайлбараа бичнэ үү.
          </p>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--slate-700)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Ажлын нэр</label>
            <input className="input-base" placeholder="Жишээ: Угаалтуур засуулах"
              value={form.hiilgeh_ajil||''} onChange={e=>update('hiilgeh_ajil', e.target.value)}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--slate-700)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Дэлгэрэнгүй тайлбар</label>
            <textarea className="input-base" rows={5}
              placeholder="Жишээ: Гал тогооны угаалтуурын доорх хоолойноос ус дусаж байна. Боломжтой бол өнөөдөр орой ирж засуулах хүсэлтэй байна..."
              value={form.tailbar||''} onChange={e=>update('tailbar', e.target.value)}
              style={{ fontFamily:'inherit', resize:'vertical' }}/>
            <div style={{ fontSize:11, color:'var(--slate-400)', marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
              💡 Дэлгэрэнгүй бичих тусам илүү зөв санал авах боломжтой
            </div>
          </div>
        </>
      );

      case 3: return (
        <>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>
            Ажил хаана хийх вэ?
          </h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 20px' }}>
            Байршил, цаг хугацааг сонгоно уу.
          </p>

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--slate-700)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Ажлын төрөл</label>
            <div style={{ display:'flex', gap:8 }}>
              {[
                { v:'on_site', l:'Очих ажил' },
                { v:'online',  l:'Онлайн' },
              ].map(opt => (
                <button key={opt.v} onClick={()=>update('ajil_turul', opt.v)}
                  style={{ flex:1, padding:'10px', background: form.ajil_turul===opt.v ? 'var(--primary)' : 'var(--bg-primary)', color: form.ajil_turul===opt.v ? '#fff' : 'var(--slate-700)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer' }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {form.ajil_turul !== 'online' && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--slate-700)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Байршил</label>
              <AddressPicker value={form.hayg||''} onChange={({address,lat,lng})=>{
                update('hayg', address);
                if (lat) update('lat', lat);
                if (lng) update('lng', lng);
              }}/>
            </div>
          )}

          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--slate-700)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Хэзээ хэрэгтэй вэ?</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {['Өнөөдөр','Маргааш','Энэ долоо хоногт','Тодорхой огноо','Яаралтай биш','Тохиролцоно'].map(opt => (
                <button key={opt} onClick={()=>update('hugatsaa', opt)}
                  style={{ padding:'10px', background: form.hugatsaa===opt ? 'var(--primary-50)' : 'var(--bg-primary)', color: form.hugatsaa===opt ? 'var(--primary)' : 'var(--slate-700)', border: form.hugatsaa===opt ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius:10, fontSize:12, fontWeight:500, cursor:'pointer' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      );

      case 4: return (
        <>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>
            Төсөв хэр төдөхөөлж байна?
          </h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 20px' }}>
            Тохирох хэмжээгээ сонгоно уу. Хэрэв тодорхойгүй бол үнийн санал авна.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {BUDGETS.map(b => (
              <button key={b.value} onClick={()=>update('budget', b.value)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background: form.budget===b.value ? 'var(--primary-50)' : 'var(--bg-primary)', border: form.budget===b.value ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius:12, cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border: form.budget===b.value ? '6px solid var(--primary)' : '2px solid var(--slate-300)', flexShrink:0 }}/>
                <span style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{b.label}</span>
              </button>
            ))}
          </div>
        </>
      );

      case 5: return (
        <>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>
            Зураг болон файл нэмэх үү?
          </h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 20px' }}>
            💡 Зураг нэмбэл гүйцэтгэгч илүү зөв үнэ санал болгох боломжтой.
          </p>

          {files.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
              {files.map((f, i) => (
                <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
                  <img src={URL.createObjectURL(f)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <button onClick={()=>setFiles(fs => fs.filter((_,j)=>j!==i))}
                    style={{ position:'absolute', top:4, right:4, width:22, height:22, background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', borderRadius:'50%', cursor:'pointer', fontSize:12 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <label style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'28px 16px', border:'2px dashed var(--border)', borderRadius:14, cursor:'pointer', background:'var(--bg-primary)' }}>
            <div style={{ width:50, height:50, background:'var(--primary-100)', color:'var(--primary)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
              📷
            </div>
            <div style={{ fontSize:13, color:'var(--slate-700)', fontWeight:500 }}>Зураг нэмэх (max 10)</div>
            <div style={{ fontSize:11, color:'var(--slate-400)' }}>Олон зураг нэг дор сонгож болно</div>
            <input type="file" accept="image/*" multiple style={{ display:'none' }}
              onChange={e => setFiles(fs => [...fs, ...Array.from(e.target.files||[]).slice(0, 10 - fs.length)])}/>
          </label>
        </>
      );

      case 6: return (
        <>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>
            Хянах
          </h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 20px' }}>
            Мэдээллээ хянаж баталгаажуулна уу.
          </p>

          <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:14, padding:16 }}>
            <div style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid var(--border-light)' }}>
              <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>АЖЛЫН ТӨРӨЛ</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>📁 {form.chiglel || '—'}</div>
            </div>
            <div style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid var(--border-light)' }}>
              <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>АЖЛЫН НЭР</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{form.hiilgeh_ajil || '—'}</div>
            </div>
            {form.hayg && (
              <div style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid var(--border-light)' }}>
                <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>БАЙРШИЛ</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>📍 {form.hayg}</div>
              </div>
            )}
            <div style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid var(--border-light)' }}>
              <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:4 }}>ТӨСӨВ</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>
                {BUDGETS.find(b=>b.value===form.budget)?.label || '—'}
              </div>
            </div>
            {files.length > 0 && (
              <div>
                <div style={{ fontSize:11, color:'var(--slate-500)', marginBottom:6 }}>ЗУРГУУД ({files.length})</div>
                <div style={{ display:'flex', gap:6 }}>
                  {files.slice(0,4).map((f,i) => (
                    <div key={i} style={{ width:50, height:50, borderRadius:8, overflow:'hidden' }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                  ))}
                  {files.length > 4 && (
                    <div style={{ width:50, height:50, background:'var(--slate-100)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'var(--slate-500)' }}>+{files.length-4}</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{ fontSize:11, color:'var(--slate-500)', marginTop:10, padding:'8px 12px', background:'var(--primary-50)', borderRadius:8, display:'flex', alignItems:'center', gap:6 }}>
            🔒 Таны утас, нарийн хаяг нийтэд харагдахгүй
          </div>
        </>
      );

      case 7: return (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <div style={{ width:80, height:80, background:'var(--success)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#fff', fontSize:36 }}>✓</div>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 8px' }}>Амжилттай!</h2>
          <p style={{ fontSize:13, color:'var(--slate-500)', margin:'0 0 24px', lineHeight:1.5 }}>
            Таны захиалга амжилттай нийтлэгдлээ.<br/>
            Шилдэг гүйцэтгэгчид таны захиалгад санал өгөх болно.
          </p>
          <button className="btn-primary" onClick={()=>navigate('/workspace')} style={{ width:'100%', marginBottom:8 }}>
            Миний ажлууд руу очих
          </button>
          <button className="btn-ghost" onClick={()=>{ setForm({}); setFiles([]); setStep(1); }}>
            Эх хуудсанд очих
          </button>
        </div>
      );

      default: return null;
    }
  };

  /* ─── Validation ─── */
  const canProceed = () => {
    if (step === 1) return !!form.chiglel;
    if (step === 2) return !!(form.hiilgeh_ajil && form.tailbar);
    if (step === 3) return !!(form.ajil_turul && form.hugatsaa);
    if (step === 4) return !!form.budget;
    if (step === 5) return true;
    if (step === 6) return true;
    return false;
  };

  /* ─── Render ─── */
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--bg-secondary)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background:'var(--bg-primary)', borderBottom:'1px solid var(--border-light)', flexShrink:0 }}>
        {step > 1 && step < 7 ? (
          <button onClick={()=>setStep(s => s-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink)', padding:0, display:'flex' }}>
            <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ) : (
          <button onClick={()=>navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink)', padding:0, display:'flex' }}>
            <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:'var(--ink)' }}>Захиалга үүсгэх</div>
      </div>

      {/* Step indicator */}
      {step < 7 && <StepIndicator step={step}/>}

      {/* Content */}
      <div style={{ flex:1, padding:'8px 16px 20px', overflowY:'auto' }}>
        <StepContent/>
      </div>

      {/* Footer button */}
      {step < 7 && (
        <div style={{ padding:'12px 16px 20px', background:'var(--bg-primary)', borderTop:'1px solid var(--border-light)', flexShrink:0 }}>
          {step < STEPS_TOTAL ? (
            <button className="btn-primary" onClick={()=>setStep(s => s+1)} disabled={!canProceed()}
              style={{ width:'100%' }}>
              Үргэлжлүүлэх →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}
              style={{ width:'100%', background: saving ? 'var(--primary-600)' : 'var(--primary)' }}>
              {saving ? 'Нийтлэж байна...' : '✓ Нийтлэх'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
