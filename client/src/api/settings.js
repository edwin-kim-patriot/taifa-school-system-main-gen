
// /home/edwin-bett/taifa-school-system/client/src/api/settings.js
import axios from 'axios';

export const fetchSchoolSettings = async () => {
  const response = await axios.get('/api/settings/school');
  return response.data;
};

export const updateSchoolSettings = async (settings) => {
  await axios.post('/api/settings/school', settings);
};

export const fetchGradingSettings = async () => {
  const response = await axios.get('/api/settings/grading');
  return response.data;
};

export const updateGradingSettings = async (settings) => {
  await axios.post('/api/settings/grading', settings);
};