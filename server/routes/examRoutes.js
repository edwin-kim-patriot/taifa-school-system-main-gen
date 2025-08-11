import express from 'express';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  setActiveExam,
  getActiveExam
} from '../controllers/examController.js';

const router = express.Router();

// GET /api/exams - Fetch all exams
router.get('/exams', getExams);

// GET /api/exams/active - Fetch the currently active exam
router.get('/exams/active', getActiveExam);

// POST /api/exams - Create a new exam
router.post('/exams', createExam);

// PUT /api/exams/:id - Update an existing exam
router.put('/exams/:id', updateExam);

// DELETE /api/exams/:id - Delete an exam
router.delete('/exams/:id', deleteExam);

// PATCH /api/exams/:id/activate - Set an exam as active
router.patch('/exams/:id/activate', setActiveExam);

export default router;
