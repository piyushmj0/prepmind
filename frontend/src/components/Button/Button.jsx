import React from 'react';
import './Button.scss';

/**
 * @param {'primary'|'ghost'|'secondary'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {boolean} iconOnly
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    'pm-btn',
    `pm-btn--${variant}`,
    `pm-btn--${size}`,
    fullWidth && 'pm-btn--full',
    iconOnly && 'pm-btn--icon',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="pm-btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;

