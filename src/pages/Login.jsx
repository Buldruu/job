import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const ERROR_MSGS = {
  'auth/user-not-found':        'Хэрэглэгч олдсонгүй',
  'auth/wrong-password':        'Нууц үг буруу байна',
  'auth/email-already-in-use':  'Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна',
  'auth/weak-password':         'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой',
  'auth/invalid-email':         'Имэйл хаяг буруу байна',
  'auth/invalid-credential':    'Имэйл эсвэл нууц үг буруу байна',
  'auth/too-many-requests':     'Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу.',
};

/* ─── Shared background wrapper ─── */
function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-700 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900 rounded-full opacity-5 blur-3xl" />
      </div>
      <div className="w-full max-w-sm px-6 relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
              </svg>
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight">JobHub</span>
          </div>
          <p className="text-white/40 text-sm">Монголын ажлын зах зээл</p>
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
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>
        {rightSlot}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
      />
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
    >
      {loading
        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : label}
    </button>
  );
}

/* ══════════════════════════════
   LOGIN
══════════════════════════════ */
function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged → App.jsx автоматаар / руу redirect хийнэ
    } catch (err) {
      setError(ERROR_MSGS[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Имэйл" type="email"
        value={email} onChange={setEmail}
        placeholder="example@mail.com" required
      />
      <Input
        label="Нууц үг" type="password"
        value={password} onChange={setPassword}
        placeholder="••••••••" required
        rightSlot={
          <button type="button" onClick={() => onSwitch('forgot')}
            className="text-xs text-brand-400 hover:text-brand-300 transition">
            Нууц үг мартсан?
          </button>
        }
      />
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}
      <SubmitBtn loading={loading} label="Нэвтрэх" />
      <p className="text-center text-white/30 text-sm pt-1">
        Бүртгэл байхгүй юу?{' '}
        <button type="button" onClick={() => onSwitch('register')}
          className="text-brand-400 hover:text-brand-300 font-semibold transition">
          Бүртгүүлэх
        </button>
      </p>
    </form>
  );
}

/* ══════════════════════════════
   REGISTER
══════════════════════════════ */
function RegisterForm({ onSwitch }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirm) {
      setError('Нууц үг таарахгүй байна'); return;
    }
    if (password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return;
    }

    setLoading(true);
    try {
      // 1. Firebase Auth-д бүртгэл үүсгэнэ
      //    → createUserWithEmailAndPassword нь автоматаар нэвтрүүлдэг
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Firestore-д хэрэглэгчийн профайл хадгална
      await setDoc(doc(db, 'users', cred.user.uid), {
        email:      email.trim(),
        ovog:       '',
        ner:        '',
        chadvar:    '',
        turshlaga:  '',
        hayg:       '',
        chiglel:    '',
        tsalin:     '',
        balance:    0,
        createdAt:  serverTimestamp(),
      });

      // 3. Firebase аль хэдийн нэвтэрсэн тул onAuthStateChanged дуудагдаж
      //    App.jsx автоматаар "/" руу redirect хийнэ — энд өөр юм хийх шаардлагагүй

    } catch (err) {
      // Бүртгэл үүссэн бол тодорхой мессеж харуулна
      setError(ERROR_MSGS[err.code] || err.message);
      setLoading(false);
    }
    // loading-г false болгохгүй — redirect болтол spinner харагдаж байна
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Имэйл" type="email"
        value={email} onChange={setEmail}
        placeholder="example@mail.com" required
      />
      <Input
        label="Нууц үг" type="password"
        value={password} onChange={setPassword}
        placeholder="•••••••• (6+ тэмдэгт)" required
      />
      <Input
        label="Нууц үг давтах" type="password"
        value={confirm} onChange={setConfirm}
        placeholder="••••••••" required
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
          {/* Аль хэдийн бүртгэлтэй бол login рүү шилжих товч */}
          {error.includes('аль хэдийн') && (
            <button
              type="button"
              onClick={() => onSwitch('login')}
              className="block mt-2 text-brand-400 hover:text-brand-300 font-semibold text-xs underline"
            >
              Нэвтрэх хэсэг рүү очих →
            </button>
          )}
        </div>
      )}

      <SubmitBtn loading={loading} label="Бүртгүүлж нэвтрэх" />
      <p className="text-center text-white/30 text-sm pt-1">
        Аль хэдийн бүртгэлтэй юу?{' '}
        <button type="button" onClick={() => onSwitch('login')}
          className="text-brand-400 hover:text-brand-300 font-semibold transition">
          Нэвтрэх
        </button>
      </p>
    </form>
  );
}

/* ══════════════════════════════
   FORGOT PASSWORD
══════════════════════════════ */
function ForgotForm({ onSwitch }) {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(ERROR_MSGS[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => onSwitch('login')}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Нэвтрэх рүү буцах
      </button>

      <div>
        <h2 className="text-lg font-display font-bold text-white mb-1">Нууц үг сэргээх</h2>
        <p className="text-white/40 text-sm">Имэйл хаягаа оруулбал сэргээх холбоос илгээнэ.</p>
      </div>

      {sent ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-5 text-center">
          <div className="text-3xl mb-3">📬</div>
          <p className="text-green-400 font-semibold text-sm mb-1">Имэйл илгээлээ!</p>
          <p className="text-white/40 text-xs">{email} хаяг руу нууц үг сэргээх холбоос явуулсан.</p>
          <button type="button" onClick={() => onSwitch('login')}
            className="mt-4 text-brand-400 hover:text-brand-300 text-sm font-semibold transition">
            Нэвтрэх рүү буцах →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Имэйл" type="email" value={email} onChange={setEmail}
            placeholder="example@mail.com" required />
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}
          <SubmitBtn loading={loading} label="Сэргээх холбоос илгээх" />
        </form>
      )}
    </div>
  );
}

/* ══════════════════════════════
   MAIN
══════════════════════════════ */
export default function Login() {
  const [screen, setScreen] = useState('login');

  return (
    <AuthShell>
      <div className="glass rounded-2xl p-8">
        {/* Tab bar — forgot дээр харагдахгүй */}
        {screen !== 'forgot' && (
          <div className="flex gap-1 bg-dark-700 rounded-xl p-1 mb-8">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setScreen(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  screen === m
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'text-white/40 hover:text-white/70'
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
