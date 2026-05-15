import logoImg from '../assets/logo.png';

export default function HaGaLogo({ width = 32, variant = 'default', className = '' }) {
  return (
    <img
      src={logoImg}
      alt="HaGa"
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
