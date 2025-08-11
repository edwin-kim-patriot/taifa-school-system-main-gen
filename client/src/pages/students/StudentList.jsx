import { useEffect, useState, useCallback } from "react";
import { fetchStudentsByGrade, deleteStudent } from "../../api/students";
import StudentForm from "./StudentForm";
import styles from "./StudentList.module.css";
import * as XLSX from "xlsx";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [schoolSettings, setSchoolSettings] = useState({});
  const [subjects, setSubjects] = useState([]);

  const subjectAbbreviations = {
    English: "ENG",
    Kiswahili: "KISW",
    Mathematics: "MATH",
    "Integrated Science": "INT'SCI",
    "Religious Education": "R/STUDIES",
    "Social Studies": "SST",
    "Agriculture & Nutrition": "AGRI&NUT",
    "Pre-Technical Studies": "PRE-TECH",
    "Creative Arts": "C/ARTS",
  };

  const refreshStudents = useCallback(
    async (grade = selectedGrade) => {
      try {
        setError("");
        setLoading(true);
        const data = await fetchStudentsByGrade(grade);
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setError("Failed to load students. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [selectedGrade]
  );

  const fetchSchoolSettings = async () => {
    try {
      const res = await fetch("/api/settings/school");
      const data = await res.json();

      setSchoolSettings({
        name: data.school_name || data.name || "Unnamed School",
        term: data.term || "Term 1",
        examType: data.examType || "End Term",
      });
    } catch (err) {
      console.error("Failed to load school settings:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (Array.isArray(data)) {
        const subjectNames = data.map((s) => s.name);
        setSubjects(subjectNames);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  };

  useEffect(() => {
    refreshStudents();
  }, [selectedGrade, refreshStudents]);

  useEffect(() => {
    fetchSchoolSettings();
    fetchSubjects();
  }, []);

  const handleDelete = async (admission_number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove student with admission number ${admission_number}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteStudent(admission_number);
      setSuccessMessage(
        `Student With admission number ${admission_number} was successfully removed.`
      );
      refreshStudents();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert(
        `Failed to delete student: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const downloadMarksheet = () => {
    const wb = XLSX.utils.book_new();

    const schoolName = schoolSettings?.name || "Your School Name";
    const term = schoolSettings?.term || "Term 1";
    const examType = schoolSettings?.examType || "End Term";
    const title = `GRADE ${selectedGrade} MARKSHEET`;

    const headers = [
      "Admission Number",
      "Student Name",
      ...subjects.map((subject) => subjectAbbreviations[subject] || subject),
    ];

    const rows = students.map((student) => {
      const subjectScores = subjects.map((subjectName) => {
        const subjectObj = student.subjects?.find(
          (s) => s.name === subjectName
        );
        return subjectObj?.score ?? "";
      });

      return [student.admission_number, student.name, ...subjectScores];
    });

    const sheetData = [
      [schoolName],
      [title],
      [`Exam Type: ${examType}`],
      [`Term: ${term}`],
      [""],
      headers,
      ...rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Apply styling (bold titles, font sizes)
    const applyCellStyle = (cell, style) => {
      ws[cell].s = style;
    };

    const boldTitleStyle = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center" },
    };

    const boldHeaderStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "D9EAF7" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Style the top info lines
    applyCellStyle("A1", boldTitleStyle);
    applyCellStyle("A2", boldTitleStyle);
    applyCellStyle("A3", boldTitleStyle);
    applyCellStyle("A4", boldTitleStyle);

    // Style header row
    const headerRowIndex = 6; // 0-indexed, so this is row 7 (after 5 info lines + 1 empty)
    for (let col = 0; col < headers.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (ws[cellAddress]) {
        applyCellStyle(cellAddress, boldHeaderStyle);
      }
    }

    // Set column widths (optional)
    ws["!cols"] = headers.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(wb, ws, `Grade ${selectedGrade}`);
    XLSX.writeFile(wb, `GRADE_${selectedGrade}_MARKSHEET.xlsx`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.gradeTitle}>
          Grade {selectedGrade} Student Roster
        </h2>
        <StudentForm onStudentAdded={() => refreshStudents()} />
      </div>

      <div className={styles.filterControls}>
        <select
          className={styles.selectInput}
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(parseInt(e.target.value, 10))}
        >
          <option value={7}>Grade 7</option>
          <option value={8}>Grade 8</option>
          <option value={9}>Grade 9</option>
        </select>

        <button onClick={downloadMarksheet} className={styles.exportButton}>
          Download Marksheet
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading students...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : students.length === 0 ? (
        <div className={styles.statusMessage}>
          ⚠️ No students found in Grade {selectedGrade}.
        </div>
      ) : (
        <>
          {successMessage && (
            <div className={styles.success}>{successMessage}</div>
          )}

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.admission_number}</td>
                  <td>{student.name}</td>
                  <td>Grade {student.grade}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(student.admission_number)}
                      className={styles.deleteButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
