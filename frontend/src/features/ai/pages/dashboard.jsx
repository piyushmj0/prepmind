import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInterviewReport } from '../services/ai.api';
import { useAuth } from '../../auth/hooks/useAuth';
import './dashboard.scss';

export const Dashboard = () => {
    const [resume, setResume] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [selfDescription, setSelfDescription] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [showProfile, setShowProfile] = useState(false);

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
        } catch (err) {
            setError('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onSignOut = async () => {
        await handleLogout();
        navigate('/');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-top-nav">
                <div className="logo" onClick={() => navigate('/')}>PrepMind</div>
                <div className="nav-actions">
                    <button className="profile-btn" onClick={() => setShowProfile(!showProfile)} title="Profile">
                        👤 {user?.username}
                    </button>
                </div>
            </header>

            {showProfile && (
                <div className="profile-dropdown">
                    <div className="profile-header">
                        <span className="avatar">👤</span>
                        <div>
                            <strong>{user?.username}</strong>
                            <p>{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                    <ul className="profile-menu">
                        <li onClick={() => { setShowProfile(false); navigate('/profile'); }}>
                            ✏️ Edit Profile
                        </li>
                        <li onClick={onSignOut} className="logout">
                            🚪 Log Out
                        </li>
                    </ul>
                </div>
            )}

            <header className="dashboard-header">
                <h1>AI Interview Prep</h1>
                <p>Generate personalized interview questions and prep plans based on your profile.</p>
            </header>

            <div className="dashboard-content">
                <section className="form-section">
                    <h2>Your Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="resume">Resume (Text or File)</label>
                            <div className="file-upload-wrapper">
                                <label htmlFor="resumeFile" className="file-upload-btn">
                                    📄 Upload PDF/Word
                                </label>
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
                                        <button 
                                            type="button" 
                                            className="remove-file-btn" 
                                            onClick={() => setResumeFile(null)}
                                            title="Remove file"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                )}
                            </div>
                            <textarea 
                                id="resume" 
                                value={resume}
                                onChange={(e) => setResume(e.target.value)}
                                placeholder="Or paste your resume content here..."
                            />
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor="jobDescription">Target Job Description</label>
                            <textarea 
                                id="jobDescription" 
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="selfDescription">Self Description (Optional)</label>
                            <textarea 
                                id="selfDescription" 
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                placeholder="Any additional context about your experience..."
                            />
                        </div>

                        <button type="submit" className="button primary-button" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </form>
                    {error && <div className="error-message">{error}</div>}
                </section>

                {report && (
                    <section className="report-section">
                        <h2>Your Prep Report</h2>
                        <div className="match-score">
                            <h3>Match Score</h3>
                            <div className="score-circle">
                                <span>{report.matchScore}%</span>
                            </div>
                        </div>

                        <div className="report-grid">
                            <div className="report-card">
                                <h3>Technical Questions</h3>
                                <ul>
                                    {report.technicalQuestions?.map((q, idx) => (
                                        <li key={idx}>
                                            <strong>Q: {q.question}</strong>
                                            <p><em>Intention:</em> {q.intention}</p>
                                            <p><em>Ideal Answer:</em> {q.answer}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="report-card">
                                <h3>Behavioral Questions</h3>
                                <ul>
                                    {report.behavioralQuestions?.map((q, idx) => (
                                        <li key={idx}>
                                            <strong>Q: {q.question}</strong>
                                            <p><em>Intention:</em> {q.intention}</p>
                                            <p><em>Ideal Answer:</em> {q.answer}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="report-card">
                                <h3>Skill Gaps</h3>
                                <ul>
                                    {report.skillGaps?.map((gap, idx) => (
                                        <li key={idx}>
                                            <span className={`severity ${gap.severity}`}>{gap.severity}</span>
                                            {gap.skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="report-card full-width">
                                <h3>Preparation Plan</h3>
                                <div className="prep-timeline">
                                    {report.preparationPlan?.map((plan, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <h4>Day {plan.day}: {plan.focus}</h4>
                                            <ul>
                                                {plan.tasks?.map((task, tIdx) => (
                                                    <li key={tIdx}>{task}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
