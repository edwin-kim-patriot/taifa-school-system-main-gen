import pool from '../config/db.js';
import {
  generateRemarks,
  calculatePerformance,
  getGrade
} from '../utils/remarksGenerator.js';

// ✅ Fetch all students (optionally filtered by grade from query param)
export const getAllStudents = async (req, res) => {
  try {
    const { grade } = req.query;
    let query = 'SELECT * FROM students';
    const params = [];

    if (grade) {
      query += ' WHERE grade = $1 ORDER BY name ASC';
      params.push(grade);
    } else {
      query += ' ORDER BY name ASC';
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// ✅ Fetch students by grade from route param (e.g. /students/grade/:grade)
export const getStudentsByGrade = async (req, res) => {
  try {
    const { grade } = req.params;

    const query = 'SELECT * FROM students WHERE grade = $1 ORDER BY name ASC';
    const { rows } = await pool.query(query, [grade]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching students by grade:', error);
    res.status(500).json({ message: 'Server error fetching students by grade' });
  }
};

// ✅ Get single student by admission number
export const getStudentByAdmission = async (req, res) => {
  const { admission_number } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM students WHERE admission_number = $1',
      [admission_number]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
};

// ✅ Add a new student (without total_marks)
export const addStudent = async (req, res) => {
  const { admission_number, name, grade } = req.body;

  if (!admission_number || !name || !grade) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO students (admission_number, name, grade) VALUES ($1, $2, $3) RETURNING *',
      [admission_number, name, grade]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Admission number already exists' });
    }
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Server error adding student' });
  }
};

// ✅ Update existing student
export const updateStudent = async (req, res) => {
  const { admission_number } = req.params;
  const { name, grade } = req.body;

  try {
    const { rowCount, rows } = await pool.query(
      'UPDATE students SET name = $1, grade = $2 WHERE admission_number = $3 RETURNING *',
      [name, grade, admission_number]
    );
    if (rowCount === 0)
      return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error updating student' });
  }
};

// ✅ Delete a student
export const deleteStudent = async (req, res) => {
  const { admission_number } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM students WHERE admission_number = $1 RETURNING *',
      [admission_number]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Student not found' });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
};

// ✅ Get student with subject performance
export const getStudentsWithResults = async (req, res) => {
  const { admission_number } = req.params;

  try {
    const studentQuery = await pool.query(
      'SELECT * FROM students WHERE admission_number = $1',
      [admission_number]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentQuery.rows[0];

    const resultsQuery = await pool.query(
      `SELECT r.score, sub.name AS subject
       FROM results r
       JOIN subjects sub ON r.subject_id = sub.id
       WHERE r.student_id = $1`,
      [student.id]
    );
    const results = resultsQuery.rows;

    const total = results.reduce((sum, r) => sum + r.score, 0);
    const average = results.length ? total / results.length : 0;

    const subjects = results.map(r => ({
      subject: r.subject,
      score: r.score,
      grade: getGrade(r.score),
    }));

    const performance = calculatePerformance(average, 'overall');

    const examInfoQuery = await pool.query(
      `SELECT DISTINCT exam_type, term, year 
       FROM results 
       WHERE student_id = $1 
       ORDER BY year DESC, term DESC 
       LIMIT 1`,
      [student.id]
    );
    const exam = examInfoQuery.rows[0] || {};

    const schoolQuery = await pool.query(
      'SELECT school_name, logo_url, academic_year FROM school_settings LIMIT 1'
    );
    const school = schoolQuery.rows[0] || {};

    const remarks = generateRemarks(performance, null, null, student.name, student.grade);

    res.json({
      student,
      subjects,
      total,
      average,
      performance,
      remarks,
      exam,
      school
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error fetching student results' });
  }
};

// ✅ Get all students with ranking and performance
export const getStudentsWithRanking = async (req, res) => {
  try {
    const { rows: students } = await pool.query(`
      WITH ranked AS (
        SELECT 
          s.*,
          COALESCE((SELECT SUM(score) FROM results WHERE student_id = s.id), 0) AS total_marks,
          RANK() OVER (
            ORDER BY COALESCE((SELECT SUM(score) FROM results WHERE student_id = s.id), 0) DESC
          ) AS position
        FROM students s
      )
      SELECT * FROM ranked
    `);

    const totalStudents = students.length;

    const enriched = students.map(student => {
      const performance = calculatePerformance(student.total_marks, 'overall');
      const remarks = generateRemarks(
        performance,
        student.position,
        totalStudents,
        student.name,
        student.grade
      );

      return {
        ...student,
        total_marks: parseFloat(student.total_marks),
        performance,
        remarks
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error generating student rankings:', error);
    res.status(500).json({ message: 'Server error generating rankings' });
  }
};
