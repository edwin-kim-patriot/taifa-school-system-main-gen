// client/src/api/reports.js
import axios from 'axios';

// Centralize error throwing
function handleApiError(error) {
  // JSON error from backend
  if (error.response?.data && typeof error.response.data === 'object') {
    const msg = error.response.data.error || error.response.data.message;
    throw new Error(msg || 'Server Error');
  }
  // Fallback
  throw new Error(error.message || 'Network Error');
}

/**
 * Fetch structured JSON report for a student
 * @param {string} admissionNumber
 * @param {object} filters
 * @param {string} filters.term
 * @param {string} filters.examType
 */
export async function fetchStudentsWithResults(admissionNumber, filters) {
  try {
    const { data } = await axios.get(
      `/api/reports/students/${admissionNumber}`,
      { params: filters }
    );
    return { ...data, ...filters };
  } catch (err) {
    handleApiError(err);
  }
}

/**
 * Download PDF version of the student report
 * @param {string} admissionNumber
 * @param {string} term
 * @param {string} examType
 * @returns {{ blob: Blob, filename: string }}
 */
export async function generateReportPDF(admissionNumber, term, examType) {
  try {
    const response = await axios.get(
      `/api/reports/students/${admissionNumber}/pdf`,
      {
        params: { term, examType },
        responseType: 'blob'
      }
    );

    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] || 'report.pdf';

    const blob = new Blob([response.data], {
      type: 'application/pdf'
    });

    return { blob, filename };
  } catch (err) {
    handleApiError(err);
  }
}

/**
 * Download combined PDF report for an entire grade
 * @param {number|string} grade
 * @param {string} term
 * @param {string} examType
 * @returns {{ blob: Blob, filename: string }}
 */
export async function generateCombinedGradePDF(grade, term, examType) {
  try {
    const response = await axios.get(
      '/api/reports/combined',
      {
        params: { grade, term, examType },
        responseType: 'blob'
      }
    );

    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] || `Grade_${grade}_Report.pdf`;

    const blob = new Blob([response.data], {
      type: 'application/pdf'
    });

    return { blob, filename };
  } catch (err) {
    handleApiError(err);
  }
}
