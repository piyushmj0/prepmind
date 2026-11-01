import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Menu, X, Settings, LogOut, FileText, Sparkles } from 'lucide-react';
import Button from '../../components/Button/Button';
import './Navbar.scss';

const Navbar = ({ variant = 'landing' }) => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSignOut = async () => {
    setDropdownOpen(false);
    await handleLogout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  const scrollToSection = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="pm-navbar" role="navigation" aria-label="Main navigation">
      <Link to="/" className="pm-navbar__logo" aria-label="PrepMind home">
        <span className="pm-navbar__logo-mark"><Sparkles /></span>
        PrepMind
      </Link>

      {/* Desktop center links */}
      {variant === 'landing' && (
        <div className="pm-navbar__center">
          <button className="pm-navbar__link" onClick={() => scrollToSection('features')}>Features</button>
          <button className="pm-navbar__link" onClick={() => scrollToSection('how-it-works')}>How it works</button>
          <button className="pm-navbar__link" onClick={() => scrollToSection('faq')}>FAQ</button>
        </div>
      )}

      {variant === 'app' && (
        <div className="pm-navbar__center">
          <Link to="/dashboard" className="pm-navbar__link">Dashboard</Link>
        </div>
      )}

      <div className="pm-navbar__right">
        {!user ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </>
        ) : (
          <div className="pm-navbar__user-wrap" ref={dropdownRef}>
            <button
              className="pm-navbar__user-btn"
              onClick={() => setDropdownOpen(v => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="pm-navbar__avatar">{getInitials(user.username)}</span>
              {user.username}
            </button>

            {dropdownOpen && (
              <div className="pm-navbar__dropdown">
                <div className="pm-navbar__dropdown-header">
                  <span className="pm-navbar__avatar">{getInitials(user.username)}</span>
                  <div>
                    <strong>{user.username}</strong>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="pm-navbar__dropdown-menu">
                  <button
                    className="pm-navbar__dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                  >
                    <Settings size={16} /> Edit Profile
                  </button>
                  <button
                    className="pm-navbar__dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                  >
                    <FileText size={16} /> My Reports
                  </button>
                  <button className="pm-navbar__dropdown-item pm-navbar__dropdown-item--danger" onClick={onSignOut}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="pm-navbar__hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="pm-navbar__mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="pm-navbar__mobile-drawer">
            <button className="pm-navbar__mobile-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={24} />
            </button>
            {variant === 'landing' && (
              <>
                <button className="pm-navbar__mobile-drawer-link" onClick={() => scrollToSection('features')}>Features</button>
                <button className="pm-navbar__mobile-drawer-link" onClick={() => scrollToSection('how-it-works')}>How it works</button>
                <button className="pm-navbar__mobile-drawer-link" onClick={() => scrollToSection('faq')}>FAQ</button>
              </>
            )}
            {!user ? (
              <>
                <button className="pm-navbar__mobile-drawer-link" onClick={() => { setMobileOpen(false); navigate('/login'); }}>Login</button>
                <Button variant="primary" fullWidth onClick={() => { setMobileOpen(false); navigate('/register'); }}>Get Started</Button>
              </>
            ) : (
              <>
                <button className="pm-navbar__mobile-drawer-link" onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}>Dashboard</button>
                <button className="pm-navbar__mobile-drawer-link" onClick={() => { setMobileOpen(false); navigate('/profile'); }}>Edit Profile</button>
                <Button variant="danger" fullWidth onClick={onSignOut}>Log Out</Button>
              </>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;

