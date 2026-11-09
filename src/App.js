// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import ACLogin from './pages/ACLogin'; // Add this import
import ACDashboard from './pages/ACDashboard';
import ProctorDashboard from './pages/ProctorDashboard';
import ProctorLogin from './pages/ProctorLogin';
import './App.css';
// In App.js - check if you have this route
<Route path="/proctor-login" element={<ProctorLogin />} />
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/ac/login" element={<ACLogin />} /> {/* Add this route */}
          <Route path="/ac/dashboard" element={<ACDashboard />} />
          <Route path="/proctor/login" element={<ProctorLogin />} />
          <Route path="/proctor/dashboard" element={<ProctorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;