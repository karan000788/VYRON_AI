import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-red-400 hover:text-red-200 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};
