import React from 'react';
import './Cell.css';

const Cell = ({ value, rowIndex }) => {
  const cellClass = value ? `cell ${value}` : 'cell';
  
  // Pass the row index as a CSS variable for the animation
  const style = { '--row-index': rowIndex };

  return (
    <div className={cellClass} style={style}>
      <div className="inner-cell"></div>
    </div>
  );
};

export default Cell;