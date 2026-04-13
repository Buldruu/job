import { useState } from 'react';

/* ── HaGA SVG Logo ── */
const HaGaLogo = ({ width = 80, light = false }) => (
  <svg width={width} viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`lg-${width}-${light}`} x1="0" y1="0" x2="240" y2="170" gradientUnits="userSpaceOnUse">
        {light ? (
          <>
            <stop stopColor="#60A5FA"/>
            <stop offset="1" stopColor="#67E8F9"/>
          </>
        ) : (
          <>
            <stop stopColor="#1536C8"/>
            <stop offset=".5" stopColor="#2563EB"/>
            <stop offset="1" stopColor="#38BDF8"/>
          </>
        )}
      </linearGradient>
    </defs>
    <rect x="10" y="20" width="28" height="130" rx="4" fill={`url(#lg-${width}-${light})`}/>
    <rect x="10" y="68" width="90" height="34" rx="4" fill={`url(#lg-${width}-${light})`}/>
    <rect x="72" y="20" width="28" height="130" rx="4" fill={`url(#lg-${width}-${light})`}/>
    <path d="M130 150C85 150 72 110 80 75C88 35 130 20 165 30C185 36 195 50 200 68H165C160 56 148 50 135 52C118 55 110 72 112 92C114 112 128 126 148 124C162 122 172 114 174 102H150V82H205V150H185V135C175 145 162 152 148 152L130 150Z"
      fill={`url(#lg-${width}-${light})`}/>
  </svg>
);

export default function BrandModal({ onClose }) {
  const [section, setSection] = useState('brand');

  const tabs = [
    { key: 'brand', label: '01 Бренд' },
    { key: 'logo',  label: '02 Лого'  },
    { key: 'color', label: '03 Өнгө'  },
    { key: 'type',  label: '04 Фонт'  },
    { key: 'app',   label: '05 Хэрэглээ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Cover header */}
        <div className="relative overflow-hidden flex-shrink-0"
          style={{ background: '#0A0F2E', minHeight: 200 }}>
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(37,99,235,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.07) 1px,transparent 1px)',
            backgroundSize: '40px 40px'
          }}/>
          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{
            background: 'radial-gradient(circle,rgba(37,99,235,0.3) 0%,transparent 65%)'
          }}/>
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full" style={{
            background: 'radial-gradient(circle,rgba(56,189,248,0.15) 0%,transparent 65%)'
          }}/>

          {/* Close btn */}
          <button onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/40 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Cover content */}
          <div className="relative z-10 px-10 py-8 flex items-center gap-8">
            <div className="flex-shrink-0">
              <HaGaLogo width={72} light/>
            </div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 52, letterSpacing: 4, lineHeight: 1,
                background: 'linear-gradient(135deg,#1536C8,#2563EB,#38BDF8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', marginBottom: 4
              }}>HaGa</div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', marginBottom: 10
              }}>Brand Identity Guidelines · 2025</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
                Монгол хүн бүрт ажлын боломж.<br/>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'normal', fontWeight: 600 }}>
                  HaGa — ажилгүйдлийг бууруулна.
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative z-10 flex gap-1 px-6 pb-0 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setSection(t.key)}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  padding: '10px 16px', borderRadius: '10px 10px 0 0',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: section === t.key ? 'white' : 'rgba(255,255,255,0.08)',
                  color: section === t.key ? '#1536C8' : 'rgba(255,255,255,0.45)',
                  fontWeight: section === t.key ? 700 : 400,
                  transition: 'all 0.2s',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {section === 'brand' && <BrandSection/>}
          {section === 'logo'  && <LogoSection/>}
          {section === 'color' && <ColorSection/>}
          {section === 'type'  && <TypeSection/>}
          {section === 'app'   && <AppSection/>}
        </div>
      </div>
    </div>
  );
}

/* ════ 01 BRAND ════ */
function BrandSection() {
  return (
    <div className="p-8 space-y-6">
      {/* Story hero */}
      <div className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: '#0A0F2E' }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%,rgba(37,99,235,0.2) 0%,transparent 65%)'
        }}/>
        <div className="relative z-10">
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48, lineHeight: 1, letterSpacing: 2,
            color: 'white', marginBottom: 12
          }}>
            ХҮНИЙ БҮР<br/>
            <span style={{
              background: 'linear-gradient(90deg,#1536C8,#38BDF8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>ХАЛТАРДАГ.</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, maxWidth: 520 }}>
            Монголд өнөөдөр хэдэн мянган залуу ажлын байр хайж байна. Хэдэн зуун компани зөв хүнээ олж чадахгүй байна.<br/><br/>
            Энэ зай — <em style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'normal', fontWeight: 500 }}>HaGa</em> таслан зогсооно.
          </div>
        </div>
        <div className="absolute bottom-4 right-6 opacity-5"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color: 'white', lineHeight: 1 }}>
          HaGa
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { num: '60K+', label: 'Ажилгүй иргэн', text: 'Монголд бүртгэлтэй ажилгүй иргэдийн тоо. HaGa тэр тоог бууруулах зорилготой.' },
          { num: '3X',   label: 'Хурдан холболт', text: 'Уламжлалт аргаас 3 дахин хурдан. Зөв ажилтан, зөв компанийг богино хугацаанд нийлүүлнэ.' },
          { num: '🌏',   label: 'Дэлхийн өрсөлдөөн', text: 'Монгол компаниуд дэлхийн зах зээлд өрсөлдөхийн тулд дэлхийн чанарын ажилтан хэрэгтэй.' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 relative overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg,#1536C8,#38BDF8)' }}/>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 40,
              background: 'linear-gradient(135deg,#1536C8,#38BDF8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              lineHeight: 1, marginBottom: 6
            }}>{c.num}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: '#2563EB', textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 12, fontWeight: 300, color: '#374151', lineHeight: 1.8 }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: '🎯', sub: 'Боломж олгох',       title: 'Хүн бүрт ажил',         text: 'Мэргэжил, туршлага, байршлаас үл хамааран бид боломжийг нийтэд нь нээлттэй болгоно.' },
          { icon: '📉', sub: 'Ажилгүйдлийг бууруулах', title: 'Тоог бага болгоно',  text: 'Ажилгүйдэл бол зөвхөн статистик биш — хүний амьдрал. HaGa үүнийг жинхэнэ утгаараа бууруулна.' },
          { icon: '🌏', sub: 'Дэлхийтэй өрсөлдөх', title: 'Global-ready ажилтан', text: 'Монгол компаниуд дэлхийн чанарын боловсон хүчин хэрэгтэй. HaGa тэр холболтыг хийнэ.' },
          { icon: '💬', sub: 'Дуу хоолой',          title: 'Итгэлтэй, шударга',     text: 'Иргэдэд — найрсаг чиглүүлэгч. Компаниудад — найдвартай түнш. Хоёуланд — үр дүн гаргадаг.' },
        ].map(v => (
          <div key={v.title} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: '#2563EB', textTransform: 'uppercase', marginBottom: 6 }}>{v.sub}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0F2E', marginBottom: 6 }}>{v.title}</div>
            <div style={{ fontSize: 13, fontWeight: 300, color: '#374151', lineHeight: 1.8 }}>{v.text}</div>
          </div>
        ))}
      </div>

      {/* Voice tones */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { head: '🔥 Дулаан', headStyle: { background: '#FEF3C7', color: '#92400E' }, eg: 'Таны ур чадвар хэн нэгэнд хэрэгтэй байна. Бид тэр хүнийг олоход туслана.' },
          { head: '⚡ Итгэлтэй', headStyle: { background: '#EDE9FE', color: '#5B21B6' }, eg: 'Монгол ажилтан дэлхийн аль ч компанид өрсөлдөж чадна.' },
          { head: '✓ Шударга',  headStyle: { background: '#DCFCE7', color: '#15803D' }, eg: 'Ажлын зар хайхад цаг алдах хэрэггүй. Танд тохирсоныг бид шүүж өгнө.' },
          { head: '🫶 Хүнлэг',  headStyle: { background: '#FCE7F3', color: '#9D174D' }, eg: 'Таны профайл 12 компани хайж байна. Харах уу?' },
        ].map(t => (
          <div key={t.head} className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 py-2.5" style={{ ...t.headStyle, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>{t.head}</div>
            <div className="px-4 py-3 bg-white">
              <div style={{ fontSize: 13, fontStyle: 'italic', color: '#374151', fontWeight: 300, lineHeight: 1.8 }}>"{t.eg}"</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════ 02 LOGO ════ */
function LogoSection() {
  return (
    <div className="p-8 space-y-6">
      {/* Letter meaning */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-8">
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 96, lineHeight: 1,
          background: 'linear-gradient(135deg,#1536C8,#38BDF8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          letterSpacing: -2, flexShrink: 0
        }}>HaGa</div>
        <div className="space-y-4">
          {[
            { badge: 'H', mn: 'Haaga — Халтвар', en: 'Stumble / Fall', desc: 'H үсгийн хоёр тулгуур нь ажилтан ба компанийг төлөөлнө. Хэвтээ гүүр нь HaGa платформ.' },
            { badge: 'G', mn: 'Growth / Gateway', en: 'Өсөлт / Гарц',  desc: 'G үсэг нь нээлттэй тойрог — боломжийн гарц. Нээлттэй талд нь орход ертөнц өргөн болдог.' },
          ].map(m => (
            <div key={m.badge} className="flex gap-3">
              <div className="flex-shrink-0 text-white font-bold text-lg px-3 py-1 rounded-lg"
                style={{ background: 'linear-gradient(135deg,#1536C8,#38BDF8)', fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
                {m.badge}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0F2E' }}>{m.mn}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: '#2563EB', textTransform: 'uppercase', marginBottom: 3 }}>{m.en}</div>
                <div style={{ fontSize: 12, fontWeight: 300, color: '#6B7280', lineHeight: 1.7 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 logo variants */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { bg: '#FFFFFF', border: '1px solid #E5E9F2', label: 'Цагаан дэвсгэр — Үндсэн', light: false, textColor: '#6B7280' },
          { bg: '#0A0F2E', border: 'none',              label: 'Харанхуй дэвсгэр',         light: true,  textColor: 'rgba(255,255,255,0.4)' },
          { bg: '#2563EB', border: 'none',              label: 'Цэнхэр дэвсгэр',          white: true,  textColor: 'rgba(255,255,255,0.5)' },
          { bg: 'linear-gradient(135deg,#1536C8,#2563EB,#38BDF8)', border: 'none', label: 'Градиент дэвсгэр', white: true, textColor: 'rgba(255,255,255,0.5)' },
        ].map((v, i) => (
          <div key={i} className="rounded-2xl overflow-hidden relative flex items-center justify-center"
            style={{ background: v.bg, border: v.border, minHeight: 160 }}>
            {v.white
              ? <svg width="90" viewBox="0 0 240 170" fill="none">
                  <rect x="10" y="20" width="28" height="130" rx="4" fill="white"/>
                  <rect x="10" y="68" width="90" height="34" rx="4" fill="white"/>
                  <rect x="72" y="20" width="28" height="130" rx="4" fill="white"/>
                  <path d="M130 150C85 150 72 110 80 75C88 35 130 20 165 30C185 36 195 50 200 68H165C160 56 148 50 135 52C118 55 110 72 112 92C114 112 128 126 148 124C162 122 172 114 174 102H150V82H205V150H185V135C175 145 162 152 148 152L130 150Z" fill="white"/>
                </svg>
              : <HaGaLogo width={90} light={v.light}/>
            }
            <span className="absolute bottom-3 left-4"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: v.textColor }}>
              {v.label}
            </span>
          </div>
        ))}
      </div>

      {/* Symbol meaning */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '⚓', title: 'H — Тулгуур',      text: 'Хоёр тулгуур нь ажилтан ба компанийг, гүүр нь HaGa платформыг төлөөлнө.' },
          { icon: '🌀', title: 'Гадилдсан үсэг',   text: 'H ба G нийлж нэг нэгэндээ ороосон дизайн нь эрэлт+нийлүүлэлт салашгүй холбоотой.' },
          { icon: '↗',  title: 'Өнцгийн чиглэл',   text: 'Градиент тодрол нь зүүн доороос баруун дээш — өсөлт, ирээдүйг бэлгэддэг.' },
        ].map(s => (
          <div key={s.title} className="bg-white rounded-2xl p-5 text-center border border-gray-100">
            <div style={{ fontSize: 30, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: '#2563EB', textTransform: 'uppercase', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 12, fontWeight: 300, color: '#374151', lineHeight: 1.8 }}>{s.text}</div>
          </div>
        ))}
      </div>

      {/* Do/don't */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { head: '✓ Зөв хэрэглэх', headBg: '#DCFCE7', headColor: '#15803D', items: ['Градиент хувилбарыг анхдагч болгоно', 'Харанхуй дэвсгэр дээр цагаан хувилбар', 'SVG эсвэл PNG @2x ашиглана', 'Clearspace: өндрийн 25%-ийг чөлөөлнө'] },
          { head: '✕ Буруу хэрэглэх', headBg: '#FEE2E2', headColor: '#DC2626', items: ['Логог эргүүлэх, тусгалыг харуулах', 'Харьцааг өөрчлөх, сунгах', 'Брендийн бус өнгөөр будах', 'Лого дээр текст, дүрс давхарлах'] },
        ].map(d => (
          <div key={d.head} className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 py-2.5" style={{ background: d.headBg, color: d.headColor, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>{d.head}</div>
            <div className="p-4 bg-white space-y-2">
              {d.items.map(it => (
                <div key={it} style={{ fontSize: 12, color: '#374151', fontWeight: 300, display: 'flex', gap: 8 }}>
                  <span style={{ color: d.headColor, fontFamily: "'Space Mono',monospace", fontSize: 11, flexShrink: 0 }}>{d.head.startsWith('✓') ? '→' : '✕'}</span>
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════ 03 COLOR ════ */
function ColorSection() {
  return (
    <div className="p-8 space-y-6">
      {/* Swatches */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { bg: '#1536C8', role: 'Primary',  name: 'HaGa Navy', hex: '#1536C8',  use: 'Тулгуур өнгө',   textLight: true },
          { bg: '#2563EB', role: 'Brand',    name: 'HaGa Blue', hex: '#2563EB',  use: 'Бренд өнгө',    textLight: true },
          { bg: '#38BDF8', role: 'Accent',   name: 'HaGa Sky',  hex: '#38BDF8',  use: 'Дэмжих өнгө',  textLight: true },
          { bg: '#0A0F2E', role: 'Dark',     name: 'HaGa Dark', hex: '#0A0F2E',  use: 'Текст / Харанхуй', textLight: true },
          { bg: '#F0F6FF', role: 'Light',    name: 'HaGa Light',hex: '#F0F6FF',  use: 'Арын дэвсгэр', textLight: false, border: true },
        ].map(s => (
          <div key={s.name} className="rounded-2xl overflow-hidden shadow-md">
            <div style={{ height: 100, background: s.bg, border: s.border ? '1px solid #E5E9F2' : 'none', display: 'flex', alignItems: 'flex-end', padding: '10px 12px' }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: s.textLight ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>{s.role}</span>
            </div>
            <div className="bg-white p-3">
              <div style={{ fontWeight: 700, fontSize: 11, color: '#0A0F2E', marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#6B7280' }}>{s.hex}</div>
              <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{s.use}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradients */}
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>Градиентүүд</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { bg: 'linear-gradient(135deg,#1536C8,#2563EB,#38BDF8)', label: 'Primary 135°', sub: '#1536C8 → #38BDF8' },
            { bg: 'linear-gradient(90deg,#1536C8,#38BDF8)',           label: 'Horizontal 90°', sub: 'Text & Logo fill' },
            { bg: 'linear-gradient(180deg,#0A0F2E,#1536C8 60%,#2563EB)', label: 'Dark Hero', sub: 'Hero sections' },
          ].map(g => (
            <div key={g.label} className="rounded-2xl overflow-hidden" style={{ height: 120, background: g.bg, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, textTransform: 'uppercase' }}>{g.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status colors */}
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>Статус Тэмдэглэгээ</div>
        <div className="flex gap-3 flex-wrap">
          {[
            { bg: '#DCFCE7', color: '#15803D', label: '✓ Нээлттэй' },
            { bg: '#FEF3C7', color: '#B45309', label: '⏳ Хүлээгдэж буй' },
            { bg: '#FEE2E2', color: '#DC2626', label: '✕ Дууссан' },
            { bg: '#EFF6FF', color: '#1D4ED8', label: '🔔 Шинэ' },
            { bg: 'linear-gradient(135deg,#1536C8,#38BDF8)', color: 'white', label: '⭐ Онцлох' },
          ].map(s => (
            <span key={s.label} className="px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: s.bg, color: s.color }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════ 04 TYPE ════ */
function TypeSection() {
  return (
    <div className="p-8 space-y-4">
      {[
        {
          sample: <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, background: 'linear-gradient(135deg,#1536C8,#38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: 2, lineHeight: 1 }}>HAAGA</div>,
          label: 'Display / Hero', meta: 'Bebas Neue · 48–84px · Gradient'
        },
        {
          sample: <div style={{ fontSize: 26, fontWeight: 700, color: '#0A0F2E' }}>Таны карьерын дараагийн алхам эндээс</div>,
          label: 'H1 Heading', meta: 'DM Sans · Bold 700 · 28–36px'
        },
        {
          sample: <div style={{ fontSize: 15, fontWeight: 300, color: '#374151', lineHeight: 1.85 }}>Ажил хайх, шинэ боломж олох — хэрэгтэй бол одоо эхэл. Мянга мянган вакансы нэг дороо.</div>,
          label: 'Body Text', meta: 'DM Sans · Light 300 · 15–17px'
        },
        {
          sample: <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#2563EB', letterSpacing: 3, textTransform: 'uppercase' }}>UI Label · Tag · Caption · Code</div>,
          label: 'Label / UI', meta: 'Space Mono · Regular · 10–13px · ALL CAPS'
        },
      ].map(t => (
        <div key={t.label} className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4 border border-gray-100">
          <div className="flex-1">{t.sample}
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>{t.label}</div>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#6B7280', textAlign: 'right', lineHeight: 2, flexShrink: 0, maxWidth: 150 }}>{t.meta}</div>
        </div>
      ))}

      {/* Scale */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 3, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 20 }}>Хэмжээний Шатлал</div>
        {[
          { text: '72 — Hero',    style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: '#0A0F2E', lineHeight: 1 } },
          { text: '48 — Section', style: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: '#1536C8', lineHeight: 1 } },
          { text: '32 — H1 Heading', style: { fontWeight: 700, fontSize: 26, color: '#0A0F2E' } },
          { text: '22 — H2 Subheading', style: { fontWeight: 700, fontSize: 18, color: '#0A0F2E' } },
          { text: '17 — Lead / Emphasis', style: { fontWeight: 500, fontSize: 15, color: '#374151' } },
          { text: '15 — Body Regular', style: { fontWeight: 300, fontSize: 13, color: '#374151' } },
          { text: '13 — Body Small', style: { fontWeight: 300, fontSize: 11, color: '#6B7280' } },
          { text: '11 — Label / Tag', style: { fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#2563EB', letterSpacing: 3, textTransform: 'uppercase' } },
        ].map(r => (
          <div key={r.text} style={{ ...r.style, marginBottom: 10 }}>{r.text}</div>
        ))}
      </div>
    </div>
  );
}

/* ════ 05 APP ════ */
function AppSection() {
  return (
    <div className="p-8 space-y-6">
      {/* Tagline */}
      <div className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ background: '#0A0F2E' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(37,99,235,0.2) 0%,transparent 65%)' }}/>
        <div className="relative z-10">
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: 'white', letterSpacing: 2, lineHeight: 1, marginBottom: 8 }}>
            БОЛОМЖ БҮРТ<br/>
            <span style={{ background: 'linear-gradient(90deg,#1536C8,#38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>МОНГОЛ ХҮЧИН</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300, fontStyle: 'italic' }}>
            Connecting Mongolian Talent with Global Opportunity
          </div>
        </div>
      </div>

      {/* Job card mockups */}
      <div className="rounded-2xl p-5" style={{ background: '#F0F6FF', border: '1px solid #E5E9F2' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: '#2563EB', textTransform: 'uppercase', marginBottom: 14 }}>Платформ UI — Ажлын Зар</div>
        <div className="space-y-3">
          {[
            { icon: '💻', title: 'Senior Software Engineer', co: 'MN Systems ХХК · УБ', tags: ['Full-time','Remote','IT'], sal: '3.5M–5M', badge: '🔥 Шинэ' },
            { icon: '📊', title: 'Marketing Manager',        co: 'Darkhan Steel · УБ',  tags: ['Full-time','Маркетинг'],  sal: '2M–3M' },
            { icon: '🏗',  title: 'Барилгын Инженер',        co: 'TB Plan ХХК · УБ',   tags: ['Full-time','Барилга'],    sal: '1.8M–2.5M', badge: '⭐ Онцлох' },
          ].map(j => (
            <div key={j.title} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: '1px solid #E5E9F2' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#F0F6FF' }}>{j.icon}</div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0A0F2E', marginBottom: 2 }}>{j.title}</div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 300 }}>{j.co}</div>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {j.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full" style={{ background: '#F0F6FF', color: '#2563EB', fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {j.badge && <div className="mb-1"><span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg,#1536C8,#38BDF8)', fontSize: 9 }}>{j.badge}</span></div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0F2E' }}>{j.sal}</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>₮ / сар</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 3, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>UI Элементүүд</div>
        <div className="flex gap-3 flex-wrap items-center">
          <button className="text-white font-semibold px-5 py-3 rounded-xl text-sm" style={{ background: 'linear-gradient(135deg,#1536C8,#2563EB)', border: 'none' }}>Ажил хайх</button>
          <button className="font-semibold px-5 py-3 rounded-xl text-sm" style={{ background: 'white', color: '#1536C8', border: '2px solid #1536C8' }}>CV оруулах</button>
          <button className="text-white font-semibold px-5 py-3 rounded-xl text-sm" style={{ background: '#0A0F2E', border: 'none' }}>Нэвтрэх</button>
          <button className="font-semibold px-5 py-2.5 rounded-xl text-sm" style={{ background: '#F0F6FF', color: '#1536C8', border: 'none' }}>Дэлгэрэнгүй</button>
        </div>

        <div className="flex gap-2 flex-wrap items-center pt-2">
          {[
            { bg: 'linear-gradient(135deg,#1536C8,#2563EB)', color: 'white', label: '💻 IT' },
            { bg: 'white', color: '#1536C8', label: '📊 Санхүү', border: '2px solid #1536C8' },
            { bg: '#F0F6FF', color: '#1536C8', label: '🎨 Дизайн' },
            { bg: '#0A0F2E', color: 'white', label: '🏗 Барилга' },
            { bg: 'linear-gradient(90deg,#1536C8,#38BDF8)', color: 'white', label: '⭐ Онцлох' },
          ].map(t => (
            <span key={t.label} className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: t.bg, color: t.color, border: t.border }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl p-6 text-center" style={{ background: '#0A0F2E' }}>
        <HaGaLogo width={44} light/>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 4, background: 'linear-gradient(90deg,#60A5FA,#67E8F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginTop: 10, marginBottom: 4 }}>HAGA</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontWeight: 300, marginBottom: 12 }}>"Монгол хүн бүрт ажлын боломж. Монгол компани бүрт зөв ажилтан."</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 3, textTransform: 'uppercase', lineHeight: 2 }}>
          HaGa = Haaga · Боломж · Өсөлт · Mongolia's Job Platform<br/>
          Brand Identity Guidelines · Version 2.0 · © 2025 HaGa Mongolia
        </div>
      </div>
    </div>
  );
}
