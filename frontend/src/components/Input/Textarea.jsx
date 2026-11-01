import React, { useId } from 'react';
import './Input.scss';

const Textarea = ({
  label,
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
  const charCount = value?.length || 0;

  return (
    <div className={`pm-input-group ${className}`}>
      {label && (
        <label className="pm-input-group__label" htmlFor={id}>
          {label}
          {optional && <span className="pm-input-group__optional">(optional)</span>}
        </label>
      )}
      <textarea
        id={id}
        className={`pm-input-group__field ${error ? 'pm-input-group__field--error' : ''}`}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        {...props}
      />
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

export default Textarea;

