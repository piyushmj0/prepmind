import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import '../auth.scss';

export const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await handleLogin({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed. Please try again.');
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
        <h2 className="pm-auth__brand-tagline">Your AI interview coach is ready</h2>
        <div className="pm-auth__brand-benefits">
          <div className="pm-auth__brand-item">
            <CheckCircle size={18} /> Personalized interview questions
          </div>
          <div className="pm-auth__brand-item">
            <CheckCircle size={18} /> Skill gap analysis & match scoring
          </div>
          <div className="pm-auth__brand-item">
            <CheckCircle size={18} /> Day-by-day preparation plan
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="pm-auth__form-panel">
        <div className="pm-auth__card">
          <Link to="/" className="pm-auth__back">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <h1 className="pm-auth__title">Welcome back</h1>
          <p className="pm-auth__subtitle">Sign in to continue your prep</p>

          {error && (
            <div className="pm-auth__error-banner">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form className="pm-auth__form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="pm-auth__footer-text">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
