import "./ConfirmModal.css";

const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={onCancel}>
      <div className="modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-modal-title">{title}</h3>
        {message && <p className="modal-message">{message}</p>}
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onCancel}>{cancelLabel}</button>
          <button
            className="primary-btn"
            style={danger ? { background: "var(--accent-red)" } : undefined}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
