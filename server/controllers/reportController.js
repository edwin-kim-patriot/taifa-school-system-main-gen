import { generateHTMLReport } from "../utils/htmlTemplate.js";
import puppeteer from "puppeteer";
import pool from "../config/db.js";
import {
  getGrade,
  calculatePerformance,
  generateRemarks,
} from "../utils/remarksGenerator.js";

// 🔍 Grading settings
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

// 🔍 Student lookup
const fetchStudent = async (admission_number) => {
  const result = await pool.query(
    `SELECT id, admission_number, name, grade FROM students WHERE admission_number = $1`,
    [admission_number]
  );
  return result.rows[0];
};

// 📚 Subject scores (handles missing ones with "-")
const fetchScores = async (studentId, term, examType, subjectThresholds) => {
  const subjectsRes = await pool.query(
    `SELECT id, name FROM subjects ORDER BY id`
  );
  const allSubjects = subjectsRes.rows;

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
    `SELECT r.subject_id, r.score FROM results r WHERE r.student_id = $1 ${filters}`,
    params
  );

  const resultsMap = new Map(
    resultsRes.rows.map((row) => [row.subject_id, parseFloat(row.score)])
  );

  return allSubjects.map((subject) => {
    const score = resultsMap.has(subject.id)
      ? resultsMap.get(subject.id)
      : null;

    if (score == null || isNaN(score)) {
      return {
        name: subject.name,
        score: "-",
        grade: "-",
        performance: "N/A",
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

// 🧠 Class ranking
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
    `SELECT s.id, SUM(r.score) AS total FROM students s
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

// 🧾 API: Get individual report JSON
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

    // ✅ Only count scored subjects
    const scoredSubjects = subjects.filter((s) => typeof s.score === "number");
    const total = scoredSubjects.reduce((sum, s) => sum + s.score, 0);
    const average = scoredSubjects.length ? total / scoredSubjects.length : 0;

    const { classSize, position } = await fetchRanking(
      student.id,
      student.grade,
      term,
      examType
    );

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

// 📄 PDF: Single report
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

    const scoredSubjects = subjects.filter((s) => typeof s.score === "number");
    const total = scoredSubjects.reduce((sum, s) => sum + s.score, 0);
    const average = scoredSubjects.length ? total / scoredSubjects.length : 0;

    const { classSize, position } = await fetchRanking(
      student.id,
      student.grade,
      term,
      examType
    );

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
      thresholds: subjectThresholds,
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
    const safeName = student.name.replace(/\s+/g, "_");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=REPORT_${safeName}_${student.admission_number}_${term}_${examType}.pdf`
    );

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};

// 📄 PDF: Combined reports
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

      const scoredSubjects = subjects.filter(
        (s) => typeof s.score === "number"
      );
      const total = scoredSubjects.reduce((sum, s) => sum + s.score, 0);
      const average = scoredSubjects.length ? total / scoredSubjects.length : 0;

      const { classSize, position } = await fetchRanking(
        student.id,
        grade,
        term,
        examType
      );

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
        thresholds: subjectThresholds,
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
