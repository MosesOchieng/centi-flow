import './LoadingPopup.css';

interface LoadingPopupProps {
  message?: string;
  show: boolean;
}

export default function LoadingPopup({ message = 'Processing...', show }: LoadingPopupProps) {
  if (!show) return null;

  return (
    <div className="loading-popup-overlay">
      <div className="loading-popup-content">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}

