import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import IssueReturn from './pages/IssueReturn';
import FacilityBooking from './pages/FacilityBooking';
import Maintenance from './pages/Maintenance';
import Fines from './pages/Fines';
import LectureSchedule from './pages/LectureSchedule';
import Students from './pages/Students';

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/issues" element={<IssueReturn />} />
            <Route path="/bookings" element={<FacilityBooking />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fines" element={<Fines />} />
            <Route path="/schedules" element={<LectureSchedule />} />
            <Route path="/students" element={<Students />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <p>
              <strong>Sports Equipment Management System</strong> &bull; College DBMS Mini Project
            </p>
            <p className="footer-subtext">
              Department of Computer Engineering &bull; Relational Database Management System (AY 2026-27)
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
