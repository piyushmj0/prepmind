import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';
import './NotFound.scss';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="pm-notfound">
      <div className="pm-notfound__card">
        <div className="pm-notfound__code">404</div>
        <h1 className="pm-notfound__title">Page not found</h1>
        <p className="pm-notfound__text">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pm-notfound__actions">
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

