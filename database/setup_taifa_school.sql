-- setup_taifa_school.sql

-- Create Tables
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  admission_number INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_eligible_grades (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id),
  score NUMERIC(5,2) NOT NULL,
  exam_type VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL,
  year VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS school_settings (
  id SERIAL PRIMARY KEY,
  school_name VARCHAR(255),
  logo_url TEXT,
  academic_year VARCHAR(20)
);

-- Seed Data
INSERT INTO subjects (name) VALUES
('English'), ('Kiswahili'), ('Mathematics'),
('Integrated Science'), ('CRE'), ('Social Studies'),
('Agriculture & Nutrition'), ('Pre-Technical Studies'), ('Creative Arts');

INSERT INTO school_settings (school_name, logo_url, academic_year)
VALUES ('Taifa School', 'https://example.com/logo.png', '2025');

-- ('English') as ENG, ('Kiswahili')as ENG, ('Mathematics') as MATH,
-- ('Integrated Science') as INT'SCI, ('Religious Eductaion') as R/L, ('Social Studies') as SST,
-- ('Agriculture & Nutrition') as AGRI&NUT, ('Pre-Technical Studies')as PRE-TECH, ('Creative Arts') as C/ARTS;