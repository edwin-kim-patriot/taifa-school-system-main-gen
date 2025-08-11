// /home/edwin-bett/taifa-school-system/server/routes/students.js

import express from 'express';
import {
  getAllStudents,
  getStudentByAdmission,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentsByGrade
} from '../controllers/studentController.js';

const router = express.Router();

/**
 * GET /api/students
 * Fetch all students, optionally filtered by grade via ?grade=7|8|9
 */
router.get('/', getAllStudents);

/**
 * GET /api/students/grade/:grade
 * Fetch students belonging to a specific grade
 */
router.get('/grade/:grade', getStudentsByGrade);

/**
 * GET /api/students/:admission_number
 * Fetch a single student by admission number
 */
router.get('/:admission_number', getStudentByAdmission);

/**
 * POST /api/students
 * Add a new student
 */
router.post('/', addStudent);

/**
 * PUT /api/students/:admission_number
 * Update a student by admission number
 */
router.put('/:admission_number', updateStudent);

/**
 * DELETE /api/students/:admission_number
 * Delete a student by admission number
 */
router.delete('/:admission_number', deleteStudent);

export default router;
