import React, { useState } from 'react';
import './GameLobby.css';

const GameLobby = ({ socket }) => {
  const [roomCode, setRoomCode] = useState('');

  const handleCreateGame = () => {
    socket.emit('create_game');
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (roomCode) {
      socket.emit('join_game', { room_code: roomCode });
    }
  };

  return (
    <div className="lobby-container">
      <h2>Four in a Line</h2>
      <button onClick={handleCreateGame} className="lobby-button create-button">
        Start New Game
      </button>
      <hr />
      <form onSubmit={handleJoinGame} className="join-form">
        <input
          type="text"
          placeholder="Enter game code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="lobby-input"
        />
        <button type="submit" className="lobby-button join-button">
          Join Game
        </button>
      </form>
    </div>
  );
};

export default GameLobby;