import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  const overlayRef = useRef();
  const previousFocus = useRef();

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
        previousFocus.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="pm-modal-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="pm-modal">
        <div className="pm-modal__header">
          <h2 className="pm-modal__title">{title}</h2>
          <button className="pm-modal__close" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <div className="pm-modal__body">{children}</div>
        {footer && <div className="pm-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

