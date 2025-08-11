import { useState, useEffect, useRef } from "react";
import ScoreInput from "../../components/ui/ScoreInput";
import { fetchStudentsByGrade } from "../../api/students";
import { submitScores } from "../../api/exams";
import { useTermExam } from "../../hooks/useTermExam";
import { useSchoolSettings } from "../../hooks/useSchoolSettings";
import { fetchSubjects } from "../../api/subjects";
import * as XLSX from "xlsx";
import styles from "./ResultEntry.module.css";

export default function ResultEntry() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [scores, setScores] = useState({});
  const [grade, setGrade] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);

  const { term, examType } = useTermExam();
  const { academicYear } = useSchoolSettings();

  const loadStudentsAndSubjects = async (selectedGrade) => {
    try {
      setStatusMessage("⏳ Loading students and subjects...");
      const [studentData, subjectList] = await Promise.all([
        fetchStudentsByGrade(selectedGrade),
        fetchSubjects(),
      ]);

      const sortedStudents = studentData.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      const initialScores = {};
      sortedStudents.forEach((student) => {
        initialScores[student.id] = {};
        subjectList.forEach((subject) => {
          initialScores[student.id][subject.id] = "";
        });
      });

      setStudents(sortedStudents);
      setSubjects(subjectList);
      setScores(initialScores);
      setStatusMessage("");
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Error loading student or subject data.");
    }
  };

  useEffect(() => {
    if (grade) {
      loadStudentsAndSubjects(grade);
    } else {
      setStudents([]);
      setScores({});
      setStatusMessage("");
    }
  }, [grade]);

  const handleScoreChange = (studentId, subjectId, value) => {
    const numeric = parseInt(value);
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: isNaN(numeric) ? "" : numeric,
      },
    }));
  };

  const hasValidScores = Object.values(scores).some((studentScores) =>
    Object.values(studentScores).some(
      (score) => typeof score === "number" && !isNaN(score)
    )
  );

  const handleSubmit = async () => {
    if (!grade || !term || !examType || !academicYear) {
      setStatusMessage(
        "⚠️ Please ensure grade, term, exam type, and academic year are selected."
      );
      return;
    }

    if (!hasValidScores) {
      setStatusMessage("⚠️ No valid scores entered.");
      return;
    }

    const filteredScores = {};
    for (const studentId in scores) {
      const studentScores = scores[studentId];
      const validScores = Object.entries(studentScores)
        .filter(([, score]) => typeof score === "number" && !isNaN(score))
        .reduce((acc, [subjectId, score]) => {
          acc[parseInt(subjectId)] = score;
          return acc;
        }, {});
      if (Object.keys(validScores).length > 0) {
        filteredScores[parseInt(studentId)] = validScores;
      }
    }

    const payload = {
      scores: filteredScores,
      term,
      examType,
      academicYear,
      grade,
    };

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await submitScores(payload);
      setStatusMessage("✅ Scores submitted successfully!");

      // Reset form after successful submission
      const resetScores = {};
      students.forEach((student) => {
        resetScores[student.id] = {};
        subjects.forEach((subject) => {
          resetScores[student.id][subject.id] = "";
        });
      });
      setScores(resetScores);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("❌ Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setStatusMessage("⏳ Processing Excel file...");

    // Clear file input if subjects/students aren't ready
    if (!subjects.length || !students.length) {
      setStatusMessage("❌ Please select grade and load students first");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert sheet to JSON with header:1 to get 2D array
        const rows = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          defval: "",
        });

        // Find header row (look for "Admission Number")
        let headerRowIndex = -1;
        let headerRow = [];

        for (let i = 0; i < rows.length; i++) {
          if (
            rows[i].some((cell) =>
              String(cell).toLowerCase().includes("admission")
            )
          ) {
            headerRowIndex = i;
            headerRow = rows[i].map((cell) => String(cell).trim());
            break;
          }
        }

        if (headerRowIndex === -1) {
          setStatusMessage(
            "❌ Could not find header row with 'Admission Number'"
          );
          event.target.value = "";
          return;
        }

        // Get all data rows after header
        const dataRows = rows.slice(headerRowIndex + 1);

        // Create mapping dictionaries
        const subjectMap = {};
        subjects.forEach((subj) => {
          subjectMap[subj.name.trim().toUpperCase()] = subj.id;
        });

        const admissionMap = {};
        students.forEach((student) => {
          admissionMap[String(student.admission_number)] = student.id;
        });

        const importedScores = { ...scores };
        let loadedCount = 0;
        let skippedCount = 0;

        for (const row of dataRows) {
          if (row.length < headerRow.length) continue;

          const rowData = {};
          headerRow.forEach((header, index) => {
            rowData[header] = row[index];
          });

          const admission = String(rowData["Admission Number"]).trim();
          if (!admission) continue;

          const studentId = admissionMap[admission];
          if (!studentId) {
            skippedCount++;
            continue;
          }

          for (const [key, value] of Object.entries(rowData)) {
            if (key === "Admission Number" || key === "Student Name") continue;

            const cleanKey = key.trim().toUpperCase();
            const subjectId = subjectMap[cleanKey];

            if (!subjectId) {
              console.warn(`Subject not found: ${key}`);
              continue;
            }

            // Handle empty scores and invalid values
            if (value === "" || value === null || value === undefined) {
              // Skip empty values
              continue;
            }

            // Convert to number
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
              importedScores[studentId][subjectId] = Math.round(numericValue);
              loadedCount++;
            }
          }
        }

        setScores(importedScores);
        setStatusMessage(
          `✅ Excel data loaded: ${loadedCount} scores imported, ${skippedCount} skipped`
        );
      } catch (error) {
        console.error("Excel processing error:", error);
        setStatusMessage("❌ Error processing Excel file. Check the format.");
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setStatusMessage("❌ File read error. Please try again.");
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className={styles.container}>
      <h2>
        Enter Exam Results ({term || "–"} - {examType || "–"})
      </h2>

      <div className={styles.filters}>
        <label>
          Select Grade:{" "}
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">-- Choose Grade --</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
          </select>
        </label>

        <label>
          Upload Excel:
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={!grade || isSubmitting}
          />
        </label>
      </div>

      {statusMessage && (
        <div
          className={
            statusMessage.includes("❌")
              ? styles.errorMessage
              : statusMessage.includes("⏳")
              ? styles.loadingMessage
              : statusMessage.includes("⚠️")
              ? styles.warningMessage
              : styles.successMessage
          }
        >
          {statusMessage}
        </div>
      )}

      {grade && students.length === 0 && !statusMessage.includes("⏳") && (
        <div className={styles.statusMessage}>
          ⚠️ No students found in Grade {grade}.
        </div>
      )}

      {students.length > 0 && subjects.length > 0 && (
        <>
          <div className={styles.tableScrollWrapper}>
            <table className={styles.scoresTable}>
              <thead>
                <tr>
                  <th>Student (Adm No)</th>
                  {subjects.map((subject) => (
                    <th key={subject.id}>{subject.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      {student.name} ({student.admission_number})
                    </td>
                    {subjects.map((subject) => (
                      <td key={`${student.id}-${subject.id}`}>
                        <ScoreInput
                          value={scores[student.id]?.[subject.id] ?? ""}
                          onChange={(value) =>
                            handleScoreChange(student.id, subject.id, value)
                          }
                          disabled={isSubmitting}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasValidScores}
            className={styles.submitButton}
          >
            {isSubmitting ? "Saving..." : "Save All Scores"}
          </button>
        </>
      )}
    </div>
  );
}
