import React from 'react';
import './Badge.scss';

const Badge = ({ children, variant = 'violet', className = '' }) => (
  <span className={`pm-badge pm-badge--${variant} ${className}`}>{children}</span>
);

export default Badge;

