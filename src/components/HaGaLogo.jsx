/* HaGa Logo — uses uploaded app icon */

export default function HaGaLogo({ width = 32, variant = 'default', className = '' }) {
  // variant: 'default' | 'light' | 'dark' | 'grad'
  // All variants use the same logo image (it already has the right colors)
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt="HaGa"
      width={width}
      height={width}
      className={className}
      style={{
        width,
        height: width,
        borderRadius: width * 0.22,  // match the rounded corner ratio
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain',
      }}
    />
  );
}
