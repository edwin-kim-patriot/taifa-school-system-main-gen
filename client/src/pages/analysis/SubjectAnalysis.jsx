import { useState, useEffect } from 'react';
import { fetchSubjectAnalysis } from '../../api/analysis';
import styles from './SubjectAnalysis.module.css';

export default function SubjectAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('English');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchSubjectAnalysis(selectedSubject);
      setAnalysis(data);
    };
    loadData();
  }, [selectedSubject]);

  return (
    <div className={styles.container}>
      <h2>Subject Performance Analysis</h2>
      
      <div className={styles.subjectSelector}>
        <label>Subject:</label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="English">English</option>
          <option value="Kiswahili">Kiswahili</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Integrated Science">Integrated Science</option>
          <option value="CRE">CRE</option>
          <option value="Social Studies">Social Studies</option>
          <option value="Agriculture & Nutrition">Agriculture & Nutrition</option>
          <option value="Pre-Technical Studies">Pre-Technical Studies</option>
          <option value="Creative Arts">Creative Arts</option>
        </select>
      </div>

      {analysis && (
        <div className={styles.analysisGrid}>
          <div className={styles.summaryCard}>
            <h3>Overall Performance</h3>
            <div className={styles.metric}>Mean Score: {analysis.meanScore}%</div>
            <div className={styles.metric}>Top Student: {analysis.topStudent.name} ({analysis.topStudent.score}%)</div>
          </div>

          <div className={styles.gradeDistribution}>
            <h3>Grade Distribution</h3>
            <table>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analysis.gradeDistribution.map((grade) => (
                  <tr key={grade.letter}>
                    <td>{grade.letter}</td>
                    <td>{grade.count}</td>
                    <td>{grade.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}