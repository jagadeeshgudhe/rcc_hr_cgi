import React from 'react';
import './Modal.css';

const Modal = ({ open, title, children, actions, onClose }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-content">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
        {!actions && (
          <div className="modal-actions">
            <button className="modal-cancel" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 