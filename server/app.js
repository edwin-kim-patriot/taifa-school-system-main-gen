
///home/edwin-bett/taifa-school-system/server/app.js

import express from 'express';
import cors from 'cors';
import examRoutes from './routes/examRoutes.js';
import studentRoutes from './routes/students.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import subjectsRoutes from './routes/subjects.js';
import scoresRoutes from './routes/scores.js';
import performanceAnalysisRoutes from './routes/performanceAnalysis.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api', examRoutes)
// app.use('/api/reports', performanceAnalysisRoutes); // ✅ Mounted here
app.use('/api/performance-analysis', performanceAnalysisRoutes);
// Health check
app.get('/', (req, res) => {
  res.send('✅ Taifa School System API is running...');
});

app.use((req, res, next) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
