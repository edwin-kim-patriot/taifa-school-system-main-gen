
-- C:\taifa-school-system-main\database\init_data.sql
-- Insert Subjects (ignore duplicates)
INSERT INTO subjects (name, code) VALUES
  ('ENGLISH', 'ENG'),
  ('KISWAHILI', 'KIS'),
  ('MATHEMATICS', 'MATH'),
  ('INTEGRATED SCIENCE', 'SCI'),
  ('CRE', 'CRE'),
  ('SOCIAL STUDIES', 'SOC'),
  ('AGRICULTURE & NUTRITION', 'AGR'),
  ('PRE-TECHNICAL STUDIES', 'TECH'),
  ('CREATIVE ARTS', 'ART')
ON CONFLICT (code) DO NOTHING;

-- Insert Students (ignore duplicates)
INSERT INTO students (admission_number, name, grade) VALUES
  (1001, 'JEPTANUI,CONIE', 9),
  (1002, 'JEPKOECH,IVY', 9),
  (1003, 'SALLY,ELIZABETH', 9),
  (1004, 'MONICA WAIRIMU', 9),
  (1005, 'EKIDOR,ALFRED', 9),
  (1006, 'NELIMA,BELINDA', 9),
  (1007, 'PENINAH WANGARI', 9),
  (1008, 'ZUHURA,MTIMBA', 9),
  (1009, 'JERUTO,ZILPAH', 9),
  (1010, 'MITCHEL JEROP', 9)
ON CONFLICT (admission_number) DO NOTHING;
