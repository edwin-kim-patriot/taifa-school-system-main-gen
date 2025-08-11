//C:\taifa-school-system-main\client\src\components\layout\Sidebar.jsx

import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiBookOpen,
  FiFileText,
  FiSettings,
  FiEdit3,
  FiGrid,
  FiBarChart2,
} from "react-icons/fi"; // Added icon for performance analysis
import styles from "./Sidebar.module.css";

export default function Sidebar({ collapsed, setCollapsed }) {
  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
        {collapsed ? "☰" : "×"}
      </button>

      {!collapsed && (
        <>
          <h2 className={styles.logo}>Taifa School</h2>
          <nav>
            <ul>
              <li>
                <NavLink
                  to="/students"
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.navLink
                  }
                >
                  <FiUsers /> &nbsp; Students
                </NavLink>
              </li>

              <li>
                <span className={styles.sectionTitle}>Exams</span>
                <ul className={styles.submenu}>
                  <li>
                    <NavLink
                      to="/exams"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.navLink
                      }
                    >
                      <FiBookOpen /> &nbsp; Exams Manager
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/exams/entry"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.navLink
                      }
                    >
                      <FiEdit3 /> &nbsp; Results Entry
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li>
                <span className={styles.sectionTitle}>Reports</span>
                <ul className={styles.submenu}>
                  <li>
                    <NavLink
                      to="/reports"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.navLink
                      }
                    >
                      <FiFileText /> &nbsp; Report Forms
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/performance-analysis"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.navLink
                      }
                    >
                      <FiBarChart2 /> &nbsp; Performance Analysis
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li>
                <span className={styles.sectionTitle}>Settings</span>
                <ul className={styles.submenu}>
                  <li>
                    <NavLink
                      to="/settings"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.navLink
                      }
                    >
                      <FiSettings /> &nbsp; School Settings
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/settings/grading"
                      className={({ isActive }) =>
                        isActive ? styles.activeLink : styles.navLink
                      }
                    >
                      <FiGrid /> &nbsp; Grading Settings
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
