import React, { useState, useEffect } from 'react';
import './GenerationLoader.scss';

const STEPS = [
  { label: 'Analyzing your resume…', pct: 15 },
  { label: 'Matching with job requirements…', pct: 35 },
  { label: 'Generating technical questions…', pct: 55 },
  { label: 'Crafting behavioral scenarios…', pct: 70 },
  { label: 'Building your prep plan…', pct: 85 },
  { label: 'Finalizing your strategy…', pct: 95 },
];

const TIPS = [
  '💡 Practice answering questions out loud — it builds confidence.',
  '🎯 Research the company culture before your interview.',
  '📝 Prepare 2-3 stories using the STAR method.',
  '⏰ Arrive 10-15 minutes early for in-person interviews.',
  '🤝 Send a thank-you email within 24 hours after interviewing.',
  '📊 Tailor your resume keywords to each specific job.',
];

const GenerationLoader = ({ onCancel }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 3500);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(tipTimer);
  }, []);

  const currentStep = STEPS[stepIndex];

  return (
    <div className="pm-gen-loader" role="status" aria-live="polite" aria-label="Generating interview report">
      {/* Animated orb */}
      <div className="pm-gen-loader__orb-wrap">
        <div className="pm-gen-loader__orb" />
        <div className="pm-gen-loader__orbit">
          <div className="pm-gen-loader__particle" />
          <div className="pm-gen-loader__particle" />
          <div className="pm-gen-loader__particle" />
        </div>
        <div className="pm-gen-loader__orbit">
          <div className="pm-gen-loader__particle" />
          <div className="pm-gen-loader__particle" />
        </div>
      </div>

      {/* Text */}
      <div className="pm-gen-loader__text">
        <h2 className="pm-gen-loader__title">Building Your Strategy</h2>
        <p className="pm-gen-loader__step">{currentStep.label}</p>
      </div>

      {/* Progress bar */}
      <div className="pm-gen-loader__progress">
        <div
          className="pm-gen-loader__progress-fill"
          style={{ width: `${currentStep.pct}%` }}
        />
      </div>

      {/* Rotating tip */}
      <p className="pm-gen-loader__tip">{TIPS[tipIndex]}</p>

      {/* Cancel */}
      {onCancel && (
        <button className="pm-gen-loader__cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default GenerationLoader;

