// server/routes/subjects.js

import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET all subjects
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subjects ORDER BY id');
    const subjects = result.rows;

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ error: 'No subjects found' });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error.stack || error.message);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

export default router;
