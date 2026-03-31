import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const ERROR_MSGS = {
  'auth/user-not-found':       'Хэрэглэгч олдсонгүй',
  'auth/wrong-password':       'Нууц үг буруу байна',
  'auth/email-already-in-use': 'Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна',
  'auth/weak-password':        'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой',
  'auth/invalid-email':        'Имэйл хаяг буруу байна',
  'auth/invalid-credential':   'Имэйл эсвэл нууц үг буруу байна',
  'auth/too-many-requests':    'Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу.',
};

function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surf-50 to-blue-50 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-200 rounded-full opacity-25 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-btn">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
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

function Input({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        {rightSlot}
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="input-base" />
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-btn flex items-center justify-center gap-2">
      {loading
        ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : label}
    </button>
  );
}

function ErrorBox({ msg, onLoginClick }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-sm">
      {msg}
      {msg?.includes('аль хэдийн') && (
        <button type="button" onClick={onLoginClick}
          className="block mt-1.5 text-brand-500 font-semibold text-xs underline">
          Нэвтрэх хэсэг рүү очих →
        </button>
      )}
    </div>
  );
}

/* LOGIN */
function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(ERROR_MSGS[err.code] || err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required />
      <Input label="Нууц үг" type="password" value={password} onChange={setPassword} placeholder="••••••••" required
        rightSlot={
          <button type="button" onClick={() => onSwitch('forgot')}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition">
            Нууц үг мартсан?
          </button>
        }
      />
      {error && <ErrorBox msg={error} onLoginClick={() => onSwitch('login')} />}
      <SubmitBtn loading={loading} label="Нэвтрэх" />
      <p className="text-center text-gray-400 text-sm pt-1">
        Бүртгэл байхгүй юу?{' '}
        <button type="button" onClick={() => onSwitch('register')}
          className="text-brand-500 hover:text-brand-600 font-semibold transition">
          Бүртгүүлэх
        </button>
      </p>
    </form>
  );
}

/* REGISTER */
function RegisterForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Нууц үг таарахгүй байна'); return; }
    if (password.length < 6)  { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email.trim(), ovog: '', ner: '', chadvar: '', turshlaga: '',
        hayg: '', chiglel: '', tsalin: '', balance: 0, createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(ERROR_MSGS[err.code] || err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required />
      <Input label="Нууц үг" type="password" value={password} onChange={setPassword} placeholder="•••••••• (6+ тэмдэгт)" required />
      <Input label="Нууц үг давтах" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" required />
      {error && <ErrorBox msg={error} onLoginClick={() => onSwitch('login')} />}
      <SubmitBtn loading={loading} label="Бүртгүүлж нэвтрэх" />
      <p className="text-center text-gray-400 text-sm pt-1">
        Аль хэдийн бүртгэлтэй юу?{' '}
        <button type="button" onClick={() => onSwitch('login')}
          className="text-brand-500 hover:text-brand-600 font-semibold transition">
          Нэвтрэх
        </button>
      </p>
    </form>
  );
}

/* FORGOT */
function ForgotForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(ERROR_MSGS[err.code] || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => onSwitch('login')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Нэвтрэх рүү буцах
      </button>
      <div>
        <h2 className="text-lg font-display font-bold text-gray-800 mb-1">Нууц үг сэргээх</h2>
        <p className="text-gray-400 text-sm">Имэйл хаягаа оруулбал сэргээх холбоос илгээнэ.</p>
      </div>
      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-3">📬</div>
          <p className="text-emerald-600 font-semibold text-sm mb-1">Имэйл илгээлээ!</p>
          <p className="text-gray-400 text-xs">{email} хаяг руу сэргээх холбоос явуулсан.</p>
          <button type="button" onClick={() => onSwitch('login')}
            className="mt-4 text-brand-500 hover:text-brand-600 text-sm font-semibold transition">
            Нэвтрэх рүү буцах →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required />
          {error && <ErrorBox msg={error} />}
          <SubmitBtn loading={loading} label="Сэргээх холбоос илгээх" />
        </form>
      )}
    </div>
  );
}

/* MAIN */
export default function Login() {
  const [screen, setScreen] = useState('login');

  return (
    <AuthShell>
      <div className="card rounded-2xl p-8">
        {screen !== 'forgot' && (
          <div className="flex gap-1 bg-surf-100 rounded-xl p-1 mb-7">
            {['login','register'].map(m => (
              <button key={m} onClick={() => setScreen(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  screen === m
                    ? 'bg-white text-brand-600 shadow-sm border border-surf-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>
        )}
        {screen === 'login'    && <LoginForm    onSwitch={setScreen} />}
        {screen === 'register' && <RegisterForm onSwitch={setScreen} />}
        {screen === 'forgot'   && <ForgotForm   onSwitch={setScreen} />}
      </div>
    </AuthShell>
  );
}
