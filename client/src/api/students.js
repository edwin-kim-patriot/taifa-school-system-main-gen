// /home/edwin-bett/taifa-school-system/client/src/api/students.js

import axios from 'axios';

// ✅ Fetch all students
export const fetchStudents = async () => {
  const response = await axios.get('/api/students');
  return response.data;
};

// ✅ Add a new student
export const addStudent = async (studentData) => {
  const response = await axios.post('/api/students', studentData);
  return response.data;
};

// ✅ Fetch a student by admission number
export const fetchStudentByAdmission = async (admissionNumber) => {
  const response = await axios.get(`/api/students/${admissionNumber}`);
  return response.data;
};

// ✅ Update a student
export const updateStudent = async (admissionNumber, updatedData) => {
  const response = await axios.put(`/api/students/${admissionNumber}`, updatedData);
  return response.data;
};

// ✅ Delete a student
export const deleteStudent = async (admissionNumber) => {
  const response = await axios.delete(`/api/students/${admissionNumber}`);
  return response.data;
};

// ✅ Fetch student with full results, grades, performance, and remarks
export const fetchStudentWithResults = async (admissionNumber) => {
  const response = await axios.get(`/api/students/${admissionNumber}/results`);
  return response.data;
};

// ✅ Fetch all students with total marks, position, and remarks
export const fetchStudentsWithRanking = async () => {
  const response = await axios.get('/api/students/rankings');
  return response.data;
};

// ✅ Submit scores for students
export const submitScores = async (scores, term, examType, academicYear) => {
  const response = await axios.post('/api/scores', { scores, term, examType, academicYear });
  return response.data;
};

// ✅ Fetch students by grade
export const fetchStudentsByGrade = async (grade) => {
  const response = await axios.get(`/api/students/grade/${grade}`);
  return response.data;
};
