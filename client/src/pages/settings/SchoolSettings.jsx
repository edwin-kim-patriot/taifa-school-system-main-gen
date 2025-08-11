//C:\taifa-school-system-main\client\src\pages\settings\SchoolSettings.jsx

import { useEffect, useState } from 'react';
import { fetchSchoolSettings, updateSchoolSettings } from '../../api/settings';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';

import styles from './SchoolSettings.module.css';

export default function SchoolSettings() {
  const {
    schoolName,
    logoUrl,
    academicYear,
    setSchoolName,
    setLogoUrl,
    setAcademicYear
  } = useSchoolSettings();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  // For error handling

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchSchoolSettings();
        if (data) {
          setSchoolName(data.school_name);
          setLogoUrl(data.logo_url);
          setAcademicYear(data.academic_year);
        }
      } catch {
        setError('Failed to load school settings.');
      }
      setLoading(false);
    };
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSchoolSettings({
        schoolName,
        logoUrl,
        academicYear
      });
      alert('Settings saved successfully!');
    } catch {
      setError('Failed to save school settings.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>School Configuration</h2>

      {loading ? (
        <p>Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}  {/* Display error */}
          <div className={styles.formGroup}>
            <label>School Name:</label>
            <input
              type="text"
              value={schoolName || ''}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Logo URL:</label>
            <input
              type="url"
              value={logoUrl || ''}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl && logoUrl.trim() !== '' && (
              <div className={styles.logoPreview}>
                <img src={logoUrl} alt="School Logo Preview" height="80" />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Academic Year:</label>
            <input
              type="number"
              value={academicYear || ''}
              onChange={(e) => setAcademicYear(Number(e.target.value))}
              min="2000"
              max="2100"
              required
            />
          </div>

          <button type="submit" className={styles.saveButton} disabled={loading}>
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
}
