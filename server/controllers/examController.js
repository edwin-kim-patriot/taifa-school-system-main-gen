import pool from '../config/db.js';

/**
 * GET /api/exams - Fetch all exams with eligible_grades
 */
export const getExams = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exams ORDER BY academic_year DESC, term DESC'
    );
    res.json({ exams: result.rows });
  } catch (err) {
    console.error('❌ Error fetching exams:', err);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

/**
 * POST /api/exams - Create a new exam
 */
export const createExam = async (req, res) => {
  try {
    const { academic_year, term, name, eligible_grades } = req.body;

    // Prevent duplicates
    const duplicateCheck = await pool.query(
      'SELECT * FROM exams WHERE academic_year = $1 AND term = $2 AND name = $3',
      [academic_year, term, name]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ error: 'An exam with the same year, term, and type already exists.' });
    }

    await pool.query(
      `INSERT INTO exams (academic_year, term, name, eligible_grades, is_active)
       VALUES ($1, $2, $3, $4, false)`,
      [academic_year, term, name, eligible_grades]
    );

    res.status(201).json({ message: '✅ Exam created successfully.' });
  } catch (err) {
    console.error('🔥 Error creating exam:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/exams/:id - Update an exam
 */
export const updateExam = async (req, res) => {
  const { id } = req.params;
  const { academic_year, term, name, eligible_grades } = req.body;

  try {
    await pool.query(
      `UPDATE exams
       SET academic_year = $1, term = $2, name = $3, eligible_grades = $4
       WHERE id = $5`,
      [academic_year, term, name, eligible_grades, id]
    );

    res.json({ message: '✅ Exam updated successfully.' });
  } catch (err) {
    console.error('🔥 Error updating exam:', err);
    res.status(500).json({ error: 'Failed to update exam.' });
  }
};

/**
 * DELETE /api/exams/:id - Delete an exam
 */
export const deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM exams WHERE id = $1`, [id]);
    res.json({ message: '🗑️ Exam deleted successfully.' });
  } catch (err) {
    console.error('🔥 Error deleting exam:', err);
    res.status(500).json({ error: 'Failed to delete exam.' });
  }
};

/**
 * PATCH /api/exams/:id/activate - Set an exam as active
 */
export const setActiveExam = async (req, res) => {
  const { id } = req.params;

  try {
    // First, unset all currently active exams
    await pool.query(`UPDATE exams SET is_active = false WHERE is_active = true`);

    // Set the selected one as active
    await pool.query(`UPDATE exams SET is_active = true WHERE id = $1`, [id]);

    res.json({ message: '✅ Exam set as active.' });
  } catch (err) {
    console.error('🔥 Error setting active exam:', err);
    res.status(500).json({ error: 'Failed to set active exam.' });
  }
};

/**
 * GET /api/exams/active - Get the currently active exam
 */
export const getActiveExam = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM exams WHERE is_active = true LIMIT 1`);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active exam found.' });
    }

    res.json({ activeExam: result.rows[0] });
  } catch (err) {
    console.error('🔥 Error fetching active exam:', err);
    res.status(500).json({ error: 'Failed to get active exam.' });
  }
};
