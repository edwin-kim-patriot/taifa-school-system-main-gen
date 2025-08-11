import { useState } from 'react';
// ... other imports
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import StudentList from './pages/students/StudentList';
import ExamManager from './pages/exams/ExamManager';
import ResultEntry from './pages/exams/ResultEntry';
import ReportGenerator from './pages/reports/ReportGenerator';
import ReportViewer from './pages/reports/ReportViewer';
import SchoolSettings from './pages/settings/SchoolSettings';
import GradingSettings from './pages/settings/GradingSettings';
import ErrorBoundary from './components/common/ErrorBoundary';
import AnalysisGenerator from './pages/reports/AnalysisGenerator';
 import { TermExamProvider } from "./providers/TermExamProvider";

import { SchoolSettingsProvider } from "./providers/SchoolSettingsProvider";


import './styles/globals.css';
export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SchoolSettingsProvider>
      <TermExamProvider>
        <Router>
          <div className={`app-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="main-content">
              <Navbar />
              <Routes>
                {/* your routes */}
                <Route path="/students" element={<StudentList />} />
                <Route path="/exams" element={<ExamManager />} />
                <Route path="/exams/entry" element={<ResultEntry />} />
                <Route path="/reports" element={<ReportGenerator />} />
                <Route path="/performance-analysis" element={<AnalysisGenerator />} />
                <Route path="/reports/preview" element={<ReportViewer />} />
                <Route path="/settings" element={<SchoolSettings />} />
                <Route
                  path="/settings/grading"
                  element={
                    <ErrorBoundary>
                      <GradingSettings />
                    </ErrorBoundary>
                  }
                />
                <Route path="/" element={<StudentList />} />
              </Routes>
            </div>
          </div>
        </Router>
      </TermExamProvider>
    </SchoolSettingsProvider>
  );
}
