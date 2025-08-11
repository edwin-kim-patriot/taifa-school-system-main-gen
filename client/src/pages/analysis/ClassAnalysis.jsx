import { useState, useEffect } from 'react';
import { fetchClassAnalysis } from '../../api/analysis';
import styles from './ClassAnalysis.module.css';

export default function ClassAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchClassAnalysis(currentTerm);
      setAnalysis(data);
    };
    loadData();
  }, [currentTerm]);

  return (
    <div className={styles.container}>
      <h2>Class Performance Analysis</h2>
      
      <div className={styles.termSelector}>
        <label>Term:</label>
        <select value={currentTerm} onChange={(e) => setCurrentTerm(e.target.value)}>
          <option value={1}>Term 1</option>
          <option value={2}>Term 2</option>
          <option value={3}>Term 3</option>
        </select>
      </div>

      {analysis && (
        <div className={styles.analysisSections}>
          {/* Performance Distribution */}
          <div className={styles.section}>
            <h3>Performance Distribution</h3>
            <table>
              <thead>
                <tr>
                  <th>Performance Level</th>
                  <th>Number of Students</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analysis.performanceDistribution.map((item) => (
                  <tr key={item.level}>
                    <td>{item.level}</td>
                    <td>{item.count}</td>
                    <td>{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subject Performance */}
          <div className={styles.section}>
            <h3>Subject Performance</h3>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Mean Score</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {analysis.subjectPerformance.map((subject) => (
                  <tr key={subject.name}>
                    <td>{subject.name}</td>
                    <td>{subject.meanScore.toFixed(1)}%</td>
                    <td>{subject.performance}</td>
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