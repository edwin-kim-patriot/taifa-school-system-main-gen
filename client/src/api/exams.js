// client/src/api/exams.js
import axios from 'axios';

/* === SUBJECTS (Used by ResultEntry.jsx) === */
export const fetchSubjects = async () => {
  try {
    const response = await axios.get('/api/subjects');
    return response.data;
  } catch (error) {
    console.error("❌ fetchSubjects error:", error.response?.data || error.message);
    throw error;
  }
};

/* === SCORES (Used by ResultEntry.jsx) === */
export const submitScores = async (payload) => {
  try {
    console.log("📤 Submitting scores payload:", payload);
    const response = await axios.post('/api/scores', payload);
    console.log("✅ Scores submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ submitScores error:", error.response?.data || error.message);
    throw error;
  }
};

/* === EXAMS (Used by ExamManager.jsx) === */

// Fetch all exams from the backend
export const fetchExams = async () => {
  try {
    const response = await axios.get('/api/exams');
    return response.data; // Expected: { exams: [...] }
  } catch (error) {
    console.error("❌ fetchExams error:", error.response?.data || error.message);
    throw error;
  }
};

// Create a new exam entry
export const createExam = async (examData) => {
  try {
    const response = await axios.post('/api/exams', examData);
    return response.data; // Expected: { exam: {...} }
  } catch (error) {
    console.error("❌ createExam error:", error.response?.data || error.message);
    throw error;
  }
};
