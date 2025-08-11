//C:\taifa-school-system-main\client\src\components\layout\Navbar.jsx

import { useTermExam } from "../../hooks/useTermExam";
import { useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { term, examType, updateTerm, updateExamType } = useTermExam();
  const location = useLocation();

  // Function to get dynamic page title based on the current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/students":
        return "Students";
      case "/exams":
        return "Exams Manager";
      case "/exams/entry":
        return "Result Entry";
      case "/reports":
        return "Reports";
      case "/performance-analysis":
        return "Performance Analysis";
      case "/settings":
        return "School Settings";
      case "/settings/grading":
        return "Grading Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className={styles.navbar}>
      <h3>{getPageTitle()}</h3>
      <div className={styles.selectWrapper}>
        <label>
          Term:
          <select value={term} onChange={(e) => updateTerm(e.target.value)}>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </label>
        <label>
          Exam Type:
          <select
            value={examType}
            onChange={(e) => updateExamType(e.target.value)}
          >
            <option value="Opener">Opener</option>
            <option value="Midterm">Midterm</option>
            <option value="End Term">End Term</option>
          </select>
        </label>
      </div>
    </div>
  );
}
