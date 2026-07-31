export default function Spinner({ size = 'md', color = 'var(--color-primary-light)' }) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const s = sizes[size] || 24;
  return (
    <svg
      width={s} height={s}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
