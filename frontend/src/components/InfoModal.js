import React from 'react';
import './RematchModal.css'; // Reusing styles again

const InfoModal = ({ title, message, onOk }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onOk} className="accept-button">OK</button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;