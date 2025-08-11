// client/src/components/ui/ScoreInput.jsx
import styles from './ScoreInput.module.css';

const ScoreInput = ({ value, onChange }) => (
  <input
    type="number"
    min="0"
    max="100"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={styles.input}
  />
);

export default ScoreInput;
