//F:\elms\taifa-school-system-main-edit of c-3\server\controllers\scoresController.js
import pool from '../config/db.js';

export const submitScores = async (req, res) => {
  const { scores, term, examType, academicYear } = req.body;

  console.log('📥 Received scores payload:', req.body);

  // Validate required fields
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return res.status(400).json({ error: 'Scores are required and must be a non-empty object.' });
  }

  if (!term || !examType || !academicYear) {
    return res.status(400).json({ error: 'Term, examType, and academicYear are required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 1: Get or create the exam record
    const examResult = await client.query(
      `SELECT id FROM exams WHERE term = $1 AND name = $2 AND academic_year = $3 LIMIT 1`,
      [term, examType, academicYear]
    );

    let examId;
    if (examResult.rows.length > 0) {
      examId = examResult.rows[0].id;
    } else {
      const insertExam = await client.query(
        `INSERT INTO exams (term, name, academic_year) VALUES ($1, $2, $3) RETURNING id`,
        [term, examType, academicYear]
      );
      examId = insertExam.rows[0].id;
    }

    // Step 2: Insert or update scores per student and subject
    for (const studentId in scores) {
      const subjectScores = scores[studentId];

      for (const subjectId in subjectScores) {
        const score = parseFloat(subjectScores[subjectId]);

        if (isNaN(score)) {
          console.warn(`⚠️ Skipping invalid score: ${score} for subject ${subjectId} and student ${studentId}`);
          continue;
        }

        await client.query(
          `INSERT INTO results (student_id, subject_id, score, term, exam_type, exam_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (student_id, subject_id, term, exam_type)
           DO UPDATE SET score = EXCLUDED.score, exam_id = EXCLUDED.exam_id`,
          [studentId, subjectId, score, term, examType, examId]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: '✅ Scores submitted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error submitting scores:', err);
    res.status(500).json({ error: 'Failed to submit scores.', details: err.message });
  } finally {
    client.release();
  }
};
