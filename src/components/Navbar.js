import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiMenu, FiX, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import '../css/Navbar.scss';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Generator', href: '/generate' },
    { label: 'Upscaler', href: '/upscaler' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  return (
    <motion.nav
      className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4,0,0.2,1] }}
    >
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <FiZap />
          </div>
          <span className="logo-text">Pixel<span>Forge</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <Link to="/dashboard" className="btn-glass btn-sm">
                <FiGrid size={14} />
                Dashboard
              </Link>
              <div className="user-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar-circle">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="dropdown-header">
                        <div className="dropdown-name">{user.name}</div>
                        <div className="dropdown-email">{user.email}</div>
                        <div className="dropdown-credits">
                          <FiZap size={12} />
                          {user.credits} credits
                        </div>
                      </div>
                      <Link to="/dashboard" className="dropdown-item">
                        <FiGrid size={14} /> Dashboard
                      </Link>
                      <Link to="/history" className="dropdown-item">
                        <FiUser size={14} /> My Images
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item danger">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-glass btn-sm">Login</Link>
              <Link to="/register" className="btn-primary-gradient btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className="mobile-nav-link">
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="mobile-auth-btns" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <Link to="/dashboard" className="btn-glass w-100 justify-content-center" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <FiGrid size={14} /> Dashboard
                </Link>
                <Link to="/history" className="btn-glass w-100 justify-content-center" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <FiUser size={14} /> My Creations
                </Link>
                <button onClick={handleLogout} className="btn-glass w-100 justify-content-center danger" style={{ display: 'flex', gap: '8px', width: '100%', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', padding: '10px', borderRadius: '50px', cursor: 'pointer' }}>
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" className="btn-glass w-100 justify-content-center">Login</Link>
                <Link to="/register" className="btn-primary-gradient w-100 justify-content-center">Get Started</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
