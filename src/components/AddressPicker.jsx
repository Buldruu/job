import { useState, useEffect, useRef, useCallback } from 'react';

const C = {
  ch:'#5B3BFF', ch5:'#F5F3FF', pg:'#F5F7FF', pgd:'#EDE9FE',
  gd:'#FFB020', gdd:'#D97706', gd5:'#FEF3C7',
  sl:'#64748B', sll:'#94A3B8', hl:'#E2E8F0', hls:'#F1F5F9',
  pp:'#FFFFFF', ink:'#1E293B',
  vg:'#22C55E', vg5:'#DCFCE7', rd:'#EF4444', rd5:'#FEE2E2',
};

const GKEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

/* ── Load Google Maps script once ── */
let gmLoaded = false;
let gmLoading = false;
const gmCallbacks = [];

function loadGM() {
  return new Promise((res) => {
    if (gmLoaded && window.google?.maps?.places) { res(); return; }
    gmCallbacks.push(res);
    if (gmLoading) return;
    gmLoading = true;
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GKEY}&libraries=places&language=mn&region=MN`;
    s.async = true;
    s.onload = () => {
      gmLoaded = true; gmLoading = false;
      gmCallbacks.forEach(cb => cb());
      gmCallbacks.length = 0;
    };
    document.head.appendChild(s);
  });
}

/* ── Map preview (mini static map) ── */
function MapPreview({ lat, lng, address }) {
  if (!lat || !lng) return null;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x160&scale=2&markers=color:0x1A2B4A%7C${lat},${lng}&key=${GKEY}&style=element:geometry%7Ccolor:0xf5f0e8&style=element:labels.text.fill%7Ccolor:0x1A2B4A&style=feature:road%7Celement:geometry%7Ccolor:0xffffff`;
  return (
    <div style={{ marginTop:8, borderRadius:10, overflow:'hidden', border:`1px solid ${C.hl}`, position:'relative' }}>
      <img
        src={mapUrl}
        alt="Газрын зураг"
        style={{ width:'100%', height:140, objectFit:'cover', display:'block' }}
        onError={e => e.target.parentElement.style.display='none'}
      />
      {/* Address overlay */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(26,43,74,0.85)', padding:'8px 12px', backdropFilter:'blur(4px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <svg style={{width:12,height:12,color:'#FFB020',flexShrink:0}} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span style={{ fontSize:11, color:'#F7F2E9', lineHeight:1.3 }}>{address}</span>
        </div>
      </div>
      {/* Open in Google Maps */}
      <a
        href={`https://maps.google.com/?q=${lat},${lng}`}
        target="_blank" rel="noopener noreferrer"
        style={{ position:'absolute', top:6, right:6, background:'rgba(255,255,255,0.9)', borderRadius:6, padding:'4px 8px', fontSize:10, color:C.ch, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
        <svg style={{width:10,height:10}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Google Maps
      </a>
    </div>
  );
}

/* ── Main AddressPicker ── */
export default function AddressPicker({ value, onChange, placeholder = 'Хаяг хайх...' }) {
  const [query,    setQuery]    = useState(value || '');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [ready,    setReady]    = useState(false);
  const [focused,  setFocused]  = useState(false);
  const [selData,  setSelData]  = useState(null); // { address, lat, lng }
  const svcRef   = useRef(null);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  // Load Google Maps
  useEffect(() => {
    if (!GKEY) return;
    loadGM().then(() => {
      svcRef.current = new window.google.maps.places.AutocompleteService();
      setReady(true);
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
        setResults([]);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = useCallback((q) => {
    if (!ready || !svcRef.current || q.length < 2) { setResults([]); return; }
    setLoading(true);
    svcRef.current.getPlacePredictions(
      {
        input: q,
        componentRestrictions: { country: 'mn' },
        types: ['geocode', 'establishment'],
      },
      (preds, status) => {
        setLoading(false);
        const ok = window.google.maps.places.PlacesServiceStatus.OK;
        setResults(status === ok && preds ? preds : []);
      }
    );
  }, [ready]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelData(null);
    onChange({ address: q, lat: null, lng: null });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 350);
  };

  const handleSelect = (pred) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: pred.place_id }, (res, status) => {
      if (status === 'OK' && res[0]) {
        const loc = res[0].geometry.location;
        const addr = pred.description
          .replace(', Монгол Улс', '')
          .replace(', Mongolia', '');
        const data = { address: addr, lat: loc.lat(), lng: loc.lng() };
        setQuery(addr);
        setSelData(data);
        onChange(data);
      } else {
        const addr = pred.description;
        setQuery(addr);
        onChange({ address: addr, lat: null, lng: null });
      }
    });
    setResults([]);
    setFocused(false);
  };

  const clear = () => {
    setQuery('');
    setSelData(null);
    setResults([]);
    onChange({ address: '', lat: null, lng: null });
  };

  const showDrop = focused && results.length > 0;

  return (
    <div ref={wrapRef}>
      {/* Input */}
      <div style={{
        display:'flex', alignItems:'center',
        border:`1.5px solid ${focused ? C.ch : C.hl}`,
        borderRadius:8, background:C.pp,
        boxShadow: focused ? '0 0 0 3px rgba(26,43,74,0.08)' : 'none',
        transition:'all .15s',
      }}>
        <div style={{ padding:'0 10px', color: selData ? C.ch : C.sl, flexShrink:0 }}>
          <svg style={{width:18,height:18,display:'block'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <input
          value={query}
          onChange={handleChange}
          onFocus={()=>{ setFocused(true); if(query.length>=2 && !selData) search(query); }}
          placeholder={!GKEY ? 'API key байхгүй' : placeholder}
          style={{ flex:1, padding:'11px 8px 11px 0', border:'none', outline:'none', fontSize:14, color:C.ink, background:'transparent', fontFamily:"'Manrope',sans-serif" }}
        />
        {loading && (
          <div style={{ padding:'0 10px' }}>
            <div style={{ width:14,height:14,border:`2px solid ${C.ch}`,borderTopColor:'transparent',borderRadius:'50%',animation:'gmSpin .6s linear infinite' }}/>
          </div>
        )}
        {query && !loading && (
          <button type="button" onClick={clear}
            style={{ padding:'0 12px', background:'none',border:'none',cursor:'pointer',color:C.sll,fontSize:16,flexShrink:0 }}>✕</button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDrop && (
        <div style={{ position:'relative', zIndex:300 }}>
          <div style={{
            position:'absolute', top:4, left:0, right:0,
            background:C.pp, border:`1px solid ${C.hl}`,
            borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
            overflow:'hidden',
          }}>
            {results.map((pred, i) => {
              const main = pred.structured_formatting?.main_text || pred.description;
              const sec  = pred.structured_formatting?.secondary_text || '';
              return (
                <button key={pred.place_id} type="button"
                  onMouseDown={(e)=>{ e.preventDefault(); handleSelect(pred); }}
                  style={{
                    display:'flex', gap:10, alignItems:'flex-start',
                    padding:'11px 14px', width:'100%',
                    border:'none', background:'none', cursor:'pointer', textAlign:'left',
                    borderBottom: i < results.length-1 ? `1px solid ${C.hls}` : 'none',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.ch5}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <svg style={{width:16,height:16,color:C.sl,flexShrink:0,marginTop:2}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <div style={{ fontSize:13, color:C.ink, fontWeight:500, lineHeight:1.35 }}>{main}</div>
                    {sec && <div style={{ fontSize:11, color:C.sl, marginTop:2 }}>{sec.replace(', Монгол Улс','').replace(', Mongolia','')}</div>}
                  </div>
                </button>
              );
            })}
            {/* Powered by Google */}
            <div style={{ padding:'6px 14px 8px', background:'#fafafa', borderTop:`1px solid ${C.hls}`, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}>
              <span style={{ fontSize:10, color:C.sll }}>Powered by</span>
              <svg style={{height:10}} viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/>
                <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                <path fill="#4285F4" d="M35.29 41.41V32h31.37c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 35.28.36 16.67 16.32 1.21 34.96 1.21c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.96-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.16.27z"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* No results */}
      {focused && !loading && query.length >= 2 && results.length === 0 && !selData && (
        <div style={{ marginTop:4, padding:'10px 14px', background:C.pp, border:`1px solid ${C.hl}`, borderRadius:10, fontSize:12, color:C.sl }}>
          Хаяг олдсонгүй. Илүү дэлгэрэнгүй бичнэ үү.
        </div>
      )}

      {/* Map preview after selection */}
      {selData?.lat && <MapPreview lat={selData.lat} lng={selData.lng} address={selData.address}/>}

      <style>{`@keyframes gmSpin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
