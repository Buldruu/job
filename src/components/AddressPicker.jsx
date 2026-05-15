import { useState, useRef, useEffect, useCallback } from 'react';

const C = {
  ch:'#1A2B4A', ch5:'#EEF1F6',
  pg:'#F7F2E9', sl:'#6B7280', sll:'#9CA3AF',
  hl:'#D9D2C2', hls:'#E8E2D2',
  pp:'#FFFFFF', ink:'#1F1F1F',
};

/* ── OpenStreetMap Nominatim — free, no API key ── */
async function searchNominatim(q) {
  const params = new URLSearchParams({
    q,
    format:          'json',
    addressdetails:  '1',
    limit:           '7',
    countrycodes:    'mn',          // Монгол улс
    'accept-language':'mn,en',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'HaGa-JobApp/1.0' },
  });
  if (!res.ok) throw new Error('Nominatim error');
  return res.json();
}

/* Format display name for Mongolia addresses */
function formatAddress(item) {
  const a = item.address || {};
  const parts = [];
  if (a.road || a.pedestrian)   parts.push(a.road || a.pedestrian);
  if (a.suburb || a.neighbourhood) parts.push(a.suburb || a.neighbourhood);
  if (a.city_district)          parts.push(a.city_district);
  if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
  if (parts.length === 0) {
    // Fallback: use display_name up to country
    return item.display_name.replace(', Монгол Улс', '').replace(', Mongolia', '');
  }
  return parts.join(', ');
}

function getIcon(type) {
  const icons = {
    amenity:    '🏢', building: '🏠', residential: '🏘️',
    shop:       '🛍️', office:   '🏛️', road: '🛣️',
    place:      '📍', school:   '🏫', hospital: '🏥',
  };
  return icons[type] || '📍';
}

export default function AddressPicker({ value, onChange, placeholder = 'Дүүрэг, хороо, гудамж...' }) {
  const [query,   setQuery]   = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
  const wrapRef  = useRef(null);
  const timerRef = useRef(null);
  const ctrlRef  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); return; }

    // Abort previous request
    if (ctrlRef.current) ctrlRef.current.abort();
    ctrlRef.current = new AbortController();

    setLoading(true);
    try {
      const data = await searchNominatim(q);
      setResults(data || []);
    } catch(e) {
      if (e.name !== 'AbortError') setResults([]);
    }
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelected(false);
    onChange({ address: q, lat: null, lng: null });
    clearTimeout(timerRef.current);
    if (q.length >= 2) {
      timerRef.current = setTimeout(() => doSearch(q), 400);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (item) => {
    const addr = formatAddress(item);
    setQuery(addr);
    setSelected(true);
    setResults([]);
    setFocused(false);
    onChange({
      address: addr,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
  };

  const clear = () => {
    setQuery('');
    setSelected(false);
    setResults([]);
    onChange({ address: '', lat: null, lng: null });
  };

  const showDropdown = focused && results.length > 0 && !selected;

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      {/* Input field */}
      <div style={{
        display:'flex', alignItems:'center',
        border:`1.5px solid ${focused ? C.ch : C.hl}`,
        borderRadius:8, background:C.pp,
        transition:'border-color .15s, box-shadow .15s',
        boxShadow: focused ? '0 0 0 3px rgba(26,43,74,0.08)' : 'none',
      }}>
        {/* Pin icon */}
        <div style={{ padding:'0 10px', color: selected ? C.ch : C.sl, flexShrink:0 }}>
          <svg style={{width:18,height:18,display:'block'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>

        <input
          value={query}
          onChange={handleChange}
          onFocus={()=>{ setFocused(true); if(query.length>=2 && !selected) doSearch(query); }}
          placeholder={placeholder}
          style={{
            flex:1, padding:'11px 8px 11px 0',
            border:'none', outline:'none',
            fontSize:14, color:C.ink, background:'transparent',
            fontFamily:"'Manrope',sans-serif",
          }}
        />

        {/* Spinner or clear */}
        {loading ? (
          <div style={{ padding:'0 10px' }}>
            <div style={{ width:14, height:14, border:`2px solid ${C.ch}`, borderTopColor:'transparent', borderRadius:'50%', animation:'addrSpin .6s linear infinite' }}/>
          </div>
        ) : query ? (
          <button type="button" onClick={clear}
            style={{ padding:'0 10px', background:'none', border:'none', cursor:'pointer', color:C.sll, fontSize:18, lineHeight:1, flexShrink:0 }}>
            ✕
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
          background:C.pp, border:`1px solid ${C.hl}`,
          borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.14)',
          zIndex:200, overflow:'hidden',
        }}>
          {results.map((item, i) => {
            const addr = formatAddress(item);
            return (
              <button key={item.place_id} type="button"
                onMouseDown={(e)=>{ e.preventDefault(); handleSelect(item); }}
                style={{
                  display:'flex', gap:10, alignItems:'flex-start',
                  padding:'11px 14px', width:'100%',
                  border:'none', background:'none', cursor:'pointer', textAlign:'left',
                  borderBottom: i < results.length-1 ? `1px solid ${C.hls}` : 'none',
                  transition:'background .1s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background=C.ch5}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                {/* Icon */}
                <div style={{ fontSize:18, flexShrink:0, marginTop:1 }}>
                  {getIcon(item.type || item.class)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:C.ink, fontWeight:500, lineHeight:1.35, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {addr}
                  </div>
                  {item.address?.city_district && (
                    <div style={{ fontSize:11, color:C.sl, marginTop:2 }}>
                      {[item.address?.city_district, item.address?.city || 'Улаанбаатар'].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* OSM credit */}
          <div style={{ padding:'6px 14px', background:C.pg, borderTop:`1px solid ${C.hls}`, display:'flex', alignItems:'center', gap:6 }}>
            <img src="https://www.openstreetmap.org/assets/osm_logo-d4d3e8d12bdf0bb3f53ed3b81e88fcf9.svg" alt="OSM" style={{width:14,height:14}} onError={e=>e.target.style.display='none'}/>
            <span style={{ fontSize:10, color:C.sll }}>© OpenStreetMap contributors</span>
          </div>
        </div>
      )}

      {/* No results */}
      {focused && !loading && query.length >= 2 && results.length === 0 && !selected && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:C.pp, border:`1px solid ${C.hl}`, borderRadius:12, padding:'14px', textAlign:'center', zIndex:200 }}>
          <div style={{ fontSize:13, color:C.sl }}>Хаяг олдсонгүй. Илүү дэлгэрэнгүй бичнэ үү.</div>
        </div>
      )}

      <style>{`@keyframes addrSpin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
