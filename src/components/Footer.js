import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';
import '../css/Footer.scss';

const Footer = () => (
  <footer className="footer-custom">
    <div className="footer-container">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="logo-icon"><FiZap /></div>
            <span>Pixel<span>Forge</span></span>
          </Link>
          <p>The next-generation AI image platform. Generate, upscale, and enhance images with cutting-edge AI technology.</p>
          <div className="social-links">
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="GitHub"><FiGithub /></a>
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/generate">AI Generator</Link>
            <Link to="/upscaler">AI Upscaler</Link>
            <Link to="/#features">Features</Link>
            <Link to="/#pricing">Pricing</Link>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <Link to="/generate">Image Generation</Link>
            <Link to="/upscaler">HD Upscaling</Link>
            <Link to="/upscaler">4K Enhancement</Link>
            <Link to="/upscaler">8K Upscaler</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} PixelForge. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
