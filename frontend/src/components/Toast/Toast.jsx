import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.scss';

const ToastContext = createContext();

const ICONS = {
  success: <CheckCircle size={20} color="var(--pm-success)" />,
  error:   <AlertCircle size={20} color="var(--pm-danger)" />,
  warning: <AlertTriangle size={20} color="var(--pm-warning)" />,
  info:    <Info size={20} color="var(--pm-violet)" />,
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message, exiting: false }]);
    if (duration > 0) {
      timers.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title) => addToast({ type: 'success', title: title || 'Success', message }),
    error:   (message, title) => addToast({ type: 'error', title: title || 'Error', message }),
    warning: (message, title) => addToast({ type: 'warning', title: title || 'Warning', message }),
    info:    (message, title) => addToast({ type: 'info', title: title || 'Info', message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pm-toast-container" aria-live="polite" aria-label="Notifications">
        {toasts.map(t => (
          <div key={t.id} className={`pm-toast pm-toast--${t.type} ${t.exiting ? 'pm-toast--exit' : ''}`} role="alert">
            <span className="pm-toast__icon">{ICONS[t.type]}</span>
            <div className="pm-toast__content">
              {t.title && <div className="pm-toast__title">{t.title}</div>}
              {t.message && <div className="pm-toast__message">{t.message}</div>}
            </div>
            <button className="pm-toast__close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

