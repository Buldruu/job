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
    <div className="min-h-screen bg-cream-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-100 rounded-full opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sage-100 rounded-full opacity-50 blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-amber">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2"/>
              </svg>
            </div>
            <span className="text-2xl font-display font-bold text-ink-900">Haga</span>
          </div>
          <p className="text-ink-400 text-sm">Монголын ажлын зах зээл</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, required, rightSlot }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{label}</label>
        {rightSlot}
      </div>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="input-field"
      />
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
      {loading
        ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : label}
    </button>
  );
}

function ErrorBox({ msg, onAction, actionLabel }) {
  if (!msg) return null;
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm">
      {msg}
      {onAction && (
        <button type="button" onClick={onAction}
          className="block mt-1.5 text-amber-600 hover:text-amber-700 font-semibold text-xs underline">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ── LOGIN ── */
function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (err) { setError(ERROR_MSGS[err.code] || err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required />
      <Input label="Нууц үг" type="password" value={password} onChange={setPassword} placeholder="••••••••" required
        rightSlot={
          <button type="button" onClick={() => onSwitch('forgot')}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition">
            Мартсан?
          </button>
        }
      />
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading} label="Нэвтрэх" />
      <p className="text-center text-ink-400 text-sm">
        Бүртгэл байхгүй юу?{' '}
        <button type="button" onClick={() => onSwitch('register')}
          className="text-amber-600 hover:text-amber-700 font-bold transition">
          Бүртгүүлэх
        </button>
      </p>
    </form>
  );
}

/* ── REGISTER ── */
function RegisterForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Нууц үг таарахгүй байна'); return; }
    if (password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
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
      <ErrorBox msg={error}
        onAction={error.includes('аль хэдийн') ? () => onSwitch('login') : null}
        actionLabel="Нэвтрэх рүү очих →"
      />
      <SubmitBtn loading={loading} label="Бүртгүүлж нэвтрэх" />
      <p className="text-center text-ink-400 text-sm">
        Аль хэдийн бүртгэлтэй юу?{' '}
        <button type="button" onClick={() => onSwitch('login')}
          className="text-amber-600 hover:text-amber-700 font-bold transition">
          Нэвтрэх
        </button>
      </p>
    </form>
  );
}

/* ── FORGOT ── */
function ForgotForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await sendPasswordResetEmail(auth, email.trim()); setSent(true); }
    catch (err) { setError(ERROR_MSGS[err.code] || err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => onSwitch('login')}
        className="flex items-center gap-2 text-ink-400 hover:text-ink-700 text-sm transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Нэвтрэх рүү буцах
      </button>
      <div>
        <h2 className="text-lg font-display font-bold text-ink-900 mb-1">Нууц үг сэргээх</h2>
        <p className="text-ink-400 text-sm">Имэйл хаягаа оруулбал сэргээх холбоос илгээнэ.</p>
      </div>
      {sent ? (
        <div className="bg-sage-50 border border-sage-100 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📬</div>
          <p className="text-sage-600 font-semibold text-sm mb-1">Имэйл илгээлээ!</p>
          <p className="text-ink-400 text-xs">{email} хаяг руу нууц үг сэргээх холбоос явуулсан.</p>
          <button type="button" onClick={() => onSwitch('login')}
            className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-bold transition">
            Нэвтрэх рүү буцах →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Имэйл" type="email" value={email} onChange={setEmail} placeholder="example@mail.com" required />
          <ErrorBox msg={error} />
          <SubmitBtn loading={loading} label="Сэргээх холбоос илгээх" />
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
      <div className="card p-7">
        {screen !== 'forgot' && (
          <div className="flex gap-1 bg-cream-100 rounded-xl p-1 mb-7 border border-cream-300">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setScreen(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  screen === m
                    ? 'bg-white text-ink-900 shadow-soft border border-cream-300'
                    : 'text-ink-400 hover:text-ink-700'
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
