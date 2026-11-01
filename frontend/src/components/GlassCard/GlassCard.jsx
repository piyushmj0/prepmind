import React from 'react';
import './GlassCard.scss';

const GlassCard = ({
  children,
  className = '',
  noHover = false,
  glow = false,
  size,
  as: Tag = 'div',
  ...props
}) => {
  const classes = [
    'pm-glass-card',
    noHover && 'pm-glass-card--no-hover',
    glow && 'pm-glass-card--glow',
    size && `pm-glass-card--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return <Tag className={classes} {...props}>{children}</Tag>;
};

export default GlassCard;

