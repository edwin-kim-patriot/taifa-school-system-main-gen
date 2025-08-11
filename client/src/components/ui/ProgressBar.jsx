// C:\taifa-school-system-main\client\src\components\ui\ProgressBar.jsx

import styles from "./ProgressBar.module.css";

const ProgressBar = ({ value, max = 100 }) => {
  return (
    <div className={styles.progressContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
};

export default ProgressBar;
