import type { FC } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface AlertBannerProps {
  alert: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}

export const AlertBanner: FC<AlertBannerProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div
      className={`alert ${
        alert.type === 'success' ? 'alert-success' : 'alert-error'
      }`}
    >
      {alert.type === 'success' ? (
        <CheckCircle2 size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span>{alert.message}</span>
      <button className="alert-close" onClick={onClose} aria-label="Close alert">
        <X size={16} />
      </button>
    </div>
  );
};
