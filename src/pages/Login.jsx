import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, FacebookAuthProvider, signInWithPopup,
  RecaptchaVerifier, signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import BrandModal from '../components/BrandModal';
import HaGaLogo from '../components/HaGaLogo';

const C = {
  ch:'#5B3BFF', ch5:'#F5F3FF', pg:'#F5F7FF',
  gd:'#FFB020', gdd:'#D97706', gd5:'#FEF3C7',
  sl:'#64748B', sll:'#94A3B8', hl:'#E2E8F0', hls:'#F1F5F9',
  pp:'#FFFFFF', ink:'#1E293B',
  vg:'#22C55E', vg5:'#DCFCE7',
};

/* ── Shared step progress ── */
function StepProgress({ step, total, labels }) {
  return (
    <div style={{ padding:'10px 16px 4px', background:C.pg, flexShrink:0 }}>
      <div style={{ display:'flex', gap:6, marginBottom:6 }}>
        {Array.from({length:total}).map((_,i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:99,
            background: i < step ? C.gd : i === step ? C.ch : C.hl }}/>
        ))}
      </div>
      <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sl, fontWeight:500 }}>
        АЛХАМ {step+1} / {total}{labels?.[step] ? ` · ${labels[step]}` : ''}
      </div>
    </div>
  );
}

/* ── Terms of Service Modal — shown immediately on Бүртгүүлэх ── */
function TermsModal({ onAgree, onClose }) {
  const items = [
    'Та бүртгүүлснээр өөрийн оруулсан мэдээлэл ажил олгогчдод харагдахыг зөвшөөрч байна.',
    'Хуурамч, хууль бус, төөрөгдүүлэх агуулга нийтлэхийг хориглоно.',
    'Хууль бус худалдааны зар (мансууруулах бодис, хулгайн зүйл гэх мэт) оруулахыг хориглоно.',
    'HaGa платформ нь хэрэглэгчдийн хоорондын хэлцлийн хариуцлагыг хүлээхгүй.',
    'Хууль бус үйл ажиллагаа явуулсан тохиолдолд HaGa-тай ямар нэгэн холбоогүй бөгөөд хэрэглэгч өөрөө бүрэн хариуцна.',
  ];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:C.pp, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 -8px 32px rgba(0,0,0,0.15)' }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 2px' }}>
          <div style={{ width:40, height:4, background:C.hl, borderRadius:99 }}/>
        </div>
        {/* Header */}
        <div style={{ padding:'10px 20px 12px', borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
          <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:18, fontWeight:500, color:C.ch }}>Үйлчилгээний нөхцөл</div>
          <div style={{ fontSize:11, color:C.sl, marginTop:2 }}>HaGa платформыг ашиглахын өмнө уншина уу</div>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 20px' }}>
          <div style={{ background:C.ch5, borderRadius:10, padding:'12px 14px', marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.ch, marginBottom:4 }}>HaGa платформыг ашигласнаар:</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:C.ch5, color:C.ch, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:10, fontWeight:700, marginTop:1 }}>{i+1}</div>
                <div style={{ fontSize:13, color:C.ink, lineHeight:1.5 }}>{item}</div>
              </div>
            ))}
          </div>
          <div style={{ background:C.gd5, border:`1px solid ${C.gd}`, borderRadius:10, padding:'10px 14px', marginTop:14 }}>
            <div style={{ fontSize:11, color:C.gdd, lineHeight:1.5 }}>
              ⚠️ Нууцлалын бодлого: Таны хувийн мэдээллийг гуравдагч этгээдэд зарахгүй. Зөвхөн платформын үйл ажиллагааны зорилгоор ашиглана.
            </div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ padding:'12px 16px 24px', borderTop:`1px solid ${C.hls}`, display:'flex', gap:8, flexShrink:0 }}>
          <button onClick={onClose}
            style={{ flex:1, padding:'12px', background:'transparent', color:C.sl, border:`1px solid ${C.hl}`, borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' }}>
            Болих
          </button>
          <button onClick={onAgree}
            style={{ flex:2, padding:'12px', background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            ✓ Зөвшөөрч, бүртгүүлэх
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Method selection (email / google / phone / facebook) ── */
function MethodSelect({ mode, onMethod, onBack }) {
  const title = mode === 'register' ? 'Бүртгүүлэх' : 'Нэвтрэх';
  const methods = [
    { key:'phone', label:'Утасны дугаарaar', icon:
        <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
    },
    { key:'email', label:'И-мэйл хаягаар', icon:
        <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    },
    { key:'google', label:'Google хаягаар', icon:
        <svg style={{width:20,height:20}} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
    },
    { key:'facebook', label:'Facebook хаягаар', icon:
        <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    },
  ];

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.pg }}>
      {/* Appbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>{title}</div>
      </div>
      <div style={{ padding:20, flex:1 }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:12, color:C.sl, marginBottom:20 }}>Нэвтрэх аргаа сонгоно уу</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {methods.map(m => (
            <button key={m.key} onClick={()=>onMethod(m.key)}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:C.pp, border:`1.5px solid ${C.hl}`, borderRadius:12, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:40, height:40, background:C.ch5, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{m.icon}</div>
              <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, color:C.ch }}>{m.label}</div>
              <svg style={{width:16,height:16,color:C.sll,marginLeft:'auto'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Phone + OTP flow ── */
function PhoneFlow({ mode, onBack, onDone }) {
  const [step, setStep]   = useState(0); // 0=phone, 1=otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp]     = useState('');
  const [conf, setConf]   = useState(null);
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (phone.length < 8) { setErr('Зөв утасны дугаар оруулна уу'); return; }
    setLoading(true); setErr('');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-div', { size:'invisible' });
        await window.recaptchaVerifier.render();
      }
      const result = await signInWithPhoneNumber(auth, `+976${phone}`, window.recaptchaVerifier);
      setConf(result);
      setStep(1);
    } catch(e) {
      setErr('OTP илгээхэд алдаа гарлаа: ' + (e.message || e.code));
      window.recaptchaVerifier = null;
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true); setErr('');
    try {
      await conf.confirm(otp);
      onDone();
    } catch(e) { setErr('Код буруу байна. Дахин оролдоно уу.'); }
    setLoading(false);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.pg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button onClick={step > 0 ? ()=>setStep(0) : onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>
          {step === 0 ? 'Утасны дугаар' : 'Код оруулна уу'}
        </div>
      </div>
      <StepProgress step={step} total={2} labels={['УТАС','OTP КОД']}/>

      <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column' }}>
        {step === 0 ? (
          <>
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, marginBottom:6 }}>Утсаа оруулна уу</div>
            <div style={{ fontSize:12, color:C.sl, marginBottom:16 }}>Танд SMS-ээр баталгаажуулах код илгээх болно.</div>
            <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:5 }}>УТАСНЫ ДУГААР</div>
            <div style={{ display:'flex', border:`1px solid ${C.hl}`, borderRadius:8, background:C.pp, overflow:'hidden', marginBottom:6 }}>
              <div style={{ padding:'12px 12px', color:C.sl, fontWeight:500, borderRight:`1px solid ${C.hl}`, fontSize:14, flexShrink:0 }}>+976</div>
              <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} maxLength={8}
                placeholder="9911 2233" style={{ flex:1, padding:'12px', border:'none', outline:'none', fontSize:16, color:C.ink, background:'transparent' }}/>
            </div>
            <div id="recaptcha-div"/>
            {err && <div style={{ fontSize:12, color:'#DC2626', marginBottom:8 }}>{err}</div>}
            <div style={{ flex:1 }}/>
            <button onClick={sendOTP} disabled={loading || phone.length < 8}
              style={{ padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: phone.length >= 8 ? 1 : 0.5 }}>
              {loading ? 'Илгээж байна...' : 'SMS код илгээх'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, marginBottom:6 }}>Кодоо оруулна уу</div>
            <div style={{ fontSize:12, color:C.sl, marginBottom:16 }}>+976 {phone} дугаарт илгээсэн 6 оронтой код</div>
            <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:5 }}>OTP КОД</div>
            <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} maxLength={6}
              placeholder="– – – – – –"
              style={{ border:`1px solid ${C.hl}`, borderRadius:8, padding:'14px', fontSize:24, letterSpacing:'0.4em', textAlign:'center', outline:'none', color:C.ink, background:C.pp, width:'100%' }}/>
            {err && <div style={{ fontSize:12, color:'#DC2626', marginTop:6 }}>{err}</div>}
            <div style={{ fontSize:12, color:C.sl, marginTop:10 }}>
              Код ирэхгүй бол?{' '}
              <button onClick={()=>{setStep(0);setOtp('');setErr('');}} style={{ background:'none', border:'none', color:C.ch, fontSize:12, cursor:'pointer', textDecoration:'underline', padding:0 }}>
                Дахин илгээх
              </button>
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={verifyOTP} disabled={loading || otp.length < 6}
              style={{ padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity: otp.length >= 6 ? 1 : 0.5 }}>
              {loading ? 'Шалгаж байна...' : 'Баталгаажуулах'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Email form ── */
function EmailForm({ mode, onBack }) {
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');
  const [pw2, setPw2]     = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (mode === 'register' && pw !== pw2) { setErr('Нууц үг таарахгүй байна'); return; }
    if (pw.length < 6) { setErr('Нууц үг 6+ тэмдэгт байх ёстой'); return; }
    setLoading(true);
    try {
      if (mode === 'register') await createUserWithEmailAndPassword(auth, email, pw);
      else await signInWithEmailAndPassword(auth, email, pw);
    } catch(e) {
      const msgs = { 'auth/user-not-found':'Хэрэглэгч олдсонгүй', 'auth/wrong-password':'Нууц үг буруу', 'auth/email-already-in-use':'И-мэйл бүртгэлтэй байна', 'auth/invalid-email':'И-мэйл буруу' };
      setErr(msgs[e.code] || 'Алдаа гарлаа: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.pg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <button type="button" onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.ch, display:'flex' }}>
          <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>
          {mode === 'register' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
        </div>
      </div>
      <form onSubmit={submit} style={{ padding:20, flex:1, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch }}>
          {mode === 'register' ? 'И-мэйлээр бүртгүүлэх' : 'И-мэйлээр нэвтрэх'}
        </div>
        {[['И-МЭЙЛ ХАЯГ','email','email',email,setEmail],['НУУЦ ҮГ','password','password',pw,setPw],
          ...(mode==='register'?[['НУУЦ ҮГ ДАВТАХ','password2','password',pw2,setPw2]]:[])
        ].map(([label,key,type,val,setVal])=>(
          <div key={key}>
            <div style={{ fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', color:C.gdd, fontWeight:500, marginBottom:5 }}>{label}</div>
            <input type={type} value={val} onChange={e=>setVal(e.target.value)} required
              style={{ width:'100%', padding:'12px', border:`1px solid ${C.hl}`, borderRadius:8, fontSize:14, color:C.ink, background:C.pp, outline:'none' }}/>
          </div>
        ))}
        {err && <div style={{ fontSize:12, color:'#DC2626' }}>{err}</div>}
        <div style={{ flex:1 }}/>
        <button type="submit" disabled={loading}
          style={{ padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' }}>
          {loading ? '...' : (mode==='register' ? 'Бүртгүүлэх' : 'Нэвтрэх')}
        </button>
      </form>
    </div>
  );
}

/* ── Role selection step ── */
function RoleStep({ onDone }) {
  const [sel, setSel] = useState('');
  const roles = [
    { key:'worker', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label:'Ажил гүйцэтгэгч', desc:'Би өөрийн мэргэжлийн чадвараа ашиглан ажил гүйцэтгэе' },
    { key:'client', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:'Захиалагч', desc:'Би мэргэжилтнээр ажил хийлгэхийг хүсэж байна' },
    { key:'both',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label:'Хоёуланг нь', desc:'Заримдаа ажил хийдэг, заримдаа захиалдаг' },
  ];

  const save = async () => {
    if (!sel) return;
    try {
      if (auth.currentUser)
        await setDoc(doc(db,'users',auth.currentUser.uid),{ role:sel, createdAt:serverTimestamp() },{ merge:true });
    } catch(e) {}
    onDone();
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.pg }}>
      <div style={{ padding:'13px 16px', background:C.pp, borderBottom:`1px solid ${C.hls}`, flexShrink:0 }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:17, fontWeight:500, color:C.ch }}>Сайн байна уу!</div>
      </div>
      <StepProgress step={2} total={3} labels={['УТАС','КОД','ДҮРЭЛ']}/>
      <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:22, fontWeight:500, color:C.ch, margin:'6px 0 8px' }}>
          Та юу хийхээр HaGa ашиглах вэ?
        </div>
        <div style={{ fontSize:12, color:C.sl, marginBottom:16 }}>Дараа нь өөрчилж болно.</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
          {roles.map(r => (
            <button key={r.key} onClick={()=>setSel(r.key)}
              style={{ display:'flex', gap:12, alignItems:'flex-start', padding:14, background:C.pp, border:`${sel===r.key?2:1.5}px solid ${sel===r.key?C.ch:C.hl}`, borderRadius:12, cursor:'pointer', textAlign:'left', width:'100%' }}>
              <div style={{ width:36, height:36, background:C.ch5, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:C.ch, flexShrink:0 }}>{r.icon}</div>
              <div>
                <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:15, fontWeight:500, color:C.ch, marginBottom:3 }}>{r.label}</div>
                <div style={{ fontSize:12, color:C.sl, lineHeight:1.4 }}>{r.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={save} disabled={!sel}
          style={{ padding:13, background:C.ch, color:C.pg, border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', opacity:sel?1:0.5, marginTop:16 }}>
          Үргэлжлүүлэх
        </button>
      </div>
    </div>
  );
}

/* ── Welcome screen (Image 1) ── */
function WelcomeScreen({ onRegister, onLogin }) {
  const [showBrand, setShowBrand] = useState(false);
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:C.ch }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px 16px', textAlign:'center' }}>
        <button onClick={()=>setShowBrand(true)} style={{ background:'none', border:'none', cursor:'pointer', marginBottom:24 }}>
          <HaGaLogo width={48} variant="light"/>
        </button>
        {/* HaGa — NOT "ХАГА" in Mongolian */}
        <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:56, fontWeight:500, letterSpacing:'-0.03em', color:C.pg, lineHeight:1, marginBottom:10 }}>
          Ha<span style={{ fontStyle:'italic', fontWeight:400 }}>G</span>a
        </div>
        <p style={{ fontFamily:"'Source Serif 4',serif", fontStyle:'italic', fontSize:14, lineHeight:1.5, color:'rgba(247,242,233,0.85)', maxWidth:260, margin:0 }}>
          Мэргэжилтэй ажилчид, итгэлтэй захиалагч нар нэгэн дор
        </p>
      </div>
      <div style={{ padding:'0 24px 44px', display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={onRegister}
          style={{ padding:13, textAlign:'center', background:C.gd, color:C.ch, border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
          Бүртгүүлэх
        </button>
        <button onClick={onLogin}
          style={{ padding:13, textAlign:'center', background:'transparent', color:C.pg, border:`1.5px solid rgba(247,242,233,0.4)`, borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' }}>
          Нэвтрэх
        </button>
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(247,242,233,0.6)', margin:'6px 0 0' }}>
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

/* ── Main export ── */
export default function Login() {
  // screen: welcome | terms | reg-method | reg-phone | reg-email | reg-google | reg-role | login-method | login-phone | login-email
  const [screen, setScreen] = useState('welcome');

  /* Social sign-in helpers */
  const googleSignIn = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch(e) {}
  };
  const facebookSignIn = async () => {
    try { await signInWithPopup(auth, new FacebookAuthProvider()); } catch(e) {}
  };

  /* ── WELCOME ── */
  if (screen === 'welcome') {
    return <WelcomeScreen onRegister={()=>setScreen('terms')} onLogin={()=>setScreen('login-method')}/>;
  }

  /* ── TERMS (shown immediately on Бүртгүүлэх) ── */
  if (screen === 'terms') {
    return (
      <>
        <WelcomeScreen onRegister={()=>setScreen('terms')} onLogin={()=>setScreen('login-method')}/>
        <TermsModal
          onAgree={()=>setScreen('reg-method')}
          onClose={()=>setScreen('welcome')}
        />
      </>
    );
  }

  /* ── REGISTER — method select ── */
  if (screen === 'reg-method') {
    return (
      <MethodSelect mode="register" onBack={()=>setScreen('welcome')}
        onMethod={m => {
          if (m === 'google')   { googleSignIn(); }
          else if (m === 'facebook') { facebookSignIn(); }
          else if (m === 'phone')    setScreen('reg-phone');
          else if (m === 'email')    setScreen('reg-email');
        }}/>
    );
  }
  if (screen === 'reg-phone') {
    return (
      <PhoneFlow mode="register" onBack={()=>setScreen('reg-method')}
        onDone={()=>setScreen('reg-role')}/>
    );
  }
  if (screen === 'reg-email') {
    return <EmailForm mode="register" onBack={()=>setScreen('reg-method')}/>;
  }
  if (screen === 'reg-role') {
    return <RoleStep onDone={()=>setScreen('welcome')}/>;
  }

  /* ── LOGIN — method select ── */
  if (screen === 'login-method') {
    return (
      <MethodSelect mode="login" onBack={()=>setScreen('welcome')}
        onMethod={m => {
          if (m === 'google')   { googleSignIn(); }
          else if (m === 'facebook') { facebookSignIn(); }
          else if (m === 'phone')    setScreen('login-phone');
          else if (m === 'email')    setScreen('login-email');
        }}/>
    );
  }
  if (screen === 'login-phone') {
    return <PhoneFlow mode="login" onBack={()=>setScreen('login-method')} onDone={()=>{}}/>;
  }
  if (screen === 'login-email') {
    return <EmailForm mode="login" onBack={()=>setScreen('login-method')}/>;
  }

  return null;
}
