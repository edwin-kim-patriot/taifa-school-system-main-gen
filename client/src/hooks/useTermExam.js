import { useContext } from 'react';
import { TermExamContext } from '../contexts/TermExamContext';

export const useTermExam = () => {
  const context = useContext(TermExamContext);
  if (!context) {
    throw new Error('useTermExam must be used within a TermExamProvider');
  }
  return context;
};
