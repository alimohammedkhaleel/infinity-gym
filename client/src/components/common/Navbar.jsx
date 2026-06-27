import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          Infinity <span className="highlight-green">Gym</span>
        </Link>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>
            الرئيسية
          </Link>
          <Link to="/services" className={`nav-item ${location.pathname === '/services' ? 'active' : ''}`} onClick={closeMenu}>
            الخدمات
          </Link>
          <Link to="/login" className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>
            تسجيل الدخول
          </Link>
          <Link to="/leaderboard" className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`} onClick={closeMenu}>
            أوائل الدعوات
          </Link>
        </div>

        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
