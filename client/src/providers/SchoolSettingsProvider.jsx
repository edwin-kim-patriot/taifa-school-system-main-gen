//C:\taifa-school-system-main\client\src\providers\SchoolSettingsProvider.jsx

import { useState, useEffect } from 'react';
import { SchoolSettingsContext } from '../contexts/SchoolSettingsContext';

// Default fallback settings
const defaultSettings = {
  schoolName: 'Taifa School',
  logoUrl: '',
  academicYear: '2025',
  term: 'Term 1',
  terms: ['Term 1', 'Term 2', 'Term 3'],
  examTypes: ['Opener', 'Mid Term', 'End Term']
};

export const SchoolSettingsProvider = ({ children }) => {
  const [schoolName, setSchoolName] = useState(defaultSettings.schoolName);
  const [logoUrl, setLogoUrl] = useState(defaultSettings.logoUrl);
  const [academicYear, setAcademicYear] = useState(defaultSettings.academicYear);
  const [term, setTerm] = useState(defaultSettings.term);
  const [terms, setTerms] = useState(defaultSettings.terms);
  const [examTypes, setExamTypes] = useState(defaultSettings.examTypes);

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('schoolSettings'));
    if (saved) {
      setSchoolName(saved.schoolName || defaultSettings.schoolName);
      setLogoUrl(saved.logoUrl || defaultSettings.logoUrl);
      setAcademicYear(saved.academicYear || defaultSettings.academicYear);
      setTerm(saved.term || defaultSettings.term);
      setTerms(saved.terms || defaultSettings.terms);
      setExamTypes(saved.examTypes || defaultSettings.examTypes);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const settings = { schoolName, logoUrl, academicYear, term, terms, examTypes };
    localStorage.setItem('schoolSettings', JSON.stringify(settings));
  }, [schoolName, logoUrl, academicYear, term, terms, examTypes]);

  return (
    <SchoolSettingsContext.Provider
      value={{
        schoolName,
        logoUrl,
        academicYear,
        term,
        terms,
        examTypes,
        setSchoolName,
        setLogoUrl,
        setAcademicYear,
        setTerm,
        setTerms,
        setExamTypes
      }}
    >
      {children}
    </SchoolSettingsContext.Provider>
  );
};
