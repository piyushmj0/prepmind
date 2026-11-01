import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0D17',
        color: '#A3AAC2',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(124, 92, 255, 0.2)',
          borderTopColor: '#7C5CFF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
