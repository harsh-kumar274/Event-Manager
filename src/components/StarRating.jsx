export default function StarRating({ value, max = 5, onChange, size = 20 }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {stars.map(star => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= value ? '#f59e0b' : 'none'}
          stroke={star <= value ? '#f59e0b' : 'var(--color-text-muted)'}
          strokeWidth="1.5"
          style={{ cursor: onChange ? 'pointer' : 'default', transition: 'all 0.15s' }}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={(e) => {
            if (!onChange) return;
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            if (!onChange) return;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}
