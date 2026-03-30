import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickLinks = [
  {
    to: '/ajil',
    label: 'Ажил хайх',
    desc: 'Нийтлэгдсэн ажлын зарууд',
    icon: '💼',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    accent: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    to: '/ajiltan',
    label: 'Ажилтан хайх',
    desc: 'Мэргэжилтэн олох',
    icon: '👥',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    accent: 'text-violet-600',
    border: 'border-violet-100',
  },
  {
    to: '/dadlaga',
    label: 'Дадлага',
    desc: 'Туршлага олох боломж',
    icon: '📚',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    accent: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    to: '/surgalt',
    label: 'Сургалт',
    desc: 'Мэргэжил дээшлүүлэх',
    icon: '🎓',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    accent: 'text-amber-600',
    border: 'border-amber-100',
  },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.ner
    ? `${profile.ovog || ''} ${profile.ner}`.trim()
    : user?.email?.split('@')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Өглөөний мэнд' : hour < 17 ? 'Өдрийн мэнд' : 'Оройн мэнд';

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-gray-400 text-sm mb-1">{greeting},</p>
        <h1 className="text-3xl font-display font-bold text-gray-800">
          {displayName} 👋
        </h1>
      </div>

      {/* Cards */}
      <div className="animate-fade-up-delay">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Цэс</p>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map(link => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`card card-hover rounded-2xl p-6 text-left border ${link.border} ${link.bg}`}
            >
              <div className={`w-11 h-11 ${link.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {link.icon}
              </div>
              <div className={`font-display font-bold text-lg mb-1 ${link.accent}`}>{link.label}</div>
              <div className="text-gray-400 text-sm">{link.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile prompt */}
      {!profile?.ner && (
        <div className="mt-8 animate-fade-up-delay2">
          <div className="card rounded-2xl p-5 border border-brand-100 bg-brand-50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-semibold text-sm">Профайлаа бөглөнө үү</p>
              <p className="text-gray-400 text-xs mt-0.5">Мэдээллээ оруулснаар ажил олоход хялбар болно</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-btn"
            >
              Бөглөх
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
