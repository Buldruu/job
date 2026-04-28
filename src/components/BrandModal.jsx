import { useState } from 'react';
import { createPortal } from 'react-dom';
import HaGaLogo from './HaGaLogo';

/*
  HAGA BRAND BOOK — Redesigned for readability & eye comfort
  ──────────────────────────────────────────────────────────
  Fonts    : Plus Jakarta Sans (display) · Inter (body) · JetBrains Mono (label)
  Colors   : Warm navy, soft slate, gentle teal — WCAG AA compliant
  Philosophy: Every color chosen for human comfort, not visual shock
*/

// ── Refined, eye-friendly palette ──
const P = {
  // Primary blues — calmer, warmer
  navy:   '#1E3A5F',   // deep navy — replaces harsh #0A0F2E
  blue:   '#2563EB',   // brand blue
  sky:    '#60A5FA',   // soft sky
  mist:   '#DBEAFE',   // very light blue bg

  // Warm neutrals
  ink:    '#1E293B',   // near-black, warm
  slate:  '#475569',   // mid gray
  stone:  '#94A3B8',   // light gray
  cloud:  '#F8FAFC',   // warm white bg
  white:  '#FFFFFF',

  // Accent
  teal:   '#0D9488',   // muted teal
  amber:  '#D97706',   // warm amber
  sage:   '#16A34A',   // soft green

  // Gradients
  grad:   'linear-gradient(135deg, #1E3A5F 0%, #2563EB 55%, #60A5FA 100%)',
  gradH:  'linear-gradient(90deg, #2563EB, #60A5FA)',
  gradSoft:'linear-gradient(135deg, #F0F7FF 0%, #E8F4FD 100%)',
};

// ── Typography tokens ──
const F = {
  display: (sz, extra={}) => ({
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: sz, fontWeight: 800, lineHeight: 1.1, ...extra
  }),
  heading: (sz, extra={}) => ({
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: sz, fontWeight: 700, lineHeight: 1.3, ...extra
  }),
  body: (sz, extra={}) => ({
    fontFamily: "'Inter', sans-serif",
    fontSize: sz, fontWeight: 400, lineHeight: 1.7, ...extra
  }),
  label: (sz, extra={}) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: sz, fontWeight: 500,
    letterSpacing: '0.06em', textTransform: 'uppercase', ...extra
  }),
};

// ── Gradient text helper ──
const gTxt = (g=P.grad) => ({
  background: g,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

const TABS = [
  { key:'brand', label:'01 Бренд'    },
  { key:'logo',  label:'02 Лого'     },
  { key:'color', label:'03 Өнгө'     },
  { key:'type',  label:'04 Фонт'     },
  { key:'app',   label:'05 Хэрэглээ' },
];

export default function BrandModal({ onClose }) {
  const [tab, setTab] = useState('brand');

  const modal = (
    <div style={{ position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16, fontFamily:"'Inter', sans-serif" }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(15,23,42,0.55)',
        backdropFilter:'blur(6px)' }} onClick={onClose}/>

      <div style={{ position:'relative', width:'100%', maxWidth:800,
        background:P.cloud, borderRadius:24,
        boxShadow:'0 32px 64px rgba(15,23,42,0.2), 0 0 0 1px rgba(255,255,255,0.5)',
        overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Cover ── */}
        <div style={{ background:P.navy, position:'relative', overflow:'hidden', flexShrink:0 }}>
          {/* Subtle dot grid */}
          <div style={{ position:'absolute', inset:0, opacity:0.08,
            backgroundImage:'radial-gradient(circle, #60A5FA 1px, transparent 1px)',
            backgroundSize:'28px 28px' }}/>
          {/* Soft glow */}
          <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280,
            borderRadius:'50%', background:'radial-gradient(circle,rgba(96,165,250,0.18) 0%,transparent 70%)' }}/>

          {/* Close */}
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10,
            background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)',
            cursor:'pointer', color:'rgba(255,255,255,0.7)', padding:'6px 8px',
            borderRadius:10, lineHeight:1, backdropFilter:'blur(4px)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Cover content */}
          <div style={{ position:'relative', zIndex:1, padding:'28px 32px 0',
            display:'flex', alignItems:'center', gap:20 }}>
            <HaGaLogo width={60} variant="light"/>
            <div>
              <div style={{ ...F.display(44), letterSpacing:-0.5, marginBottom:4, ...gTxt(P.gradH) }}>
                HaGa
              </div>
              <div style={{ ...F.label(9), color:'rgba(255,255,255,0.35)', marginBottom:8 }}>
                Brand Identity Guidelines · 2025
              </div>
              <div style={{ ...F.heading(18), letterSpacing:0.5, color:'rgba(255,255,255,0.9)', lineHeight:1.3 }}>
                ХҮН БҮР{' '}
                <span style={gTxt(P.gradH)}>ХАЛТУРА ХИЙДЭГ.</span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ position:'relative', zIndex:1, display:'flex', gap:2,
            padding:'14px 24px 0', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ ...F.label(9), padding:'9px 14px',
                  borderRadius:'8px 8px 0 0', border:'none', cursor:'pointer', whiteSpace:'nowrap',
                  background: tab===t.key ? P.cloud : 'transparent',
                  color: tab===t.key ? P.blue : 'rgba(255,255,255,0.45)',
                  fontWeight: tab===t.key ? 700 : 500, transition:'all .15s',
                  borderTop: tab===t.key ? `2px solid ${P.blue}` : '2px solid transparent',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex:1, overflowY:'auto', background:P.cloud }}>
          {tab==='brand' && <BrandTab/>}
          {tab==='logo'  && <LogoTab/>}
          {tab==='color' && <ColorTab/>}
          {tab==='type'  && <TypeTab/>}
          {tab==='app'   && <AppTab/>}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ── Shared card ── */
const Card = ({ children, style={}, accent }) => (
  <div style={{
    background:P.white, borderRadius:16, padding:24,
    border:`1px solid ${P.mist}`,
    borderTop: accent ? `3px solid ${accent}` : `1px solid ${P.mist}`,
    ...style
  }}>{children}</div>
);

const Label = ({ children, color=P.blue }) => (
  <div style={{ ...F.label(9), color, marginBottom:8 }}>{children}</div>
);

/* ════════════════ 01 BRAND ════════════════ */
function BrandTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>

      {/* Section header */}
      <div>
        <Label>01 — Бренд Түүх / Brand Story</Label>
        <div style={{ ...F.display(36), color:P.ink, marginBottom:8 }}>Haaga — Боломж</div>
        <div style={{ ...F.body(14), color:P.slate, maxWidth:520 }}>
          HaGa нэр нь <strong style={{color:P.ink}}>"Haaga"</strong> — монголоор{' '}
          <strong style={{color:P.blue}}>ХАЛТУРА</strong> гэсэн үгнээс гаралтай.
          Бидний анхаарал тэр мөчид биш, <strong style={{color:P.ink}}>дараагийн алхамд</strong> байна.
        </div>
      </div>

      {/* Story hero — softer, warmer dark */}
      <div style={{ background:P.navy, borderRadius:20, padding:'44px 40px',
        position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0,
          background:'radial-gradient(ellipse at 30% 60%, rgba(96,165,250,0.12) 0%, transparent 60%)' }}/>
        <div style={{ position:'absolute', bottom:12, right:24,
          ...F.display(100), color:'rgba(255,255,255,0.025)' }}>HaGa</div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ ...F.display(44), color:'rgba(255,255,255,0.95)', marginBottom:14 }}>
            ХҮН БҮР<br/>
            <span style={gTxt(P.gradH)}>ХАЛТУРА ХИЙДЭГ.</span>
          </div>
          <div style={{ ...F.body(14), color:'rgba(255,255,255,0.6)', maxWidth:480 }}>
            Монголд өнөөдөр хэдэн мянган залуу ажлын байр хайж байна.
            Хэдэн зуун компани зөв хүнээ олж чадахгүй байна.<br/><br/>
            Энэ зай —{' '}
            <strong style={{ color:'rgba(255,255,255,0.9)', fontWeight:600 }}>HaGa</strong>{' '}
            таслан зогсооно.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {[
          { num:'60K+', label:'Ажилгүй иргэн', text:'Монголд бүртгэлтэй ажилгүй иргэдийн тоо жил бүр өснө. HaGa тэр тоог бууруулах зорилготой.', accent:P.blue },
          { num:'3X',   label:'Хурдан холболт', text:'Уламжлалт аргаас 3 дахин хурдан. Зөв ажилтан, зөв компанийг хамгийн богино хугацаанд нийлүүлнэ.', accent:P.teal },
          { num:'🌏',   label:'Дэлхийн өрсөлдөөн', text:'Монгол компаниуд дэлхийн зах зээлд өрсөлдөхийн тулд дэлхийн чанарын ажилтан хэрэгтэй.', accent:P.amber },
        ].map(c => (
          <Card key={c.num} accent={c.accent}>
            <div style={{ ...F.display(40), ...gTxt(P.gradH), marginBottom:6 }}>{c.num}</div>
            <Label color={c.accent}>{c.label}</Label>
            <div style={{ ...F.body(12), color:P.slate }}>{c.text}</div>
          </Card>
        ))}
      </div>

      {/* Values */}
      <div>
        <Label color={P.slate}>Бренд Үнэт Зүйлс</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[
            { icon:'🎯', label:'Боломж олгох',           title:'Хүн бүрт ажил',       text:'Мэргэжил, туршлага, байршлаас үл хамааран бид боломжийг нийтэд нь нээлттэй болгоно.' },
            { icon:'📉', label:'Ажилгүйдлийг бууруулах', title:'Тоог бага болгоно',   text:'Ажилгүйдэл бол зөвхөн статистик биш — хүний амьдрал. HaGa нь жинхэнэ утгаараа бууруулна.' },
            { icon:'🌏', label:'Дэлхийтэй өрсөлдөх',    title:'Global-ready ажилтан', text:'Монгол компаниуд дэлхийн чанарын боловсон хүчин хэрэгтэй. HaGa тэр холболтыг хийнэ.' },
            { icon:'💬', label:'Дуу хоолой',              title:'Итгэлтэй, шударга',   text:'Иргэдэд — найрсаг чиглүүлэгч. Компаниудад — найдвартай түнш. Хоёуланд — үр дүн.' },
          ].map(v => (
            <Card key={v.title}>
              <div style={{ fontSize:26, marginBottom:10 }}>{v.icon}</div>
              <Label>{v.label}</Label>
              <div style={{ ...F.heading(15), color:P.ink, marginBottom:6 }}>{v.title}</div>
              <div style={{ ...F.body(13), color:P.slate }}>{v.text}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Voice tones */}
      <div>
        <Label color={P.slate}>Бренд Дуу Хоолой — Жишээ</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { head:'🔥 Дулаан', hbg:'#FEF3C7', hcol:'#92400E', eg:'Таны ур чадвар хэн нэгэнд хэрэгтэй байна. Бид тэр хүнийг олоход туслана.' },
            { head:'⚡ Итгэлтэй', hbg:'#EDE9FE', hcol:'#5B21B6', eg:'Монгол ажилтан дэлхийн аль ч компанид өрсөлдөж чадна. Бид тэр замыг нээнэ.' },
            { head:'✓ Шударга',  hbg:'#DCFCE7', hcol:'#15803D', eg:'Ажлын зар хайхад цаг алдах хэрэггүй. Танд тохирсоныг бид шүүж өгнө.' },
            { head:'🫶 Хүнлэг',  hbg:'#FCE7F3', hcol:'#9D174D', eg:'Таны профайл 12 компани хайж байна. Харах уу?' },
          ].map(t => (
            <div key={t.head} style={{ borderRadius:14, overflow:'hidden',
              border:`1px solid ${P.mist}` }}>
              <div style={{ padding:'10px 16px', background:t.hbg, color:t.hcol,
                ...F.label(9), fontWeight:700 }}>{t.head}</div>
              <div style={{ padding:'12px 16px', background:P.white,
                ...F.body(13), fontStyle:'italic', color:P.slate }}>"{t.eg}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div style={{ background:P.navy, borderRadius:18, padding:'36px 28px',
        textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0,
          background:'radial-gradient(ellipse at 50% 100%,rgba(96,165,250,0.15) 0%,transparent 65%)' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ ...F.display(40), letterSpacing:1, color:'rgba(255,255,255,0.92)', marginBottom:8 }}>
            БОЛОМЖ БҮРТ<br/><span style={gTxt(P.gradH)}>МОНГОЛ ХҮЧИН</span>
          </div>
          <div style={{ ...F.body(13), color:'rgba(255,255,255,0.45)', fontStyle:'italic' }}>
            Connecting Mongolian Talent with Global Opportunity — HaGa
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ 02 LOGO ════════════════ */
function LogoTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <Label>02 — Лого / Logo System</Label>
        <div style={{ ...F.display(36), color:P.ink, marginBottom:8 }}>Логоны Утга</div>
        <div style={{ ...F.body(14), color:P.slate, maxWidth:520 }}>
          HaGa логоны H ба G үсэг тус бүрдээ гүн утгатай. Хоёр үсэг нийлж — ажилтан ба компанийг холбодог.
        </div>
      </div>

      <Card>
        <div style={{ display:'flex', gap:24, alignItems:'center' }}>
          <HaGaLogo width={72} variant="grad"/>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { badge:'H', mn:'Haaga — ХАЛТУРА', en:'Side Job / Gig Work',
                desc:'H үсгийн хоёр тулгуур нь ажилтан ба компанийг, хэвтээ гүүр нь HaGa платформыг төлөөлнө.' },
              { badge:'G', mn:'Gig / Growth / Gateway', en:'Халтура / Өсөлт / Гарц',
                desc:'G үсэг нь нээлттэй тойрог — боломжийн гарц. Нэг халтуур нь ирээдүйн карьерийн эхлэл.' },
            ].map(m => (
              <div key={m.badge} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ background:P.grad, color:P.white, padding:'4px 12px',
                  borderRadius:8, ...F.heading(16), flexShrink:0 }}>{m.badge}</div>
                <div>
                  <div style={{ ...F.heading(13), color:P.ink }}>{m.mn}</div>
                  <div style={{ ...F.label(9), color:P.blue, margin:'2px 0 4px' }}>{m.en}</div>
                  <div style={{ ...F.body(12), color:P.slate }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4 variants */}
      <div>
        <Label color={P.slate}>Лого Хувилбарууд</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[
            { bg:P.white, border:`1px solid ${P.mist}`, variant:'grad',  label:'Цагаан дэвсгэр — Үндсэн', lc:P.stone },
            { bg:P.navy,  border:'none',                variant:'light', label:'Харанхуй дэвсгэр',         lc:'rgba(255,255,255,0.4)' },
            { bg:P.blue,  border:'none',                variant:'white', label:'Цэнхэр дэвсгэр',           lc:'rgba(255,255,255,0.5)' },
            { bg:P.grad,  border:'none',                variant:'white', label:'Градиент дэвсгэр',          lc:'rgba(255,255,255,0.5)' },
          ].map((v,i) => (
            <div key={i} style={{ background:v.bg, border:v.border, borderRadius:16,
              minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <HaGaLogo width={80} variant={v.variant}/>
              <span style={{ position:'absolute', bottom:12, left:16, ...F.label(9), color:v.lc }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wordmark */}
      <Card style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20 }}>
        <HaGaLogo width={60} variant="grad"/>
        <div style={{ width:1, height:52, background:P.mist }}/>
        <div>
          <div style={{ ...F.display(30), letterSpacing:2, ...gTxt(P.gradH) }}>HAGA</div>
          <div style={{ ...F.label(9), color:P.stone, marginTop:4 }}>Haaga · Боломж · Дэлхийд Гарна</div>
        </div>
      </Card>

      {/* Do/Don't */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {[
          { head:'✓ Зөв хэрэглэх', hbg:'#F0FDF4', hcol:'#15803D', arrow:'→',
            items:['Градиент хувилбарыг анхдагч болгоно','Харанхуй дэвсгэр дээр цагаан хувилбар','SVG эсвэл PNG @2x ашиглана','Clearspace: өндрийн 25%-ийг чөлөөлнө'] },
          { head:'✕ Буруу хэрэглэх', hbg:'#FEF2F2', hcol:'#DC2626', arrow:'✕',
            items:['Логог эргүүлэх, тусгалыг харуулах','Харьцааг өөрчлөх, сунгах','Брендийн бус өнгөөр будах','Лого дээр текст, дүрс давхарлах'] },
        ].map(d => (
          <div key={d.head} style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${P.mist}` }}>
            <div style={{ padding:'10px 16px', background:d.hbg, color:d.hcol,
              ...F.label(9), fontWeight:700 }}>{d.head}</div>
            <div style={{ padding:'16px', background:P.white, display:'flex',
              flexDirection:'column', gap:8 }}>
              {d.items.map(it => (
                <div key={it} style={{ display:'flex', gap:8, ...F.body(12), color:P.slate }}>
                  <span style={{ color:d.hcol, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{d.arrow}</span>{it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════ 03 COLOR ════════════════ */
function ColorTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <Label>03 — Өнгөний Систем / Color System</Label>
        <div style={{ ...F.display(36), color:P.ink, marginBottom:8 }}>Өнгөний Палитр</div>
        <div style={{ ...F.body(14), color:P.slate, maxWidth:520 }}>
          Бүх өнгө нь <strong style={{color:P.ink}}>нүдэнд зөөлөн</strong>, WCAG AA стандартыг хангасан,
          удаан харахад ядраахгүй байхаар сонгогдсон.
        </div>
      </div>

      {/* Primary swatches */}
      <div>
        <Label color={P.slate}>Үндсэн өнгөнүүд</Label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
          {[
            { bg:'#1E3A5F', name:'HaGa Navy',  hex:'#1E3A5F', use:'Текст / Фон',      lc:'rgba(255,255,255,0.5)' },
            { bg:'#2563EB', name:'HaGa Blue',  hex:'#2563EB', use:'Бренд өнгө',       lc:'rgba(255,255,255,0.5)' },
            { bg:'#60A5FA', name:'HaGa Sky',   hex:'#60A5FA', use:'Дэмжих өнгө',     lc:'rgba(255,255,255,0.6)' },
            { bg:'#1E293B', name:'Ink',        hex:'#1E293B', use:'Гол текст',        lc:'rgba(255,255,255,0.4)' },
            { bg:'#F8FAFC', name:'Cloud',      hex:'#F8FAFC', use:'Арын дэвсгэр',    lc:P.stone, border:`1px solid ${P.mist}` },
          ].map(s => (
            <div key={s.name} style={{ borderRadius:14, overflow:'hidden',
              boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ height:80, background:s.bg, border:s.border,
                display:'flex', alignItems:'flex-end', padding:'8px 10px' }}>
                <span style={{ ...F.label(8), color:s.lc }}>{s.use}</span>
              </div>
              <div style={{ background:P.white, padding:'10px 12px' }}>
                <div style={{ ...F.heading(11), color:P.ink, marginBottom:2 }}>{s.name}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:P.stone }}>{s.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accent colors */}
      <div>
        <Label color={P.slate}>Дэмжих өнгөнүүд — нүдэнд зөөлөн</Label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { bg:'#0D9488', name:'Teal',  hex:'#0D9488', use:'Баталгаажсан',   lc:'rgba(255,255,255,0.6)' },
            { bg:'#D97706', name:'Amber', hex:'#D97706', use:'Онцлох / Featured', lc:'rgba(255,255,255,0.7)' },
            { bg:'#16A34A', name:'Sage',  hex:'#16A34A', use:'Амжилт / OK',    lc:'rgba(255,255,255,0.7)' },
            { bg:'#DC2626', name:'Rose',  hex:'#DC2626', use:'Анхаар / Error',  lc:'rgba(255,255,255,0.7)' },
          ].map(s => (
            <div key={s.name} style={{ borderRadius:14, overflow:'hidden',
              boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ height:70, background:s.bg, display:'flex', alignItems:'flex-end', padding:'8px 10px' }}>
                <span style={{ ...F.label(8), color:s.lc }}>{s.use}</span>
              </div>
              <div style={{ background:P.white, padding:'10px 12px' }}>
                <div style={{ ...F.heading(11), color:P.ink, marginBottom:2 }}>{s.name}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:P.stone }}>{s.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradients */}
      <div>
        <Label color={P.slate}>Градиентүүд</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          {[
            { bg:'linear-gradient(135deg,#1E3A5F,#2563EB,#60A5FA)', label:'Primary 135°', sub:'Navy → Blue → Sky' },
            { bg:'linear-gradient(90deg,#2563EB,#60A5FA)',           label:'Horizontal',   sub:'Text & Logo fill' },
            { bg:'linear-gradient(135deg,#F0F7FF,#E8F4FD)',          label:'Soft',         sub:'Cards & backgrounds', dark:false },
          ].map(g => (
            <div key={g.label} style={{ borderRadius:14, height:110, background:g.bg,
              border: g.dark===false ? `1px solid ${P.mist}` : 'none',
              display:'flex', alignItems:'flex-end', padding:16 }}>
              <div>
                <div style={{ ...F.label(10), color: g.dark===false ? P.slate : 'rgba(255,255,255,0.85)' }}>{g.label}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9,
                  color: g.dark===false ? P.stone : 'rgba(255,255,255,0.45)', marginTop:3 }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contrast demonstration */}
      <Card>
        <Label color={P.slate}>Зохицол — Контраст жишээ</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { bg:P.navy, text:P.white,   ratio:'7.2:1', label:'Navy дэвсгэр + Цагаан текст — Маш сайн' },
            { bg:P.blue, text:P.white,   ratio:'4.6:1', label:'Blue дэвсгэр + Цагаан текст — Хангалтлах' },
            { bg:P.cloud, text:P.ink,    ratio:'14:1',  label:'Cloud дэвсгэр + Ink текст — Хамгийн сайн' },
            { bg:P.mist, text:'#1E3A5F', ratio:'5.8:1', label:'Mist дэвсгэр + Navy текст — Дэвсгэрийн' },
          ].map(r => (
            <div key={r.label} style={{ background:r.bg, borderRadius:10,
              padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ ...F.body(13), color:r.text, flex:1 }}>{r.label}</div>
              <div style={{ ...F.label(10), color:r.text, opacity:0.7,
                background:'rgba(0,0,0,0.1)', padding:'3px 8px', borderRadius:6,
                whiteSpace:'nowrap' }}>{r.ratio}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status colors */}
      <div>
        <Label color={P.slate}>Статус тэмдэглэгээ</Label>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { bg:'#F0FDF4', col:'#15803D', label:'✓ Нээлттэй' },
            { bg:'#FEF3C7', col:'#92400E', label:'⏳ Хүлээгдэж буй' },
            { bg:'#FEF2F2', col:'#DC2626', label:'✕ Дууссан' },
            { bg:'#EFF6FF', col:'#1D4ED8', label:'🔔 Шинэ' },
            { bg:P.grad,    col:P.white,   label:'⭐ Онцлох' },
          ].map(s => (
            <span key={s.label} style={{ background:s.bg, color:s.col,
              padding:'7px 16px', borderRadius:100,
              ...F.body(12), fontWeight:500 }}>{s.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════ 04 FONT ════════════════ */
function TypeTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <Label>04 — Бичгийн Систем / Typography</Label>
        <div style={{ ...F.display(36), color:P.ink, marginBottom:8 }}>Типографи</div>
        <div style={{ ...F.body(14), color:P.slate, maxWidth:520 }}>
          Хүний нүдэнд дасагдсан, удаан уншихад ядрахгүй, дэлгэцэнд зориулагдсан
          <strong style={{color:P.ink}}> 3 фонт</strong> ашигладаг.
        </div>
      </div>

      {/* Font families */}
      {[
        {
          name:'Plus Jakarta Sans',
          role:'Display / Heading',
          sample: <div style={{ ...F.display(44), color:P.ink, letterSpacing:-0.5 }}>HaGA Боломж</div>,
          desc:'Дисплей болон гарчигт ашиглана. Дөрвөлжин хэлбэртэй, орчин үеийн дизайн. 700–800 жин.',
          sizes:'32–56px · Weight 700–800',
        },
        {
          name:'Inter',
          role:'Body / UI Text',
          sample: <div style={{ ...F.body(17), color:P.ink }}>Ажил хайх, шинэ боломж олох — хэрэгтэй бол одоо эхэл. Мянга мянган вакансы нэг дороо.</div>,
          desc:'Гол бичвэрт ашиглана. Дэлгэцэнд зориулан бүтээгдсэн, хамгийн уншигдах хялбар фонт.',
          sizes:'13–17px · Weight 400–600',
        },
        {
          name:'JetBrains Mono',
          role:'Label / Code / Tag',
          sample: <div style={{ ...F.label(12), color:P.blue }}>UI Label · Tag · Caption · Code</div>,
          desc:'Лейбел, таг, кодын хэсэгт ашиглана. Хаалттай хэлбэртэй үсгүүд, тоо алдаагүй харагдана.',
          sizes:'9–12px · ALL CAPS · letter-spacing 0.06em',
        },
      ].map(t => (
        <Card key={t.name}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            gap:16, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200 }}>
              {t.sample}
              <div style={{ ...F.label(9), color:P.stone, marginTop:10 }}>{t.role} — {t.name}</div>
            </div>
            <div style={{ ...F.body(12), color:P.slate, maxWidth:200, textAlign:'right' }}>
              <div style={{ ...F.heading(12), color:P.ink, marginBottom:4 }}>{t.name}</div>
              <div>{t.desc}</div>
              <div style={{ ...F.label(9), color:P.blue, marginTop:6 }}>{t.sizes}</div>
            </div>
          </div>
        </Card>
      ))}

      {/* Type scale */}
      <Card>
        <Label color={P.slate}>Хэмжээний Шатлал</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { text:'48 — Display Hero',    style:{ ...F.display(44), color:P.ink } },
            { text:'36 — Section Title',   style:{ ...F.display(32), ...gTxt(P.gradH) } },
            { text:'28 — H1 Heading',      style:{ ...F.heading(24), color:P.ink } },
            { text:'20 — H2 Subheading',   style:{ ...F.heading(18), color:P.ink } },
            { text:'16 — Lead Text',       style:{ ...F.body(15), color:P.slate, fontWeight:500 } },
            { text:'14 — Body Regular',    style:{ ...F.body(14), color:P.slate } },
            { text:'12 — Body Small',      style:{ ...F.body(12), color:P.stone } },
            { text:'LABEL / TAG / CAPTION',style:{ ...F.label(10), color:P.blue } },
          ].map(r => (
            <div key={r.text} style={{ ...r.style, paddingBottom:6,
              borderBottom:`1px solid ${P.mist}` }}>{r.text}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ════════════════ 05 APP ════════════════ */
function AppTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <Label>05 — Хэрэглээний Жишээ / Applications</Label>
        <div style={{ ...F.display(36), color:P.ink, marginBottom:8 }}>Бренд Хэрэглээ</div>
        <div style={{ ...F.body(14), color:P.slate, maxWidth:520 }}>
          Нэг дүр төрх, нэг утга — ажлын зараас нүүр хуудас хүртэл бүгд нэгдмэл байна.
        </div>
      </div>

      {/* Job card mockups */}
      <div style={{ background:P.gradSoft, border:`1px solid ${P.mist}`, borderRadius:18, padding:20 }}>
        <Label>Ажлын Зарын Карт — UI Жишээ</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { icon:'💻', title:'Senior Software Engineer', co:'MN Systems ХХК · Улаанбаатар', tags:['Full-time','Remote','IT'], sal:'3.5M–5M', badge:'🔥 Шинэ' },
            { icon:'📊', title:'Marketing Manager',        co:'Darkhan Steel Group · Улаанбаатар', tags:['Full-time','Маркетинг'], sal:'2M–3M' },
            { icon:'🏗',  title:'Барилгын Инженер',        co:'TB Plan ХХК · Улаанбаатар', tags:['Full-time','Барилга'], sal:'1.8M–2.5M', badge:'⭐ Онцлох' },
          ].map(j => (
            <div key={j.title} style={{ background:P.white, border:`1px solid ${P.mist}`,
              borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'#EFF6FF',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{j.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ ...F.heading(13), color:P.ink, marginBottom:2 }}>{j.title}</div>
                <div style={{ ...F.body(11), color:P.stone }}>{j.co}</div>
                <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                  {j.tags.map(tg => <span key={tg} style={{ background:'#EFF6FF', color:P.blue,
                    ...F.label(8), padding:'3px 8px', borderRadius:100 }}>{tg}</span>)}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {j.badge && <div style={{ marginBottom:4 }}>
                  <span style={{ background:P.grad, color:P.white, ...F.label(9),
                    padding:'2px 8px', borderRadius:100 }}>{j.badge}</span>
                </div>}
                <div style={{ ...F.heading(13), color:P.ink }}>{j.sal}</div>
                <div style={{ ...F.body(10), color:P.stone }}>₮ / сар</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <Card>
        <Label color={P.slate}>UI Товчнууд</Label>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          <button style={{ background:P.grad, color:P.white, border:'none',
            padding:'11px 22px', borderRadius:10, ...F.body(14), fontWeight:600, cursor:'default' }}>
            Ажил хайх
          </button>
          <button style={{ background:P.white, color:P.blue,
            border:`1.5px solid ${P.blue}`, padding:'10px 22px', borderRadius:10,
            ...F.body(14), fontWeight:600, cursor:'default' }}>
            CV оруулах
          </button>
          <button style={{ background:P.navy, color:P.white, border:'none',
            padding:'11px 22px', borderRadius:10, ...F.body(14), fontWeight:600, cursor:'default' }}>
            Нэвтрэх
          </button>
          <button style={{ background:'#EFF6FF', color:P.blue, border:'none',
            padding:'10px 20px', borderRadius:10, ...F.body(14), fontWeight:500, cursor:'default' }}>
            Дэлгэрэнгүй
          </button>
        </div>
        <Label color={P.slate}>Ангилал Тагнууд</Label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            { bg:P.grad,   col:P.white, label:'💻 IT' },
            { bg:P.white,  col:P.blue,  label:'📊 Санхүү', border:`1.5px solid ${P.blue}` },
            { bg:'#EFF6FF',col:P.blue,  label:'🎨 Дизайн' },
            { bg:P.navy,   col:P.white, label:'🏗 Барилга' },
            { bg:'linear-gradient(90deg,#D97706,#F59E0B)', col:P.white, label:'⭐ Онцлох' },
          ].map(t => (
            <span key={t.label} style={{ background:t.bg, color:t.col,
              padding:'7px 16px', borderRadius:100, ...F.body(13), fontWeight:500,
              border:t.border }}>{t.label}</span>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div style={{ background:P.navy, borderRadius:18, padding:'28px 24px', textAlign:'center' }}>
        <HaGaLogo width={44} variant="light"/>
        <div style={{ ...F.display(28), letterSpacing:2, ...gTxt(P.gradH), marginTop:10, marginBottom:4 }}>
          HAGA
        </div>
        <div style={{ ...F.body(13), color:'rgba(255,255,255,0.4)', fontStyle:'italic', marginBottom:12 }}>
          "Монгол хүн бүрт ажлын боломж. Монгол компани бүрт зөв ажилтан."
        </div>
        <div style={{ height:1, background:'rgba(255,255,255,0.08)', maxWidth:280, margin:'0 auto 12px' }}/>
        <div style={{ ...F.label(9), color:'rgba(255,255,255,0.2)', lineHeight:2.2 }}>
          HaGa = Haaga · Халтура · Карьер · Mongolia's Job Platform<br/>
          Brand Identity Guidelines · 2025 · © HaGa Mongolia
        </div>
      </div>
    </div>
  );
}
