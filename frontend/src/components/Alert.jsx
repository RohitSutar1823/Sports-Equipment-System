import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={20} className="alert-icon-success" />,
    error: <AlertCircle size={20} className="alert-icon-error" />,
    info: <Info size={20} className="alert-icon-info" />
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-message">
        {icons[type] || icons.info}
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
