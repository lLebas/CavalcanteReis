import React, { useEffect, useRef } from "react";

export default function Modal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancelar",
  type = "info",
}) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (modalBoxRef.current) {
        // A small delay can help ensure the element is rendered and positioned
        // before scrolling, especially with CSS animations.
        setTimeout(() => {
          modalBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable background scrolling
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  // Para modais de warning/danger com cancelText, inverter as cores dos botões
  const isWarningWithCancel = (type === "warning" || type === "danger") && cancelText && onCancel;

  // Determinar classe do botão de confirmação
  const confirmClass = isWarningWithCancel ? "modal-danger" : "modal-confirm";

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