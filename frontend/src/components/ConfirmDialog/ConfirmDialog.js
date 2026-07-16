import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  return ctx;
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleCancel = () => {
    if (dialogState) {
      dialogState.resolve(false);
      setDialogState(null);
    }
  };

  const handleConfirm = () => {
    if (dialogState) {
      dialogState.resolve(true);
      setDialogState(null);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon className="confirm-icon icon-danger" size={24} />;
      case 'warning':
        return <AlertTriangle className="confirm-icon icon-warning" size={24} />;
      default:
        return <HelpCircle className="confirm-icon icon-info" size={24} />;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {dialogState && (
          <div className="confirm-overlay-wrapper">
            <motion.div
              className="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />
            <div className="confirm-dialog-container">
              <motion.div
                className="confirm-card"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <div className="confirm-header">
                  {getIcon(dialogState.type)}
                  <h3 className="confirm-title">{dialogState.title || 'Are you sure?'}</h3>
                </div>
                <div className="confirm-body">
                  <p>{dialogState.message || 'Do you want to proceed with this action?'}</p>
                </div>
                <div className="confirm-footer">
                  <button className="confirm-btn-cancel" onClick={handleCancel}>
                    {dialogState.cancelText || 'Cancel'}
                  </button>
                  <button
                    className={`confirm-btn-action btn-${dialogState.type || 'info'}`}
                    onClick={handleConfirm}
                  >
                    {dialogState.confirmText || 'Proceed'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export default ConfirmDialogProvider;
