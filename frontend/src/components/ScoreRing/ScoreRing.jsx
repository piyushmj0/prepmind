import React, { useEffect, useState, useRef } from 'react';
import './ScoreRing.scss';

const ScoreRing = ({ score = 0, size = 140, strokeWidth = 10, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(score); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 75 ? 'var(--pm-success)' : score >= 50 ? 'var(--pm-warning)' : 'var(--pm-danger)';
  const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Needs Work';
  const emoji = score >= 75 ? '🎉' : score >= 50 ? '🙂' : '💪';

  return (
    <div className={`pm-score-ring ${className}`} ref={ref}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Match score: ${score}%`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="pm-score-ring__track"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="pm-score-ring__fill"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <text x="50%" y="46%" className="pm-score-ring__value" dominantBaseline="middle" textAnchor="middle">
          {animated}%
        </text>
        <text x="50%" y="62%" className="pm-score-ring__sublabel" dominantBaseline="middle" textAnchor="middle">
          Match
        </text>
      </svg>
      <p className="pm-score-ring__label">{label} {emoji}</p>
    </div>
  );
};

export default ScoreRing;

