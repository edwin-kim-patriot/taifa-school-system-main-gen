-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  admission_number INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 7 AND 9)
);

-- Exams table
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  term INTEGER CHECK (term BETWEEN 1 AND 3),
  exam_type VARCHAR(20) CHECK (exam_type IN ('OPENER', 'MID-TERM', 'END-TERM'))
);

-- Subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Results table
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  exam_id INTEGER REFERENCES exams(id),
  subject_id INTEGER REFERENCES subjects(id),
  marks DECIMAL(5,2) CHECK (marks BETWEEN 0 AND 100)
);