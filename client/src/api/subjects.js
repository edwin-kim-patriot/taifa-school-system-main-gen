// client/src/api/subjects.js
import axios from 'axios';

export const fetchSubjects = async () => {
  const response = await axios.get('/api/subjects');
  return response.data;
};
