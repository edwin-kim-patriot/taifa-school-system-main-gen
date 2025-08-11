import React, { useEffect, useState } from 'react';
import AnalysisTemplate from './templates/AnalysisTemplate';
import { fetchPerformanceAnalysis } from '../../api/performanceAnalysis';
import styles from './analysisGenerator.module.css';
const AnalysisGenerator = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const response = await fetchPerformanceAnalysis(); // API call
        setAnalysisData(response.data);
      } catch (err) {
        console.error('Error fetching performance analysis:', err);
        setError('Failed to load analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getAnalysis();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading performance analysis...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
  }

  if (!analysisData) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>No data available.</div>;
  }

  const {
    subjectResults,
    overallMean,
    overallPerformance,
    performanceLevels,
    totalStudents
  } = analysisData;

  return (
    <div className={styles.generatorContainer}>
    <AnalysisTemplate
      subjectResults={subjectResults}
      overallMean={overallMean}
      overallPerformance={overallPerformance}
      performanceLevels={performanceLevels}
      totalStudents={totalStudents}
    />
  </div>
  );
};

export default AnalysisGenerator;
