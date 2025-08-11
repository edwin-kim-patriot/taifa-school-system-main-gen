// /home/edwin-bett/taifa-school-system/client/src/api/examRoutes.js

import axios from 'axios';

// Fetch all exams
export const fetchExams = async () => {
  const response = await axios.get('/api/exams');
  return response.data;
};

// Create a new exam
export const createExam = async (examData) => {
  const response = await axios.post('/api/exams', examData);
  return response.data;
};

// Update an existing exam by ID
export const updateExam = async (examId, updatedData) => {
  const response = await axios.put(`/api/exams/${examId}`, updatedData);
  return response.data;
};

// Delete an exam by ID
export const deleteExam = async (examId) => {
  const response = await axios.delete(`/api/exams/${examId}`);
  return response.data;
};

// Set an exam as the active exam
export const setActiveExam = async (examId) => {
  const response = await axios.patch(`/api/exams/${examId}/activate`);
  return response.data;
};

// Get the currently active exam
export const fetchActiveExam = async () => {
  const response = await axios.get('/api/exams/active');
  return response.data;
};
