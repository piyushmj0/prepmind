import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => (
  <footer className="pm-footer">
    <div className="pm-footer__inner">
      <div className="pm-footer__top">
        <div className="pm-footer__brand">
          <div className="pm-footer__logo">PrepMind</div>
          <p className="pm-footer__tagline">
            AI-powered interview preparation. Upload your resume, paste the job description,
            and get a personalized strategy in seconds.
          </p>
        </div>

        <div className="pm-footer__links">
          <div>
            <div className="pm-footer__col-title">Product</div>
            <div className="pm-footer__col-links">
              <Link to="/register" className="pm-footer__link">Get Started</Link>
              <button className="pm-footer__link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
              <button className="pm-footer__link" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>FAQ</button>
            </div>
          </div>
          <div>
            <div className="pm-footer__col-title">Account</div>
            <div className="pm-footer__col-links">
              <Link to="/login" className="pm-footer__link">Login</Link>
              <Link to="/register" className="pm-footer__link">Register</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-footer__bottom">
        <p className="pm-footer__copy">&copy; {new Date().getFullYear()} PrepMind. All rights reserved.</p>
        <p className="pm-footer__built-with">
          Built with <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">Gemini AI</a> &amp; React
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

