import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ game, socketId }) => {
  if (!game || !game.scores || game.players.length < 2) {
    return null;
  }

  const myId = socketId;
  const opponentId = game.players.find(p => p !== myId);

  const myWins = game.scores[myId] || 0;
  const opponentWins = game.scores[opponentId] || 0;
  const draws = game.scores.draws || 0;

  return (
    <div className="scoreboard">
      <div className="score-item you">
        <span className="score-label">You</span>
        <span className="score-value">{myWins}</span>
      </div>
      <div className="score-item draws">
        <span className="score-label">Draws</span>
        <span className="score-value">{draws}</span>
      </div>
      <div className="score-item opponent">
        <span className="score-label">Opponent</span>
        <span className="score-value">{opponentWins}</span>
      </div>
    </div>
  );
};

export default Scoreboard;