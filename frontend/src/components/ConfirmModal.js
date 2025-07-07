import React from 'react';
import './RematchModal.css'; // We can reuse the same styles

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="decline-button">Yes</button>
          <button onClick={onCancel} className="accept-button">No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;