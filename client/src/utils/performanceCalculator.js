// performanceUtils.js

/**
 * Calculates performance level based on score
 * @param {number} score - The score to evaluate
 * @param {string} type - 'subject' or 'overall' (default: 'subject')
 * @returns {string} Performance level
 */
export const calculatePerformance = (score, type = 'subject') => {
  const numericScore = Number(score);
  
  if (isNaN(numericScore)) return 'N/A';

  if (type === 'subject') {
    if (numericScore >= 80) return 'EXCEEDING EXPECTATION';
    if (numericScore >= 60) return 'MEETING EXPECTATION';
    if (numericScore >= 40) return 'APPROACHING EXPECTATION';
    return 'BELOW EXPECTATION';
  } else {
    if (numericScore >= 702) return 'EXCEEDING EXPECTATION';
    if (numericScore >= 450) return 'MEETING EXPECTATION';
    if (numericScore >= 234) return 'APPROACHING EXPECTATION';
    return 'BELOW EXPECTATION';
  }
};

export const getPerformanceColor = (level) => {
  const colors = {
    'EXCEEDING EXPECTATION': '#27ae60', // Green
    'MEETING EXPECTATION': '#2980b9',   // Blue
    'APPROACHING EXPECTATION': '#f39c12', // Orange
    'BELOW EXPECTATION': '#e74c3c'      // Red
  };
  return colors[level] || '#95a5a6'; // Default gray
};







// /**
//  * Calculates performance level based on score
//  * @param {number} score - The score to evaluate
//  * @param {string} type - 'subject' or 'overall' (default: 'subject')
//  * @returns {string} Performance level
//  */
// export const calculatePerformance = (score, type = 'subject') => {
//   const numericScore = Number(score);
  
//   if (isNaN(numericScore)) return 'N/A';

//   if (type === 'subject') {
//     if (numericScore >= 80) return 'EXCEEDING EXPECTATION';
//     if (numericScore >= 60) return 'MEETING EXPECTATION';
//     if (numericScore >= 40) return 'APPROACHING EXPECTATION';
//     return 'BELOW EXPECTATION';
//   } else {
//     // For overall performance (different thresholds)
//     if (numericScore >= 702) return 'EXCEEDING EXPECTATION';
//     if (numericScore >= 450) return 'MEETING EXPECTATION';
//     if (numericScore >= 234) return 'APPROACHING EXPECTATION';
//     return 'BELOW EXPECTATION';
//   }
// };

// // Optional: Add performance color mapping
// export const getPerformanceColor = (level) => {
//   const colors = {
//     'EXCEEDING EXPECTATION': '#27ae60', // Green
//     'MEETING EXPECTATION': '#2980b9',   // Blue
//     'APPROACHING EXPECTATION': '#f39c12', // Orange
//     'BELOW EXPECTATION': '#e74c3c'      // Red
//   };
//   return colors[level] || '#95a5a6'; // Default gray
// };