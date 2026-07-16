import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const Toast = ({ toast, onDismiss }) => {
  const Icon = ICONS[toast.type] || Info;
  const timerRef = useRef(null);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss(toast.id);
      }
    };
    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [duration, onDismiss, toast.id]);

  return (
    <motion.div
      className={`toast-item toast-${toast.type}`}
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      layout
    >
      <div className="toast-accent" />
      <div className="toast-body">
        <div className="toast-icon-wrapper">
          <Icon size={18} />
        </div>
        <div className="toast-content">
          {toast.title && <div className="toast-title">{toast.title}</div>}
          <div className="toast-message">{toast.message}</div>
        </div>
        <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options) => {
    const id = ++toastIdCounter;
    const toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 5000,
    };
    setToasts((prev) => [...prev, toast].slice(-5)); // max 5 toasts
    return id;
  }, []);

  const toast = useCallback((message, type = 'info') => {
    return addToast({ message, type });
  }, [addToast]);

  toast.success = (message, title) => addToast({ message, title, type: 'success' });
  toast.warning = (message, title) => addToast({ message, title, type: 'warning' });
  toast.error = (message, title) => addToast({ message, title, type: 'error' });
  toast.info = (message, title) => addToast({ message, title, type: 'info' });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="log" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
