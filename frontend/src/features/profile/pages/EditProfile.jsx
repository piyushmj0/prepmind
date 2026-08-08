import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { sendOtp, updatePassword, updateName } from '../../auth/services/auth.api';
import './edit-profile.scss';

export const EditProfile = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');

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
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await updatePassword(otp, newPassword);
            setMessage(res.message || 'Password updated successfully!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
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
                    </div>

                    <div className="password-section">
                        <h3>Update Password</h3>
                        
                        {error && <div className="error-message">{error}</div>}
                        {message && <div className="success-message">{message}</div>}

                        {step === 1 && (
                            <div className="step-one">
                                <p>To update your password, we need to verify your identity. Click below to receive a One-Time Password (OTP) at your registered email address.</p>
                                <button className="primary-button" onClick={handleSendOtp} disabled={loading}>
                                    {loading ? 'Sending...' : 'Send OTP to Email'}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <form className="step-two" onSubmit={handleUpdatePassword}>
                                <div className="input-group">
                                    <label htmlFor="otp">Enter OTP</label>
                                    <input 
                                        type="text" 
                                        id="otp" 
                                        placeholder="123456" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input 
                                        type="password" 
                                        id="newPassword" 
                                        placeholder="Enter new password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                                <button type="submit" className="primary-button" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
