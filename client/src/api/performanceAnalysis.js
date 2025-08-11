// /client/src/api/performanceAnalysis.js
import axios from 'axios';

export const fetchPerformanceAnalysis = async () => {
  const response = await axios.get('/api/performance-analysis');
  return response;
};
