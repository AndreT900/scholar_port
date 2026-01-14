import React from 'react';
import './ConfirmModal.css';

/**
 * Componente modale per conferme e notifiche
 * Sostituisce i prompt/alert del browser con modali dedicati
 */
function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Conferma',
    cancelText = 'Annulla',
    type = 'confirm' // 'confirm' | 'alert' | 'success' | 'error'
}) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'alert':
                return 'ℹ';
            default:
                return '?';
        }
    };

    const getIconClass = () => {
        switch (type) {
            case 'success':
                return 'icon-success';
            case 'error':
                return 'icon-error';
            case 'alert':
                return 'icon-alert';
            default:
                return 'icon-confirm';
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={onClose}>
            <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-modal-icon ${getIconClass()}`}>
                    {getIcon()}
                </div>
                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>
                <div className="confirm-modal-buttons">
                    {type === 'confirm' && (
                        <button
                            className="confirm-modal-btn cancel-btn"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`confirm-modal-btn primary-btn ${type === 'error' ? 'error-btn' : ''}`}
                        onClick={handleConfirm}
                    >
                        {type === 'confirm' ? confirmText : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
