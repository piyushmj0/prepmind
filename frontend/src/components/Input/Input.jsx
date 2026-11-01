import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.scss';

const Input = ({
  label,
  type = 'text',
  error,
  helper,
  optional = false,
  maxLength,
  className = '',
  value,
  onChange,
  ...props
}) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const charCount = value?.length || 0;

  const fieldClasses = [
    'pm-input-group__field',
    error && 'pm-input-group__field--error',
  ].filter(Boolean).join(' ');

  const inputElement = (
    <input
      id={id}
      type={isPassword ? (showPassword ? 'text' : 'password') : type}
      className={fieldClasses}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
      {...props}
    />
  );

  return (
    <div className={`pm-input-group ${className}`}>
      {label && (
        <label className="pm-input-group__label" htmlFor={id}>
          {label}
          {optional && <span className="pm-input-group__optional">(optional)</span>}
        </label>
      )}

      {isPassword ? (
        <div className="pm-input-group__password-wrap">
          {inputElement}
          <button
            type="button"
            className="pm-input-group__toggle"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      ) : inputElement}

      {maxLength && (
        <span className={`pm-input-group__char-count ${
          charCount > maxLength * 0.9 ? (charCount >= maxLength ? 'pm-input-group__char-count--over' : 'pm-input-group__char-count--warn') : ''
        }`}>
          {charCount}/{maxLength}
        </span>
      )}

      {error && <span id={`${id}-error`} className="pm-input-group__error" role="alert">{error}</span>}
      {helper && !error && <span id={`${id}-helper`} className="pm-input-group__helper">{helper}</span>}
    </div>
  );
};

export default Input;

