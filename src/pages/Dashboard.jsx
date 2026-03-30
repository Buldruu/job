import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickLinks = [
  {
    to: '/ajil',
    label: 'Ажил хайх',
    desc: 'Нийтлэгдсэн ажлын зарууд',
    icon: '💼',
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-100',
    tag: 'Ажил',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    to: '/ajiltan',
    label: 'Ажилтан хайх',
    desc: 'Ажилтан олох, байршуулах',
    icon: '👥',
    color: 'bg-sage-50 border-sage-100 hover:border-sage-400',
    iconBg: 'bg-sage-100',
    tag: 'Байгууллага',
    tagColor: 'bg-sage-100 text-sage-600',
  },
  {
    to: '/dadlaga',
    label: 'Дадлага',
    desc: 'Туршлага олох боломжууд',
    icon: '📚',
    color: 'bg-blue-50 border-blue-100 hover:border-blue-300',
    iconBg: 'bg-blue-100',
    tag: 'Дадлага',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    to: '/surgalt',
    label: 'Сургалт',
    desc: 'Мэргэжил дээшлүүлэх',
    icon: '🎓',
    color: 'bg-purple-50 border-purple-100 hover:border-purple-300',
    iconBg: 'bg-purple-100',
    tag: 'Сургалт',
    tagColor: 'bg-purple-100 text-purple-700',
  },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.ner || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-full p-8">
      <div className="max-w-3xl mx-auto">

        {/* ── Greeting ── */}
        <div className="mb-10 animate-fade-up">
          <p className="text-ink-400 text-sm mb-1 font-medium">
            {getGreeting()}
          </p>
          <h1 className="text-3xl font-display font-bold text-ink-900">
            {firstName ? `${firstName} 👋` : 'Тавтай морилно уу 👋'}
          </h1>
          <p className="text-ink-400 text-sm mt-2">
            Өнөөдөр юу хайж байна вэ?
          </p>
        </div>

        {/* ── Quick links ── */}
        <div className="animate-fade-up-d1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-300 mb-4">Цэс</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(link => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className={`card card-hover ${link.color} p-5 text-left group transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${link.iconBg} rounded-xl flex items-center justify-center text-xl`}>
                    {link.icon}
                  </div>
                  <span className={`badge ${link.tagColor}`}>{link.tag}</span>
                </div>
                <div className="font-display font-bold text-ink-900 text-base mb-1 group-hover:text-amber-700 transition-colors">
                  {link.label}
                </div>
                <div className="text-ink-400 text-xs">{link.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Profile prompt ── */}
        {!profile?.ner && (
          <div className="mt-6 animate-fade-up-d2">
            <div className="card p-5 flex items-center gap-4 border-l-4 border-l-amber-400">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                ✏️
              </div>
              <div className="flex-1">
                <p className="text-ink-900 font-semibold text-sm">Профайлаа бөглөнө үү</p>
                <p className="text-ink-400 text-xs mt-0.5">Мэдээллээ оруулснаар ажил олоход хялбар болно</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="btn-primary px-4 py-2 text-xs flex-shrink-0"
              >
                Бөглөх
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Өглөөний мэнд,';
  if (h < 17) return 'Өдрийн мэнд,';
  return 'Оройн мэнд,';
}
