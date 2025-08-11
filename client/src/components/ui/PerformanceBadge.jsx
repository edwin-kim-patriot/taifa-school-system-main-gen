import styles from './PerformanceBadge.module.css';

export default function PerformanceBadge({ level = '' }) {
  const getBadgeClass = () => {
    const normalized = level.toUpperCase();

    if (normalized.includes('EXCEEDING')) return styles.exceeding;
    if (normalized.includes('MEETING')) return styles.meeting;
    if (normalized.includes('APPROACHING')) return styles.approaching;
    if (normalized.includes('BELOW')) return styles.below;

    return styles.default;
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass()}`}>
      {level || 'N/A'}
    </span>
  );
}
