import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { updateName, sendOtp, updatePassword } from '../../auth/services/auth.api';
import './edit-profile.scss';

export const EditProfile = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');

    useEffect(() => {
        if (user) {
            setNameInput(user.username);
        }
    }, [user]);

    const handleUpdateName = async () => {
        if (nameInput.trim() === user.username) {
            setIsEditingName(false);
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await updateName(nameInput);
            setMessage(res.message || 'Name updated successfully! Please login again or refresh.');
            setIsEditingName(false);
            setTimeout(() => {
                window.location.reload(); // Reload to refresh user context
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update name.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await sendOtp();
            setMessage(res.message || 'OTP sent to your email.');
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!otpInput || !newPasswordInput) {
            setError('Please provide OTP and new password.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await updatePassword(otpInput, newPasswordInput);
            setMessage(res.message || 'Password updated successfully!');
            setIsEditingPassword(false);
            setOtpSent(false);
            setOtpInput('');
            setNewPasswordInput('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-profile-container">
            <header className="dashboard-top-nav">
                <div className="logo" onClick={() => navigate('/')}>PrepMind</div>
                <div className="nav-actions">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="profile-content">
                <div className="profile-card">
                    <h2>Edit Profile</h2>
                    
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                    
                    <div className="user-info">
                        <div className="avatar-large">👤</div>
                        
                        {isEditingName ? (
                            <div className="name-edit-form">
                                <input 
                                    type="text" 
                                    value={nameInput} 
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="name-input"
                                    autoFocus
                                />
                                <div className="name-actions">
                                    <button className="save-btn" onClick={handleUpdateName} disabled={loading}>Save</button>
                                    <button className="cancel-btn" onClick={() => setIsEditingName(false)} disabled={loading}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <h3 className="username-display">
                                {user?.username}
                                <button className="edit-name-icon" onClick={() => setIsEditingName(true)} title="Edit Name">✏️</button>
                            </h3>
                        )}
                        
                        <p>{user?.email}</p>

                        <div className="password-section">
                            {isEditingPassword ? (
                                <div className="password-edit-form">
                                    {!otpSent ? (
                                        <div className="otp-request">
                                            <p className="otp-info-text">To change your password, we need to verify it's you.</p>
                                            <div className="otp-actions">
                                                <button className="primary-btn" onClick={handleSendOtp} disabled={loading}>
                                                    Send OTP to Email
                                                </button>
                                                <button className="cancel-btn" onClick={() => setIsEditingPassword(false)} disabled={loading}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="password-update-fields">
                                            <input 
                                                type="text" 
                                                placeholder="Enter OTP"
                                                value={otpInput} 
                                                onChange={(e) => setOtpInput(e.target.value)}
                                                className="auth-input"
                                            />
                                            <input 
                                                type="password" 
                                                placeholder="New Password"
                                                value={newPasswordInput} 
                                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                                className="auth-input"
                                            />
                                            <div className="password-actions">
                                                <button className="save-btn" onClick={handleUpdatePassword} disabled={loading}>Save Password</button>
                                                <button className="cancel-btn" onClick={() => { setIsEditingPassword(false); setOtpSent(false); }} disabled={loading}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button className="change-password-btn" onClick={() => setIsEditingPassword(true)}>
                                    Change Password
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
