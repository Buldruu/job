import { useState } from 'react';

/* ── Shared SVG Logo ── */
const Logo = ({ width = 80, variant = 'grad' }) => {
  const id = `lg${width}${variant}`;
  const fills = {
    grad:  [['#1536C8', '0'], ['#2563EB', '.5'], ['#38BDF8', '1']],
    light: [['#60A5FA', '0'], ['#67E8F9', '1']],
    white: null,
  };
  const stops = fills[variant];
  return (
    <svg width={width} viewBox="0 0 240 170" fill="none">
      {stops && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="240" y2="170" gradientUnits="userSpaceOnUse">
            {stops.map(([c, o]) => <stop key={o} stopColor={c} offset={o}/>)}
          </linearGradient>
        </defs>
      )}
      {['rect x="10" y="20" width="28" height="130" rx="4"',
        'rect x="10" y="68" width="90" height="34" rx="4"',
        'rect x="72" y="20" width="28" height="130" rx="4"',
        'path d="M130 150C85 150 72 110 80 75C88 35 130 20 165 30C185 36 195 50 200 68H165C160 56 148 50 135 52C118 55 110 72 112 92C114 112 128 126 148 124C162 122 172 114 174 102H150V82H205V150H185V135C175 145 162 152 148 152L130 150Z"'
      ].map((el, i) => {
        const Tag = el.startsWith('path') ? 'path' : 'rect';
        const attrs = Object.fromEntries(
          el.replace(/^(rect|path) /, '').match(/(\w+)="([^"]*)"/g)
            ?.map(a => { const [k, v] = a.split('='); return [k, v.replace(/"/g, '')]; }) || []
        );
        return <Tag key={i} {...attrs} fill={stops ? `url(#${id})` : 'white'}/>;
      })}
    </svg>
  );
};

const grad = 'linear-gradient(135deg,#1536C8 0%,#2563EB 50%,#38BDF8 100%)';
const gradH = 'linear-gradient(90deg,#1536C8,#38BDF8)';
const dark = '#0A0F2E';
const navy = '#1536C8';
const blue = '#2563EB';
const sky  = '#38BDF8';
const gray = '#6B7280';
const lg   = '#E5E9F2';
const light = '#F0F6FF';

const monoSm = { fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' };
const bebas = (sz, extra={}) => ({ fontFamily: "'Bebas Neue',sans-serif", fontSize: sz, lineHeight: 1, ...extra });
const gradText = { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };
const gradTextH = { background: gradH, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };

export default function BrandModal({ onClose }) {
  const [tab, setTab] = useState('brand');

  const tabs = [
    { key: 'brand', label: '01 Бренд'  },
    { key: 'logo',  label: '02 Лого'   },
    { key: 'color', label: '03 Өнгө'   },
    { key: 'type',  label: '04 Фонт'   },
    { key: 'app',   label: '05 Хэрэглээ'},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '93vh' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Cover header ── */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ background: dark, minHeight: 220 }}>
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.07) 1px,transparent 1px)`,
            backgroundSize: '40px 40px'
          }}/>
          {/* Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle,rgba(37,99,235,.3) 0%,transparent 65%)' }}/>
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle,rgba(56,189,248,.15) 0%,transparent 65%)' }}/>

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/40 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Cover content */}
          <div className="relative z-10 px-10 py-7 flex items-center gap-8">
            {/* Icon box */}
            <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <Logo width={60} variant="grad"/>
            </div>

            <div>
              <div style={{ ...bebas(60), letterSpacing: 6, marginBottom: 4, ...gradText }}>HaGa</div>
              <div style={{ ...monoSm, fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
                Brand Identity Guidelines · Version 2.0
              </div>
              {/* Cover tagline */}
              <div style={{ ...bebas(28), letterSpacing: 3, color: 'white', lineHeight: 1.1 }}>
                ХҮН БҮР<br/>
                <span style={gradTextH}>ХАЛТУРА ХИЙДЭГ.</span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="relative z-10 flex gap-1 px-6 pb-0 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  ...monoSm, padding: '10px 14px',
                  borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: tab === t.key ? 'white' : 'rgba(255,255,255,0.08)',
                  color: tab === t.key ? navy : 'rgba(255,255,255,0.4)',
                  fontWeight: tab === t.key ? 700 : 400, transition: 'all .2s',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#F8FAFF' }}>
          {tab === 'brand' && <BrandTab/>}
          {tab === 'logo'  && <LogoTab/>}
          {tab === 'color' && <ColorTab/>}
          {tab === 'type'  && <TypeTab/>}
          {tab === 'app'   && <AppTab/>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ 01 BRAND ══════════════════ */
function BrandTab() {
  return (
    <div className="p-8 space-y-6">
      {/* Section header */}
      <div>
        <div style={{ ...monoSm, color: blue, marginBottom: 6 }}>01 — Бренд Түүх / Brand Story</div>
        <div style={{ ...bebas(44), letterSpacing: 2, color: dark, marginBottom: 10 }}>Haaga — Боломж</div>
        <div style={{ fontSize: 14, color: gray, fontWeight: 300, lineHeight: 1.9, maxWidth: 540 }}>
          HaGa нэр нь "Haaga" — монголоор <strong>ХАЛТУРА</strong> гэсэн үгнээс гаралтай. ХАЛТУРА бол хүн бүрийн амьдралд тохиолддог мөч — гэхдээ бидний анхаарал тэр мөчид биш, <strong>дараагийн алхамд</strong> байна.
        </div>
      </div>

      {/* Story hero */}
      <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: dark }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(37,99,235,.18) 0%,transparent 65%)' }}/>
        <div className="absolute bottom-4 right-6 opacity-[0.03]" style={{ ...bebas(120), color: 'white' }}>HaGa</div>
        <div className="relative z-10">
          <div style={{ ...bebas(52), letterSpacing: 2, color: 'white', marginBottom: 16 }}>
            ХҮН БҮР<br/>
            <span style={gradText}>ХАЛТУРА ХИЙДЭГ.</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,.6)', lineHeight: 2, maxWidth: 520 }}>
            Монголд өнөөдөр хэдэн мянган залуу ажлын байр хайж байна. Хэдэн зуун компани зөв хүнээ олж чадахгүй байна.<br/><br/>
            Энэ зай — ажилтан ба ажил олгогчийн хоорондох зай —{' '}
            <em style={{ color: 'rgba(255,255,255,.9)', fontStyle: 'normal', fontWeight: 500 }}>HaGa</em> таслан зогсооно.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { num: '60K+', label: 'Ажилгүй иргэн', text: 'Монголд бүртгэлтэй ажилгүй иргэдийн тоо жил бүр өснө. HaGa тэр тоог бууруулах зорилготой.' },
          { num: '3X',   label: 'Хурдан холболт', text: 'Уламжлалт аргаас 3 дахин хурдан. Зөв ажилтан, зөв компанийг хамгийн богино хугацаанд нийлүүлнэ.' },
          { num: '🌏',   label: 'Дэлхийн өрсөлдөөн', text: 'Монгол компаниуд дэлхийн зах зээлд өрсөлдөхийн тулд дэлхийн чанарын ажилтан хэрэгтэй. Бид тэр холболтыг хийнэ.' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 relative overflow-hidden" style={{ border: `1px solid ${lg}` }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: gradH }}/>
            <div style={{ ...bebas(44), ...gradText, marginBottom: 6 }}>{c.num}</div>
            <div style={{ ...monoSm, color: blue, marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 12, fontWeight: 300, color: '#374151', lineHeight: 1.8 }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div>
        <div style={{ ...monoSm, color: gray, marginBottom: 12 }}>Бренд Үнэт Зүйлс</div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🎯', label: 'Боломж олгох',          title: 'Хүн бүрт ажил',       text: 'Ажил хайж буй хүн бүрт тохирсон боломж олдох ёстой. Мэргэжил, туршлага, байршлаас үл хамааран бид тэр боломжийг нийтэд нь нээлттэй болгоно.' },
            { icon: '📉', label: 'Ажилгүйдлийг бууруулах',title: 'Тоог бага болгоно',    text: 'Ажилгүйдэл бол зөвхөн статистик биш — хүний амьдрал. HaGa нь ажилгүй иргэдийн тоог жинхэнэ утгаараа бууруулах зорилготой платформ.' },
            { icon: '🌏', label: 'Дэлхийтэй өрсөлдөх',    title: 'Global-ready ажилтан', text: 'Монгол компаниуд дэлхийн зах зээлд өрсөлдөхийн тулд дэлхийн чанарын боловсон хүчин хэрэгтэй. HaGa тэр боловсон хүчнийг олж, бэлтгэхэд туслана.' },
            { icon: '💬', label: 'Бренд Дуу Хоолой',       title: 'Итгэлтэй, шударга',    text: 'Мэргэжлийн боловч хүртээмжтэй. Иргэдэд — найрсаг чиглүүлэгч. Компаниудад — найдвартай түнш. Хоёуланд нь — үр дүн гаргадаг хэрэгсэл.' },
          ].map(v => (
            <div key={v.title} className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${lg}` }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
              <div style={{ ...monoSm, color: blue, marginBottom: 6 }}>{v.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: dark, marginBottom: 6 }}>{v.title}</div>
              <div style={{ fontSize: 13, fontWeight: 300, color: '#374151', lineHeight: 1.85 }}>{v.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice tones */}
      <div>
        <div style={{ ...monoSm, color: gray, marginBottom: 12 }}>Бренд Дуу Хоолой — Жишээ</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { head: '🔥 Дулаан / Empathetic', hbg: '#FEF3C7', hcol: '#92400E', eg: 'Таны ур чадвар хэн нэгэнд хэрэгтэй байна. Бид тэр хүнийг олоход туслана.' },
            { head: '⚡ Итгэлтэй / Bold',     hbg: '#EDE9FE', hcol: '#5B21B6', eg: 'Монгол ажилтан дэлхийн аль ч компанид өрсөлдөж чадна. Бид тэр замыг нээнэ.' },
            { head: '✓ Шударга / Honest',     hbg: '#DCFCE7', hcol: '#15803D', eg: 'Ажлын зар хайхад цаг алдах хэрэггүй. Танд тохирсоныг бид шүүж өгнө.' },
            { head: '🫶 Хүнлэг / Human',      hbg: '#FCE7F3', hcol: '#9D174D', eg: 'Таны профайл 12 компани хайж байна. Харах уу?' },
          ].map(t => (
            <div key={t.head} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${lg}` }}>
              <div className="px-4 py-2.5" style={{ background: t.hbg, color: t.hcol, ...monoSm, fontWeight: 700 }}>{t.head}</div>
              <div className="px-4 py-3 bg-white" style={{ fontSize: 13, fontStyle: 'italic', color: '#374151', fontWeight: 300, lineHeight: 1.8 }}>"{t.eg}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: dark }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(37,99,235,.2) 0%,transparent 65%)' }}/>
        <div className="relative z-10">
          <div style={{ ...bebas(52), letterSpacing: 3, color: 'white', marginBottom: 10 }}>
            БОЛОМЖ БҮРТ<br/><span style={gradTextH}>МОНГОЛ ХҮЧИН</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 300, fontStyle: 'italic' }}>
            Connecting Mongolian Talent with Global Opportunity — HaGa
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ 02 LOGO ══════════════════ */
function LogoTab() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <div style={{ ...monoSm, color: blue, marginBottom: 6 }}>02 — Лого / Logo System</div>
        <div style={{ ...bebas(44), letterSpacing: 2, color: dark, marginBottom: 10 }}>Логоны Утга</div>
        <div style={{ fontSize: 14, color: gray, fontWeight: 300, lineHeight: 1.9, maxWidth: 540 }}>
          HaGa логоны H ба G үсэг тус бүрдээ гүн утгатай. Хоёр үсэг нийлж нэг болдог нь — ажилтан ба компани хоёрыг нийлүүлж, хамтдаа өсдөг харилцааг дүрсэлнэ.
        </div>
      </div>

      {/* Letter meaning */}
      <div className="bg-white rounded-2xl p-6 flex items-center gap-8" style={{ border: `1px solid ${lg}` }}>
        <div style={{ ...bebas(96), ...gradText, letterSpacing: -2, flexShrink: 0 }}>HaGa</div>
        <div className="space-y-5 flex-1">
          {[
            { badge: 'H', mn: 'Haaga — ХАЛТУРА', en: 'Side Job / Gig Work',
              desc: 'H үсгийн хоёр босоо тулгуур нь ажилтан ба ажил олгогчийг төлөөлнө. Хэвтээ гүүр нь HaGa платформ — тэднийг хамгийн богино замаар, хамгийн зөв байдлаар холбодог.' },
            { badge: 'G', mn: 'Gig / Growth / Gateway', en: 'Халтура / Өсөлт / Гарц',
              desc: 'G үсэг нь нээлттэй тойрог — боломжийн гарц. Нэг халтуур нь нээлттэй боломжийн эхлэл. Growth буюу өсөлт, Gateway буюу гарц — HaGa тэр өргөн боломжийг нийтэд нь нэг дороо нийлүүлнэ.' },
          ].map(m => (
            <div key={m.badge} className="flex gap-3">
              <div className="flex-shrink-0 text-white font-bold px-3 py-1.5 rounded-lg"
                style={{ background: grad, ...bebas(20), letterSpacing: 1 }}>{m.badge}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark }}>{m.mn}</div>
                <div style={{ ...monoSm, color: blue, marginBottom: 3 }}>{m.en}</div>
                <div style={{ fontSize: 12, fontWeight: 300, color: gray, lineHeight: 1.7 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol meaning */}
      <div>
        <div style={{ ...monoSm, color: gray, marginBottom: 12 }}>Логоны Бүтцийн Утга</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '⚓', title: 'H — Тулгуур',      text: 'Хоёр босоо тулгуур нь ажилтан ба компанийг төлөөлнө. Хэвтээ гүүр нь тэднийг холбодог HaGa платформ.' },
            { icon: '🌀', title: 'Гадилдсан үсэг',   text: 'H ба G нийлж нэг нэгэндээ ороосон дизайн нь хоёр тал (эрэлт+нийлүүлэлт) салашгүй холбоотой гэдгийг илэрхийлнэ.' },
            { icon: '↗',  title: 'Өнцгийн чиглэл',   text: 'Градиент цэнхэрийн тод хэсгийн чиглэл нь зүүн доороос баруун дээш — өсөлт, хөгжил, ирээдүйн чиглэлийг бэлгэддэг.' },
          ].map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-5 text-center" style={{ border: `1px solid ${lg}` }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ ...monoSm, color: blue, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 12, fontWeight: 300, color: '#374151', lineHeight: 1.8 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 variants */}
      <div>
        <div style={{ ...monoSm, color: gray, marginBottom: 12 }}>Лого Хувилбарууд</div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { bg: '#fff',   border: `1px solid ${lg}`,  variant: 'grad',  label: 'Цагаан дэвсгэр — Үндсэн',  lblCol: gray },
            { bg: dark,     border: 'none',              variant: 'light', label: 'Харанхуй дэвсгэр',          lblCol: 'rgba(255,255,255,.4)' },
            { bg: blue,     border: 'none',              variant: 'white', label: 'Цэнхэр дэвсгэр',            lblCol: 'rgba(255,255,255,.5)' },
            { bg: grad,     border: 'none',              variant: 'white', label: 'Градиент дэвсгэр',           lblCol: 'rgba(255,255,255,.5)' },
          ].map((v, i) => (
            <div key={i} className="rounded-2xl overflow-hidden relative flex items-center justify-center"
              style={{ background: v.bg, border: v.border, minHeight: 160 }}>
              <Logo width={90} variant={v.variant}/>
              <span className="absolute bottom-3 left-4" style={{ ...monoSm, fontSize: 9, color: v.lblCol }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wordmark */}
      <div className="bg-white rounded-2xl p-8 flex items-center justify-center gap-6" style={{ border: `1px solid ${lg}` }}>
        <Logo width={68} variant="grad"/>
        <div style={{ width: 1, height: 60, background: lg }}/>
        <div>
          <div style={{ ...bebas(36), letterSpacing: 3, ...gradText }}>HAGA</div>
          <div style={{ ...monoSm, color: gray, marginTop: 5 }}>Haaga · Боломж · Дэлхийд Гарна</div>
        </div>
      </div>

      {/* Do/Don't */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { head: '✓ Зөв хэрэглэх',  hbg: '#DCFCE7', hcol: '#15803D', arrow: '→', items: ['Градиент хувилбарыг анхдагч болгоно','Харанхуй дэвсгэр дээр цагаан/хөх хувилбар','SVG эсвэл PNG @2x ашиглана','Clearspace: логоны өндрийн 25%-ийг чөлөөлнө'] },
          { head: '✕ Буруу хэрэглэх', hbg: '#FEE2E2', hcol: '#DC2626', arrow: '✕', items: ['Логог эргүүлэх, тусгалыг харуулах','Харьцааг өөрчлөх, сунгах','Брендийн бус өнгөөр дахин будах','Лого дээр текст, дүрс давхарлах'] },
        ].map(d => (
          <div key={d.head} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${lg}` }}>
            <div className="px-4 py-2.5" style={{ background: d.hbg, color: d.hcol, ...monoSm, fontWeight: 700 }}>{d.head}</div>
            <div className="p-4 bg-white space-y-2">
              {d.items.map(it => (
                <div key={it} className="flex gap-2" style={{ fontSize: 12, color: '#374151', fontWeight: 300 }}>
                  <span style={{ color: d.hcol, fontFamily: "'Space Mono',monospace", flexShrink: 0 }}>{d.arrow}</span>{it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════ 03 COLOR ══════════════════ */
function ColorTab() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <div style={{ ...monoSm, color: blue, marginBottom: 6 }}>03 — Өнгөний Систем / Color System</div>
        <div style={{ ...bebas(44), letterSpacing: 2, color: dark, marginBottom: 10 }}>Өнгөний Палитр</div>
        <div style={{ fontSize: 14, color: gray, fontWeight: 300, lineHeight: 1.9, maxWidth: 540 }}>
          Цэнхэр өнгө нь итгэл, тогтвортой байдал, мэргэжлийн байдлыг дүрсэлнэ — ажилтан ба ажил олгогчийн хооронд найдвартай гүүр болдог платформын зорилготой нийцдэг.
        </div>
      </div>

      {/* Swatches */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { bg: navy,  role: 'Primary', name: 'HaGa Navy',  hex: '#1536C8', use: 'Тулгуур өнгө',    lc: 'rgba(255,255,255,.5)' },
          { bg: blue,  role: 'Brand',   name: 'HaGa Blue',  hex: '#2563EB', use: 'Бренд өнгө',      lc: 'rgba(255,255,255,.5)' },
          { bg: sky,   role: 'Accent',  name: 'HaGa Sky',   hex: '#38BDF8', use: 'Дэмжих өнгө',    lc: 'rgba(255,255,255,.6)' },
          { bg: dark,  role: 'Dark',    name: 'HaGa Dark',  hex: '#0A0F2E', use: 'Харанхуй / Текст',lc: 'rgba(255,255,255,.4)' },
          { bg: light, role: 'Light',   name: 'HaGa Light', hex: '#F0F6FF', use: 'Арын дэвсгэр',    lc: '#9CA3AF', border: `1px solid ${lg}` },
        ].map(s => (
          <div key={s.name} className="rounded-2xl overflow-hidden shadow-md">
            <div style={{ height: 100, background: s.bg, border: s.border, display: 'flex', alignItems: 'flex-end', padding: '10px 12px' }}>
              <span style={{ ...monoSm, fontSize: 8, color: s.lc }}>{s.role}</span>
            </div>
            <div className="bg-white p-3">
              <div style={{ fontWeight: 700, fontSize: 11, color: dark, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: gray }}>{s.hex}</div>
              <div style={{ fontSize: 9, color: gray, marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{s.use}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradients */}
      <div>
        <div style={{ ...monoSm, color: gray, marginBottom: 12 }}>Градиентүүд</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { bg: 'linear-gradient(135deg,#1536C8,#2563EB,#38BDF8)', label: 'Primary 135°',  sub: '#1536C8 → #38BDF8' },
            { bg: 'linear-gradient(90deg,#1536C8,#38BDF8)',           label: 'Horizontal 90°', sub: 'Text & Logo fill' },
            { bg: 'linear-gradient(180deg,#0A0F2E,#1536C8 60%,#2563EB)', label: 'Dark Hero',  sub: 'Hero sections' },
          ].map(g => (
            <div key={g.label} className="rounded-2xl overflow-hidden" style={{ height: 140, background: g.bg, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
              <div>
                <div style={{ ...monoSm, color: 'rgba(255,255,255,.8)' }}>{g.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <div style={{ ...monoSm, color: gray, marginBottom: 12 }}>Статус Тэмдэглэгээ</div>
        <div className="flex gap-3 flex-wrap">
          {[
            { bg: '#DCFCE7', col: '#15803D', label: '✓ Нээлттэй' },
            { bg: '#FEF3C7', col: '#B45309', label: '⏳ Хүлээгдэж буй' },
            { bg: '#FEE2E2', col: '#DC2626', label: '✕ Дууссан' },
            { bg: '#EFF6FF', col: '#1D4ED8', label: '🔔 Шинэ' },
            { bg: grad,      col: 'white',   label: '⭐ Онцлох' },
          ].map(s => (
            <span key={s.label} className="px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: s.bg, color: s.col }}>{s.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ 04 TYPE ══════════════════ */
function TypeTab() {
  return (
    <div className="p-8 space-y-5">
      <div>
        <div style={{ ...monoSm, color: blue, marginBottom: 6 }}>04 — Бичгийн Систем / Typography</div>
        <div style={{ ...bebas(44), letterSpacing: 2, color: dark, marginBottom: 10 }}>Типографи</div>
        <div style={{ fontSize: 14, color: gray, fontWeight: 300, lineHeight: 1.9, maxWidth: 540 }}>
          Гурван фонтын гэр бүл — тус бүр өвөрмөц үүрэгтэй. Bebas Neue хүч, DM Sans хүнлэг байдал, Space Mono нарийвчлалыг илэрхийлнэ.
        </div>
      </div>

      {[
        { sample: <div style={{ ...bebas(56), ...gradText, letterSpacing: 2 }}>HAAGA</div>, lbl: 'Display / Hero — Bebas Neue', meta: 'Bebas Neue · Display · 48–84px · Gradient' },
        { sample: <div style={{ fontSize: 26, fontWeight: 700, color: dark }}>Таны карьерын дараагийн алхам эндээс</div>, lbl: 'H1 — DM Sans Bold', meta: 'DM Sans · Bold 700 · 28–36px · #0A0F2E' },
        { sample: <div style={{ fontSize: 14, fontWeight: 300, color: '#374151', lineHeight: 1.85 }}>Ажил хайх, шинэ боломж олох — хэрэгтэй бол одоо эхэл. Мянга мянган вакансы нэг дороо, хурдан, хялбар, үнэ төлбөргүй.</div>, lbl: 'Body — DM Sans Light 300', meta: 'DM Sans · Light 300 · 15–17px · Line-height 1.85' },
        { sample: <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: blue, letterSpacing: 3, textTransform: 'uppercase' }}>UI Label · Tag · Caption · Code</div>, lbl: 'Label / UI — Space Mono', meta: 'Space Mono · Regular · 10–13px · ALL CAPS' },
      ].map(t => (
        <div key={t.lbl} className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4" style={{ border: `1px solid ${lg}` }}>
          <div className="flex-1">{t.sample}
            <div style={{ ...monoSm, fontSize: 9, color: '#9CA3AF', marginTop: 8 }}>{t.lbl}</div>
          </div>
          <div style={{ ...monoSm, fontSize: 9, color: gray, textAlign: 'right', lineHeight: 2.2, flexShrink: 0, maxWidth: 160 }}>{t.meta}</div>
        </div>
      ))}

      {/* Type scale */}
      <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${lg}` }}>
        <div style={{ ...monoSm, color: '#9CA3AF', marginBottom: 20 }}>Хэмжээний Шатлал</div>
        <div style={{ ...bebas(56), color: dark, marginBottom: 8 }}>72 — Hero / Cover</div>
        <div style={{ ...bebas(40), color: navy, marginBottom: 8 }}>48 — Section Title</div>
        <div style={{ fontWeight: 700, fontSize: 24, color: dark, marginBottom: 8 }}>32 — H1 Heading</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: dark, marginBottom: 8 }}>22 — H2 Subheading</div>
        <div style={{ fontWeight: 500, fontSize: 15, color: '#374151', marginBottom: 8 }}>17 — Lead / Emphasis</div>
        <div style={{ fontWeight: 300, fontSize: 13, color: '#374151', marginBottom: 8 }}>15 — Body Regular</div>
        <div style={{ fontWeight: 300, fontSize: 11, color: gray, marginBottom: 8 }}>13 — Body Small / Secondary</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: blue, letterSpacing: 3, textTransform: 'uppercase' }}>11 — Label / Tag / Caption</div>
      </div>
    </div>
  );
}

/* ══════════════════ 05 APP ══════════════════ */
function AppTab() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <div style={{ ...monoSm, color: blue, marginBottom: 6 }}>05 — Хэрэглээний Жишээ / Applications</div>
        <div style={{ ...bebas(44), letterSpacing: 2, color: dark, marginBottom: 10 }}>Бренд Хэрэглээ</div>
        <div style={{ fontSize: 14, color: gray, fontWeight: 300, lineHeight: 1.9, maxWidth: 540 }}>
          Нэрийн хуудаснаас социал медиа хүртэл HaGa бренд нэг дүр төрхтэй, нэг утгатай байна. Боломж, өсөлт, холболт — энэ гурав бүх элементэд нийтлэг утга өгнө.
        </div>
      </div>

      {/* Job cards */}
      <div className="rounded-2xl p-5" style={{ background: light, border: `1px solid ${lg}` }}>
        <div style={{ ...monoSm, color: blue, marginBottom: 16 }}>Платформ UI — Ажлын Зарын Карт</div>
        <div className="space-y-3">
          {[
            { icon: '💻', title: 'Senior Software Engineer', co: 'MN Systems ХХК · Улаанбаатар', tags: ['Full-time','Remote боломжтой','IT'],     sal: '3.5M–5M', badge: '🔥 Шинэ' },
            { icon: '📊', title: 'Marketing Manager',        co: 'Darkhan Steel Group · Улаанбаатар', tags: ['Full-time','Маркетинг'],              sal: '2M–3M'   },
            { icon: '🏗',  title: 'Барилгын Инженер',        co: 'TB Plan ХХК · Улаанбаатар',         tags: ['Full-time','Барилга','Туршлага шаардлагагүй'], sal: '1.8M–2.5M', badge: '⭐ Онцлох' },
          ].map(j => (
            <div key={j.title} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: `1px solid ${lg}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: light }}>{j.icon}</div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14, fontWeight: 600, color: dark, marginBottom: 2 }}>{j.title}</div>
                <div style={{ fontSize: 12, color: gray, fontWeight: 300 }}>{j.co}</div>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {j.tags.map(tg => (
                    <span key={tg} className="px-2 py-0.5 rounded-full" style={{ background: light, color: blue, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>{tg}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {j.badge && <div className="mb-1"><span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold" style={{ background: grad, fontSize: 9 }}>{j.badge}</span></div>}
                <div style={{ fontSize: 14, fontWeight: 700, color: dark }}>{j.sal}</div>
                <div style={{ fontSize: 10, color: gray }}>₮ / сар</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social banner */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0A0F2E 0%,#1536C8 60%,#2563EB 100%)', minHeight: 200 }}>
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle,rgba(56,189,248,.15) 0%,transparent 70%)' }}/>
          <div className="relative z-10 max-w-xs">
            <div style={{ ...monoSm, color: sky, marginBottom: 12 }}>Боломж · Өсөлт · Холболт</div>
            <div style={{ ...bebas(40), color: 'white', letterSpacing: 2, marginBottom: 8 }}>МОНГОЛ ХҮЧИН<br/>ДЭЛХИЙД ГАРНА</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', fontWeight: 300, lineHeight: 1.8 }}>Ажилгүйдлийг бууруулна. Дэлхийтэй өрсөлдөх боловсон хүчин бүтээнэ — HaGa.</div>
          </div>
          <div className="relative z-10 text-center">
            <Logo width={100} variant="light"/>
            <div style={{ ...monoSm, fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 8 }}>haga.mn</div>
          </div>
        </div>
        <div className="px-5 py-2.5 text-center" style={{ background: 'rgba(255,255,255,.08)' }}>
          <span style={{ ...monoSm, fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Facebook / LinkedIn Cover Banner</span>
        </div>
      </div>

      {/* UI elements */}
      <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: `1px solid ${lg}` }}>
        <div style={{ ...monoSm, color: '#9CA3AF' }}>UI Элементүүд</div>
        <div>
          <div style={{ ...monoSm, fontSize: 9, color: gray, marginBottom: 12 }}>Товчнууд</div>
          <div className="flex gap-3 flex-wrap items-center">
            <button className="font-semibold text-white px-5 py-3 rounded-xl text-sm" style={{ background: grad, border: 'none' }}>Ажил хайх</button>
            <button className="font-semibold px-5 py-3 rounded-xl text-sm" style={{ background: 'white', color: navy, border: `2px solid ${navy}` }}>CV оруулах</button>
            <button className="font-semibold text-white px-5 py-3 rounded-xl text-sm" style={{ background: dark, border: 'none' }}>Нэвтрэх</button>
            <button className="font-semibold px-5 py-2.5 rounded-xl text-sm" style={{ background: light, color: navy, border: 'none' }}>Дэлгэрэнгүй</button>
          </div>
        </div>
        <div>
          <div style={{ ...monoSm, fontSize: 9, color: gray, marginBottom: 12 }}>Ангилал Тагнууд</div>
          <div className="flex gap-2 flex-wrap items-center">
            {[
              { bg: grad, col: 'white', label: '💻 IT' },
              { bg: 'white', col: navy, label: '📊 Санхүү', border: `2px solid ${navy}` },
              { bg: light, col: navy, label: '🎨 Дизайн' },
              { bg: dark, col: 'white', label: '🏗 Барилга' },
              { bg: gradH, col: 'white', label: '⭐ Онцлох' },
            ].map(t => (
              <span key={t.label} className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: t.bg, color: t.col, border: t.border }}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl p-7 text-center" style={{ background: dark }}>
        <Logo width={48} variant="light"/>
        <div style={{ ...bebas(32), letterSpacing: 4, ...gradText, marginTop: 10, marginBottom: 4 }}>HAGA</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', fontStyle: 'italic', fontWeight: 300, marginBottom: 12 }}>
          "Монгол хүн бүрт ажлын боломж. Монгол компани бүрт зөв ажилтан."
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,.06)', maxWidth: 320, margin: '0 auto 12px' }}/>
        <div style={{ ...monoSm, fontSize: 9, color: 'rgba(255,255,255,.18)', lineHeight: 2.2 }}>
          HaGa = Haaga · Боломж · Өсөлт · Mongolia's Job Platform<br/>
          Brand Identity Guidelines · Version 2.0 · 2026<br/>
          © HaGa Mongolia
        </div>
      </div>
    </div>
  );
}
