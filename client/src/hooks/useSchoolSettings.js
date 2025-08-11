import { useContext } from 'react';
import { SchoolSettingsContext } from '../contexts/SchoolSettingsContext';

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    throw new Error('useSchoolSettings must be used within a SchoolSettingsProvider');
  }
  return context;
};
