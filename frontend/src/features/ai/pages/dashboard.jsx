import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInterviewReport } from '../services/ai.api';
import { useAuth } from '../../auth/hooks/useAuth';
import './dashboard.scss';

// ── Collapsible Question Card ────────────────────────────────────────────────
const QuestionCard = ({ question, intention, answer, index, type }) => {
    const [open, setOpen] = useState(false);
    const bodyRef = useRef(null);

    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <button className="q-card__header" onClick={() => setOpen(o => !o)}>
                <span className={`q-card__badge q-card__badge--${type}`}>Q{index + 1}</span>
                <span className="q-card__question">{question}</span>
                <span className="q-card__chevron">{open ? '▲' : '▼'}</span>
            </button>
            <div
                className="q-card__body"
                ref={bodyRef}
                style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px' }}
            >
                <div className="q-card__body-inner">
                    <div className="q-card__row">
                        <span className="q-card__label">🎯 Intention</span>
                        <p>{intention}</p>
                    </div>
                    <div className="q-card__row">
                        <span className="q-card__label">💡 Ideal Answer</span>
                        <p>{answer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Animated Match Score Ring ────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(score), 100);
        return () => clearTimeout(t);
    }, [score]);

    const offset = circumference - (animated / 100) * circumference;
    const color = score >= 75 ? '#38ef7d' : score >= 50 ? '#f2c94c' : '#ff5e62';

    return (
        <div className="score-ring-wrap">
            <svg className="score-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} className="score-ring__track" />
                <circle
                    cx="60" cy="60" r={radius}
                    className="score-ring__fill"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    stroke={color}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
                />
                <text x="60" y="60" className="score-ring__text" dominantBaseline="middle" textAnchor="middle">
                    {score}%
                </text>
            </svg>
            <p className="score-ring__label">
                {score >= 75 ? 'Strong Match 🎉' : score >= 50 ? 'Moderate Match 🙂' : 'Needs Work 💪'}
            </p>
        </div>
    );
};

// ── Loading Skeleton ─────────────────────────────────────────────────────────
const Skeleton = () => (
    <div className="skeleton-wrap">
        <div className="skeleton skeleton--ring" />
        <div className="skeleton-group">
            {[1, 2, 3].map(i => (
                <div key={i} className="skeleton skeleton--card">
                    <div className="skeleton skeleton--line skeleton--short" />
                    <div className="skeleton skeleton--line" />
                    <div className="skeleton skeleton--line skeleton--med" />
                </div>
            ))}
        </div>
    </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const TABS = ['Technical', 'Behavioral', 'Skill Gaps', 'Prep Plan'];

export const Dashboard = () => {
    const [resume, setResume] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [selfDescription, setSelfDescription] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [activeTab, setActiveTab] = useState('Technical');
    const [formCollapsed, setFormCollapsed] = useState(false);

    const reportRef = useRef(null);
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resume && !resumeFile) {
            setError('Please provide either resume text or upload a resume file.');
            return;
        }

        setLoading(true);
        setError('');
        setReport(null);

        try {
            const data = await generateInterviewReport({ resume, resumeFile, selfDescription, jobDescription });
            setReport(data.report);
            setActiveTab('Technical');
            setFormCollapsed(true);
            setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        } catch (err) {
            setError('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNewReport = () => {
        setReport(null);
        setError('');
        setFormCollapsed(false);
        setResume('');
        setResumeFile(null);
        setSelfDescription('');
        setJobDescription('');
    };

    const onSignOut = async () => {
        await handleLogout();
        navigate('/');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setResumeFile(e.target.files[0]);
    };

    return (
        <div className="dashboard-container" onClick={() => showProfile && setShowProfile(false)}>
            {/* ── Top Nav ── */}
            <header className="dashboard-top-nav">
                <div className="logo" onClick={() => navigate('/')}>PrepMind</div>
                <div className="nav-actions" onClick={e => e.stopPropagation()}>
                    {report && (
                        <button className="new-report-btn" onClick={handleNewReport}>
                            ＋ New Report
                        </button>
                    )}
                    <button className="profile-btn" onClick={() => setShowProfile(v => !v)} title="Profile">
                        👤 {user?.username}
                    </button>
                </div>
            </header>

            {showProfile && (
                <div className="profile-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="profile-header">
                        <span className="avatar">👤</span>
                        <div>
                            <strong>{user?.username}</strong>
                            <p>{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                    <ul className="profile-menu">
                        <li onClick={() => { setShowProfile(false); navigate('/profile'); }}>✏️ Edit Profile</li>
                        <li onClick={onSignOut} className="logout">🚪 Log Out</li>
                    </ul>
                </div>
            )}

            {/* ── Hero Header (hidden once report is ready) ── */}
            {!report && !loading && (
                <header className="dashboard-header">
                    <h1>AI Interview Prep</h1>
                    <p>Generate personalised questions &amp; a study plan — tailored to your resume and target role.</p>
                </header>
            )}

            <div className={`dashboard-content ${report || loading ? 'dashboard-content--report' : ''}`}>

                {/* ── Input Form ── */}
                <section className={`form-section ${formCollapsed ? 'form-section--collapsed' : ''}`}>
                    {formCollapsed && (
                        <button className="form-toggle-btn" onClick={() => setFormCollapsed(v => !v)}>
                            ✏️ Edit Inputs
                        </button>
                    )}

                    <div className="form-body">
                        <h2>Your Details</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="resume">Resume (Text or File)</label>
                                <div className="file-upload-wrapper">
                                    <label htmlFor="resumeFile" className="file-upload-btn">📄 Upload PDF/Word</label>
                                    <input
                                        type="file"
                                        id="resumeFile"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    {resumeFile && (
                                        <div className="file-name-container">
                                            <span className="file-name">{resumeFile.name}</span>
                                            <button type="button" className="remove-file-btn" onClick={() => setResumeFile(null)} title="Remove">❌</button>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    id="resume"
                                    value={resume}
                                    onChange={e => setResume(e.target.value)}
                                    placeholder="Or paste your resume content here…"
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="jobDescription">Target Job Description</label>
                                <textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here…"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="selfDescription">About You <span className="optional">(optional)</span></label>
                                <textarea
                                    id="selfDescription"
                                    value={selfDescription}
                                    onChange={e => setSelfDescription(e.target.value)}
                                    placeholder="Any extra context about your experience…"
                                />
                            </div>

                            <button type="submit" className="button primary-button" disabled={loading}>
                                {loading ? (
                                    <span className="btn-spinner-wrap"><span className="btn-spinner" /> Generating…</span>
                                ) : '✨ Generate Report'}
                            </button>
                        </form>
                        {error && <div className="error-message">⚠️ {error}</div>}
                    </div>
                </section>

                {/* ── Loading ── */}
                {loading && <section className="report-section"><Skeleton /></section>}

                {/* ── Report ── */}
                {report && !loading && (
                    <section className="report-section" ref={reportRef}>
                        {/* Score header */}
                        <div className="report-hero">
                            <ScoreRing score={report.matchScore} />
                            <div className="report-hero__meta">
                                <h2>Your Interview Prep Report</h2>
                                <p>{report.technicalQuestions?.length || 0} technical &amp; {report.behavioralQuestions?.length || 0} behavioural questions generated</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="report-tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    className={`report-tabs__btn ${activeTab === tab ? 'report-tabs__btn--active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'Technical' && '🔧 '}
                                    {tab === 'Behavioral' && '🤝 '}
                                    {tab === 'Skill Gaps' && '⚠️ '}
                                    {tab === 'Prep Plan' && '📅 '}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab panels */}
                        <div className="tab-panel">
                            {activeTab === 'Technical' && (
                                <div className="q-list">
                                    {report.technicalQuestions?.map((q, i) => (
                                        <QuestionCard key={i} index={i} type="tech" {...q} />
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Behavioral' && (
                                <div className="q-list">
                                    {report.behavioralQuestions?.map((q, i) => (
                                        <QuestionCard key={i} index={i} type="beh" {...q} />
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Skill Gaps' && (
                                <div className="gap-list">
                                    {report.skillGaps?.map((gap, i) => (
                                        <div key={i} className="gap-item">
                                            <span className={`severity severity--${gap.severity}`}>{gap.severity}</span>
                                            <span className="gap-item__skill">{gap.skill}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Prep Plan' && (
                                <div className="timeline">
                                    {report.preparationPlan?.map((plan, i) => (
                                        <div key={i} className="timeline__item">
                                            <div className="timeline__day">Day {plan.day}</div>
                                            <div className="timeline__content">
                                                <h4>{plan.focus}</h4>
                                                <ul>
                                                    {plan.tasks?.map((task, ti) => <li key={ti}>{task}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
