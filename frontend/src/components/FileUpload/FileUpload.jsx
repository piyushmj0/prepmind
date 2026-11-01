import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import './FileUpload.scss';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const FileUpload = ({ file, onFileChange, accept = '.pdf,.doc,.docx', error: externalError }) => {
  const inputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validate = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only PDF and Word documents are accepted.');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File must be under 5 MB.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = useCallback((f) => {
    if (validate(f)) onFileChange(f);
  }, [onFileChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="pm-file-upload">
      <div
        className={`pm-file-upload__dropzone ${dragActive ? 'pm-file-upload__dropzone--active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        aria-label="Upload resume file"
      >
        <Upload size={32} className="pm-file-upload__icon" />
        <p className="pm-file-upload__text">
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="pm-file-upload__hint">PDF or Word, up to 5 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {file && (
        <div className="pm-file-upload__file-chip">
          <FileText size={18} className="pm-file-upload__file-icon" />
          <div className="pm-file-upload__file-info">
            <span className="pm-file-upload__file-name">{file.name}</span>
            <span className="pm-file-upload__file-size">{formatSize(file.size)}</span>
          </div>
          <button
            className="pm-file-upload__remove"
            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
            aria-label="Remove file"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {(error || externalError) && (
        <p className="pm-file-upload__error">{error || externalError}</p>
      )}
    </div>
  );
};

export default FileUpload;

