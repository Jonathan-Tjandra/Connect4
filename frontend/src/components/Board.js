import React from 'react';
import Column from './Column';
import './Board.css';

// The Indicator component for the top of each column
const Indicator = ({ isVisible, onClick }) => {
  return (
    <div className={`indicator ${isVisible ? 'visible' : ''}`} onClick={onClick}>
      <div className="triangle"></div>
    </div>
  );
};

const Board = ({ game, socket }) => {
  const handleColumnClick = (colIndex) => {
    // Check if the column is not full before making a move
    if (game.board[colIndex][5] === null) {
      socket.emit('make_move', { room_code: game.room_code, col: colIndex });
    }
  };

  if (!game || !game.board) {
    return <div>Loading Board...</div>;
  }

  const isMyTurn = game.status === 'in_progress' && game.turn === socket.id;

  return (
    <div className="board-area">
      <div className="indicators-row">
        {game.board.map((column, index) => (
          <Indicator
            key={index}
            // The triangle is visible if it's my turn AND the column isn't full
            isVisible={isMyTurn && column[5] === null}
            onClick={() => handleColumnClick(index)}
          />
        ))}
      </div>
      <div className="board">
        {game.board.map((colData, index) => (
          <Column key={index} columnData={colData} />
        ))}
      </div>
    </div>
  );
};

export default Board;