import React, { useState, useEffect } from 'react';
import './SplashLoader.scss';

const HINTS = [
  'Warming up your AI coach…',
  'Preparing your interview toolkit…',
  'Loading personalization engine…',
];

const SplashLoader = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);
  const [hint, setHint] = useState(HINTS[0]);

  useEffect(() => {
    // Cycle through hints
    let i = 0;
    const hintInterval = setInterval(() => {
      i = (i + 1) % HINTS.length;
      setHint(HINTS[i]);
    }, 600);

    // Auto-complete after animation
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onComplete?.(), 600);
    }, 1800);

    return () => {
      clearInterval(hintInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className={`pm-splash ${exiting ? 'pm-splash--exit' : ''}`} aria-label="Loading PrepMind" role="status">
      <div className="pm-splash__logo-wrap">
        <div className="pm-splash__pulse" />
        <svg className="pm-splash__logo-svg" viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <linearGradient id="splash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--pm-violet)" />
              <stop offset="50%" stopColor="var(--pm-blue)" />
              <stop offset="100%" stopColor="var(--pm-cyan)" />
            </linearGradient>
          </defs>
          {/* Brain / sparkle icon */}
          <path
            className="logo-path"
            d="M40 12 C25 12, 14 23, 14 38 C14 48, 20 56, 28 60 L28 68 L52 68 L52 60 C60 56, 66 48, 66 38 C66 23, 55 12, 40 12Z"
          />
          <path
            className="logo-fill"
            d="M40 12 C25 12, 14 23, 14 38 C14 48, 20 56, 28 60 L28 68 L52 68 L52 60 C60 56, 66 48, 66 38 C66 23, 55 12, 40 12Z"
            fill="url(#splash-gradient)"
            opacity="0.15"
          />
          {/* Neural connections */}
          <circle className="logo-fill" cx="32" cy="34" r="3" fill="url(#splash-gradient)" />
          <circle className="logo-fill" cx="48" cy="34" r="3" fill="url(#splash-gradient)" />
          <circle className="logo-fill" cx="40" cy="46" r="3" fill="url(#splash-gradient)" />
          <line className="logo-path" x1="32" y1="34" x2="48" y2="34" strokeWidth="1.5" />
          <line className="logo-path" x1="32" y1="34" x2="40" y2="46" strokeWidth="1.5" />
          <line className="logo-path" x1="48" y1="34" x2="40" y2="46" strokeWidth="1.5" />
        </svg>
      </div>

      <span className="pm-splash__brand">PrepMind</span>

      <div className="pm-splash__progress">
        <div className="pm-splash__progress-bar" />
      </div>

      <span className="pm-splash__hint" aria-live="polite">{hint}</span>
    </div>
  );
};

export default SplashLoader;

