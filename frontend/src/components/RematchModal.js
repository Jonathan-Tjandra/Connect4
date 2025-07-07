import React from 'react';
import './RematchModal.css';

const RematchModal = ({ onAccept, onDecline }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Rematch?</h3>
        <p>Your opponent wants to play again.</p>
        <div className="modal-buttons">
          <button onClick={onAccept} className="accept-button">Accept</button>
          <button onClick={onDecline} className="decline-button">Decline</button>
        </div>
      </div>
    </div>
  );
};

export default RematchModal;