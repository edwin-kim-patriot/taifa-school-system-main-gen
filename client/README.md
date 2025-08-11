


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## how to run the app and db

psql -U edwin -h localhost -d taifa_school
npm run dev and npm node server

## studentlist.jsx code
//F:\elms\taifa-school-system-main-edit of c-3\client\src\pages\students\StudentList.jsx
import { useEffect, useState, useCallback } from "react";
import { fetchStudentsByGrade, deleteStudent } from "../../api/students";
import StudentForm from "./StudentForm";
import styles from "./StudentList.module.css";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Memoize refreshStudents to avoid ESLint warning and unnecessary re-renders
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

  const handleDelete = async (admission_number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove student #${admission_number}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteStudent(admission_number);
      setSuccessMessage(
        `Student With ${admission_number} was successfully removed.`
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

  useEffect(() => {
    refreshStudents();
  }, [selectedGrade, refreshStudents]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Student Roster</h2>
        <StudentForm onStudentAdded={() => refreshStudents()} />
      </div>

      <div className={styles.filterRow}>
        <label>Select Grade: </label>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(parseInt(e.target.value, 10))}
        >
          <option value={7}>Grade 7</option>
          <option value={8}>Grade 8</option>
          <option value={9}>Grade 9</option>
        </select>
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

## report controller original code before modifying it to calculate averages  out of attempetd subjects only 

// server/controllers/reportController.js

import { generateHTMLReport } from "../utils/htmlTemplate.js";
import puppeteer from "puppeteer";
import pool from "../config/db.js";
import {
  getGrade,
  calculatePerformance,
  generateRemarks,
} from "../utils/remarksGenerator.js";

// 🔍 Get grading settings from DB
const fetchGradingSettings = async () => {
  const result = await pool.query(
    `SELECT thresholds, overall_thresholds FROM grading_settings ORDER BY id DESC LIMIT 1`
  );
  if (result.rows.length) {
    return {
      thresholds: result.rows[0].thresholds,
      overallThresholds: result.rows[0].overall_thresholds,
    };
  }
  return null;
};

// 🔍 Get student by admission number
const fetchStudent = async (admission_number) => {
  const result = await pool.query(
    `SELECT id, admission_number, name, grade
     FROM students
     WHERE admission_number = $1`,
    [admission_number]
  );
  return result.rows[0];
};

// 📚 Get subject scores original code
// const fetchScores = async (studentId, term, examType, subjectThresholds) => {
//   const params = [studentId];
//   let filters = "";

//   if (term) {
//     params.push(term);
//     filters += ` AND r.term = $${params.length}`;
//   }
//   if (examType) {
//     params.push(examType);
//     filters += ` AND r.exam_type = $${params.length}`;
//   }

//   const result = await pool.query(
//     `SELECT sub.name AS subject, r.score
//      FROM results r
//      JOIN subjects sub ON r.subject_id = sub.id
//      WHERE r.student_id = $1 ${filters}
//      ORDER BY sub.id`,
//     params
//   );

//   // Calculate performance synchronously here or handle await if needed
//   // Assuming calculatePerformance can be sync or async for subject scores
//   // If async, you need to await all — but you didn't indicate that
//   // For simplicity, assume calculatePerformance is sync or thresholds available
//   // If async, modify accordingly.

//   return result.rows.map(({ subject, score }) => {
//     const parsed = parseFloat(score);
//     // For subject performance, assuming synchronous calculatePerformance or simplified logic
//     const performance = (thresholds) =>
//       parsed >= thresholds.exceeding
//         ? "EXCEEDING EXPECTATION"
//         : parsed >= thresholds.meeting
//         ? "MEETING EXPECTATION"
//         : parsed >= thresholds.approaching
//         ? "APPROACHING EXPECTATION"
//         : "BELOW EXPECTATION";

//     return {
//       name: subject,
//       score: parsed,
//       grade: getGrade(parsed),
//       performance: performance(subjectThresholds),
//     };
//   });
// };

// 📚 Get subject scores with dash(-) missing scores  code
const fetchScores = async (studentId, term, examType, subjectThresholds) => {
  // Get all subjects
  const subjectsRes = await pool.query(
    `SELECT id, name FROM subjects ORDER BY id`
  );
  const allSubjects = subjectsRes.rows;

  // Get results for the student
  const params = [studentId];
  let filters = "";

  if (term) {
    params.push(term);
    filters += ` AND r.term = $${params.length}`;
  }
  if (examType) {
    params.push(examType);
    filters += ` AND r.exam_type = $${params.length}`;
  }

  const resultsRes = await pool.query(
    `SELECT r.subject_id, r.score
     FROM results r
     WHERE r.student_id = $1 ${filters}`,
    params
  );

  const resultsMap = new Map(
    resultsRes.rows.map((row) => [row.subject_id, parseFloat(row.score)])
  );

  // Build subject list with scores (or dashes if missing)
  return allSubjects.map((subject) => {
    const score = resultsMap.has(subject.id)
      ? resultsMap.get(subject.id)
      : null;

    if (score == null) {
      return {
        name: subject.name,
        score: "-",
        grade: "-",
        performance: "-",
      };
    }

    const performance = (thresholds) =>
      score >= thresholds.exceeding
        ? "EXCEEDING EXPECTATION"
        : score >= thresholds.meeting
        ? "MEETING EXPECTATION"
        : score >= thresholds.approaching
        ? "APPROACHING EXPECTATION"
        : "BELOW EXPECTATION";

    return {
      name: subject.name,
      score,
      grade: getGrade(score),
      performance: performance(subjectThresholds),
    };
  });
};

// 🧠 Get ranking
const fetchRanking = async (studentId, grade, term, examType) => {
  const params = [grade];
  let filters = "";

  if (term) {
    params.push(term);
    filters += ` AND r.term = $${params.length}`;
  }
  if (examType) {
    params.push(examType);
    filters += ` AND r.exam_type = $${params.length}`;
  }

  const rankRes = await pool.query(
    `SELECT s.id, SUM(r.score) AS total
     FROM students s
     JOIN results r ON r.student_id = s.id
     WHERE s.grade = $1 ${filters}
     GROUP BY s.id
     ORDER BY total DESC`,
    params
  );

  const classSize = rankRes.rowCount;
  const position = rankRes.rows.findIndex((r) => r.id === studentId) + 1;

  return { classSize, position };
};

// 🚀 GET /api/reports/students/:admission_number
export const getStudentsWithResults = async (req, res) => {
  const { admission_number } = req.params;
  const { term, examType } = req.query;

  try {
    const grading = await fetchGradingSettings();
    const subjectThresholds = grading?.thresholds;
    const overallThresholds = grading?.overallThresholds;

    const student = await fetchStudent(admission_number);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const subjects = await fetchScores(
      student.id,
      term,
      examType,
      subjectThresholds
    );
    const total = subjects.reduce((sum, s) => sum + s.score, 0);
    const average = subjects.length ? total / subjects.length : 0;

    const { classSize, position } = await fetchRanking(
      student.id,
      student.grade,
      term,
      examType
    );

    // Await added here:
    const overallPerformance = await calculatePerformance(
      total,
      "overall",
      overallThresholds
    );
    const remark = generateRemarks(
      overallPerformance,
      student.name,
      student.grade
    );

    return res.json({
      ...student,
      subjects,
      performance: overallPerformance,
      remark,
      overall: {
        total,
        average: parseFloat(average.toFixed(2)),
        position,
        class_size: classSize,
        performance: overallPerformance,
        remark,
      },
    });
  } catch (err) {
    console.error("Error fetching student results:", err);
    return res.status(500).json({ error: "Failed to fetch results" });
  }
};

// 🚀 GET /api/reports/:admission_number
export const generateReportPDF = async (req, res) => {
  const { admission_number } = req.params;
  const { term, examType } = req.query;

  if (!term || !examType) {
    return res.status(400).json({
      error: "Both term and examType query parameters are required",
    });
  }

  try {
    const grading = await fetchGradingSettings();
    const subjectThresholds = grading?.thresholds;
    const overallThresholds = grading?.overallThresholds;

    const student = await fetchStudent(admission_number);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const subjects = await fetchScores(
      student.id,
      term,
      examType,
      subjectThresholds
    );
    if (!subjects.length) {
      return res.status(404).json({
        error: "No results found for this student, term, and exam type",
      });
    }

    const total = subjects.reduce((sum, s) => sum + s.score, 0);
    const average = total / subjects.length;

    const { classSize, position } = await fetchRanking(
      student.id,
      student.grade,
      term,
      examType
    );

    // Await added here:
    const overallPerformance = await calculatePerformance(
      total,
      "overall",
      overallThresholds
    );
    const remark = generateRemarks(
      overallPerformance,
      student.name,
      student.grade
    );

    const settingsRes = await pool.query(
      `SELECT school_name, logo_url, academic_year FROM school_settings LIMIT 1`
    );
    const school = settingsRes.rows[0] || {
      school_name: "Unnamed School",
      logo_url: "",
      academic_year: new Date().getFullYear(),
    };

    const html = generateHTMLReport({
      ...student,
      subjects,
      overall: {
        total,
        average: average.toFixed(2),
        position,
        class_size: classSize,
        performance: overallPerformance,
        remark,
      },
      school,
      term,
      examType,
      thresholds: subjectThresholds, // 🟢 Pass it here!
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    const safeName = student.name.replace(/\s+/g, "_"); // sanitize filename
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=REPORT_${safeName}_${student.admission_number}_${term}_${examType}.pdf`
    );

    //res.setHeader(
    "Content-Disposition",
      `attachment; filename=REPORT_${student.admission_number}_${term}_${examType}.pdf`;
    //);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};

// 🚀 GET /api/reports/combined?grade=…&term=…&examType=…
export const generateCombinedGradePDF = async (req, res) => {
  const { grade, term, examType } = req.query;

  if (!grade || !term || !examType) {
    return res.status(400).json({
      error: "Grade, term, and examType query parameters are required",
    });
  }

  try {
    const grading = await fetchGradingSettings();
    const subjectThresholds = grading?.thresholds;
    const overallThresholds = grading?.overallThresholds;

    const studentsRes = await pool.query(
      `SELECT id, admission_number, name, grade FROM students WHERE grade = $1 ORDER BY name`,
      [grade]
    );

    const settingsRes = await pool.query(
      `SELECT school_name, logo_url, academic_year FROM school_settings LIMIT 1`
    );

    const school = settingsRes.rows[0] || {
      school_name: "Unnamed School",
      logo_url: "",
      academic_year: new Date().getFullYear(),
    };

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    let fullHtml = "";

    for (const student of studentsRes.rows) {
      const subjects = await fetchScores(
        student.id,
        term,
        examType,
        subjectThresholds
      );
      if (!subjects.length) continue;

      const total = subjects.reduce((sum, s) => sum + s.score, 0);
      const average = total / subjects.length;
      const { classSize, position } = await fetchRanking(
        student.id,
        grade,
        term,
        examType
      );

      // Await added here:
      const overallPerformance = await calculatePerformance(
        total,
        "overall",
        overallThresholds
      );
      const remark = generateRemarks(overallPerformance, student.name, grade);

      const html = generateHTMLReport({
        ...student,
        subjects,
        overall: {
          total,
          average: average.toFixed(2),
          position,
          class_size: classSize,
          performance: overallPerformance,
          remark,
        },
        school,
        term,
        examType,
        thresholds: subjectThresholds, // 🟢 Pass it here!
      });

      fullHtml += html + `<div style="page-break-after: always;"></div>`;
    }

    if (!fullHtml) {
      await browser.close();
      return res.status(404).json({ error: "No reports found for this grade" });
    }

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GRADE_${grade}_${term}_${examType}_REPORTS.pdf`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating combined PDF:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate combined report" });
  }
};



