import { useState } from 'react';
import { createPortal } from 'react-dom';
import HaGaLogo from './HaGaLogo';

/* ── Design tokens ── */
const G  = 'linear-gradient(135deg,#1536C8 0%,#2563EB 50%,#38BDF8 100%)';
const GH = 'linear-gradient(90deg,#1536C8,#38BDF8)';
const D  = '#0A0F2E';
const N  = '#1536C8';
const BL = '#2563EB';
const SK = '#38BDF8';
const GR = '#6B7280';
const LG = '#E5E9F2';
const LT = '#F0F6FF';

const mono = { fontFamily: "'Space Mono',monospace", letterSpacing: 2, textTransform: 'uppercase' };
const bebas = (sz) => ({ fontFamily: "'Bebas Neue',sans-serif", fontSize: sz, lineHeight: 1 });
const gText = { background: G, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' };
const gTextH = { background: GH, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' };

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
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:"'DM Sans',sans-serif" }}>
      {/* Backdrop */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} onClick={onClose}/>

      {/* Modal */}
      <div style={{ position:'relative', width:'100%', maxWidth:780, background:'white', borderRadius:24, boxShadow:'0 24px 64px rgba(0,0,0,0.3)', overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ background:D, position:'relative', overflow:'hidden', flexShrink:0 }}>
          {/* Grid bg */}
          <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(37,99,235,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.07) 1px,transparent 1px)`, backgroundSize:'40px 40px' }}/>
          {/* Glow */}
          <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,.3) 0%,transparent 65%)' }}/>

          {/* Close btn */}
          <button onClick={onClose}
            style={{ position:'absolute', top:12, right:12, zIndex:10, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:6, borderRadius:8, lineHeight:1 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Cover content */}
          <div style={{ position:'relative', zIndex:1, padding:'28px 32px 0', display:'flex', alignItems:'center', gap:24 }}>
            <HaGaLogo width={64} variant="light"/>
            <div>
              <div style={{ ...bebas(56), letterSpacing:6, marginBottom:4, ...gText }}>HaGa</div>
              <div style={{ ...mono, fontSize:9, color:'rgba(255,255,255,.3)', marginBottom:10 }}>Brand Identity Guidelines · Version 2.0</div>
              <div style={{ ...bebas(26), letterSpacing:3, color:'white', lineHeight:1.1 }}>
                ХҮН БҮР <span style={gTextH}>ХАЛТУРА ХИЙДЭГ.</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ position:'relative', zIndex:1, display:'flex', gap:4, padding:'16px 24px 0', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  ...mono, fontSize:9, padding:'8px 14px',
                  borderRadius:'8px 8px 0 0', border:'none', cursor:'pointer', whiteSpace:'nowrap',
                  background: tab===t.key ? 'white' : 'rgba(255,255,255,0.08)',
                  color: tab===t.key ? N : 'rgba(255,255,255,0.4)',
                  fontWeight: tab===t.key ? 700 : 400,
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1, overflowY:'auto', background:'#F8FAFF' }}>
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

/* ───────────── 01 BRAND ───────────── */
function BrandTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      {/* Hero */}
      <div style={{ background:D, borderRadius:20, padding:'48px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%,rgba(37,99,235,.18) 0%,transparent 65%)' }}/>
        <div style={{ position:'absolute', bottom:8, right:24, opacity:.03, ...bebas(100), color:'white' }}>HaGa</div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ ...bebas(48), letterSpacing:2, color:'white', marginBottom:12 }}>
            ХҮН БҮР<br/><span style={gText}>ХАЛТУРА ХИЙДЭГ.</span>
          </div>
          <div style={{ fontSize:14, fontWeight:300, color:'rgba(255,255,255,.6)', lineHeight:2, maxWidth:480 }}>
            Монголд өнөөдөр хэдэн мянган залуу ажлын байр хайж байна. Хэдэн зуун компани зөв хүнээ олж чадахгүй байна.<br/><br/>
            Энэ зай — ажилтан ба ажил олгогчийн хоорондох зай — <strong style={{ color:'rgba(255,255,255,.9)', fontWeight:500 }}>HaGa</strong> таслан зогсооно.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {[
          { num:'60K+', label:'Ажилгүй иргэн', text:'Монголд бүртгэлтэй ажилгүй иргэдийн тоо жил бүр өснө. HaGa тэр тоог бууруулах зорилготой.' },
          { num:'3X', label:'Хурдан холболт', text:'Уламжлалт аргаас 3 дахин хурдан. Зөв ажилтан, зөв компанийг хамгийн богино хугацаанд нийлүүлнэ.' },
          { num:'🌏', label:'Дэлхийн өрсөлдөөн', text:'Монгол компаниуд дэлхийн зах зээлд өрсөлдөхийн тулд дэлхийн чанарын ажилтан хэрэгтэй.' },
        ].map(c => (
          <div key={c.num} style={{ background:'white', border:`1px solid ${LG}`, borderRadius:20, padding:'24px 20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:GH, borderRadius:'20px 20px 0 0' }}/>
            <div style={{ ...bebas(40), ...gText, marginBottom:6 }}>{c.num}</div>
            <div style={{ ...mono, fontSize:9, color:BL, marginBottom:8 }}>{c.label}</div>
            <div style={{ fontSize:12, fontWeight:300, color:'#374151', lineHeight:1.8 }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[
          { icon:'🎯', label:'Боломж олгох', title:'Хүн бүрт ажил', text:'Ажил хайж буй хүн бүрт тохирсон боломж олдох ёстой. Бид тэр боломжийг нийтэд нь нээлттэй болгоно.' },
          { icon:'📉', label:'Ажилгүйдлийг бууруулах', title:'Тоог бага болгоно', text:'Ажилгүйдэл бол зөвхөн статистик биш — хүний амьдрал. HaGa нь ажилгүй иргэдийн тоог бууруулах зорилготой.' },
          { icon:'🌏', label:'Дэлхийтэй өрсөлдөх', title:'Global-ready ажилтан', text:'Монгол компаниуд дэлхийн зах зээлд өрсөлдөхийн тулд дэлхийн чанарын боловсон хүчин хэрэгтэй.' },
          { icon:'💬', label:'Бренд Дуу Хоолой', title:'Итгэлтэй, шударга', text:'Иргэдэд — найрсаг чиглүүлэгч. Компаниудад — найдвартай түнш. Хоёуланд нь — үр дүн гаргадаг хэрэгсэл.' },
        ].map(v => (
          <div key={v.title} style={{ background:'white', border:`1px solid ${LG}`, borderRadius:20, padding:24 }}>
            <div style={{ fontSize:28, marginBottom:10 }}>{v.icon}</div>
            <div style={{ ...mono, fontSize:9, color:BL, marginBottom:6 }}>{v.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:D, marginBottom:6 }}>{v.title}</div>
            <div style={{ fontSize:13, fontWeight:300, color:'#374151', lineHeight:1.85 }}>{v.text}</div>
          </div>
        ))}
      </div>

      {/* Voice */}
      <div>
        <div style={{ ...mono, fontSize:10, color:GR, marginBottom:12 }}>Бренд Дуу Хоолой — Жишээ</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { head:'🔥 Дулаан', hbg:'#FEF3C7', hcol:'#92400E', eg:'Таны ур чадвар хэн нэгэнд хэрэгтэй байна. Бид тэр хүнийг олоход туслана.' },
            { head:'⚡ Итгэлтэй', hbg:'#EDE9FE', hcol:'#5B21B6', eg:'Монгол ажилтан дэлхийн аль ч компанид өрсөлдөж чадна. Бид тэр замыг нээнэ.' },
            { head:'✓ Шударга',  hbg:'#DCFCE7', hcol:'#15803D', eg:'Ажлын зар хайхад цаг алдах хэрэггүй. Танд тохирсоныг бид шүүж өгнө.' },
            { head:'🫶 Хүнлэг',  hbg:'#FCE7F3', hcol:'#9D174D', eg:'Таны профайл 12 компани хайж байна. Харах уу?' },
          ].map(t => (
            <div key={t.head} style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${LG}` }}>
              <div style={{ padding:'10px 16px', background:t.hbg, color:t.hcol, ...mono, fontSize:9, fontWeight:700 }}>{t.head}</div>
              <div style={{ padding:'12px 16px', background:'white', fontSize:13, fontStyle:'italic', color:'#374151', fontWeight:300, lineHeight:1.8 }}>"{t.eg}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div style={{ background:D, borderRadius:20, padding:'40px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%,rgba(37,99,235,.2) 0%,transparent 65%)' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ ...bebas(44), letterSpacing:3, color:'white', marginBottom:8 }}>
            БОЛОМЖ БҮРТ<br/><span style={gTextH}>МОНГОЛ ХҮЧИН</span>
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', fontWeight:300, fontStyle:'italic' }}>
            Connecting Mongolian Talent with Global Opportunity — HaGa
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── 02 LOGO ───────────── */
function LogoTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <div style={{ ...mono, fontSize:10, color:BL, marginBottom:6 }}>02 — Лого / Logo System</div>
        <div style={{ ...bebas(44), letterSpacing:2, color:D, marginBottom:10 }}>Логоны Утга</div>
        <div style={{ fontSize:14, color:GR, fontWeight:300, lineHeight:1.9, maxWidth:540 }}>
          HaGa логоны H ба G үсэг тус бүрдээ гүн утгатай. Хоёр үсэг нийлж нэг болдог нь — ажилтан ба компани хоёрыг нийлүүлж, хамтдаа өсдөг харилцааг дүрсэлнэ.
        </div>
      </div>

      {/* Letter meaning */}
      <div style={{ background:'white', border:`1px solid ${LG}`, borderRadius:20, padding:28, display:'flex', gap:28, alignItems:'center' }}>
        <HaGaLogo width={80} variant="grad"/>
        <div style={{ display:'flex', flexDirection:'column', gap:16, flex:1 }}>
          {[
            { badge:'H', mn:'Haaga — ХАЛТУРА', en:'Side Job / Gig Work', desc:'H үсгийн хоёр босоо тулгуур нь ажилтан ба ажил олгогчийг төлөөлнө. Хэвтээ гүүр нь HaGa платформ — тэднийг хамгийн богино замаар холбодог.' },
            { badge:'G', mn:'Gig / Growth / Gateway', en:'Халтура / Өсөлт / Гарц', desc:'G үсэг нь нээлттэй тойрог — боломжийн гарц. Нэг халтуур нь нээлттэй боломжийн эхлэл. HaGa тэр өргөн боломжийг нэг дороо нийлүүлнэ.' },
          ].map(m => (
            <div key={m.badge} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ background:G, color:'white', padding:'4px 12px', borderRadius:8, ...bebas(18), flexShrink:0 }}>{m.badge}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:D }}>{m.mn}</div>
                <div style={{ ...mono, fontSize:9, color:BL, marginBottom:3 }}>{m.en}</div>
                <div style={{ fontSize:12, fontWeight:300, color:GR, lineHeight:1.7 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
        {[
          { icon:'⚓', title:'H — Тулгуур', text:'Хоёр тулгуур нь ажилтан ба компанийг, гүүр нь HaGa платформыг төлөөлнө.' },
          { icon:'🌀', title:'Гадилдсан үсэг', text:'H ба G нийлж нэг нэгэндээ ороосон дизайн нь эрэлт+нийлүүлэлт салашгүй холбоотой.' },
          { icon:'↗', title:'Өнцгийн чиглэл', text:'Градиент тодрол нь зүүн доороос баруун дээш — өсөлт, ирээдүйг бэлгэддэг.' },
        ].map(s => (
          <div key={s.title} style={{ background:'white', border:`1px solid ${LG}`, borderRadius:16, padding:'24px 20px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{s.icon}</div>
            <div style={{ ...mono, fontSize:9, color:BL, marginBottom:8 }}>{s.title}</div>
            <div style={{ fontSize:12, fontWeight:300, color:'#374151', lineHeight:1.8 }}>{s.text}</div>
          </div>
        ))}
      </div>

      {/* 4 variants */}
      <div>
        <div style={{ ...mono, fontSize:10, color:GR, marginBottom:12 }}>Лого Хувилбарууд</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { bg:'white', border:`1px solid ${LG}`, variant:'grad',  label:'Цагаан дэвсгэр — Үндсэн', lc:GR },
            { bg:D, border:'none', variant:'light', label:'Харанхуй дэвсгэр', lc:'rgba(255,255,255,.4)' },
            { bg:BL, border:'none', variant:'white', label:'Цэнхэр дэвсгэр', lc:'rgba(255,255,255,.5)' },
            { bg:G, border:'none', variant:'white', label:'Градиент дэвсгэр', lc:'rgba(255,255,255,.5)' },
          ].map((v,i) => (
            <div key={i} style={{ background:v.bg, border:v.border, borderRadius:20, minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <HaGaLogo width={80} variant={v.variant}/>
              <span style={{ position:'absolute', bottom:12, left:16, ...mono, fontSize:9, color:v.lc }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ background:'white', border:`1px solid ${LG}`, borderRadius:20, padding:'32px 40px', display:'flex', alignItems:'center', justifyContent:'center', gap:24 }}>
        <HaGaLogo width={68} variant="grad"/>
        <div style={{ width:1, height:60, background:LG }}/>
        <div>
          <div style={{ ...bebas(36), letterSpacing:3, ...gText }}>HAGA</div>
          <div style={{ ...mono, fontSize:9, color:GR, marginTop:5 }}>Haaga · Боломж · Дэлхийд Гарна</div>
        </div>
      </div>

      {/* Do/Don't */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[
          { head:'✓ Зөв хэрэглэх', hbg:'#DCFCE7', hcol:'#15803D', arrow:'→', items:['Градиент хувилбарыг анхдагч болгоно','Харанхуй дэвсгэр дээр цагаан/хөх хувилбар','SVG эсвэл PNG @2x ашиглана','Clearspace: өндрийн 25%-ийг чөлөөлнө'] },
          { head:'✕ Буруу хэрэглэх', hbg:'#FEE2E2', hcol:'#DC2626', arrow:'✕', items:['Логог эргүүлэх, тусгалыг харуулах','Харьцааг өөрчлөх, сунгах','Брендийн бус өнгөөр дахин будах','Лого дээр текст, дүрс давхарлах'] },
        ].map(d => (
          <div key={d.head} style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${LG}` }}>
            <div style={{ padding:'10px 16px', background:d.hbg, color:d.hcol, ...mono, fontSize:9, fontWeight:700 }}>{d.head}</div>
            <div style={{ padding:'16px', background:'white', display:'flex', flexDirection:'column', gap:8 }}>
              {d.items.map(it => (
                <div key={it} style={{ display:'flex', gap:8, fontSize:12, color:'#374151', fontWeight:300 }}>
                  <span style={{ color:d.hcol, fontFamily:"'Space Mono',monospace", flexShrink:0 }}>{d.arrow}</span>{it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── 03 COLOR ───────────── */
function ColorTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <div style={{ ...mono, fontSize:10, color:BL, marginBottom:6 }}>03 — Өнгөний Систем / Color System</div>
        <div style={{ ...bebas(44), letterSpacing:2, color:D, marginBottom:10 }}>Өнгөний Палитр</div>
        <div style={{ fontSize:14, color:GR, fontWeight:300, lineHeight:1.9, maxWidth:540 }}>
          Цэнхэр өнгө нь итгэл, тогтвортой байдал, мэргэжлийн байдлыг дүрсэлнэ.
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        {[
          { bg:N,   role:'Primary', name:'HaGa Navy',  hex:'#1536C8', use:'Тулгуур өнгө',     lc:'rgba(255,255,255,.5)' },
          { bg:BL,  role:'Brand',   name:'HaGa Blue',  hex:'#2563EB', use:'Бренд өнгө',       lc:'rgba(255,255,255,.5)' },
          { bg:SK,  role:'Accent',  name:'HaGa Sky',   hex:'#38BDF8', use:'Дэмжих өнгө',     lc:'rgba(255,255,255,.6)' },
          { bg:D,   role:'Dark',    name:'HaGa Dark',  hex:'#0A0F2E', use:'Харанхуй / Текст', lc:'rgba(255,255,255,.4)' },
          { bg:LT,  role:'Light',   name:'HaGa Light', hex:'#F0F6FF', use:'Арын дэвсгэр',    lc:'#9CA3AF', border:`1px solid ${LG}` },
        ].map(s => (
          <div key={s.name} style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
            <div style={{ height:90, background:s.bg, border:s.border, display:'flex', alignItems:'flex-end', padding:'8px 10px' }}>
              <span style={{ ...mono, fontSize:8, color:s.lc }}>{s.role}</span>
            </div>
            <div style={{ background:'white', padding:'10px 12px' }}>
              <div style={{ fontWeight:700, fontSize:11, color:D, marginBottom:2 }}>{s.name}</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:GR }}>{s.hex}</div>
              <div style={{ fontSize:9, color:GR, marginTop:3, textTransform:'uppercase', letterSpacing:1 }}>{s.use}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ ...mono, fontSize:10, color:GR, marginBottom:12 }}>Градиентүүд</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          {[
            { bg:'linear-gradient(135deg,#1536C8,#2563EB,#38BDF8)', label:'Primary 135°',  sub:'#1536C8 → #38BDF8' },
            { bg:GH,                                                  label:'Horizontal 90°',sub:'Text & Logo fill' },
            { bg:'linear-gradient(180deg,#0A0F2E,#1536C8 60%,#2563EB)', label:'Dark Hero', sub:'Hero sections' },
          ].map(g => (
            <div key={g.label} style={{ borderRadius:16, height:120, background:g.bg, display:'flex', alignItems:'flex-end', padding:16 }}>
              <div>
                <div style={{ ...mono, fontSize:10, color:'rgba(255,255,255,.8)' }}>{g.label}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'rgba(255,255,255,.45)', marginTop:3 }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ ...mono, fontSize:10, color:GR, marginBottom:12 }}>Статус Тэмдэглэгээ</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { bg:'#DCFCE7', col:'#15803D', label:'✓ Нээлттэй' },
            { bg:'#FEF3C7', col:'#B45309', label:'⏳ Хүлээгдэж буй' },
            { bg:'#FEE2E2', col:'#DC2626', label:'✕ Дууссан' },
            { bg:'#EFF6FF', col:'#1D4ED8', label:'🔔 Шинэ' },
            { bg:G,         col:'white',   label:'⭐ Онцлох' },
          ].map(s => (
            <span key={s.label} style={{ background:s.bg, color:s.col, padding:'6px 14px', borderRadius:100, fontSize:12, fontWeight:600 }}>{s.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── 04 FONT ───────────── */
function TypeTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <div style={{ ...mono, fontSize:10, color:BL, marginBottom:6 }}>04 — Бичгийн Систем / Typography</div>
        <div style={{ ...bebas(44), letterSpacing:2, color:D, marginBottom:10 }}>Типографи</div>
        <div style={{ fontSize:14, color:GR, fontWeight:300, lineHeight:1.9, maxWidth:540 }}>
          Гурван фонтын гэр бүл — Bebas Neue хүч, DM Sans хүнлэг байдал, Space Mono нарийвчлалыг илэрхийлнэ.
        </div>
      </div>

      {[
        { sample:<div style={{ ...bebas(52), ...gText, letterSpacing:2 }}>HAAGA</div>, lbl:'Display / Hero — Bebas Neue', meta:'48–84px · Gradient' },
        { sample:<div style={{ fontSize:24, fontWeight:700, color:D }}>Таны карьерын дараагийн алхам эндээс</div>, lbl:'H1 — DM Sans Bold 700', meta:'28–36px · #0A0F2E' },
        { sample:<div style={{ fontSize:14, fontWeight:300, color:'#374151', lineHeight:1.85 }}>Ажил хайх, шинэ боломж олох — хэрэгтэй бол одоо эхэл. Мянга мянган вакансы нэг дороо.</div>, lbl:'Body — DM Sans Light 300', meta:'15–17px · Line-height 1.85' },
        { sample:<div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:BL, letterSpacing:3, textTransform:'uppercase' }}>UI Label · Tag · Caption</div>, lbl:'Label / UI — Space Mono', meta:'10–13px · ALL CAPS' },
      ].map(t => (
        <div key={t.lbl} style={{ background:'white', border:`1px solid ${LG}`, borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ flex:1 }}>
            {t.sample}
            <div style={{ ...mono, fontSize:9, color:'#9CA3AF', marginTop:8 }}>{t.lbl}</div>
          </div>
          <div style={{ ...mono, fontSize:9, color:GR, textAlign:'right', flexShrink:0, maxWidth:140, lineHeight:2 }}>{t.meta}</div>
        </div>
      ))}

      <div style={{ background:'white', border:`1px solid ${LG}`, borderRadius:16, padding:28 }}>
        <div style={{ ...mono, fontSize:10, color:'#9CA3AF', marginBottom:20 }}>Хэмжээний Шатлал</div>
        <div style={{ ...bebas(52), color:D, marginBottom:8 }}>72 — Hero / Cover</div>
        <div style={{ ...bebas(40), color:N, marginBottom:8 }}>48 — Section Title</div>
        <div style={{ fontWeight:700, fontSize:24, color:D, marginBottom:8 }}>32 — H1 Heading</div>
        <div style={{ fontWeight:700, fontSize:18, color:D, marginBottom:8 }}>22 — H2 Subheading</div>
        <div style={{ fontWeight:500, fontSize:15, color:'#374151', marginBottom:8 }}>17 — Lead / Emphasis</div>
        <div style={{ fontWeight:300, fontSize:13, color:'#374151', marginBottom:8 }}>15 — Body Regular</div>
        <div style={{ fontWeight:300, fontSize:11, color:GR, marginBottom:8 }}>13 — Body Small</div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:BL, letterSpacing:3, textTransform:'uppercase' }}>11 — Label / Tag</div>
      </div>
    </div>
  );
}

/* ───────────── 05 APP ───────────── */
function AppTab() {
  return (
    <div style={{ padding:32, display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <div style={{ ...mono, fontSize:10, color:BL, marginBottom:6 }}>05 — Хэрэглээний Жишээ / Applications</div>
        <div style={{ ...bebas(44), letterSpacing:2, color:D, marginBottom:10 }}>Бренд Хэрэглээ</div>
        <div style={{ fontSize:14, color:GR, fontWeight:300, lineHeight:1.9, maxWidth:540 }}>
          Боломж, өсөлт, холболт — энэ гурав бүх элементэд нийтлэг утга өгнө.
        </div>
      </div>

      {/* Job cards */}
      <div style={{ background:LT, border:`1px solid ${LG}`, borderRadius:20, padding:20 }}>
        <div style={{ ...mono, fontSize:9, color:BL, marginBottom:16 }}>Платформ UI — Ажлын Зарын Карт</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { icon:'💻', title:'Senior Software Engineer', co:'MN Systems ХХК · Улаанбаатар', tags:['Full-time','Remote','IT'], sal:'3.5M–5M', badge:'🔥 Шинэ' },
            { icon:'📊', title:'Marketing Manager',        co:'Darkhan Steel Group · Улаанбаатар', tags:['Full-time','Маркетинг'], sal:'2M–3M' },
            { icon:'🏗',  title:'Барилгын Инженер',        co:'TB Plan ХХК · Улаанбаатар', tags:['Full-time','Барилга'], sal:'1.8M–2.5M', badge:'⭐ Онцлох' },
          ].map(j => (
            <div key={j.title} style={{ background:'white', border:`1px solid ${LG}`, borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:LT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{j.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:D, marginBottom:2 }}>{j.title}</div>
                <div style={{ fontSize:12, color:GR, fontWeight:300 }}>{j.co}</div>
                <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                  {j.tags.map(tg => <span key={tg} style={{ background:LT, color:BL, fontFamily:"'Space Mono',monospace", fontSize:9, padding:'3px 8px', borderRadius:100, letterSpacing:1, textTransform:'uppercase' }}>{tg}</span>)}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {j.badge && <div style={{ marginBottom:4 }}><span style={{ background:G, color:'white', fontSize:9, padding:'2px 8px', borderRadius:100 }}>{j.badge}</span></div>}
                <div style={{ fontSize:14, fontWeight:700, color:D }}>{j.sal}</div>
                <div style={{ fontSize:10, color:GR }}>₮ / сар</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social banner */}
      <div style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,.12)' }}>
        <div style={{ background:'linear-gradient(135deg,#0A0F2E 0%,#1536C8 60%,#2563EB 100%)', padding:'40px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', minHeight:180 }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(56,189,248,.15) 0%,transparent 70%)' }}/>
          <div style={{ position:'relative', zIndex:1, maxWidth:320 }}>
            <div style={{ ...mono, fontSize:9, color:SK, marginBottom:10 }}>Боломж · Өсөлт · Холболт</div>
            <div style={{ ...bebas(36), color:'white', letterSpacing:2, marginBottom:8 }}>МОНГОЛ ХҮЧИН<br/>ДЭЛХИЙД ГАРНА</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', fontWeight:300, lineHeight:1.8 }}>Ажилгүйдлийг бууруулна. HaGa — халтураас карьер хүртэлх гүүр.</div>
          </div>
          <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
            <HaGaLogo width={90} variant="light"/>
            <div style={{ ...mono, fontSize:9, color:'rgba(255,255,255,.3)', marginTop:8 }}>haga.mn</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,.08)', padding:'8px 20px', textAlign:'center' }}>
          <span style={{ ...mono, fontSize:9, color:'rgba(255,255,255,.3)' }}>Facebook / LinkedIn Cover Banner</span>
        </div>
      </div>

      {/* UI elements */}
      <div style={{ background:'white', border:`1px solid ${LG}`, borderRadius:20, padding:24, display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ ...mono, fontSize:10, color:'#9CA3AF' }}>UI Элементүүд</div>
        <div>
          <div style={{ ...mono, fontSize:9, color:GR, marginBottom:12 }}>Товчнууд</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <button style={{ background:G, color:'white', border:'none', padding:'12px 22px', borderRadius:10, fontWeight:600, fontSize:14, cursor:'default' }}>Ажил хайх</button>
            <button style={{ background:'white', color:N, border:`2px solid ${N}`, padding:'10px 22px', borderRadius:10, fontWeight:600, fontSize:14, cursor:'default' }}>CV оруулах</button>
            <button style={{ background:D, color:'white', border:'none', padding:'12px 22px', borderRadius:10, fontWeight:600, fontSize:14, cursor:'default' }}>Нэвтрэх</button>
            <button style={{ background:LT, color:N, border:'none', padding:'10px 20px', borderRadius:10, fontWeight:500, fontSize:14, cursor:'default' }}>Дэлгэрэнгүй</button>
          </div>
        </div>
        <div>
          <div style={{ ...mono, fontSize:9, color:GR, marginBottom:12 }}>Ангилал Тагнууд</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            {[
              { bg:G, col:'white', label:'💻 IT' },
              { bg:'white', col:N, label:'📊 Санхүү', border:`2px solid ${N}` },
              { bg:LT, col:N, label:'🎨 Дизайн' },
              { bg:D, col:'white', label:'🏗 Барилга' },
              { bg:GH, col:'white', label:'⭐ Онцлох' },
            ].map(t => (
              <span key={t.label} style={{ background:t.bg, color:t.col, padding:'8px 16px', borderRadius:100, fontSize:13, fontWeight:500, border:t.border }}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background:D, borderRadius:20, padding:'32px 24px', textAlign:'center' }}>
        <HaGaLogo width={48} variant="light"/>
        <div style={{ ...bebas(30), letterSpacing:4, ...gText, marginTop:10, marginBottom:4 }}>HAGA</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.35)', fontStyle:'italic', fontWeight:300, marginBottom:12 }}>
          "Монгол хүн бүрт ажлын боломж. Монгол компани бүрт зөв ажилтан."
        </div>
        <div style={{ height:1, background:'rgba(255,255,255,.06)', maxWidth:280, margin:'0 auto 12px' }}/>
        <div style={{ ...mono, fontSize:9, color:'rgba(255,255,255,.18)', lineHeight:2.2 }}>
          HaGa = Haaga · Халтура · Карьер · Mongolia's Job Platform<br/>
          Brand Identity Guidelines · Version 2.0 · 2026 · © HaGa Mongolia
        </div>
      </div>
    </div>
  );
}
