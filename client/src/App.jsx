import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Presentation from './components/Presentation';
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import Migrate from './features/auth/Migrate';
import Leaderboard from './features/dashboard/Leaderboard';
import AdminDashboard from './features/admin/AdminDashboard';
import Dashboard from './pages/Dashboard';

const App = () => {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Only show presentation once per session
    const hasSeenIntro = sessionStorage.getItem('infinity_intro');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem('infinity_intro', 'true');
    setShowIntro(false);
  };

  return (
    <Router>
      {/* Show Presentation over everything if active */}
      {showIntro && <Presentation onFinish={handleIntroFinish} />}
      
      {!showIntro && (
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/migrate" element={<Migrate />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </Router>
  );
};

export default App;
