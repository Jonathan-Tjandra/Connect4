import React from 'react';
import './GameOver.css';

const GameOver = ({ game, socket, onClose }) => {
  const message = game.status === 'won'
    ? (game.winner === socket.id ? '🎉 You Win! 🎉' : '😢 You Lose! 😢')
    : "It's a Draw!";

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2>Game Over</h2>
        <p className="game-over-message">{message}</p>
        <button onClick={onClose} className="play-again-button">Close</button>
      </div>
    </div>
  );
};

export default GameOver;