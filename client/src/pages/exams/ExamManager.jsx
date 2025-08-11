// /client/src/pages/exams/ExamManager.jsx

import { useState, useEffect } from 'react';
import styles from './ExamManager.module.css';
import {
  fetchExams,
  createExam,
  deleteExam,
  updateExam
} from '../../api/examRoutes';

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [newExam, setNewExam] = useState({
    academic_year: new Date().getFullYear(),
    term: 'Term 1',
    name: 'End Term',
    eligibleGrades: { 7: true, 8: true, 9: true }
  });
  const [editingExamId, setEditingExamId] = useState(null);
  const [activeExamId, setActiveExamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadExams = async () => {
    try {
      const data = await fetchExams();
      setExams(data.exams || []);
    } catch (err) {
      console.error('❌ Failed to fetch exams:', err);
      setMessage('❌ Failed to load exams');
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExam({ ...newExam, [name]: value });
  };

  const handleGradeToggle = (grade) => {
    setNewExam((prev) => ({
      ...prev,
      eligibleGrades: {
        ...prev.eligibleGrades,
        [grade]: !prev.eligibleGrades[grade]
      }
    }));
  };

  const isDuplicate = () => {
    return exams.some(
      (exam) =>
        exam.academic_year === parseInt(newExam.academic_year) &&
        exam.term === newExam.term &&
        exam.name === newExam.name &&
        exam.id !== editingExamId
    );
  };

  const handleCreateOrUpdate = async () => {
    setMessage('');
    if (!newExam.academic_year || !newExam.term || !newExam.name) {
      setMessage('❌ Please fill all fields.');
      return;
    }

    if (isDuplicate()) {
      setMessage('❌ An exam with the same year, term, and type already exists.');
      return;
    }

    setLoading(true);
    try {
      if (editingExamId) {
        await updateExam(editingExamId, {
          academic_year: parseInt(newExam.academic_year),
          term: newExam.term,
          name: newExam.name,
          eligible_grades: newExam.eligibleGrades
        });
        setMessage('✅ Exam updated successfully!');
      } else {
        await createExam({
          academic_year: parseInt(newExam.academic_year),
          term: newExam.term,
          name: newExam.name,
          eligible_grades: newExam.eligibleGrades
        });
        setMessage('✅ Exam added successfully!');
      }

      setNewExam({
        academic_year: new Date().getFullYear(),
        term: 'Term 1',
        name: 'End Term',
        eligibleGrades: { 7: true, 8: true, 9: true }
      });
      setEditingExamId(null);
      await loadExams();
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingExamId(exam.id);
    setNewExam({
      academic_year: exam.academic_year,
      term: exam.term,
      name: exam.name,
      eligibleGrades: exam.eligible_grades
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(id);
        setMessage('✅ Exam deleted');
        await loadExams();
      } catch (err) {
        console.error(err);
        setMessage(`❌ ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const handleSetActive = (id) => {
    setActiveExamId(id); // Only visual for now
  };

  return (
    <div className="main-content-page">
      <h2>Exam Management</h2>

      {message && (
        <div style={{ marginBottom: '10px', color: message.startsWith('✅') ? 'green' : 'crimson' }}>
          {message}
        </div>
      )}

      <div className={styles.form}>
        <input
          type="number"
          name="academic_year"
          placeholder="Year"
          value={newExam.academic_year}
          onChange={handleInputChange}
        />

        <select name="term" value={newExam.term} onChange={handleInputChange}>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>

        <select name="name" value={newExam.name} onChange={handleInputChange}>
          <option value="End Term">End Term</option>
          <option value="Midterm">Midterm</option>
          <option value="Opener">Opener</option>
        </select>

        <div className={styles.toggleSection}>
          <p>Eligible Grades:</p>
          {[7, 8, 9].map((grade) => (
            <label key={grade} className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={newExam.eligibleGrades[grade]}
                onChange={() => handleGradeToggle(grade)}
              />
              Grade {grade}
            </label>
          ))}
        </div>

        <button onClick={handleCreateOrUpdate} disabled={loading}>
          {loading ? 'Saving...' : editingExamId ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>

      <ul className={styles.examList}>
        {exams.map((exam) => (
          <li
            key={exam.id}
            className={exam.id === activeExamId ? styles.activeExam : ''}
            onClick={() => handleSetActive(exam.id)}
          >
            <strong>
              {exam.academic_year} - {exam.term} ({exam.name})
            </strong>{' '}
            | Eligible:{' '}
            {Object.entries(exam.eligible_grades || {})
              .filter(([, isEnabled]) => isEnabled)
              .map(([grade]) => `Grade ${grade}`)
              .join(', ')}
            <span className={styles.actions}>
              <button onClick={() => handleEdit(exam)}>✏️ Edit</button>
              <button onClick={() => handleDelete(exam.id)}>🗑️ Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamManager;
