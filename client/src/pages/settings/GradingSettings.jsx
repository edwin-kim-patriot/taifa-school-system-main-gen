//C:\taifa-school-system-main\client\src\pages\settings\GradingSettings.jsx

import { useState, useEffect, useRef } from "react";
import {
  fetchGradingSettings,
  updateGradingSettings,
} from "../../api/settings";
import styles from "./GradingSettings.module.css";

const DEFAULT_SUBJECTS = [
  "English",
  "Kiswahili",
  "Mathematics",
  "Integrated Science",
  "CRE",
  "Social Studies",
  "Agriculture & Nutrition",
  "Pre-Technical Studies",
  "Creative Arts",
];

export default function GradingSettings() {
  const [settings, setSettings] = useState({
    subjects: DEFAULT_SUBJECTS,
    thresholds: {
      exceeding: 80,
      meeting: 60,
      approaching: 40,
      below: 0,
    },
    overallThresholds: {
      exceeding: 702,
      meeting: 450,
      approaching: 234,
      below: 0,
    },
  });

  const [error, setError] = useState(null);
  const [formValid, setFormValid] = useState(true);
  const lastInputRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchGradingSettings();
        if (data) {
          setSettings((prev) => ({
            subjects: data.subjects || DEFAULT_SUBJECTS,
            thresholds: data.thresholds || prev.thresholds,
            overallThresholds: data.overallThresholds || prev.overallThresholds,
          }));
        }
      } catch (err) {
        console.error("Error loading grading settings:", err);
        setError("Failed to load grading settings.");
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const subjects = settings.subjects.map((s) => s.trim()).filter(Boolean);
    const unique = new Set(subjects);
    setFormValid(subjects.length === unique.size);
  }, [settings.subjects]);

  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus();
    }
  }, [settings.subjects.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid) return;

    try {
      const cleanedSubjects = settings.subjects
        .map((s) => s.trim().replace(/"+/g, "").replace(/\s+/g, " "))
        .filter(Boolean);

      await updateGradingSettings({ ...settings, subjects: cleanedSubjects });
      alert("Grading settings saved!");
    } catch (err) {
      console.error("Saving failed:", err);
      setError("Failed to save grading settings.");
    }
  };

  const handleThresholdChange = (key, type, value) => {
    const numericValue = Math.max(0, Number(value));
    if (type === "subject") {
      setSettings((prev) => ({
        ...prev,
        thresholds: {
          ...prev.thresholds,
          [key]: numericValue,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        overallThresholds: {
          ...prev.overallThresholds,
          [key]: numericValue,
        },
      }));
    }
  };

  const handleSubjectChange = (index, value) => {
    const updatedSubjects = [...settings.subjects];
    updatedSubjects[index] = value;
    setSettings((prev) => ({
      ...prev,
      subjects: updatedSubjects,
    }));
  };

  const addSubject = () => {
    setSettings((prev) => ({
      ...prev,
      subjects: [...prev.subjects, ""],
    }));
  };

  const removeSubject = (index) => {
    const updatedSubjects = [...settings.subjects];
    updatedSubjects.splice(index, 1);
    setSettings((prev) => ({
      ...prev,
      subjects: updatedSubjects,
    }));
  };

  return (
    <div className={styles.container}>
      <h2>Grading Configuration</h2>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Subject Performance Thresholds (%)</h3>
        <div className={styles.thresholds}>
          {["exceeding", "meeting", "approaching", "below"].map((key) => (
            <div key={`threshold-${key}`} className={styles.thresholdGroup}>
              <label htmlFor={`subject-${key}`}>
                {`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } Expectation (≥)`}
              </label>
              <input
                id={`subject-${key}`}
                type="number"
                value={settings.thresholds?.[key] ?? ""}
                onChange={(e) =>
                  handleThresholdChange(key, "subject", e.target.value)
                }
                min="0"
                max="100"
              />
            </div>
          ))}
        </div>

        <h3>Overall Performance Thresholds (out of 900)</h3>
        <div className={styles.thresholds}>
          {["exceeding", "meeting", "approaching", "below"].map((key) => (
            <div key={`overall-${key}`} className={styles.thresholdGroup}>
              <label htmlFor={`overall-${key}`}>
                {`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } Expectation (≥)`}
              </label>
              <input
                id={`overall-${key}`}
                type="number"
                value={settings.overallThresholds?.[key] ?? ""}
                onChange={(e) =>
                  handleThresholdChange(key, "overall", e.target.value)
                }
                min="0"
                max="900"
              />
            </div>
          ))}
        </div>

        <h3>Subjects Configuration</h3>
        <div className={styles.subjectsList}>
          {settings.subjects?.map((subject, index) => (
            <div key={`subject-${index}`} className={styles.subjectItem}>
              <input
                type="text"
                ref={
                  index === settings.subjects.length - 1 ? lastInputRef : null
                }
                value={subject || ""}
                onChange={(e) => handleSubjectChange(index, e.target.value)}
                placeholder={`Subject ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeSubject(index)}
                aria-label={`Remove Subject ${subject}`}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSubject}
            className={styles.addSubjectButton}
          >
            + Add Subject
          </button>
        </div>

        {!formValid && (
          <p className={styles.warning}>
            Ensure subject names are unique and not empty.
          </p>
        )}

        <button
          type="submit"
          className={styles.saveButton}
          disabled={!formValid}
        >
          Save Grading Settings
        </button>
      </form>
    </div>
  );
}
