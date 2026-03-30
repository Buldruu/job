import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickLinks = [
  { to: '/ajil', label: 'Ажил хайх', desc: 'Нийтлэгдсэн ажлын зарууд', color: 'from-blue-500/20 to-brand-500/20', icon: '💼' },
  { to: '/ajiltan', label: 'Ажилтан хайх', desc: 'Ажилтан олох мэргэжилтнүүд', color: 'from-purple-500/20 to-pink-500/20', icon: '👥' },
  { to: '/dadlaga', label: 'Дадлага', desc: 'Туршлага олох боломж', color: 'from-green-500/20 to-teal-500/20', icon: '📚' },
  { to: '/surgalt', label: 'Сургалт', desc: 'Мэргэжил дээшлүүлэх', color: 'from-orange-500/20 to-amber-500/20', icon: '🎓' },
  { to: '/sanhuu', label: 'Санхүү', desc: 'Гүйлгээ, шилжүүлэг', color: 'from-teal-500/20 to-cyan-500/20', icon: '💳' },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.ner ? `${profile.ovog || ''} ${profile.ner}`.trim() : user?.email?.split('@')[0];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-white/40 text-sm mb-1">Сайн байна уу,</p>
        <h1 className="text-3xl font-display font-bold text-white">{displayName} 👋</h1>
      </div>

      {/* Quick links */}
      <div className="animate-fade-up-delay">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Цэс</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(link => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`glass glass-hover rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${link.color}`}
            >
              <div className="text-3xl mb-3">{link.icon}</div>
              <div className="font-display font-bold text-white text-lg">{link.label}</div>
              <div className="text-white/40 text-sm mt-1">{link.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile prompt if empty */}
      {!profile?.ner && (
        <div className="mt-8 animate-fade-up-delay2">
          <div className="glass rounded-2xl p-5 border border-brand-500/20 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Профайлаа бөглөнө үү</p>
              <p className="text-white/40 text-xs mt-0.5">Мэдээллээ оруулснаар ажил олоход хялбар болно</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              Бөглөх
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
