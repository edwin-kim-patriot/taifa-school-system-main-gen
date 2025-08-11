import pool from "../config/db.js";

// === SCHOOL SETTINGS ===
export const getSchoolSettings = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM school_settings LIMIT 1");
    res.json(
      rows[0] || {
        school_name: "",
        logo_url: "",
        academic_year: new Date().getFullYear(),
      }
    );
  } catch (error) {
    console.error("❌ Error fetching school settings:", error);
    res.status(500).json({ error: "Failed to fetch school settings." });
  }
};

export const updateSchoolSettings = async (req, res) => {
  try {
    const {
      schoolName = "",
      logoUrl = "",
      academicYear = new Date().getFullYear(),
    } = req.body;

    await pool.query("DELETE FROM school_settings");

    await pool.query(
      `
      INSERT INTO school_settings 
        (school_name, logo_url, academic_year)
      VALUES ($1, $2, $3)
    `,
      [schoolName, logoUrl, academicYear]
    );

    res.status(200).json({ message: "School settings updated successfully." });
  } catch (error) {
    console.error("❌ Error updating school settings:", error);
    res.status(500).json({ error: "Failed to update school settings." });
  }
};

// === GRADING SETTINGS ===
export const getGradingSettings = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM grading_settings LIMIT 1");
    res.json(
      rows[0] || {
        subjects: [
          "English",
          "Kiswahili",
          "Mathematics",
          "Integrated Science",
          "CRE",
          "Social Studies",
          "Agriculture & Nutrition",
          "Pre-Technical Studies",
          "Creative Arts",
        ],
        thresholds: {
          exceeding: 80,
          meeting: 60,
          approaching: 40,
        },
        overall_thresholds: {
          exceeding: 702,
          meeting: 450,
          approaching: 234,
        },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching grading settings:", error);
    res.status(500).json({ error: "Failed to fetch grading settings." });
  }
};

export const updateGradingSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    const { subjects = [], thresholds = {}, overallThresholds = {} } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({ error: "Subjects must be an array." });
    }

    const cleanedSubjects = subjects.map((s) => s.trim()).filter(Boolean);

    await client.query("BEGIN");

    // Update grading settings
    await client.query("DELETE FROM grading_settings");
    await client.query(
      `
      INSERT INTO grading_settings 
        (subjects, thresholds, overall_thresholds)
      VALUES ($1::text[], $2, $3)
    `,
      [cleanedSubjects, thresholds, overallThresholds]
    );

    // Insert new subjects (ignore duplicates)
    for (const subjectName of cleanedSubjects) {
      await client.query(
        `
        INSERT INTO subjects (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `,
        [subjectName]
      );
    }

    // Remove subjects not in the current list
    const placeholders = cleanedSubjects.map((_, i) => `$${i + 1}`).join(", ");
    await client.query(
      `
      DELETE FROM subjects
      WHERE name NOT IN (${placeholders})
    `,
      cleanedSubjects
    );

    // Remove orphaned results
    await client.query(`
      DELETE FROM results
      WHERE subject_id IS NOT NULL
        AND subject_id NOT IN (SELECT id FROM subjects)
    `);

    await client.query("COMMIT");
    res.status(200).json({
      message: "Grading settings and subjects synced successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error updating grading settings:", error);
    res.status(500).json({ error: "Failed to update grading settings." });
  } finally {
    client.release();
  }
};
