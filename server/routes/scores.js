// server/routes/scores.js
import express from 'express';
import { submitScores } from '../controllers/scoresController.js';

const router = express.Router();

router.post('/', submitScores);

export default router;
