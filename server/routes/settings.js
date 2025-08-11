//server/routes/settings.js
import express from 'express';
import {
  getSchoolSettings,
  updateSchoolSettings,
  getGradingSettings,
  updateGradingSettings
} from '../controllers/settingsController.js';

const router = express.Router();

// School settings endpoints
router.get('/school', getSchoolSettings);
router.post('/school', updateSchoolSettings);

// Grading settings endpoints
router.get('/grading', getGradingSettings);
router.post('/grading', updateGradingSettings);

export default router;