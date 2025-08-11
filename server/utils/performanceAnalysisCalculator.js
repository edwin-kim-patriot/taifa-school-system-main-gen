// /server/utils/performanceAnalysisCalculator.js
export const getGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  };
  
  export const calculatePerformance = (score) => {
    if (score >= 80) return 'EXCEEDING EXPECTATION';
    if (score >= 60) return 'MEETING EXPECTATION';
    if (score >= 40) return 'APPROACHING EXPECTATION';
    return 'BELOW EXPECTATION';
  };
  