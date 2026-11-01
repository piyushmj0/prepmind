import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, MessageSquare, Brain, AlertTriangle, CalendarDays, Shield, ChevronDown
} from 'lucide-react';
import Navbar from '../../../layouts/Navbar/Navbar';
import Footer from '../../../layouts/Footer/Footer';
import Button from '../../../components/Button/Button';
import './Landing.scss';

// Lazy-load HeroScene
const HeroScene = lazy(() => import('../components/HeroScene/HeroScene'));

// ── Scroll reveal hook ──────────────────────────────────────
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

const RevealSection = ({ children, className = '', delay = 0, ...props }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`pm-reveal ${visible ? 'pm-reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

// ── FAQ Data ────────────────────────────────────────────────
const FAQS = [
  { q: 'How does PrepMind generate interview questions?', a: 'PrepMind uses Google\'s Gemini AI to analyze your resume against the target job description. It identifies key skills, experience gaps, and role requirements to generate highly relevant technical and behavioral questions tailored to your specific situation.' },
  { q: 'What file formats are supported for resume upload?', a: 'We support PDF (.pdf), Microsoft Word (.doc, .docx) files up to 5 MB. The AI extracts and analyzes the text content from your resume.' },
  { q: 'Is my data secure and private?', a: 'Absolutely. Your resume and job description are processed in real-time and not stored permanently. We use encrypted connections (HTTPS) and HTTP-only cookies for authentication. Your data is never shared with third parties.' },
  { q: 'How accurate is the Match Score?', a: 'The Match Score analyzes keyword overlap, skill alignment, and experience relevance between your resume and the job description. While it\'s a helpful indicator, we recommend using it alongside the detailed skill gap analysis for a complete picture.' },
  { q: 'Can I use PrepMind for free?', a: 'Yes! PrepMind is currently free to use. Create an account, upload your resume, and start generating personalized interview strategies right away.' },
  { q: 'How long does it take to generate a report?', a: 'Report generation typically takes 10-30 seconds depending on the complexity of your resume and the job description. During this time, our AI analyzes multiple dimensions of your profile.' },
];

// ── Features Data ───────────────────────────────────────────
const FEATURES = [
  { icon: <Target size={22} />, title: 'Match Score', desc: 'See how well your resume aligns with the job description, with color-coded scoring and detailed breakdown.' },
  { icon: <Brain size={22} />, title: 'Technical Questions', desc: 'Get 5-6 role-specific technical questions with expert-level sample answers and intention analysis.' },
  { icon: <MessageSquare size={22} />, title: 'Behavioral Questions', desc: 'Practice with 5-6 behavioral questions designed around the STAR method with real-world scenarios.' },
  { icon: <AlertTriangle size={22} />, title: 'Skill Gap Analysis', desc: 'Identify skill gaps between your profile and job requirements, with severity levels and improvement tips.' },
  { icon: <CalendarDays size={22} />, title: 'Day-wise Prep Plan', desc: 'Follow a structured multi-day preparation plan with daily tasks, focus areas, and progress tracking.' },
  { icon: <Shield size={22} />, title: 'Secure & Private', desc: 'Your data is encrypted in transit, processed in real-time, and never stored permanently or shared.' },
];

// ── FAQ Item ────────────────────────────────────────────────
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  return (
    <div className={`pm-landing__faq-item ${open ? 'pm-landing__faq-item--open' : ''}`}>
      <button className="pm-landing__faq-btn" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={20} />
      </button>
      <div
        className="pm-landing__faq-answer"
        ref={bodyRef}
        style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px' }}
      >
        <div className="pm-landing__faq-answer-inner">{a}</div>
      </div>
    </div>
  );
};

// ── Feature Card with spotlight ─────────────────────────────
const FeatureCard = ({ icon, title, desc, delay }) => {
  const cardRef = useRef(null);

  const handleMouse = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  return (
    <RevealSection delay={delay}>
      <div className="pm-landing__feature-card" ref={cardRef} onMouseMove={handleMouse}>
        <div className="pm-landing__feature-icon">{icon}</div>
        <h3 className="pm-landing__feature-title">{title}</h3>
        <p className="pm-landing__feature-desc">{desc}</p>
      </div>
    </RevealSection>
  );
};

// ════════════════════════════════════════════════════════════
// Landing Page Component
// ════════════════════════════════════════════════════════════
export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="pm-landing">
      <Navbar variant="landing" />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="pm-landing__hero">
        <div className="pm-landing__hero-inner">
          <div className="pm-landing__hero-text">
            <motion.h1
              className="pm-landing__headline"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Walk into every<br />interview <span>prepared.</span>
            </motion.h1>

            <motion.p
              className="pm-landing__subheadline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Upload your resume and paste the job description.
              PrepMind's AI builds a personalized interview strategy with
              targeted questions, skill gap analysis, and a day-by-day prep plan.
            </motion.p>

            <motion.div
              className="pm-landing__cta-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
                Get Started Free
              </Button>
              <Button variant="ghost" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                See Features
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="pm-landing__hero-3d"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
              <HeroScene />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <RevealSection>
        <section className="pm-landing__stats">
          <div className="pm-landing__stats-inner">
            <div className="pm-landing__stat">
              <span className="pm-landing__stat-icon">🎯</span>
              <span className="pm-landing__stat-label">Personalized Questions</span>
              <span className="pm-landing__stat-desc">10-12 targeted technical & behavioral questions</span>
            </div>
            <div className="pm-landing__stat">
              <span className="pm-landing__stat-icon">📊</span>
              <span className="pm-landing__stat-label">Skill-Gap Analysis</span>
              <span className="pm-landing__stat-desc">Know exactly where to focus your efforts</span>
            </div>
            <div className="pm-landing__stat">
              <span className="pm-landing__stat-icon">📅</span>
              <span className="pm-landing__stat-label">Day-wise Prep Plan</span>
              <span className="pm-landing__stat-desc">Structured multi-day study schedule</span>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="pm-landing__how" id="how-it-works">
        <div className="pm-landing__how-inner">
          <RevealSection>
            <p className="pm-landing__section-label">How it works</p>
            <h2 className="pm-landing__section-title">Three steps to your strategy</h2>
          </RevealSection>

          <div className="pm-landing__steps">
            {[
              { num: 1, title: 'Upload Your Resume', desc: 'Drop your PDF or Word resume. Our AI extracts and understands your skills, experience, and education.' },
              { num: 2, title: 'Paste Job Description', desc: 'Add the target job description. PrepMind maps your profile against the role\'s requirements.' },
              { num: 3, title: 'Get Your Strategy', desc: 'Receive a personalized report with match score, interview questions, skill gaps, and a prep plan.' },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={i * 120}>
                <div className="pm-landing__step-card">
                  <div className="pm-landing__step-number">{step.num}</div>
                  <h3 className="pm-landing__step-title">{step.title}</h3>
                  <p className="pm-landing__step-desc">{step.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="pm-landing__features" id="features">
        <div className="pm-landing__features-inner">
          <RevealSection>
            <p className="pm-landing__section-label">Features</p>
            <h2 className="pm-landing__section-title">Everything you need to ace it</h2>
          </RevealSection>

          <div className="pm-landing__feature-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="pm-landing__faq" id="faq">
        <div className="pm-landing__faq-inner">
          <RevealSection>
            <p className="pm-landing__section-label">FAQ</p>
            <h2 className="pm-landing__section-title">Common questions</h2>
          </RevealSection>

          <div className="pm-landing__faq-list">
            {FAQS.map((faq, i) => (
              <RevealSection key={i} delay={i * 60}>
                <FaqItem {...faq} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <RevealSection>
        <section className="pm-landing__cta-banner">
          <div className="pm-landing__cta-card">
            <h2 className="pm-landing__cta-title">Ready to ace your interview?</h2>
            <p className="pm-landing__cta-desc">
              Join thousands of job seekers using AI to prepare smarter, not harder.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
              Start Preparing — Free
            </Button>
          </div>
        </section>
      </RevealSection>

      <Footer />
    </div>
  );
};
