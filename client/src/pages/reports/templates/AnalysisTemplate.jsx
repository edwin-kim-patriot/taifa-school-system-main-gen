// /client/src/pages/reports/templates/AnalysisTemplate.jsx
import React from 'react';
import styles from './AnalysisTemplate.module.css';

const AnalysisTemplate = ({
  subjectResults = [],
  overallMean = 0,
  overallPerformance = '',
  performanceLevels = {},
  totalStudents = 0
}) => {
  const dateString = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const performanceData = [
    { level: 'EXCEEDING EXPECTATION', count: performanceLevels['EXCEEDING EXPECTATION'] || 0 },
    { level: 'MEETING EXPECTATION', count: performanceLevels['MEETING EXPECTATION'] || 0 },
    { level: 'APPROACHING EXPECTATION', count: performanceLevels['APPROACHING EXPECTATION'] || 0 },
    { level: 'BELOW EXPECTATION', count: performanceLevels['BELOW EXPECTATION'] || 0 }
  ];

  const getPerformanceStyle = (score, isOverall = false) => {
    const num = parseFloat(score);
    if (isNaN(num)) return {};

    if (isOverall) {
      if (num >= 702) return { color: '#27ae60', fontWeight: 'bold' }; // Exceeding
      if (num >= 450) return { color: '#2980b9', fontWeight: 'bold' }; // Meeting
      if (num >= 234) return { color: '#f39c12', fontWeight: 'bold' }; // Approaching
      return { color: '#e74c3c', fontWeight: 'bold' };                 // Below
    } else {
      if (num >= 80) return { color: '#27ae60', fontWeight: 'bold' };
      if (num >= 60) return { color: '#2980b9', fontWeight: 'bold' };
      if (num >= 40) return { color: '#f39c12', fontWeight: 'bold' };
      return { color: '#e74c3c', fontWeight: 'bold' };
    }
  };

  return (
    <div className={styles.analysisContainer}>
      <h1 className={styles.mainTitle}>
        Grade 9 Performance Analysis
      </h1>
      <p className={styles.generationDate}>Generated on {dateString}</p>
      
      <h2 className={styles.sectionTitle}>Student Performance Distribution</h2>
      <table className={styles.analysisTable}>
        <thead>
          <tr>
            <th>Performance Level</th>
            <th>Number of Students</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((item, index) => (
            <tr key={index}>
              <td>{item.level}</td>
              <td>{item.count}</td>
              <td>{totalStudents > 0 ? ((item.count / totalStudents) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
          ))}
          <tr className={styles.totalRow}>
            <td><strong>TOTAL</strong></td>
            <td><strong>{totalStudents}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tbody>
      </table>
      
      <h2 className={styles.sectionTitle}>Subject Performance</h2>
      <table className={styles.analysisTable}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Mean Score</th>
            <th>Performance Level</th>
          </tr>
        </thead>
        <tbody>
          {subjectResults.map((subject, index) => (
            <tr key={index}>
              <td>{subject.name}</td>
              <td>{subject.mean.toFixed(1)}%</td>
              <td style={getPerformanceStyle(subject.mean)}>{subject.performance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.summaryBox}>
        <h2 className={styles.sectionTitle}>Overall Grade Performance</h2>
        <p><strong>Average Total Score:</strong> {overallMean.toFixed(1)}/900</p>
        <p>
          <strong>Performance Level:</strong> 
          <span style={getPerformanceStyle(overallMean, true)}> {overallPerformance}</span>
        </p>
      </div>
    </div>
  );
};

export default AnalysisTemplate;
