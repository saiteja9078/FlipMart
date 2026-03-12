import { useEffect, useRef } from 'react';
import './ConfirmModal.css';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Go Back',
  variant = 'danger',
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="confirm-modal__overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`confirm-modal__icon confirm-modal__icon--${variant}`}>
          {variant === 'danger' ? (
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
        </div>

        <h3 className="confirm-modal__title">{title}</h3>
        <p className="confirm-modal__message">{message}</p>

        <div className="confirm-modal__actions">
          <button
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-modal__btn confirm-modal__btn--confirm confirm-modal__btn--${variant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
