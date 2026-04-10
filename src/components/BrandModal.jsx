import { useState } from 'react';

export function useBrandModal() {
  const [show, setShow] = useState(false);
  return { show, open: () => setShow(true), close: () => setShow(false) };
}

export default function BrandModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-up"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-10 text-center relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2"/>
            </svg>
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight mb-1">HaGA</h1>
          <p className="text-white/70 text-sm">Монголын ажлын зах зээл</p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Эрхэм зорилго</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              HaGA нь Монголын ажил хайгчид болон ажил олгогчдыг хурдан,
              ил тод, найдвартай холбодог дижитал платформ юм.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Боломжууд</h3>
            <div className="space-y-2.5">
              {[
                { icon:'💼', label:'Ажил хайх',           desc:'Нийтлэгдсэн ажлын зарнаас хайна' },
                { icon:'👥', label:'Ажилтан хайх',        desc:'Мэргэжилтэн олж ажилд авна' },
                { icon:'🏅', label:'Мэргэшсэн ажилтан',   desc:'Баталгаажсан мэргэжилтнүүд' },
                { icon:'💳', label:'Барилттай шилжүүлэг', desc:'Аюулгүй санхүүгийн гүйлгээ' },
                { icon:'📚', label:'Дадлага & Сургалт',   desc:'Ур чадвар дээшлүүлэх боломж' },
                { icon:'⭐', label:'Үнэлгээний систем',    desc:'Хэрэглэгчдийн үнэлгээ, сэтгэгдэл' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-gray-800 text-sm font-semibold">{f.label}</div>
                    <div className="text-gray-400 text-xs">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Брэндийн өнгө</h3>
            <div className="flex gap-2">
              {[
                { color:'bg-brand-500', label:'Primary',  hex:'#0e86f0' },
                { color:'bg-brand-700', label:'Dark',     hex:'#0254a6' },
                { color:'bg-teal-500',  label:'Verified', hex:'#14b8a6' },
                { color:'bg-amber-400', label:'Featured', hex:'#fbbf24' },
                { color:'bg-gray-800',  label:'Text',     hex:'#1f2937' },
              ].map(c => (
                <div key={c.label} className="flex-1 text-center">
                  <div className={`${c.color} h-7 rounded-lg mb-1`}/>
                  <div className="text-xs text-gray-500 font-medium">{c.label}</div>
                  <div className="text-xs text-gray-400">{c.hex}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surf-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-gray-400">© 2025 HaGA Mongolia · Бүх эрх хуулиар хамгаалагдсан</p>
          </div>
        </div>
      </div>
    </div>
  );
}
