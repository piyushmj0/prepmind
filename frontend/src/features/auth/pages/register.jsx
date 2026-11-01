import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import '../auth.scss';

export const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await handleRegister({ username, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="pm-auth">
        <div className="pm-auth__form-panel">
          <div className="pm-auth__card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--pm-text-2)' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-auth">
      {/* Brand panel */}
      <div className="pm-auth__brand">
        <div className="pm-auth__brand-orb" aria-hidden="true" />
        <div className="pm-auth__brand-logo">PrepMind</div>
        <h2 className="pm-auth__brand-tagline">Start your interview prep journey</h2>
        <div className="pm-auth__brand-benefits">
          <div className="pm-auth__brand-item">
            <CheckCircle size={18} /> Free to use — no credit card needed
          </div>
          <div className="pm-auth__brand-item">
            <CheckCircle size={18} /> AI-powered personalized strategies
          </div>
          <div className="pm-auth__brand-item">
            <CheckCircle size={18} /> Results in under 30 seconds
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="pm-auth__form-panel">
        <div className="pm-auth__card">
          <Link to="/" className="pm-auth__back">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="pm-auth__title">Create account</h1>
          <p className="pm-auth__subtitle">Get your personalized interview strategy</p>

          {error && (
            <div className="pm-auth__error-banner">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form className="pm-auth__form" onSubmit={handleSubmit}>
            <Input
              label="Name"
              type="text"
              placeholder="Your full name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="pm-auth__footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
