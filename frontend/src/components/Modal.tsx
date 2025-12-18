'use client';

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

export default function Modal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  type = 'info',
}: ModalProps) {
  const modalBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (modalBoxRef.current) {
        setTimeout(() => {
          modalBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const isWarningWithCancel = (type === 'warning' || type === 'danger') && cancelText && onCancel;
  const confirmClass = isWarningWithCancel ? 'modal-danger' : 'modal-confirm';

  return (
    <div className="modal-overlay">
      <div className={`modal-box modal-${type}`} ref={modalBoxRef}>
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          {onCancel && cancelText && (
            <button className="modal-btn modal-confirm" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`modal-btn ${confirmClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

