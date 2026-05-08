import { useState } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createPortal } from 'react-dom';
import BrandModal from '../components/BrandModal';
import HaGaLogo from '../components/HaGaLogo';

/* ── Design tokens ── */
const C = {
  ch:'#1A2B4A', pg:'#F7F2E9', pgd:'#EDE5D2',
  gd:'#C9A961', gdd:'#A8893F',
  sl:'#6B7280', hl:'#D9D2C2', hls:'#E8E2D2',
  pp:'#FFFFFF', ink:'#1F1F1F',
};

/* ── Shared step-progress ── */
function StepProgress({ step, total }) {
  return (
    <div style={{ padding:'12px 16px 4px', background:C.pg }}>
      <div style={{ display:'flex', gap:6, marginBottom:8 }}>
        {Array.from({length:total}).map((_,i)=>(
          <div key={i} style={{ flex:1, height:3, borderRadius:99,
            background: i < step ? C.gd : i === step ? C.ch : C.hl }} />
        ))}
      </div>
      <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sl, fontWeight:500 }}>
        АЛХАМ {step+1} / {total}
      </div>
    </div>
  );
}

/* ── Step 1: Утас / Email / Google ── */
function Step1({ onNext, onGoogle }) {
  const [phone, setPhone] = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhone = async () => {
    if (!phone.trim()) { setErr('Утасны дугаар оруулна уу'); return; }
    setLoading(true); setErr('');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size:'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, `+976${phone.trim()}`, window.recaptchaVerifier);
      onNext({ confirmationResult: result, phone });
    } catch(e) {
      setErr('OTP илгээхэд алдаа гарлаа. Email-ээр нэвтэрнэ үү.');
    }
    setLoading(false);
  };

  return (
    <div style={{ flex:1, padding:16, display:'flex', flexDirection:'column' }}>
      <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, letterSpacing:'-0.01em', margin:'6px 0 8px' }}>
        Утсаа оруулна уу
      </div>
      <div style={{ fontSize:12, color:C.sl, marginBottom:14 }}>
        Танд баталгаажуулах код илгээх болно. SMS үнэгүй.
      </div>
      <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:5 }}>
        УТАСНЫ ДУГААР
      </div>
      <div style={{ display:'flex', gap:0, border:`1px solid ${C.hl}`, borderRadius:8, background:C.pp, overflow:'hidden', marginBottom:4 }}>
        <div style={{ padding:'11px 12px', color:C.sl, fontWeight:500, borderRight:`1px solid ${C.hl}`, fontSize:13 }}>+976</div>
        <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} maxLength={8}
          placeholder="9911 2233" style={{ flex:1, padding:'11px 12px', border:'none', outline:'none', fontSize:14, color:C.ink, background:'transparent' }}/>
      </div>
      {err && <div style={{ fontSize:11, color:'#DC2626', marginBottom:8 }}>{err}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0' }}>
        <div style={{ flex:1, height:1, background:C.hl }}/>
        <span style={{ fontSize:11, color:C.sl }}>эсвэл</span>
        <div style={{ flex:1, height:1, background:C.hl }}/>
      </div>

      <button onClick={onGoogle} style={{ display:'block', width:'100%', padding:'12px', textAlign:'center', background:'transparent', color:C.ch, border:`1.5px solid ${C.ch}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', marginBottom:8 }}>
        Google-ээр үргэлжлүүлэх
      </button>
      <button onClick={()=>onNext({useEmail:true})} style={{ display:'block', width:'100%', padding:'12px', textAlign:'center', background:'transparent', color:C.ch, border:`1.5px solid ${C.ch}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>
        Email-ээр үргэлжлүүлэх
      </button>

      <div style={{ flex:1 }}/>
      <div id="recaptcha-container"/>
      <button onClick={handlePhone} disabled={loading}
        style={{ display:'block', width:'100%', padding:13, textAlign:'center', background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: loading ? 0.6 : 1, marginTop:16 }}>
        {loading ? 'Илгээж байна...' : 'Үргэлжлүүлэх'}
      </button>
    </div>
  );
}

/* ── Step 2: OTP ── */
function Step2({ data, onNext }) {
  const [otp, setOtp]     = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true); setErr('');
    try {
      await data.confirmationResult.confirm(otp);
      onNext({});
    } catch(e) { setErr('Код буруу байна'); }
    setLoading(false);
  };

  return (
    <div style={{ flex:1, padding:16, display:'flex', flexDirection:'column' }}>
      <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, margin:'6px 0 8px' }}>
        Кодоо оруулна уу
      </div>
      <div style={{ fontSize:12, color:C.sl, marginBottom:14 }}>
        +976 {data.phone} дугаарт илгээсэн 6 оронтой код.
      </div>
      <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:5 }}>OTP КОД</div>
      <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} maxLength={6}
        placeholder="______" style={{ border:`1px solid ${C.hl}`, borderRadius:8, padding:'11px 12px', fontSize:22, letterSpacing:'0.3em', textAlign:'center', outline:'none', color:C.ink, background:C.pp, width:'100%' }}/>
      {err && <div style={{ fontSize:11, color:'#DC2626', marginTop:4 }}>{err}</div>}
      <div style={{ flex:1 }}/>
      <button onClick={confirm} disabled={loading || otp.length < 6}
        style={{ display:'block', width:'100%', padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: otp.length < 6 ? 0.5 : 1 }}>
        {loading ? 'Шалгаж байна...' : 'Үргэлжлүүлэх'}
      </button>
    </div>
  );
}

/* ── Step 3: Дүр сонгох ── */
function Step3({ onDone }) {
  const [sel, setSel] = useState('');
  const roles = [
    { key:'worker',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label:'Ажил гүйцэтгэгч', desc:'Би өөрийн мэргэжлийн чадвараа ашиглан ажил гүйцэтгэе' },
    { key:'client',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:'Захиалагч', desc:'Би мэргэжилтнээр ажил хийлгэхийг хүсэж байна' },
    { key:'both',     icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{width:24,height:24}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label:'Хоёуланг нь', desc:'Заримдаа ажил хийдэг, заримдаа захиалдаг' },
  ];
  return (
    <div style={{ flex:1, padding:16, display:'flex', flexDirection:'column' }}>
      <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, margin:'6px 0 8px' }}>
        Та юу хийхээр HAGA ашиглах вэ?
      </div>
      <div style={{ fontSize:12, color:C.sl, marginBottom:16 }}>Дараа нь өөрчилж болно.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
        {roles.map(r=>(
          <button key={r.key} onClick={()=>setSel(r.key)}
            style={{ display:'flex', gap:12, alignItems:'flex-start', padding:14, background:C.pp, border:`${sel===r.key?2:1.5}px solid ${sel===r.key?C.ch:C.hl}`, borderRadius:12, cursor:'pointer', textAlign:'left', width:'100%' }}>
            <div style={{ width:36, height:36, background:C.ch5||'#EEF1F6', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:C.ch, flexShrink:0 }}>{r.icon}</div>
            <div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, color:C.ch, marginBottom:3 }}>{r.label}</div>
              <div style={{ fontSize:12, color:C.sl, lineHeight:1.4 }}>{r.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={()=>sel&&onDone(sel)} disabled={!sel}
        style={{ display:'block', width:'100%', padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: sel ? 1 : 0.5, marginTop:16 }}>
        Үргэлжлүүлэх
      </button>
    </div>
  );
}

/* ── Email login form ── */
function EmailLogin({ onBack, mode }) {
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (mode === 'register') await createUserWithEmailAndPassword(auth, email, pw);
      else await signInWithEmailAndPassword(auth, email, pw);
    } catch(e) {
      setErr(e.code === 'auth/user-not-found' ? 'Хэрэглэгч олдсонгүй' :
             e.code === 'auth/wrong-password' ? 'Нууц үг буруу' :
             e.code === 'auth/email-already-in-use' ? 'Email бүртгэлтэй байна' :
             'Алдаа гарлаа');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ flex:1, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch }}>
        {mode === 'register' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
      </div>
      {[['И-мэйл','email',email,setEmail],['Нууц үг','password',pw,setPw]].map(([label, type, val, setVal])=>(
        <div key={label}>
          <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:5 }}>{label.toUpperCase()}</div>
          <input type={type} value={val} onChange={e=>setVal(e.target.value)} required
            style={{ width:'100%', padding:'11px 12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:13, color:C.ink, background:C.pp, outline:'none' }}/>
        </div>
      ))}
      {err && <div style={{ fontSize:11, color:'#DC2626' }}>{err}</div>}
      <div style={{ flex:1 }}/>
      <button type="submit" disabled={loading}
        style={{ display:'block', width:'100%', padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' }}>
        {loading ? '...' : (mode === 'register' ? 'Бүртгүүлэх' : 'Нэвтрэх')}
      </button>
      <button type="button" onClick={onBack}
        style={{ background:'none', border:'none', color:C.sl, fontSize:13, cursor:'pointer', textAlign:'center' }}>
        ← Буцах
      </button>
    </form>
  );
}

/* ── WelcomeScreen — Image 1 ── */
function WelcomeScreen({ onRegister, onLogin }) {
  const [showBrand, setShowBrand] = useState(false);
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:C.ch }}>
      {/* Hero */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px 16px', textAlign:'center' }}>
        <button onClick={()=>setShowBrand(true)} style={{ background:'none', border:'none', cursor:'pointer', marginBottom:24 }}>
          <HaGaLogo width={48} variant="light"/>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:52, fontWeight:500, letterSpacing:'-0.03em', color:C.pg, lineHeight:1, marginBottom:8 }}>
          HAGA<span style={{ color:C.gd, fontStyle:'italic', fontWeight:400 }}>·</span>ХАГА
        </div>
        <p style={{ fontFamily:"'Source Serif 4',serif", fontStyle:'italic', fontSize:14, lineHeight:1.5, color:'rgba(247,242,233,0.85)', maxWidth:260, margin:0 }}>
          Мэргэжилтэй ажилчид, итгэлтэй захиалагч нар нэгэн дор
        </p>
      </div>
      {/* CTA */}
      <div style={{ padding:'0 24px 40px', display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={onRegister}
          style={{ display:'block', width:'100%', padding:13, textAlign:'center', background:C.gd, color:C.ch, border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Бүртгүүлэх
        </button>
        <button onClick={onLogin}
          style={{ display:'block', width:'100%', padding:13, textAlign:'center', background:'transparent', color:C.pg, border:`1.5px solid rgba(247,242,233,0.4)`, borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' }}>
          Нэвтрэх
        </button>
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(247,242,233,0.6)', margin:'8px 0 0' }}>
          Үргэлжлүүлэхийн тулд та{' '}
          <button onClick={()=>setShowBrand(true)} style={{ background:'none', border:'none', color:C.gd, textDecoration:'underline', fontSize:11, cursor:'pointer', padding:0 }}>
            Үйлчилгээний нөхцөл
          </button>
          -ийг зөвшөөрнө
        </p>
      </div>
      {showBrand && <BrandModal onClose={()=>setShowBrand(false)}/>}
    </div>
  );
}

/* ── Register flow — Image 2 ── */
function RegisterFlow({ onBack, onDone }) {
  const [step, setStep]   = useState(0);
  const [data, setData]   = useState({});
  const [emailMode, setEmailMode] = useState(false);

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(e) {}
  };

  const next = (d) => {
    const merged = {...data, ...d};
    setData(merged);
    if (d.useEmail) { setEmailMode(true); return; }
    if (d.confirmationResult) { setStep(1); return; }
    // After OTP or last step
    if (step === 1) { setStep(2); return; }
  };

  const done = async (role) => {
    try {
      if (auth.currentUser) {
        await setDoc(doc(db,'users',auth.currentUser.uid), { role, createdAt: serverTimestamp() }, { merge:true });
      }
    } catch(e) {}
    onDone();
  };

  if (emailMode) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:C.pg }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
          <button onClick={()=>setEmailMode(false)} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
            <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>Бүртгүүлэх</div>
        </div>
        <EmailLogin onBack={()=>setEmailMode(false)} mode="register"/>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:C.pg }}>
      {/* Appbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
        <button onClick={step > 0 ? ()=>setStep(s=>s-1) : onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>
          {step === 2 ? 'Сайн байна уу!' : 'Бүртгүүлэх'}
        </div>
      </div>
      <StepProgress step={step} total={3}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
        {step === 0 && <Step1 onNext={next} onGoogle={handleGoogle}/>}
        {step === 1 && <Step2 data={data} onNext={next}/>}
        {step === 2 && <Step3 onDone={done}/>}
      </div>
    </div>
  );
}

/* ── Login flow ── */
function LoginFlow({ onBack }) {
  const [emailMode, setEmailMode] = useState(false);
  const [err, setErr] = useState('');

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(e) { setErr('Google нэвтрэлт амжилтгүй'); }
  };

  if (emailMode) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:C.pg }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
          <button onClick={()=>setEmailMode(false)} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
            <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>Нэвтрэх</div>
        </div>
        <EmailLogin onBack={()=>setEmailMode(false)} mode="login"/>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:C.pg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}` }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>Нэвтрэх</div>
      </div>
      <div style={{ padding:16, display:'flex', flexDirection:'column', flex:1 }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, margin:'6px 0 8px' }}>Тавтай морил</div>
        <div style={{ fontSize:12, color:C.sl, marginBottom:20 }}>HAGA-д нэвтрэх</div>
        <button onClick={handleGoogle}
          style={{ display:'block', width:'100%', padding:'12px', textAlign:'center', background:'transparent', color:C.ch, border:`1.5px solid ${C.ch}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', marginBottom:8 }}>
          Google-ээр нэвтрэх
        </button>
        <button onClick={()=>setEmailMode(true)}
          style={{ display:'block', width:'100%', padding:'12px', textAlign:'center', background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>
          Email-ээр нэвтрэх
        </button>
        {err && <div style={{ fontSize:11, color:'#DC2626', marginTop:8, textAlign:'center' }}>{err}</div>}
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function Login() {
  const [screen, setScreen] = useState('welcome'); // welcome | register | login

  if (screen === 'register') return <RegisterFlow onBack={()=>setScreen('welcome')} onDone={()=>setScreen('welcome')}/>;
  if (screen === 'login')    return <LoginFlow onBack={()=>setScreen('welcome')}/>;

  return <WelcomeScreen onRegister={()=>setScreen('register')} onLogin={()=>setScreen('login')}/>;
}
