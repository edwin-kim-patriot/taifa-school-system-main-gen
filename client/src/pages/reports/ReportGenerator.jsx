import { useState, useEffect, useRef } from "react";
import { fetchStudents } from "../../api/students";
import {
  fetchStudentsWithResults,
  generateReportPDF,
  generateCombinedGradePDF,
} from "../../api/reports";
import ReportTemplate from "./templates/ReportTemplate";
import styles from "./ReportGenerator.module.css";
import { useSchoolSettings } from "../../hooks/useSchoolSettings";
import { useTermExam } from "../../hooks/useTermExam";
import ProgressBar from "../../components/ui/ProgressBar";

export default function ReportGenerator() {
  const [grade, setGrade] = useState("");
  const [students, setStudents] = useState([]);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const reportRef = useRef();

  const { schoolName, logoUrl } = useSchoolSettings();
  const { term, examType } = useTermExam();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        if (!grade) return;
        setDownloadStatus(`Loading students for Grade ${grade}...`);
        setProgress(30);

        const data = await fetchStudents({ grade });
        data.sort((a, b) => a.name.localeCompare(b.name));
        setStudents(data);
        setSelectedStudent(null);
        setAdmissionNumber("");
        setError(null);

        setProgress(100);
        setTimeout(() => {
          setProgress(0);
          setDownloadStatus("");
        }, 500);
      } catch (err) {
        console.error("Failed to load students:", err);
        setError("❌ Failed to load students for this grade");
        setStudents([]);
        setProgress(0);
        setDownloadStatus("");
      }
    };

    loadStudents();
  }, [grade]);

  const handleSearch = async () => {
    if (!admissionNumber || !term || !examType) {
      setError("⚠️ Please provide admission number, term, and exam type.");
      return;
    }

    try {
      setDownloadStatus(`Loading report for student ${admissionNumber}...`);
      setProgress(30);

      const resultData = await fetchStudentsWithResults(admissionNumber, {
        term,
        examType,
      });

      if (Number(resultData.grade) !== Number(grade)) {
        setError("⚠️ This student does not belong to the selected grade.");
        setProgress(0);
        setDownloadStatus("");
        return;
      }

      if (
        !students.some((s) => s.admission_number === Number(admissionNumber))
      ) {
        setStudents((prev) => [...prev, resultData]);
      }

      setSelectedStudent({
        ...resultData,
        schoolName,
        logoUrl,
        term,
        examType,
      });
      setError(null);
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setDownloadStatus("");
      }, 500);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "❌ Failed to load report data");
      setProgress(0);
      setDownloadStatus("");
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudent || !term || !examType) return;
    if (!selectedStudent.admission_number) return;

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setDownloadStatus("Preparing report...");

    try {
      setProgress(30);
      setDownloadStatus("Generating PDF...");

      const { blob, filename } = await generateReportPDF(
        selectedStudent.admission_number,
        term,
        examType
      );

      setProgress(70);
      setDownloadStatus("Finalizing document...");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast(`✅ Report for ${selectedStudent.name} downloaded!`);
    } catch (err) {
      console.error("PDF download error:", err);
      setError(err.message || "❌ PDF generation failed");
    } finally {
      setIsGenerating(false);
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setDownloadStatus("");
      }, 1000);
    }
  };

  const handleDownloadCombinedPDF = async () => {
    if (!grade || !term || !examType) {
      setError("⚠️ Please select grade, term, and exam type.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setDownloadStatus(`Preparing Grade ${grade} reports...`);

    try {
      setProgress(10);
      setDownloadStatus(`Generating combined PDF for Grade ${grade}...`);

      const { blob, filename } = await generateCombinedGradePDF(
        grade,
        term,
        examType
      );

      setProgress(70);
      setDownloadStatus("Finalizing document...");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast(`✅ Combined report for Grade ${grade} downloaded!`);
    } catch (err) {
      console.error("Combined PDF download error:", err);
      setError(err.message || "❌ Combined PDF generation failed");
    } finally {
      setIsGenerating(false);
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setDownloadStatus("");
      }, 1000);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setAdmissionNumber(value);
    setSelectedIndex(-1);

    if (!value) {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      return;
    }

    const matches = students
      .filter((s) => s.admission_number.toString().startsWith(value))
      .slice(0, 5);

    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSuggestionClick = (admission_number) => {
    setAdmissionNumber(admission_number.toString());
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = filteredSuggestions[selectedIndex];
      if (selected) {
        handleSuggestionClick(selected.admission_number);
      }
    }
  };

  const highlightMatch = (admissionNumber, name, searchTerm) => {
    const admissionStr = admissionNumber.toString();
    const index = admissionStr.indexOf(searchTerm);

    if (index === -1) {
      return (
        <>
          <strong>{admissionStr}</strong> - {name}
        </>
      );
    }

    const before = admissionStr.slice(0, index);
    const match = admissionStr.slice(index, index + searchTerm.length);
    const after = admissionStr.slice(index + searchTerm.length);

    return (
      <>
        {before}
        <strong>{match}</strong>
        {after} - {name}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {(downloadStatus || progress > 0) && (
          <div className={styles.progressContainer}>
            <ProgressBar value={progress} max={100} />
            <div className={styles.downloadStatus}>
              {downloadStatus}
              {progress > 0 && <span> {Math.round(progress)}%</span>}
            </div>
          </div>
        )}

        <div className={styles.controlsRow}>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={styles.select}
            disabled={isGenerating}
          >
            <option value="">Select Grade</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
          </select>

          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Enter Admission Number"
              value={admissionNumber}
              onChange={handleInputChange}
              onFocus={() => {
                if (filteredSuggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onKeyDown={handleKeyDown}
              className={styles.input}
              disabled={isGenerating || !grade}
            />

            {showSuggestions && (
              <ul className={styles.suggestionList}>
                {filteredSuggestions.map((s, i) => (
                  <li
                    key={s.id}
                    className={`${styles.suggestionItem} ${
                      i === selectedIndex ? styles.active : ""
                    }`}
                    onMouseDown={() =>
                      handleSuggestionClick(s.admission_number)
                    }
                  >
                    {highlightMatch(
                      s.admission_number,
                      s.name,
                      admissionNumber
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={isGenerating || !grade}
            className={styles.button}
          >
            Search
          </button>
        </div>

        <div className={styles.controlsRow}>
          <button
            onClick={handleDownloadPDF}
            disabled={!selectedStudent || isGenerating}
            className={styles.button}
          >
            {isGenerating
              ? "Generating PDF..."
              : "Download Individual Report Form"}
          </button>

          <button
            onClick={handleDownloadCombinedPDF}
            disabled={!grade || isGenerating}
            className={styles.button}
          >
            {isGenerating
              ? "Generating PDF..."
              : `Download All Grade ${grade} Report Forms`}
          </button>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {error && <div className={styles.error}>{error}</div>}

      <div ref={reportRef} className={styles.reportContainer}>
        {selectedStudent ? (
          <ReportTemplate student={selectedStudent} />
        ) : (
          <p className={styles.placeholder}>
            {grade
              ? "Enter admission number and search to preview the report."
              : "Please select a grade first."}
          </p>
        )}
      </div>
    </div>
  );
}
