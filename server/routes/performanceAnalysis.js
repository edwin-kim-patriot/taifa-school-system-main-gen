// /server/routes/performanceAnalysis.js
import express from 'express';
import performanceAnalysis from '../controllers/performanceAnalysisController.js';


const router = express.Router();

// GET /api/performance-analysis
router.get('/', performanceAnalysis);

export default router;