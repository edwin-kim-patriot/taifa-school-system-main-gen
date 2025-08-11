//C:\taifa-school-system-main\server\utils\remarksGenerator.js
import db from "../config/db.js";

let cachedThresholds = null;

const fetchThresholds = async () => {
  if (cachedThresholds) return cachedThresholds;

  const result = await db.query("SELECT * FROM grading_settings LIMIT 1");
  if (result.rows.length === 0)
    throw new Error("No grading settings found in DB");

  const { thresholds, overall_thresholds } = result.rows[0];
  // Store as subject and overall for clarity
  cachedThresholds = { subject: thresholds, overall: overall_thresholds };

  return cachedThresholds;
};

export const generateRemarks = (performance, name, grade) => {
  const performanceLevel = performance.toLowerCase();

  const remarksTemplates = {
    "exceeding expectation": [
      `${name} consistently demonstrates excellence in Grade ${grade}.`,
      `${name} shows remarkable understanding of all subjects.`,
    ],
    "meeting expectation": [
      `${name} is performing at the expected level for Grade ${grade}.`,
      `Solid performance across all subjects.`,
      `${name} meets all learning objectives satisfactorily.`,
    ],
    "approaching expectation": [
      `${name} is making progress but needs more consistent effort.`,
      `${name} would benefit from additional practice and focus.`,
    ],
    "below expectation": [
      `${name} needs significant improvement in most subjects.`,
      `Parental support and extra guidance are highly recommended.`,
      `${name} is struggling with core Grade ${grade} concepts and needs support.`,
    ],
  };

  const templates = remarksTemplates[performanceLevel] || [
    `${name} is performing at a ${performanceLevel} level.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

export const calculatePerformance = async (totalMarks, type = "subject") => {
  const thresholds = await fetchThresholds();

  // Ensure type is either 'subject' or 'overall'
  const t = thresholds[type === "overall" ? "overall" : "subject"];

  if (!t) throw new Error(`Thresholds for type '${type}' not found`);

  let performance = "";

  // Defensive checks for threshold properties, fallback to reasonable defaults if missing
  const exceeding = t.exceeding ?? 80;
  const meeting = t.meeting ?? 65;
  const approaching = t.approaching ?? 50;

  if (totalMarks >= exceeding) performance = "EXCEEDING EXPECTATION";
  else if (totalMarks >= meeting) performance = "MEETING EXPECTATION";
  else if (totalMarks >= approaching) performance = "APPROACHING EXPECTATION";
  else performance = "BELOW EXPECTATION";

  return performance;
};

export const getGrade = (score) => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};
