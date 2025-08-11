// client/src/providers/TermExamProvider.jsx

import { useState, useEffect } from 'react';
import { TermExamContext } from '../contexts/TermExamContext';

export const TermExamProvider = ({ children }) => {
  const [term, setTerm] = useState('Term 1');
  const [examType, setExamType] = useState('Opener');

  useEffect(() => {
    const storedTerm = localStorage.getItem('selectedTerm');
    const storedExamType = localStorage.getItem('selectedExamType');
    if (storedTerm) setTerm(storedTerm);
    if (storedExamType) setExamType(storedExamType);
  }, []);

  const updateTerm = (newTerm) => {
    setTerm(newTerm);
    localStorage.setItem('selectedTerm', newTerm);
  };

  const updateExamType = (newType) => {
    setExamType(newType);
    localStorage.setItem('selectedExamType', newType);
  };

  return (
    <TermExamContext.Provider value={{ term, examType, updateTerm, updateExamType }}>
      {children}
    </TermExamContext.Provider>
  );
};
