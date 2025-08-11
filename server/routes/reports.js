
// /home/edwin-bett/taifa-school-system/server/routes/reports.js
import express from 'express';
import {
  getStudentsWithResults,
  generateReportPDF,
  generateCombinedGradePDF
} from '../controllers/reportController.js';

const router = express.Router();

/**
 * ✅ Fetch student report data (JSON)
 * Endpoint: GET /api/reports/students/:admission_number?term=...&examType=...
 */
router.get('/students/:admission_number', getStudentsWithResults);

/**
 * ✅ Download individual student report as PDF
 * Endpoint: GET /api/reports/students/:admission_number/pdf?term=...&examType=...
 */
router.get('/students/:admission_number/pdf', generateReportPDF);

/**
 * ✅ Download combined grade report as a single PDF
 * Endpoint: GET /api/reports/combined?grade=...&term=...&examType=...
 * (Matches the frontend call to `/api/reports/combined`)
 */
router.get('/combined', generateCombinedGradePDF);

export default router;






// // /home/edwin-bett/taifa-school-system/server/routes/reports.js
// import express from 'express';
// import {
//   getStudentsWithResults,
//   generateReportPDF,
//   generateCombinedGradePDF // 🆕 Add new controller for combined report
// } from '../controllers/reportController.js';

// const router = express.Router();

// // ✅ Return JSON report: GET /api/reports/students/:admission_number?term=…&examType=…
// router.get('/students/:admission_number', getStudentsWithResults);

// // ✅ Download single student PDF: GET /api/reports/students/:admission_number/pdf?term=…&examType=…
// router.get('/students/:admission_number/pdf', generateReportPDF);

// // 🆕 Download combined grade PDF: GET /api/reports/combined?grade=…&term=…&examType=…
// router.get('/combined', generateCombinedGradePDF);

// export default router;
