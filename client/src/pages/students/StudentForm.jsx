// /client/src/components/StudentForm.jsx

import { useState } from 'react';
import { addStudent } from '../../api/students';
import styles from './StudentForm.module.css';

export default function StudentForm({ onStudentAdded }) {
  const [formData, setFormData] = useState({
    admission_number: '',
    name: '',
    grade: 9
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStudent(formData);
      onStudentAdded();
      setFormData({ admission_number: '', name: '', grade: 9 });
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Student</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Admission Number:</label>
          <input
            type="number"
            value={formData.admission_number}
            onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
            required
            min="1"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Full Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Grade:</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
          >
            <option value={7}>Grade 7</option>
            <option value={8}>Grade 8</option>
            <option value={9}>Grade 9</option>
          </select>
        </div>

        <button type="submit" className={styles.submitButton}>
          Add Student
        </button>
      </form>
    </div>
  );
}
