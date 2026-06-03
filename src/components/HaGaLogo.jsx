import logoImg from '../assets/logo.png';

/**
 * HAGA Logo - uses the uploaded logo image
 */
export default function HaGaLogo({ width = 32, className = '' }) {
  return (
    <img
      src={logoImg}
      alt="HAGA"
      style={{
        width,
        height: width,
        borderRadius: Math.round(width * 0.22),
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain',
      }}
      className={className}
    />
  );
}
