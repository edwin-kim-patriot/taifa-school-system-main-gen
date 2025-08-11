// /server/controllers/performanceAnalysisController.js

import pool from '../config/db.js';
import {
  
  calculatePerformance,
} from '../utils/performanceAnalysisCalculator.js';

const performanceAnalysis = async (req, res) => {
  try {
    // Get all subjects
    const subjectRes = await pool.query('SELECT id, name FROM subjects');
    const subjects = subjectRes.rows;

    // Get all students
    const studentRes = await pool.query('SELECT id, name, admission_number FROM students');
    const students = studentRes.rows;

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    // Get all results
    const resultRes = await pool.query('SELECT * FROM results');
    const results = resultRes.rows;

    // Build score map: { studentId: { subjectName: score } }
    const studentScores = {};
    for (const student of students) {
      studentScores[student.id] = {};
    }

    for (const r of results) {
      const subject = subjects.find(s => s.id === r.subject_id);
      if (subject) {
        studentScores[r.student_id][subject.name.toLowerCase().replace(/ /g, '_')] = parseFloat(r.score);
      }
    }

    // Compute subject-level analysis
    const subjectResults = subjects.map(subject => {
      const key = subject.name.toLowerCase().replace(/ /g, '_');
      const scores = students.map(s => studentScores[s.id][key] || 0);
      const mean = scores.reduce((acc, val) => acc + val, 0) / students.length;
      const performance = calculatePerformance(mean);

      return {
        name: subject.name,
        mean: parseFloat(mean.toFixed(1)),
        performance
      };
    });

    // Compute overall analysis
    const totalScores = students.map(student => {
      return subjects.reduce((sum, subject) => {
        const key = subject.name.toLowerCase().replace(/ /g, '_');
        return sum + (studentScores[student.id][key] || 0);
      }, 0);
    });

    const totalSubjects = subjects.length;
    const overallMean = totalScores.reduce((acc, val) => acc + val, 0) / students.length;
    const overallPerformance = calculatePerformance(overallMean / totalSubjects);

    const performanceLevels = {
      'EXCEEDING EXPECTATION': 0,
      'MEETING EXPECTATION': 0,
      'APPROACHING EXPECTATION': 0,
      'BELOW EXPECTATION': 0
    };

    totalScores.forEach(total => {
      const meanPerSubject = total / totalSubjects;
      const level = calculatePerformance(meanPerSubject);
      if (performanceLevels[level] !== undefined) {
        performanceLevels[level]++;
      }
    });

    res.status(200).json({
      subjectResults,
      overallMean: parseFloat(overallMean.toFixed(1)),
      overallPerformance,
      performanceLevels,
      totalStudents: students.length
    });
  } catch (error) {
    console.error('Error in performanceAnalysis:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default performanceAnalysis;
