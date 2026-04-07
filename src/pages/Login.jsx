import { useState, useRef, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const ERRORS = {
  'auth/user-not-found':        'Хэрэглэгч олдсонгүй',
  'auth/wrong-password':        'Нууц үг буруу байна',
  'auth/email-already-in-use':  'Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна',
  'auth/weak-password':         'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой',
  'auth/invalid-email':         'Имэйл хаяг буруу байна',
  'auth/invalid-credential':    'Имэйл эсвэл нууц үг буруу байна',
  'auth/too-many-requests':     'Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу.',
  'auth/invalid-phone-number':  'Утасны дугаар буруу байна. Олон улсын формат: +976...',
  'auth/invalid-verification-code': 'Баталгаажуулах код буруу байна',
  'auth/code-expired':          'Код хугацаа дууссан. Дахин илгээнэ үү.',
  'auth/popup-closed-by-user':  'Нэвтрэх цонх хаагдлаа. Дахин оролдоно уу.',
  'auth/account-exists-with-different-credential': 'Энэ имэйл өөр аргаар бүртгэлтэй байна.',
};

const errMsg = (err) => ERRORS[err.code] || err.message;

// Ensure Firestore user doc exists after social/phone login
const ensureUserDoc = async (firebaseUser, extra = {}) => {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email:      firebaseUser.email || '',
      phone:      firebaseUser.phoneNumber || '',
      ovog: '', ner: '', chadvar: '', turshlaga: '',
      hayg: '', chiglel: '', tsalin: '', balance: 0,
      createdAt: serverTimestamp(),
      ...extra,
    });
  }
};

/* ── Shared shell ── */
function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surf-50 to-blue-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-200 rounded-full opacity-30 blur-3xl"/>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-200 rounded-full opacity-25 blur-3xl"/>
      </div>
      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-btn">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2"/>
              </svg>
            </div>
            <span className="text-2xl font-display font-bold text-gray-800">HaGA</span>
          </div>
          <p className="text-gray-400 text-sm">Монголын ажлын зах зээл</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, type='text', value, onChange, placeholder, required, rightSlot }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        {rightSlot}
      </div>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} required={required} className="input-base"/>
    </div>
  );
}

function Btn({ loading, label, onClick, type='submit', variant='primary', disabled }) {
  const base = 'w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm';
  const styles = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-btn disabled:opacity-50',
    outline: 'bg-white border border-surf-200 text-gray-700 hover:bg-surf-50 shadow-sm disabled:opacity-50',
  };
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled}
      className={`${base} ${styles[variant]}`}>
      {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"/> : label}
    </button>
  );
}

function ErrBox({ msg, children }) {
  if (!msg) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-sm">
      {msg}{children}
    </div>
  );
}

/* ── Social buttons ── */
function SocialLogin({ onError }) {
  const [loading, setLoading] = useState('');

  const handleGoogle = async () => {
    setLoading('google');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserDoc(result.user);
    } catch(e) { onError(errMsg(e)); }
    setLoading('');
  };

  const handleFacebook = async () => {
    setLoading('fb');
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
    } catch(e) { onError(errMsg(e)); }
    setLoading('');
  };

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surf-200"/>
        <span className="text-xs text-gray-400 font-medium">эсвэл</span>
        <div className="flex-1 h-px bg-surf-200"/>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* Google */}
        <button type="button" onClick={handleGoogle} disabled={!!loading}
          className="flex items-center justify-center gap-2 bg-white border border-surf-200 hover:bg-surf-50 rounded-xl py-2.5 text-sm font-semibold text-gray-700 transition-all shadow-sm disabled:opacity-50">
          {loading==='google'
            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>
            : <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>}
          Google
        </button>
        {/* Facebook / Instagram */}
        <button type="button" onClick={handleFacebook} disabled={!!loading}
          className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] rounded-xl py-2.5 text-sm font-semibold text-white transition-all shadow-sm disabled:opacity-50">
          {loading==='fb'
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>}
          Facebook
        </button>
      </div>
      <p className="text-center text-xs text-gray-400">Instagram хаяраар нэвтрэхийн тулд Facebook ашиглана уу</p>
    </div>
  );
}

/* ── Phone OTP ── */
function PhoneForm({ onSwitch }) {
  const [phone, setPhone] = useState('+976');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // phone | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const recaptchaRef = useRef(null);
  const verifierRef = useRef(null);

  useEffect(() => {
    // Setup invisible reCAPTCHA
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return () => {
      try { verifierRef.current?.clear(); } catch(e) {}
    };
  }, []);

  const sendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone.trim(), verifierRef.current);
      setConfirm(result);
      setStep('otp');
    } catch(e) {
      setError(errMsg(e));
      // Reset recaptcha on error
      try { verifierRef.current?.clear(); verifierRef.current = null; } catch(e2) {}
    }
    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await confirm.confirm(code.trim());
      await ensureUserDoc(result.user, { phone: phone.trim() });
    } catch(e) {
      setError(errMsg(e));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div id="recaptcha-container" ref={recaptchaRef}/>
      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <Input label="Утасны дугаар" type="tel" value={phone} onChange={setPhone}
            placeholder="+976 9900 0000" required/>
          <p className="text-xs text-gray-400">Олон улсын формат: +976xxxxxxxx</p>
          <ErrBox msg={error}/>
          <Btn loading={loading} label="📱 OTP код илгээх"/>
          <p className="text-center text-gray-400 text-sm">
            <button type="button" onClick={() => onSwitch('login')} className="text-brand-500 font-semibold">
              ← Буцах
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-brand-700 text-sm">
            📱 {phone} дугаарт OTP код илгээлээ
          </div>
          <Input label="6 оронтой код" type="text" value={code} onChange={setCode}
            placeholder="123456" required/>
          <ErrBox msg={error}/>
          <Btn loading={loading} label="✅ Баталгаажуулах"/>
          <button type="button" onClick={() => setStep('phone')}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition">
            ← Дугаар өөрчлөх
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Email Login ── */
function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialErr, setSocialErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), pw); }
    catch(e) { setErr(errMsg(e)); }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required/>
      <Input label="Нууц үг" type="password" value={pw} onChange={setPw} placeholder="••••••••" required
        rightSlot={
          <button type="button" onClick={() => onSwitch('forgot')}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium">Мартсан?</button>}
      />
      <ErrBox msg={err||socialErr}/>
      <Btn loading={loading} label="Нэвтрэх"/>
      <p className="text-center text-gray-400 text-sm">
        Бүртгэл байхгүй юу?{' '}
        <button type="button" onClick={() => onSwitch('register')} className="text-brand-500 font-semibold">Бүртгүүлэх</button>
      </p>
      {/* Phone option */}
      <button type="button" onClick={() => onSwitch('phone')}
        className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl py-2.5 text-sm font-semibold transition-all">
        📱 Утасны дугаараар нэвтрэх
      </button>
      <SocialLogin onError={setSocialErr}/>
    </form>
  );
}

/* ── Email Register ── */
function RegisterForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialErr, setSocialErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (pw !== pw2) { setErr('Нууц үг таарахгүй байна'); return; }
    if (pw.length < 6) { setErr('Нууц үг 6+ тэмдэгт байх ёстой'); return; }
    setLoading(true);
    try {
      const c = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      await setDoc(doc(db, 'users', c.user.uid), {
        email: email.trim(), ovog:'', ner:'', chadvar:'', turshlaga:'',
        hayg:'', chiglel:'', tsalin:'', balance:0, createdAt: serverTimestamp(),
      });
    } catch(e) {
      setErr(errMsg(e));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required/>
      <Input label="Нууц үг" type="password" value={pw} onChange={setPw} placeholder="•••••••• (6+)" required/>
      <Input label="Нууц үг давтах" type="password" value={pw2} onChange={setPw2} placeholder="••••••••" required/>
      <ErrBox msg={err||socialErr}>
        {(err||'').includes('аль хэдийн') && (
          <button type="button" onClick={() => onSwitch('login')}
            className="block mt-1 text-brand-500 font-semibold text-xs underline">
            Нэвтрэх рүү очих →
          </button>
        )}
      </ErrBox>
      <Btn loading={loading} label="Бүртгүүлж нэвтрэх"/>
      <p className="text-center text-gray-400 text-sm">
        Бүртгэлтэй юу?{' '}
        <button type="button" onClick={() => onSwitch('login')} className="text-brand-500 font-semibold">Нэвтрэх</button>
      </p>
      <button type="button" onClick={() => onSwitch('phone')}
        className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl py-2.5 text-sm font-semibold transition-all">
        📱 Утасны дугаараар бүртгүүлэх
      </button>
      <SocialLogin onError={setSocialErr}/>
    </form>
  );
}

/* ── Forgot ── */
function ForgotForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await sendPasswordResetEmail(auth, email.trim()); setSent(true); }
    catch(e) { setErr(errMsg(e)); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => onSwitch('login')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
        Нэвтрэх рүү буцах
      </button>
      <div>
        <h2 className="text-lg font-display font-bold text-gray-800 mb-1">Нууц үг сэргээх</h2>
        <p className="text-gray-400 text-sm">Имэйл оруулбал сэргээх холбоос илгээнэ.</p>
      </div>
      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-3">📬</div>
          <p className="text-emerald-600 font-semibold text-sm mb-1">Имэйл илгээлээ!</p>
          <p className="text-gray-400 text-xs">{email} рүү сэргээх холбоос явуулсан.</p>
          <button type="button" onClick={() => onSwitch('login')}
            className="mt-4 text-brand-500 text-sm font-semibold">
            Нэвтрэх рүү буцах →
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required/>
          <ErrBox msg={err}/>
          <Btn loading={loading} label="Сэргээх холбоос илгээх"/>
        </form>
      )}
    </div>
  );
}

/* ── MAIN ── */
export default function Login() {
  const [screen, setScreen] = useState('login');

  return (
    <AuthShell>
      <div className="card rounded-2xl p-8">
        {screen !== 'forgot' && screen !== 'phone' && (
          <div className="flex gap-1 bg-surf-100 rounded-xl p-1 mb-7">
            {['login','register'].map(m => (
              <button key={m} onClick={() => setScreen(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  screen===m
                    ? 'bg-white text-brand-600 shadow-sm border border-surf-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                {m==='login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>
        )}
        {screen === 'login'    && <LoginForm    onSwitch={setScreen}/>}
        {screen === 'register' && <RegisterForm onSwitch={setScreen}/>}
        {screen === 'forgot'   && <ForgotForm   onSwitch={setScreen}/>}
        {screen === 'phone'    && <PhoneForm    onSwitch={setScreen}/>}
      </div>
    </AuthShell>
  );
}
