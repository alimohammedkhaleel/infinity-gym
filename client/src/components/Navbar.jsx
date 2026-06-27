import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navbarRef = useRef(null);

    // Check auth state
    const token = localStorage.getItem('gym_token');
    const isLoggedIn = !!token;
    const userRole = (() => {
        try {
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch { return null; }
    })();

    // الصفحات اللي عندها GSAP navbar animation — هتظهر الـ navbar بنفسها
    const pagesWithNavAnimation = ['/', '/services'];

    useEffect(() => {
        if (!navbarRef.current) return;
        const hasAnimation = pagesWithNavAnimation.includes(location.pathname);
        if (!hasAnimation) {
            // مفيش GSAP على الصفحة دي — نظهر الـ navbar فوراً
            navbarRef.current.style.opacity = '1';
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.pageYOffset;
            setIsScrolled(scrollY > 50);
            setIsCollapsed(scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (path) => { navigate(path); setIsMenuOpen(false); };

    const handleLogout = () => {
        localStorage.removeItem('gym_token');
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <nav
            className={`navbar ${isCollapsed ? 'collapsed' : ''} ${isScrolled ? 'scrolled' : ''}`}
            ref={navbarRef}
            style={{ opacity: 0 }}
        >
            <div className="navbar-container">
                <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    <span className="logo-text">Infinity <span className="highlight-green" style={{color: '#39ff14', textShadow: '0 0 10px rgba(57,255,20,0.5)'}}>Gym <span style={{marginLeft: '8px', fontSize: '1.2em'}}>🏋️</span></span></span>
                </a>

                <div className={`nav-user-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="nav-menu-items" style={{ direction: 'ltr' }}>
                        <button className="nav-menu-item" onClick={() => handleNavigation('/')}>
                            Home
                        </button>
                        <button className="nav-menu-item" onClick={() => handleNavigation('/services')}>
                            Services
                        </button>
                        <button className="nav-menu-item" onClick={() => handleNavigation('/leaderboard')}>
                            Leaderboard
                        </button>
                        {isLoggedIn ? (
                            <>
                                {userRole === 'admin' && (
                                    <button className="nav-menu-item nav-admin-btn" onClick={() => handleNavigation('/admin')}>
                                        ⚙️ Admin
                                    </button>
                                )}
                                <button className="nav-menu-item nav-dashboard-btn" onClick={() => handleNavigation('/dashboard')}>
                                    📊 Dashboard
                                </button>
                                <button className="nav-menu-item nav-logout-btn" onClick={handleLogout}>
                                    🚪 Logout
                                </button>
                            </>
                        ) : (
                            <button className="nav-menu-item nav-login-btn" onClick={() => handleNavigation('/login')}>
                                Login
                            </button>
                        )}
                    </div>
                </div>

                <button
                    className={`hamburger ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="hamburger-icon" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
