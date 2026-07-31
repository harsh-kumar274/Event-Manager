import styles from './Badge.module.css';

const categoryColors = {
  'Technology':   '#6366f1',
  'Music':        '#ec4899',
  'Sports':       '#10b981',
  'Workshop':     '#f59e0b',
  'Networking':   '#06b6d4',
  'Art & Culture':'#8b5cf6',
  'Food & Drink': '#f97316',
  'Business':     '#3b82f6',
};

export default function Badge({ label, variant = 'default', color }) {
  const bg = color || categoryColors[label];
  const style = bg
    ? { background: `${bg}22`, color: bg, borderColor: `${bg}44` }
    : {};

  return (
    <span className={[styles.badge, styles[variant]].join(' ')} style={style}>
      {label}
    </span>
  );
}
