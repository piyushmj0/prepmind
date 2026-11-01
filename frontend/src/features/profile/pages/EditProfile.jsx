import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { updateName, sendOtp, updatePassword } from '../../auth/services/auth.api';
import Navbar from '../../../layouts/Navbar/Navbar';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { useToast } from '../../../components/Toast/Toast';
import './edit-profile.scss';

export const EditProfile = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Name edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Password edit state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  useEffect(() => {
    if (user?.username) {
      setNameInput(user.username);
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user?.username) {
      setIsEditingName(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await updateName(nameInput.trim());
      toast.success(res?.message || 'Display name updated successfully.');
      setIsEditingName(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update name.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sendOtp();
      toast.success(res?.message || 'Verification code sent to your email.');
      setOtpSent(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send verification code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!otpInput.trim() || !newPasswordInput.trim()) {
      setError('Please provide the OTP and a new password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await updatePassword(otpInput.trim(), newPasswordInput);
      toast.success(res?.message || 'Password changed successfully!');
      setIsEditingPassword(false);
      setOtpSent(false);
      setOtpInput('');
      setNewPasswordInput('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'PM';

  return (
    <div className="pm-profile">
      <Navbar variant="app" />

      <main className="pm-profile__content">
        <div className="pm-profile__card">
          <div className="pm-profile__top-bar">
            <Link to="/dashboard" className="pm-profile__back-link">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>

          <div className="pm-profile__header">
            <div className="pm-profile__avatar">{initials}</div>
            <h1 className="pm-profile__title">{user?.username}</h1>
            <p className="pm-profile__email">{user?.email}</p>
          </div>

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
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Display Name Section */}
          <section className="pm-profile__section">
            <h2 className="pm-profile__section-title">Display Name</h2>
            <p className="pm-profile__section-desc">Change how your name appears on your interview prep reports.</p>

            {isEditingName ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
                <div className="pm-profile__actions-row">
                  <Button variant="primary" size="sm" onClick={handleUpdateName} loading={loading}>
                    Save Changes
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingName(false)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', color: 'var(--pm-text)' }}>{user?.username}</span>
                <Button variant="secondary" size="sm" onClick={() => setIsEditingName(true)}>
                  Edit Name
                </Button>
              </div>
            )}
          </section>

          {/* Password Section */}
          <section className="pm-profile__section">
            <h2 className="pm-profile__section-title">Security & Password</h2>
            <p className="pm-profile__section-desc">To protect your account, a one-time verification code is emailed to you before updating your password.</p>

            {isEditingPassword ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {!otpSent ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--pm-text-2)' }}>
                      We will send an OTP code to <strong>{user?.email}</strong>.
                    </p>
                    <div className="pm-profile__actions-row">
                      <Button variant="primary" size="sm" onClick={handleSendOtp} loading={loading}>
                        Send Code via Email
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingPassword(false)} disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                      label="Verification Code (OTP)"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit code"
                      autoFocus
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <div className="pm-profile__actions-row">
                      <Button variant="primary" size="sm" onClick={handleUpdatePassword} loading={loading}>
                        Confirm New Password
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setIsEditingPassword(false); setOtpSent(false); }} disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--pm-text-3)' }}>••••••••••••</span>
                <Button variant="secondary" size="sm" onClick={() => setIsEditingPassword(true)}>
                  Change Password
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
