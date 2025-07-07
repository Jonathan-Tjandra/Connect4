import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Board from './components/Board';
import GameLobby from './components/GameLobby';
import GameOver from './components/GameOver';
import RematchModal from './components/RematchModal';
import ConfirmModal from './components/ConfirmModal';
import InfoModal from './components/InfoModal';
import Scoreboard from './components/Scoreboard';
import './App.css';
import './components/GameInfoPanel.css';

const socket = io('http://localhost:5001');

function App() {
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');
  const [rematchInfoMessage, setRematchInfoMessage] = useState('');
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [rematchState, setRematchState] = useState('idle');
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showOpponentAbandoned, setShowOpponentAbandoned] = useState(false);

  useEffect(() => {
    const handleGameUpdate = (data) => {
      setGame(data);
      setError('');
      setRematchState('idle');
    };

    const handleGameOver = (data) => {
      setGame(data);
      setShowGameOverModal(true);
    };

    const handleGameStarted = (data) => {
      handleGameUpdate(data);
      setShowGameOverModal(false);
    };

    const handleError = (data) => setError(data.message);
    const handleRematchRequested = () => setRematchState('received');
    const handleWaiting = () => setRematchState('requested');
    
    const handleRematchCanceled = () => setRematchState('idle'); // Simple reset, no message

    const handleRematchDeclined = (data) => {
      setRematchState('idle');
      if (data.requester_id === socket.id) {
        setRematchInfoMessage('Request Declined');
        setTimeout(() => setRematchInfoMessage(''), 3000);
      }
    };

    const handleOpponentAbandoned = () => {
      setShowOpponentAbandoned(true);
    };

    socket.on('game_created', handleGameUpdate);
    socket.on('game_started', handleGameStarted);
    socket.on('game_updated', handleGameUpdate);
    socket.on('game_over', handleGameOver);
    socket.on('error', handleError);
    socket.on('rematch_requested', handleRematchRequested);
    socket.on('waiting_for_opponent', handleWaiting);
    socket.on('rematch_canceled', handleRematchCanceled); // Use the simple handler
    socket.on('rematch_declined', handleRematchDeclined); // Use the new smart handler
    socket.on('opponent_abandoned', handleOpponentAbandoned);

    return () => {
      socket.off('game_created'); socket.off('game_started'); socket.off('game_updated');
      socket.off('game_over'); socket.off('error'); socket.off('rematch_requested');
      socket.off('waiting_for_opponent'); socket.off('rematch_canceled');
      socket.off('rematch_declined'); socket.off('opponent_abandoned');
    };
  }, []);

  const requestRematch = () => socket.emit('request_rematch', { room_code: game.room_code });
  const cancelRematch = () => socket.emit('cancel_rematch', { room_code: game.room_code });
  const acceptRematch = () => socket.emit('accept_rematch', { room_code: game.room_code });
  const declineRematch = () => socket.emit('decline_rematch', { room_code: game.room_code });

  const handleAbandonGame = () => {
    socket.emit('abandon_game', { room_code: game.room_code });
    setShowAbandonConfirm(false);
    setGame(null);
  };

  const handleOpponentAbandonedOk = () => {
    setShowOpponentAbandoned(false);
    setGame(null);
  };

  const renderGameInfo = () => {
    if (!game) return null;

    // This logic correctly finds your index (0 or 1) in the players list
    const playerIndex = game.players.indexOf(socket.id);
    // This assigns 'Red' to index 0 and 'Yellow' to index 1
    const playerColor = playerIndex === 0 ? 'Red' : (playerIndex === 1 ? 'Yellow' : 'Observer');

    const turnMessage = game.turn === socket.id ? "It's Your Turn" : "Opponent's Turn";
    
    let statusMessage;
    if (game.status === 'in_progress') {
      statusMessage = turnMessage;
    } else if (game.status === 'waiting') {
      statusMessage = 'Waiting for opponent...';
    } else {
      statusMessage = 'Game Over!';
    }

    return (
      <div className="game-info-panel">
        <h2>Game Info</h2>
        <p><strong>Room:</strong> {game.room_code}</p>
        <p><strong>Your Color:</strong> <span className={playerColor.toLowerCase()}>{playerColor}</span></p>
        <p><strong>Status:</strong> {statusMessage}</p>
        {game.status === 'in_progress' && (
          <button onClick={() => setShowAbandonConfirm(true)} className="abandon-button">
            Abandon Game
          </button>
        )}
        {(game.status === 'won' || game.status === 'draw') && (
          <div className="rematch-controls">
            {rematchState === 'idle' && <button onClick={requestRematch}>Play Again</button>}
            {rematchState === 'requested' && <button onClick={cancelRematch} className="cancel-button waiting">Cancel Request</button>}
            {rematchState === 'requested' && <p>Waiting for opponent...</p>}
            {rematchInfoMessage && <p className="info-message">{rematchInfoMessage}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`app-container ${game ? 'in-game' : 'in-lobby'}`}>
        {game && (<div className="game-panel">{renderGameInfo()}</div>)}
        <div className="main-content">
          {error && <p className="error-message">{error}</p>}
          {!game ? (
            <GameLobby socket={socket} />
          ) : (
            <div className="board-and-score-container">
              <Board game={game} socket={socket} />
              <Scoreboard game={game} socketId={socket.id} />
            </div>
          )}
        </div>
      </div>
      {showGameOverModal && (<GameOver game={game} socket={socket} onClose={() => setShowGameOverModal(false)} />)}
      {rematchState === 'received' && (<RematchModal onAccept={acceptRematch} onDecline={declineRematch} />)}
      {showAbandonConfirm && (<ConfirmModal title="Abandon Game?" message="Are you sure? This will count as a loss." onConfirm={handleAbandonGame} onCancel={() => setShowAbandonConfirm(false)} />)}
      {showOpponentAbandoned && (<InfoModal title="Opponent Left" message="Your opponent has abandoned the game. You win!" onOk={handleOpponentAbandonedOk} />)}
    </>
  );
}

export default App;