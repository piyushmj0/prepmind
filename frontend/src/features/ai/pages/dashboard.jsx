import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Printer,
  Share2,
  Edit3,
  RotateCcw,
  Wrench,
  Users,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { generateInterviewReport } from '../services/ai.api';
import { useAuth } from '../../auth/hooks/useAuth';
import Navbar from '../../../layouts/Navbar/Navbar';
import Button from '../../../components/Button/Button';
import Textarea from '../../../components/Input/Textarea';
import FileUpload from '../../../components/FileUpload/FileUpload';
import ScoreRing from '../../../components/ScoreRing/ScoreRing';
import Badge from '../../../components/Badge/Badge';
import { useToast } from '../../../components/Toast/Toast';
import GenerationLoader from '../../../loaders/GenerationLoader/GenerationLoader';
import './dashboard.scss';

// ── Question Accordion Card ──────────────────────────────────
const QuestionCard = ({ question, intention, answer, index }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = (e) => {
    e.stopPropagation();
    const textToCopy = `Question: ${question}\n\nIntention: ${intention}\n\nSample Answer: ${answer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Question and sample answer copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`pm-dash__q-card ${open ? 'pm-dash__q-card--open' : ''}`}>
      <button
        className="pm-dash__q-header"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span className="pm-dash__q-num">Q{index + 1}</span>
        <span className="pm-dash__q-title">{question}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy question"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pm-text-3)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {copied ? <Check size={16} color="var(--pm-success)" /> : <Copy size={16} />}
          </button>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="pm-dash__q-body">
          <div className="pm-dash__q-block">
            <strong>Target Evaluation &amp; Intention</strong>
            <p>{intention}</p>
          </div>
          <div className="pm-dash__q-block">
            <strong>Model Star Response Strategy</strong>
            <p>{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Interactive Timeline Item with Tasks ────────────────────
const TimelineDayItem = ({ plan, completedTasks, onToggleTask }) => {
  return (
    <div className="pm-dash__timeline-item">
      <div className="pm-dash__timeline-day">
        <span>Day {plan.day}</span>
        <h4>{plan.focus}</h4>
      </div>
      <div className="pm-dash__timeline-tasks">
        {plan.tasks?.map((task, idx) => {
          const taskId = `${plan.day}-${idx}`;
          const isDone = !!completedTasks[taskId];
          return (
            <label
              key={idx}
              className={`pm-dash__task-item ${isDone ? 'is-done' : ''}`}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => onToggleTask(taskId)}
              />
              <span>{task}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Dashboard Component ────────────────────────────────
export const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [resume, setResume] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [selfDescription, setSelfDescription] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Technical');
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  const reportRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume.trim() && !resumeFile) {
      setError('Please provide your resume as text or upload a PDF/Word file.');
      toast.warning('Resume file or text is required.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Target job description is required.');
      toast.warning('Please paste the job description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await generateInterviewReport({
        resume: resume.trim() || undefined,
        resumeFile: resumeFile || undefined,
        selfDescription: selfDescription.trim() || undefined,
        jobDescription: jobDescription.trim(),
      });

      setReport(data.report);
      setActiveTab('Technical');
      setFormCollapsed(true);
      setCompletedTasks({});
      toast.success('Interview strategy generated successfully!');

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to generate interview strategy. Please try again.';
      setError(msg);
      toast.error(msg);
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
    setCompletedTasks({});
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Calculate task completion percentage
  const { totalTasks, doneCount, percentDone } = useMemo(() => {
    if (!report?.preparationPlan) return { totalTasks: 0, doneCount: 0, percentDone: 0 };
    let total = 0;
    report.preparationPlan.forEach(p => {
      total += p.tasks?.length || 0;
    });
    const done = Object.values(completedTasks).filter(Boolean).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { totalTasks: total, doneCount: done, percentDone: pct };
  }, [report, completedTasks]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My PrepMind Interview Strategy',
        text: `I scored ${report?.matchScore}% match for this position on PrepMind!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pm-dash">
      <Navbar variant="app" />

      {/* Generation Loader Overlay */}
      {loading && <GenerationLoader onCancel={() => setLoading(false)} />}

      <main className="pm-dash__body">
        {/* Welcome Header when no report active */}
        {!report && (
          <header className="pm-dash__hero-header">
            <h1>Welcome back, {user?.username || 'Candidate'}</h1>
            <p>
              Upload your resume and paste the job description to generate your custom interview strategy,
              questions, and preparation roadmap.
            </p>
          </header>
        )}

        <div className={`pm-dash__content ${report ? 'pm-dash__content--has-report' : ''}`}>
          {/* ── Input Form Column ─────────────────────────── */}
          <aside className={`pm-dash__form-col ${formCollapsed ? 'pm-dash__form-col--collapsed' : ''}`}>
            {formCollapsed ? (
              <button
                className="pm-dash__collapse-toggle"
                onClick={() => setFormCollapsed(false)}
              >
                <span><Edit3 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Edit Resume &amp; Job</span>
                <ChevronDown size={18} />
              </button>
            ) : (
              <div className="pm-dash__form-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Interview Details</h2>
                  {report && (
                    <button
                      className="pm-dash__collapse-toggle"
                      style={{ width: 'auto' }}
                      onClick={() => setFormCollapsed(true)}
                    >
                      Collapse <ChevronUp size={16} />
                    </button>
                  )}
                </div>

                <form className="pm-dash__form" onSubmit={handleSubmit}>
                  {/* File Upload Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: 'var(--pm-text-sm)', fontWeight: 600, color: 'var(--pm-text-2)' }}>
                      Resume (Upload File or Paste Text)
                    </label>
                    <FileUpload
                      file={resumeFile}
                      onFileChange={setResumeFile}
                    />
                  </div>

                  <div className="pm-dash__or-divider">Or paste text</div>

                  <Textarea
                    placeholder="Paste resume content here..."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    maxLength={10000}
                  />

                  <Textarea
                    label="Target Job Description"
                    placeholder="Paste the job requirements, responsibilities, or job posting here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    maxLength={10000}
                  />

                  <Textarea
                    label="About You / Extra Context"
                    optional
                    placeholder="Optional details: years of experience, target role level, domains..."
                    value={selfDescription}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    maxLength={1000}
                  />

                  {error && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--pm-danger)',
                      fontSize: '0.85rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(248, 113, 113, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.25)'
                    }}>
                      <AlertTriangle size={16} /> {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                  >
                    <Sparkles size={18} /> Generate My Strategy
                  </Button>
                </form>
              </div>
            )}
          </aside>

          {/* ── Report Column ─────────────────────────────── */}
          {report && (
            <section className="pm-dash__report-col" ref={reportRef}>
              {/* Score & Header Card */}
              <div className="pm-dash__report-hero">
                <ScoreRing score={report.matchScore || 0} size={150} />

                <div className="pm-dash__report-meta">
                  <h2>Personalized Strategy Report</h2>
                  <p>
                    {report.technicalQuestions?.length || 0} Technical Questions •{' '}
                    {report.behavioralQuestions?.length || 0} Behavioral Scenarios •{' '}
                    {report.skillGaps?.length || 0} Skill Gaps Identified
                  </p>
                  <div className="pm-dash__report-actions">
                    <Button variant="ghost" size="sm" onClick={handlePrint}>
                      <Printer size={15} /> Print / Save PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 size={15} /> Share
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleNewReport}>
                      <RotateCcw size={15} /> New Strategy
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="pm-dash__tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === 'Technical'}
                  className={activeTab === 'Technical' ? 'is-active' : ''}
                  onClick={() => setActiveTab('Technical')}
                >
                  <Wrench size={16} /> Technical ({report.technicalQuestions?.length || 0})
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'Behavioral'}
                  className={activeTab === 'Behavioral' ? 'is-active' : ''}
                  onClick={() => setActiveTab('Behavioral')}
                >
                  <Users size={16} /> Behavioral ({report.behavioralQuestions?.length || 0})
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'Skill Gaps'}
                  className={activeTab === 'Skill Gaps' ? 'is-active' : ''}
                  onClick={() => setActiveTab('Skill Gaps')}
                >
                  <AlertTriangle size={16} /> Skill Gaps ({report.skillGaps?.length || 0})
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'Prep Plan'}
                  className={activeTab === 'Prep Plan' ? 'is-active' : ''}
                  onClick={() => setActiveTab('Prep Plan')}
                >
                  <Calendar size={16} /> Prep Plan ({report.preparationPlan?.length || 0} Days)
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="pm-dash__tab-panel">
                {activeTab === 'Technical' && (
                  <div className="pm-dash__q-list">
                    {report.technicalQuestions?.map((q, i) => (
                      <QuestionCard key={i} index={i} type="tech" {...q} />
                    ))}
                  </div>
                )}

                {activeTab === 'Behavioral' && (
                  <div className="pm-dash__q-list">
                    {report.behavioralQuestions?.map((q, i) => (
                      <QuestionCard key={i} index={i} type="beh" {...q} />
                    ))}
                  </div>
                )}

                {activeTab === 'Skill Gaps' && (
                  <div className="pm-dash__gaps-grid">
                    {report.skillGaps?.map((gap, i) => {
                      const sev = (gap.severity || 'medium').toLowerCase();
                      const badgeVariant = sev === 'high' ? 'danger' : sev === 'medium' ? 'warning' : 'success';
                      return (
                        <div key={i} className="pm-dash__gap-card">
                          <div className="pm-dash__gap-header">
                            <span className="pm-dash__gap-skill">{gap.skill}</span>
                            <Badge variant={badgeVariant}>{gap.severity}</Badge>
                          </div>
                          <p style={{ fontSize: 'var(--pm-text-sm)', color: 'var(--pm-text-2)' }}>
                            Focus area recommendation for your preparation.
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'Prep Plan' && (
                  <div className="pm-dash__plan-wrap">
                    {/* Progress tracking card */}
                    <div className="pm-dash__plan-progress-card">
                      <div className="pm-dash__plan-progress-header">
                        <span>Preparation Roadmap Progress</span>
                        <strong>{doneCount} of {totalTasks} tasks complete ({percentDone}%)</strong>
                      </div>
                      <div className="pm-dash__plan-progress-bar">
                        <div style={{ width: `${percentDone}%` }} />
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="pm-dash__timeline">
                      {report.preparationPlan?.map((plan, i) => (
                        <TimelineDayItem
                          key={i}
                          plan={plan}
                          completedTasks={completedTasks}
                          onToggleTask={toggleTask}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
